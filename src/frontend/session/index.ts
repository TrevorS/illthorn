import "../components/session/session-button.lit";
import type { SessionButton } from "../components/session/session-button.lit";
import "./ui.lit";
import { addHilites } from "../hilites/dom";
import { castToHTML, createPrompt } from "../parser/dom";
import { Parser } from "../parser/parser";
import { Bus } from "../util/bus";
import { debugRawInput, debugSession, safeStringify } from "../util/logger";
import { CommandHistory } from "./command-history";
import { dispatchMetadata } from "./helpers";
import { SessionMap } from "./map";
import type { SessionUI } from "./ui.lit";

export class FrontendSession {
  static async connect(config: Illthorn.Session.Config) {
    const session = new FrontendSession(config);
    await window.Session.connect(config, (_e, message: string) => session.onMessage(message));
    return session;
  }

  readonly parser: Parser;
  readonly bus: Bus;
  hasFocus: boolean = false;
  readonly history: CommandHistory = new CommandHistory(100);
  readonly actionButton: SessionButton;
  private _ui?: SessionUI;
  private _messageBuffer: Array<string> = [];

  constructor(readonly config: Illthorn.Session.Config) {
    this.parser = Parser.of();
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

  get ui(): SessionUI {
    return (
      this._ui || {
        context: document.body, // Fallback
        cli: null,
        feed: null,
        prompt: null,
        vitals: null,
        streams: null,
        hands: { left: null, right: null, spell: null },
      }
    );
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
    if (this.ui.context && this.ui.streams && this.ui.feed) {
      this.ui.context.classList.toggle("streams-on", on);
      this.ui.streams.scrollToNow();
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
    const { frag, metadata } = castToHTML(parsed);
    debugSession(`[${this.name}] Generated DOM fragment, found ${metadata.length} metadata tags`);
    const promptInfo = metadata.find((tag) => tag.name === "prompt");
    const prompt = promptInfo && createPrompt(promptInfo);

    // prompts are special, they are both metadata and rendered inline (sometimes)
    if (prompt) {
      this.bus.dispatchEvent("prompt", prompt);
    }
    await addHilites(frag);

    const streams = [...frag.querySelectorAll(".stream.thoughts")];

    if (streams.length && this.ui.streams) {
      streams.forEach((entry) => this.ui.streams.addEntry(entry));
    }

    if (frag.hasChildNodes() && frag.textContent?.trim() !== "") {
      if (this.ui.feed) {
        this.ui.feed.appendParsed(frag);
      }
    }

    if (this.ui.feed && !this.ui.feed.has_prompt() && prompt) {
      this.ui.feed.appendParsed(prompt);
    }
    if (metadata.length) {
      debugSession(`[${this.name}] Processing ${metadata.length} metadata tags: ${metadata.map((tag) => tag.name).join(", ")}`);
      metadata.forEach((tag) => dispatchMetadata(this, tag));
    }
  }

  handleMacro(macro: string) {
    if (!this.ui.cli?.input) {
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
      if (this.ui.streams && this.ui.feed) {
        this.ui.streams.scrollToNow();
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
