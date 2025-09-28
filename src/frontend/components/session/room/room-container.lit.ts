// ABOUTME: Smart container component that manages room state via session events
// ABOUTME: Subscribes to metadata/nav and metadata/streamWindow/room events and passes room data to UI component
import { html } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { GameTag } from "../../../parser/tag";
import { BaseContainerComponent } from "../../mixins/base-container.lit";
import "./room-ui.lit";

@customElement("illthorn-room-container")
export class RoomContainer extends BaseContainerComponent {
  @state()
  private _roomId = "";

  @state()
  private _roomTitle = "";

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

  protected getSessionEventSubscriptions() {
    return [
      {
        eventName: "metadata/nav",
        handler: this.createStatePersistingHandler((tag: GameTag) => {
          this._roomId = (tag.attrs?.rm as string) || "";
        }),
      },
      {
        eventName: "metadata/streamWindow/room",
        handler: this.createStatePersistingHandler((tag: GameTag) => {
          const title = (tag.attrs?.subtitle || "").toString();
          this._roomTitle = title.replace(/^-\s/, "");
        }),
      },
    ];
  }

  render() {
    return html`<illthorn-room-ui .roomId=${this._roomId} .roomTitle=${this._roomTitle}></illthorn-room-ui>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-room-container": RoomContainer;
  }
}
