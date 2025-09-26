// ABOUTME: Individual message block component for game log entries
// ABOUTME: Handles rendering of both GameTag arrays and command echo events independently

import { css, html, LitElement, nothing, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { IllthornEvent } from "../../../events";
import { highlightManager } from "../../../highlights";
import { ComponentRenderer, type RenderResult } from "../../../parser/component-renderer";
import type { GameTag } from "../../../parser/tag";
import type { ClientMessageEvent, CommandEchoEvent } from "../../command-bar/command-echo";
import "./command-echo.lit";
import "./client-message.lit";

// Type for message block content
export type ContentItem =
  | { type: "tags"; data: Array<GameTag>; timestamp: number }
  | { type: "echo"; data: CommandEchoEvent; timestamp: number }
  | { type: "client"; data: ClientMessageEvent; timestamp: number };

@customElement("illthorn-message-block-lit")
export class MessageBlock extends LitElement {
  @property({ type: Object })
  item!: ContentItem;

  @property({ type: Number })
  index = 0;

  static styles = css`
    :host {
      display: block;
      margin-bottom: 0.25em;
      word-wrap: break-word;
      box-sizing: border-box;
    }

    :host(:last-child) {
      margin-bottom: 0;
    }

    .message-content {
      line-height: 1.6;
      word-wrap: break-word;
      white-space: pre-line;
    }

    /* Eliminate any spacing issues with inline game elements */
    .message-content illthorn-game-link,
    .message-content illthorn-game-command,
    .message-content illthorn-game-monster {
      margin: 0;
      padding: 0;
      word-spacing: 0;
    }

    /* Keep exact formatting only for actual preformatted content */
    .message-content pre {
      margin: 0;
      line-height: 1.4;
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: "MonoLisa", monospace;
    }

    /* Preserve formatting for preset elements that might contain ASCII art or tables */
    .message-content .preset {
      white-space: pre-line;
    }

    .message-content mark {
      background-color: transparent;
    }

    /* Game text styling */
    .message-content pre.speech,
    .message-content pre.whisper {
      display: inline;
    }

    /* Room styling - name as block header, description flows inline */
    .message-content .roomName {
      display: block;
      color: var(--color-room-name, #ffffff);
      font-weight: bold;
      margin-bottom: 0.5em;
    }

    .message-content .roomDesc {
      display: inline;
      color: var(--color-room-description, #cccccc);
    }

    /* Communication styling */
    .message-content .thoughts {
      color: var(--color-text-primary);
    }

    .message-content .speech {
      color: var(--color-speech);
    }

    .message-content .whisper {
      color: var(--color-whisper);
    }

    /* Links and interactive elements */
    .message-content .external-link,
    .message-content a {
      cursor: pointer;
      color: var(--color-link);
      text-decoration: underline;
    }

    .message-content a:hover {
      background-color: var(--color-surface);
    }

    .message-content .clickable d[cmd] {
      border-bottom: 2px solid var(--color-link);
      cursor: pointer;
    }

    .message-content .clickable d[cmd]:hover {
      cursor: pointer;
      background-color: var(--color-surface);
    }

    .message-content d {
      cursor: pointer;
    }

    .message-content d:hover {
      background-color: var(--color-surface);
    }

    /* Macro highlighting */
    .message-content .macro {
      background: var(--color-macro);
    }

    /* Text formatting */
    .message-content ins {
      text-decoration: none;
    }

    /* Preset styling for inline elements */
    .message-content span {
      font-family: inherit;
    }
  `;

  private _renderer = new ComponentRenderer();
  private _highlightReloadListener: ((event: CustomEvent) => void) | null = null;

  connectedCallback() {
    super.connectedCallback();

    // Adopt the global highlight stylesheet into this Shadow DOM
    this._adoptHighlightStyles();

    // Subscribe to highlight reload events to update styles
    this._highlightReloadListener = () => {
      // Re-adopt styles when highlights are reloaded (styles may have changed)
      this._adoptHighlightStyles();
      // Note: Content re-rendering will happen automatically when config changes trigger updates
    };

    if (window.Illthorn?.bus) {
      window.Illthorn.bus.subscribeEvent(IllthornEvent.HIGHLIGHTS_RELOADED, this._highlightReloadListener);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    // Unsubscribe from events
    if (this._highlightReloadListener && window.Illthorn?.bus) {
      window.Illthorn.bus._ele.removeEventListener(IllthornEvent.HIGHLIGHTS_RELOADED, this._highlightReloadListener as EventListener);
    }
  }

  /**
   * Adopt the global highlight stylesheet into this Shadow DOM
   */
  private _adoptHighlightStyles(): void {
    if (!this.shadowRoot) {
      return;
    }

    try {
      // Get the highlight stylesheet from the global document
      // Check if adoptedStyleSheets is available (not available in JSDOM test environment)
      if (!document.adoptedStyleSheets) {
        return;
      }

      const globalHighlightSheet = document.adoptedStyleSheets.find((sheet) => {
        // The highlight manager adds its stylesheet to the global document
        // We can identify it by checking if it has highlight class rules
        try {
          const rules = Array.from(sheet.cssRules || []);
          return rules.some((rule) => rule instanceof CSSStyleRule && rule.selectorText && rule.selectorText.includes(".highlight-"));
        } catch (_e) {
          // Can't access rules (cross-origin), skip
          return false;
        }
      });

      if (globalHighlightSheet) {
        // Add the highlight stylesheet to this Shadow DOM's adopted stylesheets
        const existingSheets = this.shadowRoot.adoptedStyleSheets || [];

        // Remove any existing highlight sheets first to avoid duplicates
        const filteredSheets = existingSheets.filter((sheet) => {
          try {
            const rules = Array.from(sheet.cssRules || []);
            return !rules.some((rule) => rule instanceof CSSStyleRule && rule.selectorText && rule.selectorText.includes(".highlight-"));
          } catch (_e) {
            return true; // Keep non-highlight sheets
          }
        });

        this.shadowRoot.adoptedStyleSheets = [...filteredSheets, globalHighlightSheet];
      } else {
        // Fallback: look for the style element approach
        const styleElement = document.getElementById("highlight-manager-styles") as HTMLStyleElement;
        if (styleElement) {
          // Create a new stylesheet from the style element content
          const newSheet = new CSSStyleSheet();
          newSheet.replaceSync(styleElement.textContent || "");

          const existingSheets = this.shadowRoot.adoptedStyleSheets || [];
          this.shadowRoot.adoptedStyleSheets = [...existingSheets, newSheet];
        }
      }
    } catch (error) {
      console.warn("Failed to adopt highlight styles:", error);
    }
  }

  /**
   * Apply highlights to template content during render time
   */
  private _processContentWithHighlights(content: Array<TemplateResult>): Array<TemplateResult> {
    if (!highlightManager.getPatterns().length) {
      return content;
    }

    return content.map((template) => {
      // Extract text from the template to apply highlights
      const textContent = this._extractTextFromTemplate(template);
      if (!textContent) {
        return template;
      }

      const highlightedText = this._applyHighlightsToText(textContent);
      if (highlightedText === textContent) {
        return template; // No highlights applied
      }

      // Return new template with highlighted content
      return html`${unsafeHTML(highlightedText)}`;
    });
  }

  /**
   * Extract text content from a Lit template
   */
  private _extractTextFromTemplate(template: TemplateResult): string | null {
    try {
      // Create a temporary element to extract text content
      const tempDiv = document.createElement("div");

      // Render the template to get its string representation
      const parts = template.strings;
      const values = template.values;

      let result = "";
      for (let i = 0; i < parts.length; i++) {
        result += parts[i];
        if (i < values.length) {
          const value = values[i];
          if (typeof value === "string") {
            result += value;
          } else {
            // Complex template, skip highlighting for now
            return null;
          }
        }
      }

      tempDiv.innerHTML = result;
      return tempDiv.textContent;
    } catch (_error) {
      return null;
    }
  }

  /**
   * Apply highlight patterns to plain text and return HTML with spans
   */
  private _applyHighlightsToText(text: string): string {
    let resultHTML = text;
    let hasMatches = false;
    const patterns = highlightManager.getPatterns();

    // Apply all patterns, with higher priority patterns overriding lower ones
    patterns
      .sort((a, b) => b.priority - a.priority)
      .forEach((pattern) => {
        // Collect all matches with their positions for this pattern
        const replacements: Array<{ start: number; end: number; replacement: string }> = [];

        // Find matches in the current resultHTML (which may contain previous pattern results)
        const matches = resultHTML.matchAll(pattern.regex);
        for (const match of matches) {
          if (match[0] && match.index !== undefined) {
            replacements.push({
              start: match.index,
              end: match.index + match[0].length,
              replacement: `<span class="${pattern.className}">${match[0]}</span>`,
            });
          }
        }

        // Apply replacements from end to start to maintain positions
        if (replacements.length > 0) {
          replacements.sort((a, b) => b.start - a.start);
          for (const rep of replacements) {
            resultHTML = resultHTML.slice(0, rep.start) + rep.replacement + resultHTML.slice(rep.end);
            hasMatches = true;
          }
        }
      });

    return hasMatches ? resultHTML : text;
  }

  /**
   * Check if a tag group contains meaningful content (not just whitespace)
   */
  private _hasNonEmptyContent(tagGroup: Array<GameTag>): boolean {
    for (const tag of tagGroup) {
      // Check if tag has meaningful text content
      if (tag.text && tag.text.trim().length > 0) {
        return true;
      }

      // Recursively check children
      if (tag.children.length > 0 && this._hasNonEmptyContent(tag.children)) {
        return true;
      }

      // Non-text tags like metadata are considered meaningful
      if (tag.name !== ":text") {
        return true;
      }
    }

    return false;
  }

  render(): TemplateResult | typeof nothing {
    switch (this.item.type) {
      case "tags": {
        const renderResult: RenderResult = this._renderer.render(this.item.data);
        const hasContent = this._hasNonEmptyContent(this.item.data);

        if (renderResult.content.length > 0 && hasContent) {
          // Apply highlights during render time
          const highlightedContent = this._processContentWithHighlights(renderResult.content);
          return html`<div class="message-content">${highlightedContent}</div>`;
        }
        break;
      }
      case "echo": {
        return html`<illthorn-command-echo-lit .command=${this.item.data.command} .isReplay=${this.item.data.isReplay} .isMacro=${this.item.data.isMacro} .prompt=${this.item.data.prompt} .timestamp=${this.item.data.timestamp}></illthorn-command-echo-lit>`;
      }
      case "client": {
        return html`<illthorn-client-message-lit .message=${this.item.data.message} .timestamp=${this.item.data.timestamp}></illthorn-client-message-lit>`;
      }
      default: {
        // Exhaustive switch - this should never happen with proper typing
        const _exhaustive: never = this.item;
        return nothing;
      }
    }

    return nothing;
  }

  // Note: Highlighting is now applied during render time, not after DOM updates
  // This eliminates DOM traversal and text node replacement

  /**
   * Get interaction context for external systems
   */
  getInteractionContext() {
    return {
      type: this.item.type,
      index: this.index,
      item: this.item,
    };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-message-block-lit": MessageBlock;
  }
}
