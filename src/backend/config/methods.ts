// ABOUTME: Defines IPC method names and types for config operations
export enum ConfigMethods {
  GetPath = "config/getPath",
  LoadHighlights = "config/loadHighlights",
  LoadMacros = "config/loadMacros",
  SaveHighlights = "config/saveHighlights",
  SaveMacros = "config/saveMacros",
  OpenInEditor = "config/openInEditor",
  OpenConfigDir = "config/openConfigDir",
}

export interface HighlightPattern {
  name: string;
  pattern: string;
  color?: string;
  background?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export interface HighlightConfig {
  settings: {
    enabled: boolean;
    case_sensitive: boolean;
  };
  patterns: Array<HighlightPattern>;
}

export interface MacroConfig {
  settings: {
    enabled: boolean;
  };
  [category: string]: Record<string, string> | { enabled: boolean };
}
