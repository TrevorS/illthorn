// ABOUTME: Lit-based App Root Component that provides the main application layout
// ABOUTME: Manages the main grid layout with left actions pane, session display, and theme integration
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { IllthornEvent } from "../events";
import { Illthorn } from "../illthorn";
import type { FrontendSession } from "../session";
import { debugApp } from "../util/logger";
import "./sessions-menu.lit";
import "./session-layout.lit";

@customElement("illthorn-app-lit")
export class AppRoot extends LitElement {
  static styles = css`
    :host {
      display: grid;
      height: 100vh;
      width: 100vw;
      max-width: 100vw;
      grid-template-columns: var(--actions-width, 5em) 1fr;
      overflow: hidden;
      background-color: var(--color-background-primary, black);
      color: var(--color-text-primary, white);
      transition: grid-template-columns 0.2s ease-in-out;
    }

    :host(.no-sessions) {
      grid-template-columns: 0 1fr;
    }

    :host(.no-sessions) #app-left-pane {
      visibility: hidden;
      overflow: hidden;
    }

    #app-left-pane {
      display: block;
      height: 100vh;
    }

    #actions {
      height: 100vh;
      background: var(--color-surface);
      padding: 1em 0.5em 1em;
      -webkit-app-region: drag;
      display: flex;
      flex-direction: column;
    }

    illthorn-sessions-menu-lit {
      display: flex !important;
      flex-direction: column;
      flex: 1;
    }

    #app-right-pane {
      display: block;
      height: 100vh;
      width: 100%;
      min-width: 0;
      overflow: hidden;
    }

    #current-context {
      display: block;
      height: 100%;
      width: 100%;
      min-width: 0;
      overflow: hidden;
    }

    illthorn-session-layout-lit {
      display: grid !important;
      height: 100%;
      width: 100%;
      min-width: 0;
    }
  `;

  @property({ type: Object })
  currentSession: FrontendSession | null = null;

  private _eventListenerSetup = false;

  async connectedCallback() {
    super.connectedCallback();

    // Load saved sessions visibility state
    if (window.Settings) {
      const savedVisible = await window.Settings.get("ui.sessions.visible");
      if (savedVisible !== undefined) {
        this.classList.toggle("no-sessions", !savedVisible);
      }
    }

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

  /**
   * Public method to toggle sessions visibility
   */
  toggleSessions(visible: boolean) {
    this.classList.toggle("no-sessions", !visible);

    // Save to settings
    if (window.Settings) {
      window.Settings.set("ui.sessions.visible", visible);
    }
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
            <div style="padding: 2em; color: var(--color-text-primary, white); text-align: center;">
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
