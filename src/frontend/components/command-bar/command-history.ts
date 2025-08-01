// ABOUTME: Command history with linear indexing from 0 (newest) to negative values (older)
// ABOUTME: Supports 500 command window with boundary detection, no circular wrapping

export enum Mode {
  FORWARD,
  BACKWARD,
}

export class CommandHistory extends Array<string> {
  /**
   * [recent] ----> [oldest]
   * currentIndex: 0 = most recent, -1 = previous, -2 = older, etc.
   */
  private currentIndex: number = 0;

  constructor(readonly maxSize = 500) {
    super();
  }

  /**
   * Backward compatibility getter for position
   */
  get position(): number {
    return Math.abs(this.currentIndex);
  }
  /**
   * Add a new command to the history.
   */
  add(command: string) {
    if (this.head().length === 0) {
      this[0] = command;
    } else {
      this.unshift(command);
    }

    // Maintain maxSize limit by removing oldest commands
    while (this.length > this.maxSize) {
      this.pop();
    }

    this.resetPosition();
    // Save commands into storage
    // Storage.set(`commandHistory`, this)
  }

  resetPosition() {
    this.currentIndex = 0;
  }
  /**
   * Returns the largest valid index available.
   */
  get last_index() {
    return Math.max(this.length - 1, 0);
  }

  /**
   * Check if we can navigate backwards (to older commands)
   */
  canNavigateBack(): boolean {
    return Math.abs(this.currentIndex) < this.length - 1;
  }

  /**
   * Check if we can navigate forwards (to newer commands)
   */
  canNavigateForward(): boolean {
    return this.currentIndex < 0;
  }

  /**
   * Step current index one step earlier in the history (towards newer commands).
   */
  forward(): string {
    if (this.canNavigateForward()) {
      this.currentIndex++;
    }
    return this.read();
  }

  /**
   * Step current index one step deeper into the history (towards older commands).
   */
  back(): string {
    if (this.canNavigateBack()) {
      this.currentIndex--;
    }
    return this.read();
  }
  /**
   * Read specified entry in the history.
   * Uses currentIndex (0 = newest, -1 = previous, etc.) converted to array index
   */
  read(index?: number): string {
    const arrayIndex = index !== undefined ? index : Math.abs(this.currentIndex);
    return this[arrayIndex] || "";
  }

  /**
   * Update the history at the current index.
   */
  update(value: string) {
    const arrayIndex = Math.abs(this.currentIndex);
    this[arrayIndex] = value;
  }
  /**
   * Compute the list of history entries matching the specified text.
   */
  match(input: string) {
    return this.filter((cmd: string) => cmd.startsWith(input) && cmd.length > input.length);
  }
  /**
   * Write current entry to specified element, and give it focus.
   */
  write(input: HTMLInputElement, mode: Mode) {
    input.value = this.read();
    switch (mode) {
      case Mode.FORWARD:
        return this.forward();
      case Mode.BACKWARD:
        return this.back();
    }
    //input.focus()
  }
  /**
   * Reads the most recent entry in the history.
   */
  head() {
    return this.read(0);
  }
  /**
   * Sets the current index to the specified value with boundary checking.
   * Expects linear index (0 = newest, -1 = previous, etc.)
   */
  seek(idx: number) {
    // Clamp to valid range: 0 to -(length-1)
    const minIndex = -(this.length - 1);
    const maxIndex = 0;
    this.currentIndex = Math.max(minIndex, Math.min(maxIndex, idx));
    return this;
  }
}
