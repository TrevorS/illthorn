// ABOUTME: Vital display components - VitalStat (with progress meter) and VitalText (text-only)
// ABOUTME: Shared components used by the main vitals container for different display types
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

// Vital Stat Component (with progress meter)
@customElement("illthorn-vital-stat")
export class VitalStat extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 0.4em 0 0.2em;
      position: relative;
    }

    .vital-row {
      display: flex;
      align-items: center;
      z-index: 1;
      position: relative;
    }

    .vital-label {
      flex: 1;
    }

    .vital-value {
      margin-left: auto;
      font-weight: bold;
    }

    .vital-meter {
      position: absolute;
      height: 100%;
      top: 0;
      left: 0;
      background-color: var(--ok);
      transition: width 0.2s ease;
    }

    :host(.medium) .vital-meter {
      background-color: var(--warn);
    }

    :host(.low) .vital-meter {
      background-color: var(--danger);
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

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has("percent")) {
      this.updatePercentClasses(this.percent);
    }
  }

  private updatePercentClasses(percent: number) {
    this.classList.toggle("high", percent >= 66);
    this.classList.toggle("medium", percent < 66 && percent >= 33);
    this.classList.toggle("low", percent < 33);
  }

  render() {
    return html`
      <div class="vital-meter" style="width: ${this.percent}%"></div>
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
    }

    .vital-row {
      display: flex;
      align-items: center;
    }

    .vital-label {
      flex: 1;
    }

    .vital-value {
      margin-left: auto;
      font-weight: bold;
    }
  `;

  @property({ type: String })
  label = "";

  @property({ type: String })
  value = "";

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
