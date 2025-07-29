// ABOUTME: Lit-based session button component for switching between active game sessions
// ABOUTME: Displays session name and numeric tab indicator with focus state management and click handling
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { IllthornEvent } from "../../events";
import { Illthorn } from "../../illthorn";
import type { FrontendSession as Session } from "../../session";
import { focusSession } from "../../session/helpers";

@customElement("illthorn-session-button")
export class SessionButton extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    :host(.action) {
      -webkit-app-region: no-drag;
      border: 0;
      text-align: center;
      width: 100%;
      height: 4em;
      font-size: 1em;
      font-weight: bold;
      position: relative;
      border-radius: 4px;
      overflow: hidden;
      display: grid;
      place-items: center;
      opacity: 0.5;
      margin: 0.8em 0;
      cursor: pointer;
    }

    :host(.action)::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      padding: 20px;
      box-shadow: 0 0 0 85em rgba(0, 0, 0, 0.4);
      border-radius: 50px;
      margin-left: -1.3em;
      margin-top: -1.4em;
    }

    :host(.action.on) {
      opacity: 1;
    }

    .session-name {
      font-size: 1.5em;
      position: relative;
    }

    .alt-numeric {
      font-size: 0.9em;
      position: absolute;
      top: 0;
      left: 0;
      width: 2em;
      height: 2em;
      line-height: 2em;
      text-align: center;
      margin: -0.45em 0 0 -0.45em;
    }
  `;

  @property({ type: Object })
  session?: Session;

  @state()
  private _isActive = false;

  @state()
  private _tabNum = 0;

  private _eventListenerSetup = false;

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("action");
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has("session")) {
      if (this.session && !this._eventListenerSetup) {
        this.setupEventListeners();
        this._eventListenerSetup = true;
      }
    }

    // Calculate tab number based on position in parent
    this.calculateTabNumber();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._eventListenerSetup = false;
  }

  private setupEventListeners() {
    if (!this.session) {
      return;
    }

    Illthorn.bus.subscribeEvent<Session>(IllthornEvent.SESSION_FOCUS, ({ detail: activeSession }) => {
      this._isActive = this.session === activeSession;
      this.classList.toggle("on", this._isActive);
      this.requestUpdate();
    });
  }

  private calculateTabNumber() {
    const siblings = this.parentElement?.children;
    if (!siblings) {
      return;
    }

    this._tabNum = Array.from(siblings).indexOf(this) + 1;
  }

  private handleClick(_e: Event) {
    if (!this.session || this.session.hasFocus) {
      return;
    }

    focusSession(this.session);
  }

  render() {
    if (!this.session) {
      return html``;
    }

    return html`
      <div @click=${this.handleClick}>
        <span class="session-name" title="${this.session.name}">
          ${this.session.name[0]}
        </span>
        <span class="alt-numeric">
          ${this._tabNum}
        </span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-session-button": SessionButton;
  }
}
