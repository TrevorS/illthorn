// ABOUTME: Mixin to add automatic state persistence/restoration for session components
// ABOUTME: Saves component state to sessionStorage and restores on reconnection after HMR or sleep/wake

import type { LitElement } from "lit";
import type { FrontendSession } from "../../session/index";

interface WithSession {
  session?: FrontendSession;
}

/**
 * Mixin to add automatic state persistence/restoration for session components
 * Saves component state to sessionStorage and restores on reconnection
 */
// biome-ignore lint/suspicious/noExplicitAny: TypeScript mixins require any[] for constructor parameters
export const SessionStateMixin = <T extends new (...args: any[]) => LitElement & WithSession>(superClass: T) => {
  abstract class SessionStateElement extends superClass {
    /**
     * Override to specify which properties to persist
     * Return an object with the current state to save
     */
    protected abstract getStateToStore(): Record<string, unknown>;

    /**
     * Override to restore state from stored data
     * Called with the parsed data from sessionStorage
     */
    protected abstract restoreState(state: Record<string, unknown>): void;

    /**
     * Override to specify the storage key prefix
     * Default uses the component's tag name
     */
    protected getStorageKeyPrefix(): string {
      return this.tagName.toLowerCase();
    }

    connectedCallback() {
      super.connectedCallback();
      this._restorePersistedState();
    }

    /**
     * Call this method whenever state changes that should be persisted
     */
    protected persistState(): void {
      if (!this.session?.name) {
        return;
      }

      const key = `${this.getStorageKeyPrefix()}-${this.session.name}`;
      const state = this.getStateToStore();

      try {
        sessionStorage.setItem(key, JSON.stringify(state));
      } catch (error) {
        console.warn(`Failed to persist state for ${this.tagName}:`, error);
      }
    }

    private _restorePersistedState(): void {
      if (!this.session?.name) {
        return;
      }

      const key = `${this.getStorageKeyPrefix()}-${this.session.name}`;
      const stored = sessionStorage.getItem(key);

      if (stored) {
        try {
          const state = JSON.parse(stored);
          this.restoreState(state);
        } catch (error) {
          console.warn(`Failed to restore state for ${this.tagName}:`, error);
        }
      }
    }
  }

  return SessionStateElement;
};

/**
 * Type helper for components that use the session state mixin
 */
export type WithSessionState = {
  getStateToStore(): Record<string, unknown>;
  restoreState(state: Record<string, unknown>): void;
  persistState(): void;
};
