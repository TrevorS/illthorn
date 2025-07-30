// ABOUTME: Modern Lit vital display components - VitalStat (with progress meter) and VitalText (text-only)
// ABOUTME: Shared components used by the main vitals container for different display types
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

// Type definitions for better type safety
type VitalThresholdCategory = "low" | "medium" | "high";

// Vital Stat Component (with progress meter)
@customElement("illthorn-vital-stat")
export class VitalStat extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 0.4em 0 0.2em;
      position: relative;
      color: var(--color-text-primary, #000);
      background: transparent;
    }

    .vital-row {
      display: flex;
      align-items: center;
      z-index: 1;
      position: relative;
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

    .vital-meter {
      position: absolute;
      height: 100%;
      top: 0;
      left: 0;
      background-color: var(--color-success, #4caf50);
      transition: width 0.2s ease;
    }

    :host(.medium) .vital-meter {
      background-color: var(--color-warning, #ff9800);
    }

    :host(.low) .vital-meter {
      background-color: var(--color-danger, #f44336);
    }

    :host(.low) {
      font-weight: bold;
    }
  `;

  @property({ type: String })
  label = "";

  @property({ type: String })
  value = "";

  @property({ type: Number })
  percent = 0;

  @property({ type: String, reflect: true, attribute: "data-vital" })
  dataVital = "";

  @property({ type: Boolean, reflect: true })
  low = false;

  @property({ type: Boolean, reflect: true })
  medium = false;

  @property({ type: Boolean, reflect: true })
  high = false;

  /**
   * Computed property that returns the percentage threshold category
   * for styling the vital stat based on current percentage
   */
  private get _thresholdCategory(): VitalThresholdCategory {
    if (this.percent < 33) {
      return "low";
    }
    if (this.percent < 66) {
      return "medium";
    }
    return "high";
  }

  /**
   * Computed property that returns CSS classes to apply to the host element
   * based on the current percentage threshold
   */
  private get _hostClasses(): Record<string, boolean> {
    const category = this._thresholdCategory;
    return {
      low: category === "low",
      medium: category === "medium",
      high: category === "high",
    };
  }

  /**
   * Computed property for the meter width style
   */
  private get _meterStyle(): string {
    return `width: ${Math.max(0, Math.min(100, this.percent))}%`;
  }

  willUpdate(changedProperties: Map<string | number | symbol, unknown>) {
    super.willUpdate(changedProperties);

    // Update dataVital property when label changes
    if (changedProperties.has("label")) {
      this.dataVital = this.label;
    }

    // Update threshold properties when percent changes
    if (changedProperties.has("percent")) {
      const category = this._thresholdCategory;
      this.low = category === "low";
      this.medium = category === "medium";
      this.high = category === "high";
    }
  }

  render() {
    return html`
      <div class="vital-meter" style="${this._meterStyle}"></div>
      <div class="vital-row">
        <span class="vital-label">${this.label}</span>
        <span class="vital-value">${this.value}</span>
      </div>
    `;
  }
}

// Vital Text Component (text-only, no meter)
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
    "illthorn-vital-stat": VitalStat;
    "illthorn-vital-text": VitalText;
  }
}
