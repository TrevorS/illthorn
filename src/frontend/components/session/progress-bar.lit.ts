// ABOUTME: Lit-based ProgressBar component for displaying game progress bars with dynamic meter fill
// ABOUTME: Maintains API compatibility with vanilla ProgressBar including constructor name parameter and attribute setters
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("illthorn-progress-bar-lit")
export class ProgressBarLit extends LitElement {
  static styles = css`
    /* Use minimal styles since most styling comes from external SCSS */
    .meter {
      position: absolute;
      height: 100%;
      top: 0;
      left: 0;
      transition: width 0.2s ease;
    }

    span {
      z-index: 1;
      position: relative;
    }

    /* These styles match _vitals.scss */
    :host(.high) .meter {
      background-color: var(--ok);
    }

    :host(.medium) .meter {
      background-color: var(--warn);
    }

    :host(.low) {
      background-color: var(--danger);
      font-weight: bold;
    }

    :host(.low) .meter {
      background-color: var(--danger);
    }
  `;

  @property({ type: String })
  title = "";

  @property({ type: String })
  percent = "";

  @property({ type: String })
  value = "";

  constructor(name?: string) {
    super();
    if (name) {
      this.classList.add(name.toLocaleLowerCase().replace(/\s+/g, "-"));
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.updatePercent(this.percent);
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has("percent")) {
      this.updatePercentClasses(this.percent);
    }
  }

  updateText(text: string) {
    this.title = text;
  }

  updateValue(value: string) {
    this.value = value;
  }

  updatePercent(percentEmptyStr: string) {
    this.percent = percentEmptyStr;
    this.updatePercentClasses(percentEmptyStr);
  }

  private updatePercentClasses(percentEmptyStr: string) {
    const parsed = parseInt(percentEmptyStr || "0");
    const percentRemaining = Number.isNaN(parsed) ? 0 : parsed;

    // Toggle CSS classes based on percentage
    this.classList.toggle("high", percentRemaining >= 66);
    this.classList.toggle("medium", percentRemaining < 66 && percentRemaining >= 33);
    this.classList.toggle("low", percentRemaining < 33);
  }

  render() {
    const parsed = parseInt(this.percent || "0");
    const percentRemaining = Number.isNaN(parsed) ? 0 : parsed;
    return html`
      <span class="meter" style="width: ${percentRemaining}%"></span>
      <span class="flavor-text">${this.title}</span>
      <span class="value">${this.value}</span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-progress-bar-lit": ProgressBarLit;
  }
}
