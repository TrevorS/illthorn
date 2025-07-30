// ABOUTME: Container component for managing left, right, and spell hand components
// ABOUTME: Provides unified interface for hand components with session integration
import { css, html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import type { FrontendSession as Session } from "../../session/index";
import "./hand.lit";
import type { Hand } from "./hand.lit";

@customElement("illthorn-hands-lit")
export class Hands extends LitElement {
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

  @property({ type: Object })
  session?: Session;

  @query('illthorn-hand-lit[name="left"]')
  private _leftHand?: Hand;

  @query('illthorn-hand-lit[name="right"]')
  private _rightHand?: Hand;

  @query('illthorn-hand-lit[name="spell"]')
  private _spellHand?: Hand;

  /**
   * Get hands interface compatible with SessionUI
   */
  getHands(): { left: Hand | null; right: Hand | null; spell: Hand | null } {
    return {
      left: this._leftHand || null,
      right: this._rightHand || null,
      spell: this._spellHand || null,
    };
  }

  render() {
    return html`
      <illthorn-hand-lit
        .session=${this.session}
        name="left"
      ></illthorn-hand-lit>
      <illthorn-hand-lit
        .session=${this.session}
        name="right"
      ></illthorn-hand-lit>
      <illthorn-hand-lit
        .session=${this.session}
        name="spell"
      ></illthorn-hand-lit>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-hands-lit": Hands;
  }
}
