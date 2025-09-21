// ABOUTME: Frontend TypeScript interfaces for config API and global window extensions

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

// Extend global window interface to include Config API
declare global {
  interface Window {
    Config: {
      getConfigPath(): Promise<string>;
      loadHighlights(): Promise<HighlightConfig>;
      loadMacros(): Promise<MacroConfig>;
      saveHighlights(config: HighlightConfig): Promise<void>;
      saveMacros(config: MacroConfig): Promise<void>;
      openInEditor(filename: string): Promise<void>;
      openConfigDir(): Promise<void>;
    };
  }
}
