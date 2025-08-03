// ABOUTME: Integration example showing how to use the centralized game state system
// ABOUTME: Demonstrates setup, usage, and migration from legacy bus system

import type { FrontendSession } from "../session";
import { GameStateStore } from "./core/game-state-store";
import { createBusAdapter } from "./adapters/bus-adapter";
import { createCentralizedVitalsContainer } from "./components/vitals-container-centralized.lit";

/**
 * Example integration of the centralized game state system
 * This shows how to set up and use the new architecture
 */
export class CentralizedStateIntegration {
  private readonly _session: FrontendSession;
  private readonly _gameStateStore: GameStateStore;
  private readonly _busAdapter: ReturnType<typeof createBusAdapter>;

  constructor(session: FrontendSession) {
    this._session = session;
    
    // 1. Create the centralized game state store
    this._gameStateStore = new GameStateStore({
      enableDebug: true,
      enablePersistence: false, // Start with false for development
      enableValidation: true
    });
    
    // 2. Create the bus adapter for backward compatibility
    this._busAdapter = createBusAdapter(this._gameStateStore, session, {
      enableLegacyEvents: true,
      enableStateToLegacy: true,
      enableLegacyToState: true,
      debugMode: true
    });
    
    // 3. Set up integration with existing session
    this.integrateWithSession();
  }

  /**
   * Integrate the centralized state with the existing session
   */
  private integrateWithSession(): void {
    // The bus adapter automatically subscribes to existing metadata events
    // and converts them to centralized state updates
    
    // We can also manually process raw game events
    const originalOnMessage = this._session.onMessage.bind(this._session);
    this._session.onMessage = (data: string) => {
      // Let the original session handle the data first
      originalOnMessage(data);
      
      // Then extract and process for centralized state
      // This is just an example - in practice, the adapter handles this
      this.processRawGameData(data);
    };
  }

  /**
   * Process raw game data into centralized state
   */
  private processRawGameData(data: string): void {
    // Example: if we wanted to process raw data directly
    // In practice, the bus adapter handles this automatically
    
    if (data.includes('<progressBar')) {
      // Could create game log events directly here
      console.log('[CentralizedState] Detected vitals data:', data.substring(0, 100));
    }
  }

  /**
   * Create a centralized vitals container
   */
  createVitalsContainer(): HTMLElement {
    return createCentralizedVitalsContainer(this._session, this._busAdapter);
  }

  /**
   * Get current game state (read-only)
   */
  getCurrentState() {
    return this._busAdapter.getCurrentState();
  }

  /**
   * Subscribe to state changes
   */
  subscribeToStateChanges(listener: (event: any) => void) {
    return this._busAdapter.subscribeToStateChanges(listener);
  }

  /**
   * Update panel visibility (example of centralized state updates)
   */
  updatePanelVisibility(panelType: string, visible: boolean): void {
    this._busAdapter.updatePanelVisibility(panelType, visible);
  }

  /**
   * Demonstrate HMR resilience
   */
  async demonstrateHMRResilience(): Promise<void> {
    console.log('[CentralizedState] Current vitals:', this.getCurrentState().character.vitals);
    
    // Simulate some state changes
    this._gameStateStore.updateVital('health', {
      label: 'health',
      value: '85',
      percent: 85,
      text: 'health 85'
    });
    
    console.log('[CentralizedState] After update:', this.getCurrentState().character.vitals.health);
    
    // The state is now preserved in the centralized store
    // Components can reconnect and immediately restore their state
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this._busAdapter.dispose();
    this._gameStateStore.dispose();
  }
}

/**
 * Factory function to create the integration
 */
export function createCentralizedStateIntegration(session: FrontendSession): CentralizedStateIntegration {
  return new CentralizedStateIntegration(session);
}

/**
 * Example usage in a session layout or main application
 */
export function exampleUsage() {
  // This would typically be called when initializing a session
  
  /*
  // 1. Create session (existing code)
  const session = FrontendSession.of(config);
  
  // 2. Add centralized state integration
  const centralizedState = createCentralizedStateIntegration(session);
  
  // 3. Create components using centralized state
  const vitalsContainer = centralizedState.createVitalsContainer();
  
  // 4. Add to DOM
  document.querySelector('#vitals-panel')?.appendChild(vitalsContainer);
  
  // 5. Subscribe to state changes for debugging
  centralizedState.subscribeToStateChanges((event) => {
    console.log('[StateChange]', event.type, event.path);
  });
  
  // 6. The component now automatically gets state from the centralized store
  // and survives HMR without losing state!
  */
}

/**
 * Migration helper for gradual component migration
 */
export class ComponentMigrationHelper {
  /**
   * Check if a component should use centralized state
   */
  static shouldUseCentralizedState(componentName: string): boolean {
    // During migration, gradually enable components
    const enabledComponents = new Set([
      'vitals-container',
      // Add more as they are migrated
    ]);
    
    return enabledComponents.has(componentName);
  }

  /**
   * Create appropriate component version based on migration status
   */
  static createVitalsContainer(
    session: FrontendSession,
    stateAdapter?: ReturnType<typeof createBusAdapter>
  ): HTMLElement {
    if (this.shouldUseCentralizedState('vitals-container') && stateAdapter) {
      // Use new centralized version
      return createCentralizedVitalsContainer(session, stateAdapter);
    } else {
      // Use legacy version (import would be done dynamically)
      // return new LegacyVitalsContainer();
      throw new Error('Legacy component creation not implemented in this example');
    }
  }

  /**
   * Validate that migrated component produces same output as legacy
   */
  static async validateMigration(
    legacyComponent: HTMLElement,
    centralizedComponent: HTMLElement
  ): Promise<boolean> {
    // Wait for both components to render
    await Promise.all([
      (legacyComponent as any).updateComplete,
      (centralizedComponent as any).updateComplete
    ]);

    // Compare DOM structure
    const legacyHTML = legacyComponent.innerHTML;
    const centralizedHTML = centralizedComponent.innerHTML;

    if (legacyHTML !== centralizedHTML) {
      console.warn('Migration validation failed: DOM mismatch');
      console.log('Legacy:', legacyHTML);
      console.log('Centralized:', centralizedHTML);
      return false;
    }

    return true;
  }
}

/**
 * Performance monitoring for the centralized state system
 */
export class CentralizedStateMonitor {
  private readonly _integration: CentralizedStateIntegration;
  private _startTime: number = Date.now();
  private _updateCount: number = 0;

  constructor(integration: CentralizedStateIntegration) {
    this._integration = integration;
    this.startMonitoring();
  }

  private startMonitoring(): void {
    // Monitor state changes
    this._integration.subscribeToStateChanges((event) => {
      this._updateCount++;
      this.logPerformanceMetrics(event);
    });

    // Monitor memory usage
    setInterval(() => {
      this.checkMemoryUsage();
    }, 30000); // Every 30 seconds
  }

  private logPerformanceMetrics(event: any): void {
    const uptimeMs = Date.now() - this._startTime;
    const updatesPerSecond = this._updateCount / (uptimeMs / 1000);

    console.log(`[Performance] Updates: ${this._updateCount}, Rate: ${updatesPerSecond.toFixed(2)}/sec, Event: ${event.type}`);
  }

  private checkMemoryUsage(): void {
    const state = this._integration.getCurrentState();
    const gameLog = (this._integration as any)._gameStateStore.gameLog;
    
    const eventCount = gameLog.getTotalEventCount();
    const memoryEstimate = gameLog.getMemoryUsageEstimate();
    
    console.log(`[Memory] Events: ${eventCount}, Estimated Memory: ${(memoryEstimate / 1024 / 1024).toFixed(2)}MB`);
    
    if (memoryEstimate > 100 * 1024 * 1024) { // 100MB
      console.warn('[Memory] High memory usage detected, consider trimming events');
    }
  }
}