// ABOUTME: Simple static session mock for Storybook stories
// ABOUTME: No dynamic events, no console noise, just clean static data

import type { MockSession } from '../../test/mocks/index';
import { createMockSession } from '../../test/mocks/index';

export class SimpleSessionMock {
  private static sessionCounter = 0;
  
  static create(sessionId?: string): MockSession {
    // Create unique session for each story to avoid collisions
    const uniqueId = sessionId || `story-session-${++this.sessionCounter}`;
    const session = createMockSession(uniqueId);
    
    // Override the bus to be completely static - no events, no logging
    session.bus.subscribeEvent = () => {
      // Return a no-op unsubscribe function
      return () => {};
    };
    
    return session;
  }
  
  // Static data setters - set component state directly without events
  static setCompassDirections(component: any, directions: string[]) {
    if (component && component.activeDirs !== undefined) {
      component.activeDirs = directions;
      component.requestUpdate?.();
    }
  }
  
  static setVitalData(component: any, vital: string, value: string, percent: number) {
    const vitalKey = `_${vital}`;
    if (component && component[vitalKey] !== undefined) {
      component[vitalKey] = {
        label: vital,
        value: value,
        percent: percent
      };
      component.requestUpdate?.();
    }
  }
  
  static setHandContent(component: any, content: string) {
    if (component && component._content !== undefined) {
      component._content = content;
      component.requestUpdate?.();
    }
  }
  
  static setSpellEffects(component: any, effects: Array<{name: string, time: string, percent: number}>) {
    if (component && component._spellEffects !== undefined) {
      component._spellEffects = effects.map(effect => ({
        text: effect.name,
        id: effect.name.toLowerCase().replace(/\s+/g, '-'),
        time: effect.time,
        value: effect.percent.toString()
      }));
      component.requestUpdate?.();
    }
  }
}