// ABOUTME: Presentational UI component for displaying left, right, and spell hands
// ABOUTME: Renders three hand-ui components with provided content, no session logic
import { css, html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import "./hand-ui.lit";
import type { HandUI } from "./hand-ui.lit";

@customElement("illthorn-hands-ui")
export class HandsUI extends LitElement {
  static styles = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 2em;
      max-width: 90%;
      margin: 0 auto;
      padding: 0 2em;
      -webkit-app-region: drag;
    }
  `;

  @property({ type: String })
  leftContent = "None";

  @property({ type: String })
  rightContent = "None";

  @property({ type: String })
  spellContent = "None";

  @query('illthorn-hand-ui[handType="left"]')
  private _leftHand?: HandUI;

  @query('illthorn-hand-ui[handType="right"]')
  private _rightHand?: HandUI;

  @query('illthorn-hand-ui[handType="spell"]')
  private _spellHand?: HandUI;

  /**
   * Get hands interface compatible with SessionUI
   * Provides access to individual hand UI components
   */
  getHands(): { left: HandUI | null; right: HandUI | null; spell: HandUI | null } {
    return {
      left: this._leftHand || null,
      right: this._rightHand || null,
      spell: this._spellHand || null,
    };
  }

  render() {
    return html`
      <illthorn-hand-ui
        handType="left"
        content=${this.leftContent}
      ></illthorn-hand-ui>
      <illthorn-hand-ui
        handType="right"
        content=${this.rightContent}
      ></illthorn-hand-ui>
      <illthorn-hand-ui
        handType="spell"
        content=${this.spellContent}
      ></illthorn-hand-ui>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-hands-ui": HandsUI;
  }
}
