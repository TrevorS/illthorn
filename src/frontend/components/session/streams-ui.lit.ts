// ABOUTME: Pure UI component for displaying stream content with auto-scrolling behavior
// ABOUTME: Accepts stream entries as properties and handles presentation only
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ComponentRenderer } from "../../parser/component-renderer";
import type { StreamEntry } from "./streams-container.lit";

@customElement("illthorn-streams-ui")
export class StreamsUI extends LitElement {
  private _renderer = new ComponentRenderer();
  static styles = css`
    :host {
      display: block;
      overflow-y: auto;
      height: 100%;
      width: 100%;
      font-family: inherit;
      font-size: var(--stream-font-size, var(--base-font-size, 13px));
      padding: 0.5em 1em;
      box-sizing: border-box;
      background-color: var(--streams-background, var(--color-surface));
      flex: 1;
      position: relative;
    }

    /* Streams-on border styling (applied externally but needs to work with Shadow DOM) */
    :host(.streams-border) {
      border-bottom: var(--border-width, 3px) solid var(--border-color, var(--color-border));
    }

    :host(.scroll) {
      scrollbar-width: thin;
      scrollbar-color: var(--color-border) transparent;
    }

    :host(.scroll)::-webkit-scrollbar {
      width: 8px;
    }

    :host(.scroll)::-webkit-scrollbar-track {
      background: transparent;
    }

    :host(.scroll)::-webkit-scrollbar-thumb {
      background-color: var(--color-border);
      border-radius: 4px;
    }

    :host(.scroll)::-webkit-scrollbar-thumb:hover {
      background-color: var(--color-success);
    }

    /* Stream content styling */
    mark {
      background: transparent;
    }

    pre {
      margin: 0.2em 0;
      white-space: pre-wrap;
    }

    .stream-channel {
      font-weight: bold;
      text-transform: uppercase;
      color: var(--stream-channel-color, var(--color-success));
    }

    .stream-channel.death {
      color: var(--color-danger);
    }

    .stream-channel[data-stream-channel="[PrivateTo]"],
    .stream-channel[data-stream-channel="[Private]"] {
      background: var(--color-danger);
      color: white;
    }

    pre.loaded-from-storage-message {
      opacity: 0.5;
      margin: 1.5em 0;
      text-align: center;
    }

    /* Stream channel styling */
    .stream-channel {
      font-weight: bold;
      text-transform: uppercase;
      color: var(--stream-channel-color, var(--color-success));
    }

    .stream-channel.death {
      color: var(--color-danger);
    }

    /* Private message styling */
    .stream-channel[data-stream-channel="[PrivateTo]"],
    .stream-channel[data-stream-channel="[Private]"] {
      background: var(--color-danger);
      color: white;
      padding: 0.1em 0.3em;
      border-radius: 2px;
    }

    /* Merchant and special channel styling */
    .stream-channel[data-stream-channel="[Merchant]"],
    .stream-channel[data-stream-channel="[Dreavening]"] {
      color: var(--color-warning);
    }

    /* Loaded from storage message */
    pre.loaded-from-storage-message {
      opacity: 0.5;
      margin: 1.5em 0;
      text-align: center;
      font-style: italic;
    }

    /* Stream-specific content styling */
    pre.thoughts.stream {
      color: var(--thoughts-color, var(--color-text-primary));
    }

    pre.speech {
      color: var(--speech-color, var(--color-speech));
    }

    pre.whisper {
      color: var(--whisper-color, var(--color-whisper));
    }

    /* Links in streams */
    a {
      color: var(--color-link);
      cursor: pointer;
    }

    a:hover {
      text-decoration: underline;
    }

    /* Interactive elements */
    d[cmd] {
      cursor: pointer;
      color: var(--color-link);
    }

    d[cmd]:hover {
      text-decoration: underline;
    }

    /* Empty state styling */
    .streams-empty {
      color: var(--streams-text, var(--color-text-secondary));
      font-style: italic;
      text-align: left;
      padding: 0.5em;
      opacity: 0.6;
      font-size: 0.85em;
      position: absolute;
      top: 0;
      left: 0;
    }

    /* Stream entry styling */
    .stream-entry {
      margin: 0.2em 0;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .stream-entry.thoughts {
      color: var(--thoughts-color, var(--color-text-primary));
    }

    .stream-entry.speech {
      color: var(--speech-color, var(--color-speech));
    }

    .stream-entry.death {
      color: var(--color-danger);
      font-weight: bold;
    }

    .stream-entry.logon,
    .stream-entry.logoff {
      color: var(--color-text-secondary);
      font-style: italic;
    }
  `;

  @property({ type: Array })
  entries: Array<StreamEntry> = [];

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("scroll");
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has("entries")) {
      // Auto-scroll if user was at bottom before update
      const wasScrolling = this.isScrolling;
      if (!wasScrolling) {
        // Wait for DOM to fully update before scrolling, like FeedModernized does
        this.updateComplete.then(() => {
          this._scheduleAutoScroll();
        });
      }
    }
  }

  /**
   * Schedule auto-scroll using double RAF for DOM update timing
   * Double RAF ensures DOM has fully updated before scrolling
   */
  private _scheduleAutoScroll() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.scrollToNow();
      });
    });
  }

  /**
   * Check if user is manually scrolling (not at bottom)
   */
  get isScrolling(): boolean {
    // No content scrollable
    if (this.scrollHeight === this.clientHeight) return false;
    // Check the relative scroll offset from the bottom with buffer for precision
    // Using 3 as buffer like the main feed (MIN_SCROLL_BUFFER)
    return this.scrollHeight - this.scrollTop - this.clientHeight > 3;
  }

  /**
   * Scroll to the bottom of the streams panel
   */
  scrollToNow(): this {
    try {
      this.scrollTop = this.scrollHeight;
    } catch (error) {
      console.warn("Failed to scroll streams container:", error);
    }
    return this;
  }

  /**
   * Clear all entries from the streams panel
   */
  clear(): void {
    this.dispatchEvent(new CustomEvent("clear"));
  }

  render() {
    if (this.entries.length === 0) {
      return html`
        <div class="streams-empty">Streams Panel</div>
      `;
    }

    return html`
      ${this.entries.map((entry) => {
        // Use ComponentRenderer to render the stream tag's children (the actual content)
        // Stream tags themselves are metadata containers, the displayable content is in their children
        const renderResult = this._renderer.render(entry.streamTag.children);
        return html`<div class="stream-entry ${entry.streamType}" data-stream-type="${entry.streamType}">${renderResult.content.map((template) => template)}</div>`;
      })}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-streams-ui": StreamsUI;
  }
}
