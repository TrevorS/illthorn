// ABOUTME: Dynamic prompt indicator that changes appearance based on character state
// ABOUTME: Shows different symbols for normal, roundtime, casting, stunned states with animation support

import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

type PromptState = "normal" | "roundtime" | "casting" | "stunned" | "dead" | "sleeping";
type Size = "small" | "medium" | "large";

@customElement("illthorn-prompt-indicator-lit")
export class PromptIndicatorLit extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      font-family: var(--font-family-monospace, monospace);
      font-weight: bold;
      color: var(--color-text-primary);
      user-select: none;
    }

    :host(.size-small) {
      width: 18px;
      height: 18px;
      font-size: 0.8em;
    }

    :host(.size-large) {
      width: 32px;
      height: 32px;
      font-size: 1.2em;
    }

    .prompt-symbol {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      transition: all 0.2s ease;
    }

    /* State-specific styling */
    :host(.state-normal) {
      color: var(--color-success);
    }

    :host(.state-roundtime) {
      color: var(--color-warning);
    }

    :host(.state-casting) {
      color: var(--color-primary);
    }

    :host(.state-stunned) {
      color: var(--color-danger);
    }

    :host(.state-dead) {
      color: var(--color-text-secondary);
      opacity: 0.7;
    }

    :host(.state-sleeping) {
      color: var(--color-text-secondary);
      opacity: 0.8;
    }

    /* Animations for active states */
    :host(.animated.state-roundtime) .prompt-symbol {
      animation: pulse var(--blink-rate, 1s) infinite;
    }

    :host(.animated.state-casting) .prompt-symbol {
      animation: flash var(--blink-rate, 1s) infinite;
    }

    :host(.animated.state-sleeping) .prompt-symbol {
      animation: fade var(--blink-rate, 2s) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.3;
        transform: scale(0.9);
      }
    }

    @keyframes flash {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.2;
      }
    }

    @keyframes fade {
      0%, 100% {
        opacity: 0.8;
      }
      50% {
        opacity: 0.3;
      }
    }

    /* Hover effects for interactive states */
    :host(.state-normal) .prompt-symbol:hover {
      color: var(--color-success-hover, var(--color-success));
      transform: scale(1.1);
    }

    /* Accessibility improvements */
    :host(:focus-visible) {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
      border-radius: 2px;
    }
  `;

  @property({ type: String })
  state: PromptState = "normal";

  @property({ type: Boolean })
  animated: boolean = true;

  @property({ type: String })
  customSymbol: string = "";

  @property({ type: String })
  size: Size = "medium";

  @property({ type: Number })
  blinkRate: number = 1.0;

  // State symbol mapping
  private static readonly STATE_SYMBOLS: Record<PromptState, string> = {
    normal: ">",
    roundtime: "...",
    casting: "*",
    stunned: "!",
    dead: "†",
    sleeping: "z"
  };

  // States that support animation
  private static readonly ANIMATED_STATES: Set<PromptState> = new Set([
    "roundtime",
    "casting",
    "sleeping"
  ]);

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("role", "status");
    this.setAttribute("aria-live", "polite");
    this._updateHostClasses();
    this._updateAriaLabel();
    this._updateAnimationTiming();
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has("state") ||
        changedProperties.has("size") ||
        changedProperties.has("animated")) {
      this._updateHostClasses();
    }

    if (changedProperties.has("state") ||
        changedProperties.has("animated") ||
        changedProperties.has("customSymbol")) {
      this._updateAriaLabel();
    }

    if (changedProperties.has("blinkRate")) {
      this._updateAnimationTiming();
    }
  }

  private _updateHostClasses() {
    // Remove existing state and size classes
    this.classList.remove("state-normal", "state-roundtime", "state-casting",
                         "state-stunned", "state-dead", "state-sleeping");
    this.classList.remove("size-small", "size-medium", "size-large");
    this.classList.remove("animated");

    // Add current state class
    const validStates: Array<PromptState> = ["normal", "roundtime", "casting", "stunned", "dead", "sleeping"];
    const stateToUse = validStates.includes(this.state) ? this.state : "normal";
    this.classList.add(`state-${stateToUse}`);

    // Add size class
    const validSizes: Array<Size> = ["small", "medium", "large"];
    const sizeToUse = validSizes.includes(this.size) ? this.size : "medium";
    this.classList.add(`size-${sizeToUse}`);

    // Add animated class if enabled and state supports animation
    if (this.animated && PromptIndicatorLit.ANIMATED_STATES.has(stateToUse)) {
      this.classList.add("animated");
    }
  }

  private _updateAriaLabel() {
    const state = this._getValidState();
    const symbol = this._getDisplaySymbol();
    const animatedText = this.animated && PromptIndicatorLit.ANIMATED_STATES.has(state) ? " (animated)" : "";

    const stateDescriptions: Record<PromptState, string> = {
      normal: "ready for input",
      roundtime: "roundtime active, please wait",
      casting: "casting spell, cannot interrupt",
      stunned: "character stunned, cannot act",
      dead: "character dead, in spirit mode",
      sleeping: "character sleeping, limited actions"
    };

    const description = stateDescriptions[state];
    this.setAttribute("aria-label", `Prompt indicator: ${symbol}, ${description}${animatedText}`);
  }

  private _updateAnimationTiming() {
    // Clamp blink rate to reasonable bounds
    const clampedRate = Math.max(0.1, Math.min(10.0, this.blinkRate));
    this.style.setProperty("--blink-rate", `${clampedRate}s`);
  }

  private _getValidState(): PromptState {
    const validStates: Array<PromptState> = ["normal", "roundtime", "casting", "stunned", "dead", "sleeping"];
    return validStates.includes(this.state) ? this.state : "normal";
  }

  private _getDisplaySymbol(): string {
    // Custom symbol takes priority
    if (this.customSymbol && this.customSymbol.trim()) {
      return this.customSymbol.trim();
    }

    // Use state symbol
    const state = this._getValidState();
    return PromptIndicatorLit.STATE_SYMBOLS[state];
  }

  render() {
    return html`
      <span class="prompt-symbol">
        ${this._getDisplaySymbol()}
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-prompt-indicator-lit": PromptIndicatorLit;
  }
}