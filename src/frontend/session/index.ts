import "../components/session/session-button.lit";
import type { SessionButton } from "../components/session/session-button.lit";
import "../components/session-layout.lit";
import { CommandHistory } from "../components/command-bar/command-history";
import type { SessionUI } from "../components/session-layout.lit";
import { ComponentRenderer } from "../parser/component-renderer";
import { SaxophoneParser } from "../parser/saxophone-parser";
import { type GameTag, makeTag } from "../parser/tag";
import { Bus } from "../util/bus";
import { debugRawInput, debugSession, safeStringify } from "../util/logger";
import { dispatchMetadata } from "./helpers";
import { SessionMap } from "./map";

export class FrontendSession {
  static async connect(config: Illthorn.Session.Config) {
    const session = new FrontendSession(config);
    await window.Session.connect(config, (_e, message: string) => session.onMessage(message));
    return session;
  }

  readonly parser: SaxophoneParser;
  readonly bus: Bus;
  readonly renderer: ComponentRenderer = new ComponentRenderer();
  hasFocus: boolean = false;
  readonly history: CommandHistory = new CommandHistory(100);
  readonly actionButton: SessionButton;
  private _ui?: SessionUI;
  private _messageBuffer: Array<string> = [];

  constructor(readonly config: Illthorn.Session.Config) {
    this.parser = new SaxophoneParser();
    this.bus = new Bus();

    this.actionButton = document.createElement("illthorn-session-button") as SessionButton;
    this.actionButton.session = this;

    // Wait for UI initialization before allowing streams to be called
    this._ensureInitialization();

    SessionMap.set(this.name, this);
  }

  /**
   * Called by the UI component when it becomes available
   */
  setUI(ui: SessionUI) {
    this._ui = ui;
    // Process any buffered messages now that UI is available
    setTimeout(() => this._processBufferedMessages(), 0);
  }

  get ui(): SessionUI | null {
    return this._ui || null;
  }

  private _ensureInitialization() {
    // Enable streams after a brief delay to allow component setup
    setTimeout(() => this.streams(true), 0);
  }

  get name() {
    return this.config.name;
  }

  get port() {
    return this.config.port;
  }

  streams(on: boolean) {
    // Components should be available since we wait for initialization
    if (this.ui?.context && this.ui?.feed) {
      this.ui.context.classList.toggle("streams-on", on);
      this.ui.feed.scrollToNow();
    }
  }

  async sendCommand(command: string) {
    await window.Session.sendCommand(this.config, command);
  }

  async onMessage(incoming: string) {
    debugRawInput(`[${this.name}] Raw input (${incoming.length} chars): ${safeStringify(incoming, 200)}`);

    // If UI is not available yet, buffer the message for later processing
    if (!this._ui) {
      this._messageBuffer.push(incoming);
      return;
    }

    const parsed = this.parser.parse(incoming);
    debugSession(`[${this.name}] Parsed ${parsed.length} tags from input`);

    // Extract metadata using ComponentRenderer instead of DOM conversion
    const metadata = this.renderer.extractMetadata(parsed);
    debugSession(`[${this.name}] Extracted ${metadata.length} metadata tags directly from GameTags`);

    // Handle prompt metadata and dispatch
    const promptInfo = metadata.find((tag) => tag.name === "prompt");
    if (promptInfo) {
      // Create prompt GameTag for event dispatch
      const promptTag = makeTag("prompt");
      promptTag.attrs = promptInfo.attrs;

      // Extract text from prompt children if main text is empty
      let promptText = promptInfo.text;
      if (!promptText && promptInfo.children.length > 0) {
        // Find first text child and use its text content
        const textChild = promptInfo.children.find((child) => child.name === ":text");
        promptText = textChild?.text || "";
        debugSession(`[${this.name}] Extracted prompt text from children: "${promptText}"`);
      } else if (promptText) {
        debugSession(`[${this.name}] Using direct prompt text: "${promptText}"`);
      }
      promptTag.text = promptText;

      this.bus.dispatchEvent("prompt", promptTag);
    }

    // Dispatch metadata events for individual components
    // Deduplicate stream events by name and id to prevent duplicate entries
    const seenStreamEvents = new Set<string>();

    for (const metaTag of metadata) {
      if (metaTag.name !== "prompt") {
        // prompt is handled separately above
        const eventName = `metadata/${metaTag.name}/${metaTag.attrs.id || metaTag.attrs.name || ""}`.replace(/\/$/, "");

        // Deduplicate stream events
        if (metaTag.name === "stream") {
          const streamKey = `${metaTag.name}:${metaTag.attrs.id}`;
          if (seenStreamEvents.has(streamKey)) {
            debugSession(`[${this.name}] Skipping duplicate stream event: ${eventName}`);
            continue;
          }
          seenStreamEvents.add(streamKey);
        }

        this.bus.dispatchEvent(eventName, metaTag);
        debugSession(`[${this.name}] Dispatched metadata event: ${eventName}`);
      }
    }

    // Filter content tags for rendering (exclude metadata)
    const contentTags = parsed.filter((tag) => !metadata.includes(tag));

    // Check if streams should also go to main feed when panel is closed
    const streamsVisible = this.ui?.context?.classList.contains("streams-on");
    if (!streamsVisible) {
      // Streams panel is closed - add stream content to main feed
      const streamTags = metadata.filter((tag) => tag.name === "stream" && tag.attrs.id === "thoughts");
      contentTags.push(...streamTags);
      debugSession(`[${this.name}] Added ${streamTags.length} stream tags to main feed (streams panel closed)`);
    }

    // Stream handling is now handled by streams-container via bus events

    // Render main content using modern component system
    if (contentTags.length > 0) {
      if (this.ui?.feed && "appendGameTags" in this.ui.feed) {
        // Modern FeedModernized component
        (this.ui.feed as { appendGameTags: (tags: Array<GameTag>) => void }).appendGameTags(contentTags);
      } else if (this.ui?.feed) {
        // Fallback for legacy Feed - this should be removed after migration
        console.warn("Using legacy Feed component - consider migrating to FeedModernized");
      }
    }

    // Handle separate prompt rendering if needed
    if (this.ui?.feed && !this.ui.feed.has_prompt() && promptInfo) {
      if ("appendPrompt" in this.ui.feed) {
        (this.ui.feed as { appendPrompt: (prompt: GameTag) => void }).appendPrompt(promptInfo);
      }
    }

    // Process metadata for other systems (vitals, injuries, etc.)
    if (metadata.length) {
      debugSession(`[${this.name}] Processing ${metadata.length} metadata tags: ${metadata.map((tag) => tag.name).join(", ")}`);
      metadata.forEach((tag) => dispatchMetadata(this, tag));
    }
  }

  handleMacro(macro: string) {
    if (!this.ui?.cli?.input) {
      return;
    }

    const cliInput = this.ui.cli.input;
    const replacement = macro.indexOf("?");

    if (!~replacement) {
      return macro
        .trim()
        .split(/\r|\n/g)
        .map((cmd) => cmd.trim())
        .filter((cmd) => cmd.length)
        .forEach((cmd) => this.sendCommand(cmd));
    }
    cliInput.value = macro;
    cliInput.focus();
    cliInput.setSelectionRange(replacement - 1, replacement + "?".length);
  }

  async onFocus() {
    try {
      if (this.ui?.feed) {
        this.ui.feed.scrollToNow();
      }
    } catch (_error) {
      // Silently handle errors during focus
    }
  }

  async _processBufferedMessages() {
    if (this._messageBuffer.length === 0) return;

    const messages = [...this._messageBuffer];
    this._messageBuffer = []; // Clear buffer first to avoid recursion

    for (const message of messages) {
      await this.onMessage(message);
    }
  }
}
