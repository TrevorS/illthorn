// ABOUTME: Core store module exports for centralized game state management
// ABOUTME: Provides main entry point for GameStateStore and GameLogStore

export { GameStateStore } from "./game-state-store";
export { GameLogStoreImpl } from "./game-log-store";

export type {
  GameLogEventInput,
  GameLogStoreConfig,
  GameLogEventListener,
  GameLogEventListenerEvent
} from "./game-log-store";

// Re-export commonly used types from the types module
export type {
  GameState,
  StateChangeEvent,
  StateChangeListener,
  StateMetadata,
  GameStateConfig
} from "../types/game-state";

export type {
  GameLogEvent,
  GameLogEventType,
  GameLogEventSource,
  GameLogStore
} from "../types/game-log";

export type {
  CharacterState,
  VitalData,
  SpellEffectData
} from "../types/character";

export type {
  EnvironmentState,
  RoomState,
  DirectionData
} from "../types/environment";