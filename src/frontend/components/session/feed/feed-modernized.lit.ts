// ABOUTME: Modern Lit-based Feed component with batched updates and performance optimizations
// ABOUTME: Uses efficient batching and flush strategies for optimal rendering performance

import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { guard } from "lit/directives/guard.js";
import { IllthornEvent } from "../../../events";
import type { GameTag } from "../../../parser/tag";
import type { FrontendSession as Session } from "../../../session/index";
import { debugFeed } from "../../../util/logger";
import type { ClientMessageEvent, CommandEchoEvent } from "../../command-bar/command-echo";
import "./message-block.lit";
import type { ContentItem } from "./message-block.lit";

@customElement("illthorn-feed-modernized-lit")
export class FeedModernized extends LitElement {
  static MIN_SCROLL_BUFFER = 300;
  static DEFAULT_SCROLLBACK_SIZE = 20000;
  static BATCH_UPDATE_DELAY = 50; // Accumulate batches for 50ms before rendering
  static IDLE_FLUSH_DELAY = 100; // Auto-flush when idle for 100ms
  static LARGE_FLUSH_THRESHOLD = 0.25; // Remove 25% when flushing

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
      display: block;
      height: 100%;
      width: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 0.5em;
      box-sizing: border-box;
      scrollbar-width: thin;
      scrollbar-color: var(--color-border) transparent;
      /* Performance optimizations */
      contain: layout style;
      will-change: scroll-position;
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

    .feed-scroll-sentinel {
      height: 0;
      overflow: hidden;
    }

    :host(.feed) {
      background: var(--color-background-primary);
      color: var(--color-text-primary);
    }


    :host([focused]) {
      border: 1px solid var(--color-focus);
    }

    /* Base content styling */
    .content {
      line-height: 1.6;
      word-wrap: break-word;
      white-space: pre-line;
    }
    
    /* Container content styling */
    .feed-container > * {
      line-height: 1.6;
    }
  `;

  @property({ type: Object })
  session?: Session;

  @property({ type: Boolean, reflect: true })
  focused = false;

  @state()
  private _allContent: Array<ContentItem> = [];

  @state()
  private _shouldAutoScroll = true;

  @state()
  private _maxScrollbackSize = FeedModernized.DEFAULT_SCROLLBACK_SIZE;

  private _hasSubscribedToEcho = false;
  private _hasSubscribedToClientMessages = false;
  private _flushTimeout: number | undefined;
  private _batchUpdateTimeout: number | undefined;
  private _idleFlushTimeout: number | undefined;
  private _pendingBatchItems: Array<ContentItem> = [];
  private _performanceStats = {
    totalAppends: 0,
    totalFlushes: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
  };

  async connectedCallback() {
    super.connectedCallback();
    this.classList.add("feed", "scroll");

    // Set up game element interaction listeners
    this.addEventListener("game-element-command", this._handleGameElementCommand);
    this.addEventListener("game-element-menu", this._handleGameElementMenu);
    this.addEventListener("game-element-execute", this._handleGameElementExecute);
    this.addEventListener("game-element-monster-click", this._handleMonsterClick);

    // Load saved scrollback size from settings
    if (window.Settings) {
      const savedSize = await window.Settings.get("ui.scrollback.size");
      if (savedSize && typeof savedSize === "number" && savedSize >= 100 && savedSize <= 50000) {
        this._maxScrollbackSize = savedSize;
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    // Remove game element interaction listeners
    this.removeEventListener("game-element-command", this._handleGameElementCommand);
    this.removeEventListener("game-element-menu", this._handleGameElementMenu);
    this.removeEventListener("game-element-execute", this._handleGameElementExecute);
    this.removeEventListener("game-element-monster-click", this._handleMonsterClick);

    // Clear flush timeout
    if (this._flushTimeout) {
      clearTimeout(this._flushTimeout);
    }
    // Clear batch update timeout
    if (this._batchUpdateTimeout) {
      clearTimeout(this._batchUpdateTimeout);
    }
    // Clear idle flush timeout
    if (this._idleFlushTimeout) {
      clearTimeout(this._idleFlushTimeout);
    }
    this.destroy();
  }

  /**
   * Check if user is manually scrolling (not at bottom)
   */
  get isScrolling(): boolean {
    const container = this.shadowRoot?.querySelector(".feed-container") as HTMLElement;
    if (!container) return false;

    // No content scrollable
    if (container.scrollHeight === container.clientHeight) return false;

    // Check the relative scroll offset from the bottom with buffer for precision
    return container.scrollHeight - container.scrollTop - container.clientHeight > FeedModernized.MIN_SCROLL_BUFFER;
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
    if (this._allContent.length === 0) return false;

    const lastItem = this._allContent[this._allContent.length - 1];
    if (lastItem.type === "tags") {
      return lastItem.data.some((tag) => tag.name === "prompt");
    }
    return false;
  }

  /**
   * Primary method: Append GameTag array directly to feed content
   * Uses batched updates for improved performance during rapid content addition
   */
  appendGameTags(tags: Array<GameTag>, immediate = false) {
    if (tags.length === 0) {
      return;
    }

    // Track performance metrics
    this._performanceStats.totalAppends++;

    const wasScrolling = this.isScrolling;
    const contentItem: ContentItem = { type: "tags", data: tags, timestamp: performance.now() };

    // Add to pending batch instead of immediately updating
    this._pendingBatchItems.push(contentItem);

    // Process immediately if requested (useful for tests)
    if (immediate) {
      this._processBatchUpdate(wasScrolling);
    } else {
      // Schedule batched update with idle detection
      this._scheduleBatchUpdate(wasScrolling);
      this._scheduleIdleFlush(wasScrolling);
    }
  }

  /**
   * Add a prompt GameTag to the feed
   */
  appendPrompt(prompt: GameTag, immediate = false) {
    this.appendGameTags([prompt], immediate);
  }

  /**
   * Scroll to the HEAD position (bottom)
   * Uses scrollIntoView on sentinel element for reliable scrolling with large content batches
   */
  scrollToNow() {
    // Find the sentinel element at the bottom of the feed
    const sentinel = this.shadowRoot?.querySelector(".feed-scroll-sentinel") as HTMLElement;
    if (sentinel) {
      try {
        // scrollIntoView automatically waits for layout to stabilize
        // behavior: 'auto' = instant scroll, block: 'end' = align to bottom
        sentinel.scrollIntoView({ behavior: "auto", block: "end" });
        this._shouldAutoScroll = true;
      } catch (error) {
        console.warn("Failed to scroll to sentinel:", error);
      }
    }
    return this;
  }

  /**
   * Schedule auto-scroll with proper timing using requestAnimationFrame
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
   * Schedule a batched update to improve performance during rapid content addition
   */
  private _scheduleBatchUpdate(wasScrolling: boolean) {
    // Clear any existing batch timeout
    if (this._batchUpdateTimeout) {
      return; // Batch is already scheduled
    }

    this._batchUpdateTimeout = window.setTimeout(() => {
      this._processBatchUpdate(wasScrolling);
      this._batchUpdateTimeout = undefined;
    }, FeedModernized.BATCH_UPDATE_DELAY);
  }

  /**
   * Schedule idle flush to process batches when no new content arrives
   */
  private _scheduleIdleFlush(wasScrolling: boolean) {
    // Clear any existing idle flush timeout
    if (this._idleFlushTimeout) {
      clearTimeout(this._idleFlushTimeout);
    }

    // Schedule idle flush - this gets reset every time new content arrives
    this._idleFlushTimeout = window.setTimeout(() => {
      if (this._pendingBatchItems.length > 0) {
        this._processBatchUpdate(wasScrolling);
      }
      this._idleFlushTimeout = undefined;
    }, FeedModernized.IDLE_FLUSH_DELAY);
  }

  /**
   * Process all pending batch items and update the UI
   */
  private _processBatchUpdate(wasScrolling: boolean) {
    if (this._pendingBatchItems.length === 0) {
      return;
    }

    const startTime = performance.now();

    // Clear any pending idle flush since we're processing now
    if (this._idleFlushTimeout) {
      clearTimeout(this._idleFlushTimeout);
      this._idleFlushTimeout = undefined;
    }

    // Efficiently append all pending items at once
    this._allContent.push(...this._pendingBatchItems);
    this._pendingBatchItems = [];

    // Schedule flush to manage memory if needed
    this._scheduleFlush();

    // Trigger single re-render for all batched items
    this.requestUpdate();

    // Schedule scroll if needed
    if (!wasScrolling && this._shouldAutoScroll) {
      this._scheduleAutoScroll();
    }

    // Update performance statistics
    const renderTime = performance.now() - startTime;
    this._performanceStats.lastRenderTime = renderTime;
    this._performanceStats.averageRenderTime = (this._performanceStats.averageRenderTime + renderTime) / 2;
  }

  /**
   * Remove old content to maintain scrollback buffer limit
   * Uses aggressive flushing strategy for better performance
   */
  flush() {
    if (this._allContent.length <= this._maxScrollbackSize) {
      return this; // No-op if under limit
    }

    // Track flush operations
    this._performanceStats.totalFlushes++;

    // Remove 25% of the scrollback size to create substantial buffer
    const removeCount = Math.floor(this._maxScrollbackSize * FeedModernized.LARGE_FLUSH_THRESHOLD);
    const targetSize = this._maxScrollbackSize - removeCount;
    const toRemove = this._allContent.length - targetSize;

    // Use splice for more efficient array modification
    this._allContent.splice(0, toRemove);

    return this;
  }

  /**
   * Debounced flush to avoid frequent array operations during rapid content addition
   */
  private _scheduleFlush() {
    if (this._flushTimeout) {
      clearTimeout(this._flushTimeout);
    }
    this._flushTimeout = window.setTimeout(() => {
      this.flush();
      this.requestUpdate();
      this._flushTimeout = undefined;
    }, 1000);
  }

  /**
   * Set scrollback buffer size and save to settings
   */
  async setScrollbackSize(size: number) {
    if (size < 100 || size > 50000) {
      throw new Error("Scrollback size must be between 100 and 50000");
    }

    this._maxScrollbackSize = size;

    // Save to settings
    if (window.Settings) {
      await window.Settings.set("ui.scrollback.size", size);
    }

    // Apply new limit immediately
    this.flush();
    this.requestUpdate();
  }

  /**
   * Handle scroll events to detect manual scrolling
   */
  private _handleVirtualScroll(e: Event) {
    const target = e.target as HTMLElement;
    if (!target) return;

    const { scrollHeight, scrollTop, clientHeight } = target;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - FeedModernized.MIN_SCROLL_BUFFER;
    this._shouldAutoScroll = isAtBottom;
  }

  /**
   * Clear all feed content
   */
  clear() {
    this._allContent = [];
    this._pendingBatchItems = [];

    // Clear any pending timeouts
    if (this._flushTimeout) {
      clearTimeout(this._flushTimeout);
      this._flushTimeout = undefined;
    }
    if (this._batchUpdateTimeout) {
      clearTimeout(this._batchUpdateTimeout);
      this._batchUpdateTimeout = undefined;
    }
    if (this._idleFlushTimeout) {
      clearTimeout(this._idleFlushTimeout);
      this._idleFlushTimeout = undefined;
    }

    // Reset performance stats
    this._performanceStats = {
      totalAppends: 0,
      totalFlushes: 0,
      lastRenderTime: 0,
      averageRenderTime: 0,
    };

    // Force immediate re-render and scroll to bottom
    this.requestUpdate();
    this.updateComplete.then(() => {
      this.scrollToNow();
    });

    return this;
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    // Subscribe to command echo events when session becomes available
    if (this.session?.bus && !this._hasSubscribedToEcho) {
      this.session.bus.subscribeEvent<CommandEchoEvent>(IllthornEvent.COMMAND_ECHO, this._handleCommandEcho.bind(this));
      this._hasSubscribedToEcho = true;
    }

    // Subscribe to client message events when session becomes available
    if (this.session?.bus && !this._hasSubscribedToClientMessages) {
      this.session.bus.subscribeEvent<ClientMessageEvent>(IllthornEvent.CLIENT_MESSAGE, this._handleClientMessage.bind(this));
      this._hasSubscribedToClientMessages = true;
    }

    // Auto-scroll when content is added
    if (changedProperties.has("_allContent")) {
      if (!this.isScrolling && this._shouldAutoScroll) {
        // Ensure DOM is ready, then scroll to bottom
        this.updateComplete.then(() => {
          this._scheduleAutoScroll();
        });
      }
    }
  }

  /**
   * Handle command echo events from the CLI component
   */
  private _handleCommandEcho(event: CustomEvent<CommandEchoEvent>) {
    const echoData = event.detail;
    const wasScrolling = this.isScrolling;

    // Track performance
    this._performanceStats.totalAppends++;

    // Add to pending batch for optimized updates
    const contentItem: ContentItem = { type: "echo", data: echoData, timestamp: performance.now() };
    this._pendingBatchItems.push(contentItem);

    // Schedule batched update with idle detection
    this._scheduleBatchUpdate(wasScrolling);
    this._scheduleIdleFlush(wasScrolling);
  }

  /**
   * Handle client message events for system output
   */
  private _handleClientMessage(event: CustomEvent<ClientMessageEvent>) {
    const clientData = event.detail;
    const wasScrolling = this.isScrolling;

    // Track performance
    this._performanceStats.totalAppends++;

    // Add to pending batch for optimized updates
    const contentItem: ContentItem = { type: "client", data: clientData, timestamp: performance.now() };
    this._pendingBatchItems.push(contentItem);

    // Schedule batched update with idle detection
    this._scheduleBatchUpdate(wasScrolling);
    this._scheduleIdleFlush(wasScrolling);
  }

  /**
   * Handle game command element click events
   */
  private _handleGameElementCommand = (e: Event) => {
    const event = e as CustomEvent;
    debugFeed("Game element command: %o", event.detail);
    if (this.session) {
      this.session.sendCommand(event.detail.command);
    }
  };

  /**
   * Handle game element execute events (click-to-execute)
   */
  private _handleGameElementExecute = (e: Event) => {
    const event = e as CustomEvent;
    debugFeed("Game element execute: %o", event.detail);
    if (this.session) {
      this.session.sendCommand(event.detail.command);
    }
  };

  /**
   * Handle game element context menu events
   */
  private _handleGameElementMenu = (e: Event) => {
    const event = e as CustomEvent;
    debugFeed("Game element menu: %o", event.detail);
    // TODO: Show context menu at event.detail.x, event.detail.y
    // Integration with menu system
  };

  /**
   * Handle monster click events
   */
  private _handleMonsterClick = (e: Event) => {
    const event = e as CustomEvent;
    debugFeed("Monster click: %o", event.detail);
    // TODO: Implement monster interaction (attack, look, etc.)
  };

  render() {
    return html`
      <div class="feed-container" @scroll=${this._handleVirtualScroll}>
        ${this._allContent.map((item, index) =>
          guard(
            [item.timestamp, index],
            () => html`
            <illthorn-message-block-lit
              .item=${item}
              .index=${index}
            ></illthorn-message-block-lit>
          `,
          ),
        )}
        <div class="feed-scroll-sentinel"></div>
      </div>
    `;
  }

  /**
   * Get current scrollback buffer size
   */
  get maxScrollbackSize(): number {
    return this._maxScrollbackSize;
  }

  /**
   * Get current number of items in feed
   */
  get currentItemCount(): number {
    return this._allContent.length;
  }

  /**
   * Get rendering statistics for performance monitoring
   */
  getRenderStats() {
    const totalItems = this._allContent.length;
    const pendingItems = this._pendingBatchItems.length;
    const tagItems = this._allContent.filter((item) => item.type === "tags").length;
    const commandEchoes = this._allContent.filter((item) => item.type === "echo").length;
    const clientMessages = this._allContent.filter((item) => item.type === "client").length;

    return {
      totalItems,
      pendingItems,
      tagItems,
      commandEchoes,
      clientMessages,
      maxScrollbackSize: this._maxScrollbackSize,
      ...this._performanceStats,
    };
  }

  /**
   * Get detailed performance metrics
   */
  getPerformanceMetrics() {
    return {
      ...this._performanceStats,
      currentBufferSize: this._allContent.length,
      pendingBatchSize: this._pendingBatchItems.length,
      maxBufferSize: this._maxScrollbackSize,
      bufferUtilization: (this._allContent.length / this._maxScrollbackSize) * 100,
    };
  }

  /**
   * Reset performance statistics
   */
  resetPerformanceStats() {
    this._performanceStats = {
      totalAppends: 0,
      totalFlushes: 0,
      lastRenderTime: 0,
      averageRenderTime: 0,
    };
  }

  /**
   * Force process any pending batch items (useful for testing)
   */
  flushPendingBatch() {
    if (this._pendingBatchItems.length > 0) {
      this._processBatchUpdate(false);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-feed-modernized-lit": FeedModernized;
  }
}
