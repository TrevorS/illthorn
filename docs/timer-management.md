# Timer Management System Enhancement Plan

## Problem Statement & Success Criteria

### What Feels Broken Today
- Prompt flips to "R>"/"C>" long before/after the red-or-blue bar animates
- "Active Spells" list is static; user must mentally track remaining time  
- Reconnecting mid-hunt leaves stale bars & spell rows

### Success Signal
- Prompt glyph and bar start/stop within ±100ms of each other on a stable 60 FPS display
- Each spell row counts down once per second and fades out <200ms after expiration
- All timers are reconstructed from the first full state block received after reconnect

## Current Implementation Status ✅

**MAJOR DISCOVERY**: The core timer infrastructure already exists and is working:

### Already Implemented & Working
- ✅ **XML Parser**: Handles `roundTime`, `castTime`, `progressBar`, and `prompt` tags correctly
- ✅ **Event System**: Dispatches `metadata/roundTime`, `metadata/castTime`, `metadata/progressBar/*` events
- ✅ **CLI Component**: Subscribes to timer events and animates RT/CT progress bars with CSS transitions
- ✅ **Effects Component**: Processes `progressBar` tags and renders spell effect rows with percentages
- ✅ **Prompt Component**: Extracts timestamps from prompt tags (though not fully utilized)

### What Needs Enhancement
- ❌ **Coordination**: RT bars and prompt glyphs aren't synchronized (timing mismatch)
- ❌ **Countdown Timers**: Spell effects show static time strings, no live countdown
- ❌ **Centralized Management**: Each component manages timers independently (drift issues)
- ❌ **Reconnection**: No timer state reconstruction after socket reconnect
- ❌ **Type Safety**: Timer tags processed generically without specific TypeScript interfaces

## XML Protocol Research Deep-Dive

### Confirmed Wrayth/StormFront XML Tags

| Tag | Example from Live Capture | Key Attributes | Notes |
|-----|---------------------------|----------------|-------|
| `<prompt>` | `<prompt time="1134928732">R&gt;</prompt>` | `time` (epoch s) | Carries canonical timestamp and state glyph |
| `<progressBar>` | `<progressBar id="spell1" text="Spirit Warding I" time="120" value="80"/>` | `time` total sec, `value` % | Nested inside `<dialogData id="Active Spells">` |
| `<roundTime>` | `<roundTime time="1711972115" value="6"/>` | `time` start epoch, `value` seconds | Not documented on GSWiki; confirmed via packet log |
| `<castTime>` | `<castTime time="1711972115" value="3"/>` | same | Always fires immediately after `<roundTime>` for spells |

**Critical Gap:** The official wiki omits `<roundTime>`/`<castTime>`, so parsers relying solely on documented tags will miss them. We therefore treat prompt glyphs as a fallback signal rather than the primary source.

### Atomicity & Ordering Guarantees (Observed)
- `<roundTime>`/`<castTime>` tags usually arrive in the same TCP packet as the prompt containing the initial "R>"/"C>" glyph
- For hard RT that is not spell-initiated (e.g., swinging a weapon), the server often sends `<roundTime>` one prompt after the glyph flip (needs debouncing)
- Spell rows are pushed before RT—the `<dialogData>` block arrives ~50ms earlier, giving us an early TTL for the timer

### TypeScript Interfaces
```typescript
export interface PromptTag { 
  glyph: '>' | 'R>' | 'C>'; 
  epoch: number; 
}

export interface TimerTag { 
  kind: 'round' | 'cast'; 
  seconds: number; 
  epoch: number; 
}

export interface ProgressBarTag { 
  id: string; 
  label: string; 
  seconds: number; 
  percent: number; 
}
```

## Current vs Target Architecture

### Current Architecture (Working)
```
 ┌─────────┐    XML stream     ┌────────────┐      Events       ┌──────────────┐
 │ Socket  │ ───────────────▶ │ Parser     │ ───────────────▶ │ Session Bus  │
 └─────────┘   (text)         │ (working!) │  metadata/*      │ (custom DOM) │
                               └────────────┘                  └──────┬───────┘
                                                                      │
           ┌─────────────────────────────────────────────────────────┼─────────────┐
           │                                                         ▼             │
           │  ┌─────────────┐       ┌──────────────┐       ┌─────────────────┐    │
           │  │ CLI         │       │ Effects      │       │ Prompt          │    │
           │  │ Component   │       │ Component    │       │ Component       │    │
           │  │ • RT bars ✅│       │ • Spell rows ✅│       │ • Timestamps ⚠️│    │
           │  │ • Animations│       │ • Static %   │       │ • Not utilized  │    │
           │  └─────────────┘       └──────────────┘       └─────────────────┘    │
           │                                                                       │
           └─ Each component manages timers independently (causes drift) ──────────┘
```

### Target Architecture (Enhanced)
```
 ┌─────────┐    XML stream     ┌────────────┐      Events       ┌──────────────┐
 │ Socket  │ ───────────────▶ │ Parser     │ ───────────────▶ │ Session Bus  │
 └─────────┘   (text)         │ (enhanced) │  Typed Events    │ (same)       │
                               └────────────┘                  └──────┬───────┘
                                                                      │
           ┌─────────────────────────────────────────────────────────┼─────────────┐
           │                                                         ▼             │
           │                          ┌──────────────┐                             │
           │                          │RTCoordinator │ ◄─── NEW                    │
           │                          │• Sync prompt │                             │
           │                          │• Sync bars   │                             │
           │                          └──────┬───────┘                             │
           │                                 ▼                                     │
           │                          ┌──────────────┐                             │
           │                          │TimerManager  │ ◄─── NEW                    │
           │                          │• Single tick │                             │
           │                          │• Drift-free  │                             │
           │                          └──────┬───────┘                             │
           │                                 ▼                                     │
           │  ┌─────────────┐       ┌──────────────┐       ┌─────────────────┐    │
           │  │ CLI         │       │ Effects      │       │ Prompt          │    │
           │  │ Component   │       │ Component    │       │ Component       │    │
           │  │ • Sync bars │       │ • Live count │       │ • Coordination  │    │
           │  │ • Same anims│       │ • Auto expire│       │ • Time awareness│    │
           │  └─────────────┘       └──────────────┘       └─────────────────┘    │
           │                                                                       │
           └─ Centralized coordination prevents drift ────────────────────────────┘
```

**Key Changes:**
- **RTCoordinator** — NEW: Coordinates prompt glyphs with timer events for perfect sync
- **TimerManager** — NEW: Single setInterval drives all countdown timers (no drift)
- **Enhanced Parser** — Better TypeScript types for timer tags (optional improvement)
- **Components** — Same components, enhanced with live countdown capabilities

## Detailed Implementation Design

### RTCoordinator Implementation
```typescript
class RTCoordinator {
  state: 'idle' | 'round' | 'cast' = 'idle';
  private lastEpoch = 0;

  onPrompt(tag: PromptTag) {
    if (tag.epoch < this.lastEpoch) return; // Ignore out‑of‑order
    this.lastEpoch = tag.epoch;
    this.state = glyphToState(tag.glyph);
    bus.emit('RTStateChanged', this.state);
  }

  onTimer(tag: TimerTag) {
    this.state = tag.kind === 'round' ? 'round' : 'cast';
    bus.emit('RTStarted', tag);
  }
}
```

**Conflict Resolution:** Whichever event has the newer epoch wins when glyph and timer disagree.

**Fallback Path:** If we never receive a `<roundTime>` tag, infer duration by observing the delta between consecutive prompts.

### TimerManager Implementation
- Maintains a `Map<string, Countdown>` keyed by stable timer ID (spellId, rt, ct)
- Uses single `setInterval` at 1 Hz; calculates remaining seconds using `perf.now() – startEpoch` to keep drift ≤30 ms
- Emits tick events so UI can update via reactive props without allocating new intervals per timer

```typescript
// src/frontend/session/timer-manager.ts
export class TimerManager {
  private timers: Map<string, CountdownTimer> = new Map();
  private intervalId: NodeJS.Timeout | null = null;

  startTimer(id: string, initialSeconds: number, callback: (remaining: number) => void) {
    const timer = new CountdownTimer(id, initialSeconds, callback);
    this.timers.set(id, timer);
    
    if (!this.intervalId) {
      this.intervalId = setInterval(() => this.tick(), 1000);
    }
  }

  private tick() {
    const now = performance.now();
    for (const [id, timer] of this.timers) {
      const remaining = timer.getRemainingSeconds(now);
      if (remaining <= 0) {
        timer.callback(0);
        this.timers.delete(id);
      } else {
        timer.callback(remaining);
      }
    }
    
    if (this.timers.size === 0 && this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
```

### SpellEffect Component Enhancements
- Parses `mm:ss` or `hh:mm:ss` → seconds once
- Binds to TimerManager on `connectedCallback` and unsubscribes on `disconnectedCallback`
- Adds CSS transition for smooth width shrink (avoids repaints every second)
- On expiration: dispatches `spellExpired` so parent container can remove/fade

### Reconnection Flow
1. WebSocket "open" ⇒ request a `#timers` snapshot command
2. Server responds with full `<dialogData>` + new `<roundTime>` tag
3. TimerManager clears all local countdowns, repopulates from snapshot

## Implementation Roadmap

### Phase 1: Core Timer Infrastructure (NEW)
1. **`src/frontend/session/timer-manager.ts`** - NEW: Centralized timer system with single setInterval
2. **`src/frontend/session/rt-coordinator.ts`** - NEW: RT/prompt coordination and conflict resolution  
3. **`src/frontend/session/countdown-timer.ts`** - NEW: Individual timer class with drift management

### Phase 2: Component Enhancements (MODIFY EXISTING)
1. **`src/frontend/components/session/cli.lit.ts`** 
   - ✅ Already has timer subscriptions and animations
   - ➕ Integrate with RTCoordinator for better sync
   
2. **`src/frontend/components/session/effects/spell-effect.lit.ts`**
   - ✅ Already renders spell rows with percentages
   - ➕ Add live countdown with TimerManager integration
   
3. **`src/frontend/components/session/effects/effects-container.lit.ts`**
   - ✅ Already processes progressBar metadata (migrated to container/presentational pattern)
   - ➕ Initialize timers and handle expiration events
   
4. **`src/frontend/components/session/prompt.lit.ts`**
   - ✅ Already extracts timestamps from prompts
   - ➕ Feed timing data to RTCoordinator

### Phase 3: Optional Parser Improvements (TYPE SAFETY)
1. **`src/frontend/parser/tag/names.ts`** - Add explicit timer tag types
2. **`src/frontend/parser/tag/index.ts`** - Add timer-specific interfaces  
3. **`src/frontend/parser/parser.ts`** - Already handles all timer tags correctly!

### Phase 4: Integration & Testing
1. **`src/frontend/session/index.ts`** - Wire up coordination components
2. **Debug logging** - Add timer-specific debug namespaces
3. **Reconnection handling** - Timer state reconstruction

## Component Enhancement Details

### CLI Component Integration (Build on Existing)
**Current State:** Already subscribes to `metadata/roundTime` and `metadata/castTime`, animates progress bars
```typescript
// EXISTING CODE in cli.lit.ts:176-216 (working!)
this.session.bus.subscribeEvent<GameTag>("metadata/roundTime", ({ detail: tag }) => {
  const value = parseInt(tag.attrs.value as string, 10) || 0;
  const duration = parseFloat(tag.attrs.time as string) || 0;
  // ... animates progress bars with CSS
});
```

**Enhancement:** Add RTCoordinator integration for better sync
```typescript
// NEW: Add to cli.lit.ts
connectedCallback() {
  super.connectedCallback();
  this._subscribeToTimerEvents(); // existing
  
  // NEW: Add coordination
  this.rtCoordinator = new RTCoordinator(this.session.bus);
  this.rtCoordinator.onStateChanged((state) => {
    this._syncProgressBarsWithPrompt(state);
  });
}
```

### SpellEffect Component Integration (Build on Existing)
**Current State:** Already renders spell names and static time strings with percentage styling
```typescript
// EXISTING CODE in spell-effect.lit.ts (working!)
@property({ type: String }) timeRemaining = "";
@property({ type: Number }) percent = 0;
// ... renders spell name and time with color coding
```

**Enhancement:** Add live countdown capability
```typescript
// NEW: Add to spell-effect.lit.ts
connectedCallback() {
  super.connectedCallback();
  
  // NEW: Start countdown timer
  if (this.timeRemaining && this.spellId) {
    const initialSeconds = this._parseTimeToSeconds(this.timeRemaining);
    TimerManager.instance.startTimer(this.spellId, initialSeconds, (remaining) => {
      this.timeRemaining = this._formatTime(remaining);
      this.percent = (remaining / initialSeconds) * 100;
      this.requestUpdate();
    });
  }
}
```

### Parser Status (Already Complete!)
**Discovery:** Parser already handles all timer tags correctly! No parser changes needed.
```typescript
// EXISTING CODE in parser.ts (working!)
parseTag(tagInfo: string) {
  // Already processes roundTime, castTime, progressBar, prompt tags
  // Already extracts attributes correctly
  // Already dispatches metadata events
}
```

**Optional Enhancement:** Add explicit TypeScript types for better IDE support
```typescript
// OPTIONAL: Add to parser/tag/names.ts
export type TimerTagName = "roundTime" | "castTime" | "progressBar" | "prompt";
export type TagName = InlineTagName | MetadataTagName | TimerTagName;
```

## Debug & Investigation Tools

### Enable Debug Logging
```javascript
// Browser console commands for debugging
localStorage.setItem('debug', 'illthorn:metadata,illthorn:effects,illthorn:bus');

// Monitor specific timer events
window.addEventListener('rt-state-changed', (e) => console.log('RT State:', e.detail));
window.addEventListener('timer-tick', (e) => console.log('Timer Tick:', e.detail));
```

### XML Capture Utility
```typescript
// Add to session/index.ts for capturing raw XML
onMessage(message: string) {
  if (message.includes('<roundTime') || message.includes('<castTime')) {
    console.log('TIMER XML CAPTURED:', message);
  }
  
  // existing message processing...
}
```