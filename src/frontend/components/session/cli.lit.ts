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

    sl-input {
      width: 100%;
      --sl-input-border-width: 0;
      --sl-input-border-radius-medium: 0;
      --sl-input-focus-ring-width: 0;
      --sl-input-background-color: rgba(255, 255, 255, 0.1);
      --sl-input-background-color-focus: rgba(255, 255, 255, 0.15);
      --sl-input-color: #fff;
      --sl-input-font-family: "MonoLisa", monospace;
      --sl-input-font-size-medium: 1em;
      --sl-input-height-medium: auto;
      --sl-input-spacing-medium: 0.5em;
      --sl-input-placeholder-color: rgba(255, 255, 255, 0.5);
    }

    sl-input::part(base) {
      border: none;
      background-color: var(--sl-input-background-color);
      font-family: var(--sl-input-font-family);
    }

    sl-input::part(input) {
      border: none;
      background: transparent;
      color: var(--sl-input-color);
      font-family: var(--sl-input-font-family);
      font-size: var(--sl-input-font-size-medium);
      padding: var(--sl-input-spacing-medium);
      outline: none;
    }

    sl-input::part(input)::placeholder {
      color: var(--sl-input-placeholder-color);
      font-style: italic;
    }

    /* Support for suggestions styling if needed */
    sl-input.suggestions::part(base) {
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

  @query("sl-input")
  private _slInput!: any; // Using any for now until we have proper types

  /**
   * Public accessor for the input element to maintain API compatibility
   */
  get input(): HTMLInputElement {
    // Access the underlying input element from sl-input
    if (!this._slInput) {
      const slInput = this.shadowRoot?.querySelector("sl-input") as any;
      if (slInput && slInput.input) {
        return slInput.input;
      }
      // Fallback - this should rarely happen in practice
      throw new Error("CLI input element not yet available");
    }
    return this._slInput.input;
  }

  firstUpdated() {
    // Focus the input when component is first rendered
    this._slInput?.focus();
  }

  connectedCallback() {
    super.connectedCallback();

    // Focus when connected to DOM
    this.updateComplete.then(() => {
      this._slInput?.focus();
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

  private _handleInput(e: CustomEvent) {
    this._inputValue = (e.target as any).value;
  }

  private _setInput(value: string) {
    this._inputValue = value;
    // Schedule cursor positioning after the next update
    this.updateComplete.then(() => {
      if (this._slInput && this._slInput.input) {
        this._slInput.input.setSelectionRange(value.length, value.length);
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
      this._slInput?.focus();
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
        <sl-input
          .value=${this._inputValue}
          @keydown=${this._handleKeyDown}
          @sl-input=${this._handleInput}
          placeholder="Enter command..."
          autocomplete="off"
          spellcheck="false"
        ></sl-input>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-cli-lit": CLI;
  }
}
