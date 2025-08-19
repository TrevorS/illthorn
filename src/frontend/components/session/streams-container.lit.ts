// ABOUTME: Smart container component for streams that handles session integration and business logic
// ABOUTME: Manages stream data state and coordinates with StreamsUI for presentation
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { GameTag } from "../../parser/tag";
import type { FrontendSession as Session } from "../../session/index";
import type { Bus } from "../../util/bus";
import "./streams-ui.lit";
import type { StreamsUI } from "./streams-ui.lit";

export interface StreamEntry {
  id: string;
  content: string;
  timestamp: Date;
  streamType: string;
}

@customElement("illthorn-streams-container")
export class StreamsContainer extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }
  `;

  @property({ type: Object })
  session?: Session;

  @state()
  private _entries: Array<StreamEntry> = [];

  private _eventHandlers: Array<{ event: string; handler: (event: CustomEvent<GameTag>) => void; bus: Bus }> = [];

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has("session")) {
      this._setupEventListeners();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._cleanupEventListeners();
  }

  private _setupEventListeners() {
    this._cleanupEventListeners();

    if (!this.session?.bus) {
      return;
    }

    const bus = this.session.bus;

    // Subscribe to stream events
    const thoughtsHandler = ({ detail: streamTag }: CustomEvent<GameTag>) => {
      this._handleStreamEntry(streamTag, "thoughts");
    };
    bus.subscribeEvent<GameTag>("metadata/stream/thoughts", thoughtsHandler);
    this._eventHandlers.push({ event: "metadata/stream/thoughts", handler: thoughtsHandler, bus });

    const speechHandler = ({ detail: streamTag }: CustomEvent<GameTag>) => {
      this._handleStreamEntry(streamTag, "speech");
    };
    bus.subscribeEvent<GameTag>("metadata/stream/speech", speechHandler);
    this._eventHandlers.push({ event: "metadata/stream/speech", handler: speechHandler, bus });

    const logonHandler = ({ detail: streamTag }: CustomEvent<GameTag>) => {
      this._handleStreamEntry(streamTag, "logon");
    };
    bus.subscribeEvent<GameTag>("metadata/stream/logon", logonHandler);
    this._eventHandlers.push({ event: "metadata/stream/logon", handler: logonHandler, bus });

    const logoffHandler = ({ detail: streamTag }: CustomEvent<GameTag>) => {
      this._handleStreamEntry(streamTag, "logoff");
    };
    bus.subscribeEvent<GameTag>("metadata/stream/logoff", logoffHandler);
    this._eventHandlers.push({ event: "metadata/stream/logoff", handler: logoffHandler, bus });

    const deathHandler = ({ detail: streamTag }: CustomEvent<GameTag>) => {
      this._handleStreamEntry(streamTag, "death");
    };
    bus.subscribeEvent<GameTag>("metadata/stream/death", deathHandler);
    this._eventHandlers.push({ event: "metadata/stream/death", handler: deathHandler, bus });
  }

  private _cleanupEventListeners() {
    this._eventHandlers.forEach(({ event, handler, bus }) => {
      if (bus?._ele) {
        bus._ele.removeEventListener(event, handler as EventListener);
      }
    });
    this._eventHandlers = [];
  }

  private _handleStreamEntry(streamTag: GameTag, streamType: string) {
    // Create stream entry from GameTag
    const entry: StreamEntry = {
      id: `${streamType}-${Date.now()}-${Math.random()}`,
      content: this._extractStreamContent(streamTag),
      timestamp: new Date(),
      streamType,
    };

    // Add to entries array
    this._entries = [...this._entries, entry];

    // Limit entries to prevent memory issues (keep last 1000)
    if (this._entries.length > 1000) {
      this._entries = this._entries.slice(-1000);
    }
  }

  private _extractStreamContent(streamTag: GameTag): string {
    // Extract content from the stream tag
    // This may need adjustment based on actual GameTag structure
    if (streamTag.text) {
      return streamTag.text;
    }

    // If there's no direct text, extract from children
    if (streamTag.children && streamTag.children.length > 0) {
      return streamTag.children
        .map((child) => child.text || "")
        .filter((text) => text.trim())
        .join(" ");
    }

    return "";
  }

  private _handleClear = () => {
    this._entries = [];
  };

  render() {
    return html`
      <illthorn-streams-ui 
        .entries=${this._entries}
        @clear=${this._handleClear}>
      </illthorn-streams-ui>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-streams-container": StreamsContainer;
  }
}
