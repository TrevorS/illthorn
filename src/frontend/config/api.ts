// ABOUTME: Global Window interface declarations for Config API
import type { ConfigFileChangeEvent, HighlightConfig, MacroConfig } from "../../shared/types/config.types";

// Re-export types for convenience
export type { ConfigFileChangeEvent, HighlightConfig, MacroConfig };

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
