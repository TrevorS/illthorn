// ABOUTME: Smart container component for vitals that handles session integration and business logic
// ABOUTME: Manages vital data state and coordinates with VitalsUI for presentation - now using BaseContainerComponent

import { css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { GameTag } from "../../../parser/tag";
import { BaseContainerComponent } from "../../mixins/base-container.lit";
import "./vitals-ui.lit";
import type { VitalsUI } from "./vitals-ui.lit";

interface VitalData {
  label: string;
  value?: string; // Optional - undefined means indeterminate state
  percent?: number; // Optional - undefined means indeterminate state
}

@customElement("illthorn-vitals-container")
export class VitalsContainer extends BaseContainerComponent {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @state()
  private _health: VitalData = { label: "health" };

  @state()
  private _mana: VitalData = { label: "mana" };

  @state()
  private _stamina: VitalData = { label: "stamina" };

  @state()
  private _spirit: VitalData = { label: "spirit" };

  @state()
  private _mind: VitalData = { label: "mind" };

  @state()
  private _stance: VitalData = { label: "stance", value: "offensive", percent: 0 };

  @state()
  private _encumbrance: VitalData = { label: "encumbrance", value: "none", percent: 0 };

  protected getStateToStore(): Record<string, unknown> {
    return {
      health: this._health,
      mana: this._mana,
      stamina: this._stamina,
      spirit: this._spirit,
      mind: this._mind,
      stance: this._stance,
      encumbrance: this._encumbrance,
    };
  }

  protected restoreState(state: Record<string, unknown>): void {
    this._health = (state.health as VitalData) || { label: "health" };
    this._mana = (state.mana as VitalData) || { label: "mana" };
    this._stamina = (state.stamina as VitalData) || { label: "stamina" };
    this._spirit = (state.spirit as VitalData) || { label: "spirit" };
    this._mind = (state.mind as VitalData) || { label: "mind" };
    this._stance = (state.stance as VitalData) || { label: "stance", value: "offensive", percent: 0 };
    this._encumbrance = (state.encumbrance as VitalData) || { label: "encumbrance", value: "none", percent: 0 };
  }

  protected getStorageKeyPrefix(): string {
    return "vitals";
  }

  protected getSessionEventSubscriptions() {
    return [
      {
        eventName: "metadata/progressBar/health",
        handler: this.createStatePersistingHandler((tag: GameTag) => {
          this._health = this.processStandardVital(tag);
        }),
      },
      {
        eventName: "metadata/progressBar/mana",
        handler: this.createStatePersistingHandler((tag: GameTag) => {
          this._mana = this.processStandardVital(tag);
        }),
      },
      {
        eventName: "metadata/progressBar/stamina",
        handler: this.createStatePersistingHandler((tag: GameTag) => {
          this._stamina = this.processStandardVital(tag);
        }),
      },
      {
        eventName: "metadata/progressBar/spirit",
        handler: this.createStatePersistingHandler((tag: GameTag) => {
          this._spirit = this.processStandardVital(tag);
        }),
      },
      {
        eventName: "metadata/progressBar/mindState",
        handler: this.createStatePersistingHandler((tag: GameTag) => {
          const { attrs } = tag;
          this._mind = {
            label: "mind",
            percent: parseInt((attrs.value as string) || "0"),
            value: (attrs.text as string) || "",
          };
        }),
      },
      {
        eventName: "metadata/progressBar/pbarStance",
        handler: this.createStatePersistingHandler((tag: GameTag) => {
          const { attrs } = tag;
          const value = (attrs.text as string) || "";
          const humanizedValue = value.split(/\s/)[0] || value;
          this._stance = {
            label: "stance",
            percent: 0, // Stance doesn't use percentage
            value: humanizedValue,
          };
        }),
      },
      {
        eventName: "metadata/progressBar/encumlevel",
        handler: this.createStatePersistingHandler((tag: GameTag) => {
          const { attrs } = tag;
          const value = (attrs.text as string) || "";
          this._encumbrance = {
            label: "encumbrance",
            percent: 0, // Encumbrance doesn't use percentage
            value: value.toLowerCase(),
          };
        }),
      },
    ];
  }

  private processStandardVital(feedInfo: GameTag): VitalData {
    const { attrs } = feedInfo;
    const [userText, value] = (attrs.text || ":unknown").toString().split(" ");
    const percentString = (attrs.value as string) || "100";
    let percent = parseInt(percentString);

    // Game server bug: vitals send value="0" despite showing full fractions like "74/74"
    // Other progressBar tags (stance, encumbrance) send correct percentages
    // We calculate percentage from the fraction as a workaround
    if ((percent <= 1 || Number.isNaN(percent)) && value && value.includes("/")) {
      const [current, max] = value.split("/").map((n) => parseInt(n.trim()));
      if (!Number.isNaN(current) && !Number.isNaN(max) && max > 0) {
        percent = Math.round((current / max) * 100);
      }
    }

    return {
      label: userText as string,
      value: value || undefined,
      percent: Number.isNaN(percent) ? undefined : percent, // undefined for indeterminate state
    };
  }

  getVitals() {
    const vitalsUI = this.shadowRoot?.querySelector("illthorn-vitals-ui") as VitalsUI;
    return vitalsUI?.getVitals() || { stats: [], texts: [] };
  }

  render() {
    return html`
      <illthorn-vitals-ui
        .healthData=${this._health}
        .manaData=${this._mana}
        .staminaData=${this._stamina}
        .spiritData=${this._spirit}
        .mindData=${this._mind}
        .stanceData=${this._stance}
        .encumbranceData=${this._encumbrance}>
      </illthorn-vitals-ui>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-vitals-container": VitalsContainer;
  }
}
