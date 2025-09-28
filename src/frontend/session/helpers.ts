import { IllthornEvent } from "../events";
import { Illthorn } from "../illthorn";
import type { GameTag } from "../parser/tag";
import { debugMetadata, debugSession, logMetadataEvent } from "../util/logger";
import type { FrontendSession, FrontendSession as Session } from ".";
import { SessionMap } from "./map";

export function endSession(session: Session) {
  if (!session.ui?.feed) return;
  //session.socket.end()
  const pre = document.createElement("pre");
  pre.classList.add("session-closed");
  pre.innerText = `\n*** ${session.name} / Connection Closed ***`;
  const frag = document.createDocumentFragment();
  frag.appendChild(pre);
  session.ui.feed.appendChild(frag);
  SessionMap.delete(session.name);
  renderSessionsMenu();
}

export function currentSession(): FrontendSession | undefined {
  const pair = Array.from(SessionMap).find(([_name, sess]) => sess.hasFocus);
  if (pair) return pair[1];
  return undefined;
}

export function focusSession(session: Session) {
  debugSession("focusSession called with: %s hasFocus: %s", session.name, session.hasFocus);
  if (session.hasFocus) return session; // noop
  Array.from(SessionMap).forEach(([_, otherSession]) => {
    otherSession.hasFocus = otherSession === session;
  });

  debugSession("dispatching SESSION_FOCUS event for: %s", session.name);
  Illthorn.bus.dispatchEvent(IllthornEvent.SESSION_FOCUS, session);
  return session;
}

export function sendCommandToGame(session: Session, cmd: string, _id = "cli") {
  cmd = cmd.toString().trim();
  if (cmd.length === 0) return;
  const prompt = session.ui?.feed?.querySelector("prompt:last-child");
  if (prompt) prompt.textContent += cmd;
  session.sendCommand(cmd);
  return session;
}

export function dispatchMetadata(session: Session, tag: GameTag) {
  if (tag.name === "LaunchURL") return handleLaunchUrl(tag);
  if (tag.name === "notification") return handleNotification(session, tag);
  const namespace = tag.attrs.id ? [tag.name, tag.attrs.id] : [tag.name];
  namespace.unshift("metadata");
  const eventName = namespace.join("/");

  // Log the event dispatch with structured data
  logMetadataEvent(eventName, tag, tag.children.length);
  if (tag.attrs.id) {
    debugMetadata(`  Namespaced with id: ${tag.attrs.id}`);
  }

  session.bus.dispatchEvent(eventName, tag);

  // Log child processing
  const childrenToProcess = tag.children.filter((child) => ![":text", "a", "dir", "d"].includes(child.name));
  if (childrenToProcess.length > 0) {
    debugMetadata(`  Processing ${childrenToProcess.length} children: ${childrenToProcess.map((c) => c.name).join(", ")}`);
  }

  tag.children.forEach((child) => {
    if ([":text", "a", "dir", "d"].includes(child.name)) return;
    dispatchMetadata(session, child);
  });
}

export function handleLaunchUrl(tag: GameTag) {
  const url = `https://www.play.net${tag.attrs.src}`;
  window.open(url, "_blank");
}

export function handleNotification(session: Session, tag: GameTag) {
  const { attrs } = tag;
  new Notification(`${session.name} / ${attrs.title}`, attrs);
}

export function renderSessionsMenu() {
  // The app root component now handles session menu rendering
  // This function is kept for API compatibility and triggers component updates
  const appRoot = document.querySelector("illthorn-app-lit") as HTMLElement & { updateSessionsList?: () => void };
  appRoot?.updateSessionsList?.();
}
