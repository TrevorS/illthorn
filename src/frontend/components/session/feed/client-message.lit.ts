// ABOUTME: Lit-based client message component for system/client output to game feed
// ABOUTME: Preserves multi-line formatting and provides clean styling for system messages

import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("illthorn-client-message-lit")
export class ClientMessageLit extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--font-family-monospace, "MonoLisa", monospace);
      font-size: 0.9em;
      line-height: 1.4;
      margin: 0;
      color: var(--color-client-message, var(--color-text-primary, #fff));
      padding: 4px 8px;
      background-color: var(--color-client-message-bg, var(--color-surface-secondary, rgba(0, 100, 255, 0.1)));
      border-left: 2px solid var(--color-client-message-border, var(--color-info, #0066ff));
      border-radius: 2px;
    }

    .message-content {
      white-space: pre-wrap;
      word-wrap: break-word;
      font-weight: normal;
      user-select: text;
    }
  `;

  @property({ type: String })
  message = "";

  @property({ type: Number })
  timestamp = 0;

  render() {
    return html`
      <div class="message-content">${this.message}</div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-client-message-lit": ClientMessageLit;
  }
}
