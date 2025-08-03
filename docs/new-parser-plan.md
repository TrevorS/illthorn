# Saxophone Parser Migration Plan

This document outlines the comprehensive migration strategy from Illthorn's custom XML parser to a saxophone-based streaming parser for improved performance and maintainability.

## Executive Summary

### Why Migrate?

**Current Issues with Custom Parser:**
- Manual character-by-character parsing is CPU intensive
- Complex cursor-based state management prone to edge case bugs
- No test coverage for core parsing logic
- Difficult to maintain and extend for new XML patterns
- Memory inefficient for large XML chunks

**Saxophone Benefits:**
- Industry-standard SAX (Simple API for XML) parsing
- Event-driven streaming architecture
- Better performance for large documents
- Lower memory footprint
- Robust handling of malformed XML
- Well-tested library with TypeScript support

### Success Metrics
- **Performance**: 30%+ improvement in parse times for large game text
- **Memory**: 20%+ reduction in parser memory usage during long sessions
- **Reliability**: Zero regressions in GameTag output compatibility
- **Maintainability**: Reduced parser code complexity by 50%+

## Current Parser Analysis

### Architecture Overview

**File Structure:**
- `src/frontend/parser/parser.ts` - Main Parser class (166 lines)
- `src/frontend/parser/tag/index.ts` - GameTag type definitions
- `src/frontend/parser/tag/attributes.ts` - Attribute parsing
- `src/frontend/parser/dom.ts` - GameTag to HTML conversion

**Current Parser API:**
```typescript
class Parser {
  static of(): Parser
  parse(text: string): GameTag[]
  reset(): void
  get isClosed(): boolean
}
```

**Usage Pattern:**
```typescript
// In FrontendSession.onMessage()
const parsed = this.parser.parse(incoming);
const { frag, metadata } = castToHTML(parsed);
```

### Implementation Details

**Parsing Flow:**
1. `prepareForParse()` - Text normalization (replace pushBold/popBold, remove \r)
2. Character-by-character iteration with cursor tracking
3. `handleTagStart()` when encountering `<`
4. `handleTextNode()` for non-tag content
5. Tag state management via pending/done arrays
6. Recursive child tag processing

**State Management:**
```typescript
pending: GameTag[]  // Open tags awaiting closure
done: GameTag[]     // Completed tags ready for output
```

**GameTag Structure:**
```typescript
type GameTag = {
  kind: TagKind;        // TEXT, METADATA, INLINE
  name: string;         // Normalized tag name
  gameName: string;     // Original game tag name
  attrs: GemstoneTagAttrs;
  children: GameTag[];
  state: TagState;      // OPEN, CLOSED
  text: string;
}
```

### Identified Limitations

1. **No Streaming Support**: Processes complete text chunks, can't handle partial XML
2. **Manual State Tracking**: Complex pending/done array management
3. **Error Handling**: Limited malformed XML recovery
4. **Performance**: O(n²) complexity for nested tags
5. **Testing**: Zero test coverage for core parsing logic
6. **Stream State Isolation**: Resets state on each parse() call, breaking multi-message streams

## Critical Discovery: Multi-Message Stream Pattern

### Stream State Persistence Issue

During implementation, we discovered a **critical limitation** of the original parser design that impacts all stream-based game content:

**The Problem**: The Wrayth protocol sends stream content across **multiple separate XML messages**, not as a single unified message:

```xml
<!-- Message 1: Stream control -->
<streamWindow id='inv' title='My Inventory' target='wear' ifClosed='' resident='true'/>
<clearStream id='inv' ifClosed=''/>
<pushStream id='inv'/>Your worn items are:

<!-- Message 2: Content (no stream tags) -->
a <a exist="610601127" noun="stickpin">diamond-set platinum stickpin</a>
a <a exist="610601128" noun="ring">faded gold ring</a>

<!-- Message 3: More content (no stream tags) -->
You are wearing a <a exist="610601127" noun="stickpin">diamond-set platinum stickpin</a>...

<!-- Message 4: Stream end -->
<popStream/>
```

**Root Cause**: Traditional parsers reset all state on each `parse()` call, so stream context is lost between messages 1 and 2. This causes:
- Content appearing in main feed instead of streams
- Duplicate inventory/speech/thoughts messages
- Stream filtering failing silently

### Stream Types Affected

All major game streams follow this multi-message pattern:
- **`inv` (inventory)** ✅ - Fixed in saxophone parser
- **`speech`** - Player/NPC dialogue
- **`thoughts`** - ESP/telepathy messages  
- **`logons`/`logoffs`** - Player login/logout notifications
- **`death`** - Death messages
- **`bounty`** - Bounty system messages

### Solution: Persistent Stream State

The saxophone parser fixes this by maintaining stream state across `parse()` calls:

```typescript
export class SaxophoneParser implements XMLParser {
  // Stream state persists across parse() calls
  private currentStream: string | null = null;
  private inStream: boolean = false;

  parse(text: string): GameTag[] {
    // Reset tag parsing state for new parse operation
    // NOTE: Do NOT reset stream state - it persists across messages
    this.tagStack.length = 0;
    this.completed.length = 0;
    // this.currentStream and this.inStream persist!
  }
}
```

## Saxophone Research

### Library Analysis

**Saxophone Characteristics:**
- **Version**: 0.8.0 (stable, but 3 years old)
- **Size**: ~15KB minified
- **Dependencies**: Zero
- **TypeScript**: Has community types available
- **Browser Support**: Modern browsers + Node.js

**API Overview:**
```typescript
import Saxophone from 'saxophone';

const parser = new Saxophone();

// Event handlers
parser.on('tagopen', (tag) => { });
parser.on('tagclose', (tag) => { });
parser.on('text', (text) => { });
parser.on('finish', () => { });

// Parsing methods
parser.parse(xml);      // Complete document
parser.write(chunk);    // Streaming chunks
parser.end();          // Finish stream
```

**Event Types:**
- `tagopen` - Opening tag with name and attributes
- `tagclose` - Closing tag with name
- `text` - Text content between tags
- `cdata` - CDATA sections
- `comment` - XML comments
- `processinginstruction` - PI nodes
- `error` - Parse errors
- `finish` - Complete document parsed

### Performance Characteristics

**Benchmarks (from saxophone README):**
- ~5,608 operations/second on typical XML
- Lower memory usage than DOM parsers
- Faster than sax-js and node-expat for most use cases

**Memory Usage:**
- No document tree built in memory
- Constant memory usage regardless of document size
- Ideal for streaming large game log files

### Compatibility Analysis

**XML Features Used by Gemstone IV:**
- ✅ **Self-closing tags**: `<progressBar id="health" value="100" />`
- ✅ **Nested tags**: `<dialogData><progressBar /></dialogData>`
- ✅ **Attributes**: `id="health"`, `value="100"`
- ✅ **Text content**: Plain text between tags
- ❌ **CDATA**: Not used by game
- ❌ **Namespaces**: Not used by game
- ❌ **Processing Instructions**: Not used by game

**Game-Specific Quirks:**
- `<pushBold/>` → `<b>` transformation (current parser handles this)
- Malformed XML occasionally sent by game server
- Mixed case tag names requiring normalization

## Migration Architecture

### Parser Abstraction Layer

**Interface Definition:**
```typescript
interface XMLParser {
  parse(text: string): GameTag[];
  reset(): void;
  readonly isClosed: boolean;
}
```

**Implementation Strategy:**
```typescript
class SaxophoneParser implements XMLParser {
  private saxophone: Saxophone;
  private tagStack: GameTag[];
  private completed: GameTag[];
  
  constructor() {
    this.saxophone = new Saxophone();
    this.setupEventHandlers();
  }
  
  parse(text: string): GameTag[] {
    // Implementation details...
  }
}
```

### Event Handling Strategy

**Tag Open Handler:**
```typescript
parser.on('tagopen', (tag) => {
  const gameTag = makeTag(normalizeTagName(tag.name), tag.name);
  gameTag.attrs = parseAttrs(tag.attrs);
  this.tagStack.push(gameTag);
});
```

**Tag Close Handler:**
```typescript
parser.on('tagclose', (tag) => {
  const currentTag = this.tagStack.pop();
  if (!currentTag) return; // Error handling
  
  currentTag.state = TagState.CLOSED;
  
  if (this.tagStack.length === 0) {
    this.completed.push(currentTag);
  } else {
    this.tagStack[this.tagStack.length - 1].children.push(currentTag);
  }
});
```

**Text Handler:**
```typescript
parser.on('text', (text) => {
  if (text.trim()) {
    const textTag = makeTag(':text');
    textTag.text = text;
    textTag.state = TagState.CLOSED;
    
    if (this.tagStack.length === 0) {
      this.completed.push(textTag);
    } else {
      this.tagStack[this.tagStack.length - 1].children.push(textTag);
    }
  }
});
```

### Backward Compatibility

**API Compatibility:**
- Maintain exact same public interface as current Parser
- Return identical GameTag structures
- Preserve all existing behavior for edge cases

**Feature Flag System:**
```typescript
enum ParserType {
  CUSTOM = 'custom',
  SAXOPHONE = 'saxophone'
}

class ParserFactory {
  static create(type: ParserType = ParserType.CUSTOM): XMLParser {
    switch (type) {
      case ParserType.SAXOPHONE:
        return new SaxophoneParser();
      case ParserType.CUSTOM:
      default:
        return new Parser();
    }
  }
}
```

## Implementation Phases

### Phase 1: Foundation & Testing (Days 1-2)

#### Day 1: Setup & Dependencies
**Morning (2-3 hours):**
- [ ] Add saxophone to package.json: `yarn add saxophone`
- [ ] Add TypeScript types: `yarn add -D @types/saxophone` (if available)
- [ ] Create parser abstraction interface in `src/frontend/parser/interface.ts`
- [ ] Set up basic SaxophoneParser stub in `src/frontend/parser/saxophone-parser.ts`

**Afternoon (3-4 hours):**
- [ ] Create comprehensive test data in `test/fixtures/game-xml/`
- [ ] Real game XML samples for different scenarios:
  - Vitals updates: `<progressBar id="health" value="85" />`
  - Spell effects: `<dialogData id="Active Spells">...</dialogData>`
  - Room descriptions with nested tags
  - Malformed XML edge cases
- [ ] Set up test harness for parser comparison

#### Day 2: Core Implementation
**Morning (3-4 hours):**
- [ ] Implement basic SaxophoneParser class structure
- [ ] Add event handler setup and tag stack management
- [ ] Implement `tagopen` and `tagclose` event handlers
- [ ] Handle text nodes and CDATA sections

**Afternoon (3-4 hours):**
- [ ] Implement text preprocessing (pushBold/popBold replacement)
- [ ] Add error handling for malformed XML
- [ ] Implement parser reset and state management
- [ ] Create initial test suite comparing outputs

### Phase 2: Feature Completion (Days 3-4)

#### Day 3: Advanced Features
**Morning (3-4 hours):**
- [ ] Implement streaming/partial XML handling
- [ ] Add support for self-closing tags
- [ ] Handle mixed case tag name normalization
- [ ] Implement attribute parsing compatibility

**Afternoon (3-4 hours):**
- [ ] Add comprehensive error recovery mechanisms
- [ ] Implement memory management for long sessions
- [ ] Add debugging hooks for parser state inspection
- [ ] Performance optimization for common patterns

#### Day 4: Integration
**Morning (3-4 hours):**
- [ ] Create ParserFactory with feature flag support
- [ ] Update FrontendSession to use factory pattern
- [ ] Add runtime parser switching capability
- [ ] Implement parser performance monitoring

**Afternoon (3-4 hours):**
- [ ] Integration testing with real session data
- [ ] Memory leak testing for extended sessions
- [ ] Cross-browser compatibility validation
- [ ] Performance benchmarking suite

### Phase 3: Testing & Validation (Days 5-6)

#### Day 5: Comprehensive Testing
**Morning (3-4 hours):**
- [ ] Parser regression test suite:
  - [ ] 100+ real game XML samples
  - [ ] Edge case handling validation
  - [ ] Malformed XML recovery testing
  - [ ] Performance benchmark comparison

**Afternoon (3-4 hours):**
- [ ] Integration with debug window (if available)
- [ ] Real-time parser comparison visualization
- [ ] Memory usage profiling
- [ ] CPU usage analysis under load

#### Day 6: Production Validation
**Morning (3-4 hours):**
- [ ] Feature flag integration testing
- [ ] Rollback mechanism validation
- [ ] Error logging and monitoring setup
- [ ] Production deployment preparation

**Afternoon (3-4 hours):**
- [ ] Final performance validation
- [ ] Documentation updates
- [ ] Code review preparation
- [ ] Release planning

### Phase 4: Deployment (Day 7)

#### Morning (2-3 hours):
- [ ] Gradual rollout plan implementation
- [ ] Monitor parser errors and performance
- [ ] User acceptance testing

#### Afternoon (2-3 hours):
- [ ] Full deployment if validation successful
- [ ] Legacy parser removal (if stable)
- [ ] Documentation finalization

## Testing Strategy

### Unit Testing Framework

**Test Structure:**
```
test/
├── parser/
│   ├── saxophone-parser.spec.ts
│   ├── parser-compatibility.spec.ts
│   └── parser-performance.spec.ts
├── fixtures/
│   └── game-xml/
│       ├── vitals-samples.xml
│       ├── spell-effects.xml
│       ├── room-descriptions.xml
│       └── malformed-samples.xml
└── integration/
    └── parser-session-integration.spec.ts
```

**Test Categories:**

1. **Compatibility Tests:**
   ```typescript
   describe('SaxophoneParser Compatibility', () => {
     test('produces identical GameTag output for vitals', () => {
       const customResult = customParser.parse(vitalsXML);
       const saxophoneResult = saxophoneParser.parse(vitalsXML);
       expect(saxophoneResult).toEqual(customResult);
     });
   });
   ```

2. **Performance Tests:**
   ```typescript
   describe('Parser Performance', () => {
     test('saxophone parser is faster than custom parser', () => {
       const largeXML = generateLargeGameXML(10000); // 10KB of game XML
       
       const customStart = performance.now();
       customParser.parse(largeXML);
       const customTime = performance.now() - customStart;
       
       const saxophoneStart = performance.now();
       saxophoneParser.parse(largeXML);
       const saxophoneTime = performance.now() - saxophoneStart;
       
       expect(saxophoneTime).toBeLessThan(customTime);
     });
   });
   ```

3. **Regression Tests:**
   - Test all existing GameTag patterns used by components
   - Verify metadata event generation remains identical
   - Validate DOM conversion compatibility

### Real Game Data Testing

**Data Collection Strategy:**
1. **Capture live game sessions** with debug logging enabled
2. **Extract XML patterns** for different game scenarios:
   - Combat with multiple spell effects
   - Room navigation with complex descriptions
   - Shopping with inventory updates
   - Social interactions with streams
   - **Multi-message stream sequences** for all stream types

**Stream Testing Priority:**
- ✅ **Inventory streams** - Fixed and tested
- ⚠️ **Speech streams** - Needs testing with say/tell commands
- ⚠️ **Thought streams** - Needs ESP/psinet testing
- ⚠️ **Death streams** - Needs combat scenario testing
- ⚠️ **Logon/logoff streams** - Needs player movement testing

**Test Data Management:**
```typescript
// test/fixtures/game-xml/index.ts
export const TestData = {
  vitals: {
    healthUpdate: '<progressBar id="health" value="85" />',
    manaUpdate: '<progressBar id="mana" value="92" />',
    // ... more samples
  },
  spells: {
    activeSpells: `<dialogData id="Active Spells">
      <progressBar id="spell1" text="Bless" time="120" value="80" />
    </dialogData>`,
    // ... more samples
  }
};
```

### Performance Benchmarking

**Benchmark Categories:**
1. **Parse Speed**: Operations per second for various XML sizes
2. **Memory Usage**: Peak memory consumption during parsing
3. **Throughput**: Sustained parsing rate for streaming data
4. **Latency**: Time from XML input to GameTag output

**Benchmark Implementation:**
```typescript
class ParserBenchmark {
  async runPerformanceTests() {
    const results = {
      parseSpeed: await this.benchmarkParseSpeed(),
      memoryUsage: await this.benchmarkMemoryUsage(),
      throughput: await this.benchmarkThroughput(),
      latency: await this.benchmarkLatency()
    };
    return results;
  }
}
```

## Risk Assessment & Mitigation

### High-Risk Areas

#### 1. Breaking Changes in GameTag Output
**Risk**: Saxophone parser produces different GameTag structures
**Impact**: Components fail to render correctly, metadata events lost
**Mitigation**:
- Comprehensive compatibility test suite
- Side-by-side parser comparison in tests
- Feature flag for instant rollback

#### 2. Multi-Message Stream Handling
**Risk**: Stream state not properly maintained across parse() calls
**Impact**: Duplicate content in main feed, streams not collected properly
**Mitigation**:
- Test all stream types (inv, speech, thoughts, logons, deaths)
- Debug logging to trace stream state across messages
- Comprehensive stream integration testing

#### 3. Performance Regression
**Risk**: Saxophone proves slower than custom parser for game XML
**Impact**: UI becomes sluggish during heavy game activity
**Mitigation**:
- Performance benchmarking before deployment
- Real-world testing with large game sessions
- Rollback plan if performance degrades

#### 4. Malformed XML Handling
**Risk**: Saxophone is stricter and fails on game server XML quirks
**Impact**: Parser errors cause session disconnections
**Mitigation**:
- Extensive malformed XML testing
- Error recovery mechanisms
- Fallback to custom parser on saxophone failures

#### 5. Memory Leaks
**Risk**: Event handler cleanup issues in saxophone integration
**Impact**: Memory usage grows during long sessions
**Mitigation**:
- Memory profiling during testing
- Proper cleanup in parser reset methods
- Automated memory leak detection tests

### Medium-Risk Areas

#### 1. Integration Complexity
**Risk**: Saxophone API doesn't map cleanly to current parser interface
**Impact**: Requires significant refactoring beyond parser module
**Mitigation**:
- Maintain exact API compatibility
- Adapter pattern if needed
- Incremental integration approach

#### 2. Dependencies
**Risk**: Saxophone library becomes unmaintained or has security issues
**Impact**: Long-term maintenance burden
**Mitigation**:
- Evaluate alternative SAX parsers (sax, fast-xml-parser)
- Keep custom parser as fallback
- Plan for eventual in-house SAX implementation if needed

### Rollback Strategy

**Feature Flag Implementation:**
```typescript
// In settings or environment config
const PARSER_TYPE = process.env.PARSER_TYPE || 'custom';

// In session initialization
const parser = ParserFactory.create(
  PARSER_TYPE === 'saxophone' ? ParserType.SAXOPHONE : ParserType.CUSTOM
);
```

**Automated Rollback Triggers:**
- Parse error rate > 1% over 5 minutes
- Memory usage increases > 50% from baseline
- Parse time increases > 100% from baseline
- Component rendering failures detected

**Manual Rollback Process:**
1. Set environment variable `PARSER_TYPE=custom`
2. Restart application (or hot-reload if supported)
3. Verify parsing returns to normal
4. Investigate saxophone issues offline

## Performance Expectations

### Baseline Measurements (Current Parser)

**Typical Game XML Samples:**
- **Vitals update**: ~50 characters, ~0.1ms parse time
- **Room description**: ~500 characters, ~0.5ms parse time
- **Spell list**: ~1000 characters, ~1ms parse time
- **Large combat**: ~5000 characters, ~5ms parse time

**Memory Usage:**
- Parser instance: ~1KB baseline
- Pending tag stack: ~100 bytes per nested level
- GameTag objects: ~200 bytes per tag

### Target Improvements

**Parse Speed Goals:**
- 30%+ improvement for large XML chunks (>1KB)
- Maintain current speed for small updates (<100 chars)
- Better scaling for deeply nested XML

**Memory Goals:**
- 20%+ reduction in peak memory usage
- Constant memory usage regardless of XML size
- Faster garbage collection of parsed objects

**Reliability Goals:**
- Zero GameTag compatibility regressions
- Better error recovery for malformed XML
- More predictable performance characteristics

### Monitoring Strategy

**Runtime Metrics:**
```typescript
interface ParserMetrics {
  parseCount: number;
  totalParseTime: number;
  averageParseTime: number;
  peakMemoryUsage: number;
  errorCount: number;
  errorRate: number;
}
```

**Performance Alerts:**
- Parse time > 10ms for any single operation
- Error rate > 0.1% over 10 minutes
- Memory usage growth > 10MB per hour

## Integration with Debug Window

### Parser Inspector Enhancement

**Real-time Parser Comparison:**
```typescript
class ParserInspector extends LitElement {
  @state() private parseComparison = {
    input: '',
    customOutput: [],
    saxophoneOutput: [],
    differences: []
  };
  
  async compareParserOutputs(xml: string) {
    const custom = this.customParser.parse(xml);
    const saxophone = this.saxophoneParser.parse(xml);
    
    this.parseComparison = {
      input: xml,
      customOutput: custom,
      saxophoneOutput: saxophone,
      differences: this.findDifferences(custom, saxophone)
    };
  }
}
```

**Performance Visualization:**
- Side-by-side parse time comparisons
- Memory usage graphs over time
- Error rate monitoring dashboard
- GameTag structure diff viewer

### Development Tools

**Parser Switching UI:**
```html
<sl-switch 
  ?checked=${this.useSaxophone}
  @sl-change=${this.toggleParser}>
  Use Saxophone Parser
</sl-switch>
```

**Debug Output Enhancement:**
- Raw XML input display
- Parsed GameTag tree visualization
- Performance metrics display
- Error logging with context

## File Impact Analysis

### New Files to Create

```
src/frontend/parser/
├── interface.ts                    # Parser abstraction interface
├── saxophone-parser.ts             # Saxophone implementation
├── parser-factory.ts               # Factory with feature flags
└── types/
    └── saxophone.d.ts              # Type definitions if needed

test/parser/
├── saxophone-parser.spec.ts        # Unit tests
├── parser-compatibility.spec.ts    # Compatibility tests
├── parser-performance.spec.ts      # Performance benchmarks
└── fixtures/
    └── game-xml/                   # Real game XML samples
        ├── vitals.xml
        ├── spells.xml
        ├── rooms.xml
        └── malformed.xml
```

### Files to Modify

**Core Parser Integration:**
- `src/frontend/session/index.ts` - Update parser instantiation
- `package.json` - Add saxophone dependency

**Configuration:**
- `src/frontend/settings/` - Add parser type setting
- Environment configuration files

**Testing:**
- Update existing integration tests to use factory pattern
- Add performance monitoring to existing test suites

**Documentation:**
- `CLAUDE.md` - Update parser architecture description
- `docs/data-flow.md` - Reflect new parser implementation

### Files NOT to Modify

**Preserve Unchanged:**
- `src/frontend/parser/tag/` - GameTag structure remains identical
- `src/frontend/parser/dom.ts` - DOM conversion stays the same
- All component files using GameTag - No changes needed
- `src/frontend/session/helpers.ts` - Bus integration unchanged

## Migration Checklist

### Pre-Migration Validation
- [ ] Current parser has comprehensive test coverage
- [ ] All GameTag usage patterns documented
- [ ] Performance baseline established
- [ ] Real game XML samples collected

### Implementation Phase
- [ ] Saxophone parser implements exact same API
- [ ] All tests pass with both parsers
- [ ] Performance meets or exceeds expectations
- [ ] Memory usage is improved
- [ ] Error handling is robust

### Deployment Phase
- [ ] Feature flag system working
- [ ] Rollback procedure tested
- [ ] Monitoring dashboards configured
- [ ] Performance alerts configured

### Post-Migration
- [ ] Monitor error rates and performance for 1 week
- [ ] Collect user feedback on parsing reliability
- [ ] Document any edge cases discovered
- [ ] Plan removal of legacy parser after 30 days of stability

## Conclusion

This migration represents a significant improvement to Illthorn's XML parsing infrastructure. By moving to saxophone, we gain:

1. **Better Performance**: Industry-standard SAX parsing optimized for streaming
2. **Improved Reliability**: Robust XML handling with better error recovery
3. **Lower Memory Usage**: Constant memory usage regardless of document size
4. **Maintainability**: Well-tested library with clear API
5. **Future-Proofing**: Modern foundation for enhanced parsing features

The phased approach with comprehensive testing and feature flags ensures a safe migration path with minimal risk to user experience. The investment in robust testing infrastructure will pay dividends for future parser enhancements and game protocol updates.

**Timeline**: 7 days for complete migration
**Risk Level**: Medium (mitigated by testing and rollback capabilities)
**Expected Benefits**: 30%+ performance improvement, 20%+ memory reduction
**Success Criteria**: Zero compatibility regressions, improved performance metrics