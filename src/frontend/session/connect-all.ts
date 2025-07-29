import { FrontendSession } from ".";
import { focusSession, renderSessionsMenu } from "./helpers";

// Expose session detection function for debugging
declare global {
  interface Window {
    debugSessionDetection: () => Promise<Array<FrontendSession>>;
  }
}

window.debugSessionDetection = async () => {
  console.log("=== MANUAL SESSION DETECTION DEBUG ===");
  console.log("Testing session detection manually...");
  const sessions = await connectAll();
  console.log("Manual detection result:", sessions.length, "sessions found");
  sessions.forEach((session) => console.log("- Session:", session.name, "port:", session.port));
  renderSessionsMenu();
  return sessions;
};

export async function connectAll(retryCount = 0): Promise<Array<FrontendSession>> {
  console.log("DEBUG: connectAll() starting session detection, retry:", retryCount);

  try {
    const lichSessions = await window.Session.listAvailable();
    console.log("DEBUG: listAvailable() returned:", lichSessions.length, "sessions:", lichSessions);
    const oldConnections = await window.Session.listConnected();
    console.log("DEBUG: listConnected() returned:", oldConnections.length, "sessions:", oldConnections);
    const allSessions: Array<Illthorn.LichSessionDescriptor | Illthorn.Session.Pojo> = [...lichSessions, ...oldConnections];
    console.log("DEBUG: combined sessions to connect:", allSessions.length, allSessions);

    // If no sessions found and this is the first attempt, retry once after a short delay
    if (allSessions.length === 0 && retryCount === 0) {
      console.log("DEBUG: No sessions found on first attempt, retrying in 500ms");
      await new Promise((resolve) => setTimeout(resolve, 500));
      return connectAll(1);
    }

    const sessions = await Promise.all(allSessions.map((descriptor) => FrontendSession.connect(descriptor)));
    console.log(
      "DEBUG: FrontendSession.connect completed, sessions:",
      sessions.length,
      sessions.map((s) => s.name),
    );
    console.log("sessions=%o", sessions);
    return sessions;
  } catch (error) {
    console.error("DEBUG: Error in connectAll():", error);
    if (retryCount === 0) {
      console.log("DEBUG: Retrying connectAll() after error");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return connectAll(1);
    }
    throw error;
  }
}

export async function renderAllSessions() {
  console.log("DEBUG: renderAllSessions() called");
  const sessions = await connectAll();
  console.log("DEBUG: connectAll() returned sessions:", sessions);

  // Ensure the sessions menu gets updated immediately after sessions are connected
  renderSessionsMenu();

  const firstSession = sessions[0];
  console.log("DEBUG: firstSession:", firstSession);
  if (firstSession) {
    console.log("DEBUG: calling focusSession with:", firstSession.name);
    focusSession(firstSession);
  } else {
    console.log("DEBUG: No sessions available");
  }

  // Update the menu again after focusing a session
  renderSessionsMenu();
}
