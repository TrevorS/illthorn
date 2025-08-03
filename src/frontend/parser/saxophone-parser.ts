// ABOUTME: Saxophone-based XML parser implementation for improved performance
// ABOUTME: Event-driven streaming parser replacing custom character-by-character parsing

import Saxophone from "saxophone";
import { debugParser } from "../util/logger";
import type { GameTag } from "./tag";
import { makeTag, normalizeTagName, TagState } from "./tag";
import { parseAttrs } from "./tag/attributes";

// Internal types for saxophone event handlers
interface SaxophoneTag {
  name: string;
  attrs: string;
  isSelfClosing?: boolean;
}

interface SaxophoneTextNode {
  contents: string;
}

/**
 * Saxophone-based XML parser for game text processing
 * Uses event-driven streaming for better performance and memory usage
 */
export class SaxophoneParser {
  private saxophone: Saxophone;
  private tagStack: Array<GameTag> = [];
  private completed: Array<GameTag> = [];

  // Stream state tracking (matches Lich's @current_stream and @in_stream)
  private currentStream: string | null = null;
  private inStream: boolean = false;

  constructor() {
    this.saxophone = new Saxophone();
    this.setupEventHandlers();
  }

  /**
   * Parse game XML text into GameTag objects
   */
  parse(text: string): GameTag[] {
    try {
      // Reset tag parsing state for new parse operation
      // NOTE: Do NOT reset stream state (currentStream, inStream) - it persists across messages
      this.tagStack.length = 0;
      this.completed.length = 0;

      // Preprocess text like the original parser
      const preprocessed = this.prepareForParse(text);

      // Handle empty/whitespace input
      if (!preprocessed.trim()) {
        return [];
      }

      // Create a new saxophone instance for each parse to avoid "write after end" errors
      const parser = new Saxophone();
      this.setupEventHandlersForParser(parser);

      // Parse the XML using saxophone (fragments work fine)
      parser.parse(preprocessed);

      // Close any remaining open collector tags
      this.closeOpenCollectorTags();

      // Return completed tags (copy to avoid external mutation)
      return this.completed.slice();
    } catch (error) {
      // If saxophone fails, attempt basic error recovery
      return this.recoverFromError(text, error);
    }
  }

  /**
   * Reset parser state
   */
  reset(): void {
    this.tagStack.length = 0;
    this.completed.length = 0;
    this.currentStream = null;
    this.inStream = false;
  }

  /**
   * Check if all tags are closed
   */
  get isClosed(): boolean {
    return this.tagStack.length === 0;
  }

  /**
   * Preprocess text like the original parser does
   * Handles pushBold/popBold conversion and removes \r characters
   */
  private prepareForParse(text: string): string {
    return text.replaceAll("<pushBold/>", "<b>").replaceAll("<popBold/>", "</b>").replaceAll("\r", "");
  }

  /**
   * Set up saxophone event handlers for XML parsing (legacy method)
   */
  private setupEventHandlers(): void {
    this.setupEventHandlersForParser(this.saxophone);
  }

  /**
   * Set up saxophone event handlers for a specific parser instance
   */
  private setupEventHandlersForParser(parser: Saxophone): void {
    // Handle opening tags
    parser.on("tagopen", (tag) => {
      try {
        this.handleTagOpen(tag);
      } catch (error) {
        this.handleError(error);
      }
    });

    // Handle closing tags
    parser.on("tagclose", (tag) => {
      try {
        this.handleTagClose(tag);
      } catch (error) {
        this.handleError(error);
      }
    });

    // Handle text content
    parser.on("text", (text) => {
      try {
        this.handleTextContent(text);
      } catch (error) {
        this.handleError(error);
      }
    });

    // Handle parsing errors
    parser.on("error", (error) => {
      this.handleError(error);
    });
  }

  /**
   * Handle tag opening events from saxophone
   */
  private handleTagOpen(saxTag: SaxophoneTag): void {
    const normalizedName = normalizeTagName(saxTag.name);

    // Handle pushStream to start stream content collection
    if (saxTag.name === "pushStream") {
      const attrs = saxTag.attrs?.trim() ? parseAttrs(saxTag.attrs.trim()) : {};
      this.currentStream = (attrs.id as string) || null;
      this.inStream = true;
      // Don't create a tag for pushStream - it's just a stream control directive
      return;
    }

    // Handle popStream in case it comes through as self-closing tag
    if (saxTag.name === "popStream") {
      // Close the current stream tag if it exists
      if (this.currentStream) {
        const streamTag = this.completed.find((t) => t.name === "stream" && t.attrs.id === this.currentStream);
        if (streamTag) {
          streamTag.state = TagState.CLOSED;
        }
      }

      this.currentStream = null;
      this.inStream = false;
      // Don't create a tag for popStream - it's just a stream control directive
      return;
    }

    // Special handling for tags that should remain open to collect content
    // This matches the original parser's behavior on line 122-123
    const shouldStayOpen = ["style", "stream", "b", "output"].includes(normalizedName);

    // Close any open collector tags when encountering any new tag
    // This ensures collector tags only collect content until the next element
    this.closeOpenCollectorTags();

    const gameTag = makeTag(normalizedName, saxTag.name);

    // Parse attributes - saxophone gives us a string, not an object
    if (saxTag.attrs?.trim()) {
      gameTag.attrs = parseAttrs(saxTag.attrs.trim());
    }

    // Handle self-closing vs opening tags, but respect game-specific collector behavior
    // In the original parser, collector tags like style/stream/b/output always stay open
    // even when marked as self-closing in the XML - this is game-specific behavior
    if (saxTag.isSelfClosing && !shouldStayOpen) {
      gameTag.state = TagState.CLOSED;
      this.appendCompletedTag(gameTag);
    } else {
      // Add to tag stack (collector tags stay open even if self-closing, others will be closed later)
      this.tagStack.push(gameTag);
    }
  }

  /**
   * Handle tag closing events from saxophone
   */
  private handleTagClose(saxTag: { name: string }): void {
    const normalizedName = normalizeTagName(saxTag.name);

    // Handle popStream to end stream content collection
    if (saxTag.name === "popStream") {
      // Close the current stream tag if it exists
      if (this.currentStream) {
        const streamTag = this.completed.find((t) => t.name === "stream" && t.attrs.id === this.currentStream);
        if (streamTag) {
          streamTag.state = TagState.CLOSED;
        }
      }

      this.currentStream = null;
      this.inStream = false;
      // Don't create a tag for popStream - it's just a stream control directive
      return;
    }

    // Find the matching open tag in the stack
    let tagIndex = -1;
    for (let i = this.tagStack.length - 1; i >= 0; i--) {
      if (this.tagStack[i].name === normalizedName) {
        tagIndex = i;
        break;
      }
    }

    if (tagIndex === -1) {
      // No matching open tag - create a closed tag directly
      const closedTag = makeTag(normalizedName, saxTag.name);
      closedTag.state = TagState.CLOSED;
      this.appendCompletedTag(closedTag);
      return;
    }

    // Close the tag and all nested tags
    const closedTag = this.tagStack[tagIndex];
    closedTag.state = TagState.CLOSED;

    // Remove from stack
    this.tagStack.splice(tagIndex, 1);

    // Add to appropriate location
    this.appendCompletedTag(closedTag);
  }

  /**
   * Handle text content between tags
   */
  private handleTextContent(text: SaxophoneTextNode | string): void {
    // Saxophone passes an object with a contents property
    const textStr = typeof text === "object" && text.contents ? text.contents : String(text || "");

    // Create text nodes for ALL content to match original parser behavior
    // Original parser doesn't filter out whitespace-only text
    if (textStr.length > 0) {
      const textTag = makeTag(":text");
      textTag.text = textStr;
      textTag.state = TagState.CLOSED;
      this.appendCompletedTag(textTag);
    }
  }

  /**
   * Add a completed tag to the appropriate location
   */
  private appendCompletedTag(tag: GameTag): void {
    // If we're inside a stream, collect content into a stream tag instead of main output
    if (this.inStream && this.currentStream) {
      this.collectStreamContent(tag);
      return;
    }

    if (this.tagStack.length === 0) {
      // No parent, add to root level
      this.completed.push(tag);
    } else {
      // Has parent, add to parent's children
      const parent = this.tagStack[this.tagStack.length - 1];
      parent.children.push(tag);
    }
  }

  /**
   * Collect content into a stream tag for later processing
   */
  private collectStreamContent(tag: GameTag): void {
    // Find or create a stream tag for this stream type
    let streamTag = this.completed.find((t) => t.name === "stream" && t.attrs.id === this.currentStream);

    if (!streamTag) {
      // Create new stream tag to collect content
      streamTag = makeTag("stream");
      streamTag.attrs = { id: this.currentStream };
      streamTag.state = TagState.OPEN; // Keep it open to collect more content
      this.completed.push(streamTag);
    }

    // Add content to the stream tag
    streamTag.children.push(tag);
  }

  /**
   * Close open collector tags (style, stream, b, output)
   * This implements the original parser's behavior of auto-closing these tags
   */
  private closeOpenCollectorTags(): void {
    const collectorTags = ["style", "stream", "b", "output"];

    // Close all open collector tags from the end of the stack
    while (this.tagStack.length > 0) {
      const lastTag = this.tagStack[this.tagStack.length - 1];
      if (collectorTags.includes(lastTag.name)) {
        // Close this collector tag
        lastTag.state = TagState.CLOSED;
        const closedTag = this.tagStack.pop();
        if (!closedTag) {
          return;
        }
        this.appendCompletedTag(closedTag);
      } else {
        // Not a collector tag, leave it on the stack
        break;
      }
    }
  }

  /**
   * Handle parsing errors with basic recovery
   */
  private handleError(error: Error): void {
    debugParser("Saxophone parser error: %s", error.message);

    // For now, just continue - more sophisticated error recovery can be added later
  }

  /**
   * Attempt to recover from saxophone parsing failures
   * Could fall back to simpler parsing or return partial results
   */
  private recoverFromError(originalText: string, error: Error): GameTag[] {
    debugParser("SaxophoneParser failed to parse XML: %s", error.message);
    debugParser("Original text: %s", originalText);

    // For now, return empty array - in production this could try:
    // 1. Falling back to the original parser
    // 2. Attempting to parse individual lines
    // 3. Creating error GameTags with the unparsed text

    return [];
  }
}
