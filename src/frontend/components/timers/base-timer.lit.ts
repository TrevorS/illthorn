// ABOUTME: Base timer component class with shared timer logic and Shoelace progress bar integration
// ABOUTME: Provides common functionality for countdown timers with proper cleanup and smooth animation

import { css, html, LitElement } from "lit";
import { property, state } from "lit/decorators.js";
import type { GameTag } from "../../parser/tag";
import type { FrontendSession } from "../../session";

export abstract class BaseTimerComponent extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 3px; /* Fixed height to prevent layout jumping */
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
    }

    :host(.active) {
      opacity: 1;
    }

    sl-progress-bar {
      width: 100%;
      --track-color: color-mix(in srgb, var(--color-text-primary) 10%, transparent);
      --track-width: 100%;
    }

    sl-progress-bar::part(base) {
      background-color: var(--track-color);
      border-radius: 0;
      height: 3px;
    }

    sl-progress-bar::part(indicator) {
      background-color: var(--indicator-color);
      border-radius: 0;
      height: 3px;
    }
  `;

  @property({ type: Object })
  session?: FrontendSession;

  @state()
  protected _progress = 0;

  @state()
  protected _isActive = false;

  private _intervalId: number | null = null;
  private _startTime: number = 0;

  // Abstract properties that subclasses must implement
  abstract get eventName(): string;
  abstract get indicatorColor(): string;
  abstract get ariaLabel(): string;

  connectedCallback() {
    super.connectedCallback();
    this._subscribeToEvents();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._cleanup();
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has("session")) {
      this._cleanup();
      this._subscribeToEvents();
    }
  }

  private _subscribeToEvents() {
    if (!this.session?.bus) {
      return;
    }

    this.session.bus.subscribeEvent<GameTag>(this.eventName, ({ detail: tag }) => {
      // Handle different XML formats from the game
      let duration = 0;

      if (tag.attrs.time && tag.attrs.value) {
        // Format: <roundTime time="1711972115" value="6"/> (documented format)
        duration = parseInt(tag.attrs.value as string, 10) || 0;
      } else if (tag.attrs.value) {
        // Format: <roundTime value="1754020723"/> (actual game format - end timestamp)
        const endTime = parseInt(tag.attrs.value as string, 10) || 0;
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        duration = Math.max(0, endTime - currentTime);
      }

      // Only start timer if we have a valid duration
      if (duration > 0) {
        this._startTimer(duration);
      } else {
        this._stopTimer();
      }
    });
  }

  private _startTimer(duration: number) {
    this._cleanup(); // Clean up any existing timer

    this._startTime = Date.now();
    this._progress = 100; // Start at 100%
    this._isActive = true;

    // Force immediate render at 100% to ensure visibility
    this.requestUpdate();

    // Update every 50ms for smooth animation
    this._intervalId = setInterval(() => {
      const elapsed = (Date.now() - this._startTime) / 1000;
      const remaining = Math.max(0, duration - elapsed);
      const progress = duration > 0 ? (remaining / duration) * 100 : 0;

      this._progress = progress;

      // Timer completed
      if (remaining <= 0) {
        this._stopTimer();
      }
    }, 50) as unknown as number;
  }

  private _stopTimer() {
    this._cleanup();
    this._progress = 0;
    this._isActive = false;
  }

  private _cleanup() {
    if (this._intervalId !== null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  render() {
    // Use classMap for reactive class management on host element
    const hostClasses = {
      active: this._isActive,
    };

    // Apply classes to host element
    this.className = Object.entries(hostClasses)
      .filter(([_, active]) => active)
      .map(([className]) => className)
      .join(" ");

    return html`
      <sl-progress-bar 
        .value=${this._progress}
        aria-label=${this.ariaLabel}
        style="--indicator-color: ${this.indicatorColor}"
      ></sl-progress-bar>
    `;
  }
}
