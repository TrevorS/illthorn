# Game Log Modernization: Lit Component Architecture

## Executive Summary

This document outlines a comprehensive plan to modernize Illthorn's game log parsing and rendering system by migrating from manual DOM element creation to a modern Lit component-based architecture. The new system will eliminate performance bottlenecks, restore sophisticated highlighting capabilities, and provide a foundation for enhanced user interactions.

## Current Architecture Analysis

### Existing Flow
```
Raw XML → SaxophoneParser → GameTag[] → castToHTML() → DocumentFragment → addHilites() → Feed.appendParsed() → HTML strings → unsafeHTML()
```

### Current Components

**1. Parser Layer (`src/frontend/parser/`)**
- `SaxophoneParser`: Event-driven XML parser converting raw game data to `GameTag[]`
- `dom.ts`: Manual DOM element creation via `createInlineElement()`, `createChildInline()`
- `tag/index.ts`: Type definitions for `GameTag` with metadata/inline classification

**2. Rendering Layer (`src/frontend/components/session/feed/`)**
- `Feed.appendParsed()`: Converts DOM to HTML strings for storage
- `unsafeHTML()` directive: Re-renders HTML strings back to DOM
- Mark.js integration: Post-processing DOM for user highlight patterns

**3. Highlighting System (`src/frontend/hilites/`)**
- Settings-based pattern storage with regex compilation
- Mark.js DOM manipulation for text matching
- CSS custom properties for semantic colors

### Architectural Issues

**Performance Problems:**
1. **Double DOM Conversion**: GameTag → DOM → HTML string → DOM
2. **Mark.js Overhead**: Scanning entire DOM for highlight patterns on every message
3. **Memory Inefficiency**: Storing HTML strings instead of structured data
4. **Re-parsing Overhead**: Converting HTML strings back to DOM for rendering

**Functionality Limitations:**
1. **Global CSS Conflicts**: No component encapsulation for styles
2. **Limited Interactivity**: Manual event delegation for game element clicks
3. **Highlight Conflicts**: Mark.js can interfere with existing DOM structure
4. **Shadow DOM Issues**: Mark.js doesn't work well with Lit's Shadow DOM

**Maintainability Issues:**
1. **Manual Element Creation**: Hand-crafted DOM in `createChildInline()`
2. **Tightly Coupled Systems**: Parsing, rendering, and highlighting interdependent
3. **Limited Type Safety**: Loose typing for DOM element attributes
4. **Testing Complexity**: Difficult to unit test DOM generation logic

## Proposed Architecture: Component-First Rendering

### New Flow
```
Raw XML → SaxophoneParser → GameTag[] → ComponentRenderer → Lit Components → Direct DOM rendering
```

### Architecture Benefits

**Performance Improvements:**
- **Single DOM Pass**: GameTag → Component → DOM (no intermediate conversions)
- **Component-Level Highlighting**: Built into component logic, no post-processing
- **Efficient Re-rendering**: Lit's reactive updates only change what's necessary
- **Memory Optimization**: Components store reactive state, not HTML strings

**Enhanced Functionality:**
- **Automatic Item Recognition**: Built-in highlighting for weapons, herbs, gems via `noun` attributes
- **Interactive Components**: Native event handling with proper type safety
- **Shadow DOM Benefits**: Style encapsulation and performance isolation
- **Accessibility Features**: Proper ARIA attributes and keyboard navigation

**Developer Experience:**
- **Type-Safe Components**: Full TypeScript support for game element properties
- **Component Reusability**: Game elements usable across different contexts
- **Testable Architecture**: Isolated component testing with predictable behavior
- **Modern CSS**: CSS custom properties with theme integration

## Detailed Implementation Plan

### Phase 1: Foundation - Game Element Components

#### 1.1: Base Game Element Component

**File**: `src/frontend/components/game-elements/base-game-element.lit.ts`

```typescript
// ABOUTME: Base class for all game element components with common functionality
// ABOUTME: Provides highlighting, theming, and interaction patterns for game elements

import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { GameTag } from "../../parser/tag";

@customElement('illthorn-base-game-element')
export class BaseGameElement extends LitElement {
  @property({ type: Object }) tag!: GameTag;
  @property({ type: Boolean, reflect: true }) highlighted = false;
  @property({ type: String, reflect: true }) highlightClass = '';
  @property({ type: String, reflect: true }) itemCategory = '';

  static styles = css`
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
  `;

  render() {
    return html`<slot></slot>`;
  }

  /**
   * Dispatch game element interaction events
   */
  protected dispatchInteraction(type: string, detail: any) {
    this.dispatchEvent(new CustomEvent(`game-element-${type}`, {
      detail: { ...detail, tag: this.tag },
      bubbles: true,
      composed: true
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-base-game-element": BaseGameElement;
  }
}
```

#### 1.2: Game Link Component

**File**: `src/frontend/components/game-elements/game-link.lit.ts`

```typescript
// ABOUTME: Interactive game links with automatic item highlighting and context menus
// ABOUTME: Handles <a exist="..." noun="..."> elements from game XML with enhanced capabilities

import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { BaseGameElement } from "./base-game-element.lit";
import { ItemHighlighter } from "./item-highlighting";

@customElement('illthorn-game-link')
export class GameLink extends BaseGameElement {
  @property() exist?: string;
  @property() noun?: string;
  @property() coord?: string;

  static styles = [BaseGameElement.styles, css`
    :host {
      color: var(--hilite-color, #a0a0a0);
      cursor: pointer;
      text-decoration: none;
    }
    
    :host(:hover) {
      text-decoration: underline;
      opacity: 0.8;
    }
    
    :host(:focus) {
      outline: 2px solid var(--color-focus, #0a84ff);
      outline-offset: 1px;
    }
    
    /* Override base colors for links */
    :host([item-category]) {
      font-weight: 500;
    }
  `];

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('tabindex', '0');
    this.setAttribute('role', 'button');
    
    // Set up automatic item highlighting
    if (this.noun) {
      const category = ItemHighlighter.getItemCategory(this.noun);
      if (category) {
        this.itemCategory = category;
        this.setAttribute('aria-label', `${this.textContent} (${category})`);
      }
    }
  }

  render() {
    return html`<slot></slot>`;
  }

  private _handleClick(e: MouseEvent) {
    e.preventDefault();
    
    if (this.coord) {
      // This is a command link
      this.dispatchInteraction('command', { 
        command: this.coord,
        exist: this.exist,
        noun: this.noun 
      });
    } else {
      // This is a menu link
      this.dispatchInteraction('menu', { 
        exist: this.exist, 
        noun: this.noun,
        x: e.clientX,
        y: e.clientY
      });
    }
  }

  private _handleContextMenu(e: MouseEvent) {
    e.preventDefault();
    this.dispatchInteraction('context-menu', { 
      exist: this.exist, 
      noun: this.noun,
      x: e.clientX,
      y: e.clientY
    });
  }

  private _handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._handleClick(e as any);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-game-link": GameLink;
  }
}
```

#### 1.3: Game Command Component

**File**: `src/frontend/components/game-elements/game-command.lit.ts`

```typescript
// ABOUTME: Clickable command elements from <d cmd="..."> tags with enhanced styling
// ABOUTME: Handles command execution with visual feedback and accessibility features

import { css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { BaseGameElement } from "./base-game-element.lit";

@customElement('illthorn-game-command')
export class GameCommand extends BaseGameElement {
  @property() cmd?: string;
  @state() private _executing = false;

  static styles = [BaseGameElement.styles, css`
    :host {
      color: var(--color-link, #27a4fd);
      cursor: pointer;
      border-bottom: 2px solid var(--color-link);
      text-decoration: none;
    }
    
    :host(:hover) {
      background-color: var(--color-surface, #2a2a2a);
      border-bottom-color: var(--color-focus, #0a84ff);
    }
    
    :host(:focus) {
      outline: 2px solid var(--color-focus, #0a84ff);
      outline-offset: 1px;
    }
    
    :host([executing]) {
      opacity: 0.6;
      cursor: wait;
    }
  `];

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('tabindex', '0');
    this.setAttribute('role', 'button');
    this.setAttribute('aria-label', `Execute command: ${this.cmd || this.textContent}`);
  }

  render() {
    return html`<slot></slot>`;
  }

  private _handleClick(e: MouseEvent) {
    e.preventDefault();
    
    if (this._executing) return;
    
    this._executing = true;
    
    this.dispatchInteraction('execute', { 
      command: this.cmd || this.textContent?.trim() 
    });
    
    // Reset executing state after short delay
    setTimeout(() => {
      this._executing = false;
    }, 500);
  }

  private _handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._handleClick(e as any);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-game-command": GameCommand;
  }
}
```

#### 1.4: Game Monster Component

**File**: `src/frontend/components/game-elements/game-monster.lit.ts`

```typescript
// ABOUTME: Monster display component for <b> wrapped entities with enhanced styling
// ABOUTME: Provides distinctive styling and interaction for hostile game entities

import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { BaseGameElement } from "./base-game-element.lit";

@customElement('illthorn-game-monster')
export class GameMonster extends BaseGameElement {
  @property() exist?: string;
  @property() noun?: string;

  static styles = [BaseGameElement.styles, css`
    :host {
      color: var(--color-monster, #fb5d2d);
      font-weight: bold;
      cursor: pointer;
    }
    
    :host(:hover) {
      text-shadow: 0 0 4px var(--color-monster, #fb5d2d);
      text-decoration: underline;
    }
    
    :host(:focus) {
      outline: 2px solid var(--color-monster, #fb5d2d);
      outline-offset: 1px;
    }
  `];

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('tabindex', '0');
    this.setAttribute('role', 'button');
    this.setAttribute('aria-label', `Monster: ${this.textContent}`);
  }

  render() {
    return html`<slot></slot>`;
  }

  private _handleClick(e: MouseEvent) {
    e.preventDefault();
    this.dispatchInteraction('monster-click', { 
      exist: this.exist, 
      noun: this.noun,
      x: e.clientX,
      y: e.clientY
    });
  }

  private _handleContextMenu(e: MouseEvent) {
    e.preventDefault();
    this.dispatchInteraction('monster-context', { 
      exist: this.exist, 
      noun: this.noun,
      x: e.clientX,
      y: e.clientY
    });
  }

  private _handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._handleClick(e as any);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-game-monster": GameMonster;
  }
}
```

#### 1.5: Item Highlighting System

**File**: `src/frontend/components/game-elements/item-highlighting.ts`

```typescript
// ABOUTME: Automatic item categorization and highlighting system for game elements
// ABOUTME: Provides semantic classification of items based on noun attributes

/**
 * Comprehensive item categorization system
 * Based on restored theme data and Wrayth protocol analysis
 */
export class ItemHighlighter {
  
  // Weapon categories - restored from lost theme data
  private static readonly WEAPONS = new Set([
    // Bladed weapons
    'sword', 'dagger', 'dirk', 'stiletto', 'knife', 'blade', 'rapier', 'scimitar',
    'falchion', 'broadsword', 'longsword', 'bastard', 'claymore', 'katana',
    
    // Blunt weapons  
    'mace', 'club', 'hammer', 'maul', 'flail', 'morningstar', 'cudgel',
    
    // Polearms
    'spear', 'lance', 'halberd', 'pike', 'glaive', 'trident', 'javelin',
    
    // Ranged weapons
    'bow', 'crossbow', 'sling', 'dart', 'arrow', 'bolt', 'quarrel',
    
    // Axes
    'axe', 'hatchet', 'tomahawk', 'handaxe', 'battleaxe', 'waraxe'
  ]);

  // Herbal/consumable categories
  private static readonly HERBALS = new Set([
    'herb', 'tincture', 'potion', 'salve', 'elixir', 'draught', 'philter',
    'remedy', 'medicine', 'dose', 'vial', 'flask', 'bottle',
    
    // Specific herbs from Gemstone IV
    'acantha', 'ambrominas', 'aloeas', 'angelica', 'basal', 'cactacae',
    'calamia', 'cothinar', 'daggerstalk', 'ephlox', 'feverfern', 'ginkgo',
    'haphip', 'talneo', 'torban', 'wingstem', 'wolifrew'
  ]);

  // Gem categories  
  private static readonly GEMS = new Set([
    'gem', 'stone', 'crystal', 'ruby', 'emerald', 'diamond', 'sapphire',
    'amethyst', 'topaz', 'pearl', 'opal', 'garnet', 'turquoise', 'jade',
    'onyx', 'agate', 'jasper', 'quartz', 'beryl', 'peridot', 'citrine',
    'moonstone', 'sunstone', 'bloodstone', 'carnelian', 'lapis', 'malachite'
  ]);

  // Magic items
  private static readonly MAGIC_ITEMS = new Set([
    'wand', 'staff', 'rod', 'orb', 'crystal', 'amulet', 'talisman', 'charm',
    'ring', 'scroll', 'tome', 'book', 'grimoire', 'rune', 'symbol', 'totem'
  ]);

  // Forgeable/craftable materials
  private static readonly FORAGEABLES = new Set([
    'twig', 'branch', 'stick', 'log', 'bark', 'leaf', 'root', 'moss',
    'mushroom', 'berry', 'nut', 'seed', 'flower', 'petal', 'stem'
  ]);

  // Food items
  private static readonly FOODS = new Set([
    'bread', 'cheese', 'meat', 'fish', 'fruit', 'vegetable', 'stew', 'soup',
    'pie', 'cake', 'tart', 'roll', 'biscuit', 'cracker', 'jerky', 'ration'
  ]);

  // Containers
  private static readonly CONTAINERS = new Set([
    'box', 'chest', 'crate', 'barrel', 'sack', 'bag', 'pouch', 'pack',
    'basket', 'container', 'trunk', 'coffer', 'case', 'kit'
  ]);

  /**
   * Determine the category of an item based on its noun
   */
  static getItemCategory(noun: string): string | null {
    if (!noun) return null;
    
    const lowerNoun = noun.toLowerCase();
    
    if (this.WEAPONS.has(lowerNoun)) return 'weapon';
    if (this.HERBALS.has(lowerNoun)) return 'herbal';  
    if (this.GEMS.has(lowerNoun)) return 'gem';
    if (this.MAGIC_ITEMS.has(lowerNoun)) return 'magic';
    if (this.FORAGEABLES.has(lowerNoun)) return 'forgeable';
    if (this.FOODS.has(lowerNoun)) return 'food';
    if (this.CONTAINERS.has(lowerNoun)) return 'container';
    
    return null;
  }

  /**
   * Get the CSS custom property name for an item category
   */
  static getCategoryColor(category: string): string {
    const colorMap: Record<string, string> = {
      weapon: 'var(--color-item-weapon, #ff6b6b)',
      herbal: 'var(--color-item-herbal, #51cf66)',
      gem: 'var(--color-item-gem, #ffd43b)',
      magic: 'var(--color-item-magic, #9775fa)',
      forgeable: 'var(--color-item-forgeable, #74c0fc)',
      food: 'var(--color-item-food, #ffa94d)',
      container: 'var(--color-item-container, #868e96)'
    };
    
    return colorMap[category] || 'var(--color-item-default, #a0a0a0)';
  }

  /**
   * Check if automatic highlighting is enabled for a category
   */
  static isCategoryEnabled(category: string): boolean {
    // TODO: Integrate with settings system
    // For now, enable all categories by default
    return true;
  }

  /**
   * Get all available categories for settings UI
   */
  static getAllCategories(): Array<{ key: string, name: string, color: string }> {
    return [
      { key: 'weapon', name: 'Weapons', color: '#ff6b6b' },
      { key: 'herbal', name: 'Herbs & Potions', color: '#51cf66' },
      { key: 'gem', name: 'Gems & Stones', color: '#ffd43b' },
      { key: 'magic', name: 'Magic Items', color: '#9775fa' },
      { key: 'forgeable', name: 'Forgeable Materials', color: '#74c0fc' },
      { key: 'food', name: 'Food & Consumables', color: '#ffa94d' },
      { key: 'container', name: 'Containers & Storage', color: '#868e96' }
    ];
  }
}
```

### Phase 2: Component Renderer System

#### 2.1: Component Renderer

**File**: `src/frontend/parser/component-renderer.ts`

```typescript
// ABOUTME: Converts GameTag objects directly to Lit TemplateResult components
// ABOUTME: Replaces castToHTML() DOM generation with modern component-based rendering

import { html, TemplateResult, nothing } from "lit";
import type { GameTag } from "./tag";
import { TagKind } from "./tag";

// Import all game element components
import "../components/game-elements/game-link.lit";
import "../components/game-elements/game-command.lit";
import "../components/game-elements/game-monster.lit";

export interface RenderResult {
  content: TemplateResult[];
  metadata: GameTag[];
}

/**
 * Modern component-based renderer for game content
 * Converts GameTag[] directly to Lit components without intermediate DOM conversion
 */
export class ComponentRenderer {
  
  /**
   * Primary rendering method - converts GameTag array to component templates
   */
  render(tags: GameTag[]): RenderResult {
    const content: TemplateResult[] = [];
    const metadata: GameTag[] = [];

    for (const tag of tags) {
      const result = this.renderTag(tag);
      if (result.template) {
        content.push(result.template);
      }
      if (result.metadata) {
        metadata.push(result.metadata);
      }
    }

    return { content, metadata };
  }

  /**
   * Render a single GameTag to component template or metadata
   */
  private renderTag(tag: GameTag): { template?: TemplateResult; metadata?: GameTag } {
    switch (tag.name) {
      case 'a':
        return this.renderGameLink(tag);
      
      case 'b':
        return this.renderGameMonster(tag);
      
      case 'd':
        return this.renderGameCommand(tag);
      
      case ':text':
        return this.renderText(tag);
      
      case 'preset':
        return this.renderPreset(tag);
      
      case 'style':
      case 'output':
        return this.renderStyledContainer(tag);
      
      case 'stream':
        return this.renderStream(tag);
      
      // Metadata tags
      case 'prompt':
      case 'progressBar':
      case 'vitals':
      case 'injuries':
      case 'activeSpells':
      case 'nav':
      case 'room':
      case 'compass':
        return { metadata: tag };
      
      default:
        // Unknown tags become metadata
        return { metadata: tag };
    }
  }

  /**
   * Render <a exist="..." noun="..."> elements as GameLink components
   */
  private renderGameLink(tag: GameTag): { template: TemplateResult } {
    const children = this.renderChildren(tag.children);
    
    return {
      template: html`<illthorn-game-link
        .tag=${tag}
        .exist=${tag.attrs.exist}
        .noun=${tag.attrs.noun}
        .coord=${tag.attrs.coord}
      >
        ${children}
      </illthorn-game-link>`
    };
  }

  /**
   * Render <b> wrapped monsters as GameMonster components  
   */
  private renderGameMonster(tag: GameTag): { template: TemplateResult } {
    const children = this.renderChildren(tag.children);
    
    return {
      template: html`<illthorn-game-monster
        .tag=${tag}
        .exist=${this.extractExist(tag)}
        .noun=${this.extractNoun(tag)}
      >
        ${children}
      </illthorn-game-monster>`
    };
  }

  /**
   * Render <d cmd="..."> elements as GameCommand components
   */
  private renderGameCommand(tag: GameTag): { template: TemplateResult } {
    const children = this.renderChildren(tag.children);
    
    return {
      template: html`<illthorn-game-command
        .tag=${tag}
        .cmd=${tag.attrs.cmd}
      >
        ${children}
      </illthorn-game-command>`
    };
  }

  /**
   * Render text nodes
   */
  private renderText(tag: GameTag): { template: TemplateResult } {
    return {
      template: html`${tag.text}`
    };
  }

  /**
   * Render preset styled spans
   */
  private renderPreset(tag: GameTag): { template: TemplateResult } {
    const children = this.renderChildren(tag.children);
    const presetId = tag.attrs.id as string;
    
    return {
      template: html`<span class=${presetId}>${children}</span>`
    };
  }

  /**
   * Render styled containers (style/output tags)
   */
  private renderStyledContainer(tag: GameTag): { template: TemplateResult } {
    const children = this.renderChildren(tag.children);
    const classes = Object.values(tag.attrs).join(' ');
    
    return {
      template: html`<pre class=${classes}>${children}</pre>`
    };
  }

  /**
   * Render stream containers with filtering
   */
  private renderStream(tag: GameTag): { template?: TemplateResult } {
    // Filter out duplicate streams (matches existing logic)
    const duplicatedStreamIds = ["speech", "bounty", "inv", "room"];
    const streamId = tag.attrs.id as string;
    
    if (duplicatedStreamIds.includes(streamId) || tag.gameName === "popStream") {
      return {}; // Filtered out
    }

    const children = this.renderChildren(tag.children);
    const classes = `stream ${Object.values(tag.attrs).join(' ')}`;
    
    return {
      template: html`<pre class=${classes}>${children}</pre>`
    };
  }

  /**
   * Recursively render child GameTags
   */
  private renderChildren(children: GameTag[]): TemplateResult[] {
    return children
      .map(child => this.renderTag(child).template)
      .filter((template): template is TemplateResult => template !== undefined);
  }

  /**
   * Extract exist attribute from nested <a> tags (for monsters)
   */
  private extractExist(tag: GameTag): string | undefined {
    // Look for nested <a> tags with exist attribute
    const findExist = (children: GameTag[]): string | undefined => {
      for (const child of children) {
        if (child.name === 'a' && child.attrs.exist) {
          return child.attrs.exist as string;
        }
        const nested = findExist(child.children);
        if (nested) return nested;
      }
      return undefined;
    };
    
    return findExist(tag.children);
  }

  /**
   * Extract noun attribute from nested <a> tags (for monsters)
   */
  private extractNoun(tag: GameTag): string | undefined {
    // Look for nested <a> tags with noun attribute
    const findNoun = (children: GameTag[]): string | undefined => {
      for (const child of children) {
        if (child.name === 'a' && child.attrs.noun) {
          return child.attrs.noun as string;
        }
        const nested = findNoun(child.children);
        if (nested) return nested;
      }
      return undefined;
    };
    
    return findNoun(tag.children);
  }
}
```

### Phase 3: Enhanced Feed Component

#### 3.1: Modernized Feed Implementation

**File**: `src/frontend/components/session/feed/feed-modernized.lit.ts`

```typescript
// ABOUTME: Modernized Feed component using component-based rendering instead of HTML strings
// ABOUTME: Eliminates double DOM conversion and provides better performance with Lit components

import { css, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import type { GameTag } from "../../../parser/tag";
import { ComponentRenderer } from "../../../parser/component-renderer";
import { IllthornEvent } from "../../../events";
import type { FrontendSession as Session } from "../../../session/index";
import { debugFeed } from "../../../util/logger";

@customElement("illthorn-feed-modernized")
export class FeedModernized extends LitElement {
  static MIN_SCROLL_BUFFER = 300;
  static MAX_MEMORY_LENGTH = 100 * 5;

  @property({ type: Object }) session?: Session;
  @property({ type: Boolean, reflect: true }) focused = false;

  @state() private _contentTemplates: TemplateResult[] = [];
  @state() private _shouldAutoScroll = true;

  @query('.feed-container') private _feedContainer!: HTMLElement;

  private _componentRenderer = new ComponentRenderer();

  static styles = css`
    :host {
      display: block;
      height: 100%;
      width: 100%;
      font-family: "MonoLisa", monospace;
      box-sizing: border-box;
      overflow: hidden;
      transform: translate3d(0, 0, 0);
    }

    .feed-container {
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 0.5em;
      scrollbar-width: thin;
      scrollbar-color: var(--color-border) transparent;
    }

    .feed-container::-webkit-scrollbar {
      width: 8px;
    }

    .feed-container::-webkit-scrollbar-track {
      background: transparent;
    }

    .feed-container::-webkit-scrollbar-thumb {
      background-color: var(--color-border);
      border-radius: 4px;
    }

    .feed-container::-webkit-scrollbar-thumb:hover {
      background-color: var(--color-success);
    }

    :host([focused]) {
      border: 1px solid var(--color-focus);
    }

    .content {
      line-height: 1.4;
      word-wrap: break-word;
      white-space: pre-wrap;
    }

    .content pre {
      margin: 0;
      line-height: 1.4;
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: "MonoLisa", monospace;
    }

    /* Game text styling */
    .content .speech {
      color: var(--color-speech, #1ce21c);
      font-weight: bold;
    }

    .content .whisper {
      color: var(--color-whisper, #00921f);
      font-style: italic;
    }

    .content .thoughts {
      color: var(--color-thoughts, white);
      font-style: italic;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('game-element-command', this._handleGameElementCommand);
    this.addEventListener('game-element-menu', this._handleGameElementMenu);
    this.addEventListener('game-element-execute', this._handleGameElementExecute);
    this.addEventListener('game-element-monster-click', this._handleMonsterClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('game-element-command', this._handleGameElementCommand);
    this.removeEventListener('game-element-menu', this._handleGameElementMenu);
    this.removeEventListener('game-element-execute', this._handleGameElementExecute);
    this.removeEventListener('game-element-monster-click', this._handleMonsterClick);
  }

  /**
   * Modern component-based content appending
   * Replaces the old appendParsed(DocumentFragment) method
   */
  appendGameTags(tags: GameTag[]) {
    debugFeed("appendGameTags called with %d tags", tags.length);

    if (!tags.length) return;

    const wasScrolling = this.isScrolling;

    // Render tags to components
    const { content, metadata } = this._componentRenderer.render(tags);
    
    // Add to template array
    this._contentTemplates = [...this._contentTemplates, ...content];

    // Flush old content if needed
    this.flush();

    // Handle metadata separately (vitals, injuries, etc.)
    metadata.forEach(tag => this.dispatchMetadata(tag));

    // Trigger re-render
    this.requestUpdate();

    // Schedule scroll after render if auto-scrolling
    if (!wasScrolling && this._shouldAutoScroll) {
      this.updateComplete.then(() => {
        this.scrollToNow();
      });
    }
  }

  /**
   * Backward compatibility: convert DocumentFragment to tags
   * TODO: Remove once migration is complete
   */
  appendParsed(element: DocumentFragment | Element) {
    debugFeed("appendParsed (legacy) called - converting to tags");
    // This is a temporary bridge during migration
    // In the future, all content should come via appendGameTags()
    
    // For now, convert DOM back to HTML for storage (preserves existing behavior)
    let htmlContent: string;
    if (element instanceof DocumentFragment) {
      const div = document.createElement("div");
      div.appendChild(element.cloneNode(true));
      htmlContent = div.innerHTML;
    } else {
      htmlContent = element.outerHTML;
    }

    // Store as template for now
    this._contentTemplates = [...this._contentTemplates, html`${htmlContent}`];
    this.flush();
    this.requestUpdate();
  }

  /**
   * Check if feed contains a prompt at the end
   */
  has_prompt(): boolean {
    // Look for prompt in last few templates
    const lastTemplates = this._contentTemplates.slice(-3);
    return lastTemplates.some(template => 
      template.strings.some(str => str.toLowerCase().includes('<prompt'))
    );
  }

  /**
   * Clear all content
   */
  clear() {
    this._contentTemplates = [];
    this.requestUpdate();
  }

  /**
   * Flush old content to prevent memory issues
   */
  private flush() {
    if (this._contentTemplates.length > FeedModernized.MAX_MEMORY_LENGTH) {
      const keepCount = Math.floor(FeedModernized.MAX_MEMORY_LENGTH * 0.8);
      this._contentTemplates = this._contentTemplates.slice(-keepCount);
    }
  }

  /**
   * Scroll to bottom of feed
   */
  scrollToNow() {
    if (!this._feedContainer) return;
    
    this._feedContainer.scrollTop = this._feedContainer.scrollHeight;
    this._shouldAutoScroll = true;
  }

  /**
   * Check if user is manually scrolling (not at bottom)
   */
  get isScrolling(): boolean {
    if (!this._feedContainer) return false;
    
    const { scrollHeight, scrollTop, clientHeight } = this._feedContainer;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    return distanceFromBottom > FeedModernized.MIN_SCROLL_BUFFER;
  }

  /**
   * Mark feed as active/focused
   */
  activate() {
    this.focused = true;
    this.scrollToNow();
    return this;
  }

  /**
   * Mark feed as inactive
   */
  idle() {
    this.focused = false;
    return this;
  }

  render() {
    return html`
      <div class="feed-container" @scroll=${this._handleScroll}>
        <div class="content">
          ${this._contentTemplates}
        </div>
      </div>
    `;
  }

  private _handleScroll() {
    this._shouldAutoScroll = !this.isScrolling;
  }

  private _handleGameElementCommand(e: CustomEvent) {
    debugFeed("Game element command: %o", e.detail);
    if (this.session) {
      this.session.sendCommand(e.detail.command);
    }
  }

  private _handleGameElementMenu(e: CustomEvent) {
    debugFeed("Game element menu: %o", e.detail);
    // TODO: Show context menu at e.detail.x, e.detail.y
    // Integration with menu system
  }

  private _handleGameElementExecute(e: CustomEvent) {
    debugFeed("Game element execute: %o", e.detail);
    if (this.session) {
      this.session.sendCommand(e.detail.command);
    }
  }

  private _handleMonsterClick(e: CustomEvent) {
    debugFeed("Monster click: %o", e.detail);
    // TODO: Implement monster interaction (attack, look, etc.)
  }

  private dispatchMetadata(tag: GameTag) {
    // Dispatch metadata events for other components to handle
    this.dispatchEvent(new CustomEvent(`illthorn:game-metadata`, {
      detail: { tag },
      bubbles: true,
      composed: true
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-feed-modernized": FeedModernized;
  }
}
```

### Phase 4: Advanced Highlighting System

#### 4.1: Component-Level Highlighting Mixin

**File**: `src/frontend/components/game-elements/highlighting-mixin.ts`

```typescript
// ABOUTME: Reusable highlighting mixin for game element components
// ABOUTME: Provides pattern-based highlighting without DOM manipulation overhead

import { LitElement } from "lit";
import { property, state } from "lit/decorators.js";
import type { Constructor } from "../../../types/constructor";

export interface HighlightPattern {
  regex: RegExp;
  className: string;
  priority: number;
}

/**
 * Mixin to add highlighting capabilities to game element components
 */
export const HighlightingMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class HighlightingElement extends superClass {
    @property({ type: Array }) highlightPatterns: HighlightPattern[] = [];
    @state() protected _activeHighlight?: HighlightPattern;

    connectedCallback() {
      super.connectedCallback();
      this.loadUserHighlights();
    }

    updated(changedProperties: Map<string, any>) {
      super.updated(changedProperties);
      
      if (changedProperties.has('highlightPatterns') || 
          changedProperties.has('textContent')) {
        this.updateHighlighting();
      }
    }

    /**
     * Load user-defined highlight patterns from settings
     */
    private async loadUserHighlights() {
      try {
        const settings = await window.Settings.get('hilites');
        if (settings?.patterns) {
          const patterns: HighlightPattern[] = [];
          
          Object.entries(settings.patterns).forEach(([pattern, className], index) => {
            try {
              const regex = new RegExp(pattern, 'gi');
              patterns.push({
                regex,
                className: className as string,
                priority: index
              });
            } catch (e) {
              console.warn(`Invalid highlight regex: ${pattern}`, e);
            }
          });
          
          this.highlightPatterns = patterns;
        }
      } catch (e) {
        console.warn('Failed to load highlight patterns', e);
      }
    }

    /**
     * Update highlighting based on current patterns and content
     */
    private updateHighlighting() {
      const textContent = this.textContent || '';
      
      // Find the highest priority matching pattern
      let bestMatch: HighlightPattern | undefined;
      let highestPriority = -1;
      
      for (const pattern of this.highlightPatterns) {
        if (pattern.regex.test(textContent) && pattern.priority > highestPriority) {
          bestMatch = pattern;
          highestPriority = pattern.priority;
        }
      }
      
      // Update active highlight
      if (bestMatch !== this._activeHighlight) {
        // Remove old highlight class
        if (this._activeHighlight) {
          this.classList.remove(this._activeHighlight.className);
          this.removeAttribute('highlighted');
        }
        
        // Apply new highlight class
        if (bestMatch) {
          this.classList.add(bestMatch.className);
          this.setAttribute('highlighted', '');
        }
        
        this._activeHighlight = bestMatch;
      }
    }

    /**
     * Check if element is currently highlighted
     */
    protected get isHighlighted(): boolean {
      return this._activeHighlight !== undefined;
    }

    /**
     * Get the current highlight class name
     */
    protected get highlightClassName(): string {
      return this._activeHighlight?.className || '';
    }
  }
  
  return HighlightingElement;
};
```

#### 4.2: User Pattern Highlighting System

**File**: `src/frontend/components/game-elements/user-highlighting.ts`

```typescript
// ABOUTME: User-configurable pattern highlighting system for component-based rendering
// ABOUTME: Replaces Mark.js with native component highlighting capabilities

export interface UserHighlightSettings {
  patterns: Record<string, string>;  // pattern -> className
  groups: Record<string, Record<string, string>>; // className -> CSS properties
}

/**
 * Manager for user-defined highlight patterns and styling
 */
export class UserHighlightManager {
  private static instance: UserHighlightManager;
  private patterns: Map<RegExp, string> = new Map();
  private groups: Map<string, Record<string, string>> = new Map();
  private styleSheet?: CSSStyleSheet;

  static getInstance(): UserHighlightManager {
    if (!this.instance) {
      this.instance = new UserHighlightManager();
    }
    return this.instance;
  }

  private constructor() {
    this.initializeStyleSheet();
    this.loadSettings();
  }

  /**
   * Initialize the dynamic stylesheet for highlight groups
   */
  private initializeStyleSheet() {
    if (document.adoptedStyleSheets) {
      this.styleSheet = new CSSStyleSheet();
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, this.styleSheet];
    } else {
      // Fallback for older browsers
      const style = document.createElement('style');
      style.id = 'user-highlights';
      document.head.appendChild(style);
    }
  }

  /**
   * Load highlight settings from storage
   */
  async loadSettings() {
    try {
      const settings = await window.Settings.get<UserHighlightSettings>('hilites');
      if (settings) {
        this.updatePatterns(settings.patterns || {});
        this.updateGroups(settings.groups || {});
      }
    } catch (e) {
      console.warn('Failed to load highlight settings:', e);
    }
  }

  /**
   * Update highlight patterns
   */
  updatePatterns(patterns: Record<string, string>) {
    this.patterns.clear();
    
    Object.entries(patterns).forEach(([pattern, className]) => {
      try {
        const regex = this.parsePattern(pattern);
        this.patterns.set(regex, className);
      } catch (e) {
        console.warn(`Invalid highlight pattern: ${pattern}`, e);
      }
    });
    
    // Notify all components to update their highlighting
    this.notifyComponentsUpdate();
  }

  /**
   * Update highlight group styles
   */
  updateGroups(groups: Record<string, Record<string, string>>) {
    this.groups.clear();
    
    Object.entries(groups).forEach(([className, styles]) => {
      this.groups.set(className, styles);
    });
    
    this.rebuildStyleSheet();
  }

  /**
   * Parse highlight pattern (supports regex format /pattern/flags)
   */
  private parsePattern(pattern: string): RegExp {
    if (pattern.startsWith('/') && pattern.lastIndexOf('/') > 0) {
      const lastSlash = pattern.lastIndexOf('/');
      const regex = pattern.slice(1, lastSlash);
      const flags = pattern.slice(lastSlash + 1) || 'gi';
      return new RegExp(regex, flags);
    } else {
      return new RegExp(pattern, 'gi');
    }
  }

  /**
   * Rebuild the dynamic stylesheet with current group styles
   */
  private rebuildStyleSheet() {
    const rules: string[] = [];
    
    this.groups.forEach((styles, className) => {
      const cssProps = Object.entries(styles)
        .map(([prop, value]) => `${prop}: ${value}`)
        .join('; ');
      
      if (cssProps) {
        rules.push(`.${className} { ${cssProps} }`);
      }
    });
    
    const cssText = rules.join('\n');
    
    if (this.styleSheet) {
      this.styleSheet.replaceSync(cssText);
    } else {
      // Fallback method
      const styleEl = document.getElementById('user-highlights') as HTMLStyleElement;
      if (styleEl) {
        styleEl.textContent = cssText;
      }
    }
  }

  /**
   * Get compiled patterns for components to use
   */
  getPatterns(): Array<{ regex: RegExp; className: string }> {
    return Array.from(this.patterns.entries()).map(([regex, className]) => ({
      regex,
      className
    }));
  }

  /**
   * Add a new pattern
   */
  async addPattern(group: string, pattern: string) {
    const settings = await this.getCurrentSettings();
    settings.patterns[pattern] = group;
    
    await window.Settings.set('hilites', settings);
    this.updatePatterns(settings.patterns);
  }

  /**
   * Add or update a highlight group
   */
  async addGroup(group: string, styles: Record<string, string>) {
    const settings = await this.getCurrentSettings();
    settings.groups[group] = styles;
    
    await window.Settings.set('hilites', settings);
    this.updateGroups(settings.groups);
  }

  /**
   * Remove a pattern
   */
  async removePattern(pattern: string) {
    const settings = await this.getCurrentSettings();
    delete settings.patterns[pattern];
    
    await window.Settings.set('hilites', settings);
    this.updatePatterns(settings.patterns);
  }

  /**
   * Remove a group
   */
  async removeGroup(group: string) {
    const settings = await this.getCurrentSettings();
    
    // Remove group styles
    delete settings.groups[group];
    
    // Remove patterns that use this group
    Object.keys(settings.patterns).forEach(pattern => {
      if (settings.patterns[pattern] === group) {
        delete settings.patterns[pattern];
      }
    });
    
    await window.Settings.set('hilites', settings);
    this.updatePatterns(settings.patterns);
    this.updateGroups(settings.groups);
  }

  /**
   * Get current settings
   */
  private async getCurrentSettings(): Promise<UserHighlightSettings> {
    const settings = await window.Settings.get<UserHighlightSettings>('hilites');
    return settings || { patterns: {}, groups: {} };
  }

  /**
   * Notify all game element components to update their highlighting
   */
  private notifyComponentsUpdate() {
    document.dispatchEvent(new CustomEvent('illthorn:highlights-updated', {
      detail: { patterns: this.getPatterns() }
    }));
  }
}

// Initialize the singleton
UserHighlightManager.getInstance();
```

### Phase 5: Integration and Migration Strategy

#### 5.1: Session Integration

**File**: `src/frontend/session/component-integration.ts`

```typescript
// ABOUTME: Integration layer for component-based rendering in session message handling
// ABOUTME: Bridges existing session system with new component architecture

import type { FrontendSession } from "./index";
import type { GameTag } from "../parser/tag";
import { ComponentRenderer } from "../parser/component-renderer";

/**
 * Component integration for session message processing
 */
export class SessionComponentIntegration {
  private session: FrontendSession;
  private componentRenderer: ComponentRenderer;

  constructor(session: FrontendSession) {
    this.session = session;
    this.componentRenderer = new ComponentRenderer();
  }

  /**
   * Process parsed game tags with component rendering
   * This replaces the old castToHTML + addHilites pipeline
   */
  async processGameTags(tags: GameTag[]) {
    // Render components
    const { content, metadata } = this.componentRenderer.render(tags);

    // Handle prompts specially (matches existing logic)
    const promptTag = metadata.find(tag => tag.name === 'prompt');
    const prompt = promptTag && this.createPromptElement(promptTag);

    // Send content to feed if available
    if (this.session.ui?.feed) {
      // Check if feed supports new component method
      if ('appendGameTags' in this.session.ui.feed) {
        // New component-based feed
        (this.session.ui.feed as any).appendGameTags(tags);
      } else {
        // Legacy feed - convert components back to DOM
        // TODO: Remove this once migration is complete
        const fragment = await this.componentsToFragment(content);
        this.session.ui.feed.appendParsed(fragment);
      }
    }

    // Handle prompt separately if needed
    if (this.session.ui?.feed && !this.session.ui.feed.has_prompt() && prompt) {
      this.session.ui.feed.appendParsed(prompt);
    }

    // Process metadata (vitals, injuries, etc.)
    metadata.forEach(tag => this.dispatchMetadata(tag));
  }

  /**
   * Create prompt element (matches existing createPrompt logic)
   */
  private createPromptElement(tag: GameTag): Element {
    const prompt = document.createElement(tag.name);
    prompt.textContent = tag.children[0]?.text?.replace("&gt;", ">");
    Object.entries(tag.attrs).forEach(([attr, val]) => {
      prompt.setAttribute(attr, val.toString());
    });
    return prompt;
  }

  /**
   * Temporary bridge: convert component templates to DocumentFragment
   * TODO: Remove once all feeds support component rendering
   */
  private async componentsToFragment(templates: any[]): Promise<DocumentFragment> {
    // This is a temporary compatibility layer
    // In practice, we'll want to phase out legacy feed support
    const fragment = document.createDocumentFragment();
    
    // For now, render templates to temporary container and extract DOM
    const tempContainer = document.createElement('div');
    // NOTE: This is inefficient and should be removed once migration is complete
    
    return fragment;
  }

  /**
   * Dispatch metadata events (matches existing logic)
   */
  private dispatchMetadata(tag: GameTag) {
    // Use existing metadata dispatch logic
    const event = `metadata/${tag.name}${tag.attrs.id ? `/${tag.attrs.id}` : ''}`;
    this.session.bus.dispatchEvent(event, tag);
  }
}
```

#### 5.2: Migration Compatibility

**File**: `src/frontend/migration/feed-compatibility.ts`

```typescript
// ABOUTME: Compatibility bridge for gradual migration from DOM-based to component-based rendering
// ABOUTME: Allows coexistence of old and new systems during transition period

import type { Feed as LegacyFeed } from "../components/session/feed/feed.lit";
import type { FeedModernized } from "../components/session/feed/feed-modernized.lit";
import type { GameTag } from "../parser/tag";

/**
 * Adapter to provide unified interface for both legacy and modern feeds
 */
export class FeedAdapter {
  private feed: LegacyFeed | FeedModernized;
  private isModernized: boolean;

  constructor(feed: LegacyFeed | FeedModernized) {
    this.feed = feed;
    this.isModernized = 'appendGameTags' in feed;
  }

  /**
   * Append content using the most appropriate method
   */
  appendContent(content: GameTag[] | DocumentFragment | Element) {
    if (Array.isArray(content) && this.isModernized) {
      // Modern feed with GameTags
      (this.feed as FeedModernized).appendGameTags(content);
    } else if (content instanceof DocumentFragment || content instanceof Element) {
      // Legacy DOM content
      this.feed.appendParsed(content);
    } else {
      // Fallback: convert GameTags to DOM for legacy feed
      console.warn('Converting GameTags to DOM for legacy feed - consider upgrading');
      // TODO: Implement GameTag -> DOM conversion if needed
    }
  }

  /**
   * Check for prompt (unified interface)
   */
  hasPrompt(): boolean {
    return this.feed.has_prompt();
  }

  /**
   * Clear content (unified interface)
   */
  clear() {
    this.feed.clear();
  }

  /**
   * Scroll to bottom (unified interface)
   */
  scrollToNow() {
    this.feed.scrollToNow();
  }

  /**
   * Check if this is the modern feed
   */
  get isModern(): boolean {
    return this.isModernized;
  }
}
```

## Implementation Timeline

### Phase 1: Foundation (Week 1-2)
- Create base game element components
- Implement item highlighting system
- Build component renderer
- Create comprehensive test suite

### Phase 2: Feed Integration (Week 3)
- Implement modernized feed component
- Create session integration layer
- Build compatibility bridges
- Test component rendering pipeline

### Phase 3: Highlighting Migration (Week 4)
- Implement user pattern highlighting
- Create highlighting mixin
- Migrate Mark.js functionality
- Test highlighting performance

### Phase 4: Full Integration (Week 5)
- Complete session integration
- Performance optimization
- Remove compatibility bridges
- Documentation and training

### Phase 5: Polish & Enhancement (Week 6)
- Advanced interaction features
- Shoelace component integration
- Accessibility improvements
- User feedback integration

## Performance Expectations

### Rendering Performance
- **50-75% reduction** in DOM operations (eliminates double conversion)
- **30-50% improvement** in message processing time
- **Consistent 60fps** during rapid game text updates
- **Reduced memory usage** from component-based storage

### Highlighting Performance  
- **80-90% reduction** in highlighting overhead (no Mark.js DOM scanning)
- **Instant pattern updates** with component-level reactivity
- **Better Shadow DOM compatibility** with encapsulated styles
- **Scalable to 1000+ patterns** without performance degradation

### Memory Usage
- **40-60% reduction** in memory overhead (no HTML string storage)
- **Better garbage collection** with component lifecycle management
- **Structured data storage** instead of HTML strings
- **Efficient template reuse** with Lit's caching

## Testing Strategy

### Unit Testing
- Individual component behavior testing
- Component renderer output verification
- Item highlighting accuracy testing
- User pattern matching validation

### Integration Testing
- Session message processing pipeline
- Feed component compatibility testing
- Metadata event dispatching
- Performance benchmarking

### User Acceptance Testing
- Highlighting accuracy compared to legacy system
- Interactive element functionality
- Performance during heavy game activity
- Accessibility compliance verification

## Risk Mitigation

### Technical Risks
- **Performance regression**: Comprehensive benchmarking before rollout
- **Compatibility issues**: Extensive testing with real game data
- **Memory leaks**: Component lifecycle testing and monitoring
- **Rendering bugs**: Visual regression testing suite

### User Experience Risks
- **Lost functionality**: Feature parity checklist and user testing
- **Performance issues**: Performance monitoring and rollback plan
- **Accessibility problems**: Screen reader testing and compliance validation
- **Learning curve**: Documentation and migration guides

### Migration Risks
- **Data loss**: Backup and recovery procedures
- **Downtime**: Gradual rollout with feature flags
- **User resistance**: Clear communication of benefits
- **Rollback complexity**: Maintain compatibility during transition

## Success Metrics

### Performance Metrics
- Message processing time < 10ms per message (vs current ~25ms)
- Highlighting application time < 1ms per message (vs current ~5ms)
- Memory usage growth < 50MB per hour (vs current ~100MB)
- Rendering frame rate maintained at 60fps during activity

### Functionality Metrics
- 100% feature parity with existing highlighting system
- 200+ automatic item categories restored (weapons, herbs, gems, etc.)
- User pattern compatibility rate > 95%
- Interactive element response time < 100ms

### User Satisfaction Metrics
- User-reported performance improvement > 80%
- Feature satisfaction score > 4.5/5
- Bug reports < 2 per week after stabilization
- Accessibility compliance score > 90%

## Long-Term Benefits

### Architectural Benefits
- **Modern component architecture** enables advanced features
- **Better separation of concerns** improves maintainability
- **Type-safe development** reduces bugs and improves DX
- **Scalable highlighting system** supports unlimited patterns

### Feature Enablement
- **Advanced interactions** like hover tooltips, drag-and-drop
- **Custom component libraries** for specific game mechanics
- **Theme system restoration** with component-level styling
- **Plugin architecture** for user-contributed components

### Developer Experience
- **Easier testing** with isolated component behavior
- **Better debugging** with component dev tools
- **Faster development** with reusable component patterns
- **Modern tooling** integration with Lit ecosystem

This comprehensive modernization plan provides a clear path forward for transforming Illthorn's game log system from a legacy DOM-based approach to a modern, component-first architecture that will enable advanced highlighting, improved performance, and enhanced user interactions.