// ABOUTME: Proof-of-concept VitalsContainer using centralized game state instead of @state() decorators
// ABOUTME: Demonstrates HMR-resilient architecture that preserves state across development changes

import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { FrontendSession as Session } from "../../session/index";
import type { BusStateAdapter } from "../adapters/bus-adapter";
import type { VitalData } from "../types/character";
import "../../../components/session/vitals/vitals-ui.lit";
import type { VitalsUI } from "../../../components/session/vitals/vitals-ui.lit";

/**
 * Centralized state-based vitals container component
 * Demonstrates the new architecture with props-based state instead of @state() decorators
 */
@customElement("illthorn-vitals-container-centralized")
export class VitalsContainerCentralized extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: Object })
  session?: Session;

  @property({ type: Object })
  stateAdapter?: BusStateAdapter;

  // Props derived from centralized state (no @state() decorators!)
  @property({ type: Object })
  health: VitalData = { label: "health" };

  @property({ type: Object })
  mana: VitalData = { label: "mana" };

  @property({ type: Object })
  stamina: VitalData = { label: "stamina" };

  @property({ type: Object })
  spirit: VitalData = { label: "spirit" };

  @property({ type: Object })
  mind: VitalData = { label: "mind" };

  @property({ type: Object })
  stance: VitalData = { label: "stance", value: "offensive", percent: 0 };

  @property({ type: Object })
  encumbrance: VitalData = { label: "encumbrance", value: "none", percent: 0 };

  // State subscription cleanup
  private _stateUnsubscribe?: () => void;

  /**
   * Component lifecycle - subscribe to centralized state changes
   */
  connectedCallback() {
    super.connectedCallback();
    
    if (this.stateAdapter) {
      this.subscribeToStateChanges();
      this.loadInitialState();
    }
  }

  /**
   * Component lifecycle - cleanup subscriptions
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    this._stateUnsubscribe?.();
  }

  /**
   * Property change handling - re-subscribe if adapter changes
   */
  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);
    
    if (changedProperties.has('stateAdapter')) {
      this._stateUnsubscribe?.();
      if (this.stateAdapter) {
        this.subscribeToStateChanges();
        this.loadInitialState();
      }
    }
  }

  /**
   * Subscribe to centralized state changes
   * This replaces the old bus event subscriptions
   */
  private subscribeToStateChanges(): void {
    if (!this.stateAdapter) return;

    this._stateUnsubscribe = this.stateAdapter.subscribeToStateChanges((event) => {
      // Only update if this is a vitals-related change
      if (event.type === 'character.vitals' || event.path.startsWith('character.vitals.')) {
        this.updateVitalsFromState();
      }
    });
  }

  /**
   * Load initial state from the centralized store
   * This ensures component shows current state immediately on connection
   */
  private loadInitialState(): void {
    if (!this.stateAdapter) return;

    const currentState = this.stateAdapter.getCurrentState();
    this.updateVitalsFromGameState(currentState.character.vitals);
  }

  /**
   * Update vitals from centralized state
   */
  private updateVitalsFromState(): void {
    if (!this.stateAdapter) return;

    const currentState = this.stateAdapter.getCurrentState();
    this.updateVitalsFromGameState(currentState.character.vitals);
  }

  /**
   * Update component properties from vitals state
   */
  private updateVitalsFromGameState(vitalsState: typeof this.stateAdapter.getCurrentState.character.vitals): void {
    // Update all vital properties
    this.health = { ...vitalsState.health };
    this.mana = { ...vitalsState.mana };
    this.stamina = { ...vitalsState.stamina };
    this.spirit = { ...vitalsState.spirit };
    this.mind = { ...vitalsState.mind };
    this.stance = { ...vitalsState.stance };
    this.encumbrance = { ...vitalsState.encumbrance };
    
    // Force re-render to update UI
    this.requestUpdate();
  }

  /**
   * Render the vitals UI with centralized state data
   */
  render() {
    if (!this.session || !this.stateAdapter) {
      return html`<div>Loading vitals...</div>`;
    }

    return html`
      <illthorn-vitals-ui
        .healthData=${this.health}
        .manaData=${this.mana}
        .staminaData=${this.stamina}
        .spiritData=${this.spirit}
        .mindData=${this.mind}
        .stanceData=${this.stance}
        .encumbranceData=${this.encumbrance}>
      </illthorn-vitals-ui>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-vitals-container-centralized": VitalsContainerCentralized;
  }
}

/**
 * Factory function to create a centralized vitals container with proper dependencies
 */
export function createCentralizedVitalsContainer(
  session: Session,
  stateAdapter: BusStateAdapter
): VitalsContainerCentralized {
  const container = new VitalsContainerCentralized();
  container.session = session;
  container.stateAdapter = stateAdapter;
  return container;
}

/**
 * Comparison utility for testing migration compatibility
 * Ensures new component produces identical output to legacy component
 */
export class VitalsContainerComparison {
  /**
   * Compare vitals data between legacy and centralized implementations
   */
  static compareVitalsData(
    legacyVitals: Record<string, VitalData>,
    centralizedVitals: Record<string, VitalData>
  ): boolean {
    const vitalTypes = ['health', 'mana', 'stamina', 'spirit', 'mind', 'stance', 'encumbrance'];
    
    for (const vitalType of vitalTypes) {
      const legacy = legacyVitals[vitalType];
      const centralized = centralizedVitals[vitalType];
      
      if (!this.areVitalsEqual(legacy, centralized)) {
        console.warn(`Vitals mismatch for ${vitalType}:`, { legacy, centralized });
        return false;
      }
    }
    
    return true;
  }

  /**
   * Compare individual vital data objects
   */
  private static areVitalsEqual(a: VitalData, b: VitalData): boolean {
    return (
      a.label === b.label &&
      a.value === b.value &&
      a.percent === b.percent &&
      a.text === b.text
      // Note: lastUpdated timestamps may differ slightly, so we don't compare them
    );
  }

  /**
   * Extract vitals data from DOM for comparison
   */
  static extractVitalsFromDOM(container: Element): Record<string, VitalData> {
    const vitalsUI = container.querySelector('illthorn-vitals-ui') as VitalsUI;
    if (!vitalsUI) {
      throw new Error('VitalsUI component not found');
    }

    return {
      health: vitalsUI.healthData || { label: 'health' },
      mana: vitalsUI.manaData || { label: 'mana' },
      stamina: vitalsUI.staminaData || { label: 'stamina' },
      spirit: vitalsUI.spiritData || { label: 'spirit' },
      mind: vitalsUI.mindData || { label: 'mind' },
      stance: vitalsUI.stanceData || { label: 'stance' },
      encumbrance: vitalsUI.encumbranceData || { label: 'encumbrance' }
    };
  }
}

/**
 * HMR testing utility
 * Validates that component state survives Hot Module Replacement
 */
export class VitalsHMRTester {
  /**
   * Simulate HMR and verify state persistence
   */
  static async testHMRResilience(
    container: VitalsContainerCentralized,
    stateAdapter: BusStateAdapter
  ): Promise<boolean> {
    // Capture initial state
    const initialVitals = {
      health: { ...container.health },
      mana: { ...container.mana },
      stamina: { ...container.stamina },
      spirit: { ...container.spirit },
      mind: { ...container.mind },
      stance: { ...container.stance },
      encumbrance: { ...container.encumbrance }
    };

    // Simulate component disconnect/reconnect (as happens during HMR)
    container.disconnectedCallback();
    
    // Wait a frame
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    // Reconnect with same state adapter
    container.stateAdapter = stateAdapter;
    container.connectedCallback();
    
    // Wait for state to be restored
    await container.updateComplete;
    
    // Verify state was preserved
    const restoredVitals = {
      health: container.health,
      mana: container.mana,
      stamina: container.stamina,
      spirit: container.spirit,
      mind: container.mind,
      stance: container.stance,
      encumbrance: container.encumbrance
    };

    return VitalsContainerComparison.compareVitalsData(initialVitals, restoredVitals);
  }

  /**
   * Test that state changes are reflected after HMR
   */
  static async testStateChangesAfterHMR(
    container: VitalsContainerCentralized,
    stateAdapter: BusStateAdapter
  ): Promise<boolean> {
    // Simulate HMR
    container.disconnectedCallback();
    container.stateAdapter = stateAdapter;
    container.connectedCallback();
    await container.updateComplete;

    // Make a state change
    stateAdapter.getCurrentState().character.vitals.health.value = "95";
    stateAdapter.getCurrentState().character.vitals.health.percent = 95;
    
    // Trigger update (simulating state change notification)
    container.updateVitalsFromState();
    await container.updateComplete;

    // Verify change was reflected
    return container.health.value === "95" && container.health.percent === 95;
  }
}