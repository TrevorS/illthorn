// ABOUTME: Lit-based Effects component for displaying game dialog spell effects (spells, cooldowns, buffs, debuffs)
// ABOUTME: Uses SpellEffect components for clean text-based status indicators, not progress bars
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { GameTag } from "../../parser/tag";
import type { FrontendSession as Session } from "../../session/index";
import { logEffectsEvent } from "../../util/logger";
import "./spell-effect.lit";

interface SpellEffectData {
  text: string;
  id: string;
  time: string;
  value: string;
}

@customElement("illthorn-effects-lit")
export class EffectsLit extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: Object })
  session: Session | null = null;

  @property({ type: String })
  name = "";

  @state()
  private _spellEffects: Array<SpellEffectData> = [];

  constructor(session?: Session, name?: string) {
    super();
    if (session) {
      this.session = session;
    }
    if (name) {
      this.name = name;
      this.classList.add(name.toLocaleLowerCase().replace(/\s/g, "-"));
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.attachListeners();
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has("name") && this.name) {
      this.classList.add(this.name.toLocaleLowerCase().replace(/\s/g, "-"));
    }
  }

  private attachListeners() {
    if (!this.session || !this.name) {
      logEffectsEvent(this.constructor.name, "Cannot attach listeners - missing session or name", {
        hasSession: !!this.session,
        name: this.name,
      });
      return;
    }

    const eventName = `metadata/dialogData/${this.name}`;
    logEffectsEvent(this.constructor.name, `Subscribing to event: ${eventName}`);

    this.session.bus.subscribeEvent<GameTag>(eventName, ({ detail: dialog }) => {
      logEffectsEvent(this.constructor.name, `Received dialog event for ${this.name}`, dialog);
      this.renderDialog(dialog);
    });
  }

  private renderDialog(dialog: GameTag) {
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
    return html`
      ${this._spellEffects.map(
        (spellData) => html`
        <illthorn-spell-effect 
          .spellName=${spellData.text}
          .timeRemaining=${spellData.time}
          .spellId=${spellData.id}
          .percent=${parseInt(spellData.value || "0")}>
        </illthorn-spell-effect>
      `,
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-effects-lit": EffectsLit;
  }
}
