// ABOUTME: Base class for all game element components with common functionality
// ABOUTME: Provides highlighting, theming, and interaction patterns for game elements

import { type CSSResultGroup, css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { GameTag } from "../../parser/tag";

@customElement("illthorn-base-game-element")
export class BaseGameElement extends LitElement {
  @property({ type: Object }) tag!: GameTag;
  @property({ type: Boolean, reflect: true }) highlighted = false;
  @property({ type: String, reflect: true, attribute: "highlight-class" }) highlightClass = "";
  @property({ type: String, reflect: true, attribute: "item-category" }) itemCategory = "";

  static styles: CSSResultGroup = [
    css`
    :host {
      display: inline;
      font-family: "MonoLisa", monospace;
    }
    
    :host([highlighted]) {
      /* Applied when component is highlighted */
      font-weight: 500;
    }
    
    :host([item-category="weapon"]) {
      color: var(--color-item-weapon, #ff6b6b);
    }
    
    :host([item-category="herbal"]) {
      color: var(--color-item-herbal, #51cf66);
    }
    
    :host([item-category="gem"]) {
      color: var(--color-item-gem, #ffd43b);
    }
    
    :host([item-category="magic"]) {
      color: var(--color-item-magic, #9775fa);
    }
    
    :host([item-category="forgeable"]) {
      color: var(--color-item-forgeable, #74c0fc);
    }
    
    :host([item-category="food"]) {
      color: var(--color-item-food, #ffa94d);
    }
    
    :host([item-category="container"]) {
      color: var(--color-item-container, #868e96);
    }
  `,
  ];

  render() {
    return html`<slot></slot>`;
  }

  /**
   * Dispatch game element interaction events
   */
  protected dispatchInteraction(type: string, detail: Record<string, unknown>) {
    this.dispatchEvent(
      new CustomEvent(`game-element-${type}`, {
        detail: { ...detail, tag: this.tag },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-base-game-element": BaseGameElement;
  }
}
