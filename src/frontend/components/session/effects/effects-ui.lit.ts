// ABOUTME: Pure UI component for effects display with no event handling dependencies
// ABOUTME: Takes spellEffects array as reactive property and renders list of spell effect components
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./spell-effect.lit";

// Shared interface for spell effect data
export interface SpellEffectData {
  text: string;
  id: string;
  time: string;
  value: string;
}

@customElement("illthorn-effects-ui")
export class EffectsUI extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: Array })
  spellEffects: Array<SpellEffectData> = [];

  @property({ type: String })
  name = "";

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has("name") && this.name) {
      this.classList.add(this.name.toLocaleLowerCase().replace(/\s/g, "-"));
    }
  }

  render() {
    return html`
      ${this.spellEffects.map(
        (spellData) => html`
        <illthorn-spell-effect 
          .spellName=${spellData.text}
          .timeRemaining=${spellData.time}
          .spellId=${spellData.id}
          .percent=${parseInt(spellData.value || "0", 10)}>
        </illthorn-spell-effect>
      `,
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-effects-ui": EffectsUI;
  }
}
