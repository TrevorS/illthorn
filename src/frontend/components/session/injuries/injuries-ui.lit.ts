// ABOUTME: Presentational UI component for injuries that renders injury data with panel structure
// ABOUTME: Pure UI component with no session dependencies, accepts injury data as properties
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./injury-item.lit";
import type { InjuryItem } from "./injury-item.lit";

interface ProcessedInjury {
  displayName: string; // "head", "arms", "r.eye"
  severity: 0 | 1 | 2 | 3;
  paired: boolean; // True if left/right parts combined
  leftSeverity?: 0 | 1 | 2 | 3; // For paired limbs
  rightSeverity?: 0 | 1 | 2 | 3; // For paired limbs
}

@customElement("illthorn-injuries-ui")
export class InjuriesUI extends LitElement {
  static styles = css`
    :host {
      display: block;
      --injury-text-primary: var(--color-text-primary);
      --injury-line-height: 14px;
    }

    .healthy {
      color: var(--injury-text-primary);
      text-align: left;
      font-style: italic;
      line-height: var(--injury-line-height);
    }
  `;

  @property({ type: Array })
  injuries: Array<ProcessedInjury> = [];

  getInjuries() {
    const shadowRoot = this.shadowRoot;
    if (!shadowRoot) {
      return [];
    }

    const injuryItems = Array.from(shadowRoot.querySelectorAll("illthorn-injury-item")) as Array<InjuryItem>;
    return injuryItems;
  }

  render() {
    return html`
      ${
        this.injuries.length === 0
          ? html`<div class="healthy">healthy</div>`
          : this.injuries.map(
              (injury) => html`
            <illthorn-injury-item
              .displayName="${injury.displayName}"
              .severity="${injury.severity}"
              .paired="${injury.paired}"
              .leftSeverity="${injury.leftSeverity}"
              .rightSeverity="${injury.rightSeverity}">
            </illthorn-injury-item>
          `,
            )
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-injuries-ui": InjuriesUI;
  }
}

export type { ProcessedInjury };
