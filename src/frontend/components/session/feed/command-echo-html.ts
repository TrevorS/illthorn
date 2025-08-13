// DEPRECATED: This file has been replaced by command-echo.lit.ts
// ABOUTME: Static HTML generator for command echo elements - DEPRECATED
// ABOUTME: Use CommandEchoLit component instead - this file can be removed in future versions

export interface CommandEchoOptions {
  command: string;
  isReplay: boolean;
}

/**
 * @deprecated Use CommandEchoLit component instead
 * Generates static HTML for command echo display in the feed
 * Uses DOM creation for clean, maintainable code and proper CSS classes for theming
 */
export function createCommandEchoHTML({ command, isReplay }: CommandEchoOptions): string {
  const prefix = isReplay ? "[Replay]" : ">";
  const cssClass = isReplay ? "command-echo replay" : "command-echo";

  // Create main container
  const container = document.createElement("div");
  container.className = cssClass;

  // Create prefix span
  const prefixSpan = document.createElement("span");
  prefixSpan.className = "prefix";
  prefixSpan.textContent = prefix;

  // Create command text span
  const commandSpan = document.createElement("span");
  commandSpan.className = "command-text";
  commandSpan.textContent = command; // textContent automatically escapes HTML

  // Assemble the structure
  container.appendChild(prefixSpan);
  container.appendChild(commandSpan);

  return container.outerHTML;
}
