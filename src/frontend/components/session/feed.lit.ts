// ABOUTME: Lit-based Feed component for displaying game text messages with auto-scrolling
// ABOUTME: Handles memory management, click events, scroll behavior, and parsed content rendering
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import type { FrontendSession as Session } from "../../session/index";

@customElement("illthorn-feed-lit")
export class Feed extends LitElement {
  static MIN_SCROLL_BUFFER = 300;
  static MAX_MEMORY_LENGTH = 100 * 5;

  static styles = css`
    :host {
      display: block;
      overflow-y: auto;
      height: 100%;
      font-family: inherit;
      padding: 0 1em 1em 1em;
      box-sizing: border-box;
      /* Force onto GPU for best rendering */
      transform: translate3d(0, 0, 0);
    }

    :host(.feed) {
      background: var(--main-bg-color, #000);
      color: var(--text-color, #fff);
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

    :host([focused]) {
      border: 1px solid var(--ok, #0a84ff);
    }

    /* Base content styling */
    .content {
      line-height: 1.4;
    }

    .content pre {
      margin: 0;
      line-height: 1.4;
      white-space: pre-wrap;
      font-family: inherit;
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
      color: var(--room-name-color, var(--text-color, #fff));
      font-weight: bold;
    }

    .content .roomDesc {
      color: var(--room-desc-color, var(--text-color, #fff));
    }

    /* Theme-specific room styling */
    
    /* Rogue theme */
    :host-context([theme='rogue']) .content .roomName {
      color: var(--cyan);
    }

    /* Dark King theme */
    :host-context([theme='dark-king']) .content .roomName {
      margin: 1em 0 0 0;
      background: linear-gradient(to right, rgba(169, 144, 239, 0.35), transparent);
      color: white;
      padding: 0.5em 1em;
    }

    :host-context([theme='dark-king']) .content .roomDesc {
      margin: 0 0 1em 0;
      padding: 0.5em 1em;
      opacity: 0.66;
      background: linear-gradient(to right, rgba(169, 144, 239, 0.2), transparent);
    }

    /* Discstone theme */
    :host-context([theme='discstone']) .content .roomName {
      background: #2e3136;
      color: var(--purple, #a990ef);
      padding: 0.5em;
    }

    :host-context([theme='discstone']) .content .roomDesc {
      background: #2e3136;
      padding: 0.5em;
      margin-bottom: 0.5em;
    }

    /* Raging Thrak theme */
    :host-context([theme='raging-thrak']) .content .roomName {
      margin: 10px 0 0 0;
      background: linear-gradient(to right, rgba(255, 165, 0, 0.35), transparent);
      color: white;
      padding: 0.5em 1em;
    }

    :host-context([theme='raging-thrak']) .content .roomDesc {
      margin: 0 0 10px 0;
      padding: 6px;
      opacity: 0.75;
    }

    /* Icemule theme */
    :host-context([theme='icemule']) .content .roomName {
      color: #d08770;
    }

    :host-context([theme='icemule']) .content .roomDesc {
      padding: 0.5rem;
    }

    /* Communication styling */
    .content .thoughts {
      color: var(--thoughts-color, var(--text-color, white));
    }

    .content .speech {
      color: var(--speech-color, #1ce21c);
    }

    .content .whisper {
      color: var(--whisper-color, var(--speech-color, #00921f));
    }

    /* Item and monster highlighting */
    .content a[exist],
    .content .b {
      color: var(--hilite-color, #a0a0a0);
    }

    .content b,
    .content b a[exist] {
      color: var(--monster-color, var(--warn, #fb5d2d));
    }

    /* Links and interactive elements */
    .content .external-link,
    .content a {
      cursor: pointer;
      color: var(--link-color, #27a4fd);
      text-decoration: underline;
    }

    .content a:hover {
      background-color: var(--info, #333);
    }

    .content .clickable d[cmd] {
      border-bottom: 2px solid var(--link-color, #27a4fd);
      cursor: pointer;
    }

    .content .clickable d[cmd]:hover {
      cursor: pointer;
      background-color: var(--info, #333);
    }

    .content d {
      cursor: pointer;
    }

    .content d:hover {
      background-color: var(--info, #333);
    }

    /* Macro highlighting */
    .content .macro {
      background: var(--macro-color, #de5aff);
    }

    /* Text formatting */
    .content ins {
      text-decoration: none;
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
    // No content scrollable
    if (this.scrollHeight === this.clientHeight) return false;
    // Check the relative scroll offset from the head
    return this.scrollHeight - this.scrollTop - this.clientHeight > 1;
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
   * Appends a single parsed element to the HEAD of the message feed
   */
  appendParsed(ele: DocumentFragment | Element) {
    if (!ele.hasChildNodes() && !(ele as Element).outerHTML) {
      console.trace("{error: %o}", ele);
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

    // Schedule scroll after render if not manually scrolling
    if (!wasScrolling) {
      this.updateComplete.then(() => {
        this.scrollToNow();
      });
    }
  }

  /**
   * Scroll to the HEAD position (bottom)
   */
  scrollToNow() {
    this.scrollTop = this.scrollHeight;
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
        console.log("click -> %o", target);
        console.warn("<%s> handling not implemented", target.tagName);
        break;
    }
  }

  render() {
    return html`
      <div class="content" @click=${this._handleClick}>
        ${this._contentHTML.map((contentHTML) => unsafeHTML(contentHTML))}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-feed-lit": Feed;
  }
}
