// ABOUTME: Timer Rail composite component for horizontal display of multiple timers
// ABOUTME: Provides responsive layout with overflow handling and timer management API

import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./timer.lit";

interface TimerData {
  id: string;
  label: string;
  value: number;
  maxValue: number;
  type: "countdown" | "countup" | "static";
  color?: string;
  urgent?: boolean;
}

@customElement("illthorn-timer-rail-lit")
export class TimerRailLit extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      font-family: var(--font-family-ui, system-ui);
    }

    .timer-rail {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      background: var(--color-background-secondary, #f8f9fa);
      border: 1px solid var(--color-border, #dee2e6);
      border-radius: 6px;
      box-sizing: border-box;
      overflow-x: auto;
      overflow-y: hidden;
      scroll-behavior: smooth;
    }

    /* Scrollbar styling */
    .timer-rail::-webkit-scrollbar {
      height: 4px;
    }

    .timer-rail::-webkit-scrollbar-track {
      background: var(--color-background, #ffffff);
      border-radius: 2px;
    }

    .timer-rail::-webkit-scrollbar-thumb {
      background: var(--color-border, #dee2e6);
      border-radius: 2px;
    }

    .timer-rail::-webkit-scrollbar-thumb:hover {
      background: var(--color-text-secondary, #6c757d);
    }

    /* Empty state */
    .timer-rail:empty::after {
      content: "";
      display: block;
      min-height: 32px;
    }

    /* Compact mode */
    :host(.compact) .timer-rail {
      padding: 2px 4px;
      gap: 4px;
    }

    /* Timer items */
    .timer-item {
      flex-shrink: 0;
      min-width: 0;
    }

    /* Responsive behavior */
    @media (max-width: 768px) {
      .timer-rail {
        gap: 6px;
        padding: 3px 6px;
      }
    }

    @media (max-width: 480px) {
      .timer-rail {
        gap: 4px;
        padding: 2px 4px;
      }
    }

    /* Theme integration */
    :host([theme="dark"]) .timer-rail {
      background: var(--color-background-dark, #343a40);
      border-color: var(--color-border-dark, #495057);
    }

    /* Accessibility */
    .timer-rail:focus-within {
      outline: 2px solid var(--color-primary, #007acc);
      outline-offset: 2px;
    }

    /* Animation for timer additions/removals */
    .timer-item {
      transition: opacity 0.2s ease, transform 0.2s ease;
    }

    .timer-item.entering {
      opacity: 0;
      transform: scale(0.8);
    }

    .timer-item.entered {
      opacity: 1;
      transform: scale(1);
    }

    .timer-item.exiting {
      opacity: 0;
      transform: scale(0.8);
    }
  `;

  // Timer data
  @property({ type: Array })
  timers: Array<TimerData> = [];

  // Layout properties
  @property({ type: Boolean })
  compact: boolean = false;

  @property({ type: Boolean })
  showLabels: boolean = true;

  @property({ type: Number })
  maxTimers: number = 6;

  connectedCallback() {
    super.connectedCallback();

    // Set accessibility attributes
    this.setAttribute("role", "group");
    this.setAttribute("aria-label", "Timer display");
  }

  updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // Update CSS classes based on properties
    this.className = [
      this.compact ? "compact" : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  render() {
    // Filter valid timers and limit to maxTimers
    const validTimers = this._getValidTimers();
    const displayTimers = this.maxTimers > 0 ? validTimers.slice(0, this.maxTimers) : [];

    return html`
      <div class="timer-rail" role="group" aria-label="Active timers">
        ${displayTimers.map(timer => html`
          <div class="timer-item">
            <illthorn-timer-lit
              .id=${timer.id}
              .label=${timer.label}
              .value=${timer.value}
              .maxValue=${timer.maxValue}
              .type=${timer.type}
              .color=${timer.color}
              .urgent=${timer.urgent}
              .compact=${this.compact}
              .showLabel=${this.showLabels}
              @timer-expired=${this._handleTimerExpired}
              @timer-clicked=${this._handleTimerClicked}
            ></illthorn-timer-lit>
          </div>
        `)}
      </div>
    `;
  }

  private _getValidTimers(): Array<TimerData> {
    if (!Array.isArray(this.timers)) {
      return [];
    }

    return this.timers.filter(timer =>
      timer &&
      typeof timer === 'object' &&
      timer.id &&
      timer.label !== undefined &&
      timer.value !== undefined &&
      timer.maxValue !== undefined &&
      timer.type
    );
  }

  private _handleTimerExpired(e: CustomEvent) {
    // Bubble the event up from the timer component
    this.dispatchEvent(
      new CustomEvent("timer-expired", {
        detail: e.detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleTimerClicked(e: CustomEvent) {
    // Bubble the event up from the timer component
    this.dispatchEvent(
      new CustomEvent("timer-clicked", {
        detail: e.detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  // Public API methods

  /**
   * Add a new timer to the rail
   */
  addTimer(timer: TimerData) {
    if (!Array.isArray(this.timers)) {
      this.timers = [];
    }
    this.timers = [...this.timers, timer];
  }

  /**
   * Remove a timer by ID
   */
  removeTimer(id: string) {
    if (!Array.isArray(this.timers)) {
      return;
    }
    this.timers = this.timers.filter(timer => timer.id !== id);
  }

  /**
   * Update a timer's properties
   */
  updateTimer(id: string, updates: Partial<TimerData>) {
    if (!Array.isArray(this.timers)) {
      return;
    }
    const timerIndex = this.timers.findIndex(timer => timer.id === id);
    if (timerIndex >= 0) {
      this.timers = [
        ...this.timers.slice(0, timerIndex),
        { ...this.timers[timerIndex], ...updates },
        ...this.timers.slice(timerIndex + 1)
      ];
    }
  }

  /**
   * Clear all timers
   */
  clearTimers() {
    this.timers = [];
  }

  /**
   * Find a timer by ID
   */
  findTimer(id: string): TimerData | undefined {
    if (!Array.isArray(this.timers)) {
      return undefined;
    }
    return this.timers.find(timer => timer.id === id);
  }

  /**
   * Focus the first timer in the rail
   */
  focus() {
    const firstTimer = this.shadowRoot!.querySelector('illthorn-timer-lit') as HTMLElement;
    if (firstTimer) {
      firstTimer.focus();
    }
  }

  /**
   * Update multiple timers at once
   */
  updateTimers(updates: { [id: string]: Partial<TimerData> }) {
    if (!Array.isArray(this.timers)) {
      return;
    }

    this.timers = this.timers.map(timer => {
      const update = updates[timer.id];
      return update ? { ...timer, ...update } : timer;
    });
  }

  /**
   * Get count of active timers
   */
  getActiveTimerCount(): number {
    return this._getValidTimers().length;
  }

  /**
   * Get visible timer count (respecting maxTimers limit)
   */
  getVisibleTimerCount(): number {
    const validTimers = this._getValidTimers();
    return this.maxTimers > 0 ? Math.min(validTimers.length, this.maxTimers) : validTimers.length;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-timer-rail-lit": TimerRailLit;
  }
}

// Export the interface for use by other components
export type { TimerData };