// ABOUTME: Clean macro manager using TOML-based config system
// ABOUTME: Replaces stubbed macro functions with proper Config API integration

import keyboardjs from "keyboardjs";
import type { MacroConfig } from "../../shared/types/config.types";
import { IllthornEvent } from "../events";
import { currentSession } from "../session/helpers";
import { debugMacros } from "../util/logger";

export interface MacroBinding {
  key: string;
  command: string;
  category: string;
}

/**
 * Manager for user-defined macro bindings using TOML config
 */
export class MacroManager {
  private bindings: Array<MacroBinding> = [];
  private config: MacroConfig | null = null;
  private isInitialized = false;
  private userKeyBindings: Array<string> = [];
  private keyCallbacks = new Map<string, (e?: KeyboardEvent) => void>();

  /**
   * Initialize manager by loading config from TOML
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.config = await window.Config.loadMacros();
      await this.bindUserMacros();
      this.notifyComponentsUpdate();
      this.isInitialized = true;
      debugMacros("MacroManager initialized with", this.bindings.length, "bindings");
    } catch (error) {
      console.warn("Failed to initialize MacroManager:", error);
      // Continue with empty bindings - app should still work
      this.config = {
        settings: { enabled: true },
      };
      this.isInitialized = true;
    }
  }

  /**
   * Reload macros from TOML config
   */
  async reload(): Promise<void> {
    try {
      // Clear existing user bindings first
      await this.unbindUserMacros();

      this.config = await window.Config.loadMacros();
      await this.bindUserMacros();
      this.notifyComponentsUpdate();
      debugMacros("MacroManager reloaded with", this.bindings.length, "bindings");
    } catch (error) {
      console.warn("Failed to reload macros:", error);
      throw error;
    }
  }

  /**
   * Bind user-defined macros from config
   */
  async bindUserMacros(): Promise<void> {
    this.bindings = [];
    this.userKeyBindings = [];

    if (!this.config || !this.config.settings.enabled) {
      debugMacros("User macros disabled or no config loaded");
      return;
    }

    const errors: Array<string> = [];

    // Process all categories except 'settings'
    Object.entries(this.config).forEach(([category, categoryData]) => {
      if (category === "settings" || typeof categoryData !== "object") {
        return;
      }

      Object.entries(categoryData as Record<string, string>).forEach(([key, command]) => {
        try {
          // Validate macro config
          if (!key || !command) {
            errors.push(`Macro in category "${category}": Missing key or command`);
            return;
          }

          // Test key format before binding
          const testResult = this.testKeyBinding(key);
          if (!testResult.valid) {
            errors.push(`Macro "${key}" in category "${category}": ${testResult.error}`);
            return;
          }

          this.bindMacro(key, command, category);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          errors.push(`Macro "${key}" in category "${category}": ${errorMsg}`);
        }
      });
    });

    // Report errors to user if any occurred
    if (errors.length > 0) {
      console.warn(`Macro binding errors:\n${errors.join("\n")}`);

      // Show errors in the UI
      if (typeof window !== "undefined" && window.Illthorn?.bus) {
        window.Illthorn.bus.dispatchEvent(IllthornEvent.CLIENT_MESSAGE, {
          message: `⚠️ Macro errors (${errors.length}):\n${errors.slice(0, 3).join("\n")}${errors.length > 3 ? `\n... and ${errors.length - 3} more` : ""}`,
          timestamp: Date.now(),
        });
      }
    }

    debugMacros("Bound", this.bindings.length, "user macros");
  }

  /**
   * Unbind all user-defined macros
   */
  async unbindUserMacros(): Promise<void> {
    this.userKeyBindings.forEach((key) => {
      try {
        const callback = this.keyCallbacks.get(key);
        if (callback) {
          keyboardjs.off(key, callback);
          this.keyCallbacks.delete(key);
        }
        debugMacros("Unbound macro:", key);
      } catch (error) {
        console.warn(`Failed to unbind macro ${key}:`, error);
      }
    });

    this.userKeyBindings = [];
    this.bindings = [];
    debugMacros("Unbound all user macros");
  }

  /**
   * Bind a single macro
   */
  private bindMacro(key: string, command: string, category: string): void {
    // Normalize key format for keyboardjs
    const normalizedKey = this.normalizeKeyFormat(key);

    // Check for conflicts with existing bindings and remove old binding
    if (this.userKeyBindings.includes(normalizedKey)) {
      console.warn(`Key binding conflict detected for ${normalizedKey}, overriding previous binding`);

      // Remove old callback from keyboardjs
      const oldCallback = this.keyCallbacks.get(normalizedKey);
      if (oldCallback) {
        keyboardjs.off(normalizedKey, oldCallback);
        this.keyCallbacks.delete(normalizedKey);
      }

      // Remove from tracking arrays
      const keyIndex = this.userKeyBindings.indexOf(normalizedKey);
      if (keyIndex !== -1) {
        this.userKeyBindings.splice(keyIndex, 1);
      }

      const bindingIndex = this.bindings.findIndex((b) => b.key === normalizedKey);
      if (bindingIndex !== -1) {
        this.bindings.splice(bindingIndex, 1);
      }
    }

    try {
      const callback = (e?: KeyboardEvent) => {
        e?.preventDefault();
        this.executeCommand(command);
      };

      keyboardjs.on(normalizedKey, callback);
      this.keyCallbacks.set(normalizedKey, callback);

      this.userKeyBindings.push(normalizedKey);
      this.bindings.push({
        key: normalizedKey,
        command,
        category,
      });

      debugMacros(`Bound macro: ${normalizedKey} -> ${command} (${category})`);
    } catch (error) {
      console.warn(`Failed to bind key ${normalizedKey}:`, error);
      throw error;
    }
  }

  /**
   * Normalize key format for consistent binding
   */
  private normalizeKeyFormat(key: string): string {
    // Convert common formats to keyboardjs format
    return key
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/ctrl\+/g, "ctrl+")
      .replace(/alt\+/g, "alt+")
      .replace(/shift\+/g, "shift+")
      .replace(/cmd\+/g, "cmd+")
      .replace(/meta\+/g, "cmd+"); // Normalize meta to cmd
  }

  /**
   * Check if a command should be echoed to the feed
   */
  private shouldEchoCommand(command: string): boolean {
    // Command starting with "!" should not be echoed (override)
    if (command.startsWith("!")) {
      return false;
    }

    // Check global echo setting (default to true if not set)
    const echoEnabled = this.config?.settings.echo_commands ?? true;
    return echoEnabled;
  }

  /**
   * Execute a macro command
   */
  private executeCommand(command: string): void {
    const session = currentSession();
    if (!session) {
      console.warn("No active session to execute macro command:", command);
      return;
    }

    try {
      // Handle multi-line commands
      const commands = command.split("\\n");

      commands.forEach((cmd) => {
        const trimmedCmd = cmd.trim();
        if (trimmedCmd.length > 0) {
          // Check if command should be echoed
          const shouldEcho = this.shouldEchoCommand(trimmedCmd);

          // Remove echo override prefix if present
          const actualCommand = trimmedCmd.startsWith("!") ? trimmedCmd.substring(1) : trimmedCmd;

          debugMacros(`Executing macro command: ${actualCommand} (echo: ${shouldEcho})`);

          // Echo command if enabled
          if (shouldEcho && session.ui?.cli) {
            // Access the command echo system through the CLI component
            const cli = session.ui.cli as unknown as { _commandEcho?: { echoMacro(command: string): void } };
            cli._commandEcho?.echoMacro(actualCommand);
          }

          session.sendCommand(actualCommand);
        }
      });
    } catch (error) {
      console.warn("Failed to execute macro command:", command, error);
    }
  }

  /**
   * Add a new macro binding
   */
  async addMacro(category: string, key: string, command: string): Promise<void> {
    if (!this.config) {
      await this.initialize();
    }

    if (this.config) {
      // Ensure category exists
      if (!this.config[category]) {
        this.config[category] = {};
      }

      // Add to config
      (this.config[category] as Record<string, string>)[key] = command;

      // Save config
      await window.Config.saveMacros(this.config);
    }

    // Reload to apply changes
    await this.reload();
  }

  /**
   * Remove a macro binding
   */
  async removeMacro(category: string, key: string): Promise<void> {
    if (!this.config || !this.config[category]) {
      return;
    }

    delete (this.config[category] as Record<string, string>)[key];

    // Remove empty categories
    if (Object.keys(this.config[category] as Record<string, string>).length === 0) {
      delete this.config[category];
    }

    await window.Config.saveMacros(this.config);
    await this.reload();
  }

  /**
   * Update a macro command
   */
  async updateMacro(category: string, key: string, newCommand: string): Promise<void> {
    if (!this.config || !this.config[category]) {
      return;
    }

    (this.config[category] as Record<string, string>)[key] = newCommand;
    await window.Config.saveMacros(this.config);
    await this.reload();
  }

  /**
   * Enable or disable macros globally
   */
  async setEnabled(enabled: boolean): Promise<void> {
    if (!this.config) {
      await this.initialize();
    }

    if (this.config) {
      this.config.settings.enabled = enabled;
      await window.Config.saveMacros(this.config);
    }

    if (enabled) {
      await this.bindUserMacros();
    } else {
      await this.unbindUserMacros();
    }

    this.notifyComponentsUpdate();
  }

  /**
   * Get all current bindings
   */
  getBindings(): Array<MacroBinding> {
    return [...this.bindings];
  }

  /**
   * Get bindings by category
   */
  getBindingsByCategory(category: string): Array<MacroBinding> {
    return this.bindings.filter((binding) => binding.category === category);
  }

  /**
   * Get all categories
   */
  getCategories(): Array<string> {
    const categories = new Set(this.bindings.map((binding) => binding.category));
    return Array.from(categories).sort();
  }

  /**
   * Check if a key is already bound
   */
  isKeyBound(key: string): boolean {
    const normalizedKey = this.normalizeKeyFormat(key);
    return this.userKeyBindings.includes(normalizedKey);
  }

  /**
   * Get current settings
   */
  getSettings() {
    return this.config?.settings || { enabled: false, echo_commands: true };
  }

  /**
   * Set echo commands globally
   */
  async setEchoCommands(enabled: boolean): Promise<void> {
    if (!this.config) {
      await this.initialize();
    }

    if (this.config) {
      this.config.settings.echo_commands = enabled;
      await window.Config.saveMacros(this.config);
    }
    this.notifyComponentsUpdate();
  }

  /**
   * Get statistics about loaded macros
   */
  getStats() {
    return {
      totalBindings: this.bindings.length,
      categories: this.getCategories().length,
      enabled: this.config?.settings.enabled || false,
      configLoaded: this.config !== null,
    };
  }

  /**
   * Test if a key combination is valid
   */
  testKeyBinding(key: string): { valid: boolean; normalized: string; error?: string } {
    try {
      const normalized = this.normalizeKeyFormat(key);

      // Basic validation - keyboardjs will validate the actual binding
      if (normalized.length === 0) {
        return { valid: false, normalized, error: "Empty key binding" };
      }

      return { valid: true, normalized };
    } catch (error) {
      return { valid: false, normalized: key, error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Open config file in editor
   */
  async openInEditor(): Promise<void> {
    await window.Config.openInEditor("macros.toml");
  }

  /**
   * Notify components that macros have been updated
   */
  private notifyComponentsUpdate() {
    // Use the centralized event bus
    if (typeof window !== "undefined" && window.Illthorn?.bus) {
      window.Illthorn.bus.dispatchEvent(IllthornEvent.MACROS_RELOADED, {
        bindings: this.getBindings(),
        settings: this.getSettings(),
      });
    }
  }
}

// Export singleton instance
export const macroManager = new MacroManager();
