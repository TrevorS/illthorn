// ABOUTME: Centralized mock objects for testing
// ABOUTME: Provides consistent mock implementations for session, bus, and game components

import { Bus } from '../../src/frontend/util/bus';
import { GameTag, makeTag } from '../../src/frontend/parser/tag';

export interface MockSession {
  bus: Bus;
  parser: Record<string, unknown>;
  ui: undefined;
  hasFocus: boolean;
  history: { length: number };
  name: string;
}

export const createMockSession = (name = 'test-session'): MockSession => ({
  bus: new Bus(),
  parser: {},
  ui: undefined,
  hasFocus: false,
  history: { length: 0 },
  name,
});

export const createMockCompassData = (directions: string[]): GameTag => {
  const children = directions.map(dir => {
    const tag = makeTag('dir');
    tag.attrs = { value: dir };
    return tag;
  });
  const compass = makeTag('compass');
  compass.children = children;
  return compass;
};

export const mockDirections = {
  empty: [],
  basic: ['north', 'south'],
  full: ['north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest'],
  withSpecial: ['north', 'up', 'out'],
} as const;