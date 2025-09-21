// ABOUTME: Core configuration management - handles TOML loading/saving and cross-platform paths

import * as TOML from "@iarna/toml";
import { shell } from "electron";
import { promises as fs } from "fs";
import * as os from "os";
import * as path from "path";
import { log } from "../logger";
import type { HighlightConfig, MacroConfig } from "./methods";

export class ConfigManager {
  private configDir: string;

  constructor() {
    // Determine config directory based on platform
    this.configDir = path.join(process.platform === "win32" ? process.env.APPDATA || os.homedir() : path.join(os.homedir(), ".config"), "illthorn");
  }

  async getConfigPath(): Promise<string> {
    await this.ensureConfigDir();
    return this.configDir;
  }

  async loadHighlights(): Promise<HighlightConfig> {
    const filePath = path.join(this.configDir, "highlights.toml");
    return await this.loadTomlConfig<HighlightConfig>(filePath, this.getDefaultHighlights());
  }

  async loadMacros(): Promise<MacroConfig> {
    const filePath = path.join(this.configDir, "macros.toml");
    return await this.loadTomlConfig<MacroConfig>(filePath, this.getDefaultMacros());
  }

  async saveHighlights(config: HighlightConfig): Promise<void> {
    const filePath = path.join(this.configDir, "highlights.toml");
    await this.saveTomlConfig(filePath, config);
  }

  async saveMacros(config: MacroConfig): Promise<void> {
    const filePath = path.join(this.configDir, "macros.toml");
    await this.saveTomlConfig(filePath, config);
  }

  async openInEditor(filename: string): Promise<void> {
    const filePath = path.join(this.configDir, filename);

    // Ensure file exists before opening
    try {
      await fs.access(filePath);
    } catch {
      // Create file if it doesn't exist
      if (filename === "highlights.toml") {
        await this.saveHighlights(this.getDefaultHighlights());
      } else if (filename === "macros.toml") {
        await this.saveMacros(this.getDefaultMacros());
      }
    }

    await shell.openPath(filePath);
  }

  async openConfigDir(): Promise<void> {
    await this.ensureConfigDir();
    await shell.openPath(this.configDir);
  }

  private async ensureConfigDir(): Promise<void> {
    try {
      await fs.mkdir(this.configDir, { recursive: true });
      log("config directory ensured at: %s", this.configDir);
    } catch (error) {
      log("failed to create config directory: %s", error);
      throw new Error(`Failed to create config directory: ${error}`);
    }
  }

  private async loadTomlConfig<T>(filePath: string, defaultConfig: T): Promise<T> {
    try {
      await this.ensureConfigDir();

      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        // File doesn't exist, create it with defaults
        log("creating default config file: %s", filePath);
        await this.saveTomlConfig(filePath, defaultConfig);
        return defaultConfig;
      }

      // Read and parse TOML file
      const tomlContent = await fs.readFile(filePath, "utf8");
      const parsed = TOML.parse(tomlContent) as T;
      log("loaded config from: %s", filePath);
      return parsed;
    } catch (error) {
      log("failed to load config from %s: %s", filePath, error);
      // Return defaults if config is corrupted
      return defaultConfig;
    }
  }

  private async saveTomlConfig<T>(filePath: string, config: T): Promise<void> {
    try {
      await this.ensureConfigDir();
      const tomlContent = TOML.stringify(config as TOML.JsonMap);
      await fs.writeFile(filePath, tomlContent, "utf8");
      log("saved config to: %s", filePath);
    } catch (error) {
      log("failed to save config to %s: %s", filePath, error);
      throw new Error(`Failed to save config: ${error}`);
    }
  }

  private getDefaultHighlights(): HighlightConfig {
    return {
      settings: {
        enabled: true,
        case_sensitive: false,
      },
      patterns: [
        {
          name: "example",
          pattern: "\\btest\\b",
          color: "#ff0000",
          bold: true,
        },
      ],
    };
  }

  private getDefaultMacros(): MacroConfig {
    return {
      settings: {
        enabled: true,
      },
      examples: {
        f1: "look",
        "ctrl+1": "stance offensive",
      },
    };
  }
}

// Export singleton instance
export const configManager = new ConfigManager();
