// ABOUTME: Lit-based CLI component for command input and game interaction with timer bars
// ABOUTME: Handles keyboard events, command history navigation, command routing, and displays roundtime/casttime progress
import { css, html, LitElement } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { IllthornEvent } from "../../events";
import { Illthorn } from "../../illthorn";
import type { GameTag } from "../../parser/tag";
import type { FrontendSession } from "../../session";

@customElement("illthorn-cli-lit")
export class CLI extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      position: relative;
      width: 100%;
    }

    .input-container {
      display: flex;
      align-items: center;
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

    /* Timer bars styling - positioned above input */
    .timers {
      display: flex;
      flex-direction: column;
      width: 100%;
      margin-bottom: 2px;
    }

    .timer-bar {
      height: 3px;
      /* The bar maxes out, visually, at 20s timers */
      width: calc(var(--steps) * 5%);
      margin-bottom: 1px;
      transform-origin: left;
      transition-property: width, transform;
    }

    .timer-bar.go {
      animation: roundtime var(--duration) steps(var(--steps)) forwards;
    }

    .timer-bar.round-time-current {
      background: var(--color-danger, red);
    }

    .timer-bar.cast-time-current {
      background: var(--color-warning, lightgreen);
    }

    .timer-bar:not(.visible) {
      display: none;
    }

    @keyframes roundtime {
      to {
        transform: scaleX(0);
      }
    }
  `;

  @property({ type: Object })
  session?: FrontendSession;

  @property({ type: Number })
  position = 0;

  @state()
  private _inputValue = "";

  @state()
  private _roundtimeValue = 0;

  @state()
  private _roundtimeDuration = 0;

  @state()
  private _roundtimeSteps = 0;

  @state()
  private _casttimeValue = 0;

  @state()
  private _casttimeDuration = 0;

  @state()
  private _casttimeSteps = 0;

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

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    // Set up timer subscriptions when session is provided or changes
    if (changedProperties.has("session") && this.session) {
      this._subscribeToTimerEvents();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Event subscriptions are automatically cleaned up by the bus system
  }

  private _subscribeToTimerEvents() {
    if (!this.session || !this.session.bus) {
      return;
    }

    // Subscribe to roundtime metadata events
    this.session.bus.subscribeEvent<GameTag>("metadata/roundTime", ({ detail: tag }) => {
      const value = parseInt(tag.attrs.value as string, 10) || 0;
      const duration = parseFloat(tag.attrs.time as string) || 0;

      this._roundtimeValue = value;
      this._roundtimeDuration = duration;
      this._roundtimeSteps = Math.max(1, Math.ceil(duration)); // Ensure at least 1 step

      // Trigger animation by adding/removing 'go' class
      this.updateComplete.then(() => {
        const roundBar = this.shadowRoot?.querySelector(".timer-bar.round-time-current") as HTMLElement;
        if (roundBar && duration > 0) {
          roundBar.classList.remove("go");
          // Force reflow
          roundBar.offsetHeight;
          roundBar.classList.add("go");
        }
      });
    });

    // Subscribe to casttime metadata events
    this.session.bus.subscribeEvent<GameTag>("metadata/castTime", ({ detail: tag }) => {
      const value = parseInt(tag.attrs.value as string, 10) || 0;
      const duration = parseFloat(tag.attrs.time as string) || 0;

      this._casttimeValue = value;
      this._casttimeDuration = duration;
      this._casttimeSteps = Math.max(1, Math.ceil(duration)); // Ensure at least 1 step

      // Trigger animation by adding/removing 'go' class
      this.updateComplete.then(() => {
        const castBar = this.shadowRoot?.querySelector(".timer-bar.cast-time-current") as HTMLElement;
        if (castBar && duration > 0) {
          castBar.classList.remove("go");
          // Force reflow
          castBar.offsetHeight;
          castBar.classList.add("go");
        }
      });
    });
  }

  private _handleKeyDown(e: KeyboardEvent) {
    if (!this.session) {
      return;
    }

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

      case "Escape":
        e.preventDefault();
        this._inputValue = "";
        history.resetPosition();
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
    if (!this.session) {
      return;
    }

    const command = this._inputValue.trim();

    // Don't submit empty commands
    if (command.length === 0) {
      return;
    }

    this._inputValue = "";
    this.session.history.add(command);

    // Focus the input after clearing to maintain user experience
    this.updateComplete.then(() => {
      this._input?.focus();
    });

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
      if (c.length > 0) {
        this.session?.sendCommand(c);
      }
    });
  }

  render() {
    const hasRoundtime = this._roundtimeValue > 0 || this._roundtimeDuration > 0;
    const hasCasttime = this._casttimeValue > 0 || this._casttimeDuration > 0;

    return html`
      ${
        hasRoundtime || hasCasttime
          ? html`
        <div class="timers">
          ${
            hasRoundtime
              ? html`
            <div 
              class="timer-bar round-time-current visible"
              style="--duration: ${this._roundtimeDuration}s; --steps: ${this._roundtimeSteps}"
            ></div>
          `
              : ""
          }
          ${
            hasCasttime
              ? html`
            <div 
              class="timer-bar cast-time-current visible"
              style="--duration: ${this._casttimeDuration}s; --steps: ${this._casttimeSteps}"
            ></div>
          `
              : ""
          }
        </div>
      `
          : ""
      }
      
      <div class="input-container">
        <input
          .value=${this._inputValue}
          @keydown=${this._handleKeyDown}
          @input=${this._handleInput}
          placeholder="Enter command..."
          autocomplete="off"
          spellcheck="false"
        />
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-cli-lit": CLI;
  }
}
