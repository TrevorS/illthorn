// ABOUTME: Lit-based SessionUI component that renders complete session layout with HUD and main content areas
// ABOUTME: Declarative replacement for makeSessionUI factory function using Lit templates and reactive properties
import { css, html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import "../components/context.lit";
import type { Context } from "../components/context.lit";
import type { FrontendSession as Session } from "./index";
import "../components/session/compass.lit";
import "../components/session/room.lit";
import "../components/session/vitals/vitals.lit";
import type { Vitals } from "../components/session/vitals/vitals.lit";
import "../components/session/effects/effects.lit";
import { type Hand, makeHandLit } from "../components/session/hand.lit";
import "../components/session/hand.lit";
import "../components/session/panel.lit";
import "../components/session/streams.lit";
import type { Streams } from "../components/session/streams.lit";
import "../components/session/feed.lit";
import type { Feed } from "../components/session/feed.lit";
import "../components/session/prompt.lit";
import type { Prompt } from "../components/session/prompt.lit";
import "../components/session/cli.lit";
import type { CLI } from "../components/session/cli.lit";

export type SessionUI = {
  context: Context;
  cli: CLI;
  feed: Feed;
  prompt: Prompt;
  vitals: Vitals;
  streams: Streams;
  hands: { left: Hand | null; right: Hand | null; spell: Hand | null };
};

@customElement("illthorn-session-ui-lit")
export class UI extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }

    .context {
      display: block;
      height: 100%;
      width: 100%;
    }

    .hud {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: 200px;
      overflow-y: auto;
      z-index: 10;
    }

    .main {
      margin-left: 200px;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .hands {
      display: flex;
      background-color: var(--info);
      padding: 0.5em;
      gap: 0.5em;
    }

    .cli-wrapper {
      display: flex;
      align-items: center;
      background-color: var(--bg-color);
      border-top: 1px solid var(--info);
    }
  `;

  @property({ type: Object })
  session!: Session;

  @query("illthorn-context-lit")
  private _context!: Context;

  @query("illthorn-vitals-lit")
  private _vitals!: Vitals;

  @query("illthorn-streams-lit")
  private _streams!: Streams;

  @query("illthorn-feed-lit")
  private _feed!: Feed;

  @query("illthorn-prompt")
  private _prompt!: Prompt;

  @query("illthorn-cli-lit")
  private _cli!: CLI;

  private _leftHand?: Hand;
  private _rightHand?: Hand;
  private _spellHand?: Hand;

  firstUpdated() {
    if (this.session) {
      // Set up context styling to match original implementation
      this._context.classList.add("session");
      this._context.id = this.session.name;

      // Create hand components imperatively since they use factory function
      this._leftHand = makeHandLit(this.session, "left");
      this._rightHand = makeHandLit(this.session, "right");
      this._spellHand = makeHandLit(this.session, "spell");

      // Insert hands into the hands container
      const handsContainer = this.shadowRoot?.querySelector(".hands");
      if (handsContainer && this._leftHand && this._rightHand && this._spellHand) {
        handsContainer.appendChild(this._leftHand);
        handsContainer.appendChild(this._rightHand);
        handsContainer.appendChild(this._spellHand);
      }
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
        return self._context || (self.renderRoot?.querySelector("illthorn-context-lit") as Context) || null;
      },
      get cli() {
        return self._cli || (self.renderRoot?.querySelector("illthorn-cli-lit") as CLI) || null;
      },
      get feed() {
        return self._feed || (self.renderRoot?.querySelector("illthorn-feed-lit") as Feed) || null;
      },
      get prompt() {
        return self._prompt || (self.renderRoot?.querySelector("illthorn-prompt") as Prompt) || null;
      },
      get vitals() {
        return self._vitals || (self.renderRoot?.querySelector("illthorn-vitals-lit") as Vitals) || null;
      },
      get streams() {
        return self._streams || (self.renderRoot?.querySelector("illthorn-streams-lit") as Streams) || null;
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
    console.log("SessionUI render called, session:", this.session?.name || "none");

    if (!this.session) {
      console.log("SessionUI: No session provided, rendering fallback");
      return html`<div style="color: red; background: white; padding: 20px;">No session provided</div>`;
    }

    console.log("SessionUI: Rendering with session", this.session.name);
    return html`
      <illthorn-context-lit .session=${this.session} class="context">
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
          
          <illthorn-streams-lit></illthorn-streams-lit>
          
          <illthorn-feed-lit .session=${this.session}></illthorn-feed-lit>
          
          <div class="cli-wrapper">
            <illthorn-prompt .session=${this.session}></illthorn-prompt>
            <illthorn-cli-lit .session=${this.session}></illthorn-cli-lit>
          </div>
        </div>
      </illthorn-context-lit>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-session-ui-lit": UI;
  }
}
