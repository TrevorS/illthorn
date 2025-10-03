// ABOUTME: Type-safe test helpers for querying custom DOM elements in shadow roots
// ABOUTME: Eliminates the need for 'as any' type assertions in test files

import type { EffectsUI } from "../../src/frontend/components/session/effects/effects-ui.lit";
import type { SpellEffect } from "../../src/frontend/components/session/effects/spell-effect.lit";
import type { HandsUI } from "../../src/frontend/components/session/hands/hands-ui.lit";
import type { InjuriesUI } from "../../src/frontend/components/session/injuries/injuries-ui.lit";
// Import all the UI component types we need to query
import type { VitalsUI } from "../../src/frontend/components/session/vitals/vitals-ui.lit";

/**
 * Type-safe querySelector for custom elements in shadow roots
 * Returns properly typed component or null if not found
 */
export function queryComponent<T extends HTMLElement>(root: ShadowRoot | null | undefined, selector: string): T | null {
  if (!root) return null;
  return root.querySelector(selector) as T | null;
}

/**
 * Type-safe querySelectorAll for custom elements
 */
export function queryComponents<T extends HTMLElement>(root: ShadowRoot | null | undefined, selector: string): Array<T> {
  if (!root) return [];
  return Array.from(root.querySelectorAll(selector)) as Array<T>;
}

/**
 * Specific helpers for commonly queried UI components
 * These provide better IntelliSense and catch typos at compile time
 */
export const queryVitalsUI = (root: ShadowRoot | null | undefined): VitalsUI | null => queryComponent<VitalsUI>(root, "illthorn-vitals-ui");

export const queryEffectsUI = (root: ShadowRoot | null | undefined): EffectsUI | null => queryComponent<EffectsUI>(root, "illthorn-effects-ui");

export const queryHandsUI = (root: ShadowRoot | null | undefined): HandsUI | null => queryComponent<HandsUI>(root, "illthorn-hands-ui");

export const queryInjuriesUI = (root: ShadowRoot | null | undefined): InjuriesUI | null => queryComponent<InjuriesUI>(root, "illthorn-injuries-ui");

export const querySpellEffect = (root: ShadowRoot | null | undefined): SpellEffect | null => queryComponent<SpellEffect>(root, "illthorn-spell-effect");

/**
 * Helper for querying multiple components at once
 * Returns an object with all found components
 */
export function queryMultipleComponents<T extends Record<string, HTMLElement>>(root: ShadowRoot | null | undefined, selectors: Record<keyof T, string>): Partial<T> {
  if (!root) return {};

  const result: Partial<T> = {};
  for (const [key, selector] of Object.entries(selectors)) {
    const element = root.querySelector(selector) as T[keyof T] | null;
    if (element) {
      result[key as keyof T] = element;
    }
  }
  return result;
}

/**
 * Assert that a component exists and return it with proper typing
 * Throws an error if the component is not found (useful for tests that require the component)
 */
export function assertComponent<T extends HTMLElement>(root: ShadowRoot | null | undefined, selector: string, componentName?: string): T {
  const component = queryComponent<T>(root, selector);
  if (!component) {
    throw new Error(`Expected ${componentName || selector} to be found in shadow root`);
  }
  return component;
}

/**
 * Wait for a component to appear in the shadow root (useful for async components)
 */
export async function waitForComponent<T extends HTMLElement>(root: ShadowRoot | null | undefined, selector: string, timeout = 1000): Promise<T | null> {
  if (!root) return null;

  return new Promise((resolve) => {
    const startTime = Date.now();

    const checkForComponent = () => {
      const component = queryComponent<T>(root, selector);
      if (component) {
        resolve(component);
        return;
      }

      if (Date.now() - startTime > timeout) {
        resolve(null);
        return;
      }

      setTimeout(checkForComponent, 10);
    };

    checkForComponent();
  });
}
