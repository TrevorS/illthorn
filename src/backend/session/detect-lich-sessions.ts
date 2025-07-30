import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { debugSession } from "../logger";
import * as json from "../util/json";

const scriptingSessionDir = path.join(os.tmpdir(), "simutronics", "sessions");

export async function detectLichSessions(): Promise<Illthorn.LichSessionDescriptor[]> {
  debugSession("detectLichSessions() checking directory: %s", scriptingSessionDir);

  try {
    if (!(await json.exists(scriptingSessionDir))) {
      debugSession("no scripting session dir exists at %s", scriptingSessionDir);
      return [];
    }

    const files = await fs.readdir(scriptingSessionDir);
    debugSession("found files in sessions dir: %o", files);

    if (files.length === 0) {
      debugSession("sessions directory is empty");
      return [];
    }

    const pendingSessions = files.map(async (file: string) => {
      const filePath = path.join(scriptingSessionDir, file);
      debugSession("reading session file: %s", filePath);
      try {
        const descriptor = await json.read<Illthorn.LichSessionDescriptor>(filePath);
        debugSession("parsed session descriptor: %o", descriptor);

        // Validate the descriptor has required fields
        if (!descriptor.name || !descriptor.port) {
          debugSession("invalid session descriptor missing name or port: %o", descriptor);
          return null;
        }

        return descriptor;
      } catch (error) {
        debugSession("failed to read session file %s: %o", filePath, error);
        // Don't throw, just return null and filter it out later
        return null;
      }
    });

    const sessionsOrNull = await Promise.all(pendingSessions);
    const sessions = sessionsOrNull.filter((session): session is Illthorn.LichSessionDescriptor => session !== null);
    debugSession("final sessions list: %d sessions %o", sessions.length, sessions);

    return sessions.sort((a, b) => a.port - b.port);
  } catch (error) {
    debugSession("Error in detectLichSessions(): %o", error);
    return [];
  }
}
