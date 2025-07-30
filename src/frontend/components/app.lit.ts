// ABOUTME: Lit-based App Root Component that provides the main application layout
// ABOUTME: Manages the main grid layout with left actions pane, session display, and theme integration
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { IllthornEvent } from "../events";
import { Illthorn } from "../illthorn";
import type { FrontendSession } from "../session";
import { adoptLightDomStyles } from "../util/light-dom-styles";
import { debugApp } from "../util/logger";
import "./sessions-menu.lit";
import "./session-layout.lit";

@customElement("illthorn-app-lit")
export class AppRoot extends LitElement {
  // Use Light DOM to access document-level CSS custom properties
  createRenderRoot() {
    return this;
  }

  static styles = css`
    illthorn-app-lit {
      display: grid;
      height: 100vh;
      grid-template-columns: var(--actions-width, 7em) 1fr;
      overflow: hidden;
      background-color: var(--main-bg-color, black);
      color: var(--text-color, white);
    }

    illthorn-app-lit #app-left-pane {
      display: block;
      height: 100vh;
    }

    illthorn-app-lit #actions {
      height: 100vh;
      background: var(--info);
      padding: 2em 0.75em 1em;
      -webkit-app-region: drag;
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    illthorn-app-lit illthorn-sessions-menu-lit {
      display: flex !important;
      flex-direction: column;
      flex: 1;
    }

    illthorn-app-lit #app-right-pane {
      display: block;
      height: 100vh;
      overflow: hidden;
    }

    illthorn-app-lit #current-context {
      display: block;
      height: 100%;
      overflow: hidden;
    }

    illthorn-app-lit illthorn-session-layout-lit {
      display: grid !important;
      height: 100%;
      width: 100%;
    }
  `;

  // Manually adopt styles for Light DOM
  private _adoptStyles() {
    adoptLightDomStyles("app-root", AppRoot.styles);
  }

  @property({ type: Object })
  currentSession: FrontendSession | null = null;

  private _eventListenerSetup = false;

  connectedCallback() {
    super.connectedCallback();
    this._adoptStyles();
    this.setupEventListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._eventListenerSetup = false;
  }

  private setupEventListeners() {
    if (this._eventListenerSetup) {
      return;
    }

    // Subscribe to session focus events
    Illthorn.bus.subscribeEvent<FrontendSession>(IllthornEvent.SESSION_FOCUS, ({ detail: session }) => {
      debugApp("App received SESSION_FOCUS event for: %s", session.name);
      this.handleSessionFocus(session);
    });

    this._eventListenerSetup = true;
  }

  updateSessionsList() {
    // Compatibility method for existing renderSessionsMenu() calls
    // The SessionsMenu component handles its own updates now
    // Since we're using Light DOM, use querySelector instead of shadowRoot
    const sessionsMenu = this.querySelector("illthorn-sessions-menu-lit") as HTMLElement & { refreshSessions?: () => void };
    sessionsMenu?.refreshSessions?.();
  }

  handleSessionFocus(session: FrontendSession) {
    this.currentSession = session;
    document.title = session.name;
    // Trigger re-render to update the template
    this.requestUpdate();
    // Call session focus after render completes
    this.updateComplete.then(() => {
      session.onFocus();
    });
  }

  render() {
    return html`
      <div id="app-left-pane">
        <div id="actions">
          <illthorn-sessions-menu-lit></illthorn-sessions-menu-lit>
        </div>
      </div>
      <div id="app-right-pane">
        <div id="current-context">
          ${
            this.currentSession
              ? html`
            <illthorn-session-layout-lit .session=${this.currentSession}></illthorn-session-layout-lit>
          `
              : html`
            <div style="padding: 2em; color: var(--text-color, white); text-align: center;">
              <h2>No Active Session</h2>
              <p>Connect to a Lich session to begin.</p>
              <p>Use <code>:c</code> command or start a Lich process with --detachable-client flag.</p>
            </div>
          `
          }
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-app-lit": AppRoot;
  }
}
