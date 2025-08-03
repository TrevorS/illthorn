// ABOUTME: Session state interfaces for connection, identity, and session management
// ABOUTME: Handles connection status, command history, and session statistics

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
  
  /** Session configuration */
  configuration: SessionConfiguration;
  
  /** Authentication state */
  authentication?: SessionAuthenticationState;
}

/**
 * Session connection state
 */
export interface SessionConnectionState {
  /** Connection status */
  status: SessionConnectionStatus;
  
  /** Connection timestamp */
  connectedAt?: Date;
  
  /** Last activity timestamp */
  lastActivity?: Date;
  
  /** Connection attempt count */
  attemptCount: number;
  
  /** Connection configuration */
  config: SessionConnectionConfig;
  
  /** Network state information */
  network: SessionNetworkState;
  
  /** Error information if applicable */
  error?: SessionConnectionError;
  
  /** Connection history */
  history: Array<SessionConnectionHistoryEntry>;
}

/**
 * Session connection status
 */
export type SessionConnectionStatus = 
  | 'disconnected'  // Not connected
  | 'connecting'    // Attempting to connect
  | 'connected'     // Successfully connected
  | 'reconnecting'  // Attempting to reconnect
  | 'error'         // Connection error
  | 'timeout'       // Connection timeout
  | 'terminated';   // Connection terminated

/**
 * Session connection configuration
 */
export interface SessionConnectionConfig {
  /** Host address */
  host: string;
  
  /** Port number */
  port: number;
  
  /** Connection protocol */
  protocol: 'tcp' | 'websocket' | 'ssl';
  
  /** Auto-reconnect enabled */
  autoReconnect: boolean;
  
  /** Reconnect interval in seconds */
  reconnectIntervalSeconds: number;
  
  /** Maximum reconnect attempts */
  maxReconnectAttempts: number;
  
  /** Connection timeout in seconds */
  timeoutSeconds: number;
  
  /** Keep-alive configuration */
  keepAlive: SessionKeepAliveConfig;
  
  /** SSL/TLS configuration */
  ssl?: SessionSSLConfig;
}

/**
 * Keep-alive configuration
 */
export interface SessionKeepAliveConfig {
  /** Enable keep-alive */
  enabled: boolean;
  
  /** Keep-alive interval in seconds */
  intervalSeconds: number;
  
  /** Keep-alive timeout in seconds */
  timeoutSeconds: number;
  
  /** Maximum missed keep-alives before disconnect */
  maxMissed: number;
}

/**
 * SSL/TLS configuration
 */
export interface SessionSSLConfig {
  /** Enable SSL/TLS */
  enabled: boolean;
  
  /** Verify certificate */
  verifyCertificate: boolean;
  
  /** Certificate authority */
  certificateAuthority?: string;
  
  /** Client certificate */
  clientCertificate?: string;
  
  /** Private key */
  privateKey?: string;
  
  /** SSL version */
  version?: 'TLSv1.2' | 'TLSv1.3';
}

/**
 * Network state information
 */
export interface SessionNetworkState {
  /** Network latency in milliseconds */
  latency: number;
  
  /** Bandwidth estimate in bytes per second */
  bandwidth: number;
  
  /** Packet loss percentage */
  packetLoss: number;
  
  /** Connection quality rating */
  quality: SessionConnectionQuality;
  
  /** Network interface information */
  interface?: SessionNetworkInterface;
  
  /** Network monitoring enabled */
  monitoringEnabled: boolean;
}

/**
 * Connection quality rating
 */
export type SessionConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

/**
 * Network interface information
 */
export interface SessionNetworkInterface {
  /** Interface type */
  type: 'ethernet' | 'wifi' | 'cellular' | 'vpn' | 'unknown';
  
  /** Interface name */
  name?: string;
  
  /** IP address */
  ipAddress?: string;
  
  /** Gateway address */
  gateway?: string;
  
  /** DNS servers */
  dnsServers?: Array<string>;
}

/**
 * Connection error information
 */
export interface SessionConnectionError {
  /** Error message */
  message: string;
  
  /** Error timestamp */
  timestamp: Date;
  
  /** Error code */
  code?: string;
  
  /** Error type */
  type: SessionConnectionErrorType;
  
  /** Error severity */
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  /** Whether error is recoverable */
  recoverable: boolean;
  
  /** Suggested actions */
  suggestedActions?: Array<string>;
  
  /** Error context */
  context?: Record<string, unknown>;
}

/**
 * Connection error types
 */
export type SessionConnectionErrorType = 
  | 'network'       // Network connectivity issues
  | 'timeout'       // Connection timeout
  | 'refused'       // Connection refused by server
  | 'authentication' // Authentication failure
  | 'protocol'      // Protocol mismatch
  | 'ssl'           // SSL/TLS issues
  | 'dns'           // DNS resolution failure
  | 'firewall'      // Firewall blocking connection
  | 'unknown';      // Unknown error

/**
 * Connection history entry
 */
export interface SessionConnectionHistoryEntry {
  /** Entry timestamp */
  timestamp: Date;
  
  /** Connection status at this time */
  status: SessionConnectionStatus;
  
  /** Duration of this status */
  duration?: number;
  
  /** Additional information */
  details?: string;
  
  /** Network metrics at this time */
  networkMetrics?: Partial<SessionNetworkState>;
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
  
  /** Session type */
  type: SessionType;
  
  /** Session source */
  source: SessionSource;
  
  /** Session tags */
  tags: Array<string>;
  
  /** Session metadata */
  metadata: Record<string, unknown>;
}

/**
 * Session types
 */
export type SessionType = 
  | 'game'       // Normal game session
  | 'test'       // Testing session
  | 'development' // Development session
  | 'replay'     // Session replay
  | 'sandbox';   // Sandbox environment

/**
 * Session sources
 */
export type SessionSource = 
  | 'user'       // User-initiated session
  | 'auto'       // Automatically created session
  | 'import'     // Imported session
  | 'system';    // System-created session

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
  
  /** Session duration in milliseconds */
  duration: number;
  
  /** Active time (excluding idle) */
  activeTime: number;
  
  /** Performance metrics */
  performance: SessionPerformanceMetrics;
  
  /** Activity metrics */
  activity: SessionActivityMetrics;
  
  /** Error statistics */
  errors: SessionErrorStatistics;
}

/**
 * Session performance metrics
 */
export interface SessionPerformanceMetrics {
  /** Average event processing time */
  averageEventProcessingTime: number;
  
  /** Peak memory usage */
  peakMemoryUsage: number;
  
  /** Average memory usage */
  averageMemoryUsage: number;
  
  /** Render frame rate */
  renderFrameRate: number;
  
  /** CPU usage percentage */
  cpuUsage: number;
  
  /** Network utilization */
  networkUtilization: number;
  
  /** Performance history */
  history: Array<SessionPerformanceSnapshot>;
}

/**
 * Performance snapshot
 */
export interface SessionPerformanceSnapshot {
  /** Snapshot timestamp */
  timestamp: Date;
  
  /** Memory usage at this time */
  memoryUsage: number;
  
  /** CPU usage at this time */
  cpuUsage: number;
  
  /** Frame rate at this time */
  frameRate: number;
  
  /** Event processing time */
  eventProcessingTime: number;
}

/**
 * Session activity metrics
 */
export interface SessionActivityMetrics {
  /** Commands per minute */
  commandsPerMinute: number;
  
  /** Peak commands per minute */
  peakCommandsPerMinute: number;
  
  /** Average response time */
  averageResponseTime: number;
  
  /** Idle time percentage */
  idleTimePercentage: number;
  
  /** Activity pattern */
  activityPattern: SessionActivityPattern;
  
  /** Most active hours */
  mostActiveHours: Array<number>;
}

/**
 * Activity pattern analysis
 */
export interface SessionActivityPattern {
  /** Pattern type */
  type: 'steady' | 'bursty' | 'periodic' | 'random';
  
  /** Pattern confidence */
  confidence: number;
  
  /** Pattern description */
  description: string;
  
  /** Pattern metrics */
  metrics: Record<string, number>;
}

/**
 * Error statistics
 */
export interface SessionErrorStatistics {
  /** Total errors */
  totalErrors: number;
  
  /** Errors per hour */
  errorsPerHour: number;
  
  /** Error types breakdown */
  errorsByType: Map<string, number>;
  
  /** Error severity breakdown */
  errorsBySeverity: Map<string, number>;
  
  /** Recent errors */
  recentErrors: Array<SessionErrorEntry>;
  
  /** Error resolution rate */
  resolutionRate: number;
}

/**
 * Session error entry
 */
export interface SessionErrorEntry {
  /** Error timestamp */
  timestamp: Date;
  
  /** Error message */
  message: string;
  
  /** Error type */
  type: string;
  
  /** Error severity */
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  /** Error context */
  context?: Record<string, unknown>;
  
  /** Whether error was resolved */
  resolved: boolean;
  
  /** Resolution timestamp */
  resolvedAt?: Date;
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
  config: CommandHistoryConfig;
  
  /** Command statistics */
  statistics: CommandHistoryStatistics;
  
  /** Favorite commands */
  favorites: Array<CommandFavorite>;
}

/**
 * Individual command history entry
 */
export interface CommandHistoryEntry {
  /** Unique entry identifier */
  id: string;
  
  /** Command text */
  command: string;
  
  /** Execution timestamp */
  timestamp: Date;
  
  /** Session context */
  sessionId: string;
  
  /** Command category */
  category?: CommandCategory;
  
  /** Command success status */
  success?: boolean;
  
  /** Execution time */
  executionTime?: number;
  
  /** Command output summary */
  outputSummary?: string;
  
  /** Command context */
  context?: CommandContext;
}

/**
 * Command categories
 */
export type CommandCategory = 
  | 'movement'      // Movement commands (go, move, etc.)
  | 'communication' // Communication (say, tell, etc.)
  | 'action'        // Game actions (get, put, etc.)
  | 'combat'        // Combat commands
  | 'magic'         // Spells and magic
  | 'system'        // System commands
  | 'social'        // Social interactions
  | 'crafting'      // Crafting and creation
  | 'guild'         // Guild-related commands
  | 'other';        // Other commands

/**
 * Command execution context
 */
export interface CommandContext {
  /** Room ID where command was executed */
  roomId?: string;
  
  /** Character state at execution */
  characterState?: Record<string, unknown>;
  
  /** Targets of the command */
  targets?: Array<string>;
  
  /** Command modifiers */
  modifiers?: Array<string>;
  
  /** Related commands */
  relatedCommands?: Array<string>;
}

/**
 * Command history configuration
 */
export interface CommandHistoryConfig {
  /** Save to persistent storage */
  saveToDisk: boolean;
  
  /** Filter out duplicate commands */
  filterDuplicates: boolean;
  
  /** Patterns to exclude from history */
  excludePatterns: Array<string>;
  
  /** Auto-categorize commands */
  autoCategorize: boolean;
  
  /** Command completion enabled */
  completionEnabled: boolean;
  
  /** History search enabled */
  searchEnabled: boolean;
  
  /** Export/import enabled */
  exportImportEnabled: boolean;
}

/**
 * Command history statistics
 */
export interface CommandHistoryStatistics {
  /** Total commands executed */
  totalCommands: number;
  
  /** Commands by category */
  commandsByCategory: Map<CommandCategory, number>;
  
  /** Most used commands */
  mostUsedCommands: Array<CommandUsageEntry>;
  
  /** Average commands per session */
  averageCommandsPerSession: number;
  
  /** Command frequency over time */
  frequencyOverTime: Array<CommandFrequencyEntry>;
}

/**
 * Command usage entry
 */
export interface CommandUsageEntry {
  /** Command text */
  command: string;
  
  /** Usage count */
  count: number;
  
  /** Last used timestamp */
  lastUsed: Date;
  
  /** Success rate percentage */
  successRate: number;
}

/**
 * Command frequency entry
 */
export interface CommandFrequencyEntry {
  /** Time period */
  timestamp: Date;
  
  /** Command count in this period */
  count: number;
  
  /** Period duration */
  duration: number;
}

/**
 * Command favorite
 */
export interface CommandFavorite {
  /** Favorite identifier */
  id: string;
  
  /** Favorite name */
  name: string;
  
  /** Command text */
  command: string;
  
  /** Favorite description */
  description?: string;
  
  /** Favorite category */
  category?: string;
  
  /** Keyboard shortcut */
  shortcut?: string;
  
  /** Usage count */
  usageCount: number;
  
  /** Created timestamp */
  created: Date;
  
  /** Last used timestamp */
  lastUsed?: Date;
}

/**
 * Session configuration
 */
export interface SessionConfiguration {
  /** Auto-save configuration */
  autoSave: SessionAutoSaveConfig;
  
  /** Logging configuration */
  logging: SessionLoggingConfig;
  
  /** Backup configuration */
  backup: SessionBackupConfig;
  
  /** Performance configuration */
  performance: SessionPerformanceConfig;
  
  /** Security configuration */
  security: SessionSecurityConfig;
}

/**
 * Auto-save configuration
 */
export interface SessionAutoSaveConfig {
  /** Auto-save enabled */
  enabled: boolean;
  
  /** Save interval in minutes */
  intervalMinutes: number;
  
  /** Maximum save files to keep */
  maxSaveFiles: number;
  
  /** Save on exit */
  saveOnExit: boolean;
  
  /** Save on error */
  saveOnError: boolean;
  
  /** Compress save files */
  compression: boolean;
}

/**
 * Logging configuration
 */
export interface SessionLoggingConfig {
  /** Logging enabled */
  enabled: boolean;
  
  /** Log level */
  level: 'debug' | 'info' | 'warn' | 'error';
  
  /** Log file rotation */
  rotation: boolean;
  
  /** Maximum log file size */
  maxFileSizeMB: number;
  
  /** Log file retention days */
  retentionDays: number;
  
  /** Include performance metrics */
  includePerformance: boolean;
}

/**
 * Backup configuration
 */
export interface SessionBackupConfig {
  /** Backup enabled */
  enabled: boolean;
  
  /** Backup interval in hours */
  intervalHours: number;
  
  /** Maximum backup files */
  maxBackupFiles: number;
  
  /** Remote backup location */
  remoteLocation?: string;
  
  /** Backup encryption */
  encryption: boolean;
  
  /** Incremental backups */
  incremental: boolean;
}

/**
 * Session performance configuration
 */
export interface SessionPerformanceConfig {
  /** Performance monitoring enabled */
  monitoringEnabled: boolean;
  
  /** Monitoring interval in seconds */
  monitoringIntervalSeconds: number;
  
  /** Performance alerting */
  alerting: boolean;
  
  /** Alert thresholds */
  thresholds: SessionPerformanceThresholds;
  
  /** Automatic optimization */
  autoOptimization: boolean;
}

/**
 * Performance thresholds
 */
export interface SessionPerformanceThresholds {
  /** Memory usage warning threshold */
  memoryWarningMB: number;
  
  /** Memory usage critical threshold */
  memoryCriticalMB: number;
  
  /** CPU usage warning threshold */
  cpuWarningPercent: number;
  
  /** Frame rate warning threshold */
  frameRateWarningFPS: number;
  
  /** Event processing time warning */
  eventProcessingWarningMs: number;
}

/**
 * Session security configuration
 */
export interface SessionSecurityConfig {
  /** Encryption enabled */
  encryptionEnabled: boolean;
  
  /** Session timeout in minutes */
  sessionTimeoutMinutes: number;
  
  /** Inactivity timeout in minutes */
  inactivityTimeoutMinutes: number;
  
  /** Secure storage */
  secureStorage: boolean;
  
  /** Audit logging */
  auditLogging: boolean;
  
  /** Access control */
  accessControl: SessionAccessControl;
}

/**
 * Session access control
 */
export interface SessionAccessControl {
  /** Authentication required */
  authenticationRequired: boolean;
  
  /** Authorization levels */
  authorizationLevels: Array<string>;
  
  /** IP address restrictions */
  ipRestrictions: Array<string>;
  
  /** Time-based restrictions */
  timeRestrictions?: SessionTimeRestriction;
}

/**
 * Time-based access restrictions
 */
export interface SessionTimeRestriction {
  /** Allowed start time */
  startTime: string;
  
  /** Allowed end time */
  endTime: string;
  
  /** Allowed days of week */
  allowedDays: Array<number>;
  
  /** Timezone */
  timezone: string;
}

/**
 * Session authentication state
 */
export interface SessionAuthenticationState {
  /** Authentication status */
  status: SessionAuthenticationStatus;
  
  /** Authentication timestamp */
  authenticatedAt?: Date;
  
  /** Authentication method */
  method: SessionAuthenticationMethod;
  
  /** User information */
  user?: SessionUserInfo;
  
  /** Authentication token */
  token?: SessionAuthenticationToken;
  
  /** Authentication history */
  history: Array<SessionAuthenticationHistoryEntry>;
}

/**
 * Authentication status
 */
export type SessionAuthenticationStatus = 
  | 'unauthenticated'
  | 'authenticating'
  | 'authenticated'
  | 'expired'
  | 'failed';

/**
 * Authentication methods
 */
export type SessionAuthenticationMethod = 
  | 'password'
  | 'token'
  | 'certificate'
  | 'biometric'
  | 'oauth'
  | 'sso';

/**
 * User information
 */
export interface SessionUserInfo {
  /** User identifier */
  id: string;
  
  /** Username */
  username: string;
  
  /** Display name */
  displayName?: string;
  
  /** Email address */
  email?: string;
  
  /** User roles */
  roles: Array<string>;
  
  /** User permissions */
  permissions: Array<string>;
  
  /** User preferences */
  preferences?: Record<string, unknown>;
}

/**
 * Authentication token
 */
export interface SessionAuthenticationToken {
  /** Token value */
  value: string;
  
  /** Token type */
  type: 'bearer' | 'jwt' | 'api_key' | 'session';
  
  /** Token expiration */
  expiresAt?: Date;
  
  /** Token scope */
  scope?: Array<string>;
  
  /** Refresh token */
  refreshToken?: string;
}

/**
 * Authentication history entry
 */
export interface SessionAuthenticationHistoryEntry {
  /** Entry timestamp */
  timestamp: Date;
  
  /** Authentication method used */
  method: SessionAuthenticationMethod;
  
  /** Authentication result */
  result: 'success' | 'failure';
  
  /** Failure reason */
  failureReason?: string;
  
  /** IP address */
  ipAddress?: string;
  
  /** User agent */
  userAgent?: string;
}

/**
 * Session state change event types
 */
export type SessionStateChangeType =
  | 'connection.status.changed'
  | 'connection.established'
  | 'connection.lost'
  | 'authentication.succeeded'
  | 'authentication.failed'
  | 'command.executed'
  | 'statistics.updated'
  | 'error.occurred'
  | 'performance.alert'
  | 'configuration.changed';

/**
 * Session state validator
 */
export interface SessionStateValidator {
  /** Validate connection configuration */
  validateConnection(connection: SessionConnectionState): Array<string>;
  
  /** Validate session identity */
  validateIdentity(identity: SessionIdentity): Array<string>;
  
  /** Validate command history */
  validateCommandHistory(history: SessionCommandHistory): Array<string>;
  
  /** Validate session configuration */
  validateConfiguration(config: SessionConfiguration): Array<string>;
}