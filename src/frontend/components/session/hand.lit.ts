// ABOUTME: Lit-based hand component for displaying left/right hands and spell slot in Gemstone IV
// ABOUTME: Shows hand contents with emoji icons based on game metadata events
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { GameTag } from "../../parser/tag";
import type { FrontendSession as Session } from "../../session/index";

@customElement("illthorn-hand-lit")
export class HandLit extends LitElement {
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

  private _eventListenerSetup = false;

  connectedCallback() {
    super.connectedCallback();

    // Apply the CSS class for styling compatibility
    if (this.name) {
      this.classList.add(this.name);
    }
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has("session") || changedProperties.has("name")) {
      if (this.session && this.name && !this._eventListenerSetup) {
        this.setupEventListeners();
        this._eventListenerSetup = true;
      }
    }

    if (changedProperties.has("name")) {
      // Update class when name changes
      const oldName = changedProperties.get("name") as string;
      if (oldName) {
        this.classList.remove(oldName);
      }
      if (this.name) {
        this.classList.add(this.name);
      }
    }
  }

  private setupEventListeners() {
    if (!this.session || !this.name) {
      return;
    }

    this.session.bus.subscribeEvent<GameTag>(`metadata/${this.name}`, ({ detail: hand }) => {
      this._content = hand.children?.[0]?.text || "None";
      this.requestUpdate();
    });
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

export const makeHandLit = (session: Session, name: string): HandLit => {
  const hand = document.createElement("illthorn-hand-lit") as HandLit;
  hand.session = session;
  hand.name = name;
  return hand;
};

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-hand-lit": HandLit;
  }
}
