// ABOUTME: Presentational component for displaying individual hand row in hands layout
// ABOUTME: Shows emoji icon next to content for left hand, right hand, or spell preparation with proper styling
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("illthorn-hand-row")
export class HandRow extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-width: 0;
      padding: 0.15em 0;
    }

    .hand-container {
      display: flex;
      flex-direction: row;
      gap: 0.5em;
      min-width: 0;
      align-items: center;
    }

    .hand-icon {
      font-size: 1.2em;
      line-height: 1;
      flex-shrink: 0;
      transition: opacity 0.2s ease;
    }

    .hand-content {
      font-size: 1em;
      line-height: 1.2;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
      min-width: 0;
      transition: color 0.2s ease, opacity 0.2s ease;
    }

    :host(.empty) .hand-content {
      color: var(--color-text-secondary);
      font-style: italic;
    }

    :host(.empty) .hand-icon {
      opacity: 0.6;
    }
  `;

  @property({ type: String })
  handType = "";

  @property({ type: String })
  content = "";

  connectedCallback() {
    super.connectedCallback();
    this._updateCssClass();
  }

  willUpdate(changedProperties: Map<string | number | symbol, unknown>) {
    super.willUpdate(changedProperties);

    if (changedProperties.has("handType") || changedProperties.has("content")) {
      this._updateCssClass();
    }
  }

  private _updateCssClass() {
    // Remove existing state classes
    this.classList.remove("empty");

    // Add empty state for appropriate content
    const isEmpty = this.content === "Empty" || this.content === "None" || !this.content;
    if (isEmpty) {
      this.classList.add("empty");
    }
  }

  private getHandIcon(): string {
    if (this.handType === "spell") {
      return "✨";
    }
    if (this.handType === "right") {
      return "🤚"; // Right hand (back of hand)
    }
    return "✋"; // Left hand (palm)
  }

  render() {
    return html`
      <div class="hand-container">
        <div class="hand-icon">${this.getHandIcon()}</div>
        <div class="hand-content" title=${this.content}>${this.content}</div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-hand-row": HandRow;
  }
}
