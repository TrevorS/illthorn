// ABOUTME: Game log event store interfaces for immutable event stream architecture
// ABOUTME: Defines append-only event system that serves as canonical record of all game activity

import type { GameTag } from "../../parser/tag";

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
  
  /** Store metadata and statistics */
  metadata: GameLogMetadata;
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
  
  /** Rendering performance metrics */
  performance?: {
    renderTimeMs: number;
    cacheHit: boolean;
  };
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
  
  /** State change types that were triggered */
  triggeredChanges?: Array<string>;
  
  /** Related event IDs for correlation */
  relatedEvents?: Array<string>;
  
  /** Raw byte size of the event data */
  byteSize?: number;
  
  /** Parser version that processed this event */
  parserVersion?: string;
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
  
  /** Display preferences */
  preferences: GameLogDisplayPreferences;
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
  timeRange?: GameLogTimeRange;
  
  /** Stream ID filter (empty = show all) */
  streamIds?: Set<string>;
  
  /** Search pattern matching */
  searchPattern?: string;
  
  /** Regular expression mode */
  useRegex?: boolean;
  
  /** Case sensitivity for filtering */
  caseSensitive?: boolean;
  
  /** Minimum event sequence number */
  minSequence?: number;
  
  /** Maximum event sequence number */
  maxSequence?: number;
}

/**
 * Time range filter
 */
export interface GameLogTimeRange {
  /** Start time (inclusive) */
  start: Date;
  
  /** End time (inclusive) */
  end: Date;
  
  /** Whether this is a relative time range */
  relative?: boolean;
  
  /** Relative time specification (e.g., "last 1 hour") */
  relativeSpec?: string;
}

/**
 * Search state for game log
 */
export interface GameLogSearchState {
  /** Current search query */
  query: string;
  
  /** Search mode configuration */
  mode: GameLogSearchMode;
  
  /** Case sensitivity */
  caseSensitive: boolean;
  
  /** Current search results */
  results: Array<GameLogSearchResult>;
  
  /** Currently selected result index */
  currentResult: number;
  
  /** Search performance metrics */
  performance?: GameLogSearchPerformance;
  
  /** Search history */
  history: Array<string>;
}

/**
 * Search mode types
 */
export type GameLogSearchMode = 'text' | 'regex' | 'structured' | 'advanced';

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
  
  /** Match relevance score */
  relevance?: number;
  
  /** Highlight information */
  highlight?: GameLogSearchHighlight;
}

/**
 * Search result highlighting
 */
export interface GameLogSearchHighlight {
  /** Pre-match text */
  pre: string;
  
  /** Matched text */
  match: string;
  
  /** Post-match text */
  post: string;
  
  /** Context length in characters */
  contextLength: number;
}

/**
 * Search performance metrics
 */
export interface GameLogSearchPerformance {
  /** Total search time in milliseconds */
  searchTimeMs: number;
  
  /** Number of events searched */
  eventsSearched: number;
  
  /** Number of matches found */
  matchesFound: number;
  
  /** Whether search index was used */
  indexUsed: boolean;
  
  /** Memory usage during search */
  memoryUsageMB?: number;
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
  
  /** Live highlighting during typing */
  liveHighlight: boolean;
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
  
  /** Group priority for overlapping highlights */
  priority: number;
}

/**
 * Highlight pattern with styling
 */
export interface HighlightPattern {
  /** Pattern text or regex */
  pattern: string;
  
  /** Pattern type */
  type: 'text' | 'regex' | 'wildcard';
  
  /** Case sensitivity */
  caseSensitive: boolean;
  
  /** CSS styling */
  style: HighlightStyle;
  
  /** Group membership */
  groupId: string;
  
  /** Pattern enabled state */
  enabled: boolean;
  
  /** Pattern description */
  description?: string;
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
  
  /** Border styling */
  border?: string;
  
  /** Opacity */
  opacity?: number;
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
  
  /** Scroll behavior configuration */
  scrollBehavior: GameLogScrollBehavior;
  
  /** Performance monitoring */
  performance: {
    enableMetrics: boolean;
    targetFrameRate: number;
    performanceThresholds: {
      renderTimeMs: number;
      memoryUsageMB: number;
    };
  };
}

/**
 * Scroll behavior configuration
 */
export interface GameLogScrollBehavior {
  /** Auto-scroll to bottom for new events */
  autoScrollToBottom: boolean;
  
  /** Pause auto-scroll when user scrolls up */
  pauseOnUserScroll: boolean;
  
  /** Resume auto-scroll timeout (ms) */
  resumeScrollTimeoutMs: number;
  
  /** Smooth scrolling enabled */
  smoothScroll: boolean;
  
  /** Scroll animation duration (ms) */
  scrollAnimationDurationMs: number;
}

/**
 * Game log display preferences
 */
export interface GameLogDisplayPreferences {
  /** Show timestamps */
  showTimestamps: boolean;
  
  /** Timestamp format */
  timestampFormat: 'absolute' | 'relative' | 'both';
  
  /** Show event types */
  showEventTypes: boolean;
  
  /** Show event sources */
  showEventSources: boolean;
  
  /** Font size */
  fontSize: 'small' | 'normal' | 'large';
  
  /** Line height */
  lineHeight: number;
  
  /** Show event sequence numbers */
  showSequenceNumbers: boolean;
  
  /** Compact mode */
  compactMode: boolean;
  
  /** Color scheme */
  colorScheme: 'auto' | 'light' | 'dark';
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
  
  /** Force cleanup threshold in MB */
  forceCleanupThresholdMB: number;
  
  /** Retention policy for different event types */
  eventTypeRetention: Map<GameLogEventType, number>;
  
  /** Archive old events instead of deleting */
  enableArchiving: boolean;
  
  /** Archive storage configuration */
  archiving?: GameLogArchiveConfig;
}

/**
 * Archive configuration
 */
export interface GameLogArchiveConfig {
  /** Archive storage type */
  storageType: 'file' | 'indexeddb' | 'memory';
  
  /** Archive compression enabled */
  compression: boolean;
  
  /** Maximum archive size */
  maxArchiveSizeMB: number;
  
  /** Archive rotation policy */
  rotationPolicy: 'size' | 'time' | 'count';
  
  /** Archive file prefix */
  filePrefix: string;
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
  
  /** Cache configuration */
  config: GameLogCacheConfig;
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
  
  /** Index statistics */
  stats: GameLogSearchIndexStats;
}

/**
 * Search index statistics
 */
export interface GameLogSearchIndexStats {
  /** Number of unique words indexed */
  wordCount: number;
  
  /** Number of events indexed */
  eventCount: number;
  
  /** Index size in bytes */
  indexSizeBytes: number;
  
  /** Last index build time in milliseconds */
  lastBuildTimeMs: number;
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
  
  /** Cache efficiency metrics */
  efficiency: {
    averageAccessTimeMs: number;
    memoryEfficiencyRatio: number;
    compressionRatio: number;
  };
}

/**
 * Cache configuration
 */
export interface GameLogCacheConfig {
  /** Maximum cache size in MB */
  maxSizeMB: number;
  
  /** Cache entry TTL in minutes */
  entryTTLMinutes: number;
  
  /** Enable compression for cached data */
  enableCompression: boolean;
  
  /** Cache cleanup interval in minutes */
  cleanupIntervalMinutes: number;
  
  /** LRU eviction policy */
  evictionPolicy: 'lru' | 'lfu' | 'ttl';
}

/**
 * Game log store metadata and statistics
 */
export interface GameLogMetadata {
  /** Store creation timestamp */
  created: Date;
  
  /** Last modification timestamp */
  lastModified: Date;
  
  /** Store version for migration compatibility */
  version: string;
  
  /** Store statistics */
  statistics: GameLogStatistics;
  
  /** Performance metrics */
  performance: GameLogPerformanceMetrics;
}

/**
 * Game log statistics
 */
export interface GameLogStatistics {
  /** Total events stored */
  totalEvents: number;
  
  /** Events by type breakdown */
  eventsByType: Map<GameLogEventType, number>;
  
  /** Events by source breakdown */
  eventsBySource: Map<GameLogEventSource, number>;
  
  /** Average events per hour */
  averageEventsPerHour: number;
  
  /** Storage usage in bytes */
  storageUsageBytes: number;
  
  /** Search operations performed */
  searchOperations: number;
  
  /** Cache operations performed */
  cacheOperations: number;
}

/**
 * Performance metrics for the game log store
 */
export interface GameLogPerformanceMetrics {
  /** Average event append time (ms) */
  averageAppendTimeMs: number;
  
  /** Average search time (ms) */
  averageSearchTimeMs: number;
  
  /** Average render time (ms) */
  averageRenderTimeMs: number;
  
  /** Memory usage breakdown */
  memoryUsage: {
    eventsMemoryMB: number;
    cacheMemoryMB: number;
    indexMemoryMB: number;
    totalMemoryMB: number;
  };
  
  /** Performance history */
  history: Array<GameLogPerformanceSnapshot>;
}

/**
 * Performance snapshot for historical tracking
 */
export interface GameLogPerformanceSnapshot {
  /** Snapshot timestamp */
  timestamp: Date;
  
  /** Event count at this time */
  eventCount: number;
  
  /** Memory usage at this time */
  memoryUsageMB: number;
  
  /** Performance metrics at this time */
  metrics: {
    appendTimeMs: number;
    searchTimeMs: number;
    renderTimeMs: number;
  };
}