// ABOUTME: Smart container component that manages compass rose state via session events
// ABOUTME: Subscribes to room and compass events and passes combined data to UI component
import { html } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { GameTag } from "../../../parser/tag";
import { BaseContainerComponent } from "../../mixins/base-container.lit";
import "./compass-rose-ui.lit";

@customElement("illthorn-compass-rose-container")
export class CompassRoseContainer extends BaseContainerComponent {
  @state()
  private _activeDirs: Array<string> = [];

  @state()
  private _roomId = "";

  @state()
  private _roomTitle = "";

  protected getStateToStore(): Record<string, unknown> {
    return {
      activeDirs: this._activeDirs,
      roomId: this._roomId,
      roomTitle: this._roomTitle,
    };
  }

  protected restoreState(state: Record<string, unknown>): void {
    this._activeDirs = (state.activeDirs as Array<string>) || [];
    this._roomId = (state.roomId as string) || "";
    this._roomTitle = (state.roomTitle as string) || "";
  }

  protected getStorageKeyPrefix(): string {
    return "compass-rose";
  }

  protected getSessionEventSubscriptions() {
    return [
      {
        eventName: "metadata/compass",
        handler: this.createStatePersistingHandler((tag: GameTag) => {
          if (tag?.children) {
            this._activeDirs = tag.children.map(({ attrs }) => attrs.value).filter((value): value is string => typeof value === "string");
          } else {
            this._activeDirs = [];
          }
        }),
      },
      {
        eventName: "metadata/nav",
        handler: this.createStatePersistingHandler((tag: GameTag) => {
          this._roomId = (tag.attrs?.rm as string) || "";
        }),
      },
      {
        eventName: "metadata/streamWindow/room",
        handler: this.createStatePersistingHandler((tag: GameTag) => {
          let title = (tag.attrs?.subtitle || "").toString();
          // Remove leading hyphen and spaces
          while (title.startsWith("-") || title.startsWith(" ")) {
            title = title.substring(1);
          }
          this._roomTitle = title;
        }),
      },
    ];
  }

  render() {
    return html`<illthorn-compass-rose-ui
      .activeDirs=${this._activeDirs}
      .roomId=${this._roomId}
      .roomTitle=${this._roomTitle}
    ></illthorn-compass-rose-ui>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-compass-rose-container": CompassRoseContainer;
  }
}
