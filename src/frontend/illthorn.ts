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
    }
  }
}

export const Illthorn = new IIllthorn();
window.Illthorn = Illthorn;
