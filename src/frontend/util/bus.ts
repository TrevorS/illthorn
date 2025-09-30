import { IllthornEvent } from "../events";
import type { GameTag } from "../parser/tag";
import type { FrontendSession } from "../session";
import { logBusEvent } from "./logger";

type Handler<T> = (a: CustomEvent<T>) => void;

/**
 * Type mapping for all events that can be dispatched through the Bus system
 * This provides compile-time type safety for event names and their payload types
 */
export interface IllthornEventMap {
  // Session metadata events - all use GameTag payloads
  prompt: GameTag;
  "metadata/nav": GameTag;
  "metadata/compass": GameTag;
  "metadata/left": GameTag;
  "metadata/right": GameTag;
  "metadata/spell": GameTag;

  // Progress bar events for vitals and effects
  "metadata/progressBar/health": GameTag;
  "metadata/progressBar/mana": GameTag;
  "metadata/progressBar/stamina": GameTag;
  "metadata/progressBar/spirit": GameTag;
  "metadata/progressBar/mind": GameTag;

  // Stream events
  "metadata/stream/thoughts": GameTag;
  "metadata/stream/speech": GameTag;
  "metadata/stream/logon": GameTag;
  "metadata/stream/logoff": GameTag;
  "metadata/stream/death": GameTag;

  // Stream window events
  "metadata/streamWindow/room": GameTag;
  "metadata/streamWindow/thoughts": GameTag;
  "metadata/streamWindow/speech": GameTag;
  "metadata/streamWindow/logon": GameTag;
  "metadata/streamWindow/logoff": GameTag;
  "metadata/streamWindow/death": GameTag;

  // Dynamic dialog data events (effects containers)
  [key: `metadata/dialogData/${string}`]: GameTag;

  // Global Illthorn events with specific payloads
  [IllthornEvent.SESSION_NEW]: FrontendSession;
  [IllthornEvent.SESSION_FOCUS]: FrontendSession;
  [IllthornEvent.SUBMIT_GAME_COMMAND]: string;
  [IllthornEvent.SUBMIT_ILLTHORN_COMMAND]: string;
  [IllthornEvent.PROMPT_UPDATE]: HTMLElement;
  [IllthornEvent.COMMAND_ECHO]: CustomEvent;
  [IllthornEvent.CLIENT_MESSAGE]: {
    text: string;
    type?: "error" | "info" | "success" | "warning";
    timestamp?: number;
  };
  [IllthornEvent.HIGHLIGHTS_RELOADED]: { timestamp: number };
  [IllthornEvent.MACROS_RELOADED]: { timestamp: number };
  [IllthornEvent.CONFIG_ERROR]: {
    error: string;
    configType: string;
    details?: Record<string, unknown>;
  };
  [IllthornEvent.MACRO]: string;
}

export class Bus {
  constructor(readonly _ele: HTMLDivElement = document.createElement("div")) {}

  /**
   * Dispatch an event with type-safe event name and payload
   */
  dispatchEvent<K extends keyof IllthornEventMap>(name: K, detail: IllthornEventMap[K]): void;
  dispatchEvent<T>(name: string, detail: T): void;
  dispatchEvent<T>(name: string, detail: T): void {
    logBusEvent("dispatch", name, detail);
    const e = new CustomEvent(name, { detail });
    this._ele.dispatchEvent(e);
  }

  /**
   * Subscribe to an event with type-safe event name and payload
   */
  subscribeEvent<K extends keyof IllthornEventMap>(name: K, handler: Handler<IllthornEventMap[K]>): void;
  subscribeEvent<T>(name: string, handler: Handler<T>): void;
  subscribeEvent<T>(name: string, handler: Handler<T>): void {
    logBusEvent("subscribe", name);
    this._ele.addEventListener(name, handler as EventListener);
  }
}
