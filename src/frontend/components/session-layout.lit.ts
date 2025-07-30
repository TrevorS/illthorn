// ABOUTME: Lit-based SessionUI component that renders complete session layout with HUD and main content areas
// ABOUTME: Declarative replacement for makeSessionUI factory function using Lit templates and reactive properties
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { FrontendSession as Session } from "../session/index";
import "./session/compass.lit";
import "./session/room.lit";
import "./session/vitals/vitals.lit";
import type { Vitals } from "./session/vitals/vitals.lit";
import "./session/effects/effects.lit";
import { type Hand, makeHandLit } from "./session/hand.lit";
import "./session/hand.lit";
import "./session/panel.lit";
import "./session/streams.lit";
import type { Streams } from "./session/streams.lit";
import "./session/feed.lit";
import type { Feed } from "./session/feed.lit";
import "./session/prompt.lit";
import type { Prompt } from "./session/prompt.lit";
import "./session/cli.lit";
import type { CLI } from "./session/cli.lit";

export type SessionUI = {
  context: HTMLElement;
  cli: CLI;
  feed: Feed;
  prompt: Prompt;
  vitals: Vitals;
  streams: Streams;
  hands: { left: Hand | null; right: Hand | null; spell: Hand | null };
};

@customElement("illthorn-session-layout-lit")
export class SessionLayout extends LitElement {
  // Use Light DOM to access document-level CSS custom properties
  createRenderRoot() {
    return this;
  }
  static styles = css`
    illthorn-session-layout-lit {
      display: grid !important;
      height: 100vh;
      width: 100%;
      grid-template-columns: var(--hud-width, 14em) 1fr;
      overflow: hidden;
    }

    illthorn-session-layout-lit.no-hud {
      grid-template-columns: 0 1fr;
    }

    illthorn-session-layout-lit.no-hud .hud {
      visibility: hidden;
    }

    .hud {
      border-right: 1px solid var(--info);
    }

    .main {
      /* Main content area styling */
    }

    .hud illthorn-panel {
      font-size: 12px;
      position: relative;
      resize: vertical;
    }

    .hud illthorn-panel:not(:first-child) {
      padding-top: 1em;
    }

    .hud summary {
      margin: 0;
      padding: 0.5em;
      text-transform: uppercase;
      text-align: center;
      background-color: var(--info);
      font-weight: bold;
    }

    .hud summary:focus {
      outline: 0;
    }

    .hud summary:hover {
      cursor: pointer;
    }

    .main {
      display: grid;
      grid-template-rows: auto auto 1fr auto;
      max-height: 100vh;
    }

    :host(.streams-on) .main {
      grid-template-rows: auto var(--stream-height, 4em) 1fr auto;
    }

    .hands {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 2em;
      max-width: 90%;
      margin: 0 auto;
      padding: 0 2em;
      -webkit-app-region: drag;
    }

    .streams {
      /* Streams area - height controlled by grid-template-rows */
    }

    .feed-wrapper {
      /* Feed takes remaining space in grid */
      overflow: hidden;
    }

    .cli-wrapper {
      background-color: var(--info);
      display: grid;
      grid-template-columns: 4em 1fr 22px;
      grid-gap: 0 0.5em;
      padding: 1em 0.5em;
      align-items: center;
    }

    .cli-wrapper illthorn-prompt {
      font-family: "MonoLisa", monospace;
      display: inline-block;
      text-align: right;
      font-size: 1.6em;
      position: relative;
      top: -0.1em;
    }

    illthorn-cli-lit {
      position: relative;
      display: flex;
      align-items: center;
    }

    illthorn-cli-lit input {
      font-family: "MonoLisa", monospace;
      left: 0;
      top: 0;
      border: none;
      width: 100%;
      padding: 0.5em;
      color: #fff;
      font-size: 1em;
      background-color: rgba(255, 255, 255, 0.1);
      z-index: 1;
    }

    illthorn-cli-lit input:focus {
      outline: none;
    }

    illthorn-cli-lit input#cli-suggestions {
      background-color: rgba(0, 0, 0, 0.2);
    }

    .timers {
      grid-column: 1 / -1;
      align-self: start;
    }

    .timer-bar {
      height: 3px;
      /* The bar maxes out, visually, at 20s timers */
      width: calc(var(--steps) * 5%);
    }

    .timer-bar.go {
      animation: roundtime var(--duration) steps(var(--steps)) forwards;
    }

    .round-time-current {
      background: var(--danger, red);
    }

    .cast-time-current {
      background: var(--gentle-warn, lightgreen);
    }

    @keyframes roundtime {
      to {
        transform: scaleX(0);
      }
    }

    button.ui-help-button {
      display: inline-block;
      padding: 0;
      border: 0;
      overflow: hidden;
      text-indent: -9999px;
      background-color: rgba(255, 255, 255, 0.33);
      width: 22px;
      height: 22px;
      cursor: pointer;
      mask: url(./svg/icon-help.svg) no-repeat 50% 50%;
      -webkit-mask: url(./svg/icon-help.svg) no-repeat 50% 50%;
      mask-size: contain;
      -webkit-mask-size: contain;
    }

    button.ui-help-button:hover {
      background-color: rgba(255, 255, 255, 0.66);
    }
  `;

  // Manually adopt styles for Light DOM
  private _adoptStyles() {
    // Create a style element for this component's styles
    if (!document.head.querySelector('style[data-lit-component="session-layout"]')) {
      const style = document.createElement("style");
      style.setAttribute("data-lit-component", "session-layout");
      style.textContent = SessionLayout.styles.cssText;
      document.head.appendChild(style);
    }
  }

  private _session?: Session;

  @property({ type: Object })
  get session(): Session {
    return this._session as Session;
  }

  set session(value: Session) {
    if (this._session === value) return;
    this._session = value;
    this.requestUpdate("session");

    // Notify session that UI is now available
    if (value) {
      value.setUI(this.getSessionUI());
    }
  }

  constructor() {
    super();
    // Set up initialization promise that will be resolved in firstUpdated()
    this._initializationPromise = new Promise<void>((resolve) => {
      this._resolveInitialization = resolve;
    });
  }

  /**
   * Wait for component initialization to complete
   * Returns a promise that resolves when all child components are ready to use
   */
  waitForInitialization(): Promise<void> {
    // If component is never attached to DOM, resolve immediately to avoid blocking
    if (!this.isConnected) {
      return Promise.resolve();
    }
    return this._initializationPromise;
  }

  // Component references - manually assigned in _queryComponents()
  private _vitals?: Vitals;
  private _streams?: Streams;
  private _feed?: Feed;
  private _prompt?: Prompt;
  private _cli?: CLI;

  // Promise that resolves when components are fully initialized and ready to use
  private _initializationPromise: Promise<void>;
  private _resolveInitialization!: () => void;

  private _leftHand?: Hand;
  private _rightHand?: Hand;
  private _spellHand?: Hand;

  firstUpdated() {
    this._adoptStyles();

    if (this.session) {
      // Set up host styling to match original implementation - this is where CSS classes get applied
      this.classList.add("session");
      this.id = this.session.name;

      // Query components immediately - they should be available after firstUpdated
      this._queryComponents();
    }

    // Always resolve the initialization promise, even if no session yet
    this._resolveInitialization();
  }

  private _queryComponents() {
    // Manually query for components since @query doesn't work with Light DOM
    this._feed = this.querySelector("illthorn-feed-lit") as Feed;
    this._vitals = this.querySelector("illthorn-vitals-lit") as Vitals;
    this._streams = this.querySelector("illthorn-streams-lit") as Streams;
    this._cli = this.querySelector("illthorn-cli-lit") as CLI;
    this._prompt = this.querySelector("illthorn-prompt") as Prompt;

    // Create hand components imperatively since they use factory function
    this._leftHand = makeHandLit(this.session, "left");
    this._rightHand = makeHandLit(this.session, "right");
    this._spellHand = makeHandLit(this.session, "spell");

    // Insert hands into the hands container
    // Since we're using Light DOM, query from this element directly
    const handsContainer = this.querySelector(".hands");
    if (handsContainer && this._leftHand && this._rightHand && this._spellHand) {
      handsContainer.appendChild(this._leftHand);
      handsContainer.appendChild(this._rightHand);
      handsContainer.appendChild(this._spellHand);
    }
  }

  /**
   * Get the SessionUI interface compatible object with component references
   */
  getSessionUI(): SessionUI {
    // Create a proxy object that dynamically resolves components when accessed
    // This handles the case where components aren't available yet during construction
    const self = this;
    return {
      get context() {
        // The context is now the host element itself (this component) where CSS classes are applied
        return self as HTMLElement;
      },
      get cli() {
        if (self._cli) return self._cli;
        if (self.isConnected) {
          const cli = self.querySelector("illthorn-cli-lit") as CLI;
          if (cli) {
            self._cli = cli;
            return cli;
          }
        }
        return null;
      },
      get feed() {
        // Try to use cached component first, then query if component is attached to DOM
        if (self._feed) {
          return self._feed;
        }

        // Only query if component is actually connected to DOM
        if (self.isConnected) {
          const feed = self.querySelector("illthorn-feed-lit") as Feed;
          if (feed) {
            self._feed = feed; // Cache for future use
            return feed;
          }
        }

        return null;
      },
      get prompt() {
        if (self._prompt) return self._prompt;
        if (self.isConnected) {
          const prompt = self.querySelector("illthorn-prompt") as Prompt;
          if (prompt) {
            self._prompt = prompt;
            return prompt;
          }
        }
        return null;
      },
      get vitals() {
        if (self._vitals) return self._vitals;
        if (self.isConnected) {
          const vitals = self.querySelector("illthorn-vitals-lit") as Vitals;
          if (vitals) {
            self._vitals = vitals;
            return vitals;
          }
        }
        return null;
      },
      get streams() {
        if (self._streams) return self._streams;
        if (self.isConnected) {
          const streams = self.querySelector("illthorn-streams-lit") as Streams;
          if (streams) {
            self._streams = streams;
            return streams;
          }
        }
        return null;
      },
      hands: {
        get left() {
          return self._leftHand || null;
        },
        get right() {
          return self._rightHand || null;
        },
        get spell() {
          return self._spellHand || null;
        },
      },
    };
  }

  render() {
    if (!this.session) {
      return html`<div style="color: red; background: white; padding: 20px;">No session provided</div>`;
    }
    return html`
      <div class="hud">
        <illthorn-panel title="room" .open=${true}>
          <illthorn-room-lit .session=${this.session}></illthorn-room-lit>
          <illthorn-compass .session=${this.session}></illthorn-compass>
        </illthorn-panel>
        
        <illthorn-panel title="vitals" .open=${true}>
          <illthorn-vitals-lit .session=${this.session}></illthorn-vitals-lit>
        </illthorn-panel>
        
        <illthorn-panel title="active spells" .open=${true}>
          <illthorn-effects-lit 
            .session=${this.session} 
            name="Active Spells">
          </illthorn-effects-lit>
        </illthorn-panel>
      </div>

      <div class="main">
        <div class="hands">
          <!-- Hands will be inserted here via firstUpdated -->
        </div>
        
        <div class="streams">
          <illthorn-streams-lit .session=${this.session}></illthorn-streams-lit>
        </div>
        
        <div class="feed-wrapper">
          <illthorn-feed-lit .session=${this.session}></illthorn-feed-lit>
        </div>
        
        <div class="cli-wrapper">
          <div class="timers">
            <!-- Timer bars will be managed by the CLI component -->
          </div>
          <illthorn-prompt .session=${this.session}></illthorn-prompt>
          <illthorn-cli-lit .session=${this.session}></illthorn-cli-lit>
          <button class="ui-help-button" title="Help">?</button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-session-layout-lit": SessionLayout;
  }
}
