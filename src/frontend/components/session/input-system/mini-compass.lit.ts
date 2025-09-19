// ABOUTME: Compact 3x3 compass component for the input system status bar
// ABOUTME: Displays available movement directions in a minimal footprint with optional click interactions

import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

export interface DirectionClickEvent {
  direction: string;
}

@customElement("illthorn-mini-compass-lit")
export class MiniCompassLit extends LitElement {
  static styles = css`
    :host {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(3, 1fr);
      width: 90px;
      height: 90px;
      gap: 2px;
      padding: 4px;
      border-radius: 4px;
      background: var(--color-background-secondary);
      border: 1px solid var(--color-border);
    }

    :host(.size-small) {
      width: 60px;
      height: 60px;
      gap: 1px;
      padding: 2px;
    }

    :host(.size-large) {
      width: 120px;
      height: 120px;
      gap: 3px;
      padding: 6px;
    }

    :host(.disabled) {
      opacity: 0.5;
      pointer-events: none;
    }

    button {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 2px;
      color: var(--color-text-secondary);
      font-family: var(--font-family-monospace, monospace);
      font-size: 0.7em;
      font-weight: bold;
      padding: 0;
      margin: 0;
      cursor: default;
      opacity: 0.3;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 0;
      min-height: 0;
    }

    :host(.size-small) button {
      font-size: 0.6em;
      border-radius: 1px;
    }

    :host(.size-large) button {
      font-size: 0.8em;
      border-radius: 3px;
    }

    button.active {
      background: var(--color-success);
      color: var(--color-surface);
      opacity: 1;
      border-color: var(--color-success);
    }

    button.interactive {
      cursor: pointer;
    }

    button.interactive:hover {
      opacity: 1;
      background: var(--color-primary);
      color: var(--color-surface);
      border-color: var(--color-primary);
      transform: scale(1.05);
    }

    button.interactive.active:hover {
      background: var(--color-success-hover, var(--color-success));
      border-color: var(--color-success-hover, var(--color-success));
    }

    /* Special positioning for vertical exits */
    button[data-direction="up"] {
      grid-area: 1 / 2 / 2 / 3;
    }

    button[data-direction="down"] {
      grid-area: 3 / 2 / 4 / 3;
    }

    button[data-direction="out"] {
      grid-area: 2 / 2 / 3 / 3;
    }

    /* Cardinal and intercardinal directions */
    button[data-direction="nw"] { grid-area: 1 / 1 / 2 / 2; }
    button[data-direction="n"] { grid-area: 1 / 2 / 2 / 3; }
    button[data-direction="ne"] { grid-area: 1 / 3 / 2 / 4; }
    button[data-direction="w"] { grid-area: 2 / 1 / 3 / 2; }
    button[data-direction="e"] { grid-area: 2 / 3 / 3 / 4; }
    button[data-direction="sw"] { grid-area: 3 / 1 / 4 / 2; }
    button[data-direction="s"] { grid-area: 3 / 2 / 4 / 3; }
    button[data-direction="se"] { grid-area: 3 / 3 / 4 / 4; }
  `;

  @property({ type: String })
  size: "small" | "medium" | "large" = "medium";

  @property({ type: Boolean })
  interactive: boolean = false;

  @property({ type: Boolean })
  disabled: boolean = false;

  @state()
  private _normalizedDirections: Set<string> = new Set();

  private _activeDirections: Array<string> = [];

  @property({ type: Array })
  get activeDirections(): Array<string> {
    return this._activeDirections;
  }

  set activeDirections(value: Array<string>) {
    const oldValue = this._activeDirections;
    this._activeDirections = value;
    this._normalizeActiveDirections();
    this.requestUpdate('activeDirections', oldValue);
  }

  // Direction mapping for display
  private static readonly DIRECTION_LABELS: Record<string, string> = {
    n: "N",
    ne: "NE",
    e: "E",
    se: "SE",
    s: "S",
    sw: "SW",
    w: "W",
    nw: "NW",
    up: "U",
    down: "D",
    out: "O",
  };

  // All possible directions in compass order
  private static readonly ALL_DIRECTIONS = [
    "nw", "n", "ne",
    "w", "out", "e",
    "sw", "s", "se",
    "up", "down"
  ];

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("role", "navigation");
    this.setAttribute("aria-label", "Movement compass");
    this._updateHostClasses();
    this._normalizeActiveDirections(); // Initial normalization
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has("size") || changedProperties.has("disabled")) {
      this._updateHostClasses();
    }
  }

  private _normalizeActiveDirections() {
    // Normalize direction names to lowercase and filter valid ones
    // Also handle common variations like "South" -> "s", "EAST" -> "e"
    const directionMap: Record<string, string> = {
      north: "n", n: "n",
      northeast: "ne", ne: "ne",
      east: "e", e: "e",
      southeast: "se", se: "se",
      south: "s", s: "s",
      southwest: "sw", sw: "sw",
      west: "w", w: "w",
      northwest: "nw", nw: "nw",
      up: "up", u: "up",
      down: "down", d: "down",
      out: "out", o: "out"
    };

    const normalized = new Set(
      this.activeDirections
        .map(dir => {
          const cleaned = dir.toLowerCase().trim();
          return directionMap[cleaned] || cleaned;
        })
        .filter(dir => MiniCompassLit.DIRECTION_LABELS.hasOwnProperty(dir))
    );

    this._normalizedDirections = normalized;
  }

  private _updateHostClasses() {
    this.classList.remove("size-small", "size-medium", "size-large", "disabled");
    this.classList.add(`size-${this.size}`);

    if (this.disabled) {
      this.classList.add("disabled");
    }
  }

  private _isDirectionActive(direction: string): boolean {
    return this._normalizedDirections.has(direction);
  }

  private _getButtonClasses(direction: string): string {
    const classes = [];

    if (this._isDirectionActive(direction)) {
      classes.push("active");
    }

    if (this.interactive && !this.disabled) {
      classes.push("interactive");
    }

    return classes.join(" ");
  }

  private _getButtonAriaLabel(direction: string): string {
    const directionName = this._getDirectionName(direction);
    const isActive = this._isDirectionActive(direction);
    const status = isActive ? "available" : "blocked";

    return `${directionName} direction, ${status}`;
  }

  private _getDirectionName(direction: string): string {
    const names: Record<string, string> = {
      n: "north",
      ne: "northeast",
      e: "east",
      se: "southeast",
      s: "south",
      sw: "southwest",
      w: "west",
      nw: "northwest",
      up: "up",
      down: "down",
      out: "out"
    };
    return names[direction] || direction;
  }

  private _handleDirectionClick(direction: string) {
    // Only emit events for interactive, non-disabled compass with active directions
    if (!this.interactive || this.disabled || !this._isDirectionActive(direction)) {
      return;
    }

    const event = new CustomEvent<DirectionClickEvent>("direction-clicked", {
      detail: { direction },
      bubbles: true,
      composed: true,
    });

    this.dispatchEvent(event);
  }

  render() {
    return html`
      ${MiniCompassLit.ALL_DIRECTIONS.map(direction => {
        return html`
          <button
            data-direction=${direction}
            class=${this._getButtonClasses(direction)}
            aria-label=${this._getButtonAriaLabel(direction)}
            aria-pressed=${this._isDirectionActive(direction) ? "true" : "false"}
            @click=${() => this._handleDirectionClick(direction)}
          >
            ${MiniCompassLit.DIRECTION_LABELS[direction]}
          </button>
        `;
      })}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-mini-compass-lit": MiniCompassLit;
  }
}

declare global {
  interface HTMLElementEventMap {
    "direction-clicked": CustomEvent<DirectionClickEvent>;
  }
}