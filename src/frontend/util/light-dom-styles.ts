// ABOUTME: Shared utility for adopting Lit component styles into Light DOM components
// ABOUTME: Prevents duplicate style injection and provides consistent style management across components
import type { CSSResult } from "lit";

/**
 * Adopts styles for a Light DOM Lit component by injecting CSS into document head
 * @param componentName - Unique identifier for the component (used as data attribute)
 * @param styles - Lit CSSResult containing the component styles
 */
export function adoptLightDomStyles(componentName: string, styles: CSSResult): void {
  const existingStyle = document.head.querySelector(`style[data-lit-component="${componentName}"]`);

  if (!existingStyle) {
    const style = document.createElement("style");
    style.setAttribute("data-lit-component", componentName);
    style.textContent = styles.cssText;
    document.head.appendChild(style);
  }
}
