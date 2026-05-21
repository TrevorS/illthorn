// ABOUTME: Storybook stories for mixed complex scenarios from the icemule gamelog
// ABOUTME: Tests complete game flow with equipment, highlighting, social interactions, and commands

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../session/feed/feed-modernized.lit";
import type { GameTag } from "../../parser/tag";
import { makeTag } from "../../parser/tag";

// Import the item highlighter for comprehensive highlighting
import { ItemHighlighter } from "../game-elements/item-highlighting";

// Comprehensive mock that includes all categories from previous scenarios
const mixedMockHighlighter = {
  _categoryMappings: {
    // Weapons
    runestaff: "weapon",
    staff: "weapon",
    sword: "weapon",
    longsword: "weapon",
    gladius: "weapon",
    dagger: "weapon",
    blade: "weapon",

    // Armor and shields
    harness: "clothing", // Note: in the log this was categorized as clothing
    leather: "armor",
    shield: "forgeable",
    armor: "armor",

    // Clothing
    jacket: "clothing",
    purse: "clothing",
    backpack: "clothing",
    boots: "clothing",
    breeches: "clothing",
    cap: "clothing",
    robe: "clothing",
    cloak: "clothing",
    satchel: "clothing",

    // Jewelry and magic
    stickpin: "jewelry",
    ring: "magic", // Some rings are magic
    amulet: "magic",
    necklace: "jewelry",
    orb: "magic",

    // Herbs and reagents
    leaf: "herb", // ambrominas, acantha
    moss: "herb", // basal, ephlox
    stem: "herb", // aloeas
    lichen: "herb", // wolifrew
    fruit: "herb", // calamia
    potion: "herb", // rose-marrow
    elixir: "herb", // snowflake

    // Food
    tart: "food", // various tarts
    pie: "food", // sparrowhawk pie
    porridge: "food", // frog's bone porridge
    soup: "food", // polar bear fat soup

    // Manna bread
    loaf: "manna bread", // pineapple-glazed pumpkin loaf
    bread: "manna bread",

    // Musical instruments
    ayr: "instrument",
    lute: "instrument",

    // Containers
    chest: "box",
    wastebin: "box",
    bag: "box",

    // Creatures
    spider: "passive npc", // peacock spider
    bat: "aggressive npc",
    orc: "aggressive npc",

    // Environmental (should not highlight)
    statue: null,
    bench: null,
    board: null,
    barrel: null,
    bonfire: null,
    plinth: null,
    disk: null, // player disks
  } as Record<string, string | null>,

  categorizeGameElement(attributes: { noun?: string; exist?: string; name?: string }) {
    const { noun, exist, name } = attributes;
    console.log("[MIXED MOCK] categorizeGameElement called with:", { noun, exist, name });

    // Check for player names - these should NOT be highlighted
    if (name) {
      const lowerName = name.toLowerCase();
      const playerNames = ["parwyn", "rollandio", "aescall", "sunzun", "scribs"];
      if (playerNames.some((playerName) => lowerName.includes(playerName))) {
        return {
          category: null as string | null,
          confidence: "high" as const,
          source: "name" as const,
        };
      }
    }

    // Try noun first
    if (noun) {
      const category = this._categoryMappings[noun.toLowerCase()];
      if (category !== undefined) {
        return {
          category,
          confidence: "high" as const,
          source: "noun" as const,
        };
      }
    }

    // Try name matching for complex items
    if (name) {
      const lowerName = name.toLowerCase();
      for (const [key, value] of Object.entries(this._categoryMappings)) {
        if (lowerName.includes(key)) {
          return {
            category: value,
            confidence: "medium" as const,
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

  getItemCategory(noun: string, fullName?: string) {
    const result = this.categorizeGameElement({ noun, name: fullName });
    return result.category;
  },

  async initialize() {},
  isCategoryEnabled(_category: string) {
    return true;
  },
  get isReady() {
    return true;
  },
};

// Apply the mock
ItemHighlighter.categorizeGameElement = mixedMockHighlighter.categorizeGameElement.bind(mixedMockHighlighter);
ItemHighlighter.getItemCategory = mixedMockHighlighter.getItemCategory.bind(mixedMockHighlighter);
ItemHighlighter.initialize = mixedMockHighlighter.initialize.bind(mixedMockHighlighter);
ItemHighlighter.isCategoryEnabled = mixedMockHighlighter.isCategoryEnabled.bind(mixedMockHighlighter);
Object.defineProperty(ItemHighlighter, "isReady", {
  get: () => true,
  configurable: true,
});

// Import game element components
import "../game-elements/game-link.lit";
import "../game-elements/game-command.lit";

// Type for feed component
type FeedElement = HTMLElement & {
  appendGameTags: (tags: Array<GameTag>) => void;
};

// Utility functions for creating game tags
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

// Complex mixed scenarios that combine multiple elements
const createCompleteGameplaySession = () => {
  return {
    // Part 1: Room entry and observation
    roomEntry: [
      createPresetTag("roomName", "Icemule Trace, Town Center"),
      createTextTag("\n"),
      createPresetTag(
        "roomDesc",
        "A tranquil square dusted with snow sprawls beneath a sturdy mule statue standing placidly atop a tall plinth of silver-veined black stone. The brilliance of the stars refracts through the statue, casting prismatic glints over the townsfolk nearby.",
      ),
      createTextTag("\n"),
      createTextTag("You also see "),
      createGameLinkTag("spider123", "spider", "an iridescent green peacock spider"),
      createTextTag(", "),
      createGameLinkTag("disk456", "disk", "the rusty iron Scribs disk"),
      createTextTag(" and "),
      createGameLinkTag("wastebin789", "wastebin", "a woven bark wastebin"),
      createTextTag("."),
      createTextTag("\n"),
      createTextTag("Also here: "),
      createGameLinkTag("-10240033", "Parwyn", "Parwyn"),
      createTextTag(" who is sitting"),
    ],

    // Part 2: Inventory management
    inventoryCheck: [
      createGameCommandTag("inventory", "inventory"),
      createTextTag("\n"),
      createTextTag("You are wearing "),
      createGameLinkTag("137317213", "harness", "an enruned midnight blue harness"),
      createTextTag(", "),
      createGameLinkTag("137317215", "leather", "some old full leather"),
      createTextTag(", "),
      createGameLinkTag("137317216", "stickpin", "a diamond-set platinum stickpin"),
      createTextTag(", "),
      createGameLinkTag("137317217", "ring", "a faded gold ring"),
      createTextTag(", "),
      createGameLinkTag("137317230", "backpack", "a bone-clasped forest green backpack"),
      createTextTag("."),
    ],

    // Part 3: Equipment manipulation
    equipmentManagement: [
      createGameCommandTag("gird", "gird"),
      createTextTag("\n"),
      createTextTag("You remove "),
      createGameLinkTag("137317214", "runestaff", "a silver-capped mesille runestaff"),
      createTextTag(" from in your "),
      createGameLinkTag("137317213", "harness", "midnight blue harness"),
      createTextTag("."),
    ],

    // Part 4: Social interaction
    socialScene: [
      createTextTag("Without a change in dynamics "),
      createGameLinkTag("-10240033", "Parwyn", "Parwyn"),
      createTextTag(" picks up the pace of the song, weaving a soft but playful theme reminiscent of the sound of a far-away horse running across the countryside."),
      createTextTag("\n"),
      createTextTag("Parwyn strums one final soft chord then allows her "),
      createGameLinkTag("134750440", "ayr", "ayr"),
      createTextTag(" to fall silent."),
    ],

    // Part 5: Backpack inspection with mixed items
    backpackInspection: [
      createGameCommandTag("look in my backpack", "look in my backpack"),
      createTextTag("\n"),
      createPresetTag("roomDesc", "Magic Items [1]: "),
      createGameLinkTag("137317263", "amulet", "a crystal amulet"),
      createTextTag("\n"),
      createPresetTag("roomDesc", "Herbs [5]: "),
      createGameLinkTag("127002", "leaf", "some ambrominas leaf"),
      createTextTag(", "),
      createGameLinkTag("127003", "moss", "some basal moss"),
      createTextTag(", "),
      createGameLinkTag("127006", "potion", "a rose-marrow potion"),
      createTextTag(", "),
      createGameLinkTag("127013", "elixir", "a snowflake elixir"),
      createTextTag(", "),
      createGameLinkTag("127014", "stem", "some aloeas stem"),
      createTextTag("\n"),
      createPresetTag("roomDesc", "Food/Drink [3]: "),
      createGameLinkTag("127001", "tart", "a gelatinous elk fat tart"),
      createTextTag(", "),
      createGameLinkTag("127005", "pie", "a slice of sparrowhawk pie"),
      createTextTag(", "),
      createGameLinkTag("127015", "loaf", "a sweet pineapple-glazed pumpkin loaf"),
    ],

    // Part 6: Player activity
    playerMovement: [
      createGameLinkTag("-10470747", "Rollandio", "Rollandio"),
      createTextTag(" just arrived."),
      createTextTag("\n"),
      createGameLinkTag("-10240033", "Parwyn", "Parwyn"),
      createTextTag(" smiles."),
      createTextTag("\n"),
      createGameLinkTag("-10470747", "Rollandio", "Rollandio"),
      createTextTag(" just went west."),
    ],
  };
};

const createSpellListScenario = () => [
  createGameCommandTag("spell all", "spell all"),
  createTextTag("\n"),
  createPresetTag("roomDesc", "Minor Elemental"),
  createTextTag("\n"),
  createPresetTag("roomDesc", "401 Elemental Defense I"),
  createTextTag("\n"),
  createPresetTag("roomDesc", "402 Presence"),
  createTextTag("\n"),
  createPresetTag("roomDesc", "403 Lock Pick Enhancement"),
  createTextTag("\n"),
  createPresetTag("roomDesc", "Major Elemental"),
  createTextTag("\n"),
  createPresetTag("roomDesc", "501 Sleep"),
  createTextTag("\n"),
  createPresetTag("roomDesc", "502 Chromatic Circle"),
  createTextTag("\n"),
  createPresetTag("roomDesc", "503 Thurfel's Ward"),
  createTextTag("\n"),
  createPresetTag("roomDesc", "Wizard Base"),
  createTextTag("\n"),
  createPresetTag("roomDesc", "901 Minor Shock"),
  createTextTag("\n"),
  createPresetTag("roomDesc", "902 Minor Elemental Edge"),
];

const createCombatPreparationScenario = () => [
  createTextTag("A "),
  createGameLinkTag("orc001", "orc", "massive orc warrior"),
  createTextTag(" charges into the room wielding "),
  createGameLinkTag("orcweapon", "sword", "a bloodstained longsword"),
  createTextTag("!"),
  createTextTag("\n"),
  createTextTag("You quickly "),
  createGameCommandTag("get sword", "get"),
  createTextTag(" "),
  createGameLinkTag("sword123", "sword", "a steel sword"),
  createTextTag(" from the ground."),
  createTextTag("\n"),
  createTextTag("You can "),
  createGameCommandTag("attack orc", "attack orc"),
  createTextTag(", "),
  createGameCommandTag("cast 901 at orc", "cast 901 at orc"),
  createTextTag(", or "),
  createGameCommandTag("flee", "flee"),
  createTextTag(" to safety."),
];

const meta: Meta = {
  title: "Session/Feed/Mixed Complex Scenarios",
  component: "illthorn-feed-modernized-lit",
  parameters: {
    docs: {
      description: {
        component:
          "Complex mixed scenarios that combine equipment management, item highlighting, social interactions, and realistic game flow. These scenarios test the complete system working together as it would in actual gameplay.",
      },
    },
  },
  argTypes: {
    focused: {
      control: "boolean",
      description: "Whether the feed has focus",
    },
  },
};

export default meta;
type Story = StoryObj;

export const CompleteGameplaySession: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="complete-session"]') as FeedElement;
      if (feed?.appendGameTags) {
        const session = createCompleteGameplaySession();

        // Show the complete sequence with realistic timing
        feed.appendGameTags(session.roomEntry);

        setTimeout(() => {
          feed.appendGameTags(session.inventoryCheck);
        }, 800);

        setTimeout(() => {
          feed.appendGameTags(session.equipmentManagement);
        }, 1400);

        setTimeout(() => {
          feed.appendGameTags(session.socialScene);
        }, 1800);

        setTimeout(() => {
          feed.appendGameTags(session.backpackInspection);
        }, 2400);

        setTimeout(() => {
          feed.appendGameTags(session.playerMovement);
        }, 3000);
      }
    }, 100);

    return html`
      <div style="width: 950px; height: 800px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Complete Gameplay Session Flow</h3>
        <illthorn-feed-modernized-lit 
          data-story="complete-session"
          .focused=${args.focused}
          style="height: 600px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0 0 0.5rem 0;"><strong>Complete System Test:</strong></p>
          <ul style="margin: 0; padding-left: 1.5rem; font-size: 0.85rem;">
            <li>Room description with environmental objects and NPCs</li>
            <li>Full inventory display with mixed item categories</li>
            <li>Equipment manipulation commands</li>
            <li>Social interactions and NPC behavior</li>
            <li>Complex backpack contents with proper categorization</li>
            <li>Player movement and real-time social reactions</li>
          </ul>
        </div>
      </div>
    `;
  },
};

export const SpellListDisplay: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="spell-list"]') as FeedElement;
      if (feed?.appendGameTags) {
        feed.appendGameTags(createSpellListScenario());
      }
    }, 100);

    return html`
      <div style="width: 800px; height: 600px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Spell List Display</h3>
        <illthorn-feed-modernized-lit 
          data-story="spell-list"
          .focused=${args.focused}
          style="height: 450px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0; font-size: 0.85rem;"><strong>Spell List Formatting:</strong> Tests preset styling for spell categories and spell numbers. Should show proper formatting with themed colors.</p>
        </div>
      </div>
    `;
  },
};

export const CombatPreparation: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="combat-prep"]') as FeedElement;
      if (feed?.appendGameTags) {
        feed.appendGameTags(createCombatPreparationScenario());
      }
    }, 100);

    return html`
      <div style="width: 800px; height: 450px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Combat Preparation Scenario</h3>
        <illthorn-feed-modernized-lit 
          data-story="combat-prep"
          .focused=${args.focused}
          style="height: 300px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0 0 0.5rem 0;"><strong>Combat Elements:</strong></p>
          <ul style="margin: 0; padding-left: 1.5rem; font-size: 0.85rem;">
            <li><strong>Aggressive NPC:</strong> orc warrior (should be highlighted as aggressive)</li>
            <li><strong>Weapons:</strong> bloodstained longsword, steel sword (weapon highlighting)</li>
            <li><strong>Commands:</strong> get, attack, cast, flee (all clickable)</li>
            <li>Real combat scenario flow</li>
          </ul>
        </div>
      </div>
    `;
  },
};

export const EquipmentAndSocialMix: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="equipment-social"]') as FeedElement;
      if (feed?.appendGameTags) {
        // Mix equipment management with social interactions
        feed.appendGameTags([createTextTag("You enter the town square where "), createGameLinkTag("-10240033", "Parwyn", "Parwyn"), createTextTag(" is performing.")]);

        setTimeout(() => {
          feed.appendGameTags([createGameCommandTag("inventory", "inventory")]);
        }, 300);

        setTimeout(() => {
          feed.appendGameTags([
            createTextTag("You are wearing "),
            createGameLinkTag("137317213", "harness", "an enruned midnight blue harness"),
            createTextTag(" and carrying "),
            createGameLinkTag("137317214", "runestaff", "a silver-capped mesille runestaff"),
            createTextTag("."),
          ]);
        }, 600);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("Parwyn finishes her song and carefully cleans her "), createGameLinkTag("134750440", "ayr", "ayr"), createTextTag(".")]);
        }, 1000);

        setTimeout(() => {
          feed.appendGameTags([createGameCommandTag("look in my backpack", "look in my backpack")]);
        }, 1400);

        setTimeout(() => {
          feed.appendGameTags([
            createTextTag("In the backpack: "),
            createGameLinkTag("127002", "leaf", "some ambrominas leaf"),
            createTextTag(", "),
            createGameLinkTag("127006", "potion", "a rose-marrow potion"),
            createTextTag(", "),
            createGameLinkTag("127001", "tart", "a fruit tart"),
            createTextTag("."),
          ]);
        }, 1800);

        setTimeout(() => {
          feed.appendGameTags([createGameLinkTag("-10470747", "Rollandio", "Rollandio"), createTextTag(" just arrived and nods to you.")]);
        }, 2200);
      }
    }, 100);

    return html`
      <div style="width: 850px; height: 550px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Equipment & Social Interaction Mix</h3>
        <illthorn-feed-modernized-lit 
          data-story="equipment-social"
          .focused=${args.focused}
          style="height: 400px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0; font-size: 0.85rem;"><strong>Mixed Scenario:</strong> Combines equipment management commands with ongoing social interactions. Tests how highlighting works during complex multi-threaded gameplay.</p>
        </div>
      </div>
    `;
  },
};

export const ProgressiveItemDiscovery: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="progressive-items"]') as FeedElement;
      if (feed?.appendGameTags) {
        // Simulate discovering items over time in different categories
        feed.appendGameTags([createTextTag("You search the area carefully...")]);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("You find "), createGameLinkTag("find1", "sword", "a rusty sword"), createTextTag("!")]);
        }, 400);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("Behind some rocks, you discover "), createGameLinkTag("find2", "ring", "a magic ring"), createTextTag(".")]);
        }, 800);

        setTimeout(() => {
          feed.appendGameTags([
            createTextTag("In a small pouch: "),
            createGameLinkTag("find3", "leaf", "some healing herbs"),
            createTextTag(" and "),
            createGameLinkTag("find4", "potion", "a mana potion"),
            createTextTag("."),
          ]);
        }, 1200);

        setTimeout(() => {
          feed.appendGameTags([
            createTextTag("You also notice "),
            createGameLinkTag("find5", "tart", "a stale tart"),
            createTextTag(" and "),
            createGameLinkTag("find6", "loaf", "some manna bread"),
            createTextTag(" in the corner."),
          ]);
        }, 1600);

        setTimeout(() => {
          feed.appendGameTags([
            createTextTag("An "),
            createGameLinkTag("find7", "amulet", "ancient amulet"),
            createTextTag(" glints from under a pile of "),
            createGameLinkTag("find8", "leather", "old leather armor"),
            createTextTag("."),
          ]);
        }, 2000);

        setTimeout(() => {
          feed.appendGameTags([createGameCommandTag("get all", "get all"), createTextTag(" - you collect everything useful.")]);
        }, 2400);
      }
    }, 100);

    return html`
      <div style="width: 800px; height: 550px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Progressive Item Discovery</h3>
        <illthorn-feed-modernized-lit 
          data-story="progressive-items"
          .focused=${args.focused}
          style="height: 400px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0 0 0.5rem 0;"><strong>Item Discovery Flow:</strong></p>
          <ul style="margin: 0; padding-left: 1.5rem; font-size: 0.85rem;">
            <li>Weapons, magic items, herbs, food, armor appear progressively</li>
            <li>Each item gets proper category highlighting as it appears</li>
            <li>Tests highlighting performance with real-time item addition</li>
            <li>Demonstrates typical treasure hunting gameplay</li>
          </ul>
        </div>
      </div>
    `;
  },
};

export const FullGameplayExperience: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="full-experience"]') as FeedElement;
      if (feed?.appendGameTags) {
        const session = createCompleteGameplaySession();

        // Show the ultra-complete experience - everything together
        feed.appendGameTags(session.roomEntry);

        setTimeout(() => {
          feed.appendGameTags(createSpellListScenario().slice(0, 6)); // Just a few spells
        }, 600);

        setTimeout(() => {
          feed.appendGameTags(session.inventoryCheck);
        }, 1200);

        setTimeout(() => {
          feed.appendGameTags(session.socialScene);
        }, 1800);

        setTimeout(() => {
          feed.appendGameTags(createCombatPreparationScenario());
        }, 2400);

        setTimeout(() => {
          feed.appendGameTags(session.backpackInspection);
        }, 3000);

        setTimeout(() => {
          feed.appendGameTags([createPresetTag("speech", 'Parwyn says, "Good luck in your adventures!"')]);
        }, 3600);

        setTimeout(() => {
          feed.appendGameTags([createGameCommandTag("save", "save"), createTextTag(" - Your progress has been saved.")]);
        }, 4000);
      }
    }, 100);

    return html`
      <div style="width: 1000px; height: 900px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Full Gameplay Experience</h3>
        <illthorn-feed-modernized-lit 
          data-story="full-experience"
          .focused=${args.focused}
          style="height: 700px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0 0 0.5rem 0;"><strong>Ultimate System Test:</strong></p>
          <ul style="margin: 0; padding-left: 1.5rem; font-size: 0.85rem;">
            <li>Complete room description and NPC interaction</li>
            <li>Spell system display</li>
            <li>Equipment and inventory management</li>
            <li>Social interactions and musical performance</li>
            <li>Combat preparation scenario</li>
            <li>Mixed item categorization testing</li>
            <li>All highlighting categories working together</li>
            <li>Performance under complex content load</li>
          </ul>
        </div>
      </div>
    `;
  },
};
