// ABOUTME: Enhanced session mocking specifically for Storybook component isolation
// ABOUTME: Builds on existing test mocks but adds event simulation and UI component references

import type { MockSession } from '../../test/mocks/index';
import { createMockSession } from '../../test/mocks/index';

export class StorybookSessionMock {
  private static instance: MockSession | null = null;
  
  static create(sessionId: string = 'storybook-session'): MockSession {
    // Create fresh instance for each story
    this.instance = createMockSession(sessionId);
    
    // Enhance with Storybook-specific features
    this.instance.bus.subscribeEvent = (eventName: string, callback: Function) => {
      // console.log(`Storybook: Subscribed to ${eventName}`); // Disabled - too noisy
      
      // Store callback for later event simulation
      if (!(window as any).storybookCallbacks) {
        (window as any).storybookCallbacks = new Map();
      }
      (window as any).storybookCallbacks.set(eventName, callback);
      
      return () => {
        // console.log(`Storybook: Unsubscribed from ${eventName}`); // Disabled - too noisy
        (window as any).storybookCallbacks?.delete(eventName);
      };
    };
    
    // Mock UI component references
    this.instance.ui = {
      vitals: null,
      effects: null,
      compass: null,
      injuries: null,
      panel: null,
      feed: null,
      room: null,
    };
    
    // Mock session state
    this.instance.hasFocus = true;
    this.instance.history = { length: 0 };
    
    return this.instance;
  }
  
  static emitEvent(eventName: string, data: any) {
    // console.log(`Storybook: Emitting ${eventName}`, data); // Disabled - too noisy
    
    // Trigger subscribed callbacks with proper CustomEvent structure
    const callbacks = (window as any).storybookCallbacks;
    if (callbacks?.has(eventName)) {
      const callback = callbacks.get(eventName);
      // Create a CustomEvent-like object with detail property
      const mockEvent = { detail: data };
      callback(mockEvent);
    }
    
    // Also dispatch as DOM event for components that listen differently
    document.dispatchEvent(new CustomEvent(eventName, { detail: data }));
  }
  
  static simulateGameEvent(eventType: string, data: any, delay: number = 100) {
    setTimeout(() => {
      this.emitEvent(`metadata/${eventType}`, data);
    }, delay);
  }
  
  static reset() {
    this.instance = null;
    (window as any).storybookCallbacks?.clear();
  }
}

// Global helper for stories to trigger events easily
(window as any).StorybookSessionMock = StorybookSessionMock;