// ABOUTME: Lit-based SpellEffect component for displaying spell status indicators (not progress bars)
// ABOUTME: Clean text-based display with spell name and time remaining, styled for vertical list layout
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("illthorn-spell-effect")
export class SpellEffectLit extends LitElement {
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
  `;

  @property({ type: String })
  spellName = "";

  @property({ type: String })
  timeRemaining = "";

  @property({ type: String })
  spellId = "";

  @property({ type: Number })
  percent = 0;

  connectedCallback() {
    super.connectedCallback();
    this.updatePercentClasses();
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has("percent")) {
      this.updatePercentClasses();
    }

    if (changedProperties.has("spellId") && this.spellId) {
      this.dataset.spellId = this.spellId;
    }
  }

  private updatePercentClasses() {
    const percentRemaining = this.percent;

    // Toggle CSS classes based on percentage (same logic as ProgressBarLit)
    this.classList.toggle("high", percentRemaining >= 66);
    this.classList.toggle("medium", percentRemaining < 66 && percentRemaining >= 33);
    this.classList.toggle("low", percentRemaining < 33);
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
    "illthorn-spell-effect": SpellEffectLit;
  }
}
