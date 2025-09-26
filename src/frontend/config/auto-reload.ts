// ABOUTME: Auto-reload service for config files
// ABOUTME: Starts file watcher on app init and handles automatic config reloading

import { IllthornEvent } from "../events";
import { highlightManager } from "../highlights";
import { macroManager } from "../macros";
import { currentSession } from "../session/helpers";
import type { ConfigFileChangeEvent } from "./api";

/**
 * Auto-reload service for watching config file changes
 */
export class AutoReloader {
  private isWatcherStarted = false;

  /**
   * Initialize the auto-reload service
   */
  async start(): Promise<void> {
    if (this.isWatcherStarted) {
      console.debug("Config auto-reloader already started");
      return;
    }

    try {
      // Start the backend file watcher
      const result = await window.Config.startWatcher();
      if (result.success) {
        console.debug("Config file watcher started successfully");
        this.isWatcherStarted = true;

        // Set up file change listener
        window.Config.onFileChange(this.handleFileChange.bind(this));
      } else {
        console.warn("Failed to start config file watcher");
      }
    } catch (error) {
      console.warn("Error starting config auto-reloader:", error);
    }
  }

  /**
   * Stop the auto-reload service
   */
  async stop(): Promise<void> {
    if (!this.isWatcherStarted) {
      return;
    }

    try {
      // Remove file change listeners
      window.Config.removeAllFileChangeListeners();

      // Stop the backend file watcher
      const result = await window.Config.stopWatcher();
      if (result.success) {
        console.debug("Config file watcher stopped successfully");
        this.isWatcherStarted = false;
      } else {
        console.warn("Failed to stop config file watcher");
      }
    } catch (error) {
      console.warn("Error stopping config auto-reloader:", error);
    }
  }

  /**
   * Handle config file changes
   */
  private async handleFileChange(event: ConfigFileChangeEvent): Promise<void> {
    console.debug(`Config file changed: ${event.filename} (${event.changeType})`);

    try {
      if (event.filename === "highlights.toml") {
        await this.reloadHighlights();
      } else if (event.filename === "macros.toml") {
        await this.reloadMacros();
      } else {
        console.debug(`Ignoring change to unrecognized config file: ${event.filename}`);
      }
    } catch (error) {
      console.warn(`Failed to reload config for ${event.filename}:`, error);
      this.showErrorMessage(`Config reload failed for ${event.filename}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Reload highlights configuration
   */
  private async reloadHighlights(): Promise<void> {
    await highlightManager.reload();
    this.showMessage("Highlights reloaded (file changed)");
  }

  /**
   * Reload macros configuration
   */
  private async reloadMacros(): Promise<void> {
    await macroManager.reload();
    this.showMessage("Macros reloaded (file changed)");
  }

  /**
   * Show a success message to the user
   */
  private showMessage(message: string): void {
    const currentSess = currentSession();
    if (currentSess?.bus) {
      currentSess.bus.dispatchEvent(IllthornEvent.CLIENT_MESSAGE, {
        message,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Show an error message to the user
   */
  private showErrorMessage(message: string): void {
    const currentSess = currentSession();
    if (currentSess?.bus) {
      currentSess.bus.dispatchEvent(IllthornEvent.CLIENT_MESSAGE, {
        message: `⚠️ ${message}`,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Check if the auto-reloader is running
   */
  isRunning(): boolean {
    return this.isWatcherStarted;
  }
}

// Export singleton instance
export const autoReloader = new AutoReloader();
