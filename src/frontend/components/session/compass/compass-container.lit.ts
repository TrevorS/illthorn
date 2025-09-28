// ABOUTME: Smart container component that manages compass state via session events
// ABOUTME: Subscribes to metadata/compass events and passes activeDirs to UI component - now using BaseContainerComponent
import { html } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { GameTag } from "../../../parser/tag";
import { BaseContainerComponent } from "../../mixins/base-container.lit";
import "./compass-ui.lit";

@customElement("illthorn-compass-container")
export class CompassContainer extends BaseContainerComponent {
  @state()
  private _activeDirs: Array<string> = [];

  protected getStateToStore(): Record<string, unknown> {
    return {
      activeDirs: this._activeDirs,
    };
  }

  protected restoreState(state: Record<string, unknown>): void {
    this._activeDirs = (state.activeDirs as Array<string>) || [];
  }

  protected getStorageKeyPrefix(): string {
    return "compass";
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
    ];
  }

  render() {
    return html`<illthorn-compass-ui .activeDirs=${this._activeDirs}></illthorn-compass-ui>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-compass-container": CompassContainer;
  }
}
