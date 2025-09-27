// ABOUTME: File system watcher for config directory changes
// ABOUTME: Monitors TOML config files and notifies frontend when changes occur

import { type FSWatcher, watch } from "node:fs";
import path from "node:path";
import { debugConfig } from "../logger";

export interface ConfigFileChangeEvent {
  filename: string;
  fullPath: string;
  changeType: "change" | "rename";
}

/**
 * Watches config directory for TOML file changes and emits events
 */
export class ConfigWatcher {
  private watchers: Map<string, FSWatcher> = new Map();
  private changeListeners: Array<(event: ConfigFileChangeEvent) => void> = [];
  private debounceTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private readonly debounceDelay = 500; // 500ms debounce to handle rapid successive changes

  /**
   * Start watching a config directory
   */
  start(configPath: string): void {
    if (this.watchers.has(configPath)) {
      debugConfig(`Already watching config directory: ${configPath}`);
      return;
    }

    try {
      const watcher = watch(configPath, { recursive: false }, (eventType, filename) => {
        if (!filename || !filename.endsWith(".toml")) {
          return; // Only watch TOML files
        }

        const fullPath = path.join(configPath, filename);
        const changeType = eventType === "change" ? "change" : "rename";

        // Debounce rapid successive changes to the same file
        this.debounceChange(filename, fullPath, changeType);
      });

      watcher.on("error", (error) => {
        console.warn(`Config watcher error for ${configPath}:`, error);
        debugConfig(`Config watcher error for ${configPath}:`, error);
        this.watchers.delete(configPath);
      });

      this.watchers.set(configPath, watcher);
      debugConfig(`Started watching config directory: ${configPath}`);
    } catch (error) {
      console.warn(`Failed to start config watcher for ${configPath}:`, error);
      debugConfig(`Failed to start config watcher for ${configPath}:`, error);
    }
  }

  /**
   * Stop watching a config directory
   */
  stop(configPath: string): void {
    const watcher = this.watchers.get(configPath);
    if (watcher) {
      watcher.close();
      this.watchers.delete(configPath);
      debugConfig(`Stopped watching config directory: ${configPath}`);
    }
  }

  /**
   * Stop all watchers
   */
  stopAll(): void {
    for (const [configPath, watcher] of this.watchers) {
      watcher.close();
      debugConfig(`Stopped watching config directory: ${configPath}`);
    }
    this.watchers.clear();
    this.debounceTimeouts.clear();
  }

  /**
   * Add a listener for config file changes
   */
  onFileChange(listener: (event: ConfigFileChangeEvent) => void): void {
    this.changeListeners.push(listener);
  }

  /**
   * Remove a listener for config file changes
   */
  removeFileChangeListener(listener: (event: ConfigFileChangeEvent) => void): void {
    const index = this.changeListeners.indexOf(listener);
    if (index >= 0) {
      this.changeListeners.splice(index, 1);
    }
  }

  /**
   * Debounce rapid successive changes to prevent spam
   */
  private debounceChange(filename: string, fullPath: string, changeType: "change" | "rename"): void {
    const existing = this.debounceTimeouts.get(filename);
    if (existing) {
      clearTimeout(existing);
    }

    const timeout = setTimeout(() => {
      this.notifyFileChange({ filename, fullPath, changeType });
      this.debounceTimeouts.delete(filename);
    }, this.debounceDelay);

    this.debounceTimeouts.set(filename, timeout);
  }

  /**
   * Notify all listeners about a file change
   */
  private notifyFileChange(event: ConfigFileChangeEvent): void {
    debugConfig(`Config file changed: ${event.filename} (${event.changeType})`);
    this.changeListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.warn("Error in config file change listener:", error);
        debugConfig("Error in config file change listener:", error);
      }
    });
  }

  /**
   * Get the list of currently watched directories
   */
  getWatchedDirectories(): Array<string> {
    return Array.from(this.watchers.keys());
  }

  /**
   * Check if a directory is currently being watched
   */
  isWatching(configPath: string): boolean {
    return this.watchers.has(configPath);
  }
}

// Export singleton instance
export const configWatcher = new ConfigWatcher();
