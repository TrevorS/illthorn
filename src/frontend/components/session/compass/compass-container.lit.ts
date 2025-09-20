// ABOUTME: Smart container component that manages compass state via session events
// ABOUTME: Subscribes to metadata/compass events and passes activeDirs to UI component
import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { GameTag } from "../../../parser/tag";
import type { FrontendSession as Session } from "../../../session/index";
import { SessionStateMixin } from "../../mixins/session-state-mixin";
import "./compass-ui.lit";

@customElement("illthorn-compass-container")
export class CompassContainer extends SessionStateMixin(LitElement) {
  @property({ type: Object })
  session?: Session;

  @state()
  private _activeDirs: Array<string> = [];

  private _eventListenerSetup = false;

  protected getStateToStore(): Record<string, unknown> {
    return {
      activeDirs: this._activeDirs,
    };
  }

  protected restoreState(state: Record<string, unknown>): void {
    this._activeDirs = (state.activeDirs as Array<string>) || [];
  }

  protected getStorageKeyPrefix(): string {
    return "compass";
  }

  connectedCallback() {
    super.connectedCallback();
    this._trySetupEventListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._eventListenerSetup = false;
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has("session")) {
      this._trySetupEventListeners();
    }
  }

  private _trySetupEventListeners() {
    if (this.session && !this._eventListenerSetup) {
      this.setupEventListeners();
      this._eventListenerSetup = true;
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
      this.persistState();
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
