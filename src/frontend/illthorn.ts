import { IllthornEvent } from "./events";
import { highlightManager } from "./highlights";
import { macroManager } from "./macros";
import type { FrontendSession } from "./session";
import { renderAllSessions } from "./session/connect-all";
import { currentSession, endSession } from "./session/helpers";
import { SessionMap } from "./session/map";
import { Bus } from "./util/bus";

class IIllthorn {
  constructor(readonly bus: Bus = new Bus()) {
    this.bus.subscribeEvent<FrontendSession>(IllthornEvent.SESSION_FOCUS, ({ detail: session }) => {
      document.title = session.name;
      this.renderSession(session);
    });

    this.bus.subscribeEvent<string>(IllthornEvent.MACRO, ({ detail: macro }) => {
      const currentSess = currentSession();
      if (currentSess) currentSess.handleMacro(macro);
    });

    this.bus.subscribeEvent<string>(IllthornEvent.SUBMIT_ILLTHORN_COMMAND, async (e) => {
      this.handleCommand(e.detail);
    });
  }

  sessions() {
    return SessionMap;
  }

  currentSession() {
    return currentSession();
  }

  hud(on: boolean) {
    const sess = currentSession();
    sess.ui.context.classList.toggle("no-hud", !on);
  }

  toggleSessionsUI(visible: boolean) {
    const appRoot = document.querySelector("illthorn-app-lit") as HTMLElement & { toggleSessions?: (visible: boolean) => void };
    appRoot?.toggleSessions?.(visible);
  }

  toggleStreamsUI(visible: boolean) {
    const sessions = SessionMap.values();
    for (const session of sessions) {
      if (session.ui?.context) {
        const sessionLayout = session.ui.context as HTMLElement & { toggleStreams?: (visible: boolean) => void };
        sessionLayout?.toggleStreams?.(visible);
      }
    }
  }

  async showUIStatus() {
    const currentSess = currentSession();
    if (!currentSess) {
      console.log("No active session to show UI status");
      return;
    }

    // Check current UI states
    const appRoot = document.querySelector("illthorn-app-lit") as HTMLElement;
    const sessionLayout = currentSess.ui?.context as HTMLElement;

    const sessionsVisible = !appRoot?.classList.contains("no-sessions");
    const hudVisible = !sessionLayout?.classList.contains("no-hud");
    const streamsVisible = !sessionLayout?.classList.contains("no-streams");
    const scrollbackSize = currentSess.ui?.feed?.maxScrollbackSize || 20000;
    const currentItems = currentSess.ui?.feed?.currentItemCount || 0;

    // Create status message
    const statusMessage = [
      "=== UI Status ===",
      `Session picker: ${sessionsVisible ? "ON" : "OFF"}`,
      `HUD: ${hudVisible ? "ON" : "OFF"}`,
      `Streams panel: ${streamsVisible ? "ON" : "OFF"}`,
      "",
      "=== Scrollback Buffer ===",
      `Buffer size: ${scrollbackSize} items`,
      `Current items: ${currentItems}`,
      `Memory usage: ${Math.round((currentItems / scrollbackSize) * 100)}%`,
      "",
      "=== Stream Filters ===",
      this.getStreamFilterStatus(currentSess),
      "",
      "Available commands:",
      "  :ui sessions on/off - Toggle session picker",
      "  :ui hud on/off - Toggle HUD",
      "  :ui streams on/off - Toggle streams panel",
      "  :ui scrollback <size> - Set scrollback buffer (100-50000)",
      "  :clear or :cls - Clear game log (Ctrl+Shift+L)",
      "  :stream clear - Clear all streams",
      "  :stream clear <type> - Clear specific stream (thoughts, speech, logon, logoff, death)",
      "  :dev - Toggle dev window for raw game data",
      "  :dev clear - Clear dev window log buffer",
    ].join("\n");

    // Output to game feed using client message event (preserves formatting)
    if (currentSess.bus) {
      currentSess.bus.dispatchEvent(IllthornEvent.CLIENT_MESSAGE, {
        message: statusMessage,
        timestamp: Date.now(),
      });
    } else {
      console.log("No session bus available for UI status");
    }
  }

  renderSession(session: FrontendSession) {
    // The app root component now handles session rendering via bus events
    // This method is kept for API compatibility but delegates to the component
    const appRoot = document.querySelector("illthorn-app-lit") as HTMLElement & { renderSession?: (session: FrontendSession) => void };
    appRoot?.renderSession?.(session);
  }

  async handleCommand(command: string) {
    switch (command) {
      case ":c":
        await renderAllSessions();
        break;
      case ":dq": {
        const sess = currentSession();
        return sess && endSession(sess);
      }
      case ":ui hud on":
        return this.hud(true);
      case ":ui hud off":
        return this.hud(false);
      case ":ui sessions on":
        return this.toggleSessionsUI(true);
      case ":ui sessions off":
        return this.toggleSessionsUI(false);
      case ":ui streams on":
        return this.toggleStreamsUI(true);
      case ":ui streams off":
        return this.toggleStreamsUI(false);
      case ":ui":
        return this.showUIStatus();
      case ":dev":
        return this.toggleDevWindow();
      case ":dev clear":
        return this.clearDevWindow();
      case ":clear":
      case ":cls":
        return this.clearGameLog();
      case ":stream clear":
      case ":streams clear":
        return this.clearAllStreams();
    }

    // Handle hilite commands
    if (command.startsWith(":hilite ") || command === ":hilite") {
      return this.handleHighlightCommand(command);
    }

    // Handle macro commands
    if (command.startsWith(":macro ") || command === ":macro") {
      return this.handleMacroCommand(command);
    }

    // Handle config commands
    if (command.startsWith(":config ") || command === ":config") {
      return this.handleConfigCommand(command);
    }

    // Handle scrollback size commands
    if (command.startsWith(":ui scrollback ")) {
      const parts = command.split(" ");
      if (parts.length === 3) {
        const size = parseInt(parts[2], 10);
        if (!Number.isNaN(size)) {
          return this.setScrollbackSize(size);
        }
      }
      return this.showScrollbackUsage();
    }

    // Handle stream clear commands with specific types
    if (command.startsWith(":stream clear ") || command.startsWith(":streams clear ")) {
      const parts = command.split(" ");
      if (parts.length === 3) {
        const streamType = parts[2];
        return this.clearStreamType(streamType);
      }
    }

    // Catch-all for unknown : commands
    if (command.startsWith(":")) {
      const baseCommand = command.split(" ")[0];
      this.showError(`Unknown command: ${baseCommand}

Available commands:
  :hilite - Highlight configuration
  :macro - Macro configuration
  :config - Configuration management
  :ui - User interface controls
  :stream/:streams - Stream management
  :c - Connect to session
  :cls - Clear game log
  :dq - Disconnect session`);
    }
  }

  /**
   * Set scrollback buffer size for the current session's feed
   */
  async setScrollbackSize(size: number) {
    if (size < 100 || size > 50000) {
      const currentSess = currentSession();
      if (currentSess?.bus) {
        currentSess.bus.dispatchEvent(IllthornEvent.CLIENT_MESSAGE, {
          message: "Scrollback size must be between 100 and 50000",
          timestamp: Date.now(),
        });
      }
      return;
    }

    const currentSess = currentSession();
    if (currentSess?.ui.feed?.setScrollbackSize) {
      try {
        await currentSess.ui.feed.setScrollbackSize(size);

        if (currentSess.bus) {
          currentSess.bus.dispatchEvent(IllthornEvent.CLIENT_MESSAGE, {
            message: `Scrollback buffer set to ${size} items`,
            timestamp: Date.now(),
          });
        }
      } catch (error) {
        if (currentSess.bus) {
          currentSess.bus.dispatchEvent(IllthornEvent.CLIENT_MESSAGE, {
            message: `Error setting scrollback size: ${error.message}`,
            timestamp: Date.now(),
          });
        }
      }
    } else {
      if (currentSess?.bus) {
        currentSess.bus.dispatchEvent(IllthornEvent.CLIENT_MESSAGE, {
          message: "No active feed found",
          timestamp: Date.now(),
        });
      }
    }
  }

  /**
   * Clear the current session's game log
   */
  clearGameLog() {
    const currentSess = currentSession();
    if (currentSess?.ui.feed?.clear) {
      currentSess.ui.feed.clear();

      if (currentSess.bus) {
        currentSess.bus.dispatchEvent(IllthornEvent.CLIENT_MESSAGE, {
          message: "Game log cleared",
          timestamp: Date.now(),
        });
      }
    } else {
      if (currentSess?.bus) {
        currentSess.bus.dispatchEvent(IllthornEvent.CLIENT_MESSAGE, {
          message: "No active feed found",
          timestamp: Date.now(),
        });
      }
    }
  }

  /**
   * Clear all streams in the current session
   */
  clearAllStreams() {
    const currentSess = currentSession();
    if (currentSess?.ui.streams?.clearAllStreams) {
      currentSess.ui.streams.clearAllStreams();

      if (currentSess.bus) {
        currentSess.bus.dispatchEvent(IllthornEvent.CLIENT_MESSAGE, {
          message: "All streams cleared",
          timestamp: Date.now(),
        });
      }
    } else {
      if (currentSess?.bus) {
        currentSess.bus.dispatchEvent(IllthornEvent.CLIENT_MESSAGE, {
          message: "No active streams found",
          timestamp: Date.now(),
        });
      }
    }
  }

  /**
   * Clear a specific stream type in the current session
   */
  clearStreamType(streamType: string) {
    const currentSess = currentSession();
    if (!currentSess?.ui.streams) {
      if (currentSess?.bus) {
        currentSess.bus.dispatchEvent(IllthornEvent.CLIENT_MESSAGE, {
          message: "No active streams found",
          timestamp: Date.now(),
        });
      }
      return;
    }

    const availableTypes = currentSess.ui.streams.getAvailableStreamTypes();
    if (!availableTypes.includes(streamType)) {
      if (currentSess.bus) {
        currentSess.bus.dispatchEvent(IllthornEvent.CLIENT_MESSAGE, {
          message: `Invalid stream type: ${streamType}\nAvailable types: ${availableTypes.join(", ")}`,
          timestamp: Date.now(),
        });
      }
      return;
    }

    currentSess.ui.streams.clearStreamType(streamType);

    if (currentSess.bus) {
      currentSess.bus.dispatchEvent(IllthornEvent.CLIENT_MESSAGE, {
        message: `${streamType} stream cleared`,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Show usage information for scrollback command
   */
  showScrollbackUsage() {
    const currentSess = currentSession();
    if (currentSess?.bus) {
      currentSess.bus.dispatchEvent(IllthornEvent.CLIENT_MESSAGE, {
        message: "Usage: :ui scrollback <size>\nSize must be between 100 and 50000",
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Toggle the dev window on/off
   */
  async toggleDevWindow() {
    const currentSess = currentSession();

    try {
      const status = await window.DevWindow.isOpen();

      if (status.isOpen) {
        // Close the dev window
        await window.DevWindow.close();
        if (currentSess?.bus) {
          currentSess.bus.dispatchEvent(IllthornEvent.CLIENT_MESSAGE, {
            message: "Dev window closed",
            timestamp: Date.now(),
          });
        }
      } else {
        // Open the dev window
        const result = await window.DevWindow.open();
        if (result.success) {
          if (currentSess?.bus) {
            currentSess.bus.dispatchEvent(IllthornEvent.CLIENT_MESSAGE, {
              message: "Dev window opened - raw game data will be displayed there",
              timestamp: Date.now(),
            });
          }
        } else {
          if (currentSess?.bus) {
            currentSess.bus.dispatchEvent(IllthornEvent.CLIENT_MESSAGE, {
              message: `Failed to open dev window: ${result.error || "Unknown error"}`,
              timestamp: Date.now(),
            });
          }
        }
      }
    } catch (error) {
      if (currentSess?.bus) {
        currentSess.bus.dispatchEvent(IllthornEvent.CLIENT_MESSAGE, {
          message: `Dev window error: ${error instanceof Error ? error.message : "Unknown error"}`,
          timestamp: Date.now(),
        });
      }
    }
  }

  /**
   * Clear the dev window log buffer
   */
  async clearDevWindow() {
    const currentSess = currentSession();

    try {
      const result = await window.DevWindow.clear();
      if (result.success) {
        if (currentSess?.bus) {
          currentSess.bus.dispatchEvent(IllthornEvent.CLIENT_MESSAGE, {
            message: "Dev window cleared",
            timestamp: Date.now(),
          });
        }
      } else {
        if (currentSess?.bus) {
          currentSess.bus.dispatchEvent(IllthornEvent.CLIENT_MESSAGE, {
            message: `Failed to clear dev window: ${result.error || "Unknown error"}`,
            timestamp: Date.now(),
          });
        }
      }
    } catch (error) {
      if (currentSess?.bus) {
        currentSess.bus.dispatchEvent(IllthornEvent.CLIENT_MESSAGE, {
          message: `Dev window error: ${error instanceof Error ? error.message : "Unknown error"}`,
          timestamp: Date.now(),
        });
      }
    }
  }

  /**
   * Get current stream filter status for display
   */
  private getStreamFilterStatus(session: FrontendSession | undefined): string {
    if (!session?.ui?.streams) {
      return "Stream filters: Not available";
    }

    const streamsContainer = session.ui.streams;
    const availableTypes = streamsContainer.getAvailableStreamTypes();
    const enabledTypes = availableTypes.filter((type: string) => streamsContainer.getStreamTypeVisibility(type));
    const disabledTypes = availableTypes.filter((type: string) => !streamsContainer.getStreamTypeVisibility(type));

    let status = "";
    if (enabledTypes.length > 0) {
      status += `Enabled: ${enabledTypes.join(", ")}`;
    }
    if (disabledTypes.length > 0) {
      if (status) status += "\n";
      status += `Disabled: ${disabledTypes.join(", ")}`;
    }

    return status || "All stream types enabled";
  }

  /**
   * Helper method to show messages to the current session
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
   * Helper method to show error messages to the current session
   */
  private showError(message: string): void {
    this.showMessage(`⚠️ ${message}`);
  }

  /**
   * Handle :hilite commands
   */
  private async handleHighlightCommand(command: string): Promise<void> {
    const parts = command.split(" ");
    const subCommand = parts[1];

    if (!subCommand) {
      // Show available hilite commands
      const helpMessage = `Available :hilite commands:
:hilite reload - Reload highlights from config
:hilite list - Show loaded patterns
:hilite test <pattern> <text> - Test pattern against text
:hilite edit - Open highlights.toml in editor
:hilite on - Enable highlights
:hilite off - Disable highlights`;

      this.showMessage(helpMessage);
      return;
    }

    try {
      switch (subCommand) {
        case "reload":
          await highlightManager.reload();
          this.showMessage("Highlights reloaded from config");
          break;

        case "list": {
          const allPatterns = highlightManager.getAllPatterns();
          if (allPatterns.length === 0) {
            this.showMessage("No highlight patterns loaded");
          } else {
            const listMessage = `Loaded highlight patterns (${allPatterns.length}):\n${allPatterns.map((p, i) => `  ${i + 1}. ${p.name}: /${p.pattern}/`).join("\n")}`;
            this.showMessage(listMessage);
          }
          break;
        }

        case "test": {
          if (parts.length < 4) {
            this.showMessage("Usage: :hilite test <pattern> <text>");
            return;
          }
          // Remove surrounding quotes if present
          const pattern = parts[2].replace(/^["'](.*)["']$/, "$1");
          const testText = parts
            .slice(3)
            .join(" ")
            .replace(/^["'](.*)["']$/, "$1");
          const testResult = highlightManager.testPattern(pattern, testText);
          this.showMessage(`Pattern test result: ${testResult.length > 0 ? "MATCH" : "NO MATCH"}`);
          break;
        }

        case "edit":
          await window.Config.openInEditor("highlights.toml");
          this.showMessage("Opening highlights.toml in editor");
          break;

        case "on":
          await highlightManager.setEnabled(true);
          this.showMessage("Highlights enabled");
          break;

        case "off":
          await highlightManager.setEnabled(false);
          this.showMessage("Highlights disabled");
          break;

        default:
          this.showError(`Unknown hilite command: ${subCommand}\nTry :hilite for help`);
      }
    } catch (error) {
      this.showError(`Highlight command failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Handle :macro commands
   */
  private async handleMacroCommand(command: string): Promise<void> {
    const parts = command.split(" ");
    const subCommand = parts[1];

    if (!subCommand) {
      // Show available macro commands
      const helpMessage = `Available :macro commands:
:macro reload - Reload macros from config
:macro list - Show bound macros by category
:macro edit - Open macros.toml in editor
:macro on - Enable macros
:macro off - Disable macros
:macro test <key> - Show what a key binding would execute`;

      this.showMessage(helpMessage);
      return;
    }

    try {
      switch (subCommand) {
        case "reload":
          await macroManager.reload();
          this.showMessage("Macros reloaded from config");
          break;

        case "list": {
          const bindings = macroManager.getBindings();
          if (bindings.length === 0) {
            this.showMessage("No macro bindings loaded");
          } else {
            // Group bindings by category
            const categorizedBindings = bindings.reduce(
              (acc, binding) => {
                if (!acc[binding.category]) {
                  acc[binding.category] = [];
                }
                acc[binding.category].push(binding);
                return acc;
              },
              {} as Record<string, typeof bindings>,
            );

            let listMessage = `Loaded macros:\n`;
            Object.entries(categorizedBindings).forEach(([category, categoryBindings]) => {
              listMessage += `  [${category}]\n`;
              categoryBindings.forEach((binding) => {
                listMessage += `    ${binding.key} → ${binding.command}\n`;
              });
            });

            this.showMessage(listMessage.trim());
          }
          break;
        }

        case "edit":
          await window.Config.openInEditor("macros.toml");
          this.showMessage("Opening macros.toml in editor");
          break;

        case "on":
          await macroManager.setEnabled(true);
          this.showMessage("Macros enabled");
          break;

        case "off":
          await macroManager.setEnabled(false);
          this.showMessage("Macros disabled");
          break;

        case "test": {
          if (parts.length < 3) {
            this.showMessage("Usage: :macro test <key>");
            return;
          }
          const key = parts[2];
          const binding = macroManager.getBindings().find((b) => b.key === key);
          if (binding) {
            this.showMessage(`Key binding: ${key} → ${binding.command}`);
          } else {
            this.showMessage(`No binding found for key: ${key}`);
          }
          break;
        }

        default:
          this.showError(`Unknown macro command: ${subCommand}\nTry :macro for help`);
      }
    } catch (error) {
      this.showError(`Macro command failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Handle :config commands
   */
  private async handleConfigCommand(command: string): Promise<void> {
    const parts = command.split(" ");
    const subCommand = parts[1];

    if (!subCommand) {
      // Show config directory path and status
      try {
        const configPath = await window.Config.getConfigPath();
        this.showMessage(
          `Config directory: ${configPath}\n\nAvailable :config commands:\n:config open - Open config directory\n:config reload - Reload all configurations\n:config edit <file> - Open specific config file`,
        );
      } catch (error) {
        this.showError(`Failed to get config path: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
      return;
    }

    try {
      switch (subCommand) {
        case "open":
          await window.Config.openConfigDir();
          this.showMessage("Config directory opened in file explorer");
          break;

        case "reload":
          await highlightManager.reload();
          await macroManager.reload();
          this.showMessage("All configurations reloaded");
          break;

        case "edit": {
          if (parts.length < 3) {
            this.showMessage("Usage: :config edit <file>\nAvailable files: highlights.toml, macros.toml");
            return;
          }
          const filename = parts[2];
          if (!filename.endsWith(".toml")) {
            this.showError("Only .toml files can be edited");
            return;
          }
          await window.Config.openInEditor(filename);
          this.showMessage(`Opening ${filename} in editor`);
          break;
        }

        default:
          this.showError(`Unknown config command: ${subCommand}\nTry :config for help`);
      }
    } catch (error) {
      this.showError(`Config command failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}

export const Illthorn = new IIllthorn();
window.Illthorn = Illthorn;
