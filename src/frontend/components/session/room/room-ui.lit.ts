// ABOUTME: Pure UI component for room display with no event handling dependencies
// ABOUTME: Takes room data as reactive properties and renders room ID and title
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("illthorn-room-ui")
export class RoomUI extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: row;
      align-items: center;
      text-align: center;
      gap: 0.5rem;
      color: var(--color-text-primary);
    }

    .room-id,
    .room-title {
      flex: 1;
    }

    .room-id:not(:empty)::after {
      content: " - ";
      margin: 0 0.25rem;
    }
  `;

  @property({ type: String })
  roomId = "";

  @property({ type: String })
  roomTitle = "";

  render() {
    return html`
      <span class="room-id">${this.roomId}</span>
      <span class="room-title">${this.roomTitle}</span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-room-ui": RoomUI;
  }
}
