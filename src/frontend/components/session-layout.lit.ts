// ABOUTME: Lit-based SessionUI component that renders complete session layout with HUD and main content areas
// ABOUTME: Declarative replacement for makeSessionUI factory function using Lit templates and reactive properties
import { css, html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import type { FrontendSession as Session } from "../session/index";
import "./session/compass.lit";
import "./session/room.lit";
import "./session/vitals/vitals.lit";
import type { Vitals } from "./session/vitals/vitals.lit";
import "./session/injuries/injuries.lit";
import type { InjuriesLit } from "./session/injuries/injuries.lit";
import "./session/effects/effects.lit";
import "./session/hands/hands.lit";
import type { Hand } from "./session/hands/hand.lit";
import type { Hands } from "./session/hands/hands.lit";
import "./session/panel.lit";
import "./session/streams.lit";
import type { Streams } from "./session/streams.lit";
import "./session/feed/feed.lit";
import type { Feed } from "./session/feed/feed.lit";
import "./session/prompt.lit";
import type { Prompt } from "./session/prompt.lit";
import "./command-bar/cli.lit";
import type { CLI } from "./command-bar/cli.lit";

export type SessionUI = {
  context: HTMLElement;
  cli: CLI;
  feed: Feed;
  prompt: Prompt;
  vitals: Vitals;
  injuries: InjuriesLit;
  streams: Streams;
  hands: { left: Hand | null; right: Hand | null; spell: Hand | null };
};

@customElement("illthorn-session-layout-lit")
export class SessionLayout extends LitElement {
  // Use Shadow DOM with CSS custom property inheritance
  static styles = css`
    :host {
      display: grid !important;
      height: 100vh;
      width: 100%;
      max-width: 100%;
      grid-template-columns: var(--hud-width, 14em) 1fr;
      overflow: hidden;
    }

    :host(.no-hud) {
      grid-template-columns: 0 1fr;
    }

    :host(.no-hud) .hud {
      visibility: hidden;
    }

    .hud {
      border-right: 1px solid var(--color-border);
      overflow: hidden;
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
      background-color: var(--color-surface);
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
      width: 100%;
      min-width: 0;
      overflow: hidden;
    }

    :host(.streams-on) .main {
      grid-template-rows: auto var(--stream-height, 8em) 1fr auto;
    }

    .streams {
      overflow: hidden;
      width: 100%;
      background-color: var(--streams-background, var(--color-surface, #2a2a2a));
      border-top: 1px solid var(--color-border, #444444);
      border-bottom: 1px solid var(--color-border, #444444);
      height: var(--stream-height, 8em);
      max-height: var(--stream-height, 8em);
      display: flex;
      align-items: stretch;
    }

    .feed-wrapper {
      overflow: hidden;
      width: 100%;
      min-width: 0;
    }

    .cli-wrapper {
      background-color: var(--color-surface);
      display: grid;
      grid-template-columns: 3em 1fr 22px;
      grid-gap: 0 0.25em;
      padding: 1em 0.5em;
      align-items: center;
    }

    .cli-wrapper illthorn-prompt {
      font-family: "MonoLisa", monospace;
      display: flex;
      align-items: center;
      text-align: left;
      font-size: 1.6em;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding-top: 2px;
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

  // Component references using @query decorators
  @query("illthorn-vitals-lit")
  private _vitals?: Vitals;

  @query("illthorn-injuries-lit")
  private _injuries?: InjuriesLit;

  @query("illthorn-streams-lit")
  private _streams?: Streams;

  @query("illthorn-feed-lit")
  private _feed?: Feed;

  @query("illthorn-prompt")
  private _prompt?: Prompt;

  @query("illthorn-cli-lit")
  private _cli?: CLI;

  @query("illthorn-hands-lit")
  private _hands?: Hands;

  // Promise that resolves when components are fully initialized and ready to use
  private _initializationPromise: Promise<void>;
  private _resolveInitialization!: () => void;

  firstUpdated() {
    if (this.session) {
      // Set up host styling to match original implementation - this is where CSS classes get applied
      this.classList.add("session");
      this.id = this.session.name;
    }

    // Always resolve the initialization promise, even if no session yet
    this._resolveInitialization();
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
        return self._cli || null;
      },
      get feed() {
        return self._feed || null;
      },
      get prompt() {
        return self._prompt || null;
      },
      get vitals() {
        return self._vitals || null;
      },
      get injuries() {
        return self._injuries || null;
      },
      get streams() {
        return self._streams || null;
      },
      get hands() {
        if (self._hands) {
          return self._hands.getHands();
        }
        return { left: null, right: null, spell: null };
      },
    };
  }

  render() {
    if (!this.session) {
      return html`<div style="color: red; background: white; padding: 20px;">
        No session provided
      </div>`;
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

        <illthorn-panel title="injuries" .open=${true}>
          <illthorn-injuries-lit .session=${this.session}></illthorn-injuries-lit>
        </illthorn-panel>

        <illthorn-panel title="active spells" .open=${true}>
          <illthorn-effects-lit .session=${this.session} name="Active Spells">
          </illthorn-effects-lit>
        </illthorn-panel>
      </div>

      <div class="main">
        <illthorn-hands-lit .session=${this.session}></illthorn-hands-lit>

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
