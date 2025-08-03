// ABOUTME: Root game state interface and metadata types for centralized state management
// ABOUTME: Defines the single source of truth for all game session data

import type { CharacterState } from "./character";
import type { EnvironmentState } from "./environment";
import type { GameLogStore } from "./game-log";
import type { StreamState } from "./streams";
import type { UIState } from "./ui-state";
import type { SessionState } from "./session";

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
  debug?: StateDebugInfo;
}

/**
 * Development and debugging information
 */
export interface StateDebugInfo {
  /** Total number of events processed */
  eventCount: number;
  
  /** Current memory usage in bytes */
  memoryUsage: number;
  
  /** Sequence number of last processed event */
  lastEventSequence: number;
  
  /** Performance timing information */
  performance: {
    /** Average time to process an event (ms) */
    avgEventProcessingTime: number;
    
    /** Average time to derive UI state (ms) */
    avgStateDerivationTime: number;
    
    /** Number of state updates in last minute */
    recentUpdateCount: number;
  };
}

/**
 * Game state store configuration
 */
export interface GameStateConfig {
  /** Enable development debugging features */
  enableDebug: boolean;
  
  /** Auto-save state to persistence layer */
  enablePersistence: boolean;
  
  /** State validation and consistency checking */
  enableValidation: boolean;
  
  /** Memory management settings */
  memoryManagement: {
    /** Enable automatic cleanup of old data */
    autoCleanup: boolean;
    
    /** Memory usage warning threshold (MB) */
    warningThresholdMB: number;
    
    /** Force cleanup threshold (MB) */
    forceCleanupThresholdMB: number;
  };
  
  /** Performance monitoring settings */
  performance: {
    /** Enable performance timing collection */
    enableTiming: boolean;
    
    /** Performance metrics collection interval (ms) */
    metricsIntervalMs: number;
    
    /** Alert threshold for slow operations (ms) */
    slowOperationThresholdMs: number;
  };
}

/**
 * State change event for notifying listeners
 */
export interface StateChangeEvent {
  /** Type of state change that occurred */
  type: StateChangeType;
  
  /** Path to the changed state property */
  path: string;
  
  /** Previous value (for debugging) */
  previousValue?: unknown;
  
  /** New value */
  newValue: unknown;
  
  /** Timestamp of the change */
  timestamp: Date;
  
  /** Event that triggered this state change */
  triggerEventId?: string;
}

/**
 * Types of state changes
 */
export type StateChangeType =
  | 'character.vitals'
  | 'character.injuries'
  | 'character.effects'
  | 'character.equipment'
  | 'environment.room'
  | 'environment.compass'
  | 'streams.config'
  | 'streams.data'
  | 'ui.panels'
  | 'ui.theme'
  | 'ui.layout'
  | 'session.connection'
  | 'session.statistics'
  | 'meta.debug';

/**
 * Listener function for state changes
 */
export type StateChangeListener = (event: StateChangeEvent) => void;

/**
 * State validation result
 */
export interface StateValidationResult {
  /** Whether the state is valid */
  valid: boolean;
  
  /** List of validation errors if any */
  errors: Array<StateValidationError>;
  
  /** Validation timestamp */
  timestamp: Date;
}

/**
 * Individual state validation error
 */
export interface StateValidationError {
  /** Path to the invalid property */
  path: string;
  
  /** Error message */
  message: string;
  
  /** Error severity level */
  severity: 'warning' | 'error' | 'critical';
  
  /** Suggested fix if available */
  suggestedFix?: string;
}