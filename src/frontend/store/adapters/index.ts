// ABOUTME: Adapter module exports for bridging legacy and centralized state systems
// ABOUTME: Provides backward compatibility during migration to centralized state

export { 
  BusStateAdapter,
  createBusAdapter,
  shouldUseCentralizedState,
  UIStateDerivation 
} from "./bus-adapter";

export type {
  BusAdapterConfig,
  LegacyEventListener
} from "./bus-adapter";