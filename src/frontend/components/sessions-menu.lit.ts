// ABOUTME: Reactive Sessions Menu Lit component that manages session buttons display and interactions
// ABOUTME: Replaces imperative DOM manipulation with reactive properties and event handling
import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { IllthornEvent } from "../events";
import { Illthorn } from "../illthorn";
import type { FrontendSession } from "../session";
import { SessionMap } from "../session/map";
import { adoptLightDomStyles } from "../util/light-dom-styles";
import "./session/session-button.lit";

@customElement("illthorn-sessions-menu-lit")
export class SessionsMenu extends LitElement {
  // Use Light DOM to access document-level CSS custom properties
  createRenderRoot() {
    return this;
  }

  static styles = css`
    illthorn-sessions-menu-lit {
      display: flex !important;
      flex-direction: column;
      gap: 0.5em;
      padding: 0.5em;
      min-height: 4em;
      width: 100%;
    }

    illthorn-sessions-menu-lit .sessions-container {
      display: flex;
      flex-direction: column;
      gap: 0.5em;
      width: 100%;
    }

    illthorn-sessions-menu-lit .no-sessions {
      color: var(--text-color, white);
      opacity: 0.7;
      text-align: center;
      font-style: italic;
      padding: 1em;
      font-size: 0.8em;
    }

    illthorn-sessions-menu-lit illthorn-session-button {
      display: block !important;
      width: 100%;
    }
  `;

  // Manually adopt styles for Light DOM
  private _adoptStyles() {
    adoptLightDomStyles("sessions-menu", SessionsMenu.styles);
  }

  @state()
  private _sessions: Array<FrontendSession> = [];

  @state()
  private _activeSession: FrontendSession | null = null;

  private _eventListenerSetup = false;
  private _sessionMapObserver: (() => void) | null = null;

  connectedCallback() {
    super.connectedCallback();
    this._adoptStyles();
    this.setupEventListeners();
    this.initializeSessions();
    this.setupSessionMapWatcher();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._eventListenerSetup = false;
    if (this._sessionMapObserver) {
      this._sessionMapObserver();
      this._sessionMapObserver = null;
    }
  }

  private setupEventListeners() {
    if (this._eventListenerSetup) {
      return;
    }

    // Subscribe to session focus events
    Illthorn.bus.subscribeEvent<FrontendSession>(IllthornEvent.SESSION_FOCUS, ({ detail: session }) => {
      this.handleSessionFocus(session);
    });

    // Subscribe to new session events
    Illthorn.bus.subscribeEvent<FrontendSession>(IllthornEvent.SESSION_NEW, () => {
      this.refreshSessions();
    });

    this._eventListenerSetup = true;
  }

  private initializeSessions() {
    this._sessions = Array.from(SessionMap.values()).sort((a, b) => a.port - b.port);
    this._activeSession = this._sessions.find((session) => session.hasFocus) || null;
  }

  private setupSessionMapWatcher() {
    // Set up a simple polling mechanism to watch for SessionMap changes
    // This is necessary because Map doesn't have native reactivity
    let lastSize = SessionMap.size;
    let lastSessionsSnapshot = new Set(SessionMap.keys());

    const checkForChanges = () => {
      const currentSize = SessionMap.size;
      const currentSessions = new Set(SessionMap.keys());

      // Check if size changed or session names changed
      const sizeChanged = currentSize !== lastSize;
      const sessionsChanged =
        currentSessions.size !== lastSessionsSnapshot.size ||
        [...currentSessions].some((key) => !lastSessionsSnapshot.has(key)) ||
        [...lastSessionsSnapshot].some((key) => !currentSessions.has(key));

      if (sizeChanged || sessionsChanged) {
        this.refreshSessions();
        lastSize = currentSize;
        lastSessionsSnapshot = new Set(currentSessions);
      }
    };

    // Check every 100ms for session changes
    const intervalId = setInterval(checkForChanges, 100);

    this._sessionMapObserver = () => {
      clearInterval(intervalId);
    };
  }

  refreshSessions() {
    this._sessions = Array.from(SessionMap.values()).sort((a, b) => a.port - b.port);
    this._activeSession = this._sessions.find((session) => session.hasFocus) || null;
    this.requestUpdate();
  }

  handleSessionFocus(session: FrontendSession) {
    this._activeSession = session;
    // Also refresh sessions in case this session isn't in our list yet
    this.refreshSessions();
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);
    // Note: Session buttons now handle their own "on" class via the active property
    // No need for manual class manipulation here
  }

  render() {
    if (this._sessions.length === 0) {
      return html`
        <div class="no-sessions" style="background: red; color: white; padding: 10px;">
          No active sessions<br/>
          <small>Use :c to connect</small>
        </div>
      `;
    }

    return html`
      <div class="sessions-container">
        ${this._sessions.map(
          (session) => html`
          <illthorn-session-button
            .session=${session}
            .active=${session === this._activeSession}
          ></illthorn-session-button>
        `,
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-sessions-menu-lit": SessionsMenu;
  }
}
