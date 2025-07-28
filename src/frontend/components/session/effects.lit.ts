// ABOUTME: Lit-based Effects component for displaying game dialog spell effects (spells, cooldowns, buffs, debuffs)
// ABOUTME: Uses SpellEffect components for clean text-based status indicators, not progress bars
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { GameTag } from "../../parser/tag";
import type { FrontendSession as Session } from "../../session/index";
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
      return;
    }

    this.session.bus.subscribeEvent<GameTag>(`metadata/dialogData/${this.name}`, ({ detail: dialog }) => {
      this.renderDialog(dialog);
    });
  }

  private renderDialog(dialog: GameTag) {
    if (dialog.children.length === 0) {
      this._spellEffects = [];
      return;
    }

    const progressBars = dialog.children.filter((child) => child.name === "progressBar");
    this._spellEffects = progressBars.map((bar) => {
      const { text, id, time, value } = bar.attrs;
      return {
        text: String(text || ""),
        id: String(id || ""),
        time: String(time || "").replace(/^0/, ""),
        value: String(value || ""),
      };
    });
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
