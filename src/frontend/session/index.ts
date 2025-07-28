import { SessionButton } from "../components/session/session-button";
import { addHilites } from "../hilites/dom";
import { castToHTML, createPrompt } from "../parser/dom";
import { Parser } from "../parser/parser";
import { Bus } from "../util/bus";
import { debugRawInput, debugSession, safeStringify } from "../util/logger";
import { CommandHistory } from "./command-history";
import { dispatchMetadata } from "./helpers";
import { SessionMap } from "./map";
import { makeSessionUI, type SessionUI } from "./ui";

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
  constructor(readonly config: Illthorn.Session.Config) {
    this.parser = Parser.of();
    this.bus = new Bus();
    // this must be done last after all the other stuff
    this.ui = makeSessionUI(this);
    this.actionButton = new SessionButton(this);
    this.streams(true);
    SessionMap.set(this.name, this);
  }

  get name() {
    return this.config.name;
  }

  get port() {
    return this.config.port;
  }

  streams(on: boolean) {
    this.ui.context.classList.toggle("streams-on", on);
    this.ui.streams.scrollToNow();
    this.ui.feed.scrollToNow();
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

    if (streams.length) {
      streams.forEach((entry) => this.ui.streams.addEntry(entry));
    }

    if (frag.hasChildNodes() && frag.textContent?.trim() !== "") {
      this.ui.feed.appendParsed(frag);
    }

    if (!this.ui.feed.has_prompt() && prompt) {
      this.ui.feed.appendParsed(prompt);
    }
    if (metadata.length) {
      debugSession(`[${this.name}] Processing ${metadata.length} metadata tags: ${metadata.map((tag) => tag.name).join(", ")}`);
      metadata.forEach((tag) => dispatchMetadata(this, tag));
    }
  }

  handleMacro(macro: string) {
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
    this.ui.streams.scrollToNow();
    this.ui.feed.scrollToNow();
  }
}
