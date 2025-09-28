// ABOUTME: Smart container component that manages effects state via session events
// ABOUTME: Subscribes to metadata/dialogData events and passes processed spell effects to UI component - now using BaseContainerComponent
import { html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { GameTag } from "../../../parser/tag";
import type { FrontendSession as Session } from "../../../session/index";
import { logEffectsEvent } from "../../../util/logger";
import { BaseContainerComponent } from "../../mixins/base-container.lit";
import "./effects-ui.lit";
import type { SpellEffectData } from "./effects-ui.lit";

@customElement("illthorn-effects-container")
export class EffectsContainer extends BaseContainerComponent {
  @property({ type: String })
  name = "";

  @state()
  private _spellEffects: Array<SpellEffectData> = [];

  protected getStateToStore(): Record<string, unknown> {
    return {
      spellEffects: this._spellEffects,
    };
  }

  protected restoreState(state: Record<string, unknown>): void {
    this._spellEffects = (state.spellEffects as Array<SpellEffectData>) || [];
  }

  protected getStorageKeyPrefix(): string {
    return `effects-${this.name}`;
  }

  constructor(session?: Session, name?: string) {
    super();
    if (session) {
      this.session = session;
    }
    if (name) {
      this.name = name;
    }
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    // Re-setup event listeners if name changes (since event name depends on name)
    if (changedProperties.has("name") && this.isSessionReady) {
      this.refreshEventSubscriptions();
    }
  }

  protected getSessionEventSubscriptions() {
    if (!this.name) {
      logEffectsEvent(this.constructor.name, "Cannot setup listeners - missing name", {
        hasSession: !!this.session,
        hasBus: !!this.session?.bus,
        name: this.name,
      });
      return [];
    }

    const eventName = `metadata/dialogData/${this.name}`;
    logEffectsEvent(this.constructor.name, `Setting up subscription for event: ${eventName}`);

    return [
      {
        eventName,
        handler: this.createStatePersistingHandler((tag: GameTag) => {
          logEffectsEvent(this.constructor.name, `Received dialog event for ${this.name}`, tag);
          this.processDialogData(tag);
        }),
      },
    ];
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
