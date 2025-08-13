// ABOUTME: Storybook stories for item highlighting categorization from the icemule gamelog
// ABOUTME: Tests the highlighting system's categorization logic with real and edge case scenarios

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../session/feed/feed-modernized.lit";
import type { GameTag } from "../../parser/tag";
import { makeTag } from "../../parser/tag";

// Import and extend the item highlighter for highlighting-specific testing
import { ItemHighlighter } from "../game-elements/item-highlighting";

// Extended mock that includes debug scenarios and edge cases from the log
const highlightingMockHighlighter = {
  _categoryMappings: {
    // Weapons - various types from game data
    sword: "weapon",
    longsword: "weapon",
    gladius: "weapon",
    runestaff: "weapon",
    staff: "weapon",
    blade: "weapon",
    dagger: "weapon",
    dirk: "weapon",

    // Armor and shields
    leather: "armor",
    armor: "armor",
    shield: "forgeable",
    breastplate: "armor",

    // Clothing items from the log
    harness: "clothing",
    jacket: "clothing",
    robe: "clothing",
    cloak: "clothing",
    boots: "clothing",
    breeches: "clothing",
    cap: "clothing",
    backpack: "clothing",
    purse: "clothing",

    // Jewelry and accessories
    ring: "magic", // Some rings are magic
    stickpin: "jewelry",
    amulet: "magic",
    necklace: "jewelry",
    bracelet: "jewelry",

    // Herbs and reagents (extensive list from backpack)
    leaf: "herb", // ambrominas leaf, acantha leaf
    moss: "herb", // basal moss, ephlox moss
    stem: "herb", // aloeas stem
    lichen: "herb", // wolifrew lichen
    fruit: "herb", // calamia fruit
    potion: "herb", // rose-marrow potion
    elixir: "herb", // snowflake elixir

    // Food items
    tart: "food", // various tarts from backpack
    pie: "food", // sparrowhawk pie
    porridge: "food", // frog's bone porridge
    soup: "food", // polar bear fat soup

    // Manna bread (special food category)
    loaf: "manna bread", // pineapple-glazed pumpkin loaf
    bread: "manna bread",

    // Magic items and scrolls
    scroll: "scroll",
    wand: "wand",
    orb: "magic",
    crystal: "magic",

    // Musical instruments (from Parwyn interactions)
    ayr: "instrument",
    lute: "instrument",
    harp: "instrument",

    // Containers
    chest: "box",
    bag: "box",
    pouch: "box",
    wastebin: "box", // woven bark wastebin from room

    // NPCs that appear in the log
    // Note: Player names like "Parwyn", "Rollandio" should NOT categorize

    // Items that might not categorize (exits, environmental objects)
    statue: null, // mule statue - should not highlight
    bench: null, // stone bench - should not highlight
    board: null, // message board - should not highlight
    barrel: null, // silver-bound barrel - should not highlight

    // Creatures/monsters
    spider: "aggressive npc", // peacock spider
    bat: "aggressive npc",
    orc: "aggressive npc",
    goblin: "aggressive npc",
  } as Record<string, string | null>,

  // Track categorization attempts for debugging display
  _categorizationLog: [] as Array<{
    noun?: string;
    exist?: string;
    name?: string;
    result: string | null;
    confidence: string;
    source: string;
  }>,

  async categorizeGameElement(attributes: { noun?: string; exist?: string; name?: string }) {
    const { noun, exist, name } = attributes;

    // Log the categorization attempt
    console.log("[HIGHLIGHTING MOCK] categorizeGameElement called with:", { noun, exist, name });

    let category: string | null = null;
    let confidence: "high" | "medium" | "low" = "low";
    let source: "noun" | "exist" | "name" | "fallback" = "fallback";

    // Try noun first (highest confidence)
    if (noun) {
      const nounCategory = this._categoryMappings[noun.toLowerCase()];
      if (nounCategory !== undefined) {
        category = nounCategory;
        confidence = "high";
        source = "noun";
      }
    }

    // Try exist attribute if noun didn't work
    if (!category && exist) {
      const existCategory = this._categoryMappings[exist.toLowerCase()];
      if (existCategory !== undefined) {
        category = existCategory;
        confidence = "medium";
        source = "exist";
      }
    }

    // Try name matching (lowest confidence)
    if (!category && name) {
      const lowerName = name.toLowerCase();
      for (const [key, value] of Object.entries(this._categoryMappings)) {
        if (lowerName.includes(key)) {
          category = value as string | null;
          confidence = "low";
          source = "name";
          break;
        }
      }
    }

    // Log the result for debugging stories
    this._categorizationLog.push({
      noun,
      exist,
      name,
      result: category,
      confidence,
      source,
    });

    return {
      category,
      confidence,
      source,
    };
  },

  async getItemCategory(noun: string, fullName?: string) {
    const result = await this.categorizeGameElement({ noun, name: fullName });
    return result.category;
  },

  getCategorizationLog() {
    return this._categorizationLog;
  },

  clearCategorizationLog() {
    this._categorizationLog = [];
  },

  async initialize() {
    // Mock initialization
  },

  async isCategoryEnabled(_category: string) {
    return true;
  },

  get isReady() {
    return true;
  },
};

// Apply the mock to ItemHighlighter
ItemHighlighter.categorizeGameElement = highlightingMockHighlighter.categorizeGameElement.bind(highlightingMockHighlighter);
ItemHighlighter.getItemCategory = highlightingMockHighlighter.getItemCategory.bind(highlightingMockHighlighter);
ItemHighlighter.initialize = highlightingMockHighlighter.initialize.bind(highlightingMockHighlighter);
ItemHighlighter.isCategoryEnabled = highlightingMockHighlighter.isCategoryEnabled.bind(highlightingMockHighlighter);
Object.defineProperty(ItemHighlighter, "isReady", {
  get: () => true,
  configurable: true,
});

// Import game element components
import "../game-elements/game-link.lit";
import "../game-elements/game-command.lit";

// Type for feed component
type FeedElement = HTMLElement & {
  appendGameTags?: (tags: Array<GameTag>) => void;
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

// Highlighting scenarios based on icemule log categorization attempts
const createWeaponHighlightingScenario = () => [
  createPresetTag("roomDesc", "=== WEAPON HIGHLIGHTING TEST ==="),
  createTextTag("\n"),
  createTextTag("You see "),
  createGameLinkTag("125592513", "gladius", "a matte black golvern gladius"),
  createTextTag(", "),
  createGameLinkTag("weapon2", "longsword", "a steel longsword"),
  createTextTag(", "),
  createGameLinkTag("137317214", "runestaff", "a silver-capped mesille runestaff"),
  createTextTag(", and "),
  createGameLinkTag("weapon4", "dagger", "a sharp dagger"),
  createTextTag(" here."),
];

const createArmorClothingScenario = () => [
  createPresetTag("roomDesc", "=== ARMOR & CLOTHING TEST ==="),
  createTextTag("\n"),
  createTextTag("Armor: "),
  createGameLinkTag("137317215", "leather", "some old full leather"),
  createTextTag(", "),
  createGameLinkTag("armor2", "shield", "a wooden shield"),
  createTextTag("\n"),
  createTextTag("Clothing: "),
  createGameLinkTag("137317213", "harness", "an enruned midnight blue harness"),
  createTextTag(", "),
  createGameLinkTag("137317218", "jacket", "a wool jacket"),
  createTextTag(", "),
  createGameLinkTag("137317270", "boots", "a pair of glazed leather boots"),
];

const createHerbReagentScenario = () => [
  createPresetTag("roomDesc", "=== HERBS & REAGENTS TEST ==="),
  createTextTag("\n"),
  createTextTag("Herbs: "),
  createGameLinkTag("127002", "leaf", "some ambrominas leaf"),
  createTextTag(", "),
  createGameLinkTag("127003", "moss", "some basal moss"),
  createTextTag(", "),
  createGameLinkTag("127004", "leaf", "some acantha leaf"),
  createTextTag(", "),
  createGameLinkTag("127010", "moss", "some ephlox moss"),
  createTextTag("\n"),
  createTextTag("Reagents: "),
  createGameLinkTag("127006", "potion", "a rose-marrow potion"),
  createTextTag(", "),
  createGameLinkTag("127013", "elixir", "a snowflake elixir"),
  createTextTag(", "),
  createGameLinkTag("127014", "stem", "some aloeas stem"),
];

const createMagicJewelryScenario = () => [
  createPresetTag("roomDesc", "=== MAGIC & JEWELRY TEST ==="),
  createTextTag("\n"),
  createTextTag("Magic: "),
  createGameLinkTag("137317217", "ring", "a faded gold ring"),
  createTextTag(", "),
  createGameLinkTag("137317263", "amulet", "a crystal amulet"),
  createTextTag(", "),
  createGameLinkTag("magic3", "orb", "a glowing orb"),
  createTextTag("\n"),
  createTextTag("Jewelry: "),
  createGameLinkTag("137317216", "stickpin", "a diamond-set platinum stickpin"),
  createTextTag(", "),
  createGameLinkTag("jewelry2", "necklace", "a silver necklace"),
];

const createFoodContainerScenario = () => [
  createPresetTag("roomDesc", "=== FOOD & CONTAINERS TEST ==="),
  createTextTag("\n"),
  createTextTag("Food: "),
  createGameLinkTag("127001", "tart", "a gelatinous elk fat tart"),
  createTextTag(", "),
  createGameLinkTag("127005", "pie", "a slice of sparrowhawk pie"),
  createTextTag(", "),
  createGameLinkTag("127009", "porridge", "some frog's bone porridge"),
  createTextTag("\n"),
  createTextTag("Manna Bread: "),
  createGameLinkTag("127015", "loaf", "a sweet pineapple-glazed pumpkin loaf"),
  createTextTag("\n"),
  createTextTag("Containers: "),
  createGameLinkTag("container1", "chest", "a wooden chest"),
  createTextTag(", "),
  createGameLinkTag("137317230", "backpack", "a bone-clasped forest green backpack"),
];

const createNonHighlightedScenario = () => [
  createPresetTag("roomDesc", "=== NON-HIGHLIGHTED ITEMS TEST ==="),
  createTextTag("\n"),
  createTextTag("Environmental objects (should NOT highlight): "),
  createGameLinkTag("-480436", "statue", "a sturdy mule statue"),
  createTextTag(", "),
  createGameLinkTag("-464992", "bench", "a smooth dark stone bench"),
  createTextTag(", "),
  createGameLinkTag("env3", "board", "a burled pine message board"),
  createTextTag(", "),
  createGameLinkTag("env4", "barrel", "a colorful silver-bound barrel"),
  createTextTag("\n"),
  createTextTag("These items should appear as normal text without highlighting."),
];

const createFailedCategorizationScenario = () => [
  createPresetTag("roomDesc", "=== CATEGORIZATION EDGE CASES ==="),
  createTextTag("\n"),
  createTextTag("Player names (should not categorize): "),
  createGameLinkTag("-10240033", "Parwyn", "Parwyn"),
  createTextTag(", "),
  createGameLinkTag("-10470747", "Rollandio", "Rollandio"),
  createTextTag("\n"),
  createTextTag("Unknown items: "),
  createGameLinkTag("unknown1", "whatsit", "a mysterious whatsit"),
  createTextTag(", "),
  createGameLinkTag("unknown2", "thingamajig", "a strange thingamajig"),
  createTextTag("\n"),
  createTextTag("These demonstrate fallback behavior when categorization fails."),
];

const meta: Meta = {
  title: "Session/Feed/Item Highlighting",
  component: "illthorn-feed-modernized-lit",
  parameters: {
    docs: {
      description: {
        component:
          "Item highlighting and categorization scenarios from the icemule gamelog. Tests the highlighting system's ability to properly categorize different types of items and handle edge cases where categorization fails.",
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

export const WeaponHighlighting: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="weapons"]') as FeedElement;
      if (feed?.appendGameTags) {
        feed.appendGameTags(createWeaponHighlightingScenario());
      }
    }, 100);

    return html`
      <div style="width: 800px; height: 350px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Weapon Highlighting Verification</h3>
        <illthorn-feed-modernized-lit 
          data-story="weapons"
          .focused=${args.focused}
          style="height: 250px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0; font-size: 0.85rem;"><strong>Expected:</strong> All weapons should have weapon highlighting (typically red/orange colors). Hover states should work for each weapon link.</p>
        </div>
      </div>
    `;
  },
};

export const ArmorAndClothing: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="armor-clothing"]') as FeedElement;
      if (feed?.appendGameTags) {
        feed.appendGameTags(createArmorClothingScenario());
      }
    }, 100);

    return html`
      <div style="width: 800px; height: 400px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Armor & Clothing Category Test</h3>
        <illthorn-feed-modernized-lit 
          data-story="armor-clothing"
          .focused=${args.focused}
          style="height: 300px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0; font-size: 0.85rem;"><strong>Expected:</strong> Armor items (leather, shield) should have armor highlighting. Clothing items (harness, jacket, boots) should have clothing highlighting.</p>
        </div>
      </div>
    `;
  },
};

export const HerbsAndReagents: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="herbs"]') as FeedElement;
      if (feed?.appendGameTags) {
        feed.appendGameTags(createHerbReagentScenario());
      }
    }, 100);

    return html`
      <div style="width: 800px; height: 400px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Herbs & Reagents Highlighting</h3>
        <illthorn-feed-modernized-lit 
          data-story="herbs"
          .focused=${args.focused}
          style="height: 300px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0; font-size: 0.85rem;"><strong>Expected:</strong> All herbs and reagents should have herb highlighting (typically purple/magenta). This includes leaves, moss, stems, potions, and elixirs.</p>
        </div>
      </div>
    `;
  },
};

export const MagicAndJewelry: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="magic-jewelry"]') as FeedElement;
      if (feed?.appendGameTags) {
        feed.appendGameTags(createMagicJewelryScenario());
      }
    }, 100);

    return html`
      <div style="width: 800px; height: 400px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Magic Items & Jewelry</h3>
        <illthorn-feed-modernized-lit 
          data-story="magic-jewelry"
          .focused=${args.focused}
          style="height: 300px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0; font-size: 0.85rem;"><strong>Expected:</strong> Magic items should have magic highlighting, jewelry items should have jewelry highlighting. Note the distinction between magical rings vs. decorative jewelry.</p>
        </div>
      </div>
    `;
  },
};

export const FoodAndContainers: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="food-containers"]') as FeedElement;
      if (feed?.appendGameTags) {
        feed.appendGameTags(createFoodContainerScenario());
      }
    }, 100);

    return html`
      <div style="width: 800px; height: 450px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Food & Containers</h3>
        <illthorn-feed-modernized-lit 
          data-story="food-containers"
          .focused=${args.focused}
          style="height: 350px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0; font-size: 0.85rem;"><strong>Expected:</strong> Regular food and manna bread should have different highlighting colors. Containers should have container highlighting.</p>
        </div>
      </div>
    `;
  },
};

export const NonHighlightedItems: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="non-highlighted"]') as FeedElement;
      if (feed?.appendGameTags) {
        feed.appendGameTags(createNonHighlightedScenario());
      }
    }, 100);

    return html`
      <div style="width: 800px; height: 400px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Non-Highlighted Environmental Objects</h3>
        <illthorn-feed-modernized-lit 
          data-story="non-highlighted"
          .focused=${args.focused}
          style="height: 300px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0; font-size: 0.85rem;"><strong>Expected:</strong> Environmental objects like statues, benches, boards, and barrels should appear as normal clickable links without special highlighting colors.</p>
        </div>
      </div>
    `;
  },
};

export const EdgeCasesAndFailures: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="edge-cases"]') as FeedElement;
      if (feed?.appendGameTags) {
        feed.appendGameTags(createFailedCategorizationScenario());
      }
    }, 100);

    return html`
      <div style="width: 800px; height: 400px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Categorization Edge Cases</h3>
        <illthorn-feed-modernized-lit 
          data-story="edge-cases"
          .focused=${args.focused}
          style="height: 300px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0; font-size: 0.85rem;"><strong>Expected:</strong> Player names and unknown items should not have highlighting. They should appear as normal links, demonstrating graceful fallback behavior.</p>
        </div>
      </div>
    `;
  },
};

export const ProgressiveHighlighting: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="progressive"]') as FeedElement;
      if (feed?.appendGameTags) {
        // Show items being added progressively to simulate real game flow
        feed.appendGameTags([createPresetTag("roomDesc", "=== PROGRESSIVE HIGHLIGHTING DEMO ===")]);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("Weapons appear: "), createGameLinkTag("w1", "sword", "a steel sword")]);
        }, 300);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("Armor found: "), createGameLinkTag("a1", "leather", "leather armor")]);
        }, 600);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("Herbs discovered: "), createGameLinkTag("h1", "leaf", "some herbs")]);
        }, 900);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("Magic detected: "), createGameLinkTag("m1", "ring", "a magic ring")]);
        }, 1200);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("Food located: "), createGameLinkTag("f1", "tart", "a fruit tart")]);
        }, 1500);
      }
    }, 100);

    return html`
      <div style="width: 800px; height: 450px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Progressive Highlighting Demo</h3>
        <illthorn-feed-modernized-lit 
          data-story="progressive"
          .focused=${args.focused}
          style="height: 350px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0; font-size: 0.85rem;"><strong>Real-time highlighting:</strong> Watch as items appear and get highlighted in real-time, simulating how highlighting works during actual gameplay.</p>
        </div>
      </div>
    `;
  },
};

export const ComprehensiveHighlightingTest: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="comprehensive"]') as FeedElement;
      if (feed?.appendGameTags) {
        // Show all categories together for comprehensive testing
        feed.appendGameTags(createWeaponHighlightingScenario());

        setTimeout(() => {
          feed.appendGameTags(createArmorClothingScenario());
        }, 200);

        setTimeout(() => {
          feed.appendGameTags(createHerbReagentScenario());
        }, 400);

        setTimeout(() => {
          feed.appendGameTags(createMagicJewelryScenario());
        }, 600);

        setTimeout(() => {
          feed.appendGameTags(createFoodContainerScenario());
        }, 800);

        setTimeout(() => {
          feed.appendGameTags(createNonHighlightedScenario());
        }, 1000);
      }
    }, 100);

    return html`
      <div style="width: 900px; height: 700px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Comprehensive Highlighting Test</h3>
        <illthorn-feed-modernized-lit 
          data-story="comprehensive"
          .focused=${args.focused}
          style="height: 550px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0 0 0.5rem 0;"><strong>Complete Highlighting Verification:</strong></p>
          <ul style="margin: 0; padding-left: 1.5rem; font-size: 0.85rem;">
            <li>All item categories should have distinct colors</li>
            <li>Hover states should work consistently</li>
            <li>Non-highlighted items should appear normal</li>
            <li>Performance should remain smooth with many items</li>
          </ul>
        </div>
      </div>
    `;
  },
};
