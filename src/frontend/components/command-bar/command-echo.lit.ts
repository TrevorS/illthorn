// ABOUTME: Lit component for displaying command echoes in the game feed
// ABOUTME: Handles both regular command echoes and replay command echoes with proper styling

import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("illthorn-command-echo-lit")
export class CommandEcho extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: "MonoLisa", monospace;
      font-size: 1em;
      line-height: 1.4;
      margin: 2px 0;
    }

    .command-echo {
      color: var(--color-command-echo, #ccc);
      padding: 2px 4px;
      border-left: 2px solid var(--color-command-echo-border, #666);
      background-color: var(--color-command-echo-bg, rgba(255, 255, 255, 0.05));
    }

    .command-echo.replay {
      color: var(--color-command-replay, #ffcc00);
      border-left-color: var(--color-command-replay-border, #ff9900);
      background-color: var(--color-command-replay-bg, rgba(255, 204, 0, 0.1));
      font-style: italic;
    }

    .prefix {
      opacity: 0.7;
      margin-right: 4px;
    }

    .command-text {
      font-weight: normal;
    }
  `;

  @property({ type: String })
  command = "";

  @property({ type: Boolean })
  isReplay = false;

  render() {
    if (!this.command) {
      return html``;
    }

    const cssClass = this.isReplay ? "command-echo replay" : "command-echo";
    const prefix = this.isReplay ? "[Replay]" : ">";

    return html`
      <div class="${cssClass}">
        <span class="prefix">${prefix}</span>
        <span class="command-text">${this.command}</span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-command-echo-lit": CommandEcho;
  }
}
