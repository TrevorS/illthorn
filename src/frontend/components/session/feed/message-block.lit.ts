// ABOUTME: Individual message block component for game log entries
// ABOUTME: Handles rendering of both GameTag arrays and command echo events independently

import { css, html, LitElement, nothing, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ComponentRenderer, type RenderResult } from "../../../parser/component-renderer";
import type { GameTag } from "../../../parser/tag";
import type { CommandEchoEvent } from "../../command-bar/command-echo";
import "./command-echo.lit";

// Type for message block content
export type ContentItem = { type: "tags"; data: Array<GameTag> } | { type: "echo"; data: CommandEchoEvent };

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
    if (this.item.type === "tags") {
      const renderResult: RenderResult = this._renderer.render(this.item.data);
      const hasContent = this._hasNonEmptyContent(this.item.data);

      if (renderResult.content.length > 0 && hasContent) {
        return html`<div class="message-content">${renderResult.content}</div>`;
      }
    } else if (this.item.type === "echo") {
      return html`<illthorn-command-echo-lit .command=${this.item.data.command} .isReplay=${this.item.data.isReplay} .timestamp=${this.item.data.timestamp}></illthorn-command-echo-lit>`;
    }

    return nothing;
  }

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
