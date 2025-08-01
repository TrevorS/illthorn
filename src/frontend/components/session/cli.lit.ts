// ABOUTME: Lit-based CLI component for command input and game interaction with timer bars
// ABOUTME: Handles keyboard events, command history navigation, command routing, and displays roundtime/casttime progress

import type SlInput from "@shoelace-style/shoelace/dist/components/input/input.component.js";
import { css, html, LitElement } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { IllthornEvent } from "../../events";
import { Illthorn } from "../../illthorn";
import type { GameTag } from "../../parser/tag";
import type { FrontendSession } from "../../session";
import { CommandEchoSystem } from "./command-echo";
import { PerformantInputManager } from "./performant-input";
import { type ReadlineKeyBindings, ReadlineKeyHandler } from "./readline-keys";

@customElement("illthorn-cli-lit")
export class CLI extends LitElement implements ReadlineKeyBindings {
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

    sl-progress-bar.timer-bar {
      height: 3px;
      width: 100%;
      margin-bottom: 1px;
      --height: 3px;
      --track-color: rgba(255, 255, 255, 0.1);
      --track-width: 100%;
    }

    sl-progress-bar.timer-bar.round-time-current {
      --indicator-color: var(--color-danger, red);
    }

    sl-progress-bar.timer-bar.cast-time-current {
      --indicator-color: var(--color-warning, lightgreen);
    }

    sl-progress-bar.timer-bar:not(.visible) {
      display: none;
    }

    sl-progress-bar.timer-bar::part(base) {
      background-color: var(--track-color);
      border-radius: 0;
      height: var(--height);
    }

    sl-progress-bar.timer-bar::part(indicator) {
      background-color: var(--indicator-color);
      border-radius: 0;
      height: var(--height);
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
  private _roundtimeProgress = 100; // Start at 100% and animate down

  @state()
  private _casttimeValue = 0;

  @state()
  private _casttimeDuration = 0;

  @state()
  private _casttimeProgress = 100; // Start at 100% and animate down

  // Command replay system
  @state()
  private _lastExecutedCommand = "";

  @query("sl-input")
  private _slInput!: SlInput;

  // Command echo system for bus-based feed integration
  private _commandEcho?: CommandEchoSystem;

  // High-performance input manager for rapid history navigation
  private _inputManager?: PerformantInputManager;

  // Readline-style key bindings handler
  private _readlineHandler?: ReadlineKeyHandler;

  /**
   * Public accessor for the input element to maintain API compatibility
   */
  get input(): HTMLInputElement {
    // Access the underlying input element from sl-input
    if (!this._slInput) {
      const slInput = this.shadowRoot?.querySelector("sl-input") as SlInput;
      if (slInput?.input) {
        return slInput.input;
      }
      // Fallback - this should rarely happen in practice
      throw new Error("CLI input element not yet available");
    }
    return this._slInput.input;
  }

  /**
   * Override shouldUpdate to skip renders during rapid history navigation
   */
  protected shouldUpdate(changedProperties: Map<string | number | symbol, unknown>): boolean {
    // Skip rendering if we're in rapid mode and only the input value changed
    if (this._inputManager?.isInRapidMode && changedProperties.has("_inputValue") && changedProperties.size === 1) {
      return false;
    }
    return super.shouldUpdate(changedProperties);
  }

  firstUpdated() {
    // Initialize the performance input manager
    if (this._slInput) {
      this._inputManager = new PerformantInputManager(this._slInput);
      this._inputManager.setOnSyncCallback((value) => {
        this._inputValue = value;
      });

      // Initialize readline key handler
      this._readlineHandler = new ReadlineKeyHandler(this);
    }

    // Focus the input when component is first rendered
    if (this._inputManager) {
      this._inputManager.focus();
    } else {
      requestAnimationFrame(() => {
        this._slInput?.focus();
      });
    }
  }

  connectedCallback() {
    super.connectedCallback();
    // Focus handling moved to firstUpdated() to avoid redundancy
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    // Set up session-dependent systems when session is provided or changes
    if (changedProperties.has("session") && this.session) {
      this._subscribeToTimerEvents();
      this._commandEcho = new CommandEchoSystem(this.session);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up performance input manager
    this._inputManager?.destroy();
    // Event subscriptions are automatically cleaned up by the bus system
  }

  // ReadlineKeyBindings interface implementation
  getCursorPosition(): number {
    return this._inputManager?.getCursorPosition() || 0;
  }

  setCursorPosition(position: number): void {
    this._inputManager?.setCursorPosition(position);
  }

  getCurrentValue(): string {
    return this._inputManager?.getCurrentValue() || this._inputValue;
  }

  setValue(value: string): void {
    // Update both the input manager (for immediate display) and reactive state
    this._inputManager?.setValueImmediate(value);
    this._inputValue = value;
  }

  // Readline key binding operations
  moveCursorToStart(): void {
    this.setCursorPosition(0);
  }

  moveCursorToEnd(): void {
    this.setCursorPosition(this.getCurrentValue().length);
  }

  moveWordForward(): void {
    const position = this.getCursorPosition();
    const newPosition = this._getWordBoundaryForward(this.getCurrentValue(), position);
    this.setCursorPosition(newPosition);
  }

  moveWordBackward(): void {
    const position = this.getCursorPosition();
    const newPosition = this._getWordBoundaryBackward(this.getCurrentValue(), position);
    this.setCursorPosition(newPosition);
  }

  killToEndOfLine(): void {
    // Implemented by ReadlineKeyHandler
  }

  killEntireLine(): void {
    // Implemented by ReadlineKeyHandler
  }

  deletePreviousWord(): void {
    // Implemented by ReadlineKeyHandler
  }

  deleteWordForward(): void {
    // Implemented by ReadlineKeyHandler
  }

  yankText(): void {
    // Implemented by ReadlineKeyHandler
  }

  addToKillRing(_text: string): void {
    // Implemented by ReadlineKeyHandler
  }

  private _getWordBoundaryForward(text: string, position: number): number {
    // Find the start of the next word
    let i = position;
    // Skip current word characters
    while (i < text.length && /\S/.test(text[i])) {
      i++;
    }
    // Skip whitespace to start of next word
    while (i < text.length && /\s/.test(text[i])) {
      i++;
    }
    return i;
  }

  private _getWordBoundaryBackward(text: string, position: number): number {
    // Find the start of the current word or previous word
    let i = position;
    // Skip whitespace before current position
    while (i > 0 && /\s/.test(text[i - 1])) {
      i--;
    }
    // Skip word characters to find word start
    while (i > 0 && /\S/.test(text[i - 1])) {
      i--;
    }
    return i;
  }

  // Command replay functionality
  private _replayLastCommand() {
    if (this._lastExecutedCommand.length === 0) return;

    // Echo the command being replayed to the game log for visibility
    this._commandEcho?.echoReplay(this._lastExecutedCommand);

    // Execute directly without adding to history (vim-style)
    this._executeCommand(this._lastExecutedCommand);
  }

  private _executeCommand(command: string) {
    if (!this.session) return;

    if (command[0] === ":") {
      return Illthorn.bus.dispatchEvent(IllthornEvent.SUBMIT_ILLTHORN_COMMAND, command);
    }

    if (command[0] === ";") {
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
      this._roundtimeProgress = 100; // Start at 100%

      // Animate progress from 100% to 0% over the duration
      if (duration > 0) {
        const startTime = Date.now();
        const animate = () => {
          const elapsed = (Date.now() - startTime) / 1000;
          const progress = Math.max(0, 100 - (elapsed / duration) * 100);

          this._roundtimeProgress = progress;

          if (progress > 0) {
            requestAnimationFrame(animate);
          }
        };
        requestAnimationFrame(animate);
      }
    });

    // Subscribe to casttime metadata events
    this.session.bus.subscribeEvent<GameTag>("metadata/castTime", ({ detail: tag }) => {
      const value = parseInt(tag.attrs.value as string, 10) || 0;
      const duration = parseFloat(tag.attrs.time as string) || 0;

      this._casttimeValue = value;
      this._casttimeDuration = duration;
      this._casttimeProgress = 100; // Start at 100%

      // Animate progress from 100% to 0% over the duration
      if (duration > 0) {
        const startTime = Date.now();
        const animate = () => {
          const elapsed = (Date.now() - startTime) / 1000;
          const progress = Math.max(0, 100 - (elapsed / duration) * 100);

          this._casttimeProgress = progress;

          if (progress > 0) {
            requestAnimationFrame(animate);
          }
        };
        requestAnimationFrame(animate);
      }
    });
  }

  private _handleKeyDown(e: KeyboardEvent) {
    if (!this.session) {
      return;
    }

    const history = this.session.history;

    // Command replay (vim-style)
    if (e.ctrlKey && e.key === ".") {
      e.preventDefault();
      this._replayLastCommand();
      return;
    }

    // Let readline handler process text editing keys first
    if (this._readlineHandler?.handleKeyDown(e)) {
      return; // Key was handled by readline handler
    }

    // Handle remaining Ctrl key combinations (history navigation, etc.)
    if (e.ctrlKey) {
      switch (e.key.toLowerCase()) {
        case "p": // History navigation (equivalent to ArrowUp)
          e.preventDefault();
          if (history.position === 0) {
            history.add(this._inputValue);
          }
          this._setInput(history.back());
          return;

        case "n": // History navigation (equivalent to ArrowDown)
          e.preventDefault();
          this._setInput(history.forward());
          return;
      }
    }

    // Original key handling
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
    this._inputValue = (e.target as SlInput).value;
  }

  private _setInput(value: string) {
    // Use performance-optimized immediate update for history navigation
    this._inputManager?.setValueImmediate(value, value.length);
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

    // Store for replay system
    this._lastExecutedCommand = command;

    // Echo the command to the game log for visibility
    this._commandEcho?.echoCommand(command);

    this._inputValue = "";
    this.session.history.add(command);

    // Focus the input after clearing to maintain user experience
    this.updateComplete.then(() => {
      this._inputManager?.focus();
    });

    this._executeCommand(command);
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
            <sl-progress-bar 
              class="timer-bar round-time-current visible"
              .value=${this._roundtimeProgress}
            ></sl-progress-bar>
          `
              : ""
          }
          ${
            hasCasttime
              ? html`
            <sl-progress-bar 
              class="timer-bar cast-time-current visible"
              .value=${this._casttimeProgress}
            ></sl-progress-bar>
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
