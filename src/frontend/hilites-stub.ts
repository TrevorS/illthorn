// ABOUTME: Temporary stub for legacy hilites system during Phase 2 transition
// ABOUTME: This file will be removed in Phase 3 when new config-based highlighting is implemented

// TEMP: Stub function for transition period - will be replaced with config-based highlighting in Phase 3
export async function reloadHilites(): Promise<Array<[RegExp, string]>> {
  console.debug("reloadHilites: no-op (legacy hilites system removed)");
  // No highlights loaded during transition
  return [];
}
