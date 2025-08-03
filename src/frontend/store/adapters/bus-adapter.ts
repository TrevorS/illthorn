// ABOUTME: Bridge adapter between existing bus system and centralized game state store
// ABOUTME: Maintains backward compatibility while enabling gradual migration to centralized state

import type { GameTag } from "../../parser/tag";
import type { Bus } from "../../util/bus";
import type { FrontendSession } from "../../session";
import { GameStateStore, type GameLogEventInput } from "../core/game-state-store";
import type { 
  StateChangeEvent, 
  StateChangeListener 
} from "../types/game-state";
import type { VitalData, SpellEffectData } from "../types/character";
import type { DirectionData } from "../types/environment";

/**
 * Adapter that bridges the existing bus system with the new centralized state store
 * Provides backward compatibility during migration
 */
export class BusStateAdapter {
  private readonly _gameStateStore: GameStateStore;
  private readonly _session: FrontendSession;
  private readonly _bus: Bus;
  
  // Event subscriptions for cleanup
  private readonly _subscriptions: Array<() => void> = [];
  
  // Backward compatibility state listeners
  private readonly _legacyListeners: Set<LegacyEventListener> = new Set();
  
  // Configuration
  private readonly _config: BusAdapterConfig;

  constructor(
    gameStateStore: GameStateStore,
    session: FrontendSession,
    config?: Partial<BusAdapterConfig>
  ) {
    this._gameStateStore = gameStateStore;
    this._session = session;
    this._bus = session.bus;
    
    this._config = {
      enableLegacyEvents: config?.enableLegacyEvents ?? true,
      enableStateToLegacy: config?.enableStateToLegacy ?? true,
      enableLegacyToState: config?.enableLegacyToState ?? true,
      debugMode: config?.debugMode ?? false,
      ...config
    };
    
    this.initializeAdapters();
  }

  /**
   * Initialize all adapter connections
   */
  private initializeAdapters(): void {
    if (this._config.enableLegacyToState) {
      this.setupLegacyToStateAdapters();
    }
    
    if (this._config.enableStateToLegacy) {
      this.setupStateToLegacyAdapters();
    }
  }

  /**
   * Set up adapters that convert legacy bus events to state updates
   */
  private setupLegacyToStateAdapters(): void {
    // Subscribe to metadata events and convert to game log events
    this._subscriptions.push(
      this._bus.subscribeEventPattern('metadata/**', (event) => {
        this.handleMetadataEvent(event);
      })
    );
    
    // Subscribe to specific vital events
    const vitalEvents = ['health', 'mana', 'stamina', 'spirit', 'mind', 'stance', 'encumbrance'];
    for (const vital of vitalEvents) {
      this._subscriptions.push(
        this._bus.subscribeEvent(`metadata/progressBar/${vital}`, (event) => {
          this.handleVitalEvent(vital, event.detail);
        })
      );
    }
    
    // Subscribe to spell effects events
    this._subscriptions.push(
      this._bus.subscribeEvent('metadata/dialogData/Active Spells', (event) => {
        this.handleSpellEffectsEvent(event.detail);
      })
    );
    
    // Subscribe to compass events
    this._subscriptions.push(
      this._bus.subscribeEvent('metadata/compass', (event) => {
        this.handleCompassEvent(event.detail);
      })
    );
    
    // Subscribe to room events
    this._subscriptions.push(
      this._bus.subscribeEvent('metadata/room', (event) => {
        this.handleRoomEvent(event.detail);
      })
    );
    
    if (this._config.debugMode) {
      console.log(`[BusAdapter] Set up ${this._subscriptions.length} legacy event subscriptions`);
    }
  }

  /**
   * Set up adapters that convert state changes to legacy bus events
   */
  private setupStateToLegacyAdapters(): void {
    // Subscribe to state changes and emit legacy events
    this._subscriptions.push(
      this._gameStateStore.subscribe((event) => {
        this.handleStateChange(event);
      })
    );
  }

  /**
   * Handle generic metadata events and convert to game log entries
   */
  private handleMetadataEvent(event: CustomEvent<GameTag>): void {
    const tag = event.detail;
    
    // Create game log event
    const gameLogEvent: GameLogEventInput = {
      type: 'incoming',
      source: 'game',
      content: [tag],
      sessionId: this._session.config.sessionId || 'unknown'
    };
    
    // Process through game state store
    this._gameStateStore.processGameEvent(gameLogEvent);
    
    if (this._config.debugMode) {
      console.log(`[BusAdapter] Processed metadata event: ${event.type}`, tag);
    }
  }

  /**
   * Handle vital events (health, mana, etc.)
   */
  private handleVitalEvent(vitalType: string, tag: GameTag): void {
    const vitalData: VitalData = {
      label: vitalType,
      value: tag.attrs.value as string,
      percent: tag.attrs.value ? Number(tag.attrs.value) : undefined,
      text: tag.attrs.text as string,
      lastUpdated: new Date()
    };
    
    // Map vital type to character state
    const vitalMap: Record<string, keyof typeof this._gameStateStore.state.character.vitals> = {
      'health': 'health',
      'mana': 'mana',
      'stamina': 'stamina',
      'spirit': 'spirit',
      'mind': 'mind',
      'stance': 'stance',
      'encumbrance': 'encumbrance'
    };
    
    const mappedVital = vitalMap[vitalType];
    if (mappedVital) {
      this._gameStateStore.updateVital(mappedVital, vitalData);
    }
  }

  /**
   * Handle spell effects events
   */
  private handleSpellEffectsEvent(tag: GameTag): void {
    const effects: Array<SpellEffectData> = [];
    
    // Extract effects from children
    for (const child of tag.children || []) {
      if (child.name === 'progressBar') {
        effects.push({
          id: child.attrs.id as string || `effect_${Date.now()}`,
          text: child.attrs.text as string || '',
          time: child.attrs.time as string || '',
          value: child.attrs.value as string || '0',
          lastUpdated: new Date()
        });
      }
    }
    
    this._gameStateStore.updateEffects(effects);
  }

  /**
   * Handle compass events
   */
  private handleCompassEvent(tag: GameTag): void {
    const directions: Array<DirectionData> = [];
    
    // Extract directions from compass data
    for (const child of tag.children || []) {
      if (child.name === 'dir') {
        directions.push({
          direction: child.attrs.value as string || '',
          available: true,
          hidden: false
        });
      }
    }
    
    this._gameStateStore.updateCompass(directions);
  }

  /**
   * Handle room events
   */
  private handleRoomEvent(tag: GameTag): void {
    this._gameStateStore.updateRoom({
      title: tag.attrs.title as string || '',
      description: tag.text || ''
    });
  }

  /**
   * Handle state changes and emit legacy bus events for backward compatibility
   */
  private handleStateChange(stateEvent: StateChangeEvent): void {
    if (!this._config.enableStateToLegacy) return;
    
    // Map state changes back to legacy bus events for components that haven't migrated yet
    switch (stateEvent.type) {
      case 'character.vitals':
        this.emitLegacyVitalEvents(stateEvent);
        break;
        
      case 'character.effects':
        this.emitLegacyEffectsEvent(stateEvent);
        break;
        
      case 'environment.compass':
        this.emitLegacyCompassEvent(stateEvent);
        break;
        
      case 'environment.room':
        this.emitLegacyRoomEvent(stateEvent);
        break;
        
      case 'ui.panels':
        this.emitLegacyPanelEvent(stateEvent);
        break;
        
      default:
        // Handle other events or ignore
        break;
    }
    
    // Emit generic state change event for new listeners
    this.notifyLegacyListeners(stateEvent);
  }

  /**
   * Emit legacy vital events for backward compatibility
   */
  private emitLegacyVitalEvents(stateEvent: StateChangeEvent): void {
    const vitals = this._gameStateStore.state.character.vitals;
    
    // Emit individual vital events
    for (const [vitalType, vitalData] of Object.entries(vitals)) {
      // Create a synthetic GameTag for legacy compatibility
      const syntheticTag: GameTag = {
        kind: 'METADATA',
        name: 'progressBar',
        gameName: 'progressBar',
        attrs: {
          id: vitalType,
          value: vitalData.value,
          text: vitalData.text
        },
        children: [],
        state: 'CLOSED',
        text: vitalData.text || ''
      };
      
      this._bus.dispatchEvent(`ui-state/vitals/${vitalType}`, vitalData);
    }
    
    // Emit combined vitals state
    this._bus.dispatchEvent('ui-state/vitals', vitals);
  }

  /**
   * Emit legacy effects event
   */
  private emitLegacyEffectsEvent(stateEvent: StateChangeEvent): void {
    const effects = this._gameStateStore.state.character.effects.active;
    this._bus.dispatchEvent('ui-state/effects', { effects, hasEffects: effects.length > 0 });
  }

  /**
   * Emit legacy compass event
   */
  private emitLegacyCompassEvent(stateEvent: StateChangeEvent): void {
    const compass = this._gameStateStore.state.environment.compass;
    this._bus.dispatchEvent('ui-state/compass', compass);
  }

  /**
   * Emit legacy room event
   */
  private emitLegacyRoomEvent(stateEvent: StateChangeEvent): void {
    const room = this._gameStateStore.state.environment.room;
    this._bus.dispatchEvent('ui-state/room', room);
  }

  /**
   * Emit legacy panel event
   */
  private emitLegacyPanelEvent(stateEvent: StateChangeEvent): void {
    const panels = this._gameStateStore.state.ui.panels;
    this._bus.dispatchEvent('ui-state/panels', panels);
  }

  /**
   * Subscribe to state changes (new API)
   */
  subscribeToStateChanges(listener: StateChangeListener): () => void {
    return this._gameStateStore.subscribe(listener);
  }

  /**
   * Subscribe to legacy-style events (backward compatibility)
   */
  subscribeLegacyListener(listener: LegacyEventListener): () => void {
    this._legacyListeners.add(listener);
    return () => {
      this._legacyListeners.delete(listener);
    };
  }

  /**
   * Get current game state (read-only)
   */
  getCurrentState(): Readonly<typeof this._gameStateStore.state> {
    return this._gameStateStore.state;
  }

  /**
   * Get game log store for direct access
   */
  getGameLogStore(): typeof this._gameStateStore.gameLog {
    return this._gameStateStore.gameLog;
  }

  /**
   * Update panel visibility (convenience method)
   */
  updatePanelVisibility(panelType: string, visible: boolean): void {
    this._gameStateStore.updatePanelVisibility(panelType, visible);
  }

  /**
   * Notify legacy listeners of state changes
   */
  private notifyLegacyListeners(stateEvent: StateChangeEvent): void {
    for (const listener of this._legacyListeners) {
      try {
        listener(stateEvent);
      } catch (error) {
        console.error('Error notifying legacy state listener:', error);
      }
    }
  }

  /**
   * Dispose of the adapter and cleanup subscriptions
   */
  dispose(): void {
    // Cleanup all subscriptions
    for (const unsubscribe of this._subscriptions) {
      unsubscribe();
    }
    this._subscriptions.length = 0;
    
    // Clear legacy listeners
    this._legacyListeners.clear();
    
    if (this._config.debugMode) {
      console.log('[BusAdapter] Disposed and cleaned up all subscriptions');
    }
  }
}

// Supporting types and interfaces

export interface BusAdapterConfig {
  /** Enable legacy bus event emission */
  enableLegacyEvents: boolean;
  
  /** Enable state-to-legacy event conversion */
  enableStateToLegacy: boolean;
  
  /** Enable legacy-to-state event conversion */
  enableLegacyToState: boolean;
  
  /** Enable debug logging */
  debugMode: boolean;
}

export type LegacyEventListener = (event: StateChangeEvent) => void;

/**
 * Factory function to create and configure the bus adapter
 */
export function createBusAdapter(
  gameStateStore: GameStateStore,
  session: FrontendSession,
  config?: Partial<BusAdapterConfig>
): BusStateAdapter {
  return new BusStateAdapter(gameStateStore, session, config);
}

/**
 * Utility to check if a component should use the new state system
 * This can be used during migration to gradually opt components into the new system
 */
export function shouldUseCentralizedState(componentName: string): boolean {
  // During migration, we can control which components use the new system
  const migratedComponents = new Set([
    'vitals-container',
    'injuries-container', 
    'effects-container'
    // Add more components as they are migrated
  ]);
  
  return migratedComponents.has(componentName);
}

/**
 * Helper to create UI state derivation functions
 * These convert centralized state to component-specific props
 */
export class UIStateDerivation {
  static deriveVitalsProps(state: typeof this._gameStateStore.state) {
    return {
      health: state.character.vitals.health,
      mana: state.character.vitals.mana,
      stamina: state.character.vitals.stamina,
      spirit: state.character.vitals.spirit,
      mind: state.character.vitals.mind,
      stance: state.character.vitals.stance,
      encumbrance: state.character.vitals.encumbrance
    };
  }
  
  static deriveEffectsProps(state: typeof this._gameStateStore.state) {
    return {
      effects: state.character.effects.active,
      hasEffects: state.character.effects.active.length > 0
    };
  }
  
  static deriveCompassProps(state: typeof this._gameStateStore.state) {
    return {
      directions: state.environment.compass.directions,
      visible: state.environment.compass.visible,
      config: state.environment.compass.config
    };
  }
  
  static deriveRoomProps(state: typeof this._gameStateStore.state) {
    return {
      title: state.environment.room.title,
      description: state.environment.room.description,
      exits: state.environment.room.exits
    };
  }
}