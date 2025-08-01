// ABOUTME: Readline-style key bindings handler for comprehensive text editing capabilities
// ABOUTME: Implements Emacs/Bash-style key combinations with kill ring and word navigation

import { getWordBoundaryBackward, getWordBoundaryForward } from "./text-navigation";

export interface ReadlineKeyBindings {
  // Text navigation
  moveCursorToStart(): void;
  moveCursorToEnd(): void;
  moveWordForward(): void;
  moveWordBackward(): void;

  // History navigation
  navigateHistoryBack(): void;
  navigateHistoryForward(): void;

  // Command operations
  submitCommand(): void;
  replayLastCommand(): void;
  clearInput(): void;

  // Getters for state
  getCursorPosition(): number;
  getCurrentValue(): string;
  setCursorPosition(position: number): void;
  setValue(value: string): void;
}

export class ReadlineKeyHandler {
  // Kill ring for text editing operations (circular buffer)
  private _killRing: string[] = [];
  private _killRingPosition = 0;
  private readonly _maxKillRingSize = 20;

  constructor(private bindings: ReadlineKeyBindings) {}

  /**
   * Handle key down events and return true if key was handled
   */
  handleKeyDown(e: KeyboardEvent): boolean {
    // Text navigation and editing with Ctrl key
    if (e.ctrlKey) {
      switch (e.key.toLowerCase()) {
        case "a": // Beginning of line
          e.preventDefault();
          this.bindings.moveCursorToStart();
          return true;

        case "e": // End of line
          e.preventDefault();
          this.bindings.moveCursorToEnd();
          return true;

        case "k": // Kill to end of line
          e.preventDefault();
          this._killToEndOfLine();
          return true;

        case "u": // Kill entire line
          e.preventDefault();
          this._killEntireLine();
          return true;

        case "w": // Delete previous word
          e.preventDefault();
          this._deletePreviousWord();
          return true;

        case "y": // Yank (paste)
          e.preventDefault();
          this._yankText();
          return true;

        case "p": // History navigation (equivalent to ArrowUp)
          e.preventDefault();
          this.bindings.navigateHistoryBack();
          return true;

        case "n": // History navigation (equivalent to ArrowDown)
          e.preventDefault();
          this.bindings.navigateHistoryForward();
          return true;

        case ".": // Command replay
          e.preventDefault();
          this.bindings.replayLastCommand();
          return true;
      }
    }

    // Alt key combinations for word movement
    if (e.altKey) {
      switch (e.key.toLowerCase()) {
        case "f": // Forward word
          e.preventDefault();
          this.bindings.moveWordForward();
          return true;

        case "b": // Backward word
          e.preventDefault();
          this.bindings.moveWordBackward();
          return true;

        case "d": // Delete word forward
          e.preventDefault();
          this._deleteWordForward();
          return true;
      }
    }

    // Standard key handling (non-modifier keys)
    switch (e.key) {
      case "Enter":
        this.bindings.submitCommand();
        return true;

      case "ArrowUp":
        e.preventDefault();
        this.bindings.navigateHistoryBack();
        return true;

      case "ArrowDown":
        e.preventDefault();
        this.bindings.navigateHistoryForward();
        return true;

      case "Escape":
        e.preventDefault();
        this.bindings.clearInput();
        return true;
    }

    return false; // Key not handled
  }

  // Text editing operations that use the kill ring
  private _killToEndOfLine() {
    const position = this.bindings.getCursorPosition();
    const currentValue = this.bindings.getCurrentValue();
    const killedText = currentValue.slice(position);

    if (killedText.length > 0) {
      this._addToKillRing(killedText);
      this.bindings.setValue(currentValue.slice(0, position));
    }
  }

  private _killEntireLine() {
    const currentValue = this.bindings.getCurrentValue();
    this._addToKillRing(currentValue);
    this.bindings.setValue("");
    this.bindings.setCursorPosition(0);
  }

  private _deletePreviousWord() {
    const position = this.bindings.getCursorPosition();
    const currentValue = this.bindings.getCurrentValue();
    const wordStart = getWordBoundaryBackward(currentValue, position);
    const deletedText = currentValue.slice(wordStart, position);

    if (deletedText.length > 0) {
      this._addToKillRing(deletedText);
      this.bindings.setValue(currentValue.slice(0, wordStart) + currentValue.slice(position));
      this.bindings.setCursorPosition(wordStart);
    }
  }

  private _deleteWordForward() {
    const position = this.bindings.getCursorPosition();
    const currentValue = this.bindings.getCurrentValue();
    const wordEnd = getWordBoundaryForward(currentValue, position);
    const deletedText = currentValue.slice(position, wordEnd);

    if (deletedText.length > 0) {
      this._addToKillRing(deletedText);
      this.bindings.setValue(currentValue.slice(0, position) + currentValue.slice(wordEnd));
    }
  }

  private _yankText() {
    if (this._killRing.length === 0) return;

    const text = this._killRing[this._killRingPosition];
    const position = this.bindings.getCursorPosition();
    const currentValue = this.bindings.getCurrentValue();

    const newValue = currentValue.slice(0, position) + text + currentValue.slice(position);
    this.bindings.setValue(newValue);

    // Position cursor after yanked text
    this.bindings.setCursorPosition(position + text.length);
  }

  // Kill ring operations
  private _addToKillRing(text: string) {
    if (text.length === 0) return;

    this._killRing.unshift(text);
    if (this._killRing.length > this._maxKillRingSize) {
      this._killRing = this._killRing.slice(0, this._maxKillRingSize);
    }
    this._killRingPosition = 0;
  }

  /**
   * Get current kill ring contents (for debugging/testing)
   */
  getKillRing(): string[] {
    return [...this._killRing];
  }

  /**
   * Clear the kill ring
   */
  clearKillRing(): void {
    this._killRing = [];
    this._killRingPosition = 0;
  }
}
