// ABOUTME: Lit-based App Root Component that replaces the imperative layout system from layout.ts
// ABOUTME: Manages the main grid layout with left actions pane, session display, and theme integration
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { IllthornEvent } from "../events";
import { Illthorn } from "../illthorn";
import type { FrontendSession } from "../session";
import "./sessions-menu.lit";
import "../session/ui.lit";

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
      grid-template-columns: var(--actions-width, 6em) 1fr;
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
      padding: 2em 1em 1em;
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

    illthorn-app-lit illthorn-session-ui-lit {
      display: grid !important;
      height: 100%;
      width: 100%;
    }
  `;

  // Manually adopt styles for Light DOM
  private _adoptStyles() {
    console.log("DEBUG: AppRoot _adoptStyles() called");
    // Create a style element for this component's styles
    if (!document.head.querySelector('style[data-lit-component="app-root"]')) {
      const style = document.createElement("style");
      style.setAttribute("data-lit-component", "app-root");
      style.textContent = AppRoot.styles.cssText;
      document.head.appendChild(style);
      console.log("DEBUG: AppRoot styles injected into head", style.textContent.substring(0, 100));
    } else {
      console.log("DEBUG: AppRoot styles already exist in head");
    }
  }

  @property({ type: Object })
  currentSession: FrontendSession | null = null;

  private _eventListenerSetup = false;

  connectedCallback() {
    super.connectedCallback();
    console.log("DEBUG: AppRoot connectedCallback() called");
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
      console.log("DEBUG: App received SESSION_FOCUS event for:", session.name);
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
    console.log("DEBUG: AppRoot handleSessionFocus called with:", session.name);
    console.log("DEBUG: AppRoot setting currentSession from", this.currentSession?.name || "null", "to", session.name);
    this.currentSession = session;
    document.title = session.name;
    console.log("DEBUG: AppRoot currentSession is now:", this.currentSession?.name);
    // Trigger re-render to update the template
    this.requestUpdate();
    // Call session focus after render completes
    this.updateComplete.then(() => {
      console.log("DEBUG: AppRoot calling session.onFocus() for:", session.name);
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
            <illthorn-session-ui-lit .session=${this.currentSession}></illthorn-session-ui-lit>
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
