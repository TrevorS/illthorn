// ABOUTME: Command echoing system using bus events for proper feed integration
// ABOUTME: Dispatches command echo events that the feed component can subscribe to

import { IllthornEvent } from "../../events";
import type { FrontendSession } from "../../session";
import { debugCommands } from "../../util/logger";

export interface CommandEchoEvent {
  command: string;
  isReplay: boolean;
  timestamp: number;
}

export interface ClientMessageEvent {
  message: string;
  timestamp: number;
}

export class CommandEchoSystem {
  constructor(private session: FrontendSession) {}

  /**
   * Echo a regular command to the game feed
   */
  echoCommand(command: string): void {
    this.dispatchEcho(command, false);
  }

  /**
   * Echo a replayed command to the game feed
   */
  echoReplay(command: string): void {
    this.dispatchEcho(command, true);
  }

  /**
   * Dispatch the echo event via session bus for feed component to handle
   */
  private dispatchEcho(command: string, isReplay: boolean): void {
    if (!this.session?.bus) {
      debugCommands("CommandEchoSystem: No session bus available for command echo");
      return;
    }

    const event: CommandEchoEvent = {
      command,
      isReplay,
      timestamp: Date.now(),
    };

    this.session.bus.dispatchEvent(IllthornEvent.COMMAND_ECHO, event);
  }
}
