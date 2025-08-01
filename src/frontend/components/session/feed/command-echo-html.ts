// ABOUTME: Static HTML generator for command echo elements
// ABOUTME: Converts command echo data to themed HTML without Lit component overhead

export interface CommandEchoOptions {
  command: string;
  isReplay: boolean;
}

/**
 * Generates static HTML for command echo display in the feed
 * Uses CSS custom properties for theming integration
 */
export function createCommandEchoHTML({ command, isReplay }: CommandEchoOptions): string {
  const prefix = isReplay ? "[Replay]" : ">";
  const cssClass = isReplay ? "command-echo replay" : "command-echo";

  return `<div class="${cssClass}" style="display: block; font-family: var(--font-family-monospace, 'MonoLisa', monospace); font-size: 0.9em; line-height: 2.2; margin: 2px 0; color: var(--color-command-echo${isReplay ? "-replay" : ""}, var(--color-text-secondary, ${isReplay ? "#ffcc00" : "#ccc"})); padding: 1px 0; border-left: 1px solid var(--color-command-echo${isReplay ? "-replay" : ""}-border, var(--color-border, ${isReplay ? "#ff9900" : "#666"})); background-color: var(--color-command-echo${isReplay ? "-replay" : ""}-bg, var(--color-surface-secondary, ${isReplay ? "rgba(255, 204, 0, 0.1)" : "rgba(255, 255, 255, 0.05)"})); ${isReplay ? "font-style: italic;" : ""}"><span class="prefix" style="opacity: 0.8; margin-left: 5px; margin-right: 5px;">${prefix}</span><span class="command-text" style="font-weight: normal; font-style: italic;">${escapeHtml(command)}</span></div>`;
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
