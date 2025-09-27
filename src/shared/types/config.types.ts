// ABOUTME: Shared configuration types used by both frontend and backend
// ABOUTME: Eliminates type duplication and ensures consistency across IPC boundaries

/**
 * Highlight pattern configuration for game text highlighting
 */
export interface HighlightPattern {
  name: string;
  pattern: string;
  color?: string;
  background?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

/**
 * Complete highlight configuration including settings and patterns
 */
export interface HighlightConfig {
  settings: {
    enabled: boolean;
    case_sensitive: boolean;
  };
  patterns: Array<HighlightPattern>;
}

/**
 * Macro configuration including settings and macro definitions
 * Supports both settings object and dynamic category properties
 */
export interface MacroConfig {
  settings: {
    enabled: boolean;
    echo_commands?: boolean; // Optional command echo setting
  };
  [category: string]: Record<string, string> | { enabled: boolean; echo_commands?: boolean };
}

/**
 * Config file change event from file system watcher
 */
export interface ConfigFileChangeEvent {
  filename: string;
  fullPath?: string; // Optional full path for advanced use cases
  changeType: "change" | "rename";
}

/**
 * Config method names for IPC communication
 */
export enum ConfigMethods {
  GetPath = "config/getPath",
  LoadHighlights = "config/loadHighlights",
  LoadMacros = "config/loadMacros",
  SaveHighlights = "config/saveHighlights",
  SaveMacros = "config/saveMacros",
  OpenInEditor = "config/openInEditor",
  OpenConfigDir = "config/openConfigDir",
  StartWatcher = "config/startWatcher",
  StopWatcher = "config/stopWatcher",
}

/**
 * Standard API response for operations that can succeed or fail
 */
export interface ConfigApiResponse {
  success: boolean;
  error?: string;
}
