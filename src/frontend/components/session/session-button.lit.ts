// ABOUTME: Modern Lit session button component for switching between active game sessions
// ABOUTME: Uses Shadow DOM with internalized styling and reactive state management
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
      width: 100%;
      -webkit-app-region: no-drag;
      border: 0;
      text-align: center;
      height: 4em;
      font-size: 1em;
      font-weight: bold;
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      opacity: 0.5;
      margin: 0.8em 0;
      cursor: pointer;
      background-color: transparent;
    }

    :host([active]) {
      opacity: 1;
    }


    :host::before {
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

    .container {
      display: grid;
      place-items: center;
      width: 100%;
      height: 100%;
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

  @property({ type: Boolean, reflect: true })
  active = false;

  @state()
  private _tabNumber = 0;

  private _eventListenerSetup = false;
  private _parentObserver?: MutationObserver;

  // Computed getter for session name first character
  private get _sessionInitial(): string {
    return this.session?.name?.[0] || "";
  }

  // Computed getter for session name title
  private get _sessionTitle(): string {
    return this.session?.name || "";
  }

  connectedCallback() {
    super.connectedCallback();
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    // Handle session property changes
    if (changedProperties.has("session")) {
      if (this.session && !this._eventListenerSetup) {
        this._setupEventListeners();
        this._eventListenerSetup = true;
      }
    }
  }

  firstUpdated() {
    this._calculateTabNumber();
    this._setupParentObserver();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._cleanup();
  }

  private _setupEventListeners(): void {
    if (!this.session) {
      return;
    }

    Illthorn.bus.subscribeEvent<Session>(IllthornEvent.SESSION_FOCUS, ({ detail: activeSession }) => {
      this.active = this.session === activeSession;
    });
  }

  private _setupParentObserver(): void {
    if (!this.parentElement) {
      return;
    }

    this._parentObserver = new MutationObserver(() => {
      this._calculateTabNumber();
    });

    this._parentObserver.observe(this.parentElement, {
      childList: true,
    });
  }

  private _calculateTabNumber(): void {
    const siblings = this.parentElement?.children;
    if (!siblings) {
      this._tabNumber = 0;
      return;
    }

    const newTabNumber = Array.from(siblings).indexOf(this) + 1;
    if (newTabNumber !== this._tabNumber) {
      this._tabNumber = newTabNumber;
    }
  }

  private _cleanup(): void {
    this._eventListenerSetup = false;

    if (this._parentObserver) {
      this._parentObserver.disconnect();
      this._parentObserver = undefined;
    }
  }

  private _handleClick(_event: Event): void {
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
      <div class="container" @click=${this._handleClick}>
        <span class="session-name" title="${this._sessionTitle}">
          ${this._sessionInitial}
        </span>
        <span class="alt-numeric">
          ${this._tabNumber}
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
