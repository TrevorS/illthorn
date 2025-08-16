// ABOUTME: Interactive game links with automatic item highlighting and context menus
// ABOUTME: Handles <a exist="..." noun="..."> elements from game XML with enhanced capabilities

import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { BaseGameElement } from "./base-game-element.lit";
import { ItemHighlighter } from "./item-highlighting";

// Debug logging for highlight performance
declare global {
  interface Window {
    DEBUG?: (namespace: string) => (...args: Array<unknown>) => void;
  }
}
const debug = window.DEBUG?.("illthorn:highlighting") || (() => {});

@customElement("illthorn-game-link")
export class GameLink extends BaseGameElement {
  @property() exist?: string;
  @property() noun?: string;
  @property() coord?: string;

  static styles = [
    BaseGameElement.styles,
    css`
    /* Default link styling - only apply when no item category is set */
    :host(:not([item-category])), :host([item-category=""]) {
      color: var(--color-link, #a0a0a0);
    }
    
    :host {
      cursor: pointer;
      text-decoration: none;
      /* Only transition interactive properties, not colors */
      transition: transform 0.2s ease, text-decoration 0.2s ease;
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

  connectedCallback() {
    super.connectedCallback();

    // Set tabindex="0" for keyboard accessibility (WCAG 2.1 compliance)
    // This allows users to navigate game elements using Tab/Shift+Tab and activate with Enter/Space
    this.setAttribute("tabindex", "0");
    this.setAttribute("role", "button");

    // Set up event listeners
    this.addEventListener("click", this._handleClick);
    this.addEventListener("contextmenu", this._handleContextMenu);
    this.addEventListener("keydown", this._handleKeydown);

    // Compute highlighting category once when component connects
    this._computeItemCategoryOnce();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("click", this._handleClick);
    this.removeEventListener("contextmenu", this._handleContextMenu);
    this.removeEventListener("keydown", this._handleKeydown);
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
    // Create and dispatch custom context menu event
    const contextEvent = new CustomEvent("game-element-context-menu", {
      detail: {
        exist: this.exist,
        noun: this.noun,
        text: this.textContent?.trim(),
        x: e.clientX,
        y: e.clientY,
        hasCommand: !!this.coord,
        tag: this.tag,
      },
      bubbles: true,
      composed: true,
      cancelable: true,
    });

    this.dispatchEvent(contextEvent);

    // Only prevent native context menu if someone handled our custom event
    if (contextEvent.defaultPrevented) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Otherwise, let the browser show its native context menu
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
   * Compute item category once when component is created
   * This prevents re-highlighting on every render cycle
   */
  private _computeItemCategoryOnce() {
    // Only compute if not already set and we have a noun
    if (this.itemCategory || !this.noun) {
      return;
    }

    if (ItemHighlighter.isReady) {
      const fullName = this.textContent?.trim();
      debug(`Computing category for GameLink: ${this.noun} (${fullName})`);

      const category = ItemHighlighter.getItemCategory(this.noun, fullName);

      if (category && ItemHighlighter.isCategoryEnabled(category)) {
        this.itemCategory = category;
        debug(`GameLink category set: ${this.noun} -> ${category}`);
      } else {
        debug(`GameLink no category: ${this.noun}`);
      }
    } else {
      debug(`ItemHighlighter not ready, retrying for: ${this.noun}`);
      // If highlighter isn't ready, try again after a short delay
      setTimeout(() => this._computeItemCategoryOnce(), 100);
    }
  }

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
