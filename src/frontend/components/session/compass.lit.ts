// ABOUTME: Lit-based compass component for displaying directional navigation in Gemstone IV
// ABOUTME: Shows available exits with visual states (active/inactive) based on game metadata
import { css, html, LitElement } from "lit";
import type { GameTag } from "../../parser/tag";
import type { FrontendSession as Session } from "../../session/index";

export class CompassLit extends LitElement {
  static DIRS = ["", "up", "", "nw", "n", "ne", "w", "out", "e", "sw", "s", "se", "", "down", ""];

  static MAP = { up: "u", down: "d", out: "o" } as Record<string, string>;

  static styles = css`
    :host {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      grid-template-rows: repeat(5, 30px);
      align-items: center;
      align-content: center;
      text-align: center;
      width: 90px;
      height: 150px;
      min-height: 150px;
      margin: 0 auto;
      flex-shrink: 0;
    }

    a {
      height: 30px;
      width: 30px;
      max-width: 30px;
      max-height: 30px;
      padding: 0;
      line-height: 30px;
      text-align: center;
      background: var(--info);
      opacity: 0.2;
      text-decoration: none;
      color: inherit;
      display: block;
      justify-self: center;
      align-self: center;
      box-sizing: border-box;
    }

    a.on {
      background: var(--ok);
      color: var(--info, #f1f1ff);
      opacity: 1;
    }

    a:empty {
      visibility: hidden;
    }
  `;

  static properties = {
    session: { type: Object },
    activeDirs: { type: Array, state: true },
  };

  declare session?: Session;
  declare activeDirs: string[];

  private _eventListenerSetup = false;

  constructor() {
    super();
    this.activeDirs = [];
  }

  connectedCallback() {
    super.connectedCallback();
    console.log("CompassLit connected to DOM");
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has("session")) {
      console.log("CompassLit session property changed:", this.session);
      if (this.session && !this._eventListenerSetup) {
        this.setupEventListeners();
        this._eventListenerSetup = true;
      }
    }
  }

  private setupEventListeners() {
    if (!this.session) return;

    this.session.bus.subscribeEvent<GameTag>("metadata/compass", ({ detail: compass }) => {
      this.activeDirs = compass.children.map(({ attrs }) => attrs.value);
      this.requestUpdate();
    });
  }

  private getDisplayText(dir: string): string {
    return CompassLit.MAP[dir] || dir;
  }

  private isDirectionActive(dir: string): boolean {
    return this.activeDirs.includes(dir);
  }

  render() {
    return html`
      ${CompassLit.DIRS.map(
        (dir, _index) => html`
        <a 
          class=${dir && this.isDirectionActive(dir) ? "on" : ""}
          title=${dir}
          style=${dir ? "" : "visibility: hidden; width: 30px; height: 30px;"}
        >
          ${this.getDisplayText(dir)}
        </a>
      `,
      )}
    `;
  }
}

window.customElements.define("illthorn-compass-lit", CompassLit);

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-compass-lit": CompassLit;
  }
}
