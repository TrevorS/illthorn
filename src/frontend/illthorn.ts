import { IllthornEvent } from "./events";
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
  private getStreamFilterStatus(session: any): string {
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
}

export const Illthorn = new IIllthorn();
window.Illthorn = Illthorn;
