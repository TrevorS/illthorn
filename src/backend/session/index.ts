import net from "node:net";
import { ipcMain, type MessagePortMain } from "electron";
import { EventEmitter } from "events";
import { log } from "../logger";
import { useWebContents } from "../webcontents";
import { detectLichSessions } from "./detect-lich-sessions";
import { SessionMap } from "./map";

export class BackendSession extends EventEmitter {
  static portAlreadyUsed(port: number) {
    for (const [_name, session] of SessionMap) {
      if (session.port === port) return session;
    }
    return false;
  }

  static async listAvailable() {
    return detectLichSessions();
  }

  static async connect(config: Illthorn.Session.Config) {
    const alreadyUsed = BackendSession.portAlreadyUsed(config.port);
    if (alreadyUsed && alreadyUsed.name === config.name) {
      return alreadyUsed;
    }

    if (alreadyUsed) {
      throw new Error(`port(${alreadyUsed.port}) already in use for ${alreadyUsed.name}`);
    }
    const session = new BackendSession(config);
    return session;
  }

  readonly sock: net.Socket;
  messagePort?: MessagePortMain;
  constructor(readonly config: Illthorn.Session.Config) {
    super();
    this.sock = net.createConnection(config);
    log("opening session %s -> :%s", this.name, this.port);
    SessionMap.set(this.name, this);
    this.sock.on("close", () => this.onClose());
    this.sock.on("data", (data) => this.onLichMessage(data.toString()));
    ipcMain.on(`${this.name}message`, (data) => this.onFrontendMessage(data));
  }

  get port() {
    return this.config.port;
  }

  get name() {
    return this.config.name;
  }

  toJSON() {
    return { ...this.config };
  }

  onClose() {
    SessionMap.delete(this.name);
  }

  onLichMessage(msg: string) {
    //log("--- %s:lich:message --- \n %s ----------", this.name, msg)
    // proxy it to the frontend via the port
    useWebContents().send(`${this.name}/lich/message`, msg);
  }

  onFrontendMessage(_msg: Electron.IpcMainEvent) {
    //log("--- %s:frontend:message --- \n %s ----------", this.name, msg)
  }
}
