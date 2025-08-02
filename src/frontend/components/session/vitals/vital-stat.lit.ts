// ABOUTME: VitalStat component with Shoelace progress bar for displaying vital statistics with percentages
// ABOUTME: Handles threshold-based styling, indeterminate states, and vital-specific color themes
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@shoelace-style/shoelace/dist/components/progress-bar/progress-bar.js";

// Type definitions for better type safety
type VitalThresholdCategory = "low" | "medium" | "high";

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

    .vital-container {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .vital-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 1;
      position: relative;
    }

    .vital-label {
      color: var(--color-text-primary, #ffffff);
      font-size: 0.9rem;
    }

    .vital-value {
      font-weight: bold;
      color: var(--color-text-primary, #ffffff);
      font-size: 0.9rem;
    }

    .vital-value.indeterminate {
      opacity: 0.6;
      font-style: italic;
    }

    sl-progress-bar {
      --height: 0.8rem;
      --track-color: rgba(255, 255, 255, 0.2);
      --indicator-color: #4caf50;
      width: 100%;
      margin-top: 0.125rem;
      display: block;
      
      /* Force override any inherited styles */
      --sl-color-primary-600: #4caf50;
      background: transparent;
      
      /* Force visible track background */
      --track-width: 100%;
      --track-border-color: rgba(255, 255, 255, 0.3);
      min-height: 0.8rem;
    }


    /* Threshold-based color overrides for critical states */
    sl-progress-bar.vital-low {
      --indicator-color: var(--color-vital-critical) !important;
      --sl-color-primary-600: var(--color-vital-critical) !important;
    }

    sl-progress-bar.vital-medium {
      opacity: 0.8;
    }

    sl-progress-bar.vital-high {
      opacity: 1.0;
    }

    /* Ensure the progress bar parts are visible with explicit colors */
    sl-progress-bar::part(base) {
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 0.25rem;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    sl-progress-bar::part(indicator) {
      background-color: var(--indicator-color, #4caf50);
      border-radius: 0.25rem;
    }

    /* Critical state override */
    sl-progress-bar.vital-low::part(indicator) {
      background-color: var(--color-vital-critical) !important;
    }

    :host(.low) {
      font-weight: bold;
    }
  `;

  @property({ type: String })
  label = "";

  @property({ type: String })
  value: string | undefined = undefined; // Optional - undefined means indeterminate state

  @property({ type: Number })
  percent: number | undefined = undefined; // Optional - undefined means indeterminate state

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
    if (this.percent === undefined || this.percent === null) {
      return "high"; // Default category for indeterminate state
    }
    if (this.percent < 33) {
      return "low";
    }
    if (this.percent < 66) {
      return "medium";
    }
    return "high";
  }

  /**
   * Computed property for the progress bar class based on threshold and vital type
   */
  private get _progressBarClass(): string {
    const vitalType = this.label.toLowerCase();
    return `vital-${this._thresholdCategory} vital-type-${vitalType}`;
  }

  /**
   * Computed property for accessible label combining label and value
   */
  private get _accessibleLabel(): string {
    return `${this.label}: ${this.value}`;
  }

  willUpdate(changedProperties: Map<string | number | symbol, unknown>) {
    super.willUpdate(changedProperties);

    // Update dataVital property when label changes
    if (changedProperties.has("label")) {
      this.dataVital = this.label;
    }

    // Update threshold properties when percent changes or on first update
    if (changedProperties.has("percent") || changedProperties.size === 0) {
      const category = this._thresholdCategory;
      this.low = category === "low";
      this.medium = category === "medium";
      this.high = category === "high";
    }
  }

  /**
   * Get inline style for progress bar color based on vital type
   */
  private get _progressBarStyle(): string {
    const vitalType = this.label.toLowerCase();
    let colorVar = "var(--color-vital-health)";

    // For indeterminate state, use default vital color (no critical override)
    if (this.percent === undefined || this.percent === null) {
      switch (vitalType) {
        case "health":
          colorVar = "var(--color-vital-health)";
          break;
        case "mana":
          colorVar = "var(--color-vital-mana)";
          break;
        case "stamina":
          colorVar = "var(--color-vital-stamina)";
          break;
        case "spirit":
          colorVar = "var(--color-vital-spirit)";
          break;
        case "mind":
          colorVar = "var(--color-vital-mind)";
          break;
      }
    } else {
      // Override with critical red if low
      if (this._thresholdCategory === "low") {
        colorVar = "var(--color-vital-critical)";
      } else {
        // Use stat-specific theme colors
        switch (vitalType) {
          case "health":
            colorVar = "var(--color-vital-health)";
            break;
          case "mana":
            colorVar = "var(--color-vital-mana)";
            break;
          case "stamina":
            colorVar = "var(--color-vital-stamina)";
            break;
          case "spirit":
            colorVar = "var(--color-vital-spirit)";
            break;
          case "mind":
            colorVar = "var(--color-vital-mind)";
            break;
        }
      }
    }

    return `--indicator-color: ${colorVar};`;
  }

  render() {
    // Handle display value for indeterminate state
    const displayValue = this.value ?? "...";
    const valueClass = this.value === undefined ? "vital-value indeterminate" : "vital-value";

    // For indeterminate state, we still set a value but also add indeterminate attribute
    const isIndeterminate = this.percent === undefined || this.percent === null;
    const progressValue = isIndeterminate ? 0 : (this.percent ?? 0);

    return html`
      <div class="vital-container">
        <div class="vital-row">
          <span class="vital-label">${this.label}</span>
          <span class="${valueClass}">${displayValue}</span>
        </div>
        <sl-progress-bar 
          value=${progressValue}
          ?indeterminate=${isIndeterminate}
          class=${this._progressBarClass}
          label=${this._accessibleLabel}
          style=${this._progressBarStyle}>
        </sl-progress-bar>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-vital-stat": VitalStat;
  }
}
