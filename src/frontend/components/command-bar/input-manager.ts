// ABOUTME: Input manager for rapid value changes without triggering Lit reactivity
// ABOUTME: Provides direct sl-input manipulation with debounced sync back to reactive state

import type SlInput from "@shoelace-style/shoelace/dist/components/input/input.component.js";

export type InputUpdateCallback = (value: string) => void;

export class InputManager {
  private _isInRapidMode = false;
  private _rapidModeTimer?: number;
  private _pendingValue = "";
  private _onSyncCallback?: InputUpdateCallback;

  constructor(
    private slInput: SlInput,
    private debounceMs = 150,
  ) {}

  /**
   * Set callback to be called when syncing back to reactive state
   */
  setOnSyncCallback(callback: InputUpdateCallback): void {
    this._onSyncCallback = callback;
  }

  /**
   * Check if currently in rapid mode (skipping reactive updates)
   */
  get isInRapidMode(): boolean {
    return this._isInRapidMode;
  }

  /**
   * Get the current pending value (may be ahead of reactive state)
   */
  get pendingValue(): string {
    return this._pendingValue;
  }

  /**
   * Performance-optimized direct input manipulation for rapid changes
   */
  setValueImmediate(value: string, cursorPosition?: number): void {
    if (!this.slInput?.input) return;

    // Direct DOM manipulation - bypasses Lit reactivity entirely
    this.slInput.input.value = value;
    this._pendingValue = value;

    // Cursor positioning with requestAnimationFrame for timing
    if (cursorPosition !== undefined) {
      requestAnimationFrame(() => {
        if (this.slInput?.input) {
          this.slInput.input.setSelectionRange(cursorPosition, cursorPosition);
        }
      });
    }

    // Enter rapid mode and debounce sync back to reactive state
    this._isInRapidMode = true;
    clearTimeout(this._rapidModeTimer);
    this._rapidModeTimer = window.setTimeout(() => {
      this._syncToReactiveState();
    }, this.debounceMs);
  }

  /**
   * Sync pending value back to Lit's reactive state
   */
  private _syncToReactiveState(): void {
    this._isInRapidMode = false;
    if (this._onSyncCallback) {
      this._onSyncCallback(this._pendingValue);
    }
  }

  /**
   * Force immediate sync to reactive state (useful for cleanup)
   */
  forceSync(): void {
    clearTimeout(this._rapidModeTimer);
    this._syncToReactiveState();
  }

  /**
   * Get cursor position from the underlying input
   */
  getCursorPosition(): number {
    if (this.slInput?.input) {
      return this.slInput.input.selectionStart || 0;
    }
    return 0;
  }

  /**
   * Set cursor position in the underlying input
   */
  setCursorPosition(position: number): void {
    if (this.slInput?.input) {
      this.slInput.input.setSelectionRange(position, position);
    }
  }

  /**
   * Focus the input element
   */
  focus(): void {
    requestAnimationFrame(() => {
      this.slInput?.focus();
    });
  }

  /**
   * Get the current value from the input (may be more current than reactive state)
   */
  getCurrentValue(): string {
    return this.slInput?.input?.value || "";
  }

  /**
   * Clean up timers
   */
  destroy(): void {
    clearTimeout(this._rapidModeTimer);
  }
}
