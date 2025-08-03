// ABOUTME: Stream state interfaces for communication channels (speech, thoughts, logons, etc.)
// ABOUTME: Manages stream configurations, filtering, and content organization

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
  
  /** Stream processing state */
  processing: StreamProcessingState;
}

/**
 * Configuration for an individual stream
 */
export interface StreamConfig {
  /** Stream identifier (e.g., 'speech', 'thoughts') */
  id: string;
  
  /** Human-readable display name */
  name: string;
  
  /** Stream description */
  description?: string;
  
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
  
  /** Stream priority for processing */
  priority: number;
  
  /** Stream category */
  category: StreamCategory;
}

/**
 * Stream categories for organization
 */
export type StreamCategory = 
  | 'communication'  // Speech, tell, whisper
  | 'telepathy'      // Thoughts, esp
  | 'system'         // Logons, logoffs, deaths
  | 'combat'         // Combat-related messages
  | 'inventory'      // Inventory and item changes
  | 'room'           // Room-specific content
  | 'guild'          // Guild communications
  | 'ooc'            // Out-of-character
  | 'custom';        // User-defined streams

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
  
  /** Current stream session info */
  session?: StreamSession;
  
  /** Stream statistics */
  statistics: StreamStatistics;
}

/**
 * Stream status enumeration
 */
export type StreamStatus = 
  | 'inactive'   // No recent activity
  | 'active'     // Recent activity
  | 'collecting' // Currently in pushStream/popStream
  | 'paused'     // Temporarily paused
  | 'error'      // Error condition
  | 'archived';  // Archived for storage

/**
 * Stream session information for multi-message streams
 */
export interface StreamSession {
  /** Session identifier */
  sessionId: string;
  
  /** Session start timestamp */
  startTime: Date;
  
  /** Expected session end (if known) */
  expectedEndTime?: Date;
  
  /** Session type */
  type: StreamSessionType;
  
  /** Session metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Stream session types
 */
export type StreamSessionType = 
  | 'pushpop'    // Traditional pushStream/popStream
  | 'continuous' // Continuous stream without explicit boundaries
  | 'timed'      // Time-based session
  | 'manual';    // Manually controlled session

/**
 * Stream statistics
 */
export interface StreamStatistics {
  /** Total events in this stream */
  totalEvents: number;
  
  /** Events in the last hour */
  eventsLastHour: number;
  
  /** Events in the last day */
  eventsLastDay: number;
  
  /** Average events per hour */
  averageEventsPerHour: number;
  
  /** Peak events per hour */
  peakEventsPerHour: number;
  
  /** First event timestamp */
  firstEventTime?: Date;
  
  /** Most recent event timestamp */
  lastEventTime?: Date;
  
  /** Stream uptime percentage */
  uptimePercentage: number;
}

/**
 * Stream filtering configuration
 */
export interface StreamFilters {
  /** Keywords to include */
  includeKeywords?: Array<StreamKeywordFilter>;
  
  /** Keywords to exclude */
  excludeKeywords?: Array<StreamKeywordFilter>;
  
  /** Regular expression filters */
  regexFilters?: Array<StreamRegexFilter>;
  
  /** Character name filtering */
  characterFilters?: Array<StreamCharacterFilter>;
  
  /** Content type filters */
  contentTypeFilters?: Array<StreamContentTypeFilter>;
  
  /** Time-based filters */
  timeFilters?: Array<StreamTimeFilter>;
  
  /** Advanced filtering rules */
  advancedFilters?: Array<StreamAdvancedFilter>;
}

/**
 * Keyword filter configuration
 */
export interface StreamKeywordFilter {
  /** Keyword or phrase */
  keyword: string;
  
  /** Case sensitivity */
  caseSensitive: boolean;
  
  /** Whole word matching */
  wholeWord: boolean;
  
  /** Filter weight/priority */
  weight: number;
  
  /** Filter enabled state */
  enabled: boolean;
}

/**
 * Regular expression filter
 */
export interface StreamRegexFilter {
  /** Regular expression pattern */
  pattern: string;
  
  /** Regex flags */
  flags: string;
  
  /** Filter description */
  description?: string;
  
  /** Filter enabled state */
  enabled: boolean;
}

/**
 * Character name filter
 */
export interface StreamCharacterFilter {
  /** Character name or pattern */
  character: string;
  
  /** Filter type */
  type: 'exact' | 'partial' | 'regex';
  
  /** Include or exclude this character */
  action: 'include' | 'exclude';
  
  /** Filter enabled state */
  enabled: boolean;
}

/**
 * Content type filter
 */
export interface StreamContentTypeFilter {
  /** Content type to filter */
  contentType: StreamContentType;
  
  /** Include or exclude this type */
  action: 'include' | 'exclude';
  
  /** Filter enabled state */
  enabled: boolean;
}

/**
 * Stream content types
 */
export type StreamContentType = 
  | 'say'        // Normal speech
  | 'whisper'    // Whispered communication
  | 'yell'       // Yelled communication
  | 'tell'       // Private tells
  | 'thought'    // Telepathic thoughts
  | 'emote'      // Character emotes
  | 'action'     // Action descriptions
  | 'system'     // System messages
  | 'combat'     // Combat messages
  | 'death'      // Death messages
  | 'logon'      // Player login
  | 'logoff'     // Player logout
  | 'other';     // Other/unknown content

/**
 * Time-based filter
 */
export interface StreamTimeFilter {
  /** Filter type */
  type: 'before' | 'after' | 'between' | 'recent';
  
  /** Start time for filter */
  startTime?: Date;
  
  /** End time for filter */
  endTime?: Date;
  
  /** Relative time specification */
  relativeTime?: string;
  
  /** Filter enabled state */
  enabled: boolean;
}

/**
 * Advanced filter with custom logic
 */
export interface StreamAdvancedFilter {
  /** Filter identifier */
  id: string;
  
  /** Filter name */
  name: string;
  
  /** Filter description */
  description?: string;
  
  /** Filter expression or logic */
  expression: string;
  
  /** Filter language/syntax */
  language: 'javascript' | 'regex' | 'query';
  
  /** Filter enabled state */
  enabled: boolean;
}

/**
 * Stream display configuration
 */
export interface StreamDisplayConfig {
  /** Show timestamps */
  showTimestamps: boolean;
  
  /** Timestamp format */
  timestampFormat: StreamTimestampFormat;
  
  /** Show character names */
  showCharacterNames: boolean;
  
  /** Character name format */
  characterNameFormat: StreamCharacterNameFormat;
  
  /** Color scheme */
  colorScheme?: string;
  
  /** Font size adjustment */
  fontSize: StreamFontSize;
  
  /** Line spacing */
  lineSpacing: number;
  
  /** Text wrapping */
  textWrapping: boolean;
  
  /** Highlight configuration */
  highlighting: StreamHighlightConfig;
  
  /** Display density */
  density: StreamDisplayDensity;
  
  /** Custom CSS classes */
  customClasses?: Array<string>;
}

/**
 * Timestamp format options
 */
export type StreamTimestampFormat = 
  | 'none'
  | 'time'        // HH:MM:SS
  | 'datetime'    // MM/DD HH:MM:SS
  | 'relative'    // "5 minutes ago"
  | 'iso'         // ISO 8601 format
  | 'custom';     // Custom format string

/**
 * Character name format options
 */
export type StreamCharacterNameFormat = 
  | 'none'
  | 'simple'      // "Name:"
  | 'brackets'    // "[Name]"
  | 'parens'      // "(Name)"
  | 'colored'     // Colored names
  | 'custom';     // Custom format

/**
 * Font size options
 */
export type StreamFontSize = 'small' | 'normal' | 'large' | 'custom';

/**
 * Display density options
 */
export type StreamDisplayDensity = 'compact' | 'normal' | 'spacious';

/**
 * Stream highlighting configuration
 */
export interface StreamHighlightConfig {
  /** Enable highlighting */
  enabled: boolean;
  
  /** Highlight own character */
  highlightSelf: boolean;
  
  /** Self highlight style */
  selfHighlightStyle?: string;
  
  /** Highlight keywords */
  highlightKeywords: boolean;
  
  /** Keyword highlight patterns */
  keywordPatterns: Array<StreamHighlightPattern>;
  
  /** Highlight character names */
  highlightCharacters: boolean;
  
  /** Character highlight colors */
  characterColors: Map<string, string>;
}

/**
 * Stream highlight pattern
 */
export interface StreamHighlightPattern {
  /** Pattern to match */
  pattern: string;
  
  /** Pattern type */
  type: 'text' | 'regex';
  
  /** Highlight style */
  style: StreamHighlightStyle;
  
  /** Pattern enabled state */
  enabled: boolean;
}

/**
 * Stream highlight style
 */
export interface StreamHighlightStyle {
  /** Background color */
  backgroundColor?: string;
  
  /** Text color */
  color?: string;
  
  /** Font weight */
  fontWeight?: 'normal' | 'bold';
  
  /** Font style */
  fontStyle?: 'normal' | 'italic';
  
  /** Text decoration */
  textDecoration?: string;
  
  /** Border style */
  border?: string;
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
  memoryManagement: StreamMemoryManagement;
  
  /** Default filters */
  defaultFilters: StreamFilters;
  
  /** Stream window management */
  windowManagement: StreamWindowManagement;
  
  /** Cross-stream features */
  crossStream: StreamCrossStreamConfig;
}

/**
 * Stream memory management configuration
 */
export interface StreamMemoryManagement {
  /** Auto-trim enabled */
  autoTrimEnabled: boolean;
  
  /** Trim interval in minutes */
  trimIntervalMinutes: number;
  
  /** Maximum memory usage in MB */
  maxMemoryUsageMB: number;
  
  /** Memory warning threshold */
  memoryWarningThresholdMB: number;
  
  /** Trim strategy */
  trimStrategy: 'oldest' | 'priority' | 'lru';
  
  /** Archive trimmed events */
  archiveTrimmed: boolean;
}

/**
 * Stream window management
 */
export interface StreamWindowManagement {
  /** Maximum open streams */
  maxOpenStreams: number;
  
  /** Auto-close inactive streams */
  autoCloseInactive: boolean;
  
  /** Inactive timeout in minutes */
  inactiveTimeoutMinutes: number;
  
  /** Window positioning */
  positioning: 'tabs' | 'windows' | 'split';
  
  /** Default window size */
  defaultWindowSize: {
    width: number;
    height: number;
  };
}

/**
 * Cross-stream configuration
 */
export interface StreamCrossStreamConfig {
  /** Enable cross-stream search */
  enableCrossSearch: boolean;
  
  /** Enable stream merging */
  enableMerging: boolean;
  
  /** Merged stream configurations */
  mergedStreams: Array<StreamMergeConfig>;
  
  /** Stream correlation rules */
  correlationRules: Array<StreamCorrelationRule>;
}

/**
 * Stream merge configuration
 */
export interface StreamMergeConfig {
  /** Merged stream ID */
  id: string;
  
  /** Merged stream name */
  name: string;
  
  /** Source stream IDs */
  sourceStreams: Array<string>;
  
  /** Merge strategy */
  strategy: 'chronological' | 'priority' | 'interleaved';
  
  /** Enabled state */
  enabled: boolean;
}

/**
 * Stream correlation rule
 */
export interface StreamCorrelationRule {
  /** Rule ID */
  id: string;
  
  /** Rule name */
  name: string;
  
  /** Source streams */
  sourceStreams: Array<string>;
  
  /** Correlation logic */
  logic: string;
  
  /** Action to take on correlation */
  action: 'highlight' | 'notify' | 'merge' | 'filter';
  
  /** Rule enabled state */
  enabled: boolean;
}

/**
 * Stream processing state
 */
export interface StreamProcessingState {
  /** Currently processing streams */
  active: Set<string>;
  
  /** Stream processing queue */
  queue: Array<StreamProcessingTask>;
  
  /** Processing statistics */
  statistics: StreamProcessingStatistics;
  
  /** Error state */
  errors: Array<StreamProcessingError>;
}

/**
 * Stream processing task
 */
export interface StreamProcessingTask {
  /** Task ID */
  id: string;
  
  /** Stream ID */
  streamId: string;
  
  /** Task type */
  type: 'collect' | 'filter' | 'render' | 'archive';
  
  /** Task priority */
  priority: number;
  
  /** Task data */
  data: unknown;
  
  /** Created timestamp */
  created: Date;
}

/**
 * Stream processing statistics
 */
export interface StreamProcessingStatistics {
  /** Total tasks processed */
  totalTasksProcessed: number;
  
  /** Tasks processed in last hour */
  tasksLastHour: number;
  
  /** Average processing time per task */
  averageProcessingTimeMs: number;
  
  /** Current queue size */
  currentQueueSize: number;
  
  /** Processing errors in last hour */
  errorsLastHour: number;
  
  /** Processing efficiency ratio */
  efficiencyRatio: number;
}

/**
 * Stream processing error
 */
export interface StreamProcessingError {
  /** Error ID */
  id: string;
  
  /** Stream ID where error occurred */
  streamId: string;
  
  /** Error timestamp */
  timestamp: Date;
  
  /** Error message */
  message: string;
  
  /** Error type */
  type: 'parsing' | 'filtering' | 'rendering' | 'memory' | 'other';
  
  /** Error severity */
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  /** Error context */
  context?: Record<string, unknown>;
  
  /** Whether error was resolved */
  resolved: boolean;
}

/**
 * Stream state change event types
 */
export type StreamStateChangeType =
  | 'stream.created'
  | 'stream.deleted'
  | 'stream.enabled'
  | 'stream.disabled'
  | 'stream.content.added'
  | 'stream.content.removed'
  | 'stream.filter.changed'
  | 'stream.display.changed'
  | 'stream.session.started'
  | 'stream.session.ended'
  | 'stream.error.occurred'
  | 'stream.error.resolved';

/**
 * Stream state validator
 */
export interface StreamStateValidator {
  /** Validate stream configuration */
  validateConfig(config: StreamConfig): Array<string>;
  
  /** Validate stream filters */
  validateFilters(filters: StreamFilters): Array<string>;
  
  /** Validate stream processing state */
  validateProcessing(processing: StreamProcessingState): Array<string>;
  
  /** Validate global configuration */
  validateGlobal(global: StreamGlobalConfig): Array<string>;
}