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
import type { SessionUI, UI } from "./ui.lit";

export class FrontendSession {
  static async connect(config: Illthorn.Session.Config) {
    const session = new FrontendSession(config);
    await window.Session.connect(config, (_e, message: string) => session.onMessage(message));
    return session;
  }

  readonly parser: Parser;
  readonly ui: SessionUI;
  readonly bus: Bus;
  hasFocus: boolean = false;
  readonly history: CommandHistory = new CommandHistory(100);
  readonly actionButton: SessionButton;
  readonly _sessionUIComponent: UI;

  constructor(readonly config: Illthorn.Session.Config) {
    this.parser = Parser.of();
    this.bus = new Bus();

    // Create SessionUI Lit component
    this._sessionUIComponent = document.createElement("illthorn-session-ui-lit") as UI;
    this._sessionUIComponent.session = this;

    // Get the SessionUI interface - components will be available after initialization
    this.ui = this._sessionUIComponent.getSessionUI();

    this.actionButton = document.createElement("illthorn-session-button") as SessionButton;
    this.actionButton.session = this;

    // Initialize streams in the background - this will work when components are ready
    this._ensureInitialization();

    SessionMap.set(this.name, this);
  }

  private _ensureInitialization() {
    // Use a more resilient approach that works with the existing application architecture
    // The streams call will be deferred until components are available
    setTimeout(() => this.streams(true), 0);
  }

  get name() {
    return this.config.name;
  }

  get port() {
    return this.config.port;
  }

  streams(on: boolean) {
    try {
      // Check if components are available before trying to use them
      if (this.ui.context && this.ui.streams && this.ui.feed) {
        this.ui.context.classList.toggle("streams-on", on);
        this.ui.streams.scrollToNow();
        this.ui.feed.scrollToNow();
      } else {
        // Components not ready yet, retry after a short delay
        setTimeout(() => this.streams(on), 10);
      }
    } catch (error) {
      // If there's an error accessing components, retry later
      console.warn("Error accessing UI components, retrying:", error);
      setTimeout(() => this.streams(on), 50);
    }
  }

  async sendCommand(command: string) {
    await window.Session.sendCommand(this.config, command);
  }

  async onMessage(incoming: string) {
    debugRawInput(`[${this.name}] Raw input (${incoming.length} chars): ${safeStringify(incoming, 200)}`);
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

    if (frag.hasChildNodes() && frag.textContent?.trim() !== "" && this.ui.feed) {
      this.ui.feed.appendParsed(frag);
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
      console.warn("CLI not available for handleMacro");
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
      // Ensure components are available before trying to scroll
      if (this.ui.streams && this.ui.feed) {
        this.ui.streams.scrollToNow();
        this.ui.feed.scrollToNow();
      }
      // If components aren't ready, that's ok - this will be called again when they are
    } catch (error) {
      console.warn("Error during onFocus:", error);
    }
  }
}
