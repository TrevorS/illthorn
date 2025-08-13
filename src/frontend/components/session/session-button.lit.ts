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
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      margin: 0.4em 0;
      -webkit-app-region: no-drag;
    }

    .session-button-container {
      position: relative;
      width: 48px;
      height: 48px;
      border: 2px solid var(--color-border);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: transparent;
    }

    .session-button {
      position: relative;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: none;
      background-color: color-mix(in srgb, var(--color-background-primary) 60%, transparent);
      color: var(--color-text-primary);
      font-size: 1em;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.5;
      transition: opacity 0.2s ease;
    }

    :host([active]) .session-button {
      opacity: 1;
    }

    .session-button:hover {
      opacity: 0.8;
    }

    .session-initial {
      position: relative;
      z-index: 2;
    }

    .session-number {
      position: absolute;
      top: 4px;
      left: 4px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: var(--color-text-secondary);
      color: var(--color-background-primary);
      font-size: 0.6em;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
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
      <div class="session-button-container">
        <button 
          class="session-button" 
          @click=${this._handleClick}
          title="${this._sessionTitle}"
        >
          <span class="session-initial">
            ${this._sessionInitial}
          </span>
        </button>
        <span class="session-number">
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
