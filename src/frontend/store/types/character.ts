// ABOUTME: Character state interfaces including vitals, injuries, effects, and equipment
// ABOUTME: Compatible with existing component interfaces while enabling centralized state management

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
  state?: VitalState;
}

/**
 * Visual state enumeration for vitals
 */
export type VitalState = 'normal' | 'warning' | 'critical' | 'indeterminate';

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
  display: InjuryDisplayConfig;
}

/**
 * Raw injury data as received from game
 */
export interface RawInjury {
  /** Body part identifier (e.g., "rightArm", "head") */
  part: string;
  
  /** Injury severity level */
  severity: InjurySeverity;
  
  /** Full injury description from game */
  description: string;
  
  /** Timestamp when injury was recorded */
  timestamp: Date;
}

/**
 * Injury severity levels
 */
export type InjurySeverity = 0 | 1 | 2 | 3;

/**
 * Processed injury with pairing and display logic applied
 */
export interface ProcessedInjury {
  /** Display name for UI (e.g., "r.arm", "head") */
  displayName: string;
  
  /** Current severity level */
  severity: InjurySeverity;
  
  /** Whether this represents paired limbs */
  paired: boolean;
  
  /** Left limb severity (for paired injuries) */
  leftSeverity?: InjurySeverity;
  
  /** Right limb severity (for paired injuries) */
  rightSeverity?: InjurySeverity;
  
  /** Anatomical ordering index for head-to-toe display */
  anatomicalOrder: number;
  
  /** Last update timestamp */
  lastUpdated: Date;
}

/**
 * Injury display configuration
 */
export interface InjuryDisplayConfig {
  /** Body part display name mappings */
  bodyPartNames: Map<string, string>;
  
  /** Severity level color mappings */
  severityColors: Map<InjurySeverity, string>;
  
  /** Enable left/right pairing logic */
  enablePairing: boolean;
  
  /** Anatomical ordering for display */
  anatomicalOrder: Array<string>;
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
  config: EffectsConfig;
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
  category?: SpellEffectCategory;
  
  /** Last update timestamp */
  lastUpdated?: Date;
}

/**
 * Spell effect categories
 */
export type SpellEffectCategory = 'offensive' | 'defensive' | 'utility' | 'other';

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
 * Effects configuration
 */
export interface EffectsConfig {
  /** Maximum number of expired effects to retain */
  maxExpiredRetention: number;
  
  /** Enable countdown timers */
  enableTimers: boolean;
  
  /** Sorting preference */
  sortBy: EffectSortMode;
  
  /** Auto-remove expired effects */
  autoRemoveExpired: boolean;
  
  /** Timer update interval in milliseconds */
  timerUpdateIntervalMs: number;
}

/**
 * Effect sorting modes
 */
export type EffectSortMode = 'duration' | 'name' | 'severity' | 'category';

/**
 * Equipment and inventory state
 */
export interface EquipmentState {
  /** Character's hands and held items */
  hands: HandsState;
  
  /** Future extensions for full equipment */
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
  type?: HandItemType;
  
  /** Item properties or attributes */
  properties?: Map<string, string>;
}

/**
 * Hand item type classification
 */
export type HandItemType = 'weapon' | 'shield' | 'spell' | 'tool' | 'other';

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
  
  /** Character creation or first seen timestamp */
  firstSeen?: Date;
  
  /** Character statistics if available */
  statistics?: CharacterStatistics;
}

/**
 * Character statistics (future extension)
 */
export interface CharacterStatistics {
  /** Strength */
  strength?: number;
  
  /** Constitution */
  constitution?: number;
  
  /** Dexterity */
  dexterity?: number;
  
  /** Agility */
  agility?: number;
  
  /** Discipline */
  discipline?: number;
  
  /** Aura */
  aura?: number;
  
  /** Logic */
  logic?: number;
  
  /** Intuition */
  intuition?: number;
  
  /** Wisdom */
  wisdom?: number;
  
  /** Influence */
  influence?: number;
}

/**
 * Character state update event types
 */
export type CharacterStateChangeType =
  | 'vitals.updated'
  | 'injury.added'
  | 'injury.removed'
  | 'injury.healed'
  | 'effect.added'
  | 'effect.removed'
  | 'effect.expired'
  | 'hands.changed'
  | 'spell.prepared'
  | 'identity.updated';

/**
 * Character state validation rules
 */
export interface CharacterStateValidator {
  /** Validate vital data consistency */
  validateVitals(vitals: VitalsState): Array<string>;
  
  /** Validate injury data integrity */
  validateInjuries(injuries: InjuriesState): Array<string>;
  
  /** Validate effect timer consistency */
  validateEffects(effects: EffectsState): Array<string>;
  
  /** Validate equipment state */
  validateEquipment(equipment: EquipmentState): Array<string>;
}