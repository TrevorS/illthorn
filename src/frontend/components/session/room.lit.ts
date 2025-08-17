// ABOUTME: Lit-based room component for displaying room ID and title in Gemstone IV
// ABOUTME: Shows current room information based on game metadata events
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { GameTag } from "../../parser/tag";
import type { FrontendSession as Session } from "../../session/index";

@customElement("illthorn-room-lit")
export class Room extends LitElement {
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

  @property({ type: Object })
  session?: Session;

  @state()
  private _roomId = "";

  @state()
  private _roomTitle = "";

  private _eventListenerSetup = false;

  connectedCallback() {
    super.connectedCallback();
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has("session")) {
      if (this.session && !this._eventListenerSetup) {
        this.setupEventListeners();
        this._eventListenerSetup = true;
      }
    }
  }

  private setupEventListeners() {
    if (!this.session || !this.session.bus) {
      return;
    }

    this.session.bus.subscribeEvent<GameTag>("metadata/nav", ({ detail: nav }) => {
      this._roomId = (nav.attrs?.rm as string) || "";
      this.requestUpdate();
    });

    this.session.bus.subscribeEvent<GameTag>("metadata/streamWindow/room", ({ detail: streamWindow }) => {
      const title = (streamWindow.attrs?.subtitle || "").toString();
      this._roomTitle = title.replace(/^-\s/, "");
      this.requestUpdate();
    });
  }

  render() {
    return html`
      <span class="room-id">${this._roomId}</span>
      <span class="room-title">${this._roomTitle}</span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-room-lit": Room;
  }
}
