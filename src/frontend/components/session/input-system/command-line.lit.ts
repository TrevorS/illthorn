// ABOUTME: Command Line composite component combining prompt indicator and smart input
// ABOUTME: Provides synchronized command input interface with visual connection between prompt and input field

import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./prompt-indicator.lit";
import "./smart-input.lit";

@customElement("illthorn-command-line-lit")
export class CommandLineLit extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      font-family: var(--font-family-mono, "Courier New", monospace);
    }

    .command-line {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: var(--color-background, #ffffff);
      border: 1px solid var(--color-border, #dee2e6);
      border-radius: 6px;
      box-sizing: border-box;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .command-line:focus-within {
      border-color: var(--color-primary, #007acc);
      box-shadow: 0 0 0 2px var(--color-primary-alpha, rgba(0, 122, 204, 0.2));
    }

    /* Disabled state */
    :host(.disabled) .command-line {
      background: var(--color-background-disabled, #f8f9fa);
      border-color: var(--color-border-disabled, #e9ecef);
      opacity: 0.7;
    }

    :host(.disabled) .command-line:focus-within {
      border-color: var(--color-border-disabled, #e9ecef);
      box-shadow: none;
    }

    /* Size variants */
    :host(.size-small) .command-line {
      padding: 4px 8px;
      gap: 6px;
    }

    :host(.size-medium) .command-line {
      padding: 8px 12px;
      gap: 8px;
    }

    :host(.size-large) .command-line {
      padding: 12px 16px;
      gap: 10px;
    }

    /* Layout sections */
    .prompt-section {
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }

    .input-section {
      flex: 1;
      min-width: 0; /* Allow shrinking */
    }

    /* Visual connection between prompt and input */
    .prompt-section::after {
      content: "";
      width: 4px;
      height: 1px;
      background: var(--color-text-secondary, #6c757d);
      margin-left: 4px;
      opacity: 0.5;
    }

    :host(.disabled) .prompt-section::after {
      background: var(--color-text-disabled, #adb5bd);
    }

    /* Theme integration */
    :host([theme="dark"]) .command-line {
      background: var(--color-background-dark, #212529);
      border-color: var(--color-border-dark, #495057);
      color: var(--color-text-dark, #f8f9fa);
    }

    :host([theme="dark"]) .prompt-section::after {
      background: var(--color-text-secondary-dark, #adb5bd);
    }

    /* Accessibility */
    .command-line:focus-within {
      outline: none;
    }
  `;

  // Prompt properties
  @property({ type: String })
  promptState: "normal" | "roundtime" | "casting" | "stunned" | "dead" | "sleeping" = "normal";

  @property({ type: Boolean })
  animated: boolean = true;

  @property({ type: String })
  customSymbol: string = "";

  @property({ type: Number })
  blinkRate: number = 1.0;

  // Input properties
  @property({ type: String })
  value: string = "";

  @property({ type: String })
  placeholder: string = "Enter command...";

  @property({ type: Boolean })
  disabled: boolean = false;

  @property({ type: String })
  disabledReason?: string;

  @property({ type: Array })
  commandHistory: Array<string> = [];

  @property({ type: Number })
  maxHistorySize: number = 100;

  @property({ type: Boolean })
  spellcheck: boolean = false;

  // Layout properties
  @property({ type: String })
  size: "small" | "medium" | "large" = "medium";

  connectedCallback() {
    super.connectedCallback();

    // Set accessibility attributes
    this.setAttribute("role", "group");
    this.setAttribute("aria-label", "Command input interface");
  }

  updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // Update CSS classes based on properties
    this.className = [
      this.disabled ? "disabled" : "",
      `size-${this.size}`,
    ]
      .filter(Boolean)
      .join(" ");

    // Update accessibility
    this.setAttribute("aria-disabled", this.disabled.toString());
  }

  render() {
    return html`
      <div class="command-line">
        <div class="prompt-section">
          <illthorn-prompt-indicator-lit
            .state=${this.promptState}
            .animated=${this.animated}
            .customSymbol=${this.customSymbol}
            .blinkRate=${this.blinkRate}
            .size=${this.size}
          ></illthorn-prompt-indicator-lit>
        </div>

        <div class="input-section">
          <illthorn-smart-input-lit
            .value=${this.value}
            .placeholder=${this.placeholder}
            .disabled=${this.disabled}
            .disabledReason=${this.disabledReason}
            .commandHistory=${this.commandHistory}
            .maxHistorySize=${this.maxHistorySize}
            .spellcheck=${this.spellcheck}
            .size=${this.size}
            @command-submit=${this._handleCommandSubmit}
            @input-focus=${this._handleInputFocus}
            @input-blur=${this._handleInputBlur}
            @undo-request=${this._handleUndoRequest}
          ></illthorn-smart-input-lit>
        </div>
      </div>
    `;
  }

  private _handleCommandSubmit(e: CustomEvent) {
    // Update the value property
    this.value = "";

    // Bubble the event
    this.dispatchEvent(
      new CustomEvent("command-submit", {
        detail: e.detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleInputFocus(e: CustomEvent) {
    this.dispatchEvent(
      new CustomEvent("input-focus", {
        detail: e.detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleInputBlur(e: CustomEvent) {
    this.dispatchEvent(
      new CustomEvent("input-blur", {
        detail: e.detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleUndoRequest(e: CustomEvent) {
    this.dispatchEvent(
      new CustomEvent("undo-request", {
        detail: e.detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  // Public API methods

  /**
   * Focus the input field
   */
  focus() {
    if (!this.disabled) {
      const smartInput = this.shadowRoot!.querySelector("illthorn-smart-input-lit") as any;
      if (smartInput) {
        smartInput.focus();
      }
    }
  }

  /**
   * Clear the input field
   */
  clear() {
    this.value = "";
    const smartInput = this.shadowRoot!.querySelector("illthorn-smart-input-lit") as any;
    if (smartInput) {
      smartInput.clear();
    }
  }

  /**
   * Set the input value
   */
  setValue(value: string) {
    this.value = value;
    const smartInput = this.shadowRoot!.querySelector("illthorn-smart-input-lit") as any;
    if (smartInput) {
      smartInput.setValue(value);
    }
  }

  /**
   * Add a command to history
   */
  addToHistory(command: string) {
    const smartInput = this.shadowRoot!.querySelector("illthorn-smart-input-lit") as any;
    if (smartInput) {
      smartInput.addToHistory(command);
      // Update our local property to stay in sync
      this.commandHistory = [...smartInput.commandHistory];
    }
  }

  /**
   * Clear command history
   */
  clearHistory() {
    this.commandHistory = [];
    const smartInput = this.shadowRoot!.querySelector("illthorn-smart-input-lit") as any;
    if (smartInput) {
      smartInput.clearHistory();
    }
  }

  /**
   * Get the current input value
   */
  getValue(): string {
    const smartInput = this.shadowRoot!.querySelector("illthorn-smart-input-lit") as any;
    return smartInput ? smartInput.value : this.value;
  }

  /**
   * Update prompt state and disabled state together
   */
  updateState(state: {
    promptState?: "normal" | "roundtime" | "casting" | "stunned" | "dead" | "sleeping";
    disabled?: boolean;
    disabledReason?: string;
  }) {
    Object.assign(this, state);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-command-line-lit": CommandLineLit;
  }
}