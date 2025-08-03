// ABOUTME: Environment state interfaces for room, compass, and navigation data
// ABOUTME: Handles current location, exits, and environmental conditions

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
  
  /** Navigation history and bookmarks */
  navigation?: NavigationState;
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
  tags?: Array<RoomTag>;
  
  /** Players and NPCs in the room */
  occupants?: Array<RoomOccupant>;
  
  /** Room objects and items */
  objects?: Array<RoomObject>;
}

/**
 * Room classification tags
 */
export type RoomTag = 
  | 'safe'        // Safe room (no combat)
  | 'shop'        // Shop or merchant location
  | 'town'        // Town or city area
  | 'wilderness'  // Outdoor wilderness
  | 'dungeon'     // Underground or dungeon
  | 'water'       // Water/swimming required
  | 'special'     // Special mechanics room
  | 'pvp'         // Player vs player enabled
  | 'no-magic'    // Magic restricted
  | 'sanctuary';  // Sanctuary/temple

/**
 * Room occupant (player or NPC)
 */
export interface RoomOccupant {
  /** Name or identifier */
  name: string;
  
  /** Type of occupant */
  type: 'player' | 'npc' | 'creature';
  
  /** Visible description */
  description?: string;
  
  /** Whether hostile */
  hostile?: boolean;
  
  /** Last seen timestamp */
  lastSeen: Date;
}

/**
 * Room object or item
 */
export interface RoomObject {
  /** Object name */
  name: string;
  
  /** Object description */
  description?: string;
  
  /** Whether object can be interacted with */
  interactive?: boolean;
  
  /** Object type */
  type?: 'item' | 'furniture' | 'decoration' | 'container';
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
  type?: ExitType;
  
  /** Movement requirements */
  requirements?: ExitRequirement;
  
  /** Exit description or special notes */
  description?: string;
}

/**
 * Exit type classification
 */
export type ExitType = 
  | 'standard'   // Normal exit
  | 'portal'     // Portal or magical transport
  | 'special'    // Special movement required
  | 'climb'      // Climbing required
  | 'swim'       // Swimming required
  | 'locked'     // Locked or blocked
  | 'quest';     // Quest-restricted

/**
 * Movement requirements for exits
 */
export interface ExitRequirement {
  /** Required skill or ability */
  skill?: string;
  
  /** Minimum skill level */
  skillLevel?: number;
  
  /** Required item or key */
  requiredItem?: string;
  
  /** Quest or story requirement */
  questRequirement?: string;
  
  /** Other conditions */
  conditions?: Array<string>;
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
  config: CompassConfig;
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
  indicator?: DirectionIndicator;
  
  /** Direction priority for display ordering */
  priority?: number;
}

/**
 * Visual indicator types for directions
 */
export type DirectionIndicator = 
  | 'standard'   // Normal exit
  | 'special'    // Special or notable exit
  | 'blocked'    // Blocked or restricted
  | 'dangerous'  // Dangerous area warning
  | 'quest'      // Quest-related
  | 'new';       // Recently discovered

/**
 * Compass configuration
 */
export interface CompassConfig {
  /** Show hidden exits */
  showHidden: boolean;
  
  /** Highlight available exits */
  highlightExits: boolean;
  
  /** Enable click-to-move functionality */
  enableClickToMove: boolean;
  
  /** Show direction indicators */
  showIndicators: boolean;
  
  /** Compass display style */
  displayStyle: 'grid' | 'list' | 'rose';
}

/**
 * Environmental conditions (weather, time, etc.)
 */
export interface EnvironmentalConditions {
  /** Current weather conditions */
  weather?: WeatherCondition;
  
  /** Temperature description */
  temperature?: string;
  
  /** Time of day */
  timeOfDay?: TimeOfDay;
  
  /** Moon phase */
  moonPhase?: MoonPhase;
  
  /** Season */
  season?: Season;
  
  /** Visibility conditions */
  visibility?: VisibilityCondition;
  
  /** Special environmental effects */
  effects?: Array<EnvironmentalEffect>;
}

/**
 * Weather condition types
 */
export type WeatherCondition = 
  | 'clear'
  | 'cloudy'
  | 'overcast'
  | 'rain'
  | 'storm'
  | 'snow'
  | 'fog'
  | 'mist'
  | 'wind';

/**
 * Time of day periods
 */
export type TimeOfDay = 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night' | 'midnight';

/**
 * Moon phases
 */
export type MoonPhase = 'new' | 'waxing' | 'full' | 'waning';

/**
 * Seasonal periods
 */
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

/**
 * Visibility conditions
 */
export type VisibilityCondition = 'clear' | 'dim' | 'dark' | 'blind';

/**
 * Environmental effects
 */
export interface EnvironmentalEffect {
  /** Effect name */
  name: string;
  
  /** Effect description */
  description: string;
  
  /** Effect type */
  type: 'positive' | 'negative' | 'neutral';
  
  /** Duration if temporary */
  duration?: number;
  
  /** Effect intensity */
  intensity?: 'minor' | 'moderate' | 'major';
}

/**
 * Navigation state and history
 */
export interface NavigationState {
  /** Recent room history */
  history: Array<NavigationHistoryEntry>;
  
  /** Bookmarked locations */
  bookmarks: Array<NavigationBookmark>;
  
  /** Known area map data */
  knownAreas: Map<string, AreaInfo>;
  
  /** Navigation preferences */
  preferences: NavigationPreferences;
}

/**
 * Navigation history entry
 */
export interface NavigationHistoryEntry {
  /** Room identifier */
  roomId: string;
  
  /** Room title */
  roomTitle: string;
  
  /** Visit timestamp */
  timestamp: Date;
  
  /** How the room was entered */
  entryMethod?: string;
}

/**
 * Navigation bookmark
 */
export interface NavigationBookmark {
  /** Bookmark name */
  name: string;
  
  /** Room identifier */
  roomId: string;
  
  /** Room title */
  roomTitle: string;
  
  /** Bookmark notes */
  notes?: string;
  
  /** Bookmark category */
  category?: string;
  
  /** Creation timestamp */
  created: Date;
}

/**
 * Area information for mapping
 */
export interface AreaInfo {
  /** Area identifier */
  id: string;
  
  /** Area name */
  name: string;
  
  /** Area type */
  type: 'town' | 'wilderness' | 'dungeon' | 'special';
  
  /** Rooms in this area */
  rooms: Set<string>;
  
  /** Area connections */
  connections: Array<string>;
  
  /** Last exploration timestamp */
  lastExplored: Date;
}

/**
 * Navigation preferences
 */
export interface NavigationPreferences {
  /** Automatically bookmark important locations */
  autoBookmark: boolean;
  
  /** Maximum history entries to keep */
  maxHistoryEntries: number;
  
  /** Enable area mapping */
  enableMapping: boolean;
  
  /** Show travel time estimates */
  showTravelTime: boolean;
  
  /** Preferred movement speed */
  movementSpeed: 'walk' | 'run' | 'sneak';
}

/**
 * Environment state change event types
 */
export type EnvironmentStateChangeType =
  | 'room.entered'
  | 'room.updated'
  | 'exits.changed'
  | 'compass.updated'
  | 'weather.changed'
  | 'time.changed'
  | 'bookmark.added'
  | 'area.discovered';

/**
 * Environment state validator
 */
export interface EnvironmentStateValidator {
  /** Validate room data consistency */
  validateRoom(room: RoomState): Array<string>;
  
  /** Validate compass directions */
  validateCompass(compass: CompassState): Array<string>;
  
  /** Validate navigation data */
  validateNavigation(navigation: NavigationState): Array<string>;
}