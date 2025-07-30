// ABOUTME: Lit-based SpellEffect component for displaying spell status indicators (not progress bars)
// ABOUTME: Clean text-based display with spell name and time remaining, styled for vertical list layout
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("illthorn-spell-effect")
export class SpellEffect extends LitElement {
  static styles = css`
    :host {
      display: block;
      margin: 0;
      padding: 0;
    }

    .spell-item {
      display: flex;
      width: 100%;
      margin-left: 0;
      padding: 0.4em 0 0.2em;
      align-items: center;
    }

    .spell-name {
      text-align: left;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      flex: 1;
      margin-right: 0.5em;
      font-weight: normal;
    }

    .spell-time {
      text-align: right;
      min-width: 45px;
      flex-shrink: 0;
      font-size: 0.9em;
      opacity: 0.8;
    }

    /* Low time warning styles */
    :host(.low) .spell-name,
    :host(.low) .spell-time {
      color: var(--danger, #ff6e6e);
      font-weight: bold;
    }

    /* Medium time warning styles */
    :host(.medium) .spell-name,
    :host(.medium) .spell-time {
      color: var(--warn, #ffa500);
    }

    /* High time styles (default/good) */
    :host(.high) .spell-name,
    :host(.high) .spell-time {
      color: var(--ok, #90ee90);
    }

    /* Dark King theme styling */
    :host-context([theme='dark-king']) .spell-item {
      padding-bottom: 0.5em;
      border-bottom: 1px solid black;
      box-shadow: 0 1px 1px 0 #282323;
    }

    :host-context([theme='dark-king']) .spell-item:hover {
      background: black;
    }

    :host-context([theme='dark-king']) .spell-item .spell-name {
      text-align: left;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    :host-context([theme='dark-king']).low .spell-name {
      color: #ff6e6e;
    }
  `;

  @property({ type: String })
  spellName = "";

  @property({ type: String })
  timeRemaining = "";

  @property({ type: String })
  spellId = "";

  @property({ type: Number })
  percent = 0;

  /**
   * Computed property that returns the percentage threshold category
   * for styling the spell effect based on time remaining
   */
  private get _percentageCategory(): "low" | "medium" | "high" {
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
    const category = this._percentageCategory;
    return {
      low: category === "low",
      medium: category === "medium",
      high: category === "high",
    };
  }

  firstUpdated() {
    // Apply initial percentage classes
    this._updateHostClasses();

    // Set initial spell ID dataset if provided
    if (this.spellId) {
      this.dataset.spellId = this.spellId;
    }
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has("percent")) {
      this._updateHostClasses();
    }

    if (changedProperties.has("spellId")) {
      if (this.spellId) {
        this.dataset.spellId = this.spellId;
      } else {
        delete this.dataset.spellId;
      }
    }
  }

  /**
   * Updates the host element CSS classes based on percentage thresholds
   * Uses computed properties for cleaner, more predictable class management
   */
  private _updateHostClasses(): void {
    const classes = this._hostClasses;

    // Apply classes based on computed state
    this.classList.toggle("low", classes.low);
    this.classList.toggle("medium", classes.medium);
    this.classList.toggle("high", classes.high);
  }

  render() {
    return html`
      <div class="spell-item">
        <span class="spell-name">${this.spellName}</span>
        <span class="spell-time">${this.timeRemaining}</span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-spell-effect": SpellEffect;
  }
}
