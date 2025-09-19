// ABOUTME: Status indicators component for displaying character states in the input system
// ABOUTME: Shows roundtime, casttime, stance, mind state, and resource levels with responsive layout

import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

type Stance = "offensive" | "advance" | "forward" | "neutral" | "guarded" | "defensive";
type MindState = "clear" | "muddled" | "confused" | "stunned";

@customElement("illthorn-status-indicators-lit")
export class StatusIndicatorsLit extends LitElement {
  static styles = css`
    :host {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 6px 12px;
      background: var(--color-background-secondary);
      border: 1px solid var(--color-border);
      border-radius: 4px;
      font-family: var(--font-family-monospace, monospace);
      font-size: 0.85em;
      min-height: 32px;
      box-sizing: border-box;
    }

    :host(.compact) {
      gap: 8px;
      padding: 4px 8px;
      font-size: 0.75em;
      min-height: 24px;
    }

    .indicator {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 2px 6px;
      border-radius: 2px;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    :host(.compact) .indicator {
      padding: 1px 4px;
      gap: 2px;
    }

    .indicator.inactive {
      display: none;
    }

    .label {
      font-size: 0.9em;
      opacity: 0.8;
    }

    :host(.compact) .label.hidden,
    .label.hidden {
      display: none;
    }

    .value {
      font-weight: bold;
    }

    /* Timer indicators */
    .roundtime, .casttime {
      background: var(--color-warning);
      color: var(--color-surface);
      border: 1px solid var(--color-warning);
    }

    .casttime {
      background: var(--color-primary);
      border-color: var(--color-primary);
    }

    /* Stance indicators */
    .stance {
      background: var(--color-success);
      color: var(--color-surface);
      border: 1px solid var(--color-success);
    }

    :host(.stance-offensive) .stance {
      background: var(--color-danger);
      border-color: var(--color-danger);
    }

    :host(.stance-advance) .stance {
      background: color-mix(in srgb, var(--color-danger) 70%, var(--color-warning) 30%);
      border-color: color-mix(in srgb, var(--color-danger) 70%, var(--color-warning) 30%);
    }

    :host(.stance-forward) .stance {
      background: color-mix(in srgb, var(--color-warning) 70%, var(--color-danger) 30%);
      border-color: color-mix(in srgb, var(--color-warning) 70%, var(--color-danger) 30%);
    }

    :host(.stance-guarded) .stance {
      background: color-mix(in srgb, var(--color-success) 70%, var(--color-primary) 30%);
      border-color: color-mix(in srgb, var(--color-success) 70%, var(--color-primary) 30%);
    }

    :host(.stance-defensive) .stance {
      background: var(--color-primary);
      border-color: var(--color-primary);
    }

    /* Mind state indicators */
    .mind-state {
      background: var(--color-surface);
      color: var(--color-text-primary);
      border: 1px solid var(--color-border);
    }

    :host(.mind-muddled) .mind-state {
      background: var(--color-warning);
      color: var(--color-surface);
      border-color: var(--color-warning);
    }

    :host(.mind-confused) .mind-state {
      background: color-mix(in srgb, var(--color-warning) 70%, var(--color-danger) 30%);
      color: var(--color-surface);
      border-color: color-mix(in srgb, var(--color-warning) 70%, var(--color-danger) 30%);
    }

    :host(.mind-stunned) .mind-state {
      background: var(--color-danger);
      color: var(--color-surface);
      border-color: var(--color-danger);
    }

    /* Resource indicators */
    .resource {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      color: var(--color-text-primary);
    }

    .resource.low {
      background: var(--color-warning);
      color: var(--color-surface);
      border-color: var(--color-warning);
    }

    .resource.critical {
      background: var(--color-danger);
      color: var(--color-surface);
      border-color: var(--color-danger);
    }

    .health { --resource-color: var(--color-danger); }
    .mana { --resource-color: var(--color-primary); }
    .stamina { --resource-color: var(--color-warning); }
    .spirit { --resource-color: var(--color-success); }

    /* Responsive adjustments */
    @media (max-width: 600px) {
      :host {
        gap: 6px;
        padding: 4px 8px;
        font-size: 0.75em;
      }

      .indicator {
        gap: 2px;
        padding: 1px 4px;
      }
    }
  `;

  @property({ type: Number })
  roundtime: number = 0;

  @property({ type: Number })
  casttime: number = 0;

  @property({ type: String })
  stance: Stance = "neutral";

  @property({ type: String })
  mindState: MindState = "clear";

  @property({ type: Number })
  health: number = 100;

  @property({ type: Number })
  mana: number = 100;

  @property({ type: Number })
  stamina: number = 100;

  @property({ type: Number })
  spirit: number = 100;

  @property({ type: Boolean })
  compact: boolean = false;

  @property({ type: Boolean })
  showLabels: boolean = true;

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("role", "status");
    this._updateHostClasses();
    this._updateAriaLabel();
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has("compact") ||
        changedProperties.has("stance") ||
        changedProperties.has("mindState")) {
      this._updateHostClasses();
    }

    if (changedProperties.has("roundtime") ||
        changedProperties.has("casttime") ||
        changedProperties.has("stance") ||
        changedProperties.has("mindState") ||
        changedProperties.has("health") ||
        changedProperties.has("mana") ||
        changedProperties.has("stamina") ||
        changedProperties.has("spirit")) {
      this._updateAriaLabel();
    }
  }

  private _updateHostClasses() {
    // Remove existing classes
    this.classList.remove("compact", "stance-offensive", "stance-advance", "stance-forward",
                         "stance-neutral", "stance-guarded", "stance-defensive",
                         "mind-clear", "mind-muddled", "mind-confused", "mind-stunned");

    // Add current classes
    if (this.compact) {
      this.classList.add("compact");
    }

    // Validate and add stance class
    const validStances: Array<Stance> = ["offensive", "advance", "forward", "neutral", "guarded", "defensive"];
    const stanceToUse = validStances.includes(this.stance) ? this.stance : "neutral";
    this.classList.add(`stance-${stanceToUse}`);

    // Validate and add mind state class
    const validMindStates: Array<MindState> = ["clear", "muddled", "confused", "stunned"];
    const mindStateToUse = validMindStates.includes(this.mindState) ? this.mindState : "clear";
    this.classList.add(`mind-${mindStateToUse}`);
  }

  private _updateAriaLabel() {
    const status = [];

    if (this._isTimerActive(this.roundtime)) {
      status.push(`roundtime ${this.roundtime} seconds`);
    }
    if (this._isTimerActive(this.casttime)) {
      status.push(`casttime ${this.casttime} seconds`);
    }

    status.push(`stance ${this.stance}`);

    if (this.mindState !== "clear") {
      status.push(`mind ${this.mindState}`);
    }

    status.push(`health ${this._clampResource(this.health)}%`);
    status.push(`mana ${this._clampResource(this.mana)}%`);
    status.push(`stamina ${this._clampResource(this.stamina)}%`);
    status.push(`spirit ${this._clampResource(this.spirit)}%`);

    this.setAttribute("aria-label", `Character status: ${status.join(", ")}`);
  }

  private _isTimerActive(timer: number): boolean {
    return timer > 0;
  }

  private _clampResource(value: number): number {
    return Math.max(0, Math.min(100, value));
  }

  private _getResourceClass(value: number): string {
    const clamped = this._clampResource(value);
    if (clamped <= 10) return "critical";
    if (clamped <= 25) return "low";
    return "";
  }

  private _shouldShowLabel(alwaysShow: boolean = false): boolean {
    return this.showLabels || alwaysShow;
  }

  private _formatResourceText(value: number): string {
    return `${this._clampResource(value)}%`;
  }

  private _getStanceDisplayText(): string {
    const stanceLabels: Record<Stance, string> = {
      offensive: "OFF",
      advance: "ADV",
      forward: "FWD",
      neutral: "NEU",
      guarded: "GRD",
      defensive: "DEF"
    };

    const validStances: Array<Stance> = ["offensive", "advance", "forward", "neutral", "guarded", "defensive"];
    const stanceToUse = validStances.includes(this.stance) ? this.stance : "neutral";
    return stanceLabels[stanceToUse];
  }

  private _getMindStateDisplayText(): string {
    const mindStateLabels: Record<MindState, string> = {
      clear: "CLR",
      muddled: "MUD",
      confused: "CNF",
      stunned: "STN"
    };

    const validMindStates: Array<MindState> = ["clear", "muddled", "confused", "stunned"];
    const mindStateToUse = validMindStates.includes(this.mindState) ? this.mindState : "clear";
    return mindStateLabels[mindStateToUse];
  }

  render() {
    return html`
      <!-- Active Timers -->
      ${this._isTimerActive(this.roundtime) ? html`
        <div class="indicator roundtime" aria-label="Roundtime ${this.roundtime} seconds remaining">
          ${this._shouldShowLabel() ? html`<span class="label ${!this.showLabels ? 'hidden' : ''}">RT:</span>` : ""}
          <span class="value">${this.roundtime}s</span>
        </div>
      ` : ""}

      ${this._isTimerActive(this.casttime) ? html`
        <div class="indicator casttime" aria-label="Casttime ${this.casttime} seconds remaining">
          ${this._shouldShowLabel() ? html`<span class="label ${!this.showLabels ? 'hidden' : ''}">CT:</span>` : ""}
          <span class="value">${this.casttime}s</span>
        </div>
      ` : ""}

      <!-- Stance -->
      <div class="indicator stance" aria-label="Combat stance: ${this.stance}">
        ${this._shouldShowLabel() ? html`<span class="label ${!this.showLabels ? 'hidden' : ''}">Stance:</span>` : ""}
        <span class="value">${this._getStanceDisplayText()}</span>
      </div>

      <!-- Mind State (only show if not clear) -->
      ${this.mindState !== "clear" ? html`
        <div class="indicator mind-state" aria-label="Mind state: ${this.mindState}">
          ${this._shouldShowLabel() ? html`<span class="label ${!this.showLabels ? 'hidden' : ''}">Mind:</span>` : ""}
          <span class="value">${this._getMindStateDisplayText()}</span>
        </div>
      ` : ""}

      <!-- Resources -->
      <div class="indicator resource health ${this._getResourceClass(this.health)}"
           aria-label="Health: ${this._formatResourceText(this.health)}">
        ${this._shouldShowLabel() ? html`<span class="label ${!this.showLabels ? 'hidden' : ''}">HP:</span>` : ""}
        <span class="value">${this._formatResourceText(this.health)}</span>
      </div>

      <div class="indicator resource mana ${this._getResourceClass(this.mana)}"
           aria-label="Mana: ${this._formatResourceText(this.mana)}">
        ${this._shouldShowLabel() ? html`<span class="label ${!this.showLabels ? 'hidden' : ''}">MP:</span>` : ""}
        <span class="value">${this._formatResourceText(this.mana)}</span>
      </div>

      <div class="indicator resource stamina ${this._getResourceClass(this.stamina)}"
           aria-label="Stamina: ${this._formatResourceText(this.stamina)}">
        ${this._shouldShowLabel() ? html`<span class="label ${!this.showLabels ? 'hidden' : ''}">SP:</span>` : ""}
        <span class="value">${this._formatResourceText(this.stamina)}</span>
      </div>

      <div class="indicator resource spirit ${this._getResourceClass(this.spirit)}"
           aria-label="Spirit: ${this._formatResourceText(this.spirit)}">
        ${this._shouldShowLabel() ? html`<span class="label ${!this.showLabels ? 'hidden' : ''}">ST:</span>` : ""}
        <span class="value">${this._formatResourceText(this.spirit)}</span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-status-indicators-lit": StatusIndicatorsLit;
  }
}