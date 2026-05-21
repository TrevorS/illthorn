import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./feed-modernized.lit";
import { type GameTag, makeTag } from "../../../parser/tag";

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
  appendGameTags: (tags: Array<GameTag>) => void;
  shadowRoot: ShadowRoot | null;
  getRenderStats: () => {
    totalTagGroups: number;
    totalTags: number;
    componentTags: number;
    metadataTags: number;
  };
  session?: MockSession;
  _handleCommandEcho?: (event: CommandEchoEvent) => void;
};

// Import the real ItemHighlighter - use the real XML-powered system in Storybook!
import { ItemHighlighter } from "../../game-elements/item-highlighting";

// Initialize the real highlighting system for Storybook stories
ItemHighlighter.initialize();

// Import game element components to ensure they're registered
import "../../game-elements/game-link.lit";
import "../../game-elements/game-command.lit";

// Utility functions for creating GameTags in stories

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

const createGameCommandTag = (cmd: string, text: string): GameTag => {
  const tag = makeTag("d");
  tag.attrs = { cmd };
  tag.text = text;
  return tag;
};

const _createPresetTag = (id: string, text: string): GameTag => {
  const tag = makeTag("preset");
  tag.attrs = { id };
  tag.text = text;
  return tag;
};

const meta: Meta = {
  title: "Session/Feed",
  component: "illthorn-feed-modernized-lit",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
# Feed Component

The modernized feed component displays game text with highlighting, commands, and interactive elements.
This version demonstrates realistic inventory scenarios with proper item categorization and highlighting.

## Features

- Real-time text rendering
- Item highlighting based on XML categorization
- Interactive game links and commands
- Theme-aware styling
- Command echo functionality
        `,
      },
    },
  },
  argTypes: {
    focused: {
      control: "boolean",
      description: "Whether the feed is focused for input",
    },
  },
};

export default meta;
type Story = StoryObj;

export const ComprehensiveInventoryWithMixedCategories: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="inventory"]') as FeedElement;
      if (feed) {
        // Simulate a realistic inventory dump with mixed categories
        feed.appendGameTags([createTextTag("You are currently carrying:")]);

        // Add inventory items gradually to show realistic game flow
        setTimeout(() => {
          feed?.appendGameTags([createTextTag("• "), createGameLinkTag("125592513", "gladius", "matte black golvern gladius"), createTextTag(" (weapon)")]);
        }, 200);

        setTimeout(() => {
          feed?.appendGameTags([createTextTag("• "), createGameLinkTag("127527554", "stem", "some aloeas stem"), createTextTag(" (herb)")]);
        }, 400);

        setTimeout(() => {
          feed?.appendGameTags([createTextTag("• "), createGameLinkTag("ruby456", "ruby", "a brilliant ruby"), createTextTag(" (gem)")]);
        }, 600);

        setTimeout(() => {
          feed?.appendGameTags([createTextTag("• "), createGameLinkTag("shield789", "shield", "a reinforced steel shield"), createTextTag(" (armor)")]);
        }, 800);

        setTimeout(() => {
          feed?.appendGameTags([createTextTag("• "), createGameLinkTag("127527553", "moss", "some ephlox moss"), createTextTag(" (herb)")]);
        }, 1000);

        setTimeout(() => {
          feed?.appendGameTags([createTextTag("• "), createGameLinkTag("potion777", "potion", "rose-marrow potion"), createTextTag(" (herb)")]);
        }, 1200);

        setTimeout(() => {
          feed?.appendGameTags([createTextTag("• "), createGameLinkTag("ring101", "ring", "gold wedding ring"), createTextTag(" (jewelry)")]);
        }, 1400);

        setTimeout(() => {
          feed?.appendGameTags([createTextTag("• "), createGameLinkTag("scroll202", "scroll", "scroll of mass blur"), createTextTag(" (magic)")]);
        }, 1600);

        setTimeout(() => {
          feed?.appendGameTags([createTextTag("• "), createGameLinkTag("backpack303", "backpack", "forest green backpack"), createTextTag(" (worn)")]);
        }, 1800);

        setTimeout(() => {
          feed?.appendGameTags([createTextTag("• "), createGameLinkTag("tart404", "tart", "wild berry tart"), createTextTag(" (food)")]);
        }, 2000);

        setTimeout(() => {
          feed?.appendGameTags([createTextTag("• "), createGameLinkTag("skin505", "skin", "supple troll skin"), createTextTag(" (valuable)")]);
        }, 2200);

        setTimeout(() => {
          feed?.appendGameTags([createTextTag("• "), createGameLinkTag("box606", "box", "ornate silver strongbox"), createTextTag(" (container)")]);
        }, 2400);

        setTimeout(() => {
          feed?.appendGameTags([createTextTag("\nTotal: 12 items")]);
        }, 2600);
      }
    }, 100);

    return html`
      <div style="width: 700px; height: 500px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Comprehensive Inventory with Mixed Categories</h3>
        <illthorn-feed-modernized-lit 
          data-story="inventory"
          .focused=${args.focused}
          style="height: 350px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0 0 0.5rem 0;"><strong>Category Highlighting Demonstrated:</strong></p>
          <ul style="margin: 0; padding-left: 1.5rem; font-size: 0.85rem;">
            <li>Weapons (red) - gladius</li>
            <li>Herbs/Reagents (purple) - stem, moss, potion</li>
            <li>Gems (yellow) - ruby</li>
            <li>Armor (blue) - shield</li>
            <li>Jewelry (pink) - ring</li>
            <li>Magic Items (magenta) - scroll</li>
            <li>Clothing (green) - backpack</li>
            <li>Food (orange) - tart</li>
            <li>Valuables (red) - skin</li>
            <li>Containers (gray) - box</li>
          </ul>
        </div>
      </div>
    `;
  },
};

export const BasicGameText: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="basic"]') as FeedElement;
      if (feed) {
        feed.appendGameTags([createTextTag("You look around and see:")]);
        setTimeout(() => {
          feed?.appendGameTags([createTextTag("A "), createGameLinkTag("sword123", "sword", "steel longsword"), createTextTag(" is here.")]);
        }, 500);
        setTimeout(() => {
          feed?.appendGameTags([createTextTag("There is also "), createGameLinkTag("potion456", "potion", "healing potion"), createTextTag(".")]);
        }, 1000);
      }
    }, 100);

    return html`
      <div style="width: 600px; height: 300px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Basic Game Text</h3>
        <illthorn-feed-modernized-lit 
          data-story="basic"
          .focused=${args.focused}
          style="height: 200px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
      </div>
    `;
  },
};

export const WithCommands: Story = {
  args: {
    focused: true,
  },
  render: (args) => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="commands"]') as FeedElement;
      if (feed) {
        feed.appendGameTags([createTextTag("You can "), createGameCommandTag("get sword", "get"), createTextTag(" the sword.")]);
        setTimeout(() => {
          feed?.appendGameTags([createTextTag("Or you can "), createGameCommandTag("look potion", "examine"), createTextTag(" the potion.")]);
        }, 500);
      }
    }, 100);

    return html`
      <div style="width: 600px; height: 300px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Interactive Commands</h3>
        <illthorn-feed-modernized-lit 
          data-story="commands"
          .focused=${args.focused}
          style="height: 200px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
      </div>
    `;
  },
};
