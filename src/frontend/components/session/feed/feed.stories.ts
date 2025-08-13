import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./feed-modernized.lit";
import type { GameTag } from "../../../parser/tag";

// Type for mock session object in Storybook
type MockSession = {
  bus: {
    subscribeEvent: (eventName: string, handler: (event: unknown) => void) => void;
  };
};

// Type for command echo events in Storybook
type CommandEchoEvent = {
  detail: {
    command: string;
    isReplay: boolean;
  };
};

// Type for the feed component in Storybook contexts
type FeedElement = HTMLElement & {
  appendGameTags?: (tags: Array<GameTag>) => void;
  shadowRoot?: ShadowRoot | null;
  getRenderStats?: () => {
    totalTagGroups: number;
    totalTags: number;
    componentTags: number;
    metadataTags: number;
  };
  session?: MockSession;
  _handleCommandEcho?: (event: CommandEchoEvent) => void;
};

// Mock the item highlighting system to avoid XML loading issues
const mockItemHighlighter = {
  // Common item noun to category mappings for realistic Storybook testing
  _categoryMappings: {
    // Weapons
    sword: "weapon",
    longsword: "weapon",
    dagger: "weapon",
    dirk: "weapon",
    knife: "weapon",
    blade: "weapon",
    rapier: "weapon",
    scimitar: "weapon",
    mace: "weapon",
    club: "weapon",
    hammer: "weapon",
    axe: "weapon",
    bow: "weapon",
    arrow: "weapon",
    spear: "weapon",
    staff: "weapon",

    // Armor & Shields - map to 'forgeable' since there's no 'armor' CSS
    shield: "forgeable",
    armor: "forgeable",
    helmet: "forgeable",
    gauntlets: "forgeable",
    breastplate: "forgeable",
    chainmail: "forgeable",
    leather: "forgeable",
    plate: "forgeable",

    // Gems
    gem: "gem",
    ruby: "gem",
    emerald: "gem",
    diamond: "gem",
    sapphire: "gem",
    amethyst: "gem",
    topaz: "gem",
    pearl: "gem",
    opal: "gem",

    // Herbs and reagents - use XML 'herb' category
    potion: "herb",
    herb: "herb",
    tincture: "herb",
    salve: "herb",
    elixir: "herb",
    remedy: "herb",
    medicine: "herb",
    vial: "herb",
    stem: "herb",
    moss: "herb",
    leaf: "herb",
    lichen: "herb",

    // Jewelry - use 'jewelry' category
    ring: "jewelry",
    amulet: "jewelry",
    necklace: "jewelry",
    bracelet: "jewelry",
    earring: "jewelry",
    pendant: "jewelry",
    chain: "jewelry",

    // Magic items - specific XML categories
    scroll: "scroll",
    parchment: "scroll",
    wand: "wand",
    rod: "wand",
    orb: "magic",
    talisman: "magic",
    crystal: "magic",

    // Food - distinguish between regular food and manna bread
    tart: "food",
    fruit: "food",
    meat: "food",
    cheese: "food",
    pie: "food",
    cake: "food",

    // Manna bread - specific XML category
    loaf: "manna bread",
    bread: "manna bread",

    // Containers - use 'box' category to match XML
    box: "box",
    chest: "box",
    bag: "box",
    pouch: "box",
    pack: "box",

    // Clothing items
    backpack: "clothing",
    harness: "clothing",
    robe: "clothing",
    cloak: "clothing",
    tunic: "clothing",

    // Skins and pelts
    skin: "skin",
    hide: "skin",
    pelt: "skin",

    // NPCs
    merchant: "passive npc",
    shopkeeper: "passive npc",
    clerk: "passive npc",
    bandit: "aggressive npc",
    warrior: "aggressive npc",
    assassin: "aggressive npc",
  } as Record<string, string>,

  // Items that should not be highlighted (exits, etc.)
  _excludedNouns: new Set(["exit", "door", "gate", "path"]),

  async categorizeGameElement(attributes: { noun?: string; exist?: string; name?: string }) {
    const { noun, exist, name } = attributes;
    console.log("[MOCK] categorizeGameElement called with:", { noun, exist, name });

    // Check for excluded nouns first
    if (noun && this._excludedNouns.has(noun.toLowerCase())) {
      return {
        category: null as string | null,
        confidence: "high" as const,
        source: "noun" as const,
      };
    }

    // Try noun first (highest confidence)
    if (noun) {
      const category = this._categoryMappings[noun.toLowerCase()];
      if (category) {
        return {
          category,
          confidence: "high" as const,
          source: "noun" as const,
        };
      }
    }

    // Try exist attribute (medium confidence)
    if (exist && !this._excludedNouns.has(exist.toLowerCase())) {
      const category = this._categoryMappings[exist.toLowerCase()];
      if (category) {
        return {
          category,
          confidence: "medium" as const,
          source: "exist" as const,
        };
      }
    }

    // Try name matching (low confidence)
    if (name) {
      const lowerName = name.toLowerCase();
      for (const [nounKey, category] of Object.entries(this._categoryMappings)) {
        if (lowerName.includes(nounKey) && !this._excludedNouns.has(nounKey)) {
          return {
            category,
            confidence: "low" as const,
            source: "name" as const,
          };
        }
      }
    }

    return {
      category: null as string | null,
      confidence: "low" as const,
      source: "fallback" as const,
    };
  },

  async getItemCategory(noun: string, fullName?: string) {
    const result = await this.categorizeGameElement({ noun, name: fullName });
    return result.category;
  },

  async initialize() {
    // Mock initialization - always succeeds
  },

  async isCategoryEnabled(_category: string) {
    // Enable all categories in Storybook
    return true;
  },

  async getAllCategories() {
    return [
      { key: "weapon", name: "Weapons", color: "#ff6b6b" },
      { key: "armor", name: "Armor & Shields", color: "#74c0fc" },
      { key: "clothing", name: "Clothing", color: "#51cf66" },
      { key: "gem", name: "Gems & Stones", color: "#ffd43b" },
      { key: "jewelry", name: "Jewelry", color: "#9775fa" },
      { key: "herb", name: "Herbs & Reagents", color: "#9775fa" },
      { key: "food", name: "Food", color: "#ffa94d" },
      { key: "manna bread", name: "Manna Bread", color: "#ffa94d" },
      { key: "scroll", name: "Scrolls", color: "#e599f7" },
      { key: "wand", name: "Wands", color: "#e599f7" },
      { key: "magic", name: "Magic Items", color: "#e599f7" },
      { key: "skin", name: "Skins & Pelts", color: "#ff8787" },
      { key: "box", name: "Containers", color: "#868e96" },
      { key: "passive npc", name: "Passive NPCs", color: "#40c057" },
      { key: "aggressive npc", name: "Aggressive NPCs", color: "#fa5252" },
    ];
  },

  getCategoryColor(category: string) {
    const colorMap: Record<string, string> = {
      weapon: "var(--color-item-weapon, #ff6b6b)",
      armor: "var(--color-item-armor, #74c0fc)",
      clothing: "var(--color-item-clothing, #51cf66)",
      gem: "var(--color-item-gem, #ffd43b)",
      jewelry: "var(--color-item-jewelry, #9775fa)",
      herb: "var(--color-item-reagent, #9775fa)",
      food: "var(--color-item-food, #ffa94d)",
      "manna bread": "var(--color-item-food, #ffa94d)",
      scroll: "var(--color-item-magic, #e599f7)",
      wand: "var(--color-item-magic, #e599f7)",
      magic: "var(--color-item-magic, #e599f7)",
      skin: "var(--color-item-valuable, #ff8787)",
      box: "var(--color-item-container, #868e96)",
      "passive npc": "var(--color-npc-passive, #40c057)",
      "aggressive npc": "var(--color-npc-aggressive, #fa5252)",
    };
    return colorMap[category] || "var(--color-item-default, #a0a0a0)";
  },

  get isReady() {
    return true;
  },

  async preload() {
    // Already "loaded" in mock
  },

  clearCache() {
    // No-op in mock
  },
};

// Import the real ItemHighlighter and mock its methods individually
import { ItemHighlighter } from "../../game-elements/item-highlighting";

// Mock individual methods with proper context binding to preserve 'this'
ItemHighlighter.categorizeGameElement = mockItemHighlighter.categorizeGameElement.bind(mockItemHighlighter);
ItemHighlighter.getItemCategory = mockItemHighlighter.getItemCategory.bind(mockItemHighlighter);
ItemHighlighter.initialize = mockItemHighlighter.initialize.bind(mockItemHighlighter);
ItemHighlighter.isCategoryEnabled = mockItemHighlighter.isCategoryEnabled.bind(mockItemHighlighter);
ItemHighlighter.getAllCategories = mockItemHighlighter.getAllCategories.bind(mockItemHighlighter);
ItemHighlighter.getCategoryColor = mockItemHighlighter.getCategoryColor.bind(mockItemHighlighter);
ItemHighlighter.preload = mockItemHighlighter.preload.bind(mockItemHighlighter);
ItemHighlighter.clearCache = mockItemHighlighter.clearCache.bind(mockItemHighlighter);

// Mock the isReady getter using Object.defineProperty
Object.defineProperty(ItemHighlighter, "isReady", {
  get: () => true,
  configurable: true,
});

// Import game element components to ensure they're registered
import "../../game-elements/game-link.lit";
import "../../game-elements/game-command.lit";
import "../../game-elements/game-monster.lit";

// Import utilities for creating realistic game tag scenarios
import { makeTag } from "../../../parser/tag";

// Create mock game tag utilities directly in stories file for Storybook compatibility
const createTextTag = (text: string) => {
  const tag = makeTag(":text");
  tag.text = text;
  return tag;
};

const createPresetTag = (id: string, text: string) => {
  const tag = makeTag("preset");
  tag.attrs = { id };
  tag.text = text;
  return tag;
};

const createGameLinkTag = (exist: string, noun: string, text: string) => {
  const tag = makeTag("a");
  tag.attrs = { exist, noun };
  tag.text = text;
  return tag;
};

const createGameCommandTag = (cmd: string, text: string) => {
  const tag = makeTag("d");
  tag.attrs = { cmd };
  tag.text = text;
  return tag;
};

const createGameMonsterTag = (exist: string, noun: string, text: string) => {
  const monsterTag = makeTag("b");
  const linkChild = createGameLinkTag(exist, noun, text);
  monsterTag.children = [linkChild];
  return monsterTag;
};

const createPromptTag = (time: string = Date.now().toString()) => {
  const tag = makeTag("prompt");
  tag.attrs = { time };
  tag.text = ">";
  return tag;
};

// Complex game scenarios using real GameTags
const createCombatScenario = () => [
  createTextTag("A "),
  createGameMonsterTag("orc12345", "orc", "massive orc warrior"),
  createTextTag(" charges into the room!"),
  createTextTag("The orc warrior swings a war hammer at you!"),
  createTextTag("You can "),
  createGameCommandTag("dodge", "dodge"),
  createTextTag(" or "),
  createGameCommandTag("block", "block"),
  createTextTag(" the attack."),
];

const createRoomScenario = () => [
  createPresetTag("roomName", "The Town Square"),
  createTextTag("\n"),
  createPresetTag("roomDesc", "This is the heart of the main square of Wehnimer's Landing. The town square is bustling with people."),
  createTextTag("\n"),
  createTextTag("Obvious exits: "),
  createGameLinkTag("exit_n", "exit", "north"),
  createTextTag(", "),
  createGameLinkTag("exit_s", "exit", "south"),
  createTextTag(", "),
  createGameLinkTag("exit_e", "exit", "east"),
  createTextTag(", "),
  createGameLinkTag("exit_w", "exit", "west"),
  createTextTag(" You see "),
  createGameLinkTag("sword123", "sword", "a steel longsword"),
  createTextTag(" and "),
  createGameLinkTag("shield456", "shield", "a wooden shield"),
  createTextTag(" here.\n"),
];

const createShopScenario = () => [
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

const createCommunicationScenario = () => [
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

const createMixedContentScenario = () => [
  createTextTag("You enter the abandoned mine."),
  createPresetTag("roomName", "Abandoned Mine Entrance"),
  createTextTag("A "),
  createGameMonsterTag("bat123", "bat", "vampire bat"),
  createTextTag(" swoops down from the ceiling!"),
  createTextTag("You can "),
  createGameCommandTag("attack bat", "attack"),
  createTextTag(" the bat or "),
  createGameCommandTag("flee", "flee"),
  createTextTag(" to safety."),
  createTextTag("You notice "),
  createGameLinkTag("torch555", "torch", "a flickering torch"),
  createTextTag(" on the wall that might be useful."),
  createPromptTag(),
];

const meta: Meta = {
  title: "Session/Feed",
  component: "illthorn-feed-modernized-lit",
  parameters: {
    docs: {
      description: {
        component:
          "Modern game text display component with direct GameTag rendering, auto-scrolling, memory management, command echo integration, and component-based content rendering. Eliminates DOM→HTML→DOM conversion for improved performance.",
      },
    },
  },
  argTypes: {
    session: {
      control: false,
      description: "Frontend session object for event subscriptions",
    },
    focused: {
      control: "boolean",
      description: "Whether the feed has focus (shows focus border)",
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    focused: false,
  },
  render: (args) => html`
    <div style="width: 600px; height: 400px; padding: 1rem; background: var(--color-surface);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Empty Feed</h3>
      <illthorn-feed-modernized-lit .focused=${args.focused}></illthorn-feed-modernized-lit>
      <p style="margin: 1rem 0 0 0; font-size: 0.9rem; color: var(--color-text-secondary);">An empty feed ready to receive GameTag content from the parser.</p>
    </div>
  `,
};

export const RoomDescription: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    // Use real GameTag data for room scenario with realistic message flow
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="room"]') as FeedElement;
      if (feed?.appendGameTags) {
        // Simulate how room content typically arrives as separate messages
        feed.appendGameTags([createPresetTag("roomName", "The Town Square")]);

        setTimeout(() => {
          feed.appendGameTags([createPresetTag("roomDesc", "This is the heart of the main square of Wehnimer's Landing. The town square is bustling with people.")]);
        }, 200);

        setTimeout(() => {
          feed.appendGameTags([
            createTextTag("Obvious exits: "),
            createGameLinkTag("exit_n", "exit", "north"),
            createTextTag(", "),
            createGameLinkTag("exit_s", "exit", "south"),
            createTextTag(", "),
            createGameLinkTag("exit_e", "exit", "east"),
            createTextTag(", "),
            createGameLinkTag("exit_w", "exit", "west"),
          ]);
        }, 400);

        setTimeout(() => {
          feed.appendGameTags([
            createTextTag(" You see "),
            createGameLinkTag("sword123", "sword", "a steel longsword"),
            createTextTag(" and "),
            createGameLinkTag("shield456", "shield", "a wooden shield"),
            createTextTag(" here."),
          ]);
        }, 600);
      }
    }, 200);

    return html`
      <div style="width: 700px; height: 600px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Room Description with Real Components</h3>
        <illthorn-feed-modernized-lit 
          data-story="room"
          .focused=${args.focused}
          style="border: 1px solid red; height: 500px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <p style="margin: 1rem 0 0 0; font-size: 0.9rem; color: var(--color-text-secondary);">
          <strong>Real Components:</strong> GameLink components for exits and items, preset styling for room name/description. 
          Try hovering over the links and exits - they're real interactive components!
        </p>
      </div>
    `;
  },
};

export const CombatScenario: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    // Use real GameTag data for combat scenario with realistic message flow
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="combat"]') as FeedElement;
      if (feed) {
        // Simulate how the game would send this as separate messages
        feed.appendGameTags([createTextTag("A "), createGameMonsterTag("orc12345", "orc", "massive orc warrior"), createTextTag(" charges into the room!")]);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("The orc warrior swings a war hammer at you!")]);
        }, 300);

        setTimeout(() => {
          feed.appendGameTags([
            createTextTag("You can "),
            createGameCommandTag("dodge", "dodge"),
            createTextTag(" or "),
            createGameCommandTag("block", "block"),
            createTextTag(" the attack."),
          ]);
        }, 600);
      }
    }, 100);

    return html`
      <div style="width: 700px; height: 400px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Combat with Real Game Components</h3>
        <illthorn-feed-modernized-lit 
          data-story="combat"
          .focused=${args.focused}
        ></illthorn-feed-modernized-lit>
        <p style="margin: 1rem 0 0 0; font-size: 0.9rem; color: var(--color-text-secondary);">
          <strong>Real Components:</strong> GameMonster component for the orc, GameCommand components for dodge/block actions. 
          Notice the monster highlighting and clickable commands!
        </p>
      </div>
    `;
  },
};

export const ShopInteraction: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    // Use real GameTag data for shop scenario with realistic message flow
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="shop"]') as FeedElement;
      if (feed) {
        // Simulate how the game would send shop content as separate messages
        feed.appendGameTags([createPresetTag("roomName", "Weaponsmith Shop")]);

        setTimeout(() => {
          feed.appendGameTags([createPresetTag("roomDesc", "The shop is filled with weapons and armor of all kinds.")]);
        }, 200);

        setTimeout(() => {
          feed.appendGameTags([
            createTextTag('The weaponsmith says, "Would you like to '),
            createGameCommandTag("buy", "buy"),
            createTextTag(" something or "),
            createGameCommandTag("sell", "sell"),
            createTextTag(' your old gear?"'),
          ]);
        }, 400);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("Items for sale:")]);
        }, 600);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("dagger999", "dagger", "a sharp dagger"), createTextTag(" (50 silver)")]);
        }, 800);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("armor888", "armor", "studded leather armor"), createTextTag(" (200 silver)")]);
        }, 1000);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("potion777", "potion", "a healing potion"), createTextTag(" (25 silver)")]);
        }, 1200);
      }
    }, 100);

    return html`
      <div style="width: 700px; height: 450px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Shop Interaction with Real Components</h3>
        <illthorn-feed-modernized-lit 
          data-story="shop"
          .focused=${args.focused}
        ></illthorn-feed-modernized-lit>
        <p style="margin: 1rem 0 0 0; font-size: 0.9rem; color: var(--color-text-secondary);">
          <strong>Real Components:</strong> GameCommand components for buy/sell, GameLink components for items. 
          Each item link and command is a real interactive component with hover states and click handlers.
        </p>
      </div>
    `;
  },
};

export const CommunicationStreams: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    // Use real GameTag data for communication scenario with realistic message flow
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="communication"]') as FeedElement;
      if (feed) {
        // Simulate how communication messages arrive separately in the game
        feed.appendGameTags([createPresetTag("speech", 'Player says, "Hello everyone!"')]);

        setTimeout(() => {
          feed.appendGameTags([createPresetTag("whisper", 'Player whispers, "Meet me at the bank."')]);
        }, 300);

        setTimeout(() => {
          feed.appendGameTags([createPresetTag("thoughts", 'You think to yourself, "What should I do next?"')]);
        }, 600);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("Adventurer Bob arrives.")]);
        }, 900);

        setTimeout(() => {
          feed.appendGameTags([createPresetTag("speech", 'Adventurer Bob says, "Anyone want to form a group?"')]);
        }, 1200);
      }
    }, 100);

    return html`
      <div style="width: 700px; height: 400px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Communication Streams with Real Styling</h3>
        <illthorn-feed-modernized-lit 
          data-story="communication"
          .focused=${args.focused}
        ></illthorn-feed-modernized-lit>
        <p style="margin: 1rem 0 0 0; font-size: 0.9rem; color: var(--color-text-secondary);">
          <strong>Real Components:</strong> Preset styling components for speech, whisper, and thoughts. 
          Each text type uses the actual theme CSS variables for realistic styling.
        </p>
      </div>
    `;
  },
};

export const MixedContentScenario: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    // Use real GameTag data for mixed content scenario with realistic message flow
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="mixed"]') as FeedElement;
      if (feed) {
        // Simulate how the game would send this as separate messages
        feed.appendGameTags([createTextTag("You enter the abandoned mine.")]);

        setTimeout(() => {
          feed.appendGameTags([createPresetTag("roomName", "Abandoned Mine Entrance")]);
        }, 200);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("A "), createGameMonsterTag("bat123", "bat", "vampire bat"), createTextTag(" swoops down from the ceiling!")]);
        }, 400);

        setTimeout(() => {
          feed.appendGameTags([
            createTextTag("You can "),
            createGameCommandTag("attack bat", "attack"),
            createTextTag(" the bat or "),
            createGameCommandTag("flee", "flee"),
            createTextTag(" to safety."),
          ]);
        }, 600);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("You notice "), createGameLinkTag("torch555", "torch", "a flickering torch"), createTextTag(" on the wall that might be useful.")]);
        }, 800);

        setTimeout(() => {
          feed.appendGameTags([createPromptTag()]);
        }, 1000);
      }
    }, 100);

    return html`
      <div style="width: 700px; height: auto; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Mixed Content with All Component Types</h3>
        <illthorn-feed-modernized-lit 
          data-story="mixed"
          .focused=${args.focused}
          style="height: 300px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <p style="margin: 1rem 0 0 0; font-size: 0.9rem; color: var(--color-text-secondary);">
          <strong>Complete Integration:</strong> All component types together - room description, monster, commands, items, and prompt. 
          This demonstrates the full component rendering pipeline in a realistic game scenario.
        </p>
      </div>
    `;
  },
};

export const Focused: Story = {
  args: {
    focused: true,
  },
  render: (args) => {
    // Use real GameTag data for focused state demo
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="focused"]') as FeedElement;
      if (feed) {
        // Add some content to show the focused state
        feed.appendGameTags(createRoomScenario().slice(0, 4)); // Just room name and description
      }
    }, 100);

    return html`
      <div style="width: 700px; height: 400px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Focused Feed State</h3>
        <illthorn-feed-modernized-lit 
          data-story="focused"
          .focused=${args.focused}
        ></illthorn-feed-modernized-lit>
        <p style="margin: 1rem 0 0 0; font-size: 0.9rem; color: var(--color-text-secondary);">
          <strong>Focused State:</strong> Shows blue focus border and indicates this feed is currently active. 
          Compare with other stories to see the visual difference.
        </p>
      </div>
    `;
  },
};

export const ScrollingAndMemoryDemo: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    // Create a lot of realistic content to demonstrate scrolling
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="scrolling"]') as FeedElement;
      if (feed) {
        // Add multiple scenarios to create scrollable content
        feed.appendGameTags(createRoomScenario());
        feed.appendGameTags(createCommunicationScenario());
        feed.appendGameTags(createCombatScenario());
        feed.appendGameTags(createShopScenario());
        feed.appendGameTags(createMixedContentScenario());

        // Add more content to demonstrate memory management
        for (let i = 0; i < 10; i++) {
          feed.appendGameTags([createTextTag(`Additional game message ${i + 1}`)]);
        }
      }
    }, 100);

    return html`
      <div style="width: 700px; height: 500px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Scrolling & Memory Management</h3>
        <div style="height: 320px;">
          <illthorn-feed-modernized-lit 
            data-story="scrolling"
            .focused=${args.focused}
            style="height: 100%;"
          ></illthorn-feed-modernized-lit>
        </div>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0 0 0.5rem 0;"><strong>Features Demonstrated:</strong></p>
          <ul style="margin: 0; padding-left: 1.5rem;">
            <li>Auto-scrolls to bottom as new content arrives</li>
            <li>Real game components maintain functionality during scroll</li>
            <li>Memory management automatically removes old content</li>
            <li>Scroll position detection pauses auto-scroll when user scrolls up</li>
          </ul>
        </div>
      </div>
    `;
  },
};

export const RealComponentInteractivity: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    // Create a scenario that highlights interactive capabilities
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="interactive"]') as FeedElement;
      if (feed) {
        // Show all types of interactive elements
        const mockSession = { bus: { subscribeEvent: () => {} } }; // Mock session for event handling
        feed.session = mockSession;

        // Show interactive elements as separate messages for realistic flow
        feed.appendGameTags([createTextTag("=== Interactive Component Demo ===")]);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("Try hovering and clicking on the elements below:")]);
        }, 200);

        setTimeout(() => {
          feed.appendGameTags([...createRoomScenario().slice(0, 2)]); // Room name and description
        }, 400);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("Click on this "), createGameLinkTag("125592513", "gladius", "matte black golvern gladius"), createTextTag(" to examine it.")]);
        }, 600);

        setTimeout(() => {
          feed.appendGameTags([
            createTextTag("Herbs available: "),
            createGameLinkTag("127527554", "stem", "some aloeas stem"),
            createTextTag(", "),
            createGameLinkTag("127527553", "moss", "some ephlox moss"),
            createTextTag(", "),
            createGameLinkTag("127527552", "potion", "rose-marrow potion"),
            createTextTag("."),
          ]);
        }, 800);

        setTimeout(() => {
          feed.appendGameTags([
            createTextTag("Use "),
            createGameCommandTag("dodge", "dodge"),
            createTextTag(" or "),
            createGameCommandTag("block", "block"),
            createTextTag(" commands."),
          ]);
        }, 1000);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("A "), createGameMonsterTag("dragon456", "dragon", "fierce dragon"), createTextTag(" appears!")]);
        }, 1200);
      }
    }, 100);

    return html`
      <div style="width: 700px; height: 450px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Real Component Interactivity</h3>
        <illthorn-feed-modernized-lit 
          data-story="interactive"
          .focused=${args.focused}
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0 0 0.5rem 0;"><strong>Accessibility & Interaction Features:</strong></p>
          <ul style="margin: 0; padding-left: 1.5rem;">
            <li>Keyboard navigation (Tab to focus, Enter to activate)</li>
            <li>Screen reader semantic markup with proper roles</li>
            <li>Focus indicators and hover states</li>
            <li>Real click handlers and event dispatching</li>
            <li>High contrast theme support</li>
            <li>Text selection preservation during updates</li>
          </ul>
        </div>
      </div>
    `;
  },
};

// Story demonstrating session integration and command echoes
export const WithCommandEcho: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="command-echo"]') as FeedElement;
      if (feed) {
        const mockSession = {
          bus: {
            subscribeEvent: (eventName: string, _handler: (event: unknown) => void) => {
              // Mock subscription - in real app this would be connected to command bar
              console.log(`Subscribed to ${eventName}`);
            },
          },
        };
        feed.session = mockSession;

        // Add some game content with realistic message flow
        feed.appendGameTags([createPresetTag("roomName", "The Town Square")]);

        setTimeout(() => {
          feed.appendGameTags([createPresetTag("roomDesc", "This is the heart of the main square of Wehnimer's Landing. The town square is bustling with people.")]);
        }, 200);

        // Simulate command echoes after a delay
        setTimeout(() => {
          const commandEvent = new CustomEvent("illthorn:command-echo", {
            detail: { command: "look around", isReplay: false },
          });
          if (feed._handleCommandEcho) {
            feed._handleCommandEcho(commandEvent);
          }

          setTimeout(() => {
            const replayEvent = new CustomEvent("illthorn:command-echo", {
              detail: { command: "get sword", isReplay: true },
            });
            if (feed._handleCommandEcho) {
              feed._handleCommandEcho(replayEvent);
            }
          }, 1000);
        }, 500);
      }
    }, 100);

    return html`
      <div style="width: 700px; height: 400px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Command Echo Integration</h3>
        <illthorn-feed-modernized-lit 
          data-story="command-echo"
          .focused=${args.focused}
        ></illthorn-feed-modernized-lit>
        <p style="margin: 1rem 0 0 0; font-size: 0.9rem; color: var(--color-text-secondary);">
          <strong>Session Integration:</strong> Shows command echo integration with real session bus events. 
          Command echoes appear automatically when commands are executed, with different styling for replays.
        </p>
      </div>
    `;
  },
};
