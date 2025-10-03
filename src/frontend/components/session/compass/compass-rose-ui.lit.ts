// ABOUTME: Modern radial compass rose UI component with horizontal layout
// ABOUTME: Shows up/out/down on left, 8-directional compass on right, room info below
import { css, html, LitElement, svg } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("illthorn-compass-rose-ui")
export class CompassRoseUI extends LitElement {
  static styles = css`
    :host {
      display: grid;
      grid-template-columns: auto auto;
      grid-template-rows: auto auto;
      gap: 0.5rem;
      align-items: center;
      justify-items: center;
      width: fit-content;
      margin: 0 auto;
    }

    .special-exits {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
      padding-right: 0.5rem;
      margin-top: 0.5rem;
    }

    .compass-rose {
      display: grid;
      place-items: center;
      position: relative;
      width: 80px;
      height: 80px;
      margin-top: 0.5rem;
    }

    .room-info {
      grid-column: 1 / -1;
      text-align: center;
      font-size: 11px;
      line-height: 1.3;
      width: 180px;
      max-width: 180px;
      color: var(--color-text-primary);
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
      margin-top: 0.25rem;
    }

    .room-id {
      font-weight: 500;
      min-height: 1.3em;
    }

    .room-title {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      min-height: 1.3em;
    }

    svg {
      display: block;
    }

    .arrow,
    .circle {
      fill: var(--color-text-primary, #ffffff);
      opacity: 0.3;
      transition: all 0.2s ease;
    }

    .arrow.active,
    .circle.active {
      fill: var(--color-success);
      opacity: 1;
    }

    .compass-arrow {
      position: absolute;
      width: 24px;
      height: 24px;
    }

    .compass-arrow.n {
      top: 0;
      left: 50%;
      transform: translateX(-50%);
    }

    .compass-arrow.ne {
      top: 8px;
      right: 8px;
    }

    .compass-arrow.e {
      top: 50%;
      right: 0;
      transform: translateY(-50%);
    }

    .compass-arrow.se {
      bottom: 8px;
      right: 8px;
    }

    .compass-arrow.s {
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
    }

    .compass-arrow.sw {
      bottom: 8px;
      left: 8px;
    }

    .compass-arrow.w {
      top: 50%;
      left: 0;
      transform: translateY(-50%);
    }

    .compass-arrow.nw {
      top: 8px;
      left: 8px;
    }
  `;

  @property({ type: Array })
  activeDirs: Array<string> = [];

  @property({ type: String })
  roomId = "";

  @property({ type: String })
  roomTitle = "";

  private isActive(dir: string): boolean {
    return this.activeDirs.includes(dir);
  }

  private renderUpArrow() {
    return svg`
      <svg width="20" height="20" viewBox="0 0 20 20">
        <path
          class="arrow ${this.isActive("up") ? "active" : ""}"
          d="M10 2 L15 8 L12 8 L12 18 L8 18 L8 8 L5 8 Z"
        />
      </svg>
    `;
  }

  private renderDownArrow() {
    return svg`
      <svg width="20" height="20" viewBox="0 0 20 20">
        <path
          class="arrow ${this.isActive("down") ? "active" : ""}"
          d="M10 18 L15 12 L12 12 L12 2 L8 2 L8 12 L5 12 Z"
        />
      </svg>
    `;
  }

  private renderOutCircle() {
    return svg`
      <svg width="20" height="20" viewBox="0 0 20 20">
        <circle
          class="circle ${this.isActive("out") ? "active" : ""}"
          cx="10" cy="10" r="8"
        />
      </svg>
    `;
  }

  private renderCompassArrow(dir: string, rotation: number) {
    const isActive = this.isActive(dir);
    return html`
      <div class="compass-arrow ${dir}">
        <svg width="24" height="24" viewBox="0 0 24 24" style="transform: rotate(${rotation}deg)">
          <path
            class="arrow ${isActive ? "active" : ""}"
            d="M12 4 L16 10 L14 10 L14 20 L10 20 L10 10 L8 10 Z"
          />
        </svg>
      </div>
    `;
  }

  render() {
    const fullRoomText = this.roomId && this.roomTitle ? `${this.roomId} - ${this.roomTitle}` : this.roomId || this.roomTitle || "";

    return html`
      <div class="special-exits">
        ${this.renderUpArrow()}
        ${this.renderOutCircle()}
        ${this.renderDownArrow()}
      </div>

      <div class="compass-rose">
        ${this.renderCompassArrow("n", 0)}
        ${this.renderCompassArrow("ne", 45)}
        ${this.renderCompassArrow("e", 90)}
        ${this.renderCompassArrow("se", 135)}
        ${this.renderCompassArrow("s", 180)}
        ${this.renderCompassArrow("sw", 225)}
        ${this.renderCompassArrow("w", 270)}
        ${this.renderCompassArrow("nw", 315)}
      </div>

      <div class="room-info" title="${fullRoomText}">
        <div class="room-id">${this.roomId}</div>
        <div class="room-title">${this.roomTitle}</div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-compass-rose-ui": CompassRoseUI;
  }
}
