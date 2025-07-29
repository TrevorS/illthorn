// ABOUTME: Lit-based Streams component for displaying filtered game content streams
// ABOUTME: Handles auto-scrolling and entry management for side panel content like thoughts, deaths, etc.
import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

@customElement("illthorn-streams-lit")
export class Streams extends LitElement {
  static styles = css`
    :host {
      display: block;
      overflow-y: auto;
      height: 100%;
      font-family: inherit;
      font-size: var(--stream-font-size, var(--base-font-size, 15px));
      padding: 0 1em;
      box-sizing: border-box;
    }

    /* Streams-on border styling (applied externally but needs to work with Shadow DOM) */
    :host(.streams-border) {
      border-bottom: var(--border-width, 3px) solid var(--border-color, var(--info));
    }

    :host(.scroll) {
      scrollbar-width: thin;
      scrollbar-color: var(--info, #666) transparent;
    }

    :host(.scroll)::-webkit-scrollbar {
      width: 8px;
    }

    :host(.scroll)::-webkit-scrollbar-track {
      background: transparent;
    }

    :host(.scroll)::-webkit-scrollbar-thumb {
      background-color: var(--info, #666);
      border-radius: 4px;
    }

    :host(.scroll)::-webkit-scrollbar-thumb:hover {
      background-color: var(--ok, #888);
    }

    /* Stream content styling */
    mark {
      background: transparent;
    }

    pre {
      margin: 0.2em 0;
      white-space: pre-wrap;
      font-family: inherit;
      line-height: 1.4;
    }

    /* Stream channel styling */
    .stream-channel {
      font-weight: bold;
      text-transform: uppercase;
      color: var(--stream-channel-color, #91d686);
    }

    .stream-channel.death {
      color: var(--danger, #ff3b00);
    }

    /* Private message styling */
    .stream-channel[data-stream-channel="[PrivateTo]"],
    .stream-channel[data-stream-channel="[Private]"] {
      background: var(--danger, #ff3b00);
      color: white;
      padding: 0.1em 0.3em;
      border-radius: 2px;
    }

    /* Merchant and special channel styling */
    .stream-channel[data-stream-channel="[Merchant]"],
    .stream-channel[data-stream-channel="[Dreavening]"] {
      color: var(--gentle-warn, #efca6a);
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
      color: var(--thoughts-color, var(--text-color, white));
    }

    pre.speech {
      color: var(--speech-color, #1ce21c);
    }

    pre.whisper {
      color: var(--whisper-color, var(--speech-color, #00921f));
    }

    /* Links in streams */
    a {
      color: var(--link-color, #27a4fd);
      cursor: pointer;
    }

    a:hover {
      text-decoration: underline;
    }

    /* Interactive elements */
    d[cmd] {
      cursor: pointer;
      color: var(--link-color, #27a4fd);
    }

    d[cmd]:hover {
      text-decoration: underline;
    }
  `;

  @state()
  private _entries: Array<string> = [];

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("scroll");
  }

  /**
   * Add a new entry to the streams panel
   */
  addEntry(entry: Element) {
    const wasScrolling = this.isScrolling;

    // Clone the entry and convert to HTML string
    const clonedEntry = entry.cloneNode(true) as Element;
    this._entries = [...this._entries, clonedEntry.outerHTML];

    // Handle auto-scrolling behavior
    if (!wasScrolling) {
      // Schedule scroll after render
      this.updateComplete.then(() => {
        this.scrollToNow();
      });
    }
  }

  /**
   * Check if user is manually scrolling (not at bottom)
   */
  get isScrolling(): boolean {
    // No content scrollable
    if (this.scrollHeight === this.clientHeight) return false;
    // Check the relative scroll offset from the head
    return this.scrollHeight - this.scrollTop - this.clientHeight > 1;
  }

  /**
   * Scroll to the bottom of the streams panel
   */
  scrollToNow(): this {
    this.scrollTop = this.scrollHeight;
    return this;
  }

  /**
   * Clear all entries from the streams panel
   */
  clear(): void {
    this._entries = [];
    this.requestUpdate();
  }

  render() {
    return html`
      ${this._entries.map((entryHTML) => unsafeHTML(entryHTML))}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-streams-lit": Streams;
  }
}
