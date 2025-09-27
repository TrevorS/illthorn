// ABOUTME: Lit-based command echo component with Shoelace integration for improved UX
// ABOUTME: Provides interactive command echoing with copy functionality and timestamp tooltips

import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@shoelace-style/shoelace/dist/components/badge/badge.js";
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

    sl-badge::part(base) {
      font-size: 0.7em;
      font-family: var(--font-family-monospace, "MonoLisa", monospace);
      padding: 2px 6px;
      font-weight: 600;
      line-height: 1.2;
      border: 1px solid transparent;
    }

    /* Ensure badges are visible with proper contrast */
    sl-badge[variant="neutral"]::part(base) {
      background-color: rgba(255, 255, 255, 0.15) !important;
      color: var(--color-text-secondary, #ccc) !important;
      border: 1px solid var(--color-border, #666) !important;
    }

    sl-badge[variant="primary"]::part(base) {
      background-color: var(--color-info, #4a9eff) !important;
      color: var(--color-background-primary, #fff) !important;
    }

    sl-badge[variant="success"]::part(base) {
      background-color: var(--color-success, #22c55e) !important;
      color: var(--color-background-primary, #fff) !important;
    }

    sl-badge[variant="warning"]::part(base) {
      background-color: var(--color-warning, #f59e0b) !important;
      color: var(--color-background-primary, #000) !important;
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

    /* Copy feedback animation */
    .copy-flash {
      animation: copyFlash 0.3s ease-out;
    }

    @keyframes copyFlash {
      0% { background-color: var(--color-success, #10b981); }
      100% { background-color: transparent; }
    }
  `;

  @property({ type: String })
  command = "";

  @property({ type: Boolean, attribute: "is-replay", reflect: true })
  isReplay = false;

  @property({ type: Boolean, attribute: "is-macro", reflect: true })
  isMacro = false;

  @property({ type: Number })
  timestamp = 0;

  @property({ type: String })
  prompt = "";

  private async _copyCommand() {
    if (!this.command) return;

    // Use decoded command text for copying
    const decodedCommand = this._decodeHTMLEntities(this.command);

    try {
      await navigator.clipboard.writeText(decodedCommand);
      this._showCopyFeedback();
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
        this._showCopyFeedback();
      } catch (execError) {
        console.warn("Failed to copy command to clipboard:", execError);
      }
      document.body.removeChild(textArea);
    }
  }

  private _showCopyFeedback() {
    this.classList.add("copy-flash");
    setTimeout(() => {
      this.classList.remove("copy-flash");
    }, 300);
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
   * Check if command is from a Lich script or manual Lich command
   */
  private _isLichScript(command: string): boolean {
    // Check for manual Lich commands starting with semicolon
    if (command.startsWith(";")) {
      return true;
    }

    // Check for script output format: [scriptname]>command
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
    } else if (this.isMacro) {
      prefix = "Macro";
      variant = "success"; // Green color for macros
    } else if (isLichScript) {
      prefix = "Lich";
      variant = "warning"; // Different color for Lich commands
    } else {
      // For regular commands, use the actual prompt if available
      // Fall back to generic ">" only when no prompt is captured (legacy/error case)
      prefix = this.prompt ? this._decodeHTMLEntities(this.prompt) : ">";
      variant = "neutral";
    }

    return html`
      <div class="command-container">
        <sl-badge variant="${variant}" pill>
          ${prefix}
        </sl-badge>
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
