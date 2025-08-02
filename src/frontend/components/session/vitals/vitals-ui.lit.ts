// ABOUTME: Presentational UI component for vitals that renders VitalStat and VitalText components
// ABOUTME: Pure UI component with no session dependencies, accepts vital data as properties
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./vital-stat.lit";
import "./vital-text.lit";
import type { VitalStat } from "./vital-stat.lit";
import type { VitalText } from "./vital-text.lit";

interface VitalData {
  label: string;
  value?: string; // Optional - undefined means indeterminate state
  percent?: number; // Optional - undefined means indeterminate state
}

@customElement("illthorn-vitals-ui")
export class VitalsUI extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
    }
  `;

  @property({ type: Object })
  healthData: VitalData = { label: "health" };

  @property({ type: Object })
  manaData: VitalData = { label: "mana" };

  @property({ type: Object })
  staminaData: VitalData = { label: "stamina" };

  @property({ type: Object })
  spiritData: VitalData = { label: "spirit" };

  @property({ type: Object })
  mindData: VitalData = { label: "mind" };

  @property({ type: Object })
  stanceData: VitalData = { label: "stance", value: "offensive", percent: 0 };

  @property({ type: Object })
  encumbranceData: VitalData = { label: "encumbrance", value: "none", percent: 0 };

  getVitals() {
    const shadowRoot = this.shadowRoot;
    if (!shadowRoot) {
      return { stats: [], texts: [] };
    }

    const stats = Array.from(shadowRoot.querySelectorAll("illthorn-vital-stat")) as Array<VitalStat>;
    const texts = Array.from(shadowRoot.querySelectorAll("illthorn-vital-text")) as Array<VitalText>;

    return { stats, texts };
  }

  render() {
    return html`
      <!-- Progress meter vitals -->
      <illthorn-vital-stat 
        label="${this.healthData.label}" 
        .value="${this.healthData.value}" 
        .percent="${this.healthData.percent}">
      </illthorn-vital-stat>
      
      <illthorn-vital-stat 
        label="${this.staminaData.label}" 
        .value="${this.staminaData.value}" 
        .percent="${this.staminaData.percent}">
      </illthorn-vital-stat>
      
      <illthorn-vital-stat 
        label="${this.spiritData.label}" 
        .value="${this.spiritData.value}" 
        .percent="${this.spiritData.percent}">
      </illthorn-vital-stat>
      
      <illthorn-vital-stat 
        label="${this.manaData.label}" 
        .value="${this.manaData.value}" 
        .percent="${this.manaData.percent}">
      </illthorn-vital-stat>
      
      <illthorn-vital-stat 
        label="${this.mindData.label}" 
        .value="${this.mindData.value}" 
        .percent="${this.mindData.percent}">
      </illthorn-vital-stat>
      
      <!-- Text-only vitals -->
      <illthorn-vital-text 
        label="${this.stanceData.label}" 
        value="${this.stanceData.value || ""}">
      </illthorn-vital-text>
      
      <illthorn-vital-text 
        label="${this.encumbranceData.label}" 
        value="${this.encumbranceData.value || ""}">
      </illthorn-vital-text>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-vitals-ui": VitalsUI;
  }
}
