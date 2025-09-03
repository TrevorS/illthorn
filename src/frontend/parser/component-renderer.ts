// ABOUTME: Converts GameTag objects directly to Lit TemplateResult components
// ABOUTME: Replaces castToHTML() DOM generation with modern component-based rendering

import { html, type TemplateResult } from "lit";
import type { GameTag } from "./tag";
import { TagKind } from "./tag";

// Import all game element components to ensure they're registered
import "../components/game-elements/game-link.lit";
import "../components/game-elements/game-command.lit";
import "../components/game-elements/game-monster.lit";

export interface RenderResult {
  content: Array<TemplateResult>;
  metadata: Array<GameTag>;
}

/**
 * Modern component-based renderer for game content
 * Converts GameTag[] directly to Lit components without intermediate DOM conversion
 */
export class ComponentRenderer {
  /**
   * Primary rendering method - converts GameTag array to component templates
   */
  render(tags: Array<GameTag>): RenderResult {
    const content: Array<TemplateResult> = [];
    const metadata: Array<GameTag> = [];

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
  private renderTag(tag: GameTag): {
    template?: TemplateResult;
    metadata?: GameTag;
  } {
    switch (tag.name) {
      case "a":
        return this.renderGameLink(tag);

      case "b":
        return this.renderGameMonster(tag);

      case "d":
        return this.renderGameCommand(tag);

      case ":text":
        return this.renderText(tag);

      case "preset":
        return this.renderPreset(tag);

      case "style":
      case "output":
        return this.renderStyledContainer(tag);

      // Metadata tags - these don't render but are processed by other systems
      case "prompt":
      case "progressBar":
      case "vitals":
      case "injuries":
      case "activeSpells":
      case "nav":
      case "room":
      case "compass":
      case "stream":
        return { metadata: tag };

      default:
        // Unknown tags become metadata for future extensibility
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
        .exist=${tag.attrs.exist as string}
        .noun=${tag.attrs.noun as string}
        .coord=${tag.attrs.coord as string}
        >${tag.text || ""}${children}</illthorn-game-link
      >`,
    };
  }

  /**
   * Render <b> wrapped monsters as GameMonster components
   */
  private renderGameMonster(tag: GameTag): { template: TemplateResult } {
    // Extract exist/noun from nested <a> tags if present
    const { exist, noun } = this.extractLinkAttributes(tag);

    // Extract text content from nested <a> tags (don't render children as components)
    const textContent = this.extractTextFromChildren(tag.children);

    return {
      template: html`<illthorn-game-monster
        .tag=${tag}
        .exist=${exist}
        .noun=${noun}
        >${tag.text || ""}${textContent}</illthorn-game-monster
      >`,
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
        .cmd=${tag.attrs.cmd as string}
        >${tag.text || ""}${children}</illthorn-game-command
      >`,
    };
  }

  /**
   * Render text nodes with HTML entity decoding
   */
  private renderText(tag: GameTag): { template?: TemplateResult } {
    if (tag.text === undefined || tag.text === null) {
      return {};
    }

    // Decode HTML entities (e.g., &gt; -> >, &lt; -> <)
    // Uses same pattern as prompt and command-echo components
    const decodedText = this._decodeHTMLEntities(tag.text);

    return {
      template: html`${decodedText}`,
    };
  }

  /**
   * Render preset styled spans
   */
  private renderPreset(tag: GameTag): { template: TemplateResult } {
    const children = this.renderChildren(tag.children);
    const presetId = tag.attrs.id as string;

    if (!presetId) {
      // Fallback: render without class
      return {
        template: html`<span>${tag.text || ""}${children}</span>`,
      };
    }

    return {
      template: html`<span class=${presetId}
        >${tag.text || ""}${children}</span
      >`,
    };
  }

  /**
   * Render styled containers (style/output tags)
   */
  private renderStyledContainer(tag: GameTag): { template: TemplateResult } {
    const children = this.renderChildren(tag.children);
    const classes = this.buildClassString(tag.attrs);

    return {
      template: html`<pre class=${classes}>${tag.text || ""}${children}</pre>`,
    };
  }

  /**
   * Build CSS class string from attributes
   */
  private buildClassString(attrs: Record<string, unknown>): string {
    return Object.values(attrs)
      .filter((val) => val && typeof val === "string")
      .join(" ");
  }

  /**
   * Recursively render child GameTags
   */
  private renderChildren(children: Array<GameTag>): Array<TemplateResult> {
    return children.map((child) => this.renderTag(child).template).filter((template): template is TemplateResult => template !== undefined);
  }

  /**
   * Extract exist and noun attributes from nested <a> tags (used for monsters)
   */
  private extractLinkAttributes(tag: GameTag): {
    exist?: string;
    noun?: string;
  } {
    const findLinkAttributes = (children: Array<GameTag>): { exist?: string; noun?: string } => {
      for (const child of children) {
        if (child.name === "a") {
          return {
            exist: child.attrs.exist as string,
            noun: child.attrs.noun as string,
          };
        }
        // Recursively search in nested children
        const nested = findLinkAttributes(child.children);
        if (nested.exist || nested.noun) {
          return nested;
        }
      }
      return {};
    };

    return findLinkAttributes(tag.children);
  }

  /**
   * Extract text content from nested tags without rendering them as components
   * Used by GameMonster to prevent nested GameLink components
   */
  private extractTextFromChildren(children: Array<GameTag>): string {
    let textContent = "";

    for (const child of children) {
      if (child.text) {
        textContent += child.text;
      }
      if (child.children.length > 0) {
        textContent += this.extractTextFromChildren(child.children);
      }
    }

    return textContent;
  }

  /**
   * Filter metadata from a mixed array of tags
   */
  extractMetadata(tags: Array<GameTag>): Array<GameTag> {
    const metadata: Array<GameTag> = [];

    for (const tag of tags) {
      if (tag.kind === TagKind.METADATA) {
        metadata.push(tag);
      }
      // Recursively extract from children
      metadata.push(...this.extractMetadata(tag.children));
    }

    return metadata;
  }

  /**
   * Get rendering statistics for performance monitoring
   */
  getRenderStats(tags: Array<GameTag>): {
    totalTags: number;
    componentTags: number;
    metadataTags: number;
    textNodes: number;
  } {
    let totalTags = 0;
    let componentTags = 0;
    let metadataTags = 0;
    let textNodes = 0;

    const countTags = (tagArray: Array<GameTag>) => {
      for (const tag of tagArray) {
        totalTags++;

        switch (tag.name) {
          case "a":
          case "b":
          case "d":
          case "preset":
          case "style":
          case "output":
          case "stream":
            componentTags++;
            break;
          case ":text":
            textNodes++;
            break;
          default:
            if (tag.kind === TagKind.METADATA) {
              metadataTags++;
            }
            break;
        }

        countTags(tag.children);
      }
    };

    countTags(tags);

    return {
      totalTags,
      componentTags,
      metadataTags,
      textNodes,
    };
  }

  /**
   * Render a single tag with error handling and fallback
   */
  renderSafe(tag: GameTag): TemplateResult {
    try {
      const result = this.renderTag(tag);
      return result.template || html`<!-- Empty tag: ${tag.name} -->`;
    } catch (error) {
      console.warn(`Failed to render tag ${tag.name}:`, error);
      // Fallback to text content if available
      return html`${tag.text || `[Error rendering ${tag.name}]`}`;
    }
  }

  /**
   * Batch render multiple tag arrays efficiently
   */
  renderBatch(tagArrays: Array<Array<GameTag>>): Array<RenderResult> {
    return tagArrays.map((tags) => this.render(tags));
  }

  /**
   * Check if renderer supports a specific tag type
   */
  supportsTag(tagName: string): boolean {
    const supportedTags = new Set(["a", "b", "d", ":text", "preset", "style", "output", "stream"]);
    return supportedTags.has(tagName);
  }

  /**
   * Get the component name that would be used for a tag
   */
  getComponentName(tagName: string): string | null {
    const componentMap: Record<string, string> = {
      a: "illthorn-game-link",
      b: "illthorn-game-monster",
      d: "illthorn-game-command",
    };
    return componentMap[tagName] || null;
  }

  /**
   * Decode HTML entities in text content (e.g., &gt; -> >, &lt; -> <)
   * Uses same pattern as prompt and command-echo components for consistency
   */
  private _decodeHTMLEntities(text: string): string {
    if (!text) return text;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = text;
    return tempDiv.textContent || tempDiv.innerText || text;
  }
}
