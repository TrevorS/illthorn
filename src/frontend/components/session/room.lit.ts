// ABOUTME: Lit-based room component for displaying room ID and title in Gemstone IV
// ABOUTME: Shows current room information based on game metadata events
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { GameTag } from "../../parser/tag";
import type { FrontendSession as Session } from "../../session/index";
import { SessionStateMixin } from "../mixins/session-state-mixin";

@customElement("illthorn-room-lit")
export class Room extends SessionStateMixin(LitElement) {
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

  protected getStateToStore(): Record<string, unknown> {
    return {
      roomId: this._roomId,
      roomTitle: this._roomTitle,
    };
  }

  protected restoreState(state: Record<string, unknown>): void {
    this._roomId = (state.roomId as string) || "";
    this._roomTitle = (state.roomTitle as string) || "";
  }

  protected getStorageKeyPrefix(): string {
    return "room";
  }

  connectedCallback() {
    super.connectedCallback();
    // Setup listeners immediately if session is available
    this._trySetupEventListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._eventListenerSetup = false;
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has("session")) {
      this._trySetupEventListeners();
    }
  }

  private _trySetupEventListeners() {
    if (this.session && !this._eventListenerSetup) {
      this.setupEventListeners();
      this._eventListenerSetup = true;
    }
  }

  private setupEventListeners() {
    if (!this.session || !this.session.bus) {
      return;
    }

    this.session.bus.subscribeEvent<GameTag>("metadata/nav", ({ detail: nav }) => {
      this._roomId = (nav.attrs?.rm as string) || "";
      this.persistState();
      this.requestUpdate();
    });

    this.session.bus.subscribeEvent<GameTag>("metadata/streamWindow/room", ({ detail: streamWindow }) => {
      const title = (streamWindow.attrs?.subtitle || "").toString();
      this._roomTitle = title.replace(/^-\s/, "");
      this.persistState();
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
