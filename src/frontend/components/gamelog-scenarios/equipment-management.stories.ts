// ABOUTME: Storybook stories for equipment management scenarios from the icemule gamelog
// ABOUTME: Tests highlighting functionality with real inventory and equipment data

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../session/feed/feed-modernized.lit";
import type { GameTag } from "../../parser/tag";
import { makeTag } from "../../parser/tag";

// Import the mock item highlighter setup from feed stories
import { ItemHighlighter } from "../game-elements/item-highlighting";

// Extend the mock with equipment-specific categories from the icemule log
const equipmentMockHighlighter = {
  // Equipment categories based on actual items from icemule log
  _categoryMappings: {
    // Weapons from the log
    runestaff: "weapon",
    staff: "weapon",

    // Armor and defensive items
    harness: "clothing", // enruned midnight blue harness
    leather: "armor", // old full leather
    shield: "forgeable",

    // Jewelry from the log
    stickpin: "jewelry", // diamond-set platinum stickpin
    ring: "magic", // faded gold ring

    // Clothing items
    jacket: "clothing", // wool jacket
    purse: "clothing", // gak wool purse
    backpack: "clothing", // bone-clasped forest green backpack
    boots: "clothing", // glazed leather boots
    breeches: "clothing", // dark silver-buttoned breeches
    cap: "clothing", // silvery green leather cap

    // Magic items from backpack
    amulet: "magic", // crystal amulet

    // Herbs and reagents from backpack (ambrominas leaf, basal moss, etc.)
    leaf: "herb",
    moss: "herb",
    stem: "herb",
    lichen: "herb",
    fruit: "herb",
    tart: "food", // gelatinous elk fat tart, iceberry tart, etc.
    potion: "herb", // rose-marrow potion
    elixir: "herb", // snowflake elixir
    pie: "food", // sparrowhawk pie
    porridge: "food", // frog's bone porridge
    soup: "food", // polar bear fat soup
    loaf: "manna bread", // sweet pineapple-glazed pumpkin loaf

    // Weapons mentioned in spell list or equipment
    blade: "weapon",
    sword: "weapon",

    // Tools and containers
    wastebin: "box",
  } as Record<string, string>,

  categorizeGameElement(attributes: { noun?: string; exist?: string; name?: string }) {
    const { noun, exist, name } = attributes;
    console.log("[EQUIPMENT MOCK] categorizeGameElement called with:", { noun, exist, name });

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

    // Try name matching for complex item names
    if (name) {
      const lowerName = name.toLowerCase();
      for (const [nounKey, category] of Object.entries(this._categoryMappings)) {
        if (lowerName.includes(nounKey)) {
          return {
            category,
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

  async initialize() {
    // Mock initialization
  },

  isCategoryEnabled(_category: string) {
    return true;
  },

  get isReady() {
    return true;
  },
};

// Apply the mock to ItemHighlighter
ItemHighlighter.categorizeGameElement = equipmentMockHighlighter.categorizeGameElement.bind(equipmentMockHighlighter);
ItemHighlighter.getItemCategory = equipmentMockHighlighter.getItemCategory.bind(equipmentMockHighlighter);
ItemHighlighter.initialize = equipmentMockHighlighter.initialize.bind(equipmentMockHighlighter);
ItemHighlighter.isCategoryEnabled = equipmentMockHighlighter.isCategoryEnabled.bind(equipmentMockHighlighter);
Object.defineProperty(ItemHighlighter, "isReady", {
  get: () => true,
  configurable: true,
});

// Import game element components
import "../game-elements/game-link.lit";
import "../game-elements/game-command.lit";

// Type for feed component in gamelog contexts
type FeedElement = HTMLElement & {
  appendGameTags: (tags: Array<GameTag>) => void;
  shadowRoot: ShadowRoot | null;
};

// Utility functions for creating realistic game tags from icemule log content
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

// Equipment scenarios based on actual icemule log content
const createInventoryDisplayScenario = () => [
  createTextTag("You are wearing "),
  createGameLinkTag("137317213", "harness", "an enruned midnight blue harness"),
  createTextTag(", "),
  createGameLinkTag("137317215", "leather", "some old full leather"),
  createTextTag(", "),
  createGameLinkTag("137317216", "stickpin", "a diamond-set platinum stickpin"),
  createTextTag(", "),
  createGameLinkTag("137317217", "ring", "a faded gold ring"),
  createTextTag(", "),
  createGameLinkTag("137317218", "jacket", "a wool jacket"),
  createTextTag(", "),
  createGameLinkTag("137317220", "purse", "a gak wool purse"),
  createTextTag(", "),
  createGameLinkTag("137317230", "backpack", "a bone-clasped forest green backpack"),
  createTextTag(", "),
  createGameLinkTag("137317270", "boots", "a pair of glazed leather boots"),
  createTextTag(", "),
  createGameLinkTag("137317271", "breeches", "some dark silver-buttoned breeches"),
  createTextTag(", and "),
  createGameLinkTag("137317272", "cap", "a silvery green leather cap"),
  createTextTag("."),
];

const createBackpackContentsScenario = () => [
  createTextTag("In the forest green backpack:"),
  createTextTag("\n"),
  createPresetTag("roomDesc", "Magic Items [1]: "),
  createGameLinkTag("137317263", "amulet", "a crystal amulet"),
  createTextTag("\n"),
  createPresetTag("roomDesc", "Herbs [37]: "),
  createGameLinkTag("127001", "tart", "a gelatinous elk fat tart"),
  createTextTag(", "),
  createGameLinkTag("127002", "leaf", "some ambrominas leaf"),
  createTextTag(" (3), "),
  createGameLinkTag("127003", "moss", "some basal moss"),
  createTextTag(" (2), "),
  createGameLinkTag("127004", "leaf", "some acantha leaf"),
  createTextTag(" (6), "),
  createGameLinkTag("127005", "pie", "a slice of sparrowhawk pie"),
  createTextTag(", "),
  createGameLinkTag("127006", "potion", "a rose-marrow potion"),
  createTextTag(" (6), "),
  createGameLinkTag("127007", "tart", "an iceberry tart"),
  createTextTag(" (2), "),
  createGameLinkTag("127008", "tart", "a tiny ram's bladder tart"),
  createTextTag(" (2), "),
  createGameLinkTag("127009", "porridge", "some frog's bone porridge"),
  createTextTag(", "),
  createGameLinkTag("127010", "moss", "some ephlox moss"),
  createTextTag(" (3), "),
  createGameLinkTag("127011", "fruit", "some calamia fruit"),
  createTextTag(", "),
  createGameLinkTag("127012", "lichen", "some wolifrew lichen"),
  createTextTag(" (2), "),
  createGameLinkTag("127013", "elixir", "a snowflake elixir"),
  createTextTag(", "),
  createGameLinkTag("127014", "stem", "some aloeas stem"),
  createTextTag("\n"),
  createPresetTag("roomDesc", "Food/Drink [1]: "),
  createGameLinkTag("127015", "loaf", "a sweet pineapple-glazed pumpkin loaf"),
  createTextTag("\n"),
  createPresetTag("roomDesc", "Total items: 39"),
];

const createEquipmentCommandsScenario = () => [
  createGameCommandTag("gird", "gird"),
  createTextTag("\n"),
  createTextTag("You remove "),
  createGameLinkTag("137317214", "runestaff", "a silver-capped mesille runestaff"),
  createTextTag(" from in your "),
  createGameLinkTag("137317213", "harness", "midnight blue harness"),
  createTextTag("."),
  createTextTag("\n"),
  createGameCommandTag("store", "store"),
  createTextTag("\n"),
  createPresetTag("roomDesc", "Usage: STORE SHIELD"),
  createTextTag("\n"),
  createPresetTag("roomDesc", "STORE WEAPON"),
  createTextTag("\n"),
  createPresetTag("roomDesc", "STORE 2WEAPON"),
  createTextTag("\n"),
  createPresetTag("roomDesc", "STORE RANGED"),
  createTextTag("\n"),
  createGameCommandTag("store weapon", "store weapon"),
  createTextTag("\n"),
  createTextTag("You put "),
  createGameLinkTag("137317214", "runestaff", "a silver-capped mesille runestaff"),
  createTextTag(" in your "),
  createGameLinkTag("137317213", "harness", "midnight blue harness"),
  createTextTag("."),
];

const meta: Meta = {
  title: "Session/Feed/Equipment Management",
  component: "illthorn-feed-modernized-lit",
  parameters: {
    docs: {
      description: {
        component:
          "Real equipment management scenarios from the icemule gamelog. Tests highlighting functionality with actual inventory data, equipment commands, and item categorization as experienced in gameplay.",
      },
    },
  },
  argTypes: {
    focused: {
      control: "boolean",
      description: "Whether the feed has focus (shows focus border)",
    },
  },
};

export default meta;
type Story = StoryObj;

export const PlayerInventoryDisplay: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="inventory"]') as FeedElement;
      if (feed?.appendGameTags) {
        // Show the inventory command first
        feed.appendGameTags([createGameCommandTag("inventory", "inventory")]);

        setTimeout(() => {
          // Then show the complete inventory list as it appears in the game
          feed.appendGameTags(createInventoryDisplayScenario());

          setTimeout(() => {
            feed.appendGameTags([createPresetTag("roomDesc", "[Click INVENTORY HELP for more options.]")]);
          }, 300);
        }, 200);
      }
    }, 100);

    return html`
      <div style="width: 800px; height: 400px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Player Inventory Display</h3>
        <illthorn-feed-modernized-lit 
          data-story="inventory"
          .focused=${args.focused}
          style="height: 300px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0 0 0.5rem 0;"><strong>Highlighting Verification:</strong></p>
          <ul style="margin: 0; padding-left: 1.5rem; font-size: 0.85rem;">
            <li><strong>Clothing items:</strong> harness, jacket, purse, backpack, boots, breeches, cap</li>
            <li><strong>Armor:</strong> full leather armor</li>
            <li><strong>Jewelry:</strong> platinum stickpin</li>
            <li><strong>Magic items:</strong> faded gold ring</li>
          </ul>
        </div>
      </div>
    `;
  },
};

export const BackpackContentsInspection: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="backpack"]') as FeedElement;
      if (feed?.appendGameTags) {
        // Show the look command first
        feed.appendGameTags([createGameCommandTag("look in my backpack", "look in my backpack")]);

        setTimeout(() => {
          // Then show the organized backpack contents
          feed.appendGameTags(createBackpackContentsScenario());
        }, 300);
      }
    }, 100);

    return html`
      <div style="width: 900px; height: 500px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Backpack Contents with Mixed Item Types</h3>
        <illthorn-feed-modernized-lit 
          data-story="backpack"
          .focused=${args.focused}
          style="height: 350px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0 0 0.5rem 0;"><strong>Category Highlighting Test:</strong></p>
          <ul style="margin: 0; padding-left: 1.5rem; font-size: 0.85rem;">
            <li><strong>Magic items:</strong> crystal amulet</li>
            <li><strong>Herbs/reagents:</strong> ambrominas leaf, basal moss, acantha leaf, ephlox moss, calamia fruit, wolifrew lichen, aloeas stem, rose-marrow potion, snowflake elixir</li>
            <li><strong>Food:</strong> gelatinous elk fat tart, sparrowhawk pie, iceberry tart, ram's bladder tart, frog's bone porridge</li>
            <li><strong>Manna bread:</strong> pineapple-glazed pumpkin loaf</li>
          </ul>
        </div>
      </div>
    `;
  },
};

export const EquipmentCommands: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="equipment-commands"]') as FeedElement;
      if (feed?.appendGameTags) {
        // Simulate the equipment command sequence from the icemule log
        feed.appendGameTags(createEquipmentCommandsScenario());
      }
    }, 100);

    return html`
      <div style="width: 800px; height: 450px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Equipment Management Commands</h3>
        <illthorn-feed-modernized-lit 
          data-story="equipment-commands"
          .focused=${args.focused}
          style="height: 320px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0 0 0.5rem 0;"><strong>Real Gameplay Sequence:</strong></p>
          <ul style="margin: 0; padding-left: 1.5rem; font-size: 0.85rem;">
            <li><strong>gir command:</strong> Gets runestaff from harness</li>
            <li><strong>store command:</strong> Shows usage help</li>
            <li><strong>store weapon:</strong> Puts runestaff back in harness</li>
            <li><strong>Item highlighting:</strong> Runestaff (weapon), harness (clothing)</li>
            <li><strong>Interactive commands:</strong> All commands are clickable</li>
          </ul>
        </div>
      </div>
    `;
  },
};

export const CompleteEquipmentFlow: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="complete-flow"]') as FeedElement;
      if (feed?.appendGameTags) {
        // Show complete equipment management flow
        feed.appendGameTags([createGameCommandTag("inventory", "inventory")]);

        setTimeout(() => {
          feed.appendGameTags(createInventoryDisplayScenario());
        }, 300);

        setTimeout(() => {
          feed.appendGameTags([createGameCommandTag("look in my backpack", "look in my backpack")]);
        }, 800);

        setTimeout(() => {
          feed.appendGameTags(createBackpackContentsScenario());
        }, 1100);

        setTimeout(() => {
          feed.appendGameTags([createGameCommandTag("gird", "gird")]);
        }, 1600);

        setTimeout(() => {
          feed.appendGameTags([
            createTextTag("You remove "),
            createGameLinkTag("137317214", "runestaff", "a silver-capped mesille runestaff"),
            createTextTag(" from in your "),
            createGameLinkTag("137317213", "harness", "midnight blue harness"),
            createTextTag("."),
          ]);
        }, 1900);
      }
    }, 100);

    return html`
      <div style="width: 900px; height: 600px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Complete Equipment Management Flow</h3>
        <illthorn-feed-modernized-lit 
          data-story="complete-flow"
          .focused=${args.focused}
          style="height: 450px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0 0 0.5rem 0;"><strong>Comprehensive Equipment Testing:</strong></p>
          <ul style="margin: 0; padding-left: 1.5rem; font-size: 0.85rem;">
            <li>All item categories from actual gameplay</li>
            <li>Progressive message flow simulation</li>
            <li>Interactive command verification</li>
            <li>Complex item categorization test</li>
            <li>Real highlighting behavior validation</li>
          </ul>
        </div>
      </div>
    `;
  },
};

export const HighlightingComparison: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="highlighting-comparison"]') as FeedElement;
      if (feed?.appendGameTags) {
        feed.appendGameTags([createPresetTag("roomDesc", "=== Highlighting Category Verification ===")]);

        setTimeout(() => {
          feed.appendGameTags([
            createPresetTag("roomDesc", "WEAPONS: "),
            createGameLinkTag("w1", "runestaff", "silver-capped mesille runestaff"),
            createTextTag(" | "),
            createGameLinkTag("w2", "sword", "steel longsword"),
            createTextTag(" | "),
            createGameLinkTag("w3", "blade", "curved blade"),
          ]);
        }, 200);

        setTimeout(() => {
          feed.appendGameTags([
            createPresetTag("roomDesc", "ARMOR: "),
            createGameLinkTag("a1", "leather", "old full leather"),
            createTextTag(" | "),
            createGameLinkTag("a2", "shield", "wooden shield"),
          ]);
        }, 400);

        setTimeout(() => {
          feed.appendGameTags([
            createPresetTag("roomDesc", "CLOTHING: "),
            createGameLinkTag("c1", "harness", "midnight blue harness"),
            createTextTag(" | "),
            createGameLinkTag("c2", "jacket", "wool jacket"),
            createTextTag(" | "),
            createGameLinkTag("c3", "boots", "leather boots"),
          ]);
        }, 600);

        setTimeout(() => {
          feed.appendGameTags([
            createPresetTag("roomDesc", "MAGIC: "),
            createGameLinkTag("m1", "ring", "faded gold ring"),
            createTextTag(" | "),
            createGameLinkTag("m2", "amulet", "crystal amulet"),
          ]);
        }, 800);

        setTimeout(() => {
          feed.appendGameTags([createPresetTag("roomDesc", "JEWELRY: "), createGameLinkTag("j1", "stickpin", "platinum stickpin")]);
        }, 1000);

        setTimeout(() => {
          feed.appendGameTags([
            createPresetTag("roomDesc", "HERBS: "),
            createGameLinkTag("h1", "leaf", "ambrominas leaf"),
            createTextTag(" | "),
            createGameLinkTag("h2", "moss", "ephlox moss"),
            createTextTag(" | "),
            createGameLinkTag("h3", "potion", "rose-marrow potion"),
          ]);
        }, 1200);
      }
    }, 100);

    return html`
      <div style="width: 900px; height: 450px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Item Category Highlighting Verification</h3>
        <illthorn-feed-modernized-lit 
          data-story="highlighting-comparison"
          .focused=${args.focused}
          style="height: 300px; overflow-y: auto; border: 1px solid var(--color-border);"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0 0 0.5rem 0;"><strong>Visual Highlighting Test:</strong></p>
          <p style="margin: 0; font-size: 0.85rem;">Each category should have distinct highlighting colors matching the theme. Hover over items to verify hover states work correctly.</p>
        </div>
      </div>
    `;
  },
};
