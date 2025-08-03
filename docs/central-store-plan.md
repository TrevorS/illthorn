# Centralized Game State Architecture Plan

## Executive Summary

This document outlines the implementation of a centralized game state architecture for Illthorn, designed to solve critical HMR (Hot Module Replacement) issues while improving code maintainability, debugging capabilities, and performance.

### Problem Statement

**Current Issues:**
- **HMR State Loss**: Components lose all state during development, causing UI "blinks" and disconnections
- **Scattered State**: 20+ `@state()` properties distributed across components make debugging difficult
- **Tight Coupling**: Components directly manage state and subscribe to bus events
- **No Single Source of Truth**: Game state is fragmented across many component instances
- **Poor Debugging**: No way to inspect or replay complete game state

**Root Cause**: Component-level state management using Lit's `@state()` decorators that reset during HMR.

### Solution Overview

**Event-Driven Centralized State Store**: Replace component-level state with a centralized, immutable event store that survives HMR and enables powerful debugging capabilities.

```
Current:  Game XML → Parser → Bus Events → Component @state() → UI
Proposed: Game XML → Parser → Event Store → State Derivation → Component Props → UI
```

## Core Architecture Design

### 1. TypeScript Schema Definition

#### Root Game State Interface

```typescript
/**
 * Root game state interface - single source of truth for entire game session
 * All UI state is derived from this centralized store
 */
export interface GameState {
  /** Character-specific data (vitals, injuries, effects) */
  character: CharacterState;
  
  /** Current environment and location information */
  environment: EnvironmentState;
  
  /** Communication streams (speech, thoughts, logons, etc.) */
  streams: StreamState;
  
  /** UI preferences and layout configuration */
  ui: UIState;
  
  /** Session connection and status information */
  session: SessionState;
  
  /** Metadata about state updates and versioning */
  meta: StateMetadata;
}

/**
 * Metadata for state management and debugging
 */
export interface StateMetadata {
  /** Version number for state migration compatibility */
  version: string;
  
  /** Timestamp of last state update */
  lastUpdated: Date;
  
  /** Session identifier for this state instance */
  sessionId: string;
  
  /** Development mode debugging information */
  debug?: {
    eventCount: number;
    memoryUsage: number;
    lastEventSequence: number;
  };
}
```

#### Character State Schema

```typescript
/**
 * Character-specific game state including vitals, status effects, and equipment
 */
export interface CharacterState {
  /** Core character vitals (health, mana, etc.) */
  vitals: VitalsState;
  
  /** Character injuries with anatomical positioning */
  injuries: InjuriesState;
  
  /** Active spell effects and magical conditions */
  effects: EffectsState;
  
  /** Equipment and inventory state */
  equipment: EquipmentState;
  
  /** Character identification and basic info */
  identity: CharacterIdentity;
}

/**
 * Character vitals state matching existing VitalData interface
 * Maintains backward compatibility with current components
 */
export interface VitalsState {
  health: VitalData;
  mana: VitalData;
  stamina: VitalData;
  spirit: VitalData;
  mind: VitalData;
  stance: VitalData;
  encumbrance: VitalData;
}

/**
 * Individual vital statistics data
 * Compatible with existing VitalData interface in vitals-container.lit.ts
 */
export interface VitalData {
  /** Human-readable label for this vital */
  label: string;
  
  /** Current value as string (undefined = indeterminate state) */
  value?: string;
  
  /** Percentage value for progress bars (0-100) */
  percent?: number;
  
  /** Full text representation from game */
  text?: string;
  
  /** Timestamp of last update for staleness detection */
  lastUpdated?: Date;
  
  /** Visual state for UI rendering */
  state?: 'normal' | 'warning' | 'critical' | 'indeterminate';
}

/**
 * Injury state with anatomical positioning and pairing logic
 * Matches existing injury processing in injuries-container.lit.ts
 */
export interface InjuriesState {
  /** Raw injury data directly from game XML */
  raw: Array<RawInjury>;
  
  /** Processed injuries with left/right pairing and ordering */
  processed: Array<ProcessedInjury>;
  
  /** Anatomical ordering configuration (head-to-toe) */
  anatomicalOrder: Array<string>;
  
  /** Display configuration and mappings */
  display: {
    bodyPartNames: Map<string, string>;
    severityColors: Map<number, string>;
    enablePairing: boolean;
  };
}

/**
 * Raw injury data as received from game
 */
export interface RawInjury {
  /** Body part identifier (e.g., "rightArm", "head") */
  part: string;
  
  /** Injury severity level */
  severity: 0 | 1 | 2 | 3;
  
  /** Full injury description from game */
  description: string;
  
  /** Timestamp when injury was recorded */
  timestamp: Date;
}

/**
 * Processed injury with pairing and display logic applied
 */
export interface ProcessedInjury {
  /** Display name for UI (e.g., "r.arm", "head") */
  displayName: string;
  
  /** Current severity level */
  severity: 0 | 1 | 2 | 3;
  
  /** Whether this represents paired limbs */
  paired: boolean;
  
  /** Left limb severity (for paired injuries) */
  leftSeverity?: 0 | 1 | 2 | 3;
  
  /** Right limb severity (for paired injuries) */
  rightSeverity?: 0 | 1 | 2 | 3;
  
  /** Anatomical ordering index for head-to-toe display */
  anatomicalOrder: number;
  
  /** Last update timestamp */
  lastUpdated: Date;
}

/**
 * Active spell effects and magical conditions
 * Compatible with existing SpellEffectData in effects-ui.lit.ts
 */
export interface EffectsState {
  /** Currently active spell effects */
  active: Array<SpellEffectData>;
  
  /** Recently expired effects (for transition animations) */
  expired: Array<SpellEffectData>;
  
  /** Active countdown timers for effect durations */
  timers: Map<string, EffectTimer>;
  
  /** Configuration for effect display and processing */
  config: {
    maxExpiredRetention: number; // How long to keep expired effects
    enableTimers: boolean;
    sortBy: 'duration' | 'name' | 'severity';
  };
}

/**
 * Spell effect data compatible with existing interface
 */
export interface SpellEffectData {
  /** Unique effect identifier */
  id: string;
  
  /** Display name for the effect */
  text: string;
  
  /** Time remaining as formatted string */
  time: string;
  
  /** Percentage value as string */
  value: string;
  
  /** Total duration in seconds (calculated) */
  duration?: number;
  
  /** Calculated expiration timestamp */
  expiresAt?: Date;
  
  /** Effect category for grouping */
  category?: 'offensive' | 'defensive' | 'utility' | 'other';
}

/**
 * Timer state for tracking effect countdowns
 */
export interface EffectTimer {
  /** Effect ID this timer is tracking */
  effectId: string;
  
  /** Timer start timestamp */
  startTime: Date;
  
  /** Duration in seconds */
  duration: number;
  
  /** Whether timer is currently active */
  active: boolean;
  
  /** Callback for when timer expires */
  onExpire?: () => void;
}

/**
 * Equipment and inventory state
 */
export interface EquipmentState {
  /** Character's hands and held items */
  hands: HandsState;
  
  /** Future: worn equipment, containers, etc. */
  // worn: Array<WornItem>;
  // containers: Map<string, Container>;
}

/**
 * Character hands state matching existing HandData interface
 */
export interface HandsState {
  /** Left hand contents */
  left: HandData | null;
  
  /** Right hand contents */
  right: HandData | null;
  
  /** Currently prepared spell */
  spell: string | null;
  
  /** Timestamp of last hands update */
  lastUpdated?: Date;
}

/**
 * Individual hand data (matches existing interface)
 */
export interface HandData {
  /** Item or spell name */
  name: string;
  
  /** Item identifier if applicable */
  id?: string;
  
  /** Item type classification */
  type?: 'weapon' | 'shield' | 'spell' | 'other';
}

/**
 * Character identity and basic information
 */
export interface CharacterIdentity {
  /** Character name */
  name: string;
  
  /** Character race */
  race?: string;
  
  /** Character profession */
  profession?: string;
  
  /** Character level */
  level?: number;
  
  /** Game session identifier */
  sessionId: string;
}
```

#### Environment State Schema

```typescript
/**
 * Environment and location state
 */
export interface EnvironmentState {
  /** Current room information */
  room: RoomState;
  
  /** Compass and navigation data */
  compass: CompassState;
  
  /** Weather and environmental conditions */
  conditions?: EnvironmentalConditions;
}

/**
 * Current room state and information
 */
export interface RoomState {
  /** Game-assigned room identifier */
  id?: string;
  
  /** Room title/name */
  title: string;
  
  /** Room description text */
  description: string;
  
  /** Available exits from this room */
  exits: Array<ExitData>;
  
  /** Climate information */
  climate?: string;
  
  /** Terrain type */
  terrain?: string;
  
  /** Timestamp of last room update */
  lastUpdated?: Date;
  
  /** Room tags and classifications */
  tags?: Array<string>;
}

/**
 * Exit information for navigation
 */
export interface ExitData {
  /** Direction name (e.g., "north", "out", "up") */
  direction: string;
  
  /** Destination room name if known */
  destination?: string;
  
  /** Whether this is a hidden/secret exit */
  hidden?: boolean;
  
  /** Exit type classification */
  type?: 'standard' | 'portal' | 'special';
}

/**
 * Compass state and navigation information
 */
export interface CompassState {
  /** Available directions */
  directions: Array<DirectionData>;
  
  /** Whether compass is visible in UI */
  visible: boolean;
  
  /** Timestamp of last compass update */
  lastUpdated?: Date;
  
  /** Compass configuration */
  config: {
    showHidden: boolean;
    highlightExits: boolean;
    enableClickToMove: boolean;
  };
}

/**
 * Direction data for compass display
 */
export interface DirectionData {
  /** Direction name */
  direction: string;
  
  /** Whether this direction is available */
  available: boolean;
  
  /** Whether this is a hidden direction */
  hidden?: boolean;
  
  /** Visual indicator type */
  indicator?: 'standard' | 'special' | 'blocked';
}

/**
 * Environmental conditions (future extension)
 */
export interface EnvironmentalConditions {
  /** Weather conditions */
  weather?: string;
  
  /** Temperature */
  temperature?: string;
  
  /** Time of day */
  timeOfDay?: 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night';
}
```

#### Game Log Event Store Schema

```typescript
/**
 * Game log store - the heart of the event-driven architecture
 * This is an append-only immutable event stream that serves as the canonical record
 */
export interface GameLogStore {
  /** Append-only array of all game events */
  events: Array<GameLogEvent>;
  
  /** Current display and filtering configuration */
  display: GameLogDisplayState;
  
  /** Memory management and retention policies */
  retention: GameLogRetentionConfig;
  
  /** Performance optimization caches */
  cache: GameLogCache;
}

/**
 * Individual game log event - immutable once created
 */
export interface GameLogEvent {
  /** Unique event identifier */
  id: string;
  
  /** Event creation timestamp */
  timestamp: Date;
  
  /** Global sequence number for ordering */
  sequence: number;
  
  /** Event classification */
  type: GameLogEventType;
  
  /** Event source identifier */
  source: GameLogEventSource;
  
  /** Structured content from saxophone parser */
  content: GameTag[];
  
  /** Stream context if this event belongs to a stream */
  streamId?: string;
  
  /** Session context */
  sessionId: string;
  
  /** Cached rendering for performance (optional) */
  rendered?: GameLogEventCache;
  
  /** Event metadata */
  meta: GameLogEventMeta;
}

/**
 * Event type classification
 */
export type GameLogEventType = 
  | 'incoming'  // Incoming game data
  | 'outgoing'  // Player commands sent to game
  | 'system'    // System messages and notifications
  | 'error'     // Error conditions and warnings
  | 'ui'        // UI-generated events
  | 'debug';    // Development and debugging events

/**
 * Event source classification
 */
export type GameLogEventSource =
  | 'game'      // Game server data
  | 'command'   // Player command input
  | 'ui'        // UI interactions
  | 'stream'    // Stream-specific content
  | 'system'    // System-generated
  | 'parser';   // Parser-generated events

/**
 * Cached rendering data for performance optimization
 */
export interface GameLogEventCache {
  /** Rendered HTML fragment */
  html?: DocumentFragment;
  
  /** Plain text for search indexing */
  plainText?: string;
  
  /** HTML with highlights applied */
  highlighted?: DocumentFragment;
  
  /** Cache timestamp */
  cachedAt: Date;
  
  /** Cache invalidation flag */
  invalid?: boolean;
}

/**
 * Event metadata for debugging and analysis
 */
export interface GameLogEventMeta {
  /** Processing time in milliseconds */
  processingTime?: number;
  
  /** Number of GameTags in content */
  tagCount: number;
  
  /** Whether this event triggered state changes */
  triggeredStateChange: boolean;
  
  /** Related event IDs for correlation */
  relatedEvents?: Array<string>;
}

/**
 * Game log display configuration
 */
export interface GameLogDisplayState {
  /** Currently active filters */
  filters: GameLogFilters;
  
  /** Search configuration */
  search: GameLogSearchState;
  
  /** Highlighting configuration */
  highlights: GameLogHighlightState;
  
  /** Virtualization settings */
  virtualization: GameLogVirtualizationConfig;
}

/**
 * Filtering configuration for game log display
 */
export interface GameLogFilters {
  /** Event types to show */
  eventTypes: Set<GameLogEventType>;
  
  /** Event sources to show */
  eventSources: Set<GameLogEventSource>;
  
  /** Time range filter */
  timeRange?: {
    start: Date;
    end: Date;
  };
  
  /** Stream ID filter (empty = show all) */
  streamIds?: Set<string>;
  
  /** Search pattern matching */
  searchPattern?: string;
  
  /** Regular expression mode */
  useRegex?: boolean;
}

/**
 * Search state for game log
 */
export interface GameLogSearchState {
  /** Current search query */
  query: string;
  
  /** Search mode configuration */
  mode: 'text' | 'regex' | 'structured';
  
  /** Case sensitivity */
  caseSensitive: boolean;
  
  /** Current search results */
  results: Array<GameLogSearchResult>;
  
  /** Currently selected result index */
  currentResult: number;
}

/**
 * Individual search result
 */
export interface GameLogSearchResult {
  /** Event ID containing the match */
  eventId: string;
  
  /** Match start position in text */
  startIndex: number;
  
  /** Match length */
  length: number;
  
  /** Matched text snippet */
  snippet: string;
  
  /** Surrounding context */
  context: string;
}

/**
 * Highlighting configuration
 */
export interface GameLogHighlightState {
  /** Active highlight groups */
  groups: Map<string, HighlightGroup>;
  
  /** Global highlighting enabled */
  enabled: boolean;
  
  /** Highlight patterns with styling */
  patterns: Array<HighlightPattern>;
}

/**
 * Highlight group definition
 */
export interface HighlightGroup {
  /** Group identifier */
  id: string;
  
  /** Group display name */
  name: string;
  
  /** Group enabled state */
  enabled: boolean;
  
  /** CSS styling for this group */
  style: HighlightStyle;
  
  /** Patterns belonging to this group */
  patterns: Array<string>;
}

/**
 * Highlight pattern with styling
 */
export interface HighlightPattern {
  /** Pattern text or regex */
  pattern: string;
  
  /** Pattern type */
  type: 'text' | 'regex';
  
  /** Case sensitivity */
  caseSensitive: boolean;
  
  /** CSS styling */
  style: HighlightStyle;
  
  /** Group membership */
  groupId: string;
}

/**
 * CSS styling for highlights
 */
export interface HighlightStyle {
  /** Text color */
  color?: string;
  
  /** Background color */
  backgroundColor?: string;
  
  /** Font weight */
  fontWeight?: 'normal' | 'bold';
  
  /** Font style */
  fontStyle?: 'normal' | 'italic';
  
  /** Text decoration */
  textDecoration?: 'none' | 'underline' | 'line-through';
}

/**
 * Virtualization configuration for performance
 */
export interface GameLogVirtualizationConfig {
  /** Number of events to render at once */
  renderWindow: number;
  
  /** Buffer size above and below visible area */
  bufferSize: number;
  
  /** Estimated height per event for scrolling */
  estimatedItemHeight: number;
  
  /** Enable virtual scrolling */
  enabled: boolean;
}

/**
 * Memory management and retention configuration
 */
export interface GameLogRetentionConfig {
  /** Maximum number of events to keep in memory */
  maxEvents: number;
  
  /** Maximum age in hours before auto-trimming */
  maxAgeHours: number;
  
  /** Enable persistence across sessions */
  enablePersistence: boolean;
  
  /** Auto-trim interval in minutes */
  autoTrimIntervalMinutes: number;
  
  /** Memory usage warning threshold in MB */
  memoryWarningThresholdMB: number;
}

/**
 * Performance optimization caches
 */
export interface GameLogCache {
  /** Rendered event cache by event ID */
  renderedEvents: Map<string, GameLogEventCache>;
  
  /** Search index for fast text searching */
  searchIndex?: GameLogSearchIndex;
  
  /** Filtered event lists by filter hash */
  filteredLists: Map<string, Array<string>>;
  
  /** Cache statistics */
  stats: GameLogCacheStats;
}

/**
 * Search index for fast text searching
 */
export interface GameLogSearchIndex {
  /** Inverted index: word -> event IDs */
  wordIndex: Map<string, Set<string>>;
  
  /** Event text content for searching */
  eventText: Map<string, string>;
  
  /** Index build timestamp */
  lastIndexed: Date;
  
  /** Whether index needs rebuilding */
  dirty: boolean;
}

/**
 * Cache performance statistics
 */
export interface GameLogCacheStats {
  /** Cache hit rate percentage */
  hitRate: number;
  
  /** Total cache accesses */
  totalAccesses: number;
  
  /** Cache size in bytes */
  sizeBytes: number;
  
  /** Last cache cleanup timestamp */
  lastCleanup: Date;
}
```

#### Stream State Schema

```typescript
/**
 * Communication streams state (speech, thoughts, logons, etc.)
 */
export interface StreamState {
  /** Stream configurations by ID */
  configs: Map<string, StreamConfig>;
  
  /** Active stream states */
  active: Map<string, StreamData>;
  
  /** Global stream settings */
  global: StreamGlobalConfig;
}

/**
 * Configuration for an individual stream
 */
export interface StreamConfig {
  /** Stream identifier (e.g., 'speech', 'thoughts') */
  id: string;
  
  /** Human-readable display name */
  name: string;
  
  /** Whether stream is enabled for collection */
  enabled: boolean;
  
  /** Whether stream panel is visible in UI */
  visible: boolean;
  
  /** Auto-scroll behavior */
  autoScroll: boolean;
  
  /** Maximum events to retain for this stream */
  maxRetainedEvents: number;
  
  /** Stream-specific filtering rules */
  filters?: StreamFilters;
  
  /** Display configuration */
  display: StreamDisplayConfig;
}

/**
 * Current state data for an active stream
 */
export interface StreamData {
  /** Stream identifier */
  id: string;
  
  /** Event IDs belonging to this stream (references GameLogStore) */
  eventIds: Array<string>;
  
  /** Last activity timestamp */
  lastActivity?: Date;
  
  /** Unread event count */
  unreadCount: number;
  
  /** Stream status */
  status: StreamStatus;
}

/**
 * Stream status enumeration
 */
export type StreamStatus = 
  | 'inactive'   // No recent activity
  | 'active'     // Recent activity
  | 'collecting' // Currently in pushStream/popStream
  | 'error';     // Error condition

/**
 * Stream filtering configuration
 */
export interface StreamFilters {
  /** Keywords to include */
  includeKeywords?: Array<string>;
  
  /** Keywords to exclude */
  excludeKeywords?: Array<string>;
  
  /** Regular expression filters */
  regexFilters?: Array<string>;
  
  /** Character name filtering */
  characterFilters?: Array<string>;
}

/**
 * Stream display configuration
 */
export interface StreamDisplayConfig {
  /** Show timestamps */
  showTimestamps: boolean;
  
  /** Show character names */
  showCharacterNames: boolean;
  
  /** Color scheme */
  colorScheme?: string;
  
  /** Font size adjustment */
  fontSize?: 'small' | 'normal' | 'large';
}

/**
 * Global stream configuration
 */
export interface StreamGlobalConfig {
  /** Default retention policy */
  defaultRetention: number;
  
  /** Global stream enable/disable */
  globallyEnabled: boolean;
  
  /** Stream priority ordering */
  priorityOrder: Array<string>;
  
  /** Memory management settings */
  memoryManagement: {
    autoTrimEnabled: boolean;
    trimIntervalMinutes: number;
    maxMemoryUsageMB: number;
  };
}
```

#### UI State Schema

```typescript
/**
 * UI state and configuration
 */
export interface UIState {
  /** Panel visibility and layout */
  panels: UIPanelState;
  
  /** Theme and appearance */
  theme: UIThemeState;
  
  /** Layout configuration */
  layout: UILayoutState;
  
  /** User preferences */
  preferences: UIPreferences;
}

/**
 * Panel visibility and configuration
 */
export interface UIPanelState {
  /** HUD panels (left sidebar) */
  hud: {
    vitals: boolean;
    injuries: boolean;
    effects: boolean;
    compass: boolean;
    room: boolean;
  };
  
  /** Stream panels */
  streams: {
    speech: boolean;
    thoughts: boolean;
    logons: boolean;
    logoffs: boolean;
    death: boolean;
  };
  
  /** Utility panels */
  utility: {
    debug: boolean;
    settings: boolean;
    help: boolean;
  };
}

/**
 * Theme and appearance state
 */
export interface UIThemeState {
  /** Current theme name */
  current: string;
  
  /** Available themes */
  available: Array<string>;
  
  /** Custom theme overrides */
  customizations?: Map<string, string>;
  
  /** Dark mode preference */
  darkMode?: boolean;
}

/**
 * Layout configuration
 */
export interface UILayoutState {
  /** Main layout mode */
  mode: 'standard' | 'compact' | 'minimal';
  
  /** Panel sizes and positions */
  panelLayout: {
    hudWidth: number;
    streamHeight: number;
    feedHeight: number;
  };
  
  /** Responsive breakpoints */
  responsive: {
    currentBreakpoint: 'mobile' | 'tablet' | 'desktop';
    adaptiveLayout: boolean;
  };
}

/**
 * User preferences
 */
export interface UIPreferences {
  /** Accessibility settings */
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    fontSize: 'small' | 'normal' | 'large';
  };
  
  /** Interaction preferences */
  interaction: {
    clickToMove: boolean;
    doubleClickCommands: boolean;
    keyboardShortcuts: boolean;
  };
  
  /** Development preferences */
  development: {
    showDebugInfo: boolean;
    enableVerboseLogging: boolean;
    showPerformanceMetrics: boolean;
  };
}
```

#### Session State Schema

```typescript
/**
 * Session connection and status
 */
export interface SessionState {
  /** Connection information */
  connection: SessionConnectionState;
  
  /** Session identification */
  identity: SessionIdentity;
  
  /** Session statistics */
  statistics: SessionStatistics;
  
  /** Command history */
  commandHistory: SessionCommandHistory;
}

/**
 * Session connection state
 */
export interface SessionConnectionState {
  /** Connection status */
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  
  /** Connection timestamp */
  connectedAt?: Date;
  
  /** Last activity timestamp */
  lastActivity?: Date;
  
  /** Connection configuration */
  config: {
    host: string;
    port: number;
    autoReconnect: boolean;
    timeoutSeconds: number;
  };
  
  /** Error information if applicable */
  error?: {
    message: string;
    timestamp: Date;
    code?: string;
  };
}

/**
 * Session identity information
 */
export interface SessionIdentity {
  /** Session name/identifier */
  name: string;
  
  /** Character name */
  characterName?: string;
  
  /** Game identifier */
  gameId?: string;
  
  /** Session UUID */
  sessionId: string;
  
  /** Creation timestamp */
  createdAt: Date;
}

/**
 * Session statistics and metrics
 */
export interface SessionStatistics {
  /** Total events processed */
  eventsProcessed: number;
  
  /** Commands sent */
  commandsSent: number;
  
  /** Bytes received */
  bytesReceived: number;
  
  /** Bytes sent */
  bytesSent: number;
  
  /** Session duration */
  duration: number; // milliseconds
  
  /** Performance metrics */
  performance: {
    averageEventProcessingTime: number;
    peakMemoryUsage: number;
    renderFrameRate: number;
  };
}

/**
 * Command history management
 */
export interface SessionCommandHistory {
  /** Command history entries */
  entries: Array<CommandHistoryEntry>;
  
  /** Current position in history */
  currentIndex: number;
  
  /** Maximum history size */
  maxSize: number;
  
  /** History configuration */
  config: {
    saveToDisk: boolean;
    filterDuplicates: boolean;
    excludePatterns: Array<string>;
  };
}

/**
 * Individual command history entry
 */
export interface CommandHistoryEntry {
  /** Command text */
  command: string;
  
  /** Execution timestamp */
  timestamp: Date;
  
  /** Session context */
  sessionId: string;
  
  /** Command category */
  category?: 'movement' | 'communication' | 'action' | 'system';
}
```

## Implementation Strategy

### Phase 1: Core Infrastructure (3-4 days)

#### 1.1 TypeScript Foundation
- Create `src/frontend/store/types/` directory structure
- Implement all TypeScript interfaces as defined above
- Add comprehensive JSDoc documentation
- Create index files for clean imports

#### 1.2 Game State Store
- Implement `GameStateStore` class with immutable state management
- Add event-driven state updates
- Create state derivation functions
- Implement memory management and cleanup

#### 1.3 Game Log Store
- Implement `GameLogStore` with append-only event stream
- Add performance optimization caches
- Create search and filtering capabilities
- Implement memory retention policies

### Phase 2: Integration Bridge (2-3 days)

#### 2.1 Adapter Layer
- Create adapters to bridge with existing bus system
- Maintain backward compatibility during migration
- Add dual-state validation (old vs new)
- Create migration utilities

#### 2.2 Event Processing
- Update `dispatchMetadata()` to populate game state store
- Create event processors for each GameTag type
- Add event correlation and batching
- Implement error handling and recovery

### Phase 3: Component Migration (4-5 days)

#### 3.1 Proof of Concept - Vitals
- Migrate VitalsContainer to use centralized state
- Remove @state() decorators, use props from store
- Test HMR behavior and state persistence
- Performance validation

#### 3.2 Progressive Migration
- Migrate InjuriesContainer with complex pairing logic
- Migrate EffectsContainer with timer management
- Migrate CompassContainer and HandsContainer
- Update each component's test suite

#### 3.3 Game Log UI
- Build new game log component using virtualization
- Implement search, filtering, and highlighting
- Add performance monitoring and optimization
- Create debug tools for event stream inspection

### Phase 4: Advanced Features (2-3 days)

#### 4.1 Development Tools
- Add time-travel debugging capabilities
- Create state inspection tools
- Add performance monitoring dashboard
- Implement state persistence across sessions

#### 4.2 Testing and Validation
- Comprehensive test suite for all state operations
- Performance benchmarking vs existing system
- Memory usage analysis and optimization
- HMR testing across all scenarios

## Migration Approach

### Incremental Strategy

1. **Parallel Implementation**: Build new system alongside existing code
2. **Component-by-Component**: Migrate one component type at a time
3. **Backward Compatibility**: Maintain existing bus events during transition
4. **Validation**: Compare old vs new outputs for consistency
5. **Rollback Safety**: Each migration can be individually reverted

### Testing Strategy

```typescript
// Example migration test
describe('VitalsContainer Migration', () => {
  test('produces identical output with new architecture', () => {
    const oldComponent = createOldVitalsContainer(mockSession);
    const newComponent = createNewVitalsContainer(derivedState);
    expect(newComponent.shadowRoot).toEqualStructure(oldComponent.shadowRoot);
  });
  
  test('survives HMR without state loss', async () => {
    const component = createNewVitalsContainer(derivedState);
    const initialOutput = component.shadowRoot.innerHTML;
    
    await simulateHMR(component);
    
    const postHMROutput = component.shadowRoot.innerHTML;
    expect(postHMROutput).toBe(initialOutput);
  });
});
```

## Performance Considerations

### Memory Management
- Event stream trimming based on age and count
- Lazy rendering cache with invalidation
- Virtual scrolling for large event lists
- Garbage collection optimization

### Rendering Optimization
- Immutable state prevents unnecessary re-renders
- Batch state updates for related changes
- Component memoization where appropriate
- Efficient diff algorithms for virtual lists

### Search and Filtering
- Inverted index for fast text search
- Cached filter results with invalidation
- Progressive filtering for large datasets
- Background indexing to avoid UI blocking

## Success Criteria

### HMR Behavior
- [ ] No UI disconnections during file changes
- [ ] Complete state preservation across HMR
- [ ] Instantaneous state restoration
- [ ] Game remains fully playable during development

### Code Quality
- [ ] Elimination of component @state() management
- [ ] Single source of truth for all game data
- [ ] Pure presentation components
- [ ] Comprehensive TypeScript coverage

### Performance
- [ ] No regression in render performance
- [ ] Improved memory efficiency
- [ ] Faster component updates for related state
- [ ] Sub-100ms event processing times

### Developer Experience
- [ ] Complete game state inspection capabilities
- [ ] Time-travel debugging for development
- [ ] Performance monitoring dashboard
- [ ] Simplified component testing

### Advanced Capabilities
- [ ] Full-text search across game history
- [ ] State persistence across sessions
- [ ] Event replay and debugging
- [ ] Memory usage under 100MB for 8-hour sessions

This architecture represents a fundamental improvement to Illthorn's state management, solving critical HMR issues while enabling powerful new debugging and development capabilities.