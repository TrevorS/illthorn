import { ipcMain as Backend } from "electron";
import { debugBackend, debugIpc } from "../logger";
import { BackendSession } from ".";
import { SessionMap } from "./map";
import { SessionMethods } from "./methods";

debugBackend("attaching session ipc handlers");

Backend.handle(SessionMethods.Connect, async (_event, config: Illthorn.Session.Config) => {
  try {
    return (await BackendSession.connect(config)).toJSON();
  } catch (err) {
    return err;
  }
});

Backend.handle(SessionMethods.ListConnected, () => {
  debugIpc("IPC handler for ListConnected called, SessionMap size: %d", SessionMap.size);
  const connectedSessions = Array.from(SessionMap).map(([_name, session]) => session.toJSON());
  debugIpc("IPC handler returning connected sessions: %d sessions %o", connectedSessions.length, connectedSessions);
  return connectedSessions;
});

Backend.handle(SessionMethods.ListAvailable, async () => {
  debugIpc("IPC handler for ListAvailable called");
  const sessions = await BackendSession.listAvailable();
  debugIpc("IPC handler returning sessions: %d sessions %o", sessions.length, sessions);
  return sessions;
});

Backend.handle(SessionMethods.SendCommand, async (_event, req: { to: string; command: string }) => {
  const session = SessionMap.get(req.to);
  if (!session) {
    throw new Error(`no session found for ${req.to}`);
  }

  session.sock.write(`${req.command}\r\n`);
  return { ok: true };
});
