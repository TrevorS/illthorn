// ABOUTME: Central export file for all centralized game state type definitions
// ABOUTME: Provides clean imports for the entire type system

// Root game state
export type {
  GameState,
  StateMetadata,
  StateDebugInfo,
  GameStateConfig,
  StateChangeEvent,
  StateChangeType,
  StateChangeListener,
  StateValidationResult,
  StateValidationError
} from "./game-state";

// Character state
export type {
  CharacterState,
  VitalsState,
  VitalData,
  VitalState,
  InjuriesState,
  RawInjury,
  InjurySeverity,
  ProcessedInjury,
  InjuryDisplayConfig,
  EffectsState,
  SpellEffectData,
  SpellEffectCategory,
  EffectTimer,
  EffectsConfig,
  EffectSortMode,
  EquipmentState,
  HandsState,
  HandData,
  HandItemType,
  CharacterIdentity,
  CharacterStatistics,
  CharacterStateChangeType,
  CharacterStateValidator
} from "./character";

// Environment state
export type {
  EnvironmentState,
  RoomState,
  RoomTag,
  RoomOccupant,
  RoomObject,
  ExitData,
  ExitType,
  ExitRequirement,
  CompassState,
  DirectionData,
  DirectionIndicator,
  CompassConfig,
  EnvironmentalConditions,
  WeatherCondition,
  TimeOfDay,
  MoonPhase,
  Season,
  VisibilityCondition,
  EnvironmentalEffect,
  NavigationState,
  NavigationHistoryEntry,
  NavigationBookmark,
  AreaInfo,
  NavigationPreferences,
  EnvironmentStateChangeType,
  EnvironmentStateValidator
} from "./environment";

// Game log and events
export type {
  GameLogStore,
  GameLogEvent,
  GameLogEventType,
  GameLogEventSource,
  GameLogEventCache,
  GameLogEventMeta,
  GameLogDisplayState,
  GameLogFilters,
  GameLogTimeRange,
  GameLogSearchState,
  GameLogSearchMode,
  GameLogSearchResult,
  GameLogSearchHighlight,
  GameLogSearchPerformance,
  GameLogHighlightState,
  HighlightGroup,
  HighlightPattern,
  HighlightStyle,
  GameLogVirtualizationConfig,
  GameLogScrollBehavior,
  GameLogDisplayPreferences,
  GameLogRetentionConfig,
  GameLogArchiveConfig,
  GameLogCache,
  GameLogSearchIndex,
  GameLogSearchIndexStats,
  GameLogCacheStats,
  GameLogCacheConfig,
  GameLogMetadata,
  GameLogStatistics,
  GameLogPerformanceMetrics,
  GameLogPerformanceSnapshot
} from "./game-log";

// Stream state
export type {
  StreamState,
  StreamConfig,
  StreamCategory,
  StreamData,
  StreamStatus,
  StreamSession,
  StreamSessionType,
  StreamStatistics,
  StreamFilters,
  StreamKeywordFilter,
  StreamRegexFilter,
  StreamCharacterFilter,
  StreamContentTypeFilter,
  StreamContentType,
  StreamTimeFilter,
  StreamAdvancedFilter,
  StreamDisplayConfig,
  StreamTimestampFormat,
  StreamCharacterNameFormat,
  StreamFontSize,
  StreamDisplayDensity,
  StreamHighlightConfig,
  StreamHighlightPattern,
  StreamHighlightStyle,
  StreamGlobalConfig,
  StreamMemoryManagement,
  StreamWindowManagement,
  StreamCrossStreamConfig,
  StreamMergeConfig,
  StreamCorrelationRule,
  StreamProcessingState,
  StreamProcessingTask,
  StreamProcessingStatistics,
  StreamProcessingError,
  StreamStateChangeType,
  StreamStateValidator
} from "./streams";

// UI state
export type {
  UIState,
  UIPanelState,
  UIHudPanelState,
  UIHudLayout,
  UIPanelSize,
  UIAutoCollapseConfig,
  UIStreamPanelState,
  UIStreamLayout,
  UIPosition,
  UIStreamGroup,
  UIUtilityPanelState,
  UICustomPanelState,
  UIGeometry,
  UIConstraints,
  UIPanelManagement,
  UIThemeState,
  UIThemeInfo,
  UIThemeCategory,
  UIThemeCustomization,
  UIThemeDarkMode,
  UIDarkModeSchedule,
  UIColorScheme,
  UITypography,
  UIFontWeight,
  UIAnimationConfig,
  UIAnimationSetting,
  UILayoutState,
  UILayoutMode,
  UILayoutPanelConfig,
  UIMargins,
  UIPadding,
  UIResponsiveConfig,
  UIBreakpoint,
  UIBreakpointConfig,
  UIResponsiveBehavior,
  UIGridConfig,
  UISpacingConfig,
  UIPreferences,
  UIAccessibilityConfig,
  UIFontSizeAdjustment,
  UIInteractionPreferences,
  UIContextMenuConfig,
  UIContextMenuItem,
  UIDevelopmentConfig,
  UIPerformanceConfig,
  UILocalizationConfig,
  UIViewportState,
  UIViewportDimensions,
  UIViewportType,
  UIOrientation,
  UIInteractionState,
  UIDragDropState,
  UIHoverState,
  UISelectionState,
  UIStateChangeType,
  UIStateValidator
} from "./ui-state";

// Session state
export type {
  SessionState,
  SessionConnectionState,
  SessionConnectionStatus,
  SessionConnectionConfig,
  SessionKeepAliveConfig,
  SessionSSLConfig,
  SessionNetworkState,
  SessionConnectionQuality,
  SessionNetworkInterface,
  SessionConnectionError,
  SessionConnectionErrorType,
  SessionConnectionHistoryEntry,
  SessionIdentity,
  SessionType,
  SessionSource,
  SessionStatistics,
  SessionPerformanceMetrics,
  SessionPerformanceSnapshot,
  SessionActivityMetrics,
  SessionActivityPattern,
  SessionErrorStatistics,
  SessionErrorEntry,
  SessionCommandHistory,
  CommandHistoryEntry,
  CommandCategory,
  CommandContext,
  CommandHistoryConfig,
  CommandHistoryStatistics,
  CommandUsageEntry,
  CommandFrequencyEntry,
  CommandFavorite,
  SessionConfiguration,
  SessionAutoSaveConfig,
  SessionLoggingConfig,
  SessionBackupConfig,
  SessionPerformanceConfig,
  SessionPerformanceThresholds,
  SessionSecurityConfig,
  SessionAccessControl,
  SessionTimeRestriction,
  SessionAuthenticationState,
  SessionAuthenticationStatus,
  SessionAuthenticationMethod,
  SessionUserInfo,
  SessionAuthenticationToken,
  SessionAuthenticationHistoryEntry,
  SessionStateChangeType,
  SessionStateValidator
} from "./session";

// Convenience type unions for common use cases
export type AnyStateChangeType = 
  | StateChangeType
  | CharacterStateChangeType
  | EnvironmentStateChangeType
  | StreamStateChangeType
  | UIStateChangeType
  | SessionStateChangeType;

export type AnyStateValidator = 
  | CharacterStateValidator
  | EnvironmentStateValidator
  | StreamStateValidator
  | UIStateValidator
  | SessionStateValidator;

// Utility types for working with the state system
export type StateSelector<T> = (state: GameState) => T;
export type StateUpdater<T> = (currentValue: T) => T;
export type StatePatch<T> = Partial<T>;

// Event types for the centralized store
export type StoreEvent = 
  | StateChangeEvent
  | GameLogEvent;

// Store configuration type
export type StoreConfig = GameStateConfig & {
  /** Enable development mode features */
  developmentMode: boolean;
  
  /** Store name for debugging */
  storeName: string;
  
  /** Initial state override */
  initialState?: Partial<GameState>;
};