// ABOUTME: Smart container component for vitals that handles session integration and business logic
// ABOUTME: Manages vital data state and coordinates with VitalsUI for presentation
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { GameTag } from "../../../parser/tag";
import type { FrontendSession as Session } from "../../../session/index";
import type { Bus } from "../../../util/bus";
import "./vitals-ui.lit";
import type { VitalsUI } from "./vitals-ui.lit";

interface VitalData {
  label: string;
  value?: string; // Optional - undefined means indeterminate state
  percent?: number; // Optional - undefined means indeterminate state
}

@customElement("illthorn-vitals-container")
export class VitalsContainer extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: Object })
  session?: Session;

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

  private _eventHandlers: Array<{ event: string; handler: (event: CustomEvent<GameTag>) => void; bus: Bus }> = [];

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has("session")) {
      this._setupEventListeners();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._cleanupEventListeners();
  }

  private _setupEventListeners() {
    this._cleanupEventListeners();

    if (!this.session?.bus) {
      return;
    }

    const bus = this.session.bus;

    // Standard vitals
    const healthHandler = ({ detail: feedInfo }: CustomEvent<GameTag>) => {
      this._health = this.processStandardVital(feedInfo);
    };
    bus.subscribeEvent<GameTag>("metadata/progressBar/health", healthHandler);
    this._eventHandlers.push({ event: "metadata/progressBar/health", handler: healthHandler, bus });

    const manaHandler = ({ detail: feedInfo }: CustomEvent<GameTag>) => {
      this._mana = this.processStandardVital(feedInfo);
    };
    bus.subscribeEvent<GameTag>("metadata/progressBar/mana", manaHandler);
    this._eventHandlers.push({ event: "metadata/progressBar/mana", handler: manaHandler, bus });

    const staminaHandler = ({ detail: feedInfo }: CustomEvent<GameTag>) => {
      this._stamina = this.processStandardVital(feedInfo);
    };
    bus.subscribeEvent<GameTag>("metadata/progressBar/stamina", staminaHandler);
    this._eventHandlers.push({ event: "metadata/progressBar/stamina", handler: staminaHandler, bus });

    const spiritHandler = ({ detail: feedInfo }: CustomEvent<GameTag>) => {
      this._spirit = this.processStandardVital(feedInfo);
    };
    bus.subscribeEvent<GameTag>("metadata/progressBar/spirit", spiritHandler);
    this._eventHandlers.push({ event: "metadata/progressBar/spirit", handler: spiritHandler, bus });

    // Special vitals
    const mindHandler = ({ detail: feedInfo }: CustomEvent<GameTag>) => {
      const { attrs } = feedInfo;
      this._mind = {
        label: "mind",
        percent: parseInt((attrs.value as string) || "0"),
        value: (attrs.text as string) || "",
      };
    };
    bus.subscribeEvent<GameTag>("metadata/progressBar/mindState", mindHandler);
    this._eventHandlers.push({ event: "metadata/progressBar/mindState", handler: mindHandler, bus });

    const stanceHandler = ({ detail: feedInfo }: CustomEvent<GameTag>) => {
      const { attrs } = feedInfo;
      const value = (attrs.text as string) || "";
      const humanizedValue = value.split(/\s/)[0] || value;
      this._stance = {
        label: "stance",
        percent: 0, // Stance doesn't use percentage
        value: humanizedValue,
      };
    };
    bus.subscribeEvent<GameTag>("metadata/progressBar/pbarStance", stanceHandler);
    this._eventHandlers.push({ event: "metadata/progressBar/pbarStance", handler: stanceHandler, bus });

    const encumbranceHandler = ({ detail: feedInfo }: CustomEvent<GameTag>) => {
      const { attrs } = feedInfo;
      const value = (attrs.text as string) || "";
      this._encumbrance = {
        label: "encumbrance",
        percent: 0, // Encumbrance doesn't use percentage
        value: value.toLowerCase(),
      };
    };
    bus.subscribeEvent<GameTag>("metadata/progressBar/encumlevel", encumbranceHandler);
    this._eventHandlers.push({ event: "metadata/progressBar/encumlevel", handler: encumbranceHandler, bus });
  }

  private _cleanupEventListeners() {
    this._eventHandlers.forEach(({ event, handler, bus }) => {
      if (bus?._ele) {
        bus._ele.removeEventListener(event, handler as EventListener);
      }
    });
    this._eventHandlers = [];
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
