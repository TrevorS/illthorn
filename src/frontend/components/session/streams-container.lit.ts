// ABOUTME: Smart container component for streams that handles session integration and business logic
// ABOUTME: Manages stream data state and coordinates with StreamsUI for presentation - now using BaseContainerComponent
import { css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { GameTag } from "../../parser/tag";
import type { FrontendSession as Session } from "../../session/index";
import { BaseContainerComponent } from "../mixins/base-container.lit";
import "./streams-ui.lit";

export interface StreamEntry {
  id: string;
  streamTag: GameTag;
  timestamp: Date;
  streamType: string;
}

@customElement("illthorn-streams-container")
export class StreamsContainer extends BaseContainerComponent {
  static styles = css`
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }
  `;

  @state()
  private _entries: Array<StreamEntry> = [];

  @state()
  private _streamFilters: Set<string> = new Set(["thoughts", "speech", "logon", "logoff", "death"]);

  // Deduplication state: track recent messages by stream type to prevent duplicates
  private _recentMessages: Map<string, Array<{ text: string; timestamp: number }>> = new Map();
  private static readonly DUPLICATE_WINDOW_MS = 200; // Consider messages within 200ms as potential duplicates

  // Available stream types
  private static readonly STREAM_TYPES = ["thoughts", "speech", "logon", "logoff", "death"] as const;

  protected onSessionReady(_session: Session): void {
    this._loadStreamFilters(); // Load saved filter settings when session becomes available
  }

  protected getStateToStore(): Record<string, unknown> {
    // StreamsContainer doesn't persist state - entries are ephemeral
    return {};
  }

  protected restoreState(_state: Record<string, unknown>): void {
    // StreamsContainer doesn't restore state - entries are ephemeral
    // Filters are loaded from Settings API in onSessionReady
  }

  protected getStorageKeyPrefix(): string {
    return "streams";
  }

  protected getSessionEventSubscriptions() {
    const subscriptions = [];

    // Subscribe to stream events for each stream type
    for (const streamType of StreamsContainer.STREAM_TYPES) {
      subscriptions.push({
        eventName: `metadata/stream/${streamType}`,
        handler: ({ detail: streamTag }: CustomEvent<GameTag>) => {
          this._handleStreamEntry(streamTag, streamType);
        },
      });
    }

    return subscriptions;
  }

  /**
   * Load stream filter settings from storage
   */
  private async _loadStreamFilters() {
    if (window.Settings) {
      const savedFilters = await window.Settings.get("ui.streams.filters");
      if (Array.isArray(savedFilters)) {
        // Validate that saved filters are valid stream types
        const validFilters = savedFilters.filter((filter) => StreamsContainer.STREAM_TYPES.includes(filter));
        this._streamFilters = new Set(validFilters);
      }
    }
  }

  private _handleStreamEntry(streamTag: GameTag, streamType: string) {
    // Check if this stream type is filtered out
    if (!this._streamFilters.has(streamType)) {
      return; // Skip filtered stream types
    }

    // Check for duplicate messages to prevent spam from game sending same content twice
    const textContent = this._extractTextFromStreamTag(streamTag);
    if (this._isDuplicateMessage(streamType, textContent)) {
      return; // Skip duplicate messages
    }

    // Process the GameTag exactly like the main feed does - pass it to streams-ui
    // which will use ComponentRenderer to render it properly
    const entry: StreamEntry = {
      id: `${streamType}-${Date.now()}-${Math.random()}`,
      streamTag: streamTag, // Pass the entire GameTag for proper rendering
      timestamp: new Date(),
      streamType,
    };

    // Add to entries array
    this._entries = [...this._entries, entry];

    // Limit entries to prevent memory issues (keep last 1000)
    if (this._entries.length > 1000) {
      this._entries = this._entries.slice(-1000);
    }
  }

  /**
   * Set visibility for a specific stream type
   */
  setStreamTypeVisibility(streamType: string, visible: boolean): void {
    if (!(StreamsContainer.STREAM_TYPES as readonly string[]).includes(streamType)) {
      return; // Invalid stream type
    }

    const newFilters = new Set(this._streamFilters);
    if (visible) {
      newFilters.add(streamType);
    } else {
      newFilters.delete(streamType);
    }
    this._streamFilters = newFilters;

    // Save to settings
    if (window.Settings) {
      const filterArray = Array.from(this._streamFilters);
      window.Settings.set("ui.streams.filters", filterArray);
    }
  }

  /**
   * Get whether a stream type is visible
   */
  getStreamTypeVisibility(streamType: string): boolean {
    return this._streamFilters.has(streamType);
  }

  /**
   * Get all available stream types
   */
  getAvailableStreamTypes(): readonly string[] {
    return StreamsContainer.STREAM_TYPES;
  }

  /**
   * Extract text content from a stream tag's children for deduplication comparison
   */
  private _extractTextFromStreamTag(streamTag: GameTag): string {
    const extractText = (tag: GameTag): string => {
      if (tag.name === ":text" && tag.text) {
        return tag.text;
      }
      return tag.children.map((child) => extractText(child)).join("");
    };

    return streamTag.children
      .map((child) => extractText(child))
      .join("")
      .trim();
  }

  /**
   * Check if a message is a duplicate of a recent message for the same stream type
   */
  private _isDuplicateMessage(streamType: string, textContent: string): boolean {
    if (!textContent) {
      return false; // Don't consider empty messages as duplicates
    }

    const now = Date.now();
    const recentForType = this._recentMessages.get(streamType) || [];

    // Clean up old messages outside the duplicate window
    const cleanedRecent = recentForType.filter((msg) => now - msg.timestamp <= StreamsContainer.DUPLICATE_WINDOW_MS);

    // Check if this text content already exists in recent messages
    const isDuplicate = cleanedRecent.some((msg) => msg.text === textContent);

    if (!isDuplicate) {
      // Add this message to recent messages
      cleanedRecent.push({ text: textContent, timestamp: now });
    }

    // Update the map with cleaned recent messages
    this._recentMessages.set(streamType, cleanedRecent);

    return isDuplicate;
  }

  private _handleClear = () => {
    this._entries = [];
    this._recentMessages.clear(); // Also clear deduplication cache
  };

  /**
   * Clear all stream entries
   */
  clearAllStreams(): void {
    this._entries = [];
    this._recentMessages.clear();
  }

  /**
   * Clear entries for a specific stream type
   */
  clearStreamType(streamType: string): void {
    if (!(StreamsContainer.STREAM_TYPES as readonly string[]).includes(streamType)) {
      return; // Invalid stream type
    }

    // Remove entries for the specified stream type
    this._entries = this._entries.filter((entry) => entry.streamType !== streamType);

    // Clear deduplication cache for this stream type
    this._recentMessages.delete(streamType);
  }

  render() {
    return html`
      <illthorn-streams-ui 
        .entries=${this._entries}
        @clear=${this._handleClear}>
      </illthorn-streams-ui>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-streams-container": StreamsContainer;
  }
}
