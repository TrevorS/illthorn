// ABOUTME: Lit-based prompt component for displaying game prompts from Gemstone IV
// ABOUTME: Subscribes to prompt events and updates displayed text content with server timing data
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { FrontendSession as Session } from "../../session/index";

@customElement("illthorn-prompt")
export class Prompt extends LitElement {
  static styles = css`
    :host {
      font-family: "MonoLisa", monospace;
      display: inline-block;
      text-align: right;
      font-size: 1.6em;
      position: relative;
      top: -0.1em;
    }
  `;

  @property({ type: Object })
  session?: Session;

  @state()
  private _promptText = "";

  private _eventListenerSetup = false;

  connectedCallback() {
    super.connectedCallback();
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has("session")) {
      if (this.session && !this._eventListenerSetup) {
        this.setupEventListeners();
        this._eventListenerSetup = true;
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._eventListenerSetup = false;
  }

  private setupEventListeners() {
    if (!this.session) {
      return;
    }

    this.session.bus.subscribeEvent<HTMLElement>("prompt", ({ detail: prompt }) => {
      //console.trace(prompt)
      const _time = prompt.getAttribute("time");
      // todo: handle server time offset
      this._promptText = prompt.textContent || "";
      this.requestUpdate();
    });
  }

  render() {
    return html`${this._promptText}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-prompt": Prompt;
  }
}
