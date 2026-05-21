// ABOUTME: Simple JSON-based settings storage using Node.js fs
// ABOUTME: Replaces electron-store with zero-dependency solution

import * as os from "node:os";
import * as path from "node:path";
import { log } from "../logger";

/**
 * Simple JSON file-based settings store
 * Provides electron-store compatible API without dependencies
 */
export class JsonStore {
  private filePath: string;
  private data: Record<string, unknown> = {};

  constructor() {
    // Use same config directory as ConfigManager for consistency
    const configDir = path.join(process.platform === "win32" ? process.env.APPDATA || os.homedir() : path.join(os.homedir(), ".config"), "illthorn");

    this.filePath = path.join(configDir, "ui-state.json");
    this.loadSync();
  }

  /**
   * Get the file path where settings are stored
   */
  get path(): string {
    return this.filePath;
  }

  /**
   * Get all settings as an object
   */
  get store(): Record<string, unknown> {
    return { ...this.data };
  }

  /**
   * Get a setting value by key
   */
  get(key: string): unknown {
    return this.data[key];
  }

  /**
   * Set a setting value by key
   */
  set(key: string, value: unknown): void {
    this.data[key] = value;
    this.save();
  }

  /**
   * Load settings from disk synchronously (for constructor)
   */
  private loadSync(): void {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.filePath);
      if (!require("node:fs").existsSync(dir)) {
        require("node:fs").mkdirSync(dir, { recursive: true });
      }

      // Load settings file if it exists
      if (require("node:fs").existsSync(this.filePath)) {
        const content = require("node:fs").readFileSync(this.filePath, "utf-8");
        this.data = JSON.parse(content);
        log("loaded settings from: %s", this.filePath);
      } else {
        // Initialize with empty object
        this.data = {};
        log("initialized empty settings at: %s", this.filePath);
      }
    } catch (error) {
      log("failed to load settings, using empty object: %s", error);
      this.data = {};
    }
  }

  /**
   * Save settings to disk using atomic write
   */
  private save(): void {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.filePath);
      if (!require("node:fs").existsSync(dir)) {
        require("node:fs").mkdirSync(dir, { recursive: true });
      }

      // Atomic write: write to temp file, then rename
      const tempPath = `${this.filePath}.tmp`;
      const content = JSON.stringify(this.data, null, 2);

      require("node:fs").writeFileSync(tempPath, content, "utf-8");
      require("node:fs").renameSync(tempPath, this.filePath);

      log("saved settings to: %s", this.filePath);
    } catch (error) {
      log("failed to save settings: %s", error);
    }
  }
}
