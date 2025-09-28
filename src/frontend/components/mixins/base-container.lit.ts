// ABOUTME: Base container component that abstracts common patterns across session-aware containers
// ABOUTME: Provides event handling, session management, and lifecycle hooks for smart components

import { LitElement } from "lit";
import { property } from "lit/decorators.js";
import type { GameTag } from "../../parser/tag";
import type { FrontendSession as Session } from "../../session/index";
import type { Bus } from "../../util/bus";
import { SessionStateMixin } from "./session-state-mixin";

/**
 * Event handler registration for tracking subscriptions
 */
interface EventHandlerRegistration {
  event: string;
  handler: (event: CustomEvent<GameTag>) => void;
  bus: Bus;
}

/**
 * Configuration for session event subscriptions
 */
interface SessionEventConfig {
  eventName: string;
  handler: (event: CustomEvent<GameTag>) => void;
}

/**
 * Base class for container components that need session integration
 * Provides common patterns for event handling, session management, and state persistence
 */
export abstract class BaseContainerComponent extends SessionStateMixin(LitElement) {
  @property({ type: Object })
  session?: Session;

  private _eventHandlers: Array<EventHandlerRegistration> = [];
  private _eventListenerSetup = false;

  /**
   * Override to define which events this container should subscribe to
   * Called when session is available and component needs to setup listeners
   */
  protected abstract getSessionEventSubscriptions(): Array<SessionEventConfig>;

  /**
   * Optional hook for additional setup when session becomes available
   * Called after event listeners are setup
   */
  protected onSessionReady?(session: Session): void;

  /**
   * Optional hook for cleanup when session is removed
   * Called before event listeners are cleaned up
   */
  protected onSessionCleanup?(session: Session): void;

  /**
   * Lifecycle method - handles session property changes
   */
  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has("session")) {
      this._handleSessionChange();
    }
  }

  /**
   * Lifecycle method - connects component and sets up initial listeners
   */
  connectedCallback() {
    super.connectedCallback();
    // Don't setup listeners here, wait for session to be available via updated()
  }

  /**
   * Lifecycle method - disconnects component and cleans up listeners
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    this._cleanupEventListeners();
  }

  /**
   * Handles session property changes and manages event listener lifecycle
   */
  private _handleSessionChange() {
    if (this.session) {
      // Always cleanup and re-setup when session changes (handles session switching)
      this._cleanupEventListeners();
      this._setupEventListeners();
      this._eventListenerSetup = true;
    } else if (this._eventListenerSetup) {
      this._cleanupEventListeners();
      this._eventListenerSetup = false;
    }
  }

  /**
   * Sets up event listeners based on component's event configuration
   */
  private _setupEventListeners() {
    this._cleanupEventListeners();

    if (!this.session?.bus) {
      return;
    }

    const bus = this.session.bus;
    const subscriptions = this.getSessionEventSubscriptions();

    // Register all event subscriptions
    for (const { eventName, handler } of subscriptions) {
      bus.subscribeEvent<GameTag>(eventName, handler);
      this._eventHandlers.push({ event: eventName, handler, bus });
    }

    // Call optional session ready hook
    this.onSessionReady?.(this.session);
  }

  /**
   * Cleans up all event listeners
   */
  private _cleanupEventListeners() {
    // Call optional session cleanup hook
    if (this.session) {
      this.onSessionCleanup?.(this.session);
    }

    // Unsubscribe from all events using the bus's internal element
    for (const { event, handler, bus } of this._eventHandlers) {
      if (bus?._ele) {
        bus._ele.removeEventListener(event, handler as EventListener);
      }
    }
    this._eventHandlers = [];
  }

  /**
   * Helper method to create event handler that persists state after update
   * Common pattern: update internal state and persist to storage
   */
  protected createStatePersistingHandler<T>(updateFn: (tag: GameTag) => T): (event: CustomEvent<GameTag>) => void {
    return ({ detail: tag }: CustomEvent<GameTag>) => {
      updateFn(tag);
      this.persistState();
    };
  }

  /**
   * Helper method to check if session is available and ready
   */
  protected get isSessionReady(): boolean {
    return !!this.session?.bus;
  }

  /**
   * Helper method to safely get the session bus
   */
  protected get sessionBus(): Bus | undefined {
    return this.session?.bus;
  }
}
