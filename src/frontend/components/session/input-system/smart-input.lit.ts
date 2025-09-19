// ABOUTME: Smart input component with command history navigation and readline keybindings
// ABOUTME: Provides sophisticated input handling with history, keyboard shortcuts, and focus management

import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ref, createRef } from "lit/directives/ref.js";

@customElement("illthorn-smart-input-lit")
export class SmartInputLit extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--font-family-mono, "Courier New", monospace);
    }

    .input-container {
      position: relative;
      width: 100%;
    }

    .input-field {
      width: 100%;
      border: 1px solid var(--color-border, #ccc);
      border-radius: 4px;
      padding: 8px 12px;
      font-family: inherit;
      font-size: 14px;
      line-height: 1.4;
      background: var(--color-background, #fff);
      color: var(--color-text, #000);
      outline: none;
      transition: border-color 0.2s ease;
      box-sizing: border-box;
    }

    .input-field:focus {
      border-color: var(--color-primary, #007acc);
      box-shadow: 0 0 0 2px var(--color-primary-alpha, rgba(0, 122, 204, 0.2));
    }

    .input-field:disabled {
      background: var(--color-background-disabled, #f5f5f5);
      color: var(--color-text-disabled, #999);
      cursor: not-allowed;
      opacity: 0.6;
    }

    /* Size variants */
    :host(.size-small) .input-field {
      padding: 4px 8px;
      font-size: 12px;
    }

    :host(.size-medium) .input-field {
      padding: 8px 12px;
      font-size: 14px;
    }

    :host(.size-large) .input-field {
      padding: 12px 16px;
      font-size: 16px;
    }

    /* Disabled state styling */
    :host(.disabled) .input-field {
      background: var(--color-background-disabled, #f5f5f5);
      border-color: var(--color-border-disabled, #ddd);
    }

    /* Focus indicator */
    :host(.focused) .input-field {
      border-color: var(--color-primary, #007acc);
    }
  `;

  private inputRef = createRef<HTMLInputElement>();

  @property({ type: String })
  value: string = "";

  @property({ type: String })
  placeholder: string = "Enter command...";

  @property({ type: Boolean })
  disabled: boolean = false;

  @property({ type: String })
  size: "small" | "medium" | "large" = "medium";

  @property({ type: Boolean })
  spellcheck: boolean = false;

  @property({ type: Array })
  commandHistory: Array<string> = [];

  @property({ type: Number })
  maxHistorySize: number = 100;

  @property({ type: String })
  disabledReason?: string;

  @state()
  private _historyIndex: number = -1;

  @state()
  private _savedCurrentInput: string = "";

  @state()
  private _focused: boolean = false;

  private _undoStack: Array<string> = [];

  updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // Update CSS classes based on properties
    this.className = [
      `size-${this.size}`,
      this.disabled ? "disabled" : "",
      this._focused ? "focused" : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  render() {
    const effectivePlaceholder = this.disabled && this.disabledReason
      ? `Input disabled: ${this.disabledReason}`
      : this.placeholder;

    return html`
      <div class="input-container">
        <input
          ${ref(this.inputRef)}
          type="text"
          class="input-field"
          .value=${this.value}
          placeholder=${effectivePlaceholder}
          ?disabled=${this.disabled}
          ?spellcheck=${this.spellcheck}
          @input=${this._handleInput}
          @keydown=${this._handleKeyDown}
          @focus=${this._handleFocus}
          @blur=${this._handleBlur}
        />
      </div>
    `;
  }

  private _handleInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.value = input.value;
    this._resetHistoryNavigation();
  }

  private _handleKeyDown(e: KeyboardEvent) {
    if (this.disabled) {
      return;
    }

    // Handle command submission
    if (e.key === "Enter") {
      e.preventDefault();
      this._submitCommand();
      return;
    }

    // Handle history navigation
    if (e.key === "ArrowUp") {
      e.preventDefault();
      this._navigateHistory(1); // Up = go back to older commands
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      this._navigateHistory(-1); // Down = go forward to newer commands
      return;
    }

    // Handle readline keybindings
    if (e.ctrlKey) {
      switch (e.key.toLowerCase()) {
        case "a":
          e.preventDefault();
          this._selectAll();
          break;
        case "k":
          e.preventDefault();
          this._clearInput();
          break;
        case "r":
          e.preventDefault();
          this._repeatLastCommand();
          break;
        case "l":
          e.preventDefault();
          this._focusInput();
          break;
        case "w":
          e.preventDefault();
          this._deleteWordBackward();
          break;
        case "z":
          e.preventDefault();
          this._undo();
          break;
        case "home":
          e.preventDefault();
          this._moveCursorToBeginning();
          break;
        case "end":
          e.preventDefault();
          this._moveCursorToEnd();
          break;
      }
    }
  }

  private _handleFocus() {
    this._focused = true;
    this._emitEvent("input-focus", {});
  }

  private _handleBlur() {
    this._focused = false;
    this._emitEvent("input-blur", {});
  }

  private _submitCommand() {
    const command = this.value.trim();
    if (!command) {
      return;
    }

    // Add to undo stack
    this._undoStack.push(this.value);
    if (this._undoStack.length > 10) {
      this._undoStack.shift();
    }

    // Add to history
    this.addToHistory(command);

    // Emit submit event
    this._emitEvent("command-submit", { command });

    // Clear input
    this.clear();
  }

  private _navigateHistory(direction: number) {
    if (this.commandHistory.length === 0) {
      return;
    }

    // Save current input if we're starting navigation
    if (this._historyIndex === -1) {
      this._savedCurrentInput = this.value;
    }

    // Calculate new index
    const newIndex = this._historyIndex + direction;

    // Handle boundaries
    if (newIndex < -1) {
      return; // Can't go further back than current
    }
    if (newIndex >= this.commandHistory.length) {
      return; // Can't go further forward than newest
    }

    this._historyIndex = newIndex;

    // Update value
    let newValue: string;
    if (this._historyIndex === -1) {
      // Back to current input
      newValue = this._savedCurrentInput;
    } else {
      // Navigate to history item (newest first in navigation)
      const historyItemIndex = this.commandHistory.length - 1 - this._historyIndex;
      newValue = this.commandHistory[historyItemIndex];
    }

    // Update both the property and the input field
    this.value = newValue;
    if (this.inputRef.value) {
      this.inputRef.value.value = newValue;
    }

    // Force a re-render to ensure the value is synced
    this.requestUpdate();
  }

  private _resetHistoryNavigation() {
    this._historyIndex = -1;
    this._savedCurrentInput = "";
  }

  private _selectAll() {
    if (this.inputRef.value) {
      this.inputRef.value.select();
    }
  }

  private _clearInput() {
    this._undoStack.push(this.value);
    if (this._undoStack.length > 10) {
      this._undoStack.shift();
    }
    this.clear();
  }

  private _repeatLastCommand() {
    if (this.commandHistory.length > 0) {
      const lastCommand = this.commandHistory[this.commandHistory.length - 1];
      this.setValue(lastCommand);
    }
  }

  private _focusInput() {
    if (this.inputRef.value) {
      this.inputRef.value.focus();
    }
  }

  private _deleteWordBackward() {
    if (!this.inputRef.value) {
      return;
    }

    const input = this.inputRef.value;
    const start = input.selectionStart || 0;
    const text = input.value;

    // Find the start of the current word
    let wordStart = start;

    // Skip any trailing spaces to get to the word
    while (wordStart > 0 && text[wordStart - 1] === " ") {
      wordStart--;
    }

    // Now find the start of the word
    while (wordStart > 0 && text[wordStart - 1] !== " ") {
      wordStart--;
    }

    const newValue = text.substring(0, wordStart) + text.substring(start);
    this.value = newValue;
    input.value = newValue;
    input.setSelectionRange(wordStart, wordStart);
    this.requestUpdate();
  }

  private _undo() {
    if (this._undoStack.length > 0) {
      const previousValue = this._undoStack.pop()!;
      this.setValue(previousValue);
    } else {
      this._emitEvent("undo-request", {});
    }
  }

  private _moveCursorToBeginning() {
    if (this.inputRef.value) {
      this.inputRef.value.setSelectionRange(0, 0);
    }
  }

  private _moveCursorToEnd() {
    if (this.inputRef.value) {
      const length = this.inputRef.value.value.length;
      this.inputRef.value.setSelectionRange(length, length);
    }
  }

  private _emitEvent(name: string, detail: any) {
    this.dispatchEvent(
      new CustomEvent(name, {
        detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  // Public API methods
  clear() {
    this.value = "";
    this._resetHistoryNavigation();
    if (this.inputRef.value) {
      this.inputRef.value.value = "";
    }
    this.requestUpdate();
  }

  setValue(value: string) {
    this.value = value;
    this._resetHistoryNavigation();
    if (this.inputRef.value) {
      this.inputRef.value.value = value;
    }
    this.requestUpdate();
  }

  addToHistory(command: string) {
    const trimmedCommand = command.trim();
    if (!trimmedCommand) {
      return;
    }

    // Don't add duplicate consecutive commands
    const lastCommand = this.commandHistory[this.commandHistory.length - 1];
    if (lastCommand === trimmedCommand) {
      return;
    }

    this.commandHistory.push(trimmedCommand);

    // Limit history size
    if (this.commandHistory.length > this.maxHistorySize) {
      this.commandHistory.shift();
    }

    this._resetHistoryNavigation();
  }

  clearHistory() {
    this.commandHistory = [];
    this._resetHistoryNavigation();
  }

  focus() {
    if (this.inputRef.value) {
      this.inputRef.value.focus();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-smart-input-lit": SmartInputLit;
  }
}