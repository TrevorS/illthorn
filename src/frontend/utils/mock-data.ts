// ABOUTME: Mock data generators for Storybook stories and testing
// ABOUTME: Provides realistic game data for input system component development

export interface MockRoomData {
  id: string;
  title: string;
  zone: 'town' | 'wilderness' | 'dungeon' | 'special';
}

export interface MockNavigationData {
  exits: Array<string>;
  special: Array<string>;
  blocked: Array<string>;
}

export interface MockStatusData {
  roundtime: number;
  casttime: number;
  mindState: 'clear' | 'muddled' | 'confused' | 'stunned';
  stance: 'offensive' | 'advance' | 'forward' | 'neutral' | 'guarded' | 'defensive';
  health: number;
  mana: number;
  stamina: number;
  spirit: number;
}

export interface MockSessionData {
  room: MockRoomData;
  navigation: MockNavigationData;
  status: MockStatusData;
  promptState: 'normal' | 'roundtime' | 'casting' | 'stunned' | 'dead' | 'sleeping';
}

export class MockDataGenerator {
  private static readonly ROOMS: Array<MockRoomData> = [
    { id: '7120', title: 'Town Square Central', zone: 'town' },
    { id: '7121', title: '[Wehnimer\'s, North Ring Rd.]', zone: 'town' },
    { id: '7122', title: '[Temple, Antechamber]', zone: 'town' },
    { id: '1234', title: 'Dark Forest Path', zone: 'wilderness' },
    { id: '1235', title: '[Abandoned Cottage, Overgrown Garden]', zone: 'wilderness' },
    { id: '1236', title: '[Old Mine Shaft, Entrance]', zone: 'wilderness' },
    { id: '5678', title: 'Cavern Entrance', zone: 'dungeon' },
    { id: '5679', title: '[Dark Tunnels, Ancient Chamber]', zone: 'dungeon' },
    { id: '5680', title: '[Kobold Lair, Main Hall]', zone: 'dungeon' },
    { id: '9999', title: '[The Rift, Temporal Nexus]', zone: 'special' },
    { id: '9998', title: '[Wizard Tower, Crystalline Observatory]', zone: 'special' },
    { id: '9997', title: '[Prison Cell]', zone: 'special' }
  ];

  private static readonly LONG_ROOM_TITLES: Array<string> = [
    '[The Grand Hall of the Ancient Dwarven Kings of the Eastern Mountain Range]',
    '[Wehnimer\'s Landing, Town Square Central - The Heart of Commerce and Adventure]',
    '[The Abandoned Cottage\'s Overgrown Garden Where Wild Roses Bloom Among Forgotten Dreams]',
    '[Dark Forest Path Leading Through Ancient Oaks and Twisted Brambles to Unknown Dangers]'
  ];

  private static readonly COMMANDS: Array<string> = [
    'look',
    'go north',
    'attack goblin',
    'cast 401',
    'search',
    'get all',
    'put sword in backpack',
    'look in chest',
    'open door',
    'climb stairs'
  ];

  private static readonly SUGGESTIONS: Array<{command: string; description: string}> = [
    { command: 'look', description: 'Examine your surroundings' },
    { command: 'look in', description: 'Look inside container' },
    { command: 'look at', description: 'Examine specific item' },
    { command: 'look behind', description: 'Look behind object' },
    { command: 'go north', description: 'Move to the north' },
    { command: 'go east', description: 'Move to the east' },
    { command: 'go south', description: 'Move to the south' },
    { command: 'go west', description: 'Move to the west' },
    { command: 'attack', description: 'Attack a target' },
    { command: 'cast', description: 'Cast a spell' },
    { command: 'get', description: 'Pick up an item' },
    { command: 'drop', description: 'Drop an item' },
    { command: 'open', description: 'Open a container' },
    { command: 'close', description: 'Close a container' },
    { command: 'search', description: 'Search the area' }
  ];

  static generateRoom(): MockRoomData {
    const rooms = this.ROOMS;
    return { ...rooms[Math.floor(Math.random() * rooms.length)] };
  }

  static generateLongRoomTitle(): string {
    return this.LONG_ROOM_TITLES[Math.floor(Math.random() * this.LONG_ROOM_TITLES.length)];
  }

  static generateExits(): Array<string> {
    const allExits = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw', 'up', 'down', 'out'];
    const count = Math.floor(Math.random() * 8) + 1; // 1-8 exits
    const shuffled = [...allExits].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  static generateNavigation(): MockNavigationData {
    const exits = this.generateExits();
    const specialExits = Math.random() > 0.7 ? ['gate', 'door', 'path'] : [];
    const blockedExits = Math.random() > 0.8 ? ['web', 'ice'] : [];

    return {
      exits,
      special: specialExits,
      blocked: blockedExits
    };
  }

  static generateStatus(): MockStatusData {
    return {
      roundtime: Math.random() > 0.7 ? Math.floor(Math.random() * 10) : 0,
      casttime: Math.random() > 0.8 ? Math.floor(Math.random() * 5) : 0,
      mindState: ['clear', 'muddled', 'confused', 'stunned'][Math.floor(Math.random() * 4)] as any,
      stance: ['offensive', 'advance', 'forward', 'neutral', 'guarded', 'defensive'][Math.floor(Math.random() * 6)] as any,
      health: Math.floor(Math.random() * 100) + 1,
      mana: Math.floor(Math.random() * 100) + 1,
      stamina: Math.floor(Math.random() * 100) + 1,
      spirit: Math.floor(Math.random() * 100) + 1
    };
  }

  static generatePromptState(): MockSessionData['promptState'] {
    const states: Array<MockSessionData['promptState']> = ['normal', 'roundtime', 'casting', 'stunned', 'dead', 'sleeping'];
    return states[Math.floor(Math.random() * states.length)];
  }

  static generateSessionData(): MockSessionData {
    return {
      room: this.generateRoom(),
      navigation: this.generateNavigation(),
      status: this.generateStatus(),
      promptState: this.generatePromptState()
    };
  }

  static generateCommandHistory(): Array<string> {
    const count = Math.floor(Math.random() * 10) + 5; // 5-14 commands
    const shuffled = [...this.COMMANDS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  static generateSuggestions(prefix?: string): Array<{command: string; description: string}> {
    if (prefix) {
      return this.SUGGESTIONS.filter(s => s.command.startsWith(prefix.toLowerCase()));
    }
    return [...this.SUGGESTIONS].sort(() => Math.random() - 0.5).slice(0, 5);
  }

  // Predefined scenarios for consistent testing
  static scenarios = {
    newPlayer: (): MockSessionData => ({
      room: { id: '7120', title: 'Town Square Central', zone: 'town' },
      navigation: { exits: ['n', 'e', 's', 'w'], special: [], blocked: [] },
      status: { roundtime: 0, casttime: 0, mindState: 'clear', stance: 'defensive', health: 100, mana: 100, stamina: 100, spirit: 100 },
      promptState: 'normal'
    }),

    combat: (): MockSessionData => ({
      room: { id: '1234', title: '[Arena, Fighting Grounds]', zone: 'dungeon' },
      navigation: { exits: ['out'], special: [], blocked: [] },
      status: { roundtime: 3, casttime: 0, mindState: 'clear', stance: 'offensive', health: 75, mana: 50, stamina: 40, spirit: 90 },
      promptState: 'roundtime'
    }),

    casting: (): MockSessionData => ({
      room: { id: '7122', title: '[Temple, Antechamber]', zone: 'town' },
      navigation: { exits: ['n', 's'], special: ['altar'], blocked: [] },
      status: { roundtime: 0, casttime: 4, mindState: 'clear', stance: 'defensive', health: 100, mana: 30, stamina: 100, spirit: 100 },
      promptState: 'casting'
    }),

    noExits: (): MockSessionData => ({
      room: { id: '9997', title: '[Prison Cell]', zone: 'special' },
      navigation: { exits: [], special: [], blocked: [] },
      status: { roundtime: 0, casttime: 0, mindState: 'confused', stance: 'defensive', health: 50, mana: 100, stamina: 100, spirit: 100 },
      promptState: 'stunned'
    }),

    fullCompass: (): MockSessionData => ({
      room: { id: '7120', title: 'Town Square Central', zone: 'town' },
      navigation: { exits: ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'], special: ['gate', 'shop'], blocked: [] },
      status: { roundtime: 0, casttime: 0, mindState: 'clear', stance: 'neutral', health: 100, mana: 100, stamina: 100, spirit: 100 },
      promptState: 'normal'
    })
  };
}