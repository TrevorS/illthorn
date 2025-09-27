import debug from "debug";

// Main namespace for all backend debug loggers
const NAMESPACE = "illthorn:backend";

// Create namespaced debug loggers for different backend subsystems
export const debugBackend = debug(NAMESPACE);
export const debugSession = debug(`${NAMESPACE}:session`);
export const debugIpc = debug(`${NAMESPACE}:ipc`);
export const debugConfig = debug(`${NAMESPACE}:config`);

// Legacy export for backward compatibility
export const log = debugBackend;
