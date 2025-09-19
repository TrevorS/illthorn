// ABOUTME: Input Status Bar composite component combining status indicators, room badge, and mini compass
// ABOUTME: Provides horizontal layout with responsive behavior and property pass-through to child components

import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./status-indicators.lit";
import "./room-badge.lit";
import "./mini-compass.lit";

@customElement("illthorn-input-status-bar-lit")
export class InputStatusBarLit extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      font-family: var(--font-family-ui, system-ui);
    }

    .status-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      background: var(--color-background-secondary, #f8f9fa);
      border: 1px solid var(--color-border, #dee2e6);
      border-radius: 6px;
      box-sizing: border-box;
    }

    /* Responsive behavior */
    @media (max-width: 768px) {
      .status-bar {
        flex-direction: column;
        gap: 8px;
        padding: 6px 8px;
      }

      .status-indicators {
        order: 1;
        width: 100%;
      }

      .room-info {
        order: 2;
        width: 100%;
      }

      .navigation {
        order: 3;
        align-self: center;
      }
    }

    @media (max-width: 480px) {
      .status-bar {
        gap: 6px;
        padding: 4px 6px;
      }
    }

    /* Compact mode */
    :host(.compact) .status-bar {
      padding: 4px 8px;
      gap: 8px;
    }

    :host(.compact) .status-indicators {
      flex-shrink: 2;
    }

    /* Layout sections */
    .status-indicators {
      flex: 2;
      min-width: 0; /* Allow shrinking */
    }

    .room-info {
      flex: 3;
      min-width: 0; /* Allow shrinking */
    }

    .navigation {
      flex-shrink: 0; /* Don't shrink compass */
    }

    /* Theme integration */
    :host([theme="dark"]) .status-bar {
      background: var(--color-background-dark, #343a40);
      border-color: var(--color-border-dark, #495057);
    }

    /* Accessibility */
    .status-bar:focus-within {
      outline: 2px solid var(--color-primary, #007acc);
      outline-offset: 2px;
    }
  `;

  // Room properties
  @property({ type: String })
  roomId: string = "";

  @property({ type: String })
  roomTitle: string = "";

  @property({ type: String })
  zone: "town" | "wilderness" | "dungeon" | "special" = "town";

  // Navigation properties
  @property({ type: Array })
  activeDirections: Array<string> = [];

  @property({ type: Boolean })
  interactiveCompass: boolean = false;

  // Status properties
  @property({ type: Number })
  roundtime: number = 0;

  @property({ type: Number })
  casttime: number = 0;

  @property({ type: String })
  stance: string = "neutral";

  @property({ type: String })
  mindState: string = "clear";

  @property({ type: Number })
  health: number = 100;

  @property({ type: Number })
  mana: number = 100;

  @property({ type: Number })
  stamina: number = 100;

  @property({ type: Number })
  spirit: number = 100;

  // Layout properties
  @property({ type: Boolean })
  compact: boolean = false;

  @property({ type: Boolean })
  showLabels: boolean = true;

  connectedCallback() {
    super.connectedCallback();

    // Set accessibility attributes
    this.setAttribute("role", "toolbar");
    this.setAttribute("aria-label", "Game status information");
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
    return html`
      <div
        class="status-bar"
        role="toolbar"
        aria-label="Game status information"
      >
        <div class="status-indicators">
          <illthorn-status-indicators-lit
            .roundtime=${this.roundtime}
            .casttime=${this.casttime}
            .stance=${this.stance}
            .mindState=${this.mindState}
            .health=${this.health}
            .mana=${this.mana}
            .stamina=${this.stamina}
            .spirit=${this.spirit}
            .compact=${this.compact}
            .showLabels=${this.showLabels}
          ></illthorn-status-indicators-lit>
        </div>

        <div class="room-info">
          <illthorn-room-badge-lit
            .roomId=${this.roomId}
            .roomTitle=${this.roomTitle}
            .zone=${this.zone}
            .compact=${this.compact}
            .showTooltip=${true}
            .maxWidth=${this.compact ? 200 : 300}
          ></illthorn-room-badge-lit>
        </div>

        <div class="navigation">
          <illthorn-mini-compass-lit
            .activeDirections=${this.activeDirections}
            .interactive=${this.interactiveCompass}
            .size=${this.compact ? "small" : "medium"}
            .disabled=${false}
            @direction-clicked=${this._handleDirectionClick}
          ></illthorn-mini-compass-lit>
        </div>
      </div>
    `;
  }

  private _handleDirectionClick(e: CustomEvent) {
    // Bubble the event up from the mini compass
    this.dispatchEvent(
      new CustomEvent("direction-clicked", {
        detail: e.detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  // Public API methods

  /**
   * Focus the first focusable element in the status bar
   */
  focus() {
    const firstFocusable = this.shadowRoot!.querySelector('[tabindex="0"], button, input, [href]') as HTMLElement;
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }

  /**
   * Update all status values at once
   */
  updateStatus(status: {
    roundtime?: number;
    casttime?: number;
    stance?: string;
    mindState?: string;
    health?: number;
    mana?: number;
    stamina?: number;
    spirit?: number;
  }) {
    Object.assign(this, status);
  }

  /**
   * Update room information
   */
  updateRoom(room: {
    roomId?: string;
    roomTitle?: string;
    zone?: "town" | "wilderness" | "dungeon" | "special";
  }) {
    Object.assign(this, room);
  }

  /**
   * Update navigation information
   */
  updateNavigation(navigation: {
    activeDirections?: Array<string>;
    interactiveCompass?: boolean;
  }) {
    Object.assign(this, navigation);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-input-status-bar-lit": InputStatusBarLit;
  }
}