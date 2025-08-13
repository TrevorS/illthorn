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
      
      /* Import CSS custom properties for theming within shadow DOM */
      --color-item-weapon: #ff6b6b;
      --color-item-armor: #74c0fc;
      --color-item-clothing: #69db7c;
      --color-item-gem: #ffd43b;
      --color-item-jewelry: #e599f7;
      --color-item-reagent: #9775fa;
      --color-item-food: #ffa94d;
      --color-item-valuable: #f783ac;
      --color-item-box: #868e96;
      --color-item-junk: #6c757d;
      --color-item-default: #a0a0a0;
      --color-item-magic: var(--color-item-valuable);
      --color-item-herbal: var(--color-item-reagent);
      --color-item-forgeable: var(--color-item-reagent);
      --color-item-container: var(--color-item-box);
    }
    
    :host([highlighted]) {
      /* Applied when component is highlighted */
      font-weight: 500;
    }
    
    /* Modern item category colors using CSS custom properties */
    :host([item-category="weapon"]) {
      color: var(--color-item-weapon);
    }
    
    :host([item-category="armor"]) {
      color: var(--color-item-armor);
    }
    
    :host([item-category="clothing"]) {
      color: var(--color-item-clothing);
    }
    
    :host([item-category="gem"]) {
      color: var(--color-item-gem);
    }
    
    :host([item-category="jewelry"]) {
      color: var(--color-item-jewelry);
    }
    
    :host([item-category="reagent"]) {
      color: var(--color-item-reagent);
    }
    
    :host([item-category="food"]) {
      color: var(--color-item-food);
    }
    
    :host([item-category="valuable"]) {
      color: var(--color-item-valuable);
    }
    
    :host([item-category="box"]) {
      color: var(--color-item-box);
    }
    
    :host([item-category="junk"]) {
      color: var(--color-item-junk);
    }
    
    /* Legacy category mappings for backward compatibility */
    :host([item-category="herbal"]) {
      color: var(--color-item-herbal);
    }
    
    :host([item-category="magic"]) {
      color: var(--color-item-magic);
    }
    
    :host([item-category="forgeable"]) {
      color: var(--color-item-forgeable);
    }
    
    :host([item-category="container"]) {
      color: var(--color-item-container);
    }
    
    /* XML-based category mappings */
    :host([item-category="herb"]) {
      color: var(--color-item-reagent);
    }
    
    :host([item-category="manna bread"]) {
      color: var(--color-item-food);
    }
    
    :host([item-category="scroll"]) {
      color: var(--color-item-magic);
    }
    
    :host([item-category="wand"]) {
      color: var(--color-item-magic);
    }
    
    :host([item-category="skin"]) {
      color: var(--color-item-valuable);
    }
    
    :host([item-category="passive npc"]) {
      color: var(--color-item-default);
    }
    
    :host([item-category="aggressive npc"]) {
      color: var(--color-item-default);
    }
    
    /* Default category styling */
    :host([item-category]:not([item-category=""])) {
      color: var(--color-item-default);
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
