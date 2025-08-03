// ABOUTME: Main entry point for the centralized game state system
// ABOUTME: Provides clean exports for all store components and utilities

// Core store exports
export { GameStateStore, GameLogStoreImpl } from "./core";
export type {
  GameState,
  StateChangeEvent,
  StateChangeListener,
  StateMetadata,
  GameStateConfig,
  GameLogEvent,
  GameLogEventType,
  GameLogEventSource,
  GameLogStore,
  GameLogEventInput,
  GameLogStoreConfig,
  CharacterState,
  VitalData,
  SpellEffectData,
  EnvironmentState,
  RoomState,
  DirectionData
} from "./core";

// Adapter exports
export { 
  BusStateAdapter,
  createBusAdapter,
  shouldUseCentralizedState,
  UIStateDerivation 
} from "./adapters";
export type {
  BusAdapterConfig,
  LegacyEventListener
} from "./adapters";

// Component exports (proof of concept)
export { 
  VitalsContainerCentralized,
  createCentralizedVitalsContainer,
  VitalsContainerComparison,
  VitalsHMRTester
} from "./components/vitals-container-centralized.lit";

// Integration utilities
export {
  CentralizedStateIntegration,
  createCentralizedStateIntegration,
  ComponentMigrationHelper,
  CentralizedStateMonitor
} from "./integration-example";

// Type system exports (comprehensive)
export type * from "./types";

// Factory function for easy setup
export function createCentralizedGameState(session: any, config?: any) {
  const integration = createCentralizedStateIntegration(session);
  
  return {
    integration,
    gameState: integration.getCurrentState(),
    subscribe: integration.subscribeToStateChanges.bind(integration),
    createVitalsContainer: integration.createVitalsContainer.bind(integration),
    updatePanelVisibility: integration.updatePanelVisibility.bind(integration),
    dispose: integration.dispose.bind(integration)
  };
}