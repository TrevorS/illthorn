// ABOUTME: Lit-based CLI component for command input and game interaction
// ABOUTME: Handles keyboard events, command history navigation, and command routing to game/Lich/internal systems
import { css, html, LitElement } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { IllthornEvent } from "../../events";
import { Illthorn } from "../../illthorn";
import type { FrontendSession } from "../../session";

@customElement("illthorn-cli-lit")
export class CLILit extends LitElement {
  static styles = css`
    :host {
      display: flex;
      align-items: center;
      position: relative;
      width: 100%;
    }

    input {
      font-family: "MonoLisa", monospace;
      left: 0;
      top: 0;
      border: none;
      width: 100%;
      padding: 0.5em;
      color: #fff;
      font-size: 1em;
      background-color: rgba(255, 255, 255, 0.1);
      z-index: 1;
      outline: none;
      box-sizing: border-box;
    }

    input:focus {
      outline: none;
      background-color: rgba(255, 255, 255, 0.15);
    }

    input::placeholder {
      color: rgba(255, 255, 255, 0.5);
      font-style: italic;
    }

    /* Support for suggestions styling if needed */
    input.suggestions {
      background-color: rgba(0, 0, 0, 0.2);
    }
  `;

  @property({ type: Object })
  session?: FrontendSession;

  @property({ type: Number })
  position = 0;

  @state()
  private _inputValue = "";

  @query("input")
  private _input!: HTMLInputElement;

  /**
   * Public accessor for the input element to maintain API compatibility
   */
  get input(): HTMLInputElement {
    // If the query hasn't resolved yet, query the shadow root directly
    if (!this._input) {
      const shadowInput = this.shadowRoot?.querySelector("input") as HTMLInputElement;
      if (shadowInput) {
        return shadowInput;
      }
      // Fallback - this should rarely happen in practice
      throw new Error("CLI input element not yet available");
    }
    return this._input;
  }

  firstUpdated() {
    // Focus the input when component is first rendered
    this._input?.focus();
  }

  connectedCallback() {
    super.connectedCallback();
    // Focus when connected to DOM
    this.updateComplete.then(() => {
      this._input?.focus();
    });
  }

  private _handleKeyDown(e: KeyboardEvent) {
    if (!this.session) return;

    const history = this.session.history;

    switch (e.key) {
      case "Enter":
        this._submitCommand();
        break;

      case "ArrowUp":
        e.preventDefault();
        if (history.position === 0) {
          history.add(this._inputValue);
        }
        this._setInput(history.back());
        break;

      case "ArrowDown":
        e.preventDefault();
        this._setInput(history.forward());
        break;
    }
  }

  private _handleInput(e: Event) {
    this._inputValue = (e.target as HTMLInputElement).value;
  }

  private _setInput(value: string) {
    this._inputValue = value;
    // Schedule cursor positioning after the next update
    this.updateComplete.then(() => {
      if (this._input) {
        this._input.setSelectionRange(value.length, value.length);
      }
    });
  }

  private _submitCommand() {
    if (!this.session) return;

    const command = this._inputValue;
    this._inputValue = "";
    this.session.history.add(command);

    if (command[0] === ":") {
      return Illthorn.bus.dispatchEvent(IllthornEvent.SUBMIT_ILLTHORN_COMMAND, command);
    }

    if (command[0] === ";") {
      // This is going to Lich, so we'll not monkey with it
      return this.session.sendCommand(command);
    }

    // Handle multi-line commands split by \r
    return command.split("\\r").forEach((c) => {
      c = c.trim();
      this.session?.sendCommand(c);
    });
  }

  render() {
    return html`
      <input
        .value=${this._inputValue}
        @keydown=${this._handleKeyDown}
        @input=${this._handleInput}
        placeholder="Enter command..."
        autocomplete="off"
        spellcheck="false"
      />
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-cli-lit": CLILit;
  }
}
