// ABOUTME: Storybook stories for item highlighting categorization from the icemule gamelog
// ABOUTME: Tests the highlighting system's categorization logic with real and edge case scenarios

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../session/feed/feed-modernized.lit";
import type { GameTag } from "../../parser/tag";
import { makeTag } from "../../parser/tag";

// Event action logging for stories (currently unused but kept for future use)
const _action = (name: string) => (detail?: unknown) => {
  console.log(`[Story Event] ${name}:`, detail);
};

// Import and use the real item highlighter with XML data
import { ItemHighlighter } from "../game-elements/item-highlighting";

// Initialize the real ItemHighlighter with XML data
ItemHighlighter.initialize();

// Import game element components
import "../game-elements/game-link.lit";
import "../game-elements/game-command.lit";

// Utility functions for creating GameTags
const createTextTag = (text: string): GameTag => {
  const tag = makeTag(":text");
  tag.text = text;
  return tag;
};

const createGameLinkTag = (exist: string, noun: string, text: string): GameTag => {
  const tag = makeTag("a");
  tag.attrs = { exist, noun };
  tag.text = text;
  return tag;
};

const createPresetTag = (id: string, text: string): GameTag => {
  const tag = makeTag("preset");
  tag.attrs = { id };
  tag.text = text;
  return tag;
};

const meta: Meta = {
  title: "Game Log/Item Highlighting Scenarios",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
# Item Highlighting Test Scenarios

These stories test the real XML-based item highlighting system with various scenarios derived from actual game logs.
Each scenario demonstrates how different item categories are highlighted in realistic gameplay situations.

## Highlighting Categories

- **Weapons**: Red highlighting for combat equipment
- **Herbs/Reagents**: Purple highlighting for alchemy materials
- **Gems**: Yellow highlighting for valuable stones
- **Jewelry**: Pink highlighting for magical accessories
- **Magic Items**: Magenta highlighting for scrolls, wands, etc.
- **Food**: Orange highlighting for consumables
- **Containers**: Gray highlighting for bags, boxes, etc.
- **Clothing**: Green highlighting for wearable items

## Real Data Testing

These stories use the actual XML categorization data from the game, providing realistic highlighting behavior.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

type FeedElement = HTMLElement & {
  appendGameTags?: (tags: Array<GameTag>) => void;
};

export const BackpackContentsScenario: Story = {
  args: {},
  render: () => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="backpack"]') as FeedElement;
      if (feed) {
        feed.appendGameTags([createPresetTag("roomName", "Inside your backpack")]);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("Your backpack contains:")]);
        }, 200);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("127527554", "stem", "some aloeas stem"), createTextTag(" (healing herb)")]);
        }, 400);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("127527553", "moss", "some ephlox moss"), createTextTag(" (bleeding stopper)")]);
        }, 600);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("127527543", "tart", "Dabbings Family special tart"), createTextTag(" (prepared reagent)")]);
        }, 800);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("potion123", "potion", "rose-marrow potion"), createTextTag(" (healing elixir)")]);
        }, 1000);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("ring456", "ring", "gold wedding ring"), createTextTag(" (jewelry)")]);
        }, 1200);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("scroll789", "scroll", "scroll of mass blur"), createTextTag(" (magic item)")]);
        }, 1400);
      }
    }, 100);

    return html`
      <div style="width: 700px; height: 400px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Realistic Backpack Contents</h3>
        <illthorn-feed-modernized-lit 
          data-story="backpack"
          style="height: 300px; overflow-y: auto; border: 1px solid var(--color-border); border-radius: 4px;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text-secondary); font-size: 0.9rem;">
          <strong>Testing:</strong> Real XML categorization with actual game item names and IDs
        </div>
      </div>
    `;
  },
};

export const ShopInventoryScenario: Story = {
  args: {},
  render: () => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="shop"]') as FeedElement;
      if (feed) {
        feed.appendGameTags([createPresetTag("roomName", "Weapon Shop")]);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("The shopkeeper shows you:")]);
        }, 200);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("sword001", "sword", "a polished steel longsword"), createTextTag(" - 500 silver")]);
        }, 400);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("gladius002", "gladius", "an ancient mithril gladius"), createTextTag(" - 2000 silver")]);
        }, 600);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("shield003", "shield", "a reinforced tower shield"), createTextTag(" - 800 silver")]);
        }, 800);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("ruby004", "ruby", "a brilliant fire ruby"), createTextTag(" - 5000 silver")]);
        }, 1000);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("amulet005", "amulet", "an amulet of protection"), createTextTag(" - 3000 silver")]);
        }, 1200);
      }
    }, 100);

    return html`
      <div style="width: 700px; height: 400px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Shop Inventory Display</h3>
        <illthorn-feed-modernized-lit 
          data-story="shop"
          style="height: 300px; overflow-y: auto; border: 1px solid var(--color-border); border-radius: 4px;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text-secondary); font-size: 0.9rem;">
          <strong>Testing:</strong> Mixed item categories in merchant context with proper pricing display
        </div>
      </div>
    `;
  },
};

export const AlchemyLabScenario: Story = {
  args: {},
  render: () => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="alchemy"]') as FeedElement;
      if (feed) {
        feed.appendGameTags([createPresetTag("roomName", "Alchemy Laboratory")]);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("You see various reagents and supplies:")]);
        }, 200);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("wolifrew001", "lichen", "some wolifrew lichen"), createTextTag(" (nerve regeneration)")]);
        }, 400);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("sovyn002", "clove", "some sovyn clove"), createTextTag(" (limb wound healing)")]);
        }, 600);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("brostheras003", "bark", "some brostheras bark"), createTextTag(" (nerve damage)")]);
        }, 800);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("tincture004", "tincture", "gleaming moonstone tincture"), createTextTag(" (prepared reagent)")]);
        }, 1000);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("• "), createGameLinkTag("elixir005", "elixir", "snowflake elixir"), createTextTag(" (cold resistance)")]);
        }, 1200);
      }
    }, 100);

    return html`
      <div style="width: 700px; height: 400px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Alchemy Laboratory</h3>
        <illthorn-feed-modernized-lit 
          data-story="alchemy"
          style="height: 300px; overflow-y: auto; border: 1px solid var(--color-border); border-radius: 4px;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text-secondary); font-size: 0.9rem;">
          <strong>Testing:</strong> Specialized reagent categorization with medical/alchemical terminology
        </div>
      </div>
    `;
  },
};
