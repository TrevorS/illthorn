// ABOUTME: Room badge component for displaying room ID and title with smart truncation
// ABOUTME: Handles zone-based styling, responsive text truncation, and tooltip functionality

import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("illthorn-room-badge-lit")
export class RoomBadgeLit extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      background: var(--color-background-secondary);
      border: 1px solid var(--color-border);
      border-radius: 4px;
      font-family: var(--font-family-monospace, monospace);
      font-size: 0.85em;
      max-width: 100%;
      box-sizing: border-box;
    }

    :host(.zone-town) {
      border-color: var(--color-success);
      background: color-mix(in srgb, var(--color-success) 10%, var(--color-background-secondary));
    }

    :host(.zone-wilderness) {
      border-color: var(--color-warning);
      background: color-mix(in srgb, var(--color-warning) 10%, var(--color-background-secondary));
    }

    :host(.zone-dungeon) {
      border-color: var(--color-danger);
      background: color-mix(in srgb, var(--color-danger) 10%, var(--color-background-secondary));
    }

    :host(.zone-special) {
      border-color: var(--color-primary);
      background: color-mix(in srgb, var(--color-primary) 10%, var(--color-background-secondary));
    }

    :host(.compact) {
      padding: 2px 6px;
      gap: 4px;
      font-size: 0.75em;
    }

    .room-id {
      color: var(--color-text-secondary);
      font-weight: bold;
      flex-shrink: 0;
      font-size: 0.9em;
    }

    :host(.compact) .room-id {
      display: none;
    }

    .separator {
      color: var(--color-text-secondary);
      opacity: 0.5;
      flex-shrink: 0;
    }

    :host(.compact) .separator {
      display: none;
    }

    .room-title {
      color: var(--color-text-primary);
      flex: 1;
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
    }

    .room-title.truncated {
      text-overflow: ellipsis;
      cursor: help;
    }

    /* Zone-specific text colors */
    :host(.zone-town) .room-title {
      color: var(--color-success-text, var(--color-text-primary));
    }

    :host(.zone-wilderness) .room-title {
      color: var(--color-warning-text, var(--color-text-primary));
    }

    :host(.zone-dungeon) .room-title {
      color: var(--color-danger-text, var(--color-text-primary));
    }

    :host(.zone-special) .room-title {
      color: var(--color-primary-text, var(--color-text-primary));
    }
  `;

  @property({ type: String })
  roomId: string = "";

  private _roomTitle: string = "";

  @property({ type: String })
  get roomTitle(): string {
    return this._roomTitle;
  }

  set roomTitle(value: string) {
    const oldValue = this._roomTitle;
    this._roomTitle = value || "";
    this._calculateTruncation();
    this.requestUpdate('roomTitle', oldValue);
  }

  @property({ type: String })
  roomZone: "town" | "wilderness" | "dungeon" | "special" = "town";

  @property({ type: Number })
  maxWidth: number = 200;

  @property({ type: Boolean })
  showTooltip: boolean = true;

  @property({ type: Boolean })
  compact: boolean = false;

  @state()
  private _truncatedTitle: string = "";

  @state()
  private _isTruncated: boolean = false;

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("role", "region");
    this._updateHostClasses();
    this._calculateTruncation();
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has("roomZone") || changedProperties.has("compact")) {
      this._updateHostClasses();
    }

    if (changedProperties.has("maxWidth") || changedProperties.has("roomId")) {
      this._calculateTruncation();
    }

    if (changedProperties.has("roomId") || changedProperties.has("roomTitle")) {
      this._updateAriaLabel();
    }
  }

  private _updateHostClasses() {
    // Remove all zone classes
    this.classList.remove("zone-town", "zone-wilderness", "zone-dungeon", "zone-special");

    // Add current zone class
    this.classList.add(`zone-${this.roomZone}`);

    // Handle compact mode
    if (this.compact) {
      this.classList.add("compact");
    } else {
      this.classList.remove("compact");
    }
  }

  private _updateAriaLabel() {
    const roomInfo = [];
    if (this.roomId) roomInfo.push(`Room ${this.roomId}`);
    if (this.roomTitle) roomInfo.push(this.roomTitle);

    this.setAttribute("aria-label", `Current room: ${roomInfo.join(", ")}`);
  }

  private _calculateTruncation() {
    const title = this.roomTitle || "";
    if (!title.trim()) {
      this._truncatedTitle = "";
      this._isTruncated = false;
      return;
    }

    // Simplified truncation for now - only truncate if maxWidth is small
    if (this.maxWidth <= 100) {
      // Narrow space, truncate
      const maxChars = Math.max(5, Math.floor(this.maxWidth / 8));
      this._truncatedTitle = this._intelligentTruncate(title, maxChars);
      this._isTruncated = true;
    } else {
      // Plenty of space, show full title
      this._truncatedTitle = title;
      this._isTruncated = false;
    }
  }

  private _intelligentTruncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    if (maxLength <= 3) return "...";

    // Simple truncation for now
    return text.substring(0, maxLength - 3) + "...";
  }

  render() {
    const shouldShowTooltip = this.showTooltip && this._isTruncated;

    return html`
      ${this.roomId && !this.compact ? html`
        <span class="room-id">${this.roomId}</span>
        <span class="separator">|</span>
      ` : ""}

      <span
        class="room-title ${this._isTruncated ? 'truncated' : ''}"
        title=${shouldShowTooltip ? this.roomTitle : ''}
      >
        ${this._truncatedTitle}
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-room-badge-lit": RoomBadgeLit;
  }
}