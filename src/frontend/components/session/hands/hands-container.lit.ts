// ABOUTME: Smart container component managing hand metadata events and data flow
// ABOUTME: Subscribes to session events and passes hand content to presentational UI component
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { GameTag } from "../../../parser/tag";
import type { FrontendSession } from "../../../session/index";
import type { Bus } from "../../../util/bus";
import "./hands-ui.lit";
import type { HandsUI } from "./hands-ui.lit";

@customElement("illthorn-hands-container")
export class HandsContainer extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: Object })
  session?: FrontendSession;

  @state()
  private _leftContent = "None";

  @state()
  private _rightContent = "None";

  @state()
  private _spellContent = "None";

  private _eventHandlers: Array<{ event: string; handler: (event: CustomEvent<GameTag>) => void; bus: Bus }> = [];

  connectedCallback() {
    super.connectedCallback();
    this._setupEventListeners();
  }

  willUpdate(changedProperties: Map<string | number | symbol, unknown>) {
    super.willUpdate(changedProperties);

    if (changedProperties.has("session")) {
      this._setupEventListeners();
    }
  }

  private _setupEventListeners() {
    // Clean up existing event listeners
    this._cleanupEventListeners();

    if (!this.session?.bus) {
      return;
    }

    // Create handlers
    const leftHandler = ({ detail: hand }: CustomEvent<GameTag>) => {
      this._leftContent = hand.children?.[0]?.text || "None";
    };

    const rightHandler = ({ detail: hand }: CustomEvent<GameTag>) => {
      this._rightContent = hand.children?.[0]?.text || "None";
    };

    const spellHandler = ({ detail: hand }: CustomEvent<GameTag>) => {
      this._spellContent = hand.children?.[0]?.text || "None";
    };

    // Subscribe to events
    this.session.bus.subscribeEvent<GameTag>("metadata/left", leftHandler);
    this.session.bus.subscribeEvent<GameTag>("metadata/right", rightHandler);
    this.session.bus.subscribeEvent<GameTag>("metadata/spell", spellHandler);

    // Store handlers for cleanup
    this._eventHandlers.push(
      { event: "metadata/left", handler: leftHandler, bus: this.session.bus },
      { event: "metadata/right", handler: rightHandler, bus: this.session.bus },
      { event: "metadata/spell", handler: spellHandler, bus: this.session.bus },
    );
  }

  private _cleanupEventListeners() {
    this._eventHandlers.forEach(({ event, handler, bus }) => {
      if (bus?._ele) {
        bus._ele.removeEventListener(event, handler as EventListener);
      }
    });
    this._eventHandlers = [];
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._cleanupEventListeners();
  }

  /**
   * Get hands interface compatible with SessionUI
   * Provides access to individual hand UI components
   */
  getHands() {
    const handsUI = this.shadowRoot?.querySelector("illthorn-hands-ui") as HandsUI;
    return handsUI?.getHands() || { left: null, right: null, spell: null };
  }

  render() {
    return html`
      <illthorn-hands-ui
        leftContent=${this._leftContent}
        rightContent=${this._rightContent}
        spellContent=${this._spellContent}
      ></illthorn-hands-ui>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-hands-container": HandsContainer;
  }
}
