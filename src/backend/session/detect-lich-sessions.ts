import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import * as json from "../util/json";

const scriptingSessionDir = path.join(os.tmpdir(), "simutronics", "sessions");

export async function detectLichSessions(): Promise<Illthorn.LichSessionDescriptor[]> {
  console.log("DEBUG: detectLichSessions() checking directory:", scriptingSessionDir);

  try {
    if (!(await json.exists(scriptingSessionDir))) {
      console.warn("no scripting session dir exists at %s", scriptingSessionDir);
      return [];
    }

    const files = await fs.readdir(scriptingSessionDir);
    console.log("DEBUG: found files in sessions dir:", files);

    if (files.length === 0) {
      console.log("DEBUG: sessions directory is empty");
      return [];
    }

    const pendingSessions = files.map(async (file: string) => {
      const filePath = path.join(scriptingSessionDir, file);
      console.log("DEBUG: reading session file:", filePath);
      try {
        const descriptor = await json.read<Illthorn.LichSessionDescriptor>(filePath);
        console.log("DEBUG: parsed session descriptor:", descriptor);

        // Validate the descriptor has required fields
        if (!descriptor.name || !descriptor.port) {
          console.warn("DEBUG: invalid session descriptor missing name or port:", descriptor);
          return null;
        }

        return descriptor;
      } catch (error) {
        console.error("DEBUG: failed to read session file", filePath, error);
        // Don't throw, just return null and filter it out later
        return null;
      }
    });

    const sessionsOrNull = await Promise.all(pendingSessions);
    const sessions = sessionsOrNull.filter((session): session is Illthorn.LichSessionDescriptor => session !== null);
    console.log("DEBUG: final sessions list:", sessions.length, sessions);

    return sessions.sort((a, b) => a.port - b.port);
  } catch (error) {
    console.error("DEBUG: Error in detectLichSessions():", error);
    return [];
  }
}
