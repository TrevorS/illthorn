// ABOUTME: Game log scenarios focusing on realistic gameplay highlighting situations
// ABOUTME: Demonstrates inventory management, loot distribution, foraging, and other common game situations

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./session/feed/feed-modernized.lit";
import type { GameTag } from "../parser/tag";
import { makeTag } from "../parser/tag";

// Use the real ItemHighlighter with XML data
import { ItemHighlighter } from "./game-elements/item-highlighting";

// Initialize the real ItemHighlighter instead of using mocks
ItemHighlighter.initialize();

// Import game element components
import "./game-elements/game-link.lit";
import "./game-elements/game-command.lit";
import "./game-elements/game-monster.lit";

// Type definitions for story context
type FeedElement = HTMLElement & {
  appendGameTags: (tags: Array<GameTag>) => void;
  shadowRoot: ShadowRoot | null;
};

// Game tag creation utilities
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

const meta: Meta = {
  title: "Game Log/Realistic Scenarios",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
# Game Log Realistic Scenarios

These stories demonstrate highlighting and categorization in realistic game situations where proper 
color coding is crucial for gameplay. Each scenario represents common situations players encounter
where accurate item identification helps with inventory management and decision making.

## Scenario Categories

- **Treasure/Loot Distribution**: Post-combat loot identification
- **Hunting Expeditions**: Mixed loot from creature encounters  
- **Foraging Expeditions**: Herb and reagent collection scenarios
- **Merchant Trading**: Shop inventories and trading scenarios
- **Player Interactions**: Item exchanges and group activities
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const TreasureHuntLoot: Story = {
  args: {},
  render: () => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="treasure-hunt"]') as FeedElement;
      if (feed) {
        // Simulate post-adventure treasure distribution
        feed.appendGameTags([createPresetTag("roomName", "Ancient Treasure Vault")]);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("The dust settles as you survey your hard-won treasure:")]);
        }, 300);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("\n=== Weapons & Armor ===")]);
        }, 600);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("treasure001", "gladius", "an ancient mithril gladius"), createTextTag(" (exceptional quality)")]);
        }, 900);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("treasure002", "shield", "a reinforced vultite shield"), createTextTag(" (masterwork)")]);
        }, 1200);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("\n=== Gems & Valuables ===")]);
        }, 1500);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("treasure003", "ruby", "a flawless crimson ruby"), createTextTag(" (priceless)")]);
        }, 1800);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("treasure004", "diamond", "a brilliant white diamond"), createTextTag(" (museum quality)")]);
        }, 2100);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("treasure005", "amulet", "amulet of ancient power"), createTextTag(" (magical)")]);
        }, 2400);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("\n=== Magic Items ===")]);
        }, 2700);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("treasure006", "scroll", "scroll of mass healing"), createTextTag(" (spell level 9)")]);
        }, 3000);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("treasure007", "wand", "wand of lightning bolt"), createTextTag(" (25 charges)")]);
        }, 3300);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("\n=== Containers & Misc ===")]);
        }, 3600);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("treasure008", "coffer", "ornate silver coffer"), createTextTag(" (contains coins)")]);
        }, 3900);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("treasure009", "skin", "pristine dragon hide"), createTextTag(" (crafting material)")]);
        }, 4200);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("\nTotal treasure value: Approximately 50,000 silver!")]);
        }, 4500);
      }
    }, 100);

    return html`
      <div style="width: 800px; height: 600px; padding: 1rem; background: var(--color-background-primary);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text-primary);">Post-Adventure Treasure Distribution</h3>
        <illthorn-feed-modernized-lit 
          data-story="treasure-hunt"
          style="height: 450px; overflow-y: auto; background: var(--color-surface); border-radius: 8px; border: 1px solid var(--color-border);"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text-secondary); font-size: 0.9rem;">
          <strong>Scenario:</strong> Party discovers ancient treasure vault. Proper highlighting helps quickly 
          identify valuable items vs. junk, magical vs. mundane equipment, and crafting materials.
        </div>
      </div>
    `;
  },
};

export const ForagingExpedition: Story = {
  args: {},
  render: () => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="foraging-expedition"]') as FeedElement;
      if (feed) {
        // Simulate comprehensive foraging expedition
        feed.appendGameTags([createPresetTag("roomName", "Herb-Rich Mountain Glade")]);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("You begin systematically foraging the area for valuable reagents.")]);
        }, 300);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("\n=== Common Healing Herbs ===")]);
        }, 600);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("You found "), createGameLinkTag("forage001", "stem", "some aloeas stem"), createTextTag("! (general healing)")]);
        }, 900);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("You found "), createGameLinkTag("forage002", "moss", "some ephlox moss"), createTextTag("! (stops bleeding)")]);
        }, 1200);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("You found "), createGameLinkTag("forage003", "leaf", "some acantha leaf"), createTextTag("! (heals health)")]);
        }, 1500);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("\n=== Specialized Reagents ===")]);
        }, 1800);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("You found "), createGameLinkTag("forage004", "root", "some wolifrew root"), createTextTag("! (nerve regeneration)")]);
        }, 2100);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("You found "), createGameLinkTag("forage005", "clove", "some sovyn clove"), createTextTag("! (limb wound healing)")]);
        }, 2400);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("You found "), createGameLinkTag("forage006", "bark", "some brostheras bark"), createTextTag("! (nerve damage)")]);
        }, 2700);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("\n=== Prepared Reagents (Rare Finds) ===")]);
        }, 3000);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("Hidden among the herbs, you discover "), createGameLinkTag("forage007", "potion", "rose-marrow potion"), createTextTag("!")]);
        }, 3300);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("And "), createGameLinkTag("forage008", "tincture", "gleaming moonstone tincture"), createTextTag(" left by another herbalist!")]);
        }, 3600);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("\n=== Non-Reagent Items ===")]);
        }, 3900);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("You also notice "), createGameLinkTag("forage009", "ring", "tarnished silver ring"), createTextTag(" partially buried.")]);
        }, 4200);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("And "), createGameLinkTag("forage010", "dagger", "rusty iron dagger"), createTextTag(" stuck in a tree trunk.")]);
        }, 4500);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("\nForaging expedition complete! Reagents: 8 | Other items: 2")]);
        }, 4800);
      }
    }, 100);

    return html`
      <div style="width: 800px; height: 650px; padding: 1rem; background: var(--color-background-primary);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text-primary);">Comprehensive Foraging Expedition</h3>
        <illthorn-feed-modernized-lit 
          data-story="foraging-expedition"
          style="height: 450px; overflow-y: auto; background: var(--color-surface); border-radius: 8px; border: 1px solid var(--color-border);"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text-secondary); font-size: 0.9rem; line-height: 1.4;">
          <strong>Scenario:</strong> Herbalist expedition to mountain glade. Purple highlighting for all reagents 
          (raw herbs, prepared potions) helps distinguish valuable alchemy materials from random loot. 
          Consistent color coding crucial for inventory management during long foraging trips.
        </div>
      </div>
    `;
  },
};

export const HuntingLootDistribution: Story = {
  args: {},
  render: () => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="hunting-loot"]') as FeedElement;
      if (feed) {
        // Simulate post-hunt loot distribution
        feed.appendGameTags([createTextTag("=== HUNTING EXPEDITION RESULTS ===")]);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("After a successful day of hunting, you tally your gains:")]);
        }, 300);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("\n--- Creature Skins & Materials ---")]);
        }, 600);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("hunt001", "skin", "supple troll skin"), createTextTag(" x3 (valuable for crafting)")]);
        }, 900);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("hunt002", "hide", "thick bear hide"), createTextTag(" x2 (armor crafting)")]);
        }, 1200);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("hunt003", "fang", "sharp wolf fang"), createTextTag(" x5 (weapon decoration)")]);
        }, 1500);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("\n--- Weapons & Equipment ---")]);
        }, 1800);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("hunt004", "bow", "composite hunting bow"), createTextTag(" (excellent condition)")]);
        }, 2100);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("hunt005", "arrow", "fletched hunting arrow"), createTextTag(" x20 (steel tips)")]);
        }, 2400);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("hunt006", "knife", "sharp skinning knife"), createTextTag(" (well-maintained)")]);
        }, 2700);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("\n--- Food & Consumables ---")]);
        }, 3000);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("hunt007", "meat", "fresh venison haunch"), createTextTag(" x4 (preserved)")]);
        }, 3300);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("hunt008", "tart", "wild berry tart"), createTextTag(" x2 (foraged ingredients)")]);
        }, 3600);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("\n--- Incidental Finds ---")]);
        }, 3900);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("hunt009", "gem", "rough emerald"), createTextTag(" (found in stream)")]);
        }, 4200);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("hunt010", "pouch", "leather coin pouch"), createTextTag(" (contains 50 silver)")]);
        }, 4500);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("\nSuccessful hunt! Total value: ~800 silver equivalent")]);
        }, 4800);
      }
    }, 100);

    return html`
      <div style="width: 800px; height: 650px; padding: 1rem; background: var(--color-background-primary);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text-primary);">Hunting Expedition Loot Distribution</h3>
        <illthorn-feed-modernized-lit 
          data-story="hunting-loot"
          style="height: 450px; overflow-y: auto; background: var(--color-surface); border-radius: 8px; border: 1px solid var(--color-border);"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text-secondary); font-size: 0.9rem; line-height: 1.4;">
          <strong>Scenario:</strong> End-of-day hunting results showing mixed loot categories. 
          Highlighting helps hunters quickly separate valuable crafting materials (skins, hides) 
          from weapons, food, and incidental treasure finds. Essential for efficient inventory sorting.
        </div>
      </div>
    `;
  },
};

export const MerchantTradeNegotiation: Story = {
  args: {},
  render: () => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="merchant-trade"]') as FeedElement;
      if (feed) {
        // Simulate merchant trading scenario
        feed.appendGameTags([createPresetTag("roomName", "Traveling Merchant's Wagon")]);

        setTimeout(() => {
          feed.appendGameTags([createPresetTag("roomDesc", "A well-stocked wagon filled with goods from distant lands. The merchant eyes you hopefully.")]);
        }, 300);

        setTimeout(() => {
          feed.appendGameTags([createTextTag('The merchant says, "Greetings, traveler! I have fine goods for trade:"')]);
        }, 600);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("\n=== High-Value Items ===")]);
        }, 900);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("trade001", "gladius", "masterwork steel gladius"), createTextTag(" - 2000 silver or trade")]);
        }, 1200);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("trade002", "scroll", "scroll of mass blessing"), createTextTag(" - 1500 silver or magic item trade")]);
        }, 1500);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("\n=== Reagents & Supplies ===")]);
        }, 1800);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("trade003", "potion", "rose-marrow potion"), createTextTag(" x5 - 200 silver each")]);
        }, 2100);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("trade004", "stem", "bundle of aloeas stem"), createTextTag(" x10 - 50 silver per bundle")]);
        }, 2400);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("trade005", "tincture", "moonstone tincture"), createTextTag(" x3 - 300 silver each")]);
        }, 2700);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("\n=== What I'm Looking For ===")]);
        }, 3000);

        setTimeout(() => {
          feed.appendGameTags([createTextTag('The merchant adds, "I\'ll pay premium prices for:"')]);
        }, 3300);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• Any "), createGameLinkTag("wanted001", "ruby", "high-quality gems"), createTextTag(" (especially rubies and diamonds)")]);
        }, 3600);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• Rare "), createGameLinkTag("wanted002", "skin", "creature skins"), createTextTag(" (dragon, troll, rare beasts)")]);
        }, 3900);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• Powerful "), createGameLinkTag("wanted003", "wand", "magical items"), createTextTag(" (wands, enchanted jewelry)")]);
        }, 4200);

        setTimeout(() => {
          feed.appendGameTags([
            createTextTag("\nYou can "),
            createGameCommandTag("trade", "initiate trade"),
            createTextTag(" or "),
            createGameCommandTag("appraise all", "appraise your items"),
            createTextTag(" first."),
          ]);
        }, 4500);
      }
    }, 100);

    return html`
      <div style="width: 800px; height: 650px; padding: 1rem; background: var(--color-background-primary);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text-primary);">Merchant Trading Negotiation</h3>
        <illthorn-feed-modernized-lit 
          data-story="merchant-trade"
          style="height: 450px; overflow-y: auto; background: var(--color-surface); border-radius: 8px; border: 1px solid var(--color-border);"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text-secondary); font-size: 0.9rem; line-height: 1.4;">
          <strong>Scenario:</strong> Player negotiating with traveling merchant. Color coding helps quickly 
          identify high-value items (gems, weapons, magic items) vs. common supplies (reagents, food).
          Essential for making informed trading decisions and spotting valuable opportunities.
        </div>
      </div>
    `;
  },
};

export const GroupLootDistribution: Story = {
  args: {},
  render: () => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="group-loot"]') as FeedElement;
      if (feed) {
        // Simulate group adventure loot distribution
        feed.appendGameTags([createTextTag("=== PARTY LOOT DISTRIBUTION ===")]);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("After defeating the ancient lich, the party divides the spoils:")]);
        }, 300);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("\n--- Rolton claims ---")]);
        }, 600);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("party001", "gladius", "enchanted mithril gladius"), createTextTag(" (fighter's weapon)")]);
        }, 900);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("party002", "shield", "tower shield of warding"), createTextTag(" (defensive gear)")]);
        }, 1200);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("\n--- Sylvana takes ---")]);
        }, 1500);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("party003", "wand", "wand of mass destruction"), createTextTag(" (mage's tool)")]);
        }, 1800);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("party004", "scroll", "scroll of teleportation"), createTextTag(" x3 (utility magic)")]);
        }, 2100);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("\n--- Bramble grabs ---")]);
        }, 2400);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("party005", "potion", "rose-marrow potion"), createTextTag(" x10 (healing supplies)")]);
        }, 2700);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("party006", "stem", "rare ambrominas stem"), createTextTag(" x5 (alchemist reagents)")]);
        }, 3000);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("party007", "tincture", "pothinir tincture"), createTextTag(" x3 (specialty reagents)")]);
        }, 3300);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("\n--- Shared treasure ---")]);
        }, 3600);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("party008", "ruby", "perfect fire ruby"), createTextTag(" (to be sold, split 4 ways)")]);
        }, 3900);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("party009", "diamond", "brilliant white diamond"), createTextTag(" (to be sold, split 4 ways)")]);
        }, 4200);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("party010", "coffer", "lich's treasure coffer"), createTextTag(" (contains 5000 silver to split)")]);
        }, 4500);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("\nEveryone satisfied with the distribution. Adventure complete!")]);
        }, 4800);
      }
    }, 100);

    return html`
      <div style="width: 800px; height: 650px; padding: 1rem; background: var(--color-background-primary);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text-primary);">Group Adventure Loot Distribution</h3>
        <illthorn-feed-modernized-lit 
          data-story="group-loot"
          style="height: 450px; overflow-y: auto; background: var(--color-surface); border-radius: 8px; border: 1px solid var(--color-border);"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text-secondary); font-size: 0.9rem; line-height: 1.4;">
          <strong>Scenario:</strong> Party dividing loot after major encounter. Highlighting helps players 
          quickly identify items suitable for their class (weapons for fighters, reagents for alchemists, 
          magic items for mages) and shared treasure for group benefit. Color coding prevents disputes 
          and speeds up distribution.
        </div>
      </div>
    `;
  },
};
