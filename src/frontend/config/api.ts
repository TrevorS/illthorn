// ABOUTME: Frontend TypeScript interfaces for config API and global window extensions
// ABOUTME: Now uses centralized type definitions from shared directory

import type { ConfigFileChangeEvent, HighlightConfig, HighlightPattern, MacroConfig } from "../../shared/types/config.types";

// Re-export for backward compatibility
export type { HighlightPattern, HighlightConfig, MacroConfig, ConfigFileChangeEvent };

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
      startWatcher(): Promise<{ success: boolean }>;
      stopWatcher(): Promise<{ success: boolean }>;
      onFileChange(listener: (event: ConfigFileChangeEvent) => void): void;
      removeAllFileChangeListeners(): void;
    };
  }
}
