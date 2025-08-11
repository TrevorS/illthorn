// ABOUTME: Monster display component for <b> wrapped entities with enhanced styling
// ABOUTME: Provides distinctive styling and interaction for hostile game entities

import { css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { BaseGameElement } from "./base-game-element.lit";

@customElement("illthorn-game-monster")
export class GameMonster extends BaseGameElement {
  @property() exist?: string;
  @property() noun?: string;
  @property() level?: string;
  @property() threat?: "low" | "medium" | "high" | "extreme";
  @state() private _isTargeted = false;
  @state() private _healthStatus: "healthy" | "wounded" | "badly-wounded" | "near-death" = "healthy";

  static styles = [
    BaseGameElement.styles,
    css`
    :host {
      color: var(--color-monster, #ff6b6b);
      font-weight: bold;
      cursor: pointer;
      position: relative;
    }
    
    :host(:hover) {
      text-decoration: underline;
    }
    
    :host(:focus) {
      outline: 2px solid var(--color-monster, #ff6b6b);
      outline-offset: 2px;
      border-radius: 4px;
    }
    
    :host(:active) {
      transform: scale(0.95);
    }
    
    /* Targeting state */
    :host([targeted]) {
      background-color: var(--color-monster-targeted, rgba(255, 107, 107, 0.2));
      border: 1px solid var(--color-monster, #ff6b6b);
      padding: 2px 4px;
      margin: -3px -5px;
      animation: targetPulse 2s ease-in-out infinite;
    }
    
    @keyframes targetPulse {
      0%, 100% { box-shadow: 0 0 4px var(--color-monster, #ff6b6b); }
      50% { box-shadow: 0 0 12px var(--color-monster, #ff6b6b); }
    }
    
    /* Threat level indicators */
    :host([threat="low"]) {
      color: var(--color-monster-low, #69db7c);
      text-shadow: 0 0 2px var(--color-monster-low, #69db7c);
    }
    
    :host([threat="medium"]) {
      color: var(--color-monster-medium, #ffd43b);
      text-shadow: 0 0 2px var(--color-monster-medium, #ffd43b);
    }
    
    :host([threat="high"]) {
      color: var(--color-monster-high, #ff8c00);
      text-shadow: 0 0 2px var(--color-monster-high, #ff8c00);
    }
    
    :host([threat="extreme"]) {
      color: var(--color-monster-extreme, #dc2626);
      text-shadow: 0 0 4px var(--color-monster-extreme, #dc2626);
      animation: extremeThreat 3s ease-in-out infinite;
    }
    
    @keyframes extremeThreat {
      0%, 100% { 
        text-shadow: 0 0 4px var(--color-monster-extreme, #dc2626);
        filter: brightness(1);
      }
      50% { 
        text-shadow: 0 0 8px var(--color-monster-extreme, #dc2626);
        filter: brightness(1.2);
      }
    }
    
    /* Health status indicators */
    :host([health-status="wounded"]) {
      opacity: 0.85;
    }
    
    :host([health-status="badly-wounded"]) {
      opacity: 0.7;
      text-decoration: line-through;
    }
    
    :host([health-status="near-death"]) {
      opacity: 0.5;
      text-decoration: line-through;
      animation: nearDeath 1s ease-in-out infinite alternate;
    }
    
    @keyframes nearDeath {
      from { opacity: 0.3; }
      to { opacity: 0.6; }
    }
    
    /* Level indicator */
    :host([level])::after {
      content: attr(level);
      position: absolute;
      top: -8px;
      right: -4px;
      background: var(--color-level-badge, rgba(0, 0, 0, 0.7));
      color: var(--color-level-text, #fff);
      font-size: 0.7em;
      font-weight: normal;
      padding: 1px 4px;
      border-radius: 8px;
      min-width: 12px;
      text-align: center;
      line-height: 1.2;
      z-index: 1;
      pointer-events: none;
    }
    
    /* Combat action buttons (shown on hover for interactable monsters) */
    :host([exist]:hover)::before {
      content: '';
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      border-top: 4px solid var(--color-tooltip, #333);
      z-index: 999;
    }
    
    /* Enhanced accessibility */
    :host([aria-label]) {
      position: relative;
    }
    
    /* Special styling for boss monsters */
    :host([boss]) {
      font-size: 1.1em;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: linear-gradient(45deg, 
        var(--color-boss-1, #8b5cf6), 
        var(--color-boss-2, #a855f7),
        var(--color-boss-3, #9333ea));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: bossShimmer 4s ease-in-out infinite;
    }
    
    @keyframes bossShimmer {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    
    /* Dead monster styling */
    :host([dead]) {
      opacity: 0.3;
      text-decoration: line-through;
      cursor: default;
      pointer-events: none;
      filter: grayscale(100%);
    }
  `,
  ];

  connectedCallback() {
    super.connectedCallback();

    // Set tabindex="0" for keyboard accessibility (WCAG 2.1 compliance)
    // This allows users to navigate monsters using Tab/Shift+Tab and target with Enter/Space
    this.setAttribute("tabindex", "0");
    this.setAttribute("role", "button");

    // Set up event listeners
    this.addEventListener("click", this._handleClick);
    this.addEventListener("contextmenu", this._handleContextMenu);
    this.addEventListener("keydown", this._handleKeydown);

    // Set up monster characteristics
    this._setupMonsterData();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("click", this._handleClick);
    this.removeEventListener("contextmenu", this._handleContextMenu);
    this.removeEventListener("keydown", this._handleKeydown);
  }

  private _setupMonsterData() {
    const monsterName = this.textContent?.trim() || "";

    // Detect threat level from monster name
    this.threat = this._detectThreatLevel(monsterName);

    // Detect boss monsters
    if (this._isBossMonster(monsterName)) {
      this.setAttribute("boss", "");
    }

    // Set up accessibility
    const threatText = this.threat ? ` (${this.threat} threat)` : "";
    const levelText = this.level ? ` level ${this.level}` : "";
    const interactiveText = this.exist ? " (click to target)" : "";

    this.setAttribute("aria-label", `Monster: ${monsterName}${levelText}${threatText}${interactiveText}`);
  }

  private _detectThreatLevel(name: string): "low" | "medium" | "high" | "extreme" {
    const lowerName = name.toLowerCase();

    // Extreme threats
    if (/(?:ancient|elder|greater|massive|towering|colossal|legendary|champion|lord|king|queen|emperor|master)/.test(lowerName)) {
      return "extreme";
    }

    // High threats
    if (/(?:veteran|seasoned|battle-scarred|war|giant|huge|hulking|fierce)/.test(lowerName)) {
      return "high";
    }

    // Medium threats
    if (/(?:greater|large|big|armed|warrior|guard|soldier)/.test(lowerName)) {
      return "medium";
    }

    // Low threat default
    return "low";
  }

  private _isBossMonster(name: string): boolean {
    const lowerName = name.toLowerCase();
    return /(?:boss|lord|king|queen|emperor|empress|master|ancient|legendary|the\s+)/.test(lowerName);
  }

  render() {
    return html`<slot></slot>`;
  }

  private _handleClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (this.hasAttribute("dead")) {
      return; // Dead monsters don't respond
    }

    // Target the monster
    this._setTargeted(!this._isTargeted);

    this.dispatchInteraction("monster-click", {
      exist: this.exist,
      noun: this.noun,
      name: this.textContent?.trim(),
      threat: this.threat,
      level: this.level,
      targeted: this._isTargeted,
      x: e.clientX,
      y: e.clientY,
    });
  };

  private _handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    this.dispatchInteraction("monster-context", {
      exist: this.exist,
      noun: this.noun,
      name: this.textContent?.trim(),
      threat: this.threat,
      level: this.level,
      x: e.clientX,
      y: e.clientY,
      actions: this._getAvailableActions(),
    });
  };

  private _handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();

      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        clientX: 0,
        clientY: 0,
      });
      this._handleClick(clickEvent);
    } else if (e.key === "Menu" || (e.key === "F10" && e.shiftKey)) {
      e.preventDefault();
      e.stopPropagation();

      const rect = this.getBoundingClientRect();
      const contextEvent = new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
      });
      this._handleContextMenu(contextEvent);
    }
  };

  private _getAvailableActions(): Array<string> {
    const actions = ["Look", "Consider"];

    if (this.exist && !this.hasAttribute("dead")) {
      actions.push("Attack", "Target", "Cast at");
    }

    return actions;
  }

  private _setTargeted(targeted: boolean) {
    this._isTargeted = targeted;
    if (targeted) {
      this.setAttribute("targeted", "");
    } else {
      this.removeAttribute("targeted");
    }
  }

  /**
   * Public API methods
   */
  setHealthStatus(status: typeof this._healthStatus) {
    this._healthStatus = status;
    this.setAttribute("health-status", status);
  }

  setDead(isDead: boolean) {
    if (isDead) {
      this.setAttribute("dead", "");
      this._setTargeted(false);
    } else {
      this.removeAttribute("dead");
    }
  }

  setLevel(level: string | number) {
    this.level = level.toString();
    this.setAttribute("level", this.level);
  }

  get isTargeted(): boolean {
    return this._isTargeted;
  }

  get isDead(): boolean {
    return this.hasAttribute("dead");
  }

  /**
   * Get monster context for external systems
   */
  getMonsterContext() {
    return {
      type: "monster",
      noun: this.noun,
      exist: this.exist,
      name: this.textContent?.trim(),
      threat: this.threat,
      level: this.level,
      healthStatus: this._healthStatus,
      isTargeted: this._isTargeted,
      isDead: this.hasAttribute("dead"),
      isBoss: this.hasAttribute("boss"),
    };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-game-monster": GameMonster;
  }
}
