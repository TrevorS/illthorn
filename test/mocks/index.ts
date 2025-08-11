// ABOUTME: Centralized mock objects for testing
// ABOUTME: Provides consistent mock implementations for session, bus, and game components

import { type GameTag, makeTag, type TagName } from "../../src/frontend/parser/tag";
import { Bus } from "../../src/frontend/util/bus";

export interface MockSession {
  bus: Bus;
  parser: Record<string, unknown>;
  ui: undefined;
  hasFocus: boolean;
  history: { length: number };
  name: string;
  port: number;
  config?: { name: string; port: number };
}

export const createMockSession = (name = "test-session", port = 4000): MockSession => ({
  bus: new Bus(),
  parser: {},
  ui: undefined,
  hasFocus: false,
  history: { length: 0 },
  name,
  port,
  config: { name, port },
});

export const createMockCompassData = (directions: string[]): GameTag => {
  const children = directions.map((dir) => {
    const tag = makeTag("dir" as TagName);
    tag.attrs = { value: dir };
    return tag;
  });
  const compass = makeTag("compass" as TagName);
  compass.children = children;
  return compass;
};

export const mockDirections = {
  empty: [],
  basic: ["north", "south"],
  full: ["north", "south", "east", "west", "northeast", "northwest", "southeast", "southwest"],
  withSpecial: ["north", "up", "out"],
} as const;

// Realistic game element mock data for feed testing
export const createGameLinkTag = (exist: string, noun: string, text: string): GameTag => {
  const tag = makeTag("a");
  tag.attrs = { exist, noun };
  tag.text = text;
  return tag;
};

export const createGameCommandTag = (cmd: string, text: string): GameTag => {
  const tag = makeTag("d");
  tag.attrs = { cmd };
  tag.text = text;
  return tag;
};

export const createGameMonsterTag = (exist: string, noun: string, text: string): GameTag => {
  const monsterTag = makeTag("b");
  const linkChild = createGameLinkTag(exist, noun, text);
  monsterTag.children = [linkChild];
  return monsterTag;
};

export const createTextTag = (text: string): GameTag => {
  const tag = makeTag(":text");
  tag.text = text;
  return tag;
};

export const createPresetTag = (id: string, text: string): GameTag => {
  const tag = makeTag("preset");
  tag.attrs = { id };
  tag.text = text;
  return tag;
};

export const createPromptTag = (time: string = Date.now().toString()): GameTag => {
  const tag = makeTag("prompt");
  tag.attrs = { time };
  tag.text = ">";
  return tag;
};

// Complex game scenarios using real GameTags
export const createCombatScenario = (): Array<GameTag> => [
  createTextTag("A "),
  createGameMonsterTag("orc12345", "orc", "massive orc warrior"),
  createTextTag(" charges into the room!\n"),
  createTextTag("The orc warrior swings a war hammer at you!\n"),
  createTextTag("You can "),
  createGameCommandTag("dodge", "dodge"),
  createTextTag(" or "),
  createGameCommandTag("block", "block"),
  createTextTag(" the attack.\n"),
];

export const createRoomScenario = (): Array<GameTag> => [
  createPresetTag("roomName", "The Town Square"),
  createTextTag("\n"),
  createPresetTag("roomDesc", "This is the heart of the main square of Wehnimer's Landing. The town square is bustling with people."),
  createTextTag("\nObvious exits: "),
  createGameLinkTag("exit_n", "exit", "north"),
  createTextTag(", "),
  createGameLinkTag("exit_s", "exit", "south"),
  createTextTag(", "),
  createGameLinkTag("exit_e", "exit", "east"),
  createTextTag(", "),
  createGameLinkTag("exit_w", "exit", "west"),
  createTextTag("\nYou see "),
  createGameLinkTag("sword123", "sword", "a steel longsword"),
  createTextTag(" and "),
  createGameLinkTag("shield456", "shield", "a wooden shield"),
  createTextTag(" here.\n"),
];

export const createShopScenario = (): Array<GameTag> => [
  createPresetTag("roomName", "Weaponsmith Shop"),
  createTextTag("\n"),
  createPresetTag("roomDesc", "The shop is filled with weapons and armor of all kinds."),
  createTextTag('\nThe weaponsmith says, "Would you like to '),
  createGameCommandTag("buy", "buy"),
  createTextTag(" something or "),
  createGameCommandTag("sell", "sell"),
  createTextTag(' your old gear?"\n'),
  createTextTag("Items for sale:\n"),
  createTextTag("• "),
  createGameLinkTag("dagger999", "dagger", "a sharp dagger"),
  createTextTag(" (50 silver)\n"),
  createTextTag("• "),
  createGameLinkTag("armor888", "armor", "studded leather armor"),
  createTextTag(" (200 silver)\n"),
  createTextTag("• "),
  createGameLinkTag("potion777", "potion", "a healing potion"),
  createTextTag(" (25 silver)\n"),
];

export const createCommunicationScenario = (): Array<GameTag> => [
  createPresetTag("speech", 'Player says, "Hello everyone!"'),
  createTextTag("\n"),
  createPresetTag("whisper", 'Player whispers, "Meet me at the bank."'),
  createTextTag("\n"),
  createPresetTag("thoughts", 'You think to yourself, "What should I do next?"'),
  createTextTag("\n"),
  createTextTag("Adventurer Bob arrives.\n"),
  createPresetTag("speech", 'Adventurer Bob says, "Anyone want to form a group?"'),
  createTextTag("\n"),
];

export const createMixedContentScenario = (): Array<GameTag> => [
  createTextTag("You enter the abandoned mine.\n"),
  createPresetTag("roomName", "Abandoned Mine Entrance"),
  createTextTag("\n"),
  createTextTag("A "),
  createGameMonsterTag("bat123", "bat", "vampire bat"),
  createTextTag(" swoops down from the ceiling!\n"),
  createTextTag("You can "),
  createGameCommandTag("attack bat", "attack"),
  createTextTag(" the bat or "),
  createGameCommandTag("flee", "flee"),
  createTextTag(" to safety.\n"),
  createTextTag("You notice "),
  createGameLinkTag("torch555", "torch", "a flickering torch"),
  createTextTag(" on the wall that might be useful.\n"),
  createPromptTag(),
];

// Utility to create groups of GameTags for feed testing
export const createGameTagGroups = (scenarios: Array<Array<GameTag>>): Array<Array<GameTag>> => {
  return scenarios;
};

export const mockGameScenarios = {
  combat: createCombatScenario,
  room: createRoomScenario,
  shop: createShopScenario,
  communication: createCommunicationScenario,
  mixedContent: createMixedContentScenario,
} as const;
