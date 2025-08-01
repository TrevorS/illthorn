// ABOUTME: Lit-based Feed component for displaying game text messages with auto-scrolling
// ABOUTME: Handles memory management, click events, scroll behavior, and parsed content rendering
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { IllthornEvent } from "../../../events";
import type { FrontendSession as Session } from "../../../session/index";
import { debugFeed } from "../../../util/logger";
import type { CommandEchoEvent } from "../../command-bar/command-echo";
import { createCommandEchoHTML } from "./command-echo-html";

@customElement("illthorn-feed-lit")
export class Feed extends LitElement {
  static MIN_SCROLL_BUFFER = 300;
  static MAX_MEMORY_LENGTH = 100 * 5;

  static styles = css`
    :host {
      display: block;
      height: 100%;
      width: 100%;
      font-family: "MonoLisa", monospace;
      box-sizing: border-box;
      overflow: hidden;
      /* Force onto GPU for best rendering */
      transform: translate3d(0, 0, 0);
    }

    .feed-container {
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 0.5em;
    }

    :host(.feed) {
      background: var(--color-background-primary);
      color: var(--color-text-primary);
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

    :host([focused]) {
      border: 1px solid var(--color-focus);
    }

    /* Base content styling */
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

    .content mark {
      background-color: transparent;
    }

    /* Game text styling */
    .content pre.speech,
    .content pre.whisper {
      display: inline;
    }

    /* Room styling */
    .content .roomName {
      color: var(--color-room-name);
      font-weight: bold;
    }

    .content .roomDesc {
      color: var(--color-room-description);
    }


    /* Communication styling */
    .content .thoughts {
      color: var(--color-text-primary);
    }

    .content .speech {
      color: var(--color-speech);
    }

    .content .whisper {
      color: var(--color-whisper);
    }

    /* Item and monster highlighting */
    .content a[exist],
    .content .b {
      color: var(--hilite-color, #a0a0a0);
    }

    .content b,
    .content b a[exist] {
      color: var(--color-monster);
    }

    /* Links and interactive elements */
    .content .external-link,
    .content a {
      cursor: pointer;
      color: var(--color-link);
      text-decoration: underline;
    }

    .content a:hover {
      background-color: var(--color-surface);
    }

    .content .clickable d[cmd] {
      border-bottom: 2px solid var(--color-link);
      cursor: pointer;
    }

    .content .clickable d[cmd]:hover {
      cursor: pointer;
      background-color: var(--color-surface);
    }

    .content d {
      cursor: pointer;
    }

    .content d:hover {
      background-color: var(--color-surface);
    }

    /* Macro highlighting */
    .content .macro {
      background: var(--color-macro);
    }

    /* Text formatting */
    .content ins {
      text-decoration: none;
    }

    /* Command echo styling */
    .content .command-echo {
      display: block;
      font-family: var(--font-family-monospace, "MonoLisa", monospace);
      font-size: 0.9em;
      line-height: 2.2;
      margin: 2px 0;
      color: var(--color-command-echo, var(--color-text-secondary, #ccc));
      padding: 1px 0;
      border-left: 1px solid var(--color-command-echo-border, var(--color-border, #666));
      background-color: var(--color-command-echo-bg, var(--color-surface-secondary, rgba(255, 255, 255, 0.05)));
    }

    .content .command-echo.replay {
      color: var(--color-command-echo-replay, var(--color-text-secondary, #ffcc00));
      border-left-color: var(--color-command-echo-replay-border, var(--color-border, #ff9900));
      background-color: var(--color-command-echo-replay-bg, var(--color-surface-secondary, rgba(255, 204, 0, 0.1)));
      font-style: italic;
    }

    .content .command-echo .prefix {
      opacity: 0.8;
      margin-left: 5px;
      margin-right: 5px;
    }

    .content .command-echo .command-text {
      font-weight: normal;
      font-style: italic;
    }

    /* Preset styling for inline elements */
    .content span {
      font-family: inherit;
    }
  `;

  @property({ type: Object })
  session?: Session;

  @property({ type: Boolean, reflect: true })
  focused = false;

  @state()
  private _contentHTML: Array<string> = [];

  @state()
  private _shouldAutoScroll = true;

  private _feedContainer?: HTMLElement;
  private _hasSubscribedToEcho = false;

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("feed", "scroll");
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.destroy();
  }

  /**
   * Check if user is manually scrolling (not at bottom)
   */
  get isScrolling(): boolean {
    if (!this._feedContainer) return false;
    // No content scrollable
    if (this._feedContainer.scrollHeight === this._feedContainer.clientHeight) return false;
    // Check the relative scroll offset from the head with a larger buffer for precision
    return this._feedContainer.scrollHeight - this._feedContainer.scrollTop - this._feedContainer.clientHeight > 10;
  }

  /**
   * Clean up all unsafe references
   */
  destroy() {
    this.idle();
    this.remove();
  }

  /**
   * Mark a feed as idle
   */
  idle() {
    this.focused = false;
    if (this.parentElement) {
      this.parentElement.removeChild(this);
    }
    return this;
  }

  /**
   * Clear previously rendered nodes and activate feed
   */
  activate() {
    this.focused = true;
    this.scrollToNow();
    return this;
  }

  /**
   * Check if the HEAD of the feed is a prompt or not
   */
  has_prompt(): boolean {
    if (this._contentHTML.length === 0) return false;
    const lastContent = this._contentHTML[this._contentHTML.length - 1];
    return lastContent.toLowerCase().includes("<prompt");
  }

  /**
   * appendChild override for Feed-specific functionality
   * Handles DocumentFragment appending while maintaining DOM compatibility
   */
  appendChild<T extends Node>(node: T): T;
  appendChild(fragment: DocumentFragment): DocumentFragment;
  appendChild(node: Node): Node {
    if (node instanceof DocumentFragment || node instanceof Element) {
      this.appendParsed(node);
      return node;
    }
    // Fallback to parent implementation for other Node types
    return super.appendChild(node);
  }

  /**
   * Appends a single parsed element to the HEAD of the message feed
   */
  appendParsed(ele: DocumentFragment | Element) {
    debugFeed("appendParsed called with content: %o", ele);

    if (!ele.hasChildNodes() && !(ele as Element).outerHTML) {
      return;
    }

    const wasScrolling = this.isScrolling;

    // Convert element to HTML string for storage
    let htmlContent: string;
    if (ele instanceof DocumentFragment) {
      const div = document.createElement("div");
      div.appendChild(ele.cloneNode(true));
      htmlContent = div.innerHTML;
    } else {
      htmlContent = ele.outerHTML;
    }

    // Add to content array
    this._contentHTML = [...this._contentHTML, htmlContent];

    // Flush old content if we've grown too long
    this.flush();

    // Trigger re-render
    this.requestUpdate();

    // Schedule scroll after render if not manually scrolling
    if (!wasScrolling && this._shouldAutoScroll) {
      this.updateComplete.then(() => {
        this.scrollToNow();
      });
    }
  }

  /**
   * Scroll to the HEAD position (bottom)
   */
  scrollToNow() {
    if (this._feedContainer) {
      this._feedContainer.scrollTop = this._feedContainer.scrollHeight;
      this._shouldAutoScroll = true;
    }
    return this;
  }

  /**
   * Finalizer for pruned nodes - removes old entries to manage memory
   */
  flush() {
    while (this._contentHTML.length > Feed.MAX_MEMORY_LENGTH) {
      this._contentHTML = this._contentHTML.slice(1);
    }
    return this;
  }

  /**
   * Handle scroll events to detect manual scrolling
   */
  private _handleScroll(_e: Event) {
    if (!this._feedContainer) return;

    const container = this._feedContainer;
    const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 10;
    this._shouldAutoScroll = isAtBottom;
  }

  /**
   * Handle click events on interactive elements
   */
  private _handleClick(e: Event) {
    const target = e.target as HTMLElement;
    if (!target) return;

    // Do not break text selection by re-rendering
    const selection = window.getSelection()?.toString();
    if (selection) return;

    switch (target.tagName.toLowerCase()) {
      case "d":
      case "a":
        break;
    }
  }

  /**
   * Clear all feed content
   */
  clear() {
    this._contentHTML = [];
    return this;
  }

  updated() {
    // Cache reference to the feed container after render
    if (!this._feedContainer) {
      this._feedContainer = this.shadowRoot?.querySelector(".feed-container") as HTMLElement;
    }

    // Subscribe to command echo events when session becomes available
    if (this.session?.bus && !this._hasSubscribedToEcho) {
      this.session.bus.subscribeEvent<CommandEchoEvent>(IllthornEvent.COMMAND_ECHO, this._handleCommandEcho.bind(this));
      this._hasSubscribedToEcho = true;
    }
  }

  /**
   * Handle command echo events from the CLI component
   */
  private _handleCommandEcho(event: CustomEvent<CommandEchoEvent>) {
    const { command, isReplay } = event.detail;

    // Generate static HTML for the command echo
    const echoHTML = createCommandEchoHTML({ command, isReplay });

    // Add to content HTML array directly
    this._contentHTML = [...this._contentHTML, echoHTML];

    // Trigger memory management and re-render
    this.flush();
    this.requestUpdate();

    // Auto-scroll if appropriate
    if (!this.isScrolling && this._shouldAutoScroll) {
      this.updateComplete.then(() => {
        this.scrollToNow();
      });
    }
  }

  render() {
    return html`
      <div class="feed-container" @scroll=${this._handleScroll}>
        <div class="content" @click=${this._handleClick}>
          ${this._contentHTML.map((contentHTML) => unsafeHTML(contentHTML))}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-feed-lit": Feed;
  }
}
