// ABOUTME: Lit-based command echo component with Shoelace integration for improved UX
// ABOUTME: Provides interactive command echoing with copy functionality and timestamp tooltips

import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@shoelace-style/shoelace/dist/components/tag/tag.js";
import "@shoelace-style/shoelace/dist/components/tooltip/tooltip.js";

@customElement("illthorn-command-echo-lit")
export class CommandEchoLit extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--font-family-monospace, "MonoLisa", monospace);
      font-size: 0.9em;
      line-height: 1.4;
      margin: 0;
      color: var(--color-command-echo, var(--color-text-secondary, #ccc));
      padding: 1px 0;
      border-left: 1px solid var(--color-command-echo-border, var(--color-border, #666));
      background-color: var(--color-command-echo-bg, var(--color-surface-secondary, rgba(255, 255, 255, 0.05)));
    }

    :host([is-replay]) {
      color: var(--color-command-echo-replay, var(--color-text-secondary, #ffcc00));
      border-left-color: var(--color-command-echo-replay-border, var(--color-border, #ff9900));
      background-color: var(--color-command-echo-replay-bg, var(--color-surface-secondary, rgba(255, 204, 0, 0.1)));
      font-style: italic;
    }

    .command-container {
      display: flex;
      align-items: center;
      padding: 2px 6px;
      gap: 4px;
    }

    sl-tag {
      --sl-color-neutral-600: var(--color-command-echo, var(--color-text-secondary, #ccc));
      --sl-color-primary-600: var(--color-command-echo-replay, var(--color-text-secondary, #ffcc00));
    }

    sl-tag::part(base) {
      font-size: 0.75em;
      font-family: var(--font-family-monospace, "MonoLisa", monospace);
      border: none;
      padding: 1px 6px;
      opacity: 0.8;
      height: auto;
      line-height: 1;
    }

    .command-text {
      font-weight: normal;
      font-style: italic;
      cursor: pointer;
      user-select: text;
      flex-grow: 1;
      transition: background-color 0.15s ease;
      padding: 1px 4px;
      border-radius: 2px;
    }

    .command-text:hover {
      background-color: var(--color-surface);
    }

    .command-text:active {
      background-color: var(--color-surface-secondary);
    }

    /* Tooltip styles */
    sl-tooltip::part(body) {
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      color: var(--color-text-primary);
      font-size: 0.8em;
      font-family: var(--font-family-monospace, "MonoLisa", monospace);
    }
  `;

  @property({ type: String })
  command = "";

  @property({ type: Boolean, attribute: "is-replay", reflect: true })
  isReplay = false;

  @property({ type: Number })
  timestamp = 0;

  private async _copyCommand() {
    if (!this.command) return;

    // Use decoded command text for copying
    const decodedCommand = this._decodeHTMLEntities(this.command);

    try {
      await navigator.clipboard.writeText(decodedCommand);
      // TODO: Could add a brief visual feedback here like a flash or temporary icon change
    } catch (_error) {
      // Fallback for older browsers or when clipboard API is not available
      const textArea = document.createElement("textarea");
      textArea.value = decodedCommand;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
      } catch (execError) {
        console.warn("Failed to copy command to clipboard:", execError);
      }
      document.body.removeChild(textArea);
    }
  }

  private _formatTimestamp(): string {
    if (!this.timestamp) return "";
    const date = new Date(this.timestamp);
    return date.toLocaleTimeString();
  }

  /**
   * Decode HTML entities in command text (e.g., &gt; -> >)
   * Uses same pattern as prompt component for consistency
   */
  private _decodeHTMLEntities(text: string): string {
    if (!text) return text;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = text;
    return tempDiv.textContent || tempDiv.innerText || text;
  }

  /**
   * Check if command is from a Lich script (format: [scriptname]>command)
   */
  private _isLichScript(command: string): boolean {
    return /^\[.*\]&gt;/.test(command) || /^\[.*\]>/.test(command);
  }

  render() {
    // Decode HTML entities in command text
    const decodedCommand = this._decodeHTMLEntities(this.command);
    const isLichScript = this._isLichScript(this.command);

    // Determine prefix and variant based on type
    let prefix: string;
    let variant: string;

    if (this.isReplay) {
      prefix = "Replay";
      variant = "primary";
    } else if (isLichScript) {
      prefix = "Script";
      variant = "warning"; // Different color for Lich scripts
    } else {
      prefix = ">";
      variant = "neutral";
    }

    return html`
      <div class="command-container">
        <sl-tag variant="${variant}" size="small">
          ${prefix}
        </sl-tag>
        <sl-tooltip content="Click to copy • ${this._formatTimestamp()}" placement="top">
          <span class="command-text" @click=${this._copyCommand}>
            ${decodedCommand}
          </span>
        </sl-tooltip>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-command-echo-lit": CommandEchoLit;
  }
}
