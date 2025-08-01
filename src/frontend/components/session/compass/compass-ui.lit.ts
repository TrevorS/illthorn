// ABOUTME: Pure UI component for compass display with no event handling dependencies
// ABOUTME: Takes activeDirs as reactive property and renders compass grid with visual states
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("illthorn-compass-ui")
export class CompassUI extends LitElement {
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
      background: var(--color-surface);
      opacity: 0.2;
      text-decoration: none;
      color: inherit;
      display: block;
      justify-self: center;
      align-self: center;
      box-sizing: border-box;
    }

    a.on {
      background: var(--color-success);
      color: var(--color-surface, #f1f1ff);
      opacity: 1;
    }

    a:empty {
      visibility: hidden;
    }
  `;

  @property({ type: Array })
  activeDirs: Array<string> = [];

  private getDisplayText(dir: string): string {
    return CompassUI.MAP[dir] || dir;
  }

  private isDirectionActive(dir: string): boolean {
    return this.activeDirs.includes(dir);
  }

  render() {
    return html`
      ${CompassUI.DIRS.map(
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

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-compass-ui": CompassUI;
  }
}
