// ABOUTME: UI state interfaces for themes, panels, layout, and user preferences
// ABOUTME: Manages visual presentation and user experience configuration

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
  
  /** Window and viewport state */
  viewport: UIViewportState;
  
  /** Interaction state */
  interaction: UIInteractionState;
}

/**
 * Panel visibility and configuration
 */
export interface UIPanelState {
  /** HUD panels (left sidebar) */
  hud: UIHudPanelState;
  
  /** Stream panels */
  streams: UIStreamPanelState;
  
  /** Utility panels */
  utility: UIUtilityPanelState;
  
  /** Custom panels */
  custom: Map<string, UICustomPanelState>;
  
  /** Panel management settings */
  management: UIPanelManagement;
}

/**
 * HUD panel state (left sidebar panels)
 */
export interface UIHudPanelState {
  /** Vitals panel visibility */
  vitals: boolean;
  
  /** Injuries panel visibility */
  injuries: boolean;
  
  /** Active effects panel visibility */
  effects: boolean;
  
  /** Compass panel visibility */
  compass: boolean;
  
  /** Room information panel visibility */
  room: boolean;
  
  /** Character hands panel visibility */
  hands: boolean;
  
  /** Panel order and layout */
  layout: UIHudLayout;
}

/**
 * HUD panel layout configuration
 */
export interface UIHudLayout {
  /** Panel order from top to bottom */
  panelOrder: Array<string>;
  
  /** Collapsible panel states */
  collapsed: Map<string, boolean>;
  
  /** Panel sizes */
  sizes: Map<string, UIPanelSize>;
  
  /** Auto-collapse behavior */
  autoCollapse: UIAutoCollapseConfig;
}

/**
 * Panel size configuration
 */
export interface UIPanelSize {
  /** Width in pixels or percentage */
  width?: number | string;
  
  /** Height in pixels or percentage */
  height?: number | string;
  
  /** Minimum size constraints */
  minWidth?: number;
  minHeight?: number;
  
  /** Maximum size constraints */
  maxWidth?: number;
  maxHeight?: number;
  
  /** Whether panel can be resized */
  resizable: boolean;
}

/**
 * Auto-collapse configuration
 */
export interface UIAutoCollapseConfig {
  /** Enable auto-collapse */
  enabled: boolean;
  
  /** Collapse based on viewport size */
  collapseOnSmallScreen: boolean;
  
  /** Screen size threshold for auto-collapse */
  screenSizeThreshold: number;
  
  /** Collapse based on inactivity */
  collapseOnInactivity: boolean;
  
  /** Inactivity timeout in minutes */
  inactivityTimeoutMinutes: number;
}

/**
 * Stream panel state
 */
export interface UIStreamPanelState {
  /** Speech panel visibility */
  speech: boolean;
  
  /** Thoughts panel visibility */
  thoughts: boolean;
  
  /** Logons panel visibility */
  logons: boolean;
  
  /** Logoffs panel visibility */
  logoffs: boolean;
  
  /** Death messages panel visibility */
  death: boolean;
  
  /** Inventory stream panel visibility */
  inventory: boolean;
  
  /** Custom stream panels */
  custom: Map<string, boolean>;
  
  /** Stream panel layout */
  layout: UIStreamLayout;
}

/**
 * Stream panel layout configuration
 */
export interface UIStreamLayout {
  /** Panel arrangement */
  arrangement: 'tabs' | 'stack' | 'grid' | 'split';
  
  /** Panel positions */
  positions: Map<string, UIPosition>;
  
  /** Panel grouping */
  groups: Array<UIStreamGroup>;
  
  /** Default panel size */
  defaultSize: UIPanelSize;
}

/**
 * UI position configuration
 */
export interface UIPosition {
  /** X coordinate or percentage */
  x: number | string;
  
  /** Y coordinate or percentage */
  y: number | string;
  
  /** Z-index for layering */
  zIndex?: number;
  
  /** Position type */
  type: 'absolute' | 'relative' | 'fixed' | 'sticky';
}

/**
 * Stream panel grouping
 */
export interface UIStreamGroup {
  /** Group identifier */
  id: string;
  
  /** Group name */
  name: string;
  
  /** Streams in this group */
  streamIds: Array<string>;
  
  /** Group layout */
  layout: 'tabs' | 'split' | 'overlay';
  
  /** Group position */
  position: UIPosition;
  
  /** Group enabled state */
  enabled: boolean;
}

/**
 * Utility panel state
 */
export interface UIUtilityPanelState {
  /** Debug panel visibility */
  debug: boolean;
  
  /** Settings panel visibility */
  settings: boolean;
  
  /** Help panel visibility */
  help: boolean;
  
  /** Command history panel visibility */
  commandHistory: boolean;
  
  /** Performance monitor visibility */
  performance: boolean;
  
  /** Search panel visibility */
  search: boolean;
  
  /** State inspector visibility */
  stateInspector: boolean;
}

/**
 * Custom panel state
 */
export interface UICustomPanelState {
  /** Panel identifier */
  id: string;
  
  /** Panel name */
  name: string;
  
  /** Panel visibility */
  visible: boolean;
  
  /** Panel content type */
  contentType: string;
  
  /** Panel configuration */
  config: Record<string, unknown>;
  
  /** Panel position and size */
  geometry: UIGeometry;
}

/**
 * UI geometry (position and size)
 */
export interface UIGeometry {
  /** Position */
  position: UIPosition;
  
  /** Size */
  size: UIPanelSize;
  
  /** Constraints */
  constraints?: UIConstraints;
}

/**
 * UI constraints
 */
export interface UIConstraints {
  /** Minimum width */
  minWidth?: number;
  
  /** Minimum height */
  minHeight?: number;
  
  /** Maximum width */
  maxWidth?: number;
  
  /** Maximum height */
  maxHeight?: number;
  
  /** Aspect ratio lock */
  aspectRatio?: number;
  
  /** Snap to grid */
  snapToGrid?: boolean;
  
  /** Grid size */
  gridSize?: number;
}

/**
 * Panel management configuration
 */
export interface UIPanelManagement {
  /** Enable panel dragging */
  enableDragging: boolean;
  
  /** Enable panel resizing */
  enableResizing: boolean;
  
  /** Enable panel docking */
  enableDocking: boolean;
  
  /** Panel animation duration */
  animationDurationMs: number;
  
  /** Auto-save layout changes */
  autoSaveLayout: boolean;
  
  /** Layout save interval in minutes */
  saveIntervalMinutes: number;
}

/**
 * Theme and appearance state
 */
export interface UIThemeState {
  /** Current theme name */
  current: string;
  
  /** Available themes */
  available: Array<UIThemeInfo>;
  
  /** Custom theme overrides */
  customizations: Map<string, UIThemeCustomization>;
  
  /** Dark mode preference */
  darkMode: UIThemeDarkMode;
  
  /** Color scheme */
  colorScheme: UIColorScheme;
  
  /** Typography configuration */
  typography: UITypography;
  
  /** Animation preferences */
  animations: UIAnimationConfig;
}

/**
 * Theme information
 */
export interface UIThemeInfo {
  /** Theme identifier */
  id: string;
  
  /** Theme display name */
  name: string;
  
  /** Theme description */
  description?: string;
  
  /** Theme author */
  author?: string;
  
  /** Theme version */
  version?: string;
  
  /** Theme preview image */
  preview?: string;
  
  /** Theme category */
  category: UIThemeCategory;
  
  /** Base theme (if this is a variant) */
  baseTheme?: string;
  
  /** Whether theme supports dark mode */
  supportsDarkMode: boolean;
}

/**
 * Theme categories
 */
export type UIThemeCategory = 
  | 'classic'    // Traditional MUD themes
  | 'modern'     // Modern UI themes
  | 'fantasy'    // Fantasy/medieval themes
  | 'scifi'      // Science fiction themes
  | 'minimal'    // Minimalist themes
  | 'custom'     // User-created themes
  | 'seasonal';  // Seasonal/holiday themes

/**
 * Theme customization
 */
export interface UIThemeCustomization {
  /** Customization identifier */
  id: string;
  
  /** Customization name */
  name: string;
  
  /** CSS property being customized */
  property: string;
  
  /** Custom value */
  value: string;
  
  /** Original value */
  originalValue?: string;
  
  /** Customization enabled state */
  enabled: boolean;
}

/**
 * Dark mode configuration
 */
export interface UIThemeDarkMode {
  /** Dark mode preference */
  preference: 'light' | 'dark' | 'auto' | 'system';
  
  /** Auto-switch based on time */
  autoSwitch: boolean;
  
  /** Auto-switch schedule */
  schedule?: UIDarkModeSchedule;
  
  /** Current effective mode */
  current: 'light' | 'dark';
}

/**
 * Dark mode schedule
 */
export interface UIDarkModeSchedule {
  /** Enable schedule */
  enabled: boolean;
  
  /** Dark mode start time */
  darkStart: string;
  
  /** Dark mode end time */
  darkEnd: string;
  
  /** Use sunset/sunrise times */
  useSolarTimes: boolean;
  
  /** Location for solar calculations */
  location?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Color scheme configuration
 */
export interface UIColorScheme {
  /** Primary color */
  primary: string;
  
  /** Secondary color */
  secondary: string;
  
  /** Accent color */
  accent: string;
  
  /** Background color */
  background: string;
  
  /** Surface color */
  surface: string;
  
  /** Text color */
  text: string;
  
  /** Error color */
  error: string;
  
  /** Warning color */
  warning: string;
  
  /** Success color */
  success: string;
  
  /** Info color */
  info: string;
}

/**
 * Typography configuration
 */
export interface UITypography {
  /** Base font family */
  fontFamily: string;
  
  /** Monospace font family */
  monospaceFontFamily: string;
  
  /** Base font size */
  fontSize: number;
  
  /** Font size scale */
  fontScale: number;
  
  /** Line height */
  lineHeight: number;
  
  /** Letter spacing */
  letterSpacing: number;
  
  /** Font weight */
  fontWeight: UIFontWeight;
}

/**
 * Font weight configuration
 */
export interface UIFontWeight {
  /** Normal text weight */
  normal: number;
  
  /** Bold text weight */
  bold: number;
  
  /** Light text weight */
  light: number;
  
  /** Medium text weight */
  medium: number;
}

/**
 * Animation configuration
 */
export interface UIAnimationConfig {
  /** Enable animations globally */
  enabled: boolean;
  
  /** Reduce motion preference */
  reduceMotion: boolean;
  
  /** Animation duration scale */
  durationScale: number;
  
  /** Animation easing function */
  easing: string;
  
  /** Specific animation settings */
  animations: Map<string, UIAnimationSetting>;
}

/**
 * Individual animation setting
 */
export interface UIAnimationSetting {
  /** Animation name */
  name: string;
  
  /** Animation enabled */
  enabled: boolean;
  
  /** Animation duration in milliseconds */
  duration: number;
  
  /** Animation easing */
  easing?: string;
  
  /** Animation delay */
  delay?: number;
}

/**
 * Layout configuration
 */
export interface UILayoutState {
  /** Main layout mode */
  mode: UILayoutMode;
  
  /** Panel sizes and positions */
  panelLayout: UILayoutPanelConfig;
  
  /** Responsive breakpoints */
  responsive: UIResponsiveConfig;
  
  /** Grid system configuration */
  grid: UIGridConfig;
  
  /** Spacing configuration */
  spacing: UISpacingConfig;
}

/**
 * Layout modes
 */
export type UILayoutMode = 
  | 'standard'   // Traditional MUD layout
  | 'compact'    // Space-efficient layout
  | 'minimal'    // Minimal UI elements
  | 'immersive'  // Full-screen focus mode
  | 'custom';    // User-defined layout

/**
 * Layout panel configuration
 */
export interface UILayoutPanelConfig {
  /** HUD panel width */
  hudWidth: number;
  
  /** Stream panel height */
  streamHeight: number;
  
  /** Main feed height */
  feedHeight: number;
  
  /** Command bar height */
  commandBarHeight: number;
  
  /** Panel margins */
  margins: UIMargins;
  
  /** Panel padding */
  padding: UIPadding;
}

/**
 * UI margins
 */
export interface UIMargins {
  /** Top margin */
  top: number;
  
  /** Right margin */
  right: number;
  
  /** Bottom margin */
  bottom: number;
  
  /** Left margin */
  left: number;
}

/**
 * UI padding
 */
export interface UIPadding {
  /** Top padding */
  top: number;
  
  /** Right padding */
  right: number;
  
  /** Bottom padding */
  bottom: number;
  
  /** Left padding */
  left: number;
}

/**
 * Responsive configuration
 */
export interface UIResponsiveConfig {
  /** Current breakpoint */
  currentBreakpoint: UIBreakpoint;
  
  /** Enable adaptive layout */
  adaptiveLayout: boolean;
  
  /** Breakpoint definitions */
  breakpoints: Map<UIBreakpoint, UIBreakpointConfig>;
  
  /** Responsive behavior settings */
  behavior: UIResponsiveBehavior;
}

/**
 * UI breakpoints
 */
export type UIBreakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide' | 'ultrawide';

/**
 * Breakpoint configuration
 */
export interface UIBreakpointConfig {
  /** Minimum width for this breakpoint */
  minWidth: number;
  
  /** Maximum width for this breakpoint */
  maxWidth?: number;
  
  /** Layout adjustments for this breakpoint */
  layout: Partial<UILayoutState>;
  
  /** Panel adjustments */
  panels: Partial<UIPanelState>;
}

/**
 * Responsive behavior configuration
 */
export interface UIResponsiveBehavior {
  /** Auto-hide panels on small screens */
  autoHidePanels: boolean;
  
  /** Collapse navigation on mobile */
  collapseNavigation: boolean;
  
  /** Use mobile-optimized touch targets */
  mobileOptimized: boolean;
  
  /** Responsive font scaling */
  responsiveFonts: boolean;
}

/**
 * Grid system configuration
 */
export interface UIGridConfig {
  /** Enable grid system */
  enabled: boolean;
  
  /** Grid columns */
  columns: number;
  
  /** Grid gutter size */
  gutterSize: number;
  
  /** Grid container width */
  containerWidth: number;
  
  /** Grid breakpoint behavior */
  breakpointColumns: Map<UIBreakpoint, number>;
}

/**
 * Spacing configuration
 */
export interface UISpacingConfig {
  /** Base spacing unit */
  baseUnit: number;
  
  /** Spacing scale */
  scale: Array<number>;
  
  /** Component spacing */
  components: Map<string, number>;
  
  /** Consistent spacing enabled */
  consistent: boolean;
}

/**
 * User preferences
 */
export interface UIPreferences {
  /** Accessibility settings */
  accessibility: UIAccessibilityConfig;
  
  /** Interaction preferences */
  interaction: UIInteractionPreferences;
  
  /** Development preferences */
  development: UIDevelopmentConfig;
  
  /** Performance preferences */
  performance: UIPerformanceConfig;
  
  /** Localization preferences */
  localization: UILocalizationConfig;
}

/**
 * Accessibility configuration
 */
export interface UIAccessibilityConfig {
  /** High contrast mode */
  highContrast: boolean;
  
  /** Reduced motion preference */
  reducedMotion: boolean;
  
  /** Font size adjustment */
  fontSize: UIFontSizeAdjustment;
  
  /** Screen reader support */
  screenReader: boolean;
  
  /** Keyboard navigation mode */
  keyboardNavigation: boolean;
  
  /** Focus indicators */
  focusIndicators: boolean;
  
  /** Color blind assistance */
  colorBlindAssist: boolean;
}

/**
 * Font size adjustment
 */
export type UIFontSizeAdjustment = 'smaller' | 'small' | 'normal' | 'large' | 'larger';

/**
 * Interaction preferences
 */
export interface UIInteractionPreferences {
  /** Click-to-move enabled */
  clickToMove: boolean;
  
  /** Double-click for commands */
  doubleClickCommands: boolean;
  
  /** Keyboard shortcuts enabled */
  keyboardShortcuts: boolean;
  
  /** Mouse hover delays */
  hoverDelay: number;
  
  /** Touch gesture support */
  touchGestures: boolean;
  
  /** Drag and drop enabled */
  dragAndDrop: boolean;
  
  /** Context menu behavior */
  contextMenu: UIContextMenuConfig;
}

/**
 * Context menu configuration
 */
export interface UIContextMenuConfig {
  /** Enable context menus */
  enabled: boolean;
  
  /** Context menu delay */
  delay: number;
  
  /** Show keyboard shortcuts in menu */
  showShortcuts: boolean;
  
  /** Custom menu items */
  customItems: Array<UIContextMenuItem>;
}

/**
 * Context menu item
 */
export interface UIContextMenuItem {
  /** Item identifier */
  id: string;
  
  /** Item label */
  label: string;
  
  /** Item icon */
  icon?: string;
  
  /** Item action */
  action: string;
  
  /** Item enabled state */
  enabled: boolean;
  
  /** Item visibility condition */
  condition?: string;
}

/**
 * Development configuration
 */
export interface UIDevelopmentConfig {
  /** Show debug information */
  showDebugInfo: boolean;
  
  /** Enable verbose logging */
  enableVerboseLogging: boolean;
  
  /** Show performance metrics */
  showPerformanceMetrics: boolean;
  
  /** Enable hot reload */
  enableHotReload: boolean;
  
  /** Show component boundaries */
  showComponentBoundaries: boolean;
  
  /** Enable state inspector */
  enableStateInspector: boolean;
}

/**
 * Performance configuration
 */
export interface UIPerformanceConfig {
  /** Enable virtualization */
  enableVirtualization: boolean;
  
  /** Virtualization threshold */
  virtualizationThreshold: number;
  
  /** Enable memoization */
  enableMemoization: boolean;
  
  /** Lazy loading enabled */
  lazyLoading: boolean;
  
  /** Image optimization */
  imageOptimization: boolean;
  
  /** Bundle optimization */
  bundleOptimization: boolean;
}

/**
 * Localization configuration
 */
export interface UILocalizationConfig {
  /** Current language */
  language: string;
  
  /** Available languages */
  availableLanguages: Array<string>;
  
  /** Date format */
  dateFormat: string;
  
  /** Time format */
  timeFormat: string;
  
  /** Number format */
  numberFormat: string;
  
  /** Currency format */
  currencyFormat?: string;
  
  /** Text direction */
  textDirection: 'ltr' | 'rtl';
}

/**
 * Viewport state
 */
export interface UIViewportState {
  /** Viewport dimensions */
  dimensions: UIViewportDimensions;
  
  /** Viewport type */
  type: UIViewportType;
  
  /** Orientation */
  orientation: UIOrientation;
  
  /** Scale factor */
  scaleFactor: number;
  
  /** Full screen state */
  fullScreen: boolean;
}

/**
 * Viewport dimensions
 */
export interface UIViewportDimensions {
  /** Viewport width */
  width: number;
  
  /** Viewport height */
  height: number;
  
  /** Available width (minus scrollbars) */
  availableWidth: number;
  
  /** Available height (minus scrollbars) */
  availableHeight: number;
  
  /** Device pixel ratio */
  devicePixelRatio: number;
}

/**
 * Viewport type
 */
export type UIViewportType = 'desktop' | 'tablet' | 'mobile' | 'tv' | 'unknown';

/**
 * Orientation
 */
export type UIOrientation = 'portrait' | 'landscape';

/**
 * Interaction state
 */
export interface UIInteractionState {
  /** Currently focused element */
  focusedElement?: string;
  
  /** Active modal or dialog */
  activeModal?: string;
  
  /** Drag and drop state */
  dragDrop?: UIDragDropState;
  
  /** Hover state */
  hover?: UIHoverState;
  
  /** Selection state */
  selection?: UISelectionState;
}

/**
 * Drag and drop state
 */
export interface UIDragDropState {
  /** Currently dragging */
  dragging: boolean;
  
  /** Dragged element */
  element?: string;
  
  /** Drag data */
  data?: unknown;
  
  /** Valid drop targets */
  validTargets: Array<string>;
  
  /** Current drop target */
  currentTarget?: string;
}

/**
 * Hover state
 */
export interface UIHoverState {
  /** Currently hovered element */
  element?: string;
  
  /** Hover start time */
  startTime?: Date;
  
  /** Hover position */
  position?: {
    x: number;
    y: number;
  };
}

/**
 * Selection state
 */
export interface UISelectionState {
  /** Selected elements */
  elements: Array<string>;
  
  /** Selection type */
  type: 'single' | 'multiple' | 'range';
  
  /** Selection anchor */
  anchor?: string;
  
  /** Selection focus */
  focus?: string;
}

/**
 * UI state change event types
 */
export type UIStateChangeType =
  | 'panel.toggled'
  | 'panel.resized'
  | 'panel.moved'
  | 'theme.changed'
  | 'layout.changed'
  | 'preferences.updated'
  | 'viewport.resized'
  | 'interaction.started'
  | 'interaction.ended';

/**
 * UI state validator
 */
export interface UIStateValidator {
  /** Validate panel configuration */
  validatePanels(panels: UIPanelState): Array<string>;
  
  /** Validate theme configuration */
  validateTheme(theme: UIThemeState): Array<string>;
  
  /** Validate layout configuration */
  validateLayout(layout: UILayoutState): Array<string>;
  
  /** Validate preferences */
  validatePreferences(preferences: UIPreferences): Array<string>;
}