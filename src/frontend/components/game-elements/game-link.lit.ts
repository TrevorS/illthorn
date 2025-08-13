// ABOUTME: Interactive game links with automatic item highlighting and context menus
// ABOUTME: Handles <a exist="..." noun="..."> elements from game XML with enhanced capabilities

import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { BaseGameElement } from "./base-game-element.lit";
import { ItemHighlighter } from "./item-highlighting";

@customElement("illthorn-game-link")
export class GameLink extends BaseGameElement {
  @property() exist?: string;
  @property() noun?: string;
  @property() coord?: string;

  static styles = [
    BaseGameElement.styles,
    css`
    :host {
      color: var(--color-link, #a0a0a0);
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    
    :host(:hover) {
      text-decoration: underline;
    }
    
    :host(:focus) {
      outline: 2px solid var(--color-focus, #0a84ff);
      outline-offset: 1px;
      border-radius: 2px;
    }
    
    :host(:active) {
      transform: scale(0.98);
    }
    
    /* Override base colors for links with enhanced styling */
    :host([item-category]) {
      font-weight: 500;
      position: relative;
    }
    
    
    /* Context menu hint for command links */
    :host([coord]) {
      border-bottom: 1px dotted currentColor;
    }
    
    /* Accessibility enhancement */
    :host([aria-label]) {
      position: relative;
    }
  `,
  ];

  async connectedCallback() {
    super.connectedCallback();

    // Set tabindex="0" for keyboard accessibility (WCAG 2.1 compliance)
    // This allows users to navigate game elements using Tab/Shift+Tab and activate with Enter/Space
    this.setAttribute("tabindex", "0");
    this.setAttribute("role", "button");

    // Set up event listeners
    this.addEventListener("click", this._handleClick);
    this.addEventListener("contextmenu", this._handleContextMenu);
    this.addEventListener("keydown", this._handleKeydown);

    // Set up automatic item highlighting
    await this._setupItemHighlighting();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("click", this._handleClick);
    this.removeEventListener("contextmenu", this._handleContextMenu);
    this.removeEventListener("keydown", this._handleKeydown);
  }

  private async _setupItemHighlighting() {
    if (this.noun) {
      console.log(`[ItemHighlighting] Attempting to categorize item: noun="${this.noun}", exist="${this.exist}", text="${this.textContent}"`);

      try {
        const result = await ItemHighlighter.categorizeGameElement({
          noun: this.noun,
          exist: this.exist,
          name: this.textContent || undefined,
        });

        console.log(`[ItemHighlighting] Categorization result for "${this.noun}":`, result);

        if (result.category && (await ItemHighlighter.isCategoryEnabled(result.category))) {
          this.itemCategory = result.category;
          console.log(`[ItemHighlighting] Applied category "${result.category}" to item "${this.noun}"`);

          // Set up accessibility label
          const categoryDisplay = (await ItemHighlighter.getAllCategories()).find((cat) => cat.key === result.category)?.name || result.category;

          const baseLabel = this.textContent?.trim() || this.noun;
          this.setAttribute("aria-label", `${baseLabel} (${categoryDisplay}${this.coord ? ", clickable" : ""})`);
        } else {
          console.log(`[ItemHighlighting] No valid category found for "${this.noun}" or category disabled`);
        }
      } catch (error) {
        console.error(`[ItemHighlighting] Failed to categorize game link "${this.noun}":`, error);
      }
    } else if (this.coord) {
      // Command link without item categorization
      this.setAttribute("aria-label", `${this.textContent?.trim() || "Command"} (clickable)`);
    }
  }

  render() {
    return html`<slot></slot>`;
  }

  private _handleClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (this.coord) {
      // This is a command link
      this.dispatchInteraction("command", {
        command: this.coord,
        exist: this.exist,
        noun: this.noun,
        text: this.textContent?.trim(),
      });
    } else {
      // This is a menu link (right-click style interaction)
      this.dispatchInteraction("menu", {
        exist: this.exist,
        noun: this.noun,
        text: this.textContent?.trim(),
        x: e.clientX,
        y: e.clientY,
      });
    }
  };

  private _handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Always show context menu on right-click
    this.dispatchInteraction("context-menu", {
      exist: this.exist,
      noun: this.noun,
      text: this.textContent?.trim(),
      x: e.clientX,
      y: e.clientY,
      hasCommand: !!this.coord,
    });
  };

  private _handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();

      // Simulate click
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        clientX: 0,
        clientY: 0,
      });
      this._handleClick(clickEvent);
    } else if (e.key === "Menu" || (e.key === "F10" && e.shiftKey)) {
      e.preventDefault();
      e.stopPropagation();

      // Simulate context menu
      const rect = this.getBoundingClientRect();
      const contextEvent = new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
      });
      this._handleContextMenu(contextEvent);
    }
  };

  /**
   * Public API for external highlighting control
   */
  setHighlight(enabled: boolean, className?: string) {
    this.highlighted = enabled;
    if (className) {
      this.highlightClass = className;
      if (enabled) {
        this.classList.add(className);
      } else {
        this.classList.remove(className);
      }
    }
  }

  /**
   * Get interaction context for external systems
   */
  getInteractionContext() {
    return {
      type: "link",
      noun: this.noun,
      exist: this.exist,
      coord: this.coord,
      text: this.textContent?.trim(),
      category: this.itemCategory,
      hasCommand: !!this.coord,
    };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-game-link": GameLink;
  }
}
