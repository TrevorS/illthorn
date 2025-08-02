// ABOUTME: Presentational component for displaying individual hand (left/right/spell) content
// ABOUTME: Pure UI component with no session logic, receives content and hand type as properties
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("illthorn-hand-ui")
export class HandUI extends LitElement {
  static styles = css`
    :host {
      padding: 0 1em;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      -webkit-app-region: no-drag;
      min-width: 0; /* Allow flex shrinking */
    }

    .hand-icon {
      display: inline-block;
      margin-right: 0.5em;
      font-size: var(--icon-size, 1em);
      flex-shrink: 0;
    }

    .hand-content {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 8em;
    }
  `;

  @property({ type: String })
  handType = "";

  @property({ type: String })
  content = "None";

  connectedCallback() {
    super.connectedCallback();
    this._updateCssClass();
  }

  willUpdate(changedProperties: Map<string | number | symbol, unknown>) {
    super.willUpdate(changedProperties);

    // Handle CSS class updates when handType changes
    if (changedProperties.has("handType")) {
      this._updateCssClass(changedProperties.get("handType") as string);
    }
  }

  private _updateCssClass(oldHandType?: string) {
    if (oldHandType) {
      this.classList.remove(oldHandType);
    }
    if (this.handType) {
      this.classList.add(this.handType);
    }
  }

  private getHandIcon(): string {
    if (this.handType === "spell") {
      return "🪄";
    }
    if (this.handType === "right") {
      return "🤚"; // Right hand (back of hand)
    }
    return "✋"; // Left hand (palm)
  }

  render() {
    return html`
      <span class="hand-icon">${this.getHandIcon()}</span>
      <span class="hand-content">${this.content}</span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-hand-ui": HandUI;
  }
}
