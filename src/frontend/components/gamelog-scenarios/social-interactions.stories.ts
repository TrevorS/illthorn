// ABOUTME: Storybook stories for social interactions and NPC scenarios from the icemule gamelog
// ABOUTME: Tests highlighting and rendering of player interactions, NPC behavior, and social content

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../session/feed/feed-modernized.lit";
import type { GameTag } from "../../parser/tag";
import { makeTag } from "../../parser/tag";

// Import the item highlighter for NPC-related highlighting
import { ItemHighlighter } from "../game-elements/item-highlighting";

// Social interactions mock that includes NPCs and social elements
const socialMockHighlighter = {
  _categoryMappings: {
    // Musical instruments from Parwyn interactions
    ayr: "instrument", // Parwyn's lacquered ayr
    lute: "instrument",
    harp: "instrument",
    drum: "instrument",

    // Items that appear in social contexts
    satchel: "clothing", // Parwyn's lacquered hip-satchel

    // Room objects mentioned in social scenes
    statue: null, // mule statue - environmental
    plinth: null, // stone plinth - environmental
    bench: null, // stone bench - environmental
    bonfire: null, // roaring bonfire - environmental
    board: null, // message board - environmental
    barrel: null, // silver-bound barrel - environmental
    wastebin: "box", // woven bark wastebin

    // NPCs and creatures that might appear
    spider: "passive npc", // iridescent green peacock spider
    disk: null, // rusty iron disk - should not highlight as NPC

    // Note: Player names like Parwyn, Rollandio should NOT categorize
    // They appear as normal links without highlighting
  } as Record<string, string | null>,

  async categorizeGameElement(attributes: { noun?: string; exist?: string; name?: string }) {
    const { noun, exist, name } = attributes;
    console.log("[SOCIAL MOCK] categorizeGameElement called with:", { noun, exist, name });

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

  async initialize() {},
  async isCategoryEnabled(_category: string) {
    return true;
  },
  get isReady() {
    return true;
  },
};

// Apply the mock
ItemHighlighter.categorizeGameElement = socialMockHighlighter.categorizeGameElement.bind(socialMockHighlighter);
ItemHighlighter.getItemCategory = socialMockHighlighter.getItemCategory.bind(socialMockHighlighter);
ItemHighlighter.initialize = socialMockHighlighter.initialize.bind(socialMockHighlighter);
ItemHighlighter.isCategoryEnabled = socialMockHighlighter.isCategoryEnabled.bind(socialMockHighlighter);
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

// Social interaction scenarios from the icemule log
const createRoomWithNPCsScenario = () => [
  createPresetTag("roomName", "Icemule Trace, Town Center"),
  createTextTag("\n"),
  createPresetTag(
    "roomDesc",
    "A tranquil square dusted with snow sprawls beneath a sturdy mule statue standing placidly atop a tall plinth of silver-veined black stone. The brilliance of the stars refracts through the statue, casting prismatic glints over the townsfolk nearby. Some denizens, mostly halflings but with a scattering of other folk mixed in, chatter by a roaring bonfire, lazing on a smooth dark stone bench or stargazing on colorful cloaks spread out on the ground. Others mill around a burled pine message board standing close to a colorful silver-bound barrel.",
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
  createTextTag(" who is sitting, "),
  createGameLinkTag("-10001001", "Aescall", "Great Lord Aescall"),
  createTextTag(", "),
  createGameLinkTag("-10001002", "Sunzun", "Sunzun"),
  createTextTag(", "),
  createGameLinkTag("-10001003", "Scribs", "High Lord Scribs"),
  createTextTag("\n"),
  createTextTag("Obvious paths: north, northeast, east, south, west"),
];

const _createParwynMusicalPerformanceScenario = () => [
  createTextTag("Without a change in dynamics "),
  createGameLinkTag("-10240033", "Parwyn", "Parwyn"),
  createTextTag(" picks up the pace of the song, weaving a soft but playful theme reminiscent of the sound of a far-away horse running across the countryside."),
  createTextTag("\n"),
  createTextTag("Parwyn smiles."),
  createTextTag("\n"),
  createTextTag("Parwyn strums one final soft chord then allows her "),
  createGameLinkTag("134750440", "ayr", "ayr"),
  createTextTag(" to fall silent."),
  createTextTag("\n"),
  createTextTag("Parwyn surveys the area."),
  createTextTag("\n"),
  createTextTag("With firm strokes, Parwyn clears away the stray detritus clinging to her "),
  createGameLinkTag("satchel001", "satchel", "lacquered hip-satchel"),
  createTextTag(", finishing with one last, careful swipe along the driftwood clasp."),
  createTextTag("\n"),
  createTextTag("Parwyn wraps her fingers around the neck of her "),
  createGameLinkTag("134750440", "ayr", "ayr"),
  createTextTag(" and strikes an ecstatic chord."),
];

const _createPlayerMovementScenario = () => [
  createGameLinkTag("-10470747", "Rollandio", "Rollandio"),
  createTextTag(" just arrived."),
  createTextTag("\n"),
  createGameLinkTag("-10240033", "Parwyn", "Parwyn"),
  createTextTag(" smiles."),
  createTextTag("\n"),
  createGameLinkTag("-10470747", "Rollandio", "Rollandio"),
  createTextTag(" just went west."),
  createTextTag("\n"),
  createTextTag("Starlight spills over rooftops and highlights the silhouettes of frosted chimneys, bathing the surroundings in a silvered glow."),
  createTextTag("\n"),
  createGameLinkTag("-10470747", "Rollandio", "Rollandio"),
  createTextTag(" just arrived."),
];

const createEnvironmentalDescriptionScenario = () => [
  createTextTag("A tranquil square dusted with snow sprawls beneath a sturdy "),
  createGameLinkTag("-480436", "statue", "mule statue"),
  createTextTag(" standing placidly atop a tall "),
  createGameLinkTag("plinth001", "plinth", "plinth of silver-veined black stone"),
  createTextTag(". The brilliance of the stars refracts through the statue, casting prismatic glints over the townsfolk nearby."),
  createTextTag("\n"),
  createTextTag("Some denizens, mostly halflings but with a scattering of other folk mixed in, chatter by a roaring "),
  createGameLinkTag("bonfire001", "bonfire", "bonfire"),
  createTextTag(", lazing on a smooth dark stone "),
  createGameLinkTag("-464992", "bench", "bench"),
  createTextTag(" or stargazing on colorful cloaks spread out on the ground."),
  createTextTag("\n"),
  createTextTag("Others mill around a burled pine "),
  createGameLinkTag("board001", "board", "message board"),
  createTextTag(" standing close to a colorful silver-bound "),
  createGameLinkTag("barrel001", "barrel", "barrel"),
  createTextTag("."),
];

const _createSocialActionScenario = () => [
  createPresetTag("speech", 'Player says, "Hello everyone!"'),
  createTextTag("\n"),
  createPresetTag("whisper", 'Player whispers, "Nice weather today."'),
  createTextTag("\n"),
  createPresetTag("thoughts", 'You think to yourself, "This is a lively town square."'),
  createTextTag("\n"),
  createTextTag("Someone waves to you."),
  createTextTag("\n"),
  createPresetTag("speech", 'Great Lord Aescall says, "Welcome to Icemule Trace!"'),
  createTextTag("\n"),
  createTextTag("Parwyn ponders."),
];

const meta: Meta = {
  title: "Session/Feed/Social Interactions",
  component: "illthorn-feed-modernized-lit",
  parameters: {
    docs: {
      description: {
        component:
          "Social interaction scenarios from the icemule gamelog. Tests NPC highlighting, player interactions, musical performances, and environmental descriptions with proper categorization of social elements.",
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

export const TownCenterWithNPCs: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="town-center"]') as FeedElement;
      if (feed?.appendGameTags) {
        feed.appendGameTags(createRoomWithNPCsScenario());
      }
    }, 100);

    return html`
      <div style="width: 900px; height: 550px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Icemule Town Center - NPCs and Environment</h3>
        <illthorn-feed-modernized-lit 
          data-story="town-center"
          .focused=${args.focused}
          style="height: 400px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0 0 0.5rem 0;"><strong>NPC & Environment Test:</strong></p>
          <ul style="margin: 0; padding-left: 1.5rem; font-size: 0.85rem;">
            <li><strong>Player NPCs:</strong> Parwyn, Great Lord Aescall, Sunzun, High Lord Scribs (should NOT be highlighted)</li>
            <li><strong>Creatures:</strong> peacock spider (passive NPC highlighting)</li>
            <li><strong>Environment:</strong> statue, bench, board, barrel (no highlighting)</li>
            <li><strong>Containers:</strong> wastebin (container highlighting)</li>
          </ul>
        </div>
      </div>
    `;
  },
};

export const ParwynMusicalPerformance: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="parwyn-music"]') as FeedElement;
      if (feed?.appendGameTags) {
        // Show the musical performance sequence progressively
        feed.appendGameTags([
          createTextTag("Without a change in dynamics "),
          createGameLinkTag("-10240033", "Parwyn", "Parwyn"),
          createTextTag(" picks up the pace of the song, weaving a soft but playful theme reminiscent of the sound of a far-away horse running across the countryside."),
        ]);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("Parwyn smiles.")]);
        }, 400);

        setTimeout(() => {
          feed.appendGameTags([
            createTextTag("Parwyn strums one final soft chord then allows her "),
            createGameLinkTag("134750440", "ayr", "ayr"),
            createTextTag(" to fall silent."),
          ]);
        }, 800);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("Parwyn surveys the area.")]);
        }, 1200);

        setTimeout(() => {
          feed.appendGameTags([
            createTextTag("With firm strokes, Parwyn clears away the stray detritus clinging to her "),
            createGameLinkTag("satchel001", "satchel", "lacquered hip-satchel"),
            createTextTag(", finishing with one last, careful swipe along the driftwood clasp."),
          ]);
        }, 1600);

        setTimeout(() => {
          feed.appendGameTags([
            createTextTag("Parwyn wraps her fingers around the neck of her "),
            createGameLinkTag("134750440", "ayr", "ayr"),
            createTextTag(" and strikes an ecstatic chord."),
          ]);
        }, 2000);
      }
    }, 100);

    return html`
      <div style="width: 900px; height: 500px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Parwyn's Musical Performance</h3>
        <illthorn-feed-modernized-lit 
          data-story="parwyn-music"
          .focused=${args.focused}
          style="height: 350px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0 0 0.5rem 0;"><strong>Musical Interaction Test:</strong></p>
          <ul style="margin: 0; padding-left: 1.5rem; font-size: 0.85rem;">
            <li><strong>Player NPC:</strong> Parwyn (no highlighting, normal link)</li>
            <li><strong>Instrument:</strong> ayr (instrument highlighting)</li>
            <li><strong>Clothing:</strong> lacquered hip-satchel (clothing highlighting)</li>
            <li><strong>Progressive flow:</strong> Messages arrive in sequence like real gameplay</li>
          </ul>
        </div>
      </div>
    `;
  },
};

export const PlayerMovementAndArrivals: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="player-movement"]') as FeedElement;
      if (feed?.appendGameTags) {
        // Simulate the player movement sequence from the log
        feed.appendGameTags([createGameLinkTag("-10470747", "Rollandio", "Rollandio"), createTextTag(" just arrived.")]);

        setTimeout(() => {
          feed.appendGameTags([createGameLinkTag("-10240033", "Parwyn", "Parwyn"), createTextTag(" smiles.")]);
        }, 500);

        setTimeout(() => {
          feed.appendGameTags([createGameLinkTag("-10470747", "Rollandio", "Rollandio"), createTextTag(" just went west.")]);
        }, 1000);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("Starlight spills over rooftops and highlights the silhouettes of frosted chimneys, bathing the surroundings in a silvered glow.")]);
        }, 1500);

        setTimeout(() => {
          feed.appendGameTags([createGameLinkTag("-10470747", "Rollandio", "Rollandio"), createTextTag(" just arrived.")]);
        }, 2000);
      }
    }, 100);

    return html`
      <div style="width: 800px; height: 450px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Player Movement and Social Reactions</h3>
        <illthorn-feed-modernized-lit 
          data-story="player-movement"
          .focused=${args.focused}
          style="height: 300px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0 0 0.5rem 0;"><strong>Movement & Social Flow:</strong></p>
          <ul style="margin: 0; padding-left: 1.5rem; font-size: 0.85rem;">
            <li>Player arrivals and departures</li>
            <li>Social reactions (Parwyn smiles)</li>
            <li>Environmental atmospheric text</li>
            <li>Realistic timing of events</li>
          </ul>
        </div>
      </div>
    `;
  },
};

export const EnvironmentalDescriptions: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="environmental"]') as FeedElement;
      if (feed?.appendGameTags) {
        feed.appendGameTags(createEnvironmentalDescriptionScenario());
      }
    }, 100);

    return html`
      <div style="width: 900px; height: 450px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Environmental Object Descriptions</h3>
        <illthorn-feed-modernized-lit 
          data-story="environmental"
          .focused=${args.focused}
          style="height: 300px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0 0 0.5rem 0;"><strong>Environmental Objects:</strong></p>
          <ul style="margin: 0; padding-left: 1.5rem; font-size: 0.85rem;">
            <li><strong>Statue, plinth, bench, board, barrel:</strong> Should not be highlighted (environmental)</li>
            <li><strong>Bonfire:</strong> Environmental object, no highlighting</li>
            <li>All should be clickable but with normal text styling</li>
          </ul>
        </div>
      </div>
    `;
  },
};

export const SocialActionTypes: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="social-actions"]') as FeedElement;
      if (feed?.appendGameTags) {
        // Show different types of social communication progressively
        feed.appendGameTags([createPresetTag("speech", 'Player says, "Hello everyone!"')]);

        setTimeout(() => {
          feed.appendGameTags([createPresetTag("whisper", 'Player whispers, "Nice weather today."')]);
        }, 300);

        setTimeout(() => {
          feed.appendGameTags([createPresetTag("thoughts", 'You think to yourself, "This is a lively town square."')]);
        }, 600);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("Someone waves to you.")]);
        }, 900);

        setTimeout(() => {
          feed.appendGameTags([createPresetTag("speech", 'Great Lord Aescall says, "Welcome to Icemule Trace!"')]);
        }, 1200);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("Parwyn ponders.")]);
        }, 1500);
      }
    }, 100);

    return html`
      <div style="width: 800px; height: 450px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Social Communication Types</h3>
        <illthorn-feed-modernized-lit 
          data-story="social-actions"
          .focused=${args.focused}
          style="height: 300px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0 0 0.5rem 0;"><strong>Communication Streams:</strong></p>
          <ul style="margin: 0; padding-left: 1.5rem; font-size: 0.85rem;">
            <li><strong>Speech:</strong> Public communication with speech styling</li>
            <li><strong>Whisper:</strong> Private communication with whisper styling</li>
            <li><strong>Thoughts:</strong> Internal thoughts with thoughts styling</li>
            <li>NPC actions and emotes</li>
          </ul>
        </div>
      </div>
    `;
  },
};

export const CompleteIcemuleScene: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="complete-scene"]') as FeedElement;
      if (feed?.appendGameTags) {
        // Show the complete town center scene as it would unfold
        feed.appendGameTags(createRoomWithNPCsScenario());

        setTimeout(() => {
          feed.appendGameTags([
            createTextTag("Without a change in dynamics "),
            createGameLinkTag("-10240033", "Parwyn", "Parwyn"),
            createTextTag(" picks up the pace of the song, weaving a soft but playful theme reminiscent of the sound of a far-away horse running across the countryside."),
          ]);
        }, 800);

        setTimeout(() => {
          feed.appendGameTags([createGameLinkTag("-10470747", "Rollandio", "Rollandio"), createTextTag(" just arrived.")]);
        }, 1200);

        setTimeout(() => {
          feed.appendGameTags([createGameLinkTag("-10240033", "Parwyn", "Parwyn"), createTextTag(" smiles.")]);
        }, 1600);

        setTimeout(() => {
          feed.appendGameTags([
            createTextTag("Parwyn strums one final soft chord then allows her "),
            createGameLinkTag("134750440", "ayr", "ayr"),
            createTextTag(" to fall silent."),
          ]);
        }, 2000);

        setTimeout(() => {
          feed.appendGameTags([createGameLinkTag("-10470747", "Rollandio", "Rollandio"), createTextTag(" just went west.")]);
        }, 2400);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("Starlight spills over rooftops and highlights the silhouettes of frosted chimneys, bathing the surroundings in a silvered glow.")]);
        }, 2800);
      }
    }, 100);

    return html`
      <div style="width: 950px; height: 700px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Complete Icemule Town Center Scene</h3>
        <illthorn-feed-modernized-lit 
          data-story="complete-scene"
          .focused=${args.focused}
          style="height: 550px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0 0 0.5rem 0;"><strong>Complete Social Scene:</strong></p>
          <ul style="margin: 0; padding-left: 1.5rem; font-size: 0.85rem;">
            <li>Room description with environmental objects</li>
            <li>Multiple NPCs with proper highlighting behavior</li>
            <li>Musical performance with instrument highlighting</li>
            <li>Player movement and social interactions</li>
            <li>Atmospheric environmental descriptions</li>
            <li>Real-time progressive message flow</li>
          </ul>
        </div>
      </div>
    `;
  },
};
