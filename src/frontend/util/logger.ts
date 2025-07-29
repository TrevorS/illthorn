// ABOUTME: Structured debug logging system using the debug library with namespaced loggers
// ABOUTME: Provides controllable logging via DEBUG environment variable for debugging game events and data flow
import Debug from "debug";
import type { GameTag } from "../parser/tag";

// Main namespace for all Illthorn debug loggers
const NAMESPACE = "illthorn";

// Create namespaced debug loggers for different subsystems
export const debugBus = Debug(`${NAMESPACE}:bus`);
export const debugMetadata = Debug(`${NAMESPACE}:metadata`);
export const debugRawInput = Debug(`${NAMESPACE}:raw-input`);
export const debugEffects = Debug(`${NAMESPACE}:effects`);
export const debugSession = Debug(`${NAMESPACE}:session`);

// Utility function to safely stringify objects for logging
export function safeStringify(obj: unknown, maxLength = 500): string {
  try {
    const str = JSON.stringify(obj, null, 2);
    return str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;
  } catch (error) {
    return `[Unable to stringify: ${error}]`;
  }
}

// Logger utility for metadata events with structured output
export function logMetadataEvent(eventName: string, tag: GameTag, childCount = 0): void {
  debugMetadata(`Event: ${eventName}`);
  debugMetadata(`  Tag: ${tag.name} (${childCount} children)`);
  debugMetadata(`  Attrs: ${safeStringify(tag.attrs)}`);
  if (tag.text?.trim()) {
    debugMetadata(`  Text: "${tag.text.trim()}"`);
  }
}

// Logger utility for bus events
export function logBusEvent(type: "dispatch" | "subscribe", eventName: string, detail?: unknown): void {
  debugBus(`${type.toUpperCase()}: ${eventName}`);
  if (detail !== undefined && type === "dispatch") {
    debugBus(`  Detail: ${safeStringify(detail)}`);
  }
}

// Logger utility for effects component events
export function logEffectsEvent(componentName: string, message: string, data?: unknown): void {
  debugEffects(`[${componentName}] ${message}`);
  if (data !== undefined) {
    debugEffects(`  Data: ${safeStringify(data)}`);
  }
}

// Enable all loggers by default in development mode
if (typeof window !== "undefined" && window.location?.hostname === "localhost") {
  // Only auto-enable if DEBUG env var is not already set
  if (!localStorage.getItem("debug")) {
    localStorage.setItem("debug", `${NAMESPACE}:*`);
  }
}
