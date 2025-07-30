// ABOUTME: Lit-based session button component for switching between active game sessions
// ABOUTME: Displays session name and numeric tab indicator with focus state management and click handling
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { IllthornEvent } from "../../events";
import { Illthorn } from "../../illthorn";
import type { FrontendSession as Session } from "../../session";
import { focusSession } from "../../session/helpers";
import { adoptLightDomStyles } from "../../util/light-dom-styles";

@customElement("illthorn-session-button")
export class SessionButton extends LitElement {
  // Use Light DOM to access document-level CSS custom properties
  createRenderRoot() {
    return this;
  }

  static styles = css`
    illthorn-session-button {
      display: block !important;
      width: 100%;
    }

    illthorn-session-button.action {
      -webkit-app-region: no-drag;
      border: 0;
      text-align: center;
      width: 100% !important;
      height: 4em;
      font-size: 1em;
      font-weight: bold;
      position: relative;
      border-radius: 4px;
      overflow: hidden;
      display: grid !important;
      place-items: center;
      opacity: 0.5;
      margin: 0.8em 0;
      cursor: pointer;
      background-color: transparent;
    }

    illthorn-session-button.action::before {
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

    illthorn-session-button.action.on {
      opacity: 1;
    }

    illthorn-session-button .session-name {
      font-size: 1.5em;
      position: relative;
    }

    illthorn-session-button .alt-numeric {
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

  // Manually adopt styles for Light DOM
  private _adoptStyles() {
    adoptLightDomStyles("session-button", SessionButton.styles);
  }

  @property({ type: Object })
  session?: Session;

  @property({ type: Boolean })
  active = false;

  @state()
  private _isActive = false;

  // Non-reactive property to avoid update scheduling conflicts
  private _tabNum = 0;

  private _eventListenerSetup = false;
  private _parentObserver?: MutationObserver;

  connectedCallback() {
    super.connectedCallback();
    this._adoptStyles();
    this.classList.add("action");
  }

  willUpdate(changedProperties: Map<string | number | symbol, unknown>) {
    super.willUpdate(changedProperties);

    if (changedProperties.has("active")) {
      // Update state immediately before render to avoid scheduling conflicts
      this._isActive = this.active;
    }
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has("session")) {
      if (this.session && !this._eventListenerSetup) {
        this.setupEventListeners();
        this._eventListenerSetup = true;
      }
    }

    if (changedProperties.has("active")) {
      // Apply CSS class after render completes
      this.classList.toggle("on", this._isActive);
    }
  }

  firstUpdated() {
    // Calculate tab number when first rendered to avoid update scheduling conflicts
    this.calculateTabNumber();

    // Set up observer to watch for changes in parent's children
    if (this.parentElement) {
      this._parentObserver = new MutationObserver(() => {
        this.calculateTabNumber();
      });
      this._parentObserver.observe(this.parentElement, {
        childList: true,
      });
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._eventListenerSetup = false;

    // Clean up parent observer
    if (this._parentObserver) {
      this._parentObserver.disconnect();
      this._parentObserver = undefined;
    }
  }

  private setupEventListeners() {
    if (!this.session) {
      return;
    }

    Illthorn.bus.subscribeEvent<Session>(IllthornEvent.SESSION_FOCUS, ({ detail: activeSession }) => {
      const newActiveState = this.session === activeSession;
      this._updateActiveState(newActiveState);
    });
  }

  private _updateActiveState(newActiveState: boolean) {
    // Update through the active property to trigger the Lit lifecycle
    this.active = newActiveState;
  }

  private calculateTabNumber() {
    const siblings = this.parentElement?.children;
    if (!siblings) {
      return;
    }

    const newTabNum = Array.from(siblings).indexOf(this) + 1;
    if (newTabNum !== this._tabNum) {
      this._tabNum = newTabNum;
      // Use nextTick to avoid update scheduling conflicts
      setTimeout(() => {
        if (this.isConnected && !this.isUpdatePending) {
          this.requestUpdate();
        }
      }, 0);
    }
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
