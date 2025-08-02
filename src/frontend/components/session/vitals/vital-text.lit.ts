// ABOUTME: VitalText component for displaying text-only vital statistics without progress bars
// ABOUTME: Used for stance, encumbrance, and other vitals that don't need percentage display
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("illthorn-vital-text")
export class VitalText extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 0.4em 0 0.2em;
      position: relative;
      color: var(--color-text-primary, #ffffff);
      background: transparent;
    }

    .vital-row {
      display: flex;
      align-items: center;
    }

    .vital-label {
      flex: 1;
      color: var(--color-text-primary, #ffffff);
    }

    .vital-value {
      margin-left: auto;
      font-weight: bold;
      color: var(--color-text-primary, #ffffff);
    }
  `;

  @property({ type: String })
  label = "";

  @property({ type: String })
  value = "";

  @property({ type: String, reflect: true, attribute: "data-vital" })
  dataVital = "";

  @property({ type: Boolean, reflect: true })
  inverted = false;

  /**
   * Computed property to determine if this vital type is inverted
   * (where lower values are better, like encumbrance)
   */
  private get _isInvertedVital(): boolean {
    return this.label === "encumbrance";
  }

  willUpdate(changedProperties: Map<string | number | symbol, unknown>) {
    super.willUpdate(changedProperties);

    // Update dataVital property when label changes
    if (changedProperties.has("label")) {
      this.dataVital = this.label;
      this.inverted = this._isInvertedVital;
    }
  }

  render() {
    return html`
      <div class="vital-row">
        <span class="vital-label">${this.label}</span>
        <span class="vital-value">${this.value}</span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-vital-text": VitalText;
  }
}
