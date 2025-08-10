// ABOUTME: Clickable command elements from <d cmd="..."> tags with enhanced styling
// ABOUTME: Handles command execution with visual feedback and accessibility features

import { css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { BaseGameElement } from "./base-game-element.lit";

@customElement("illthorn-game-command")
export class GameCommand extends BaseGameElement {
  @property() cmd?: string;
  @state() private _executing = false;

  static styles = [
    BaseGameElement.styles,
    css`
    :host {
      color: var(--color-command, #27a4fd);
      cursor: pointer;
      border-bottom: 1px solid currentColor;
      text-decoration: none;
      position: relative;
      transition: all 0.2s ease;
      display: inline-block;
      border-radius: 2px;
    }
    
    :host(:hover) {
      background-color: var(--color-surface, rgba(42, 42, 42, 0.3));
      border-bottom-color: var(--color-focus, #0a84ff);
      text-shadow: 0 0 3px currentColor;
      transform: translateY(-1px);
    }
    
    :host(:focus) {
      outline: 2px solid var(--color-focus, #0a84ff);
      outline-offset: 2px;
      border-radius: 3px;
    }
    
    :host(:active) {
      transform: translateY(0);
      background-color: var(--color-surface-active, rgba(42, 42, 42, 0.5));
    }
    
    :host([executing]) {
      opacity: 0.6;
      cursor: wait;
      animation: pulse 1s ease-in-out infinite;
      border-bottom-style: dashed;
    }
    
    /* Pulse animation for executing state */
    @keyframes pulse {
      0%, 100% { 
        opacity: 0.6;
        text-shadow: 0 0 2px currentColor;
      }
      50% { 
        opacity: 0.8;
        text-shadow: 0 0 6px currentColor;
      }
    }
    
    /* Add execution indicator */
    :host([executing])::after {
      content: '';
      position: absolute;
      top: -2px;
      right: -8px;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--color-success, #51cf66);
      animation: blink 0.5s ease-in-out infinite alternate;
    }
    
    @keyframes blink {
      from { opacity: 0.3; }
      to { opacity: 1; }
    }
    
    /* Accessibility enhancement for screen readers */
    :host([aria-label]) {
      position: relative;
    }
    
    /* Hover tooltip style */
    :host::before {
      content: attr(data-tooltip);
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: var(--color-tooltip, #333);
      color: var(--color-tooltip-text, #fff);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8em;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
      z-index: 1000;
    }
    
    :host(:hover[data-tooltip])::before {
      opacity: 1;
    }
    
    /* Command type styling */
    :host([cmd-type="movement"]) {
      color: var(--color-command-movement, #69db7c);
    }
    
    :host([cmd-type="combat"]) {
      color: var(--color-command-combat, #ff6b6b);
    }
    
    :host([cmd-type="social"]) {
      color: var(--color-command-social, #ffd43b);
    }
    
    :host([cmd-type="system"]) {
      color: var(--color-command-system, #9775fa);
    }
  `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("tabindex", "0");
    this.setAttribute("role", "button");

    // Set up event listeners
    this.addEventListener("click", this._handleClick);
    this.addEventListener("keydown", this._handleKeydown);

    // Set up accessibility and tooltips
    this._setupAccessibility();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("click", this._handleClick);
    this.removeEventListener("keydown", this._handleKeydown);
  }

  private _setupAccessibility() {
    const commandText = this.cmd || this.textContent?.trim() || "Execute command";
    this.setAttribute("aria-label", `Execute command: ${commandText}`);

    // Add tooltip
    this.setAttribute("data-tooltip", `Click to execute: ${commandText}`);

    // Detect command type for styling
    this._detectCommandType();
  }

  private _detectCommandType() {
    const command = (this.cmd || this.textContent?.trim() || "").toLowerCase();

    // Movement commands
    if (/^(go|move|north|south|east|west|northeast|northwest|southeast|southwest|up|down|out|climb|swim|crawl)/.test(command)) {
      this.setAttribute("cmd-type", "movement");
    }
    // Combat commands
    else if (/^(attack|cast|prep|prepare|kill|aim|fire|throw|wield|wear|remove)/.test(command)) {
      this.setAttribute("cmd-type", "combat");
    }
    // Social commands
    else if (/^(say|whisper|tell|ask|bow|nod|smile|wave|hug|kiss|dance)/.test(command)) {
      this.setAttribute("cmd-type", "social");
    }
    // System commands
    else if (/^(quit|save|score|time|who|help|info|spell|skill)/.test(command)) {
      this.setAttribute("cmd-type", "system");
    }
  }

  render() {
    return html`<slot></slot>`;
  }

  private _handleClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (this._executing) {
      return; // Prevent double-click during execution
    }

    this._executeCommand();
  };

  private _handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      this._executeCommand();
    }
  };

  private async _executeCommand() {
    if (this._executing) return;

    const command = this.cmd || this.textContent?.trim();
    if (!command) {
      console.warn("No command to execute");
      return;
    }

    // Set executing state
    this._executing = true;
    this.setAttribute("executing", "");

    // Dispatch command execution event
    this.dispatchInteraction("execute", {
      command,
      type: this.getAttribute("cmd-type") || "unknown",
      timestamp: Date.now(),
    });

    // Visual feedback duration
    const feedbackDuration = this._getFeedbackDuration(command);

    try {
      await this._waitForExecution(feedbackDuration);
    } finally {
      // Reset executing state
      this._executing = false;
      this.removeAttribute("executing");
    }
  }

  private _getFeedbackDuration(command: string): number {
    // Longer feedback for movement/combat commands
    if (/^(go|move|attack|cast|prep)/.test(command.toLowerCase())) {
      return 1000;
    }
    // Standard feedback for most commands
    return 500;
  }

  private _waitForExecution(duration: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, duration);
    });
  }

  /**
   * Public API for external command execution
   */
  executeCommand(): void {
    this._executeCommand();
  }

  /**
   * Check if command is currently executing
   */
  get isExecuting(): boolean {
    return this._executing;
  }

  /**
   * Get command context for external systems
   */
  getCommandContext() {
    return {
      type: "command",
      command: this.cmd || this.textContent?.trim(),
      cmdType: this.getAttribute("cmd-type") || "unknown",
      text: this.textContent?.trim(),
      isExecuting: this._executing,
    };
  }

  /**
   * Update command text and recalculate accessibility
   */
  updateCommand(newCommand: string) {
    this.cmd = newCommand;
    this._setupAccessibility();
    this.requestUpdate();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-game-command": GameCommand;
  }
}
