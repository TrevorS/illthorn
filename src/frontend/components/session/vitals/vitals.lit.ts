// ABOUTME: Main vitals container that handles all session communication
// ABOUTME: Coordinates vital display using VitalStat and VitalText components
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { GameTag } from "../../../parser/tag";
import type { FrontendSession as Session } from "../../../session/index";
import "./components.lit";

interface VitalData {
  label: string;
  value: string;
  percent: number;
}

// Main Vitals Container
@customElement("illthorn-vitals-lit")
export class Vitals extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
    }

    /* Rogue theme - hide meters and use color coding */
    :host-context([theme='rogue']) illthorn-vital-stat::part(meter) {
      display: none;
    }

    :host-context([theme='rogue']) illthorn-vital-stat.high .vital-value {
      color: var(--info);
    }

    :host-context([theme='rogue']) illthorn-vital-stat.medium .vital-value {
      color: var(--gentle-warn);
    }

    :host-context([theme='rogue']) illthorn-vital-stat.low .vital-value {
      color: var(--warn);
    }

    :host-context([theme='rogue']) illthorn-vital-text.inverted.high .vital-value {
      color: var(--warn);
    }

    :host-context([theme='rogue']) illthorn-vital-text.inverted.medium .vital-value {
      color: var(--gentle-warn);
    }

    :host-context([theme='rogue']) illthorn-vital-text.inverted.low .vital-value {
      color: var(--info);
    }
  `;

  @property({ type: Object })
  session: Session | null = null;

  @state()
  private _health: VitalData = { label: "health", value: "", percent: 0 };

  @state()
  private _mana: VitalData = { label: "mana", value: "", percent: 0 };

  @state()
  private _stamina: VitalData = { label: "stamina", value: "", percent: 0 };

  @state()
  private _spirit: VitalData = { label: "spirit", value: "", percent: 0 };

  @state()
  private _mind: VitalData = { label: "mind", value: "", percent: 0 };

  @state()
  private _stance: VitalData = { label: "stance", value: "", percent: 0 };

  @state()
  private _encumbrance: VitalData = { label: "encumbrance", value: "", percent: 0 };

  constructor(session?: Session) {
    super();
    if (session) {
      this.session = session;
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.attachListeners();
  }

  private attachListeners() {
    if (!this.session || !this.session.bus) {
      return;
    }

    // Standard vitals
    this.session.bus.subscribeEvent<GameTag>(`metadata/progressBar/health`, ({ detail: feedInfo }) => {
      this._health = this.processStandardVital(feedInfo);
    });

    this.session.bus.subscribeEvent<GameTag>(`metadata/progressBar/mana`, ({ detail: feedInfo }) => {
      this._mana = this.processStandardVital(feedInfo);
    });

    this.session.bus.subscribeEvent<GameTag>(`metadata/progressBar/stamina`, ({ detail: feedInfo }) => {
      this._stamina = this.processStandardVital(feedInfo);
    });

    this.session.bus.subscribeEvent<GameTag>(`metadata/progressBar/spirit`, ({ detail: feedInfo }) => {
      this._spirit = this.processStandardVital(feedInfo);
    });

    // Special vitals
    this.session.bus.subscribeEvent<GameTag>(`metadata/progressBar/mindState`, ({ detail: feedInfo }) => {
      const { attrs } = feedInfo;
      this._mind = {
        label: "mind",
        percent: parseInt((attrs.value as string) || "0"),
        value: (attrs.text as string) || "",
      };
    });

    this.session.bus.subscribeEvent<GameTag>(`metadata/progressBar/pbarStance`, ({ detail: feedInfo }) => {
      const { attrs } = feedInfo;
      const value = (attrs.text as string) || "";
      const humanizedValue = value.split(/\s/)[0] || value;
      this._stance = {
        label: "stance",
        percent: 0, // Stance doesn't use percentage
        value: humanizedValue,
      };
    });

    this.session.bus.subscribeEvent<GameTag>(`metadata/progressBar/encumlevel`, ({ detail: feedInfo }) => {
      const { attrs } = feedInfo;
      const value = (attrs.text as string) || "";
      this._encumbrance = {
        label: "encumbrance",
        percent: 0, // Encumbrance doesn't use percentage
        value: value.toLowerCase(),
      };
    });
  }

  private processStandardVital(feedInfo: GameTag): VitalData {
    const { attrs } = feedInfo;
    const [userText, value] = (attrs.text || ":unknown").toString().split(" ");
    const percent = parseInt((attrs.value as string) || "0");

    return {
      label: userText as string,
      value: value || "",
      percent: percent,
    };
  }

  render() {
    if (!this.session) {
      return html``;
    }

    return html`
      <!-- Progress meter vitals -->
      <illthorn-vital-stat 
        label="${this._health.label}" 
        value="${this._health.value}" 
        percent="${this._health.percent}">
      </illthorn-vital-stat>
      
      <illthorn-vital-stat 
        label="${this._stamina.label}" 
        value="${this._stamina.value}" 
        percent="${this._stamina.percent}">
      </illthorn-vital-stat>
      
      <illthorn-vital-stat 
        label="${this._spirit.label}" 
        value="${this._spirit.value}" 
        percent="${this._spirit.percent}">
      </illthorn-vital-stat>
      
      <illthorn-vital-stat 
        label="${this._mana.label}" 
        value="${this._mana.value}" 
        percent="${this._mana.percent}">
      </illthorn-vital-stat>
      
      <illthorn-vital-stat 
        label="${this._mind.label}" 
        value="${this._mind.value}" 
        percent="${this._mind.percent}">
      </illthorn-vital-stat>
      
      <!-- Text-only vitals -->
      <illthorn-vital-text 
        label="${this._stance.label}" 
        value="${this._stance.value}">
      </illthorn-vital-text>
      
      <illthorn-vital-text 
        label="${this._encumbrance.label}" 
        value="${this._encumbrance.value}">
      </illthorn-vital-text>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-vitals-lit": Vitals;
  }
}
