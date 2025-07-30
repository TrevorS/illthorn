// ABOUTME: Lit-based hand component for displaying left/right hands and spell slot in Gemstone IV
// ABOUTME: Shows hand contents with emoji icons based on game metadata events
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { GameTag } from "../../parser/tag";
import type { FrontendSession as Session } from "../../session/index";

@customElement("illthorn-hand-lit")
export class Hand extends LitElement {
  static styles = css`
    :host {
      padding: 0 1em;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      -webkit-app-region: no-drag;
      min-width: 0; /* Allow flex shrinking */
    }

    .hand-icon {
      display: inline-block;
      margin-right: 0.5em;
      font-size: var(--icon-size, 1em);
      flex-shrink: 0;
    }

    .hand-content {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 8em;
    }

  `;

  @property({ type: Object })
  session?: Session;

  @property({ type: String })
  name = "";

  @state()
  private _content = "None";

  private _currentEventKey?: string;
  private _eventHandler?: (event: CustomEvent<GameTag>) => void;
  private _currentBus?: { _ele: { removeEventListener: (type: string, listener: EventListener) => void } };

  connectedCallback() {
    super.connectedCallback();
    this._updateCssClass();
  }

  willUpdate(changedProperties: Map<string | number | symbol, unknown>) {
    super.willUpdate(changedProperties);

    // Handle CSS class updates when name changes
    if (changedProperties.has("name")) {
      this._updateCssClass(changedProperties.get("name") as string);
    }

    // Handle event subscription changes when session or name changes
    if (changedProperties.has("session") || changedProperties.has("name")) {
      this._updateEventSubscription();
    }
  }

  private _updateCssClass(oldName?: string) {
    if (oldName) {
      this.classList.remove(oldName);
    }
    if (this.name) {
      this.classList.add(this.name);
    }
  }

  private _updateEventSubscription() {
    // Unsubscribe from previous event if it exists (use stored bus reference)
    if (this._currentEventKey && this._eventHandler && this._currentBus) {
      this._currentBus._ele.removeEventListener(this._currentEventKey, this._eventHandler as EventListener);
      this._currentEventKey = undefined;
      this._eventHandler = undefined;
      this._currentBus = undefined;
    }

    // Subscribe to new event if session and name are available
    if (this.session?.bus && this.name) {
      this._currentEventKey = `metadata/${this.name}`;
      this._currentBus = this.session.bus;
      this._eventHandler = ({ detail: hand }) => {
        this._content = hand.children?.[0]?.text || "None";
      };
      this.session.bus.subscribeEvent<GameTag>(this._currentEventKey, this._eventHandler);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up event subscription when component is removed
    if (this._currentEventKey && this._eventHandler && this._currentBus) {
      this._currentBus._ele.removeEventListener(this._currentEventKey, this._eventHandler as EventListener);
      this._currentEventKey = undefined;
      this._eventHandler = undefined;
      this._currentBus = undefined;
    }
  }

  private getHandIcon(): string {
    return this.name === "spell" ? "🪄" : "✋";
  }

  render() {
    return html`
      <span class="hand-icon">${this.getHandIcon()}</span>
      <span class="hand-content">${this._content}</span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-hand-lit": Hand;
  }
}
