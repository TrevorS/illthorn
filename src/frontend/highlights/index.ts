// ABOUTME: Highlight manager singleton export and convenience functions
// ABOUTME: Provides centralized access to the highlight management system

export type { CompiledPattern } from "./manager";
export { HighlightManager, highlightManager } from "./manager";

// Convenience functions for easy access
export const getHighlightManager = () => import("./manager").then((m) => m.highlightManager);
