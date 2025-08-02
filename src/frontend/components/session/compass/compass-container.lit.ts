// ABOUTME: Smart container component that manages compass state via session events
// ABOUTME: Subscribes to metadata/compass events and passes activeDirs to UI component
import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { GameTag } from "../../../parser/tag";
import type { FrontendSession as Session } from "../../../session/index";
import "./compass-ui.lit";

@customElement("illthorn-compass-container")
export class CompassContainer extends LitElement {
  @property({ type: Object })
  session?: Session;

  @state()
  private _activeDirs: Array<string> = [];

  private _eventListenerSetup = false;

  connectedCallback() {
    super.connectedCallback();
    // Try to set up event listeners immediately if session is already available
    if (this.session && !this._eventListenerSetup) {
      this.setupEventListeners();
      this._eventListenerSetup = true;
    }
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has("session")) {
      if (this.session && !this._eventListenerSetup) {
        this.setupEventListeners();
        this._eventListenerSetup = true;
      }
    }
  }

  private setupEventListeners() {
    if (!this.session || !this.session.bus) return;

    this.session.bus.subscribeEvent<GameTag>("metadata/compass", ({ detail: compass }) => {
      if (compass?.children) {
        this._activeDirs = compass.children.map(({ attrs }) => attrs.value).filter((value): value is string => typeof value === "string");
      } else {
        this._activeDirs = [];
      }
      this.requestUpdate();
    });
  }

  render() {
    return html`<illthorn-compass-ui .activeDirs=${this._activeDirs}></illthorn-compass-ui>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-compass-container": CompassContainer;
  }
}
