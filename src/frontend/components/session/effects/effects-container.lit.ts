// ABOUTME: Smart container component that manages effects state via session events
// ABOUTME: Subscribes to metadata/dialogData events and passes processed spell effects to UI component
import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { GameTag } from "../../../parser/tag";
import type { FrontendSession as Session } from "../../../session/index";
import { logEffectsEvent } from "../../../util/logger";
import "./effects-ui.lit";
import type { SpellEffectData } from "./effects-ui.lit";

@customElement("illthorn-effects-container")
export class EffectsContainer extends LitElement {
  @property({ type: Object })
  session: Session | null = null;

  @property({ type: String })
  name = "";

  @state()
  private _spellEffects: Array<SpellEffectData> = [];

  private _eventListenerSetup = false;

  constructor(session?: Session, name?: string) {
    super();
    if (session) {
      this.session = session;
    }
    if (name) {
      this.name = name;
    }
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.session && this.name && !this._eventListenerSetup) {
      this.setupEventListeners();
      this._eventListenerSetup = true;
    }
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has("session") || changedProperties.has("name")) {
      if (this.session && this.name && !this._eventListenerSetup) {
        this.setupEventListeners();
        this._eventListenerSetup = true;
      }
    }
  }

  private setupEventListeners() {
    if (!this.session || !this.session.bus || !this.name) {
      logEffectsEvent(this.constructor.name, "Cannot attach listeners - missing session, bus, or name", {
        hasSession: !!this.session,
        hasBus: !!this.session?.bus,
        name: this.name,
      });
      return;
    }

    const eventName = `metadata/dialogData/${this.name}`;
    logEffectsEvent(this.constructor.name, `Subscribing to event: ${eventName}`);

    this.session.bus.subscribeEvent<GameTag>(eventName, ({ detail: dialog }) => {
      logEffectsEvent(this.constructor.name, `Received dialog event for ${this.name}`, dialog);
      this.processDialogData(dialog);
    });
  }

  private processDialogData(dialog: GameTag) {
    logEffectsEvent(this.constructor.name, `Processing dialog for ${this.name}`, {
      childrenCount: dialog.children.length,
      children: dialog.children.map((c) => c.name),
    });

    if (dialog.children.length === 0) {
      logEffectsEvent(this.constructor.name, `No children found in dialog for ${this.name} - clearing effects`);
      this._spellEffects = [];
      return;
    }

    const progressBars = dialog.children.filter((child) => child.name === "progressBar");
    logEffectsEvent(this.constructor.name, `Found ${progressBars.length} progressBar elements`, {
      total: dialog.children.length,
      progressBars: progressBars.length,
      progressBarAttrs: progressBars.map((bar) => bar.attrs),
    });

    this._spellEffects = progressBars.map((bar) => {
      const { text, id, time, value } = bar.attrs;
      const effectData = {
        text: String(text || ""),
        id: String(id || ""),
        time: String(time || "").replace(/^0/, ""),
        value: String(value || ""),
      };
      logEffectsEvent(this.constructor.name, `Mapped progress bar to spell effect`, effectData);
      return effectData;
    });

    logEffectsEvent(this.constructor.name, `Final spell effects count: ${this._spellEffects.length}`);
  }

  render() {
    return html`<illthorn-effects-ui .spellEffects=${this._spellEffects} .name=${this.name}></illthorn-effects-ui>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-effects-container": EffectsContainer;
  }
}
