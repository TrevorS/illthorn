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

    /* Dark King theme styling for specific vitals */
    :host-context([theme='dark-king']) {
      border: 0;
      position: relative;
      font-size: 1.2em;
      margin-bottom: 0;
      padding-bottom: 0.5em;
      border-bottom: 1px solid black;
      box-shadow: 0 1px 1px 0 #282323;
    }

    :host-context([theme='dark-king']) .vital-label {
      font-family: "DutchMediaeval", serif;
    }

    /* Spirit vital background */
    :host([data-vital="spirit"]:host-context([theme='dark-king'])) {
      background: linear-gradient(5deg, rgba(169, 144, 239, 0.2), rgba(169, 144, 239, 0));
      margin-left: -1em;
      width: calc(100% + 2em);
      padding: 0.7em 1em 0.5em;
    }

    :host([data-vital="spirit"]:host-context([theme='dark-king'])) .vital-label,
    :host([data-vital="spirit"]:host-context([theme='dark-king'])) .vital-value {
      color: #a990ef;
    }

    /* Health vital background */
    :host([data-vital="health"]:host-context([theme='dark-king'])) {
      background: linear-gradient(5deg, rgba(145, 214, 134, 0.2), rgba(145, 214, 134, 0));
      margin-left: -1em;
      width: calc(100% + 2em);
      padding: 0.7em 1em 0.5em;
    }

    :host([data-vital="health"]:host-context([theme='dark-king'])) .vital-label,
    :host([data-vital="health"]:host-context([theme='dark-king'])) .vital-value {
      color: #91d686;
    }

    /* Mana vital background */
    :host([data-vital="mana"]:host-context([theme='dark-king'])) {
      background: linear-gradient(5deg, rgba(108, 173, 208, 0.2), rgba(108, 173, 208, 0));
      margin-left: -1em;
      width: calc(100% + 2em);
      padding: 0.7em 1em 0.5em;
    }

    :host([data-vital="mana"]:host-context([theme='dark-king'])) .vital-label,
    :host([data-vital="mana"]:host-context([theme='dark-king'])) .vital-value {
      color: #6cadd0;
    }

    /* Stamina vital background */
    :host([data-vital="stamina"]:host-context([theme='dark-king'])) {
      background: linear-gradient(5deg, rgba(251, 177, 123, 0.2), rgba(251, 177, 123, 0));
      margin-left: -1em;
      width: calc(100% + 2em);
      padding: 0.7em 1em 0.5em;
    }

    :host([data-vital="stamina"]:host-context([theme='dark-king'])) .vital-label,
    :host([data-vital="stamina"]:host-context([theme='dark-king'])) .vital-value {
      color: #fbb17b;
    }

    /* Low vital warning styling for dark-king */
    :host(.low:host-context([theme='dark-king'])) {
      background: linear-gradient(5deg, rgba(var(--danger-rgb, 214, 78, 78), 0.2), rgba(var(--danger-rgb, 214, 78, 78), 0)),
                  radial-gradient(ellipse at top right, rgba(255, 0, 0, 0.5), rgba(255, 0, 0, 0));
    }

    :host(.low:host-context([theme='dark-king']))::before {
      content: "⚠️";
      display: inline-block;
      line-height: 1;
    }
  `;

  @property({ type: String })
  label = "";

  @property({ type: String })
  value = "";

  @property({ type: Number })
  percent = 0;

  connectedCallback() {
    super.connectedCallback();
    // Set data-vital attribute for theme styling
    this.setAttribute("data-vital", this.label);
  }

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

    /* Dark King theme styling for text vitals */
    :host-context([theme='dark-king']) {
      margin-top: 28px;
      padding-bottom: 0.5em;
      border-bottom: 1px solid black;
      box-shadow: 0 1px 1px 0 #282323;
    }

    :host([data-vital="encumbrance"]:host-context([theme='dark-king']))::before {
      content: "ENCUMBRANCE";
      display: block;
      position: absolute;
      top: -10px;
      left: 0;
      font-size: 0.65em;
      text-transform: uppercase;
      opacity: 0.6;
    }

    :host([data-vital="mind"]:host-context([theme='dark-king']))::before {
      content: "MIND";
      display: block;
      position: absolute;
      top: -10px;
      left: 0;
      font-size: 0.65em;
      text-transform: uppercase;
      opacity: 0.6;
    }

    :host([data-vital="stance"]:host-context([theme='dark-king']))::before {
      content: "STANCE";
      display: block;
      position: absolute;
      top: -10px;
      left: 0;
      font-size: 0.65em;
      text-transform: uppercase;
      opacity: 0.6;
    }
  `;

  @property({ type: String })
  label = "";

  @property({ type: String })
  value = "";

  connectedCallback() {
    super.connectedCallback();
    // Set data-vital attribute for theme styling
    this.setAttribute("data-vital", this.label);

    // Set inverted class for encumbrance (lower is better)
    if (this.label === "encumbrance") {
      this.classList.add("inverted");
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
