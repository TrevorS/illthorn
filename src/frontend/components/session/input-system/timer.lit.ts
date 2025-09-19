// ABOUTME: Simple timer display component for input system timer rail
// ABOUTME: Shows countdown/countup progress with label and color customization

import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("illthorn-timer-lit")
export class TimerLit extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      font-family: var(--font-family-ui, system-ui);
    }

    .timer {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding: 4px 6px;
      border-radius: 4px;
      background: var(--color-background, #ffffff);
      border: 1px solid var(--color-border, #dee2e6);
      min-width: 50px;
      box-sizing: border-box;
      cursor: pointer;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .timer:hover {
      border-color: var(--color-primary, #007acc);
    }

    .timer:focus {
      outline: none;
      border-color: var(--color-primary, #007acc);
      box-shadow: 0 0 0 2px var(--color-primary-alpha, rgba(0, 122, 204, 0.2));
    }

    /* Compact mode */
    :host(.compact) .timer {
      padding: 2px 4px;
      min-width: 40px;
    }

    /* Label */
    .label {
      font-size: 0.7em;
      font-weight: 600;
      color: var(--color-text-secondary, #6c757d);
      line-height: 1;
      white-space: nowrap;
      text-transform: uppercase;
    }

    :host(.compact) .label {
      font-size: 0.6em;
    }

    .timer.no-label .label {
      display: none;
    }

    /* Progress bar */
    .progress {
      width: 100%;
      height: 6px;
      background: var(--color-background-secondary, #f8f9fa);
      border-radius: 3px;
      overflow: hidden;
      position: relative;
    }

    :host(.compact) .progress {
      height: 4px;
    }

    .progress-fill {
      height: 100%;
      background: var(--timer-color, #007acc);
      border-radius: inherit;
      transition: width 0.3s ease, background-color 0.2s ease;
      min-width: 2px;
    }

    /* Value display */
    .value {
      font-size: 0.8em;
      font-weight: 600;
      color: var(--color-text-primary, #212529);
      line-height: 1;
      min-height: 1em;
    }

    :host(.compact) .value {
      font-size: 0.7em;
    }

    /* Urgent state */
    .timer.urgent {
      border-color: var(--color-danger, #dc3545);
      animation: pulse 1s infinite;
    }

    .timer.urgent .progress-fill {
      background: var(--color-danger, #dc3545);
    }

    .timer.urgent .value {
      color: var(--color-danger, #dc3545);
    }

    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 0 var(--color-danger-alpha, rgba(220, 53, 69, 0.4)); }
      50% { box-shadow: 0 0 0 4px var(--color-danger-alpha, rgba(220, 53, 69, 0.1)); }
    }

    /* Theme integration */
    :host([theme="dark"]) .timer {
      background: var(--color-background-dark, #343a40);
      border-color: var(--color-border-dark, #495057);
    }

    /* Accessibility */
    .timer[role="button"] {
      cursor: pointer;
    }

    .timer[aria-disabled="true"] {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `;

  @property({ type: String })
  id: string = "";

  @property({ type: String })
  label: string = "";

  @property({ type: Number })
  value: number = 0;

  @property({ type: Number })
  maxValue: number = 100;

  @property({ type: String })
  type: "countdown" | "countup" | "static" = "countdown";

  @property({ type: String })
  color: string = "#007acc";

  @property({ type: Boolean })
  urgent: boolean = false;

  @property({ type: Boolean })
  compact: boolean = false;

  @property({ type: Boolean })
  showLabel: boolean = true;

  @property({ type: Boolean })
  disabled: boolean = false;

  @property({ type: Boolean })
  interactive: boolean = true;

  connectedCallback() {
    super.connectedCallback();

    // Set accessibility attributes
    if (this.interactive) {
      this.setAttribute("role", "button");
      this.setAttribute("tabindex", "0");
    }
  }

  updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // Update CSS classes based on properties
    this.className = [
      this.compact ? "compact" : "",
    ]
      .filter(Boolean)
      .join(" ");

    // Update accessibility
    if (this.interactive) {
      this.setAttribute("aria-disabled", this.disabled.toString());
      this.setAttribute("aria-label", this._getAriaLabel());
    }
  }

  render() {
    const progress = this._getProgress();
    const displayValue = this._getDisplayValue();

    return html`
      <div
        class="timer ${this.urgent ? 'urgent' : ''} ${!this.showLabel ? 'no-label' : ''}"
        style="--timer-color: ${this.color}"
        @click=${this._handleClick}
        @keydown=${this._handleKeydown}
      >
        <div class="label">${this.label}</div>
        <div class="progress">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <div class="value">${displayValue}</div>
      </div>
    `;
  }

  private _getProgress(): number {
    if (this.maxValue <= 0) {
      return 0;
    }

    if (this.type === "countdown") {
      return Math.max(0, Math.min(100, (this.value / this.maxValue) * 100));
    } else if (this.type === "countup") {
      return Math.max(0, Math.min(100, (this.value / this.maxValue) * 100));
    } else {
      // Static - just show the percentage of max
      return Math.max(0, Math.min(100, (this.value / this.maxValue) * 100));
    }
  }

  private _getDisplayValue(): string {
    if (this.type === "countdown" || this.type === "countup") {
      return this._formatTime(this.value);
    } else {
      // Static - show value/max or just value
      if (this.maxValue && this.maxValue !== 100) {
        return `${this.value}/${this.maxValue}`;
      } else {
        return this.value.toString();
      }
    }
  }

  private _formatTime(seconds: number): string {
    if (seconds < 0) {
      return "0s";
    }

    if (seconds < 60) {
      return `${Math.floor(seconds)}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return remainingSeconds > 0 ? `${minutes}m${remainingSeconds}s` : `${minutes}m`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return minutes > 0 ? `${hours}h${minutes}m` : `${hours}h`;
    }
  }

  private _getAriaLabel(): string {
    const typeDesc = this.type === "countdown" ? "countdown" :
                    this.type === "countup" ? "countup" : "timer";
    const valueDesc = this._getDisplayValue();
    const statusDesc = this.urgent ? " urgent" : "";

    return `${this.label} ${typeDesc}: ${valueDesc}${statusDesc}`;
  }

  private _handleClick(e: Event) {
    if (!this.interactive || this.disabled) {
      return;
    }

    e.stopPropagation();
    this._dispatchTimerEvent("timer-clicked");
  }

  private _handleKeydown(e: KeyboardEvent) {
    if (!this.interactive || this.disabled) {
      return;
    }

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      this._dispatchTimerEvent("timer-clicked");
    }
  }

  private _dispatchTimerEvent(eventType: string) {
    this.dispatchEvent(
      new CustomEvent(eventType, {
        detail: {
          id: this.id,
          label: this.label,
          value: this.value,
          type: this.type,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  // Public API methods

  /**
   * Focus the timer
   */
  focus() {
    const timer = this.shadowRoot!.querySelector('.timer') as HTMLElement;
    if (timer) {
      timer.focus();
    }
  }

  /**
   * Update the timer value
   */
  updateValue(newValue: number) {
    this.value = newValue;

    // Check if timer should be marked as expired
    if (this.type === "countdown" && newValue <= 0) {
      this._dispatchTimerEvent("timer-expired");
    }
  }

  /**
   * Set urgent state
   */
  setUrgent(urgent: boolean) {
    this.urgent = urgent;
  }

  /**
   * Reset timer to initial state
   */
  reset() {
    if (this.type === "countdown") {
      this.value = this.maxValue;
    } else if (this.type === "countup") {
      this.value = 0;
    }
    this.urgent = false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-timer-lit": TimerLit;
  }
}