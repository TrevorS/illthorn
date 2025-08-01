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

  // Kill ring for text editing operations
  @state()
  private _killRing: string[] = [];

  @state() 
  private _killRingPosition = 0;

  // Command replay system
  @state()
  private _lastExecutedCommand = "";

  // History search mode
  @state()
  private _searchMode = false;

  @state() 
  private _searchQuery = "";

  @state()
  private _searchResults: string[] = [];

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

  // Text navigation utilities
  private _getCursorPosition(): number {
    if (this._slInput && this._slInput.input) {
      return this._slInput.input.selectionStart || 0;
    }
    return 0;
  }

  private _setCursorPosition(position: number) {
    if (this._slInput && this._slInput.input) {
      this._slInput.input.setSelectionRange(position, position);
    }
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

  private _moveWordForward() {
    const position = this._getCursorPosition();
    const newPosition = this._getWordBoundaryForward(this._inputValue, position);
    this._setCursorPosition(newPosition);
  }

  private _moveWordBackward() {
    const position = this._getCursorPosition();
    const newPosition = this._getWordBoundaryBackward(this._inputValue, position);
    this._setCursorPosition(newPosition);
  }

  private _moveCursorToStart() {
    this._setCursorPosition(0);
  }

  private _moveCursorToEnd() {
    this._setCursorPosition(this._inputValue.length);
  }

  // Kill ring operations
  private _addToKillRing(text: string) {
    if (text.length === 0) return;
    this._killRing.unshift(text);
    if (this._killRing.length > 20) {
      this._killRing = this._killRing.slice(0, 20);
    }
    this._killRingPosition = 0;
  }

  private _yankText() {
    if (this._killRing.length === 0) return;
    
    const text = this._killRing[this._killRingPosition];
    const position = this._getCursorPosition();
    
    const newValue = 
      this._inputValue.slice(0, position) + 
      text + 
      this._inputValue.slice(position);
      
    this._inputValue = newValue;
    
    // Position cursor after yanked text
    this.updateComplete.then(() => {
      const newPos = position + text.length;
      this._setCursorPosition(newPos);
    });
  }

  // Text editing operations
  private _killToEndOfLine() {
    const position = this._getCursorPosition();
    const killedText = this._inputValue.slice(position);
    this._addToKillRing(killedText);
    this._inputValue = this._inputValue.slice(0, position);
  }

  private _killEntireLine() {
    this._addToKillRing(this._inputValue);
    this._inputValue = "";
    this._setCursorPosition(0);
  }

  private _deletePreviousWord() {
    const position = this._getCursorPosition();
    const wordStart = this._getWordBoundaryBackward(this._inputValue, position);
    const deletedText = this._inputValue.slice(wordStart, position);
    this._addToKillRing(deletedText);
    
    this._inputValue = 
      this._inputValue.slice(0, wordStart) + 
      this._inputValue.slice(position);
    
    this._setCursorPosition(wordStart);
  }

  private _deleteWordForward() {
    const position = this._getCursorPosition();
    const wordEnd = this._getWordBoundaryForward(this._inputValue, position);
    const deletedText = this._inputValue.slice(position, wordEnd);
    this._addToKillRing(deletedText);
    
    this._inputValue = 
      this._inputValue.slice(0, position) + 
      this._inputValue.slice(wordEnd);
  }

  // Command replay functionality
  private _replayLastCommand() {
    if (this._lastExecutedCommand.length === 0) return;
    
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

  // History search functionality
  private _enterSearchMode() {
    this._searchMode = true;
    this._searchQuery = "";
    this._updateSearchResults();
  }

  private _exitSearchMode() {
    this._searchMode = false;
    this._searchQuery = "";
    this._searchResults = [];
  }

  private _updateSearchResults() {
    if (!this.session) return;
    this._searchResults = this.session.history
      .getHistory()
      .filter(cmd => cmd.includes(this._searchQuery))
      .slice(0, 10); // Limit to 10 results
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

    // Handle search mode first
    if (this._searchMode) {
      if (e.key === "Escape") {
        e.preventDefault();
        this._exitSearchMode();
        return;
      }
      // TODO: Implement search navigation
      return;
    }

    // Command replay (vim-style)
    if (e.ctrlKey && e.key === ".") {
      e.preventDefault();
      this._replayLastCommand();
      return;
    }

    // Reverse history search
    if (e.ctrlKey && e.key === "r") {
      e.preventDefault();
      this._enterSearchMode();
      return;
    }

    // Text navigation and editing with Ctrl key
    if (e.ctrlKey) {
      switch (e.key.toLowerCase()) {
        case "a": // Beginning of line
          e.preventDefault();
          this._moveCursorToStart();
          return;
          
        case "e": // End of line
          e.preventDefault(); 
          this._moveCursorToEnd();
          return;
          
        case "k": // Kill to end of line
          e.preventDefault();
          this._killToEndOfLine();
          return;
          
        case "u": // Kill entire line
          e.preventDefault();
          this._killEntireLine();
          return;
          
        case "w": // Delete previous word
          e.preventDefault();
          this._deletePreviousWord();
          return;
          
        case "y": // Yank (paste)
          e.preventDefault();
          this._yankText();
          return;

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

    // Alt key combinations for word movement
    if (e.altKey) {
      switch (e.key.toLowerCase()) {
        case "f": // Forward word
          e.preventDefault();
          this._moveWordForward();
          return;
          
        case "b": // Backward word  
          e.preventDefault();
          this._moveWordBackward();
          return;
          
        case "d": // Delete word forward
          e.preventDefault();
          this._deleteWordForward();
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

    // Store for replay system
    this._lastExecutedCommand = command;

    this._inputValue = "";
    this.session.history.add(command);

    // Focus the input after clearing to maintain user experience
    this.updateComplete.then(() => {
      this._slInput?.focus();
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
