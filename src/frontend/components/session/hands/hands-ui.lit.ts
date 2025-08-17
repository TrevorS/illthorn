// ABOUTME: Presentational UI component for displaying hands layout
// ABOUTME: Renders three hand-row components with provided content, no session logic
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./hand-row.lit";

@customElement("illthorn-hands-ui")
export class HandsUI extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 0.4em;
    }

    .hands-container {
      display: grid;
      grid-template-rows: repeat(3, auto);
      gap: 0.5em;
      width: 100%;
      max-width: 100%;
    }

    .hands-container > * {
      min-width: 0;
    }
  `;

  @property({ type: String })
  leftContent = "Empty";

  @property({ type: String })
  rightContent = "Empty";

  @property({ type: String })
  spellContent = "None";

  render() {
    return html`
      <div class="hands-container">
        <illthorn-hand-row
          handType="left"
          content=${this.leftContent}
        ></illthorn-hand-row>
        <illthorn-hand-row
          handType="right"
          content=${this.rightContent}
        ></illthorn-hand-row>
        <illthorn-hand-row
          handType="spell"
          content=${this.spellContent}
        ></illthorn-hand-row>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-hands-ui": HandsUI;
  }
}
