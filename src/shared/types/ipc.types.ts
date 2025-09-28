// ABOUTME: Improved IPC type definitions with better type safety
// ABOUTME: Replaces generic any[] types with proper channel-specific types

import type { ConfigApiResponse, ConfigFileChangeEvent, HighlightConfig, MacroConfig } from "./config.types";

/**
 * IPC callback function type for renderer events
 */
export type IPCEventCallback = (e: Electron.IpcRendererEvent, message: unknown) => void;

/**
 * Standard success response
 */
export type Ok = { ok: true };

/**
 * No-operation response
 */
export type Noop = { noop: true };

/**
 * Config IPC channel argument types - replaces any[] with specific types
 */
export interface ConfigIPCChannels {
  "config/getPath": [];
  "config/loadHighlights": [];
  "config/loadMacros": [];
  "config/saveHighlights": [HighlightConfig];
  "config/saveMacros": [MacroConfig];
  "config/openInEditor": [string]; // filename
  "config/openConfigDir": [];
  "config/startWatcher": [];
  "config/stopWatcher": [];
}

/**
 * Config IPC channel return types
 */
export interface ConfigIPCReturns {
  "config/getPath": string;
  "config/loadHighlights": HighlightConfig;
  "config/loadMacros": MacroConfig;
  "config/saveHighlights": undefined;
  "config/saveMacros": undefined;
  "config/openInEditor": undefined;
  "config/openConfigDir": undefined;
  "config/startWatcher": ConfigApiResponse;
  "config/stopWatcher": ConfigApiResponse;
}

/**
 * Session IPC channel argument types
 */
export interface SessionIPCChannels {
  "session/connect": [Illthorn.Session.Config];
  "session/registerSingletonListener": [string, IPCEventCallback];
  "session/listAvailable": [];
  "session/listConnected": [];
  "session/sendCommand": [{ to: string; command: string }];
}

/**
 * Session IPC channel return types
 */
export interface SessionIPCReturns {
  "session/connect": Illthorn.Session.Pojo;
  "session/registerSingletonListener": undefined;
  "session/listAvailable": Array<Illthorn.LichSessionDescriptor>;
  "session/listConnected": Array<Illthorn.Session.Pojo>;
  "session/sendCommand": undefined;
}

/**
 * Generic IPC invoke function with better typing
 */
export interface TypedIPCRenderer {
  invoke<K extends keyof ConfigIPCChannels>(channel: K, ...args: ConfigIPCChannels[K]): Promise<ConfigIPCReturns[K]>;

  invoke<K extends keyof SessionIPCChannels>(channel: K, ...args: SessionIPCChannels[K]): Promise<SessionIPCReturns[K]>;

  // Fallback for other channels not yet typed
  invoke(channel: string, ...args: unknown[]): Promise<unknown>;

  on(channel: string, listener: IPCEventCallback): void;
  removeListener(channel: string, listener: IPCEventCallback): void;
}

/**
 * Config file change listener type
 */
export type ConfigFileChangeListener = (event: ConfigFileChangeEvent) => void;
