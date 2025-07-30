import { debugSessionConnect } from "../util/logger";
import { FrontendSession } from ".";
import { focusSession, renderSessionsMenu } from "./helpers";

// Expose session detection function for debugging
declare global {
  interface Window {
    debugSessionDetection: () => Promise<Array<FrontendSession>>;
  }
}

window.debugSessionDetection = async () => {
  const sessions = await connectAll();
  renderSessionsMenu();

  // Add a test function to simulate game input
  if (sessions.length > 0) {
    const testSession = sessions[0];
    console.log("Adding test content to session:", testSession.name);

    // Simulate some game text after a short delay
    setTimeout(() => {
      testSession.onMessage('You look around.<br>This is a test message.<prompt time="12345">&gt;</prompt>');
    }, 2000);
  }

  return sessions;
};

export async function connectAll(retryCount = 0): Promise<Array<FrontendSession>> {
  debugSessionConnect("connectAll() starting session detection, retry: %d", retryCount);

  try {
    const lichSessions = await window.Session.listAvailable();
    debugSessionConnect("listAvailable() returned: %d sessions %o", lichSessions.length, lichSessions);
    const oldConnections = await window.Session.listConnected();
    debugSessionConnect("listConnected() returned: %d sessions %o", oldConnections.length, oldConnections);
    const allSessions: Array<Illthorn.LichSessionDescriptor | Illthorn.Session.Pojo> = [...lichSessions, ...oldConnections];
    debugSessionConnect("combined sessions to connect: %d sessions %o", allSessions.length, allSessions);

    // If no sessions found and this is the first attempt, retry once after a short delay
    if (allSessions.length === 0 && retryCount === 0) {
      debugSessionConnect("No sessions found on first attempt, retrying in 500ms");
      await new Promise((resolve) => setTimeout(resolve, 500));
      return connectAll(1);
    }

    const sessions = await Promise.all(allSessions.map((descriptor) => FrontendSession.connect(descriptor)));
    debugSessionConnect(
      "FrontendSession.connect completed: %d sessions %o",
      sessions.length,
      sessions.map((s) => s.name),
    );
    debugSessionConnect("sessions=%o", sessions);
    return sessions;
  } catch (error) {
    debugSessionConnect("Error in connectAll(): %o", error);
    if (retryCount === 0) {
      debugSessionConnect("Retrying connectAll() after error");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return connectAll(1);
    }
    throw error;
  }
}

export async function renderAllSessions() {
  debugSessionConnect("renderAllSessions() called");
  const sessions = await connectAll();
  debugSessionConnect("connectAll() returned sessions: %o", sessions);

  // Ensure the sessions menu gets updated immediately after sessions are connected
  renderSessionsMenu();

  const firstSession = sessions[0];
  debugSessionConnect("firstSession: %o", firstSession);
  if (firstSession) {
    debugSessionConnect("calling focusSession with: %s", firstSession.name);
    focusSession(firstSession);
  } else {
    debugSessionConnect("No sessions available");
  }

  // Update the menu again after focusing a session
  renderSessionsMenu();
}
