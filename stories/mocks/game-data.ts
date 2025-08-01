// ABOUTME: Game data generators for realistic Storybook component testing
// ABOUTME: Creates structured GameTag objects that match actual game server responses

import type { GameTag, TagName } from '../../src/frontend/parser/tag';
import { makeTag } from '../../src/frontend/parser/tag';

export const StorybookGameData = {
  // Vital data generators
  createVitalUpdate(type: 'health' | 'mana' | 'stamina' | 'spirit' | 'mind', value: number, max: number): GameTag {
    const tag = makeTag('progressBar' as TagName);
    tag.attrs = {
      id: type,
      value: value.toString(),
      text: `${value}/${max}`,
    };
    return tag;
  },
  
  // Spell effect generators
  createSpellEffect(name: string, duration: number = 0): GameTag {
    const tag = makeTag('spell' as TagName);
    tag.attrs = {
      value: name,
    };
    
    if (duration > 0) {
      tag.attrs = { ...tag.attrs, duration: duration.toString() };
    }
    
    return tag;
  },
  
  // Injury data generators
  createInjury(location: string, severity: 'minor' | 'moderate' | 'major' | 'severe'): GameTag {
    const tag = makeTag('injury' as TagName);
    tag.attrs = {
      location,
      severity,
    };
    return tag;
  },
  
  // Room description generator
  createRoom(title: string, description: string): GameTag {
    const tag = makeTag('room' as TagName);
    tag.attrs = {
      title,
      description,
    };
    return tag;
  },
  
  // Compass direction generators
  createCompass(directions: Array<string>): GameTag {
    const children = directions.map((dir) => {
      const tag = makeTag('dir' as TagName);
      tag.attrs = { value: dir };
      return tag;
    });
    const compass = makeTag('compass' as TagName);
    compass.children = children;
    return compass;
  },
  
  // Hand/inventory generators
  createHand(side: 'left' | 'right', item?: string): GameTag {
    const tag = makeTag('hand' as TagName);
    tag.attrs = {
      side,
      item: item || 'Empty',
    };
    return tag;
  },
  
  // Timer generators
  createCastTime(duration: number): GameTag {
    const tag = makeTag('castTime' as TagName);
    tag.attrs = {
      value: duration.toString(),
    };
    return tag;
  },
  
  createRoundTime(duration: number): GameTag {
    const tag = makeTag('roundTime' as TagName);
    tag.attrs = {
      value: duration.toString(),
    };
    return tag;
  },
  
  // Preset game states for common scenarios
  presets: {
    fullHealth: {
      health: (max = 100) => StorybookGameData.createVitalUpdate('health', max, max),
      mana: (max = 80) => StorybookGameData.createVitalUpdate('mana', max, max),
      stamina: (max = 90) => StorybookGameData.createVitalUpdate('stamina', max, max),
      spirit: (max = 100) => StorybookGameData.createVitalUpdate('spirit', max, max),
      mind: (max = 100) => StorybookGameData.createVitalUpdate('mind', max, max),
    },
    
    criticalHealth: {
      health: (max = 100) => StorybookGameData.createVitalUpdate('health', 15, max),
      mana: (max = 80) => StorybookGameData.createVitalUpdate('mana', 5, max),
      stamina: (max = 90) => StorybookGameData.createVitalUpdate('stamina', 20, max),
      spirit: (max = 100) => StorybookGameData.createVitalUpdate('spirit', 85, max),
      mind: (max = 100) => StorybookGameData.createVitalUpdate('mind', 95, max),
    },
    
    commonSpells: [
      'Bless',
      'Spirit Warding I',
      'Spirit Warding II', 
      'Spirit Defense',
      'Elemental Defense I',
      'Elemental Defense II',
      'Thurfel\'s Ward',
      'Mass Blur',
      'Prayer of Protection',
    ],
    
    sampleInjuries: [
      { location: 'left arm', severity: 'minor' as const },
      { location: 'right leg', severity: 'moderate' as const },
      { location: 'head', severity: 'major' as const },
      { location: 'chest', severity: 'severe' as const },
    ],
    
    sampleRooms: {
      townSquare: {
        title: 'Wehnimer\'s Landing, Town Square',
        description: 'The bustling town square of Wehnimer\'s Landing is always alive with activity. Merchants hawk their wares, adventurers gather to form groups, and the occasional thief tries to blend into the crowd.',
      },
      tavern: {
        title: 'The Raging Thrak Inn, Trophy Room',
        description: 'The walls of this cozy room are covered with trophies and weapons from countless adventures. A fire crackles merrily in the fireplace, casting dancing shadows across the wooden floor.',
      },
      wilderness: {
        title: 'Upper Trollfang, Pine Forest',
        description: 'Tall pine trees stretch toward the sky, their branches creating a canopy that filters the sunlight into dappled patterns on the forest floor. The air is crisp and filled with the scent of pine needles.',
      },
    },
    
    commonDirections: {
      basic: ['north', 'south', 'east', 'west'],
      full: ['north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest'],
      withSpecial: ['north', 'up', 'out', 'gate'],
      indoor: ['north', 'south', 'east', 'west', 'up', 'down'],
    },
  },
};

// Helper function to apply a full game state quickly
export const applyGameState = (sessionMock: any, stateName: 'healthy' | 'critical' | 'injured') => {
  const { StorybookSessionMock } = window as any;
  
  switch (stateName) {
    case 'healthy':
      Object.entries(StorybookGameData.presets.fullHealth).forEach(([vital, generator]) => {
        StorybookSessionMock.simulateGameEvent(`progressBar/${vital}`, generator());
      });
      break;
      
    case 'critical':
      Object.entries(StorybookGameData.presets.criticalHealth).forEach(([vital, generator]) => {
        StorybookSessionMock.simulateGameEvent(`progressBar/${vital}`, generator());
      });
      break;
      
    case 'injured':
      StorybookGameData.presets.sampleInjuries.forEach((injury, index) => {
        StorybookSessionMock.simulateGameEvent('injury', 
          StorybookGameData.createInjury(injury.location, injury.severity), 
          index * 50
        );
      });
      break;
  }
};