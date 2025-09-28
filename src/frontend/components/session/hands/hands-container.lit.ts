// ABOUTME: Smart container component managing hand metadata events for hands display
// ABOUTME: Subscribes to session events and passes hand content to hands UI component - now using BaseContainerComponent
import { css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { GameTag } from "../../../parser/tag";
import { BaseContainerComponent } from "../../mixins/base-container.lit";
import "./hands-ui.lit";

@customElement("illthorn-hands-container")
export class HandsContainer extends BaseContainerComponent {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @state()
  private _leftContent = "Empty";

  @state()
  private _rightContent = "Empty";

  @state()
  private _spellContent = "None";

  protected getStateToStore(): Record<string, unknown> {
    return {
      leftContent: this._leftContent,
      rightContent: this._rightContent,
      spellContent: this._spellContent,
    };
  }

  protected restoreState(state: Record<string, unknown>): void {
    this._leftContent = (state.leftContent as string) || "Empty";
    this._rightContent = (state.rightContent as string) || "Empty";
    this._spellContent = (state.spellContent as string) || "None";
  }

  protected getStorageKeyPrefix(): string {
    return "hands";
  }

  protected getSessionEventSubscriptions() {
    return [
      {
        eventName: "metadata/left",
        handler: this.createStatePersistingHandler((tag: GameTag) => {
          this._leftContent = tag.children?.[0]?.text || "Empty";
        }),
      },
      {
        eventName: "metadata/right",
        handler: this.createStatePersistingHandler((tag: GameTag) => {
          this._rightContent = tag.children?.[0]?.text || "Empty";
        }),
      },
      {
        eventName: "metadata/spell",
        handler: this.createStatePersistingHandler((tag: GameTag) => {
          this._spellContent = tag.children?.[0]?.text || "None";
        }),
      },
    ];
  }

  render() {
    return html`
      <illthorn-hands-ui
        leftContent=${this._leftContent}
        rightContent=${this._rightContent}
        spellContent=${this._spellContent}
      ></illthorn-hands-ui>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-hands-container": HandsContainer;
  }
}
