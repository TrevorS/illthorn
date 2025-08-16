// ABOUTME: Base class for all game element components with common functionality
// ABOUTME: Provides highlighting, theming, and interaction patterns for game elements

import { type CSSResultGroup, css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { GameTag } from "../../parser/tag";

@customElement("illthorn-base-game-element")
export class BaseGameElement extends LitElement {
  @property({ type: Object }) tag!: GameTag;
  @property({ type: Boolean, reflect: true }) highlighted = false;
  @property({ type: String, reflect: true, attribute: "highlight-class" }) highlightClass = "";
  @property({ type: String, reflect: true, attribute: "item-category" }) itemCategory = "";

  // Internal state for highlighting memoization
  @state()
  private _computedCategory: string | null = null;

  @state()
  private _hasCategoryComputed = false;

  static styles: CSSResultGroup = [
    css`
    :host {
      display: inline;
      font-family: "MonoLisa", monospace;
      
      /* CSS custom properties are inherited from global theme - no redefinition needed */
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
      color: var(--color-item-reagent);
    }
    
    :host([item-category="magic"]) {
      color: var(--color-item-valuable);
    }
    
    :host([item-category="forgeable"]) {
      color: var(--color-item-reagent);
    }
    
    :host([item-category="container"]) {
      color: var(--color-item-box);
    }
    
    /* XML-based category mappings */
    :host([item-category="herb"]) {
      color: var(--color-item-reagent);
    }
    
    :host([item-category="manna bread"]) {
      color: var(--color-item-food);
    }
    
    :host([item-category="scroll"]) {
      color: var(--color-item-valuable);
    }
    
    :host([item-category="wand"]) {
      color: var(--color-item-valuable);
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
  `,
  ];

  render() {
    return html`<slot></slot>`;
  }

  /**
   * Get the cached item category, computing it once if needed
   * This prevents redundant highlighting calculations during re-renders
   */
  getCachedCategory(): string | null {
    if (this._hasCategoryComputed) {
      return this._computedCategory;
    }
    return null;
  }

  /**
   * Set the computed category and mark as computed
   * Used by ComponentRenderer to cache highlighting results
   */
  setCachedCategory(category: string | null): void {
    this._computedCategory = category;
    this._hasCategoryComputed = true;

    // Update the reflected attribute for CSS styling
    if (category) {
      this.itemCategory = category;
    }
  }

  /**
   * Check if highlighting has been computed for this element
   */
  get hasCategoryComputed(): boolean {
    return this._hasCategoryComputed;
  }

  /**
   * Reset the category cache (useful for testing or dynamic updates)
   */
  resetCategoryCache(): void {
    this._computedCategory = null;
    this._hasCategoryComputed = false;
    this.itemCategory = "";
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
