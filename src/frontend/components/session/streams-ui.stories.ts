import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./streams-ui.lit";
import { type GameTag, makeTag } from "../../parser/tag";
import type { StreamEntry } from "./streams-container.lit";

const meta: Meta = {
  title: "Session/Streams/UI",
  component: "illthorn-streams-ui",
  parameters: {
    docs: {
      description: {
        component: "Pure UI component for displaying stream content with auto-scrolling behavior. Accepts stream entries as properties and handles presentation only.",
      },
    },
  },
  argTypes: {
    entries: {
      control: "object",
      description: "Array of stream entries to display",
    },
  },
};

export default meta;
type Story = StoryObj;

// Utility functions for creating GameTags in stories

const createTextTag = (text: string): GameTag => {
  const tag = makeTag(":text");
  tag.text = text;
  return tag;
};

const createLinkTag = (exist: string, noun: string, text?: string): GameTag => {
  const tag = makeTag("a");
  tag.attrs = { exist, noun };
  tag.text = text || "";
  return tag;
};

const createStreamTag = (id: string, children: GameTag[]): GameTag => {
  const tag = makeTag("stream");
  tag.attrs = { id };
  tag.children = children;
  return tag;
};

// Sample stream entries for stories
const thoughtsEntries: StreamEntry[] = [
  {
    id: "thoughts-1",
    streamTag: createStreamTag("thoughts", [
      createTextTag("[Help] "),
      createTextTag("Adventurer"),
      createLinkTag("-12345678", "Adventurer"),
      createTextTag(': "Looking for treasure in the old ruins."\n'),
    ]),
    timestamp: new Date(Date.now() - 300000),
    streamType: "thoughts",
  },
  {
    id: "thoughts-2",
    streamTag: createStreamTag("thoughts", [
      createTextTag("[General] "),
      createTextTag("Explorer"),
      createLinkTag("-87654321", "Explorer"),
      createTextTag(': "This place gives me the creeps."\n'),
    ]),
    timestamp: new Date(Date.now() - 240000),
    streamType: "thoughts",
  },
  {
    id: "thoughts-3",
    streamTag: createStreamTag("thoughts", [
      createTextTag("[OOC] "),
      createTextTag("Ranger"),
      createLinkTag("-11223344", "Ranger"),
      createTextTag(': "Did anyone else hear that noise?"\n'),
    ]),
    timestamp: new Date(Date.now() - 180000),
    streamType: "thoughts",
  },
];

const mixedEntries: StreamEntry[] = [
  {
    id: "speech-1",
    streamTag: createStreamTag("speech", [createTextTag('Someone says, "Hello everyone!"')]),
    timestamp: new Date(Date.now() - 500000),
    streamType: "speech",
  },
  {
    id: "thoughts-1",
    streamTag: createStreamTag("thoughts", [
      createTextTag("[General] "),
      createTextTag("Newcomer"),
      createLinkTag("-99887766", "Newcomer"),
      createTextTag(': "I should probably introduce myself."\n'),
    ]),
    timestamp: new Date(Date.now() - 450000),
    streamType: "thoughts",
  },
  {
    id: "logon-1",
    streamTag: createStreamTag("logon", [createTextTag("Adventurer has connected.")]),
    timestamp: new Date(Date.now() - 400000),
    streamType: "logon",
  },
  {
    id: "speech-2",
    streamTag: createStreamTag("speech", [createTextTag('You say, "Nice to meet everyone."')]),
    timestamp: new Date(Date.now() - 350000),
    streamType: "speech",
  },
  {
    id: "death-1",
    streamTag: createStreamTag("death", [createTextTag("A kobold warrior has been slain!")]),
    timestamp: new Date(Date.now() - 300000),
    streamType: "death",
  },
  {
    id: "thoughts-2",
    streamTag: createStreamTag("thoughts", [
      createTextTag("[Help] "),
      createTextTag("Warrior"),
      createLinkTag("-55443322", "Warrior"),
      createTextTag(': "That was easier than expected."\n'),
    ]),
    timestamp: new Date(Date.now() - 250000),
    streamType: "thoughts",
  },
  {
    id: "logoff-1",
    streamTag: createStreamTag("logoff", [createTextTag("Adventurer has disconnected.")]),
    timestamp: new Date(Date.now() - 200000),
    streamType: "logoff",
  },
];

export const Empty: Story = {
  args: {
    entries: [],
  },
  render: (args) => html`
    <div style="width: 400px; height: 300px; background: #1e293b; padding: 1rem; border-radius: 0.5rem; display: flex; flex-direction: column;">
      <p style="color: white; margin: 0 0 0.5rem 0; font-size: 0.9rem;">
        Empty streams panel
      </p>
      <div style="flex: 1; border: 1px solid #374151; border-radius: 0.25rem; overflow: hidden;">
        <illthorn-streams-ui .entries=${args.entries}></illthorn-streams-ui>
      </div>
    </div>
  `,
};

export const ThoughtsOnly: Story = {
  args: {
    entries: thoughtsEntries,
  },
  render: (args) => html`
    <div style="width: 400px; height: 300px; background: #1e293b; padding: 1rem; border-radius: 0.5rem; display: flex; flex-direction: column;">
      <p style="color: white; margin: 0 0 0.5rem 0; font-size: 0.9rem;">
        Thoughts stream only
      </p>
      <div style="flex: 1; border: 1px solid #374151; border-radius: 0.25rem; overflow: hidden;">
        <illthorn-streams-ui .entries=${args.entries}></illthorn-streams-ui>
      </div>
    </div>
  `,
};

export const MixedStreams: Story = {
  args: {
    entries: mixedEntries,
  },
  render: (args) => html`
    <div style="width: 450px; height: 400px; background: #1e293b; padding: 1rem; border-radius: 0.5rem; display: flex; flex-direction: column;">
      <p style="color: white; margin: 0 0 0.5rem 0; font-size: 0.9rem;">
        Mixed stream types (speech, thoughts, logon/logoff, death)
      </p>
      <div style="flex: 1; border: 1px solid #374151; border-radius: 0.25rem; overflow: hidden;">
        <illthorn-streams-ui .entries=${args.entries}></illthorn-streams-ui>
      </div>
    </div>
  `,
};

export const LongContent: Story = {
  args: {
    entries: [
      {
        id: "long-1",
        streamTag: createStreamTag("thoughts", [
          createTextTag("[General] "),
          createTextTag("Philosopher"),
          createLinkTag("-12345678", "Philosopher"),
          createTextTag(
            ': "This is a really long thought that spans multiple lines and demonstrates how the streams component handles text wrapping and longer content. It should wrap nicely and maintain readability while fitting within the available space."\n',
          ),
        ]),
        timestamp: new Date(Date.now() - 300000),
        streamType: "thoughts",
      },
      {
        id: "long-2",
        streamTag: createStreamTag("speech", [
          createTextTag(
            'You say, "I completely agree with that long statement, and I wanted to add my own lengthy response that also demonstrates text wrapping behavior. The streams should handle this gracefully without breaking the layout or causing horizontal scrolling issues."',
          ),
        ]),
        timestamp: new Date(Date.now() - 240000),
        streamType: "speech",
      },
      {
        id: "short-1",
        streamTag: createStreamTag("thoughts", [createTextTag("[OOC] "), createTextTag("Thinker"), createLinkTag("-98765432", "Thinker"), createTextTag(': "Short thought."\n')]),
        timestamp: new Date(Date.now() - 180000),
        streamType: "thoughts",
      },
    ],
  },
  render: (args) => html`
    <div style="width: 400px; height: 350px; background: #1e293b; padding: 1rem; border-radius: 0.5rem; display: flex; flex-direction: column;">
      <p style="color: white; margin: 0 0 0.5rem 0; font-size: 0.9rem;">
        Long content text wrapping
      </p>
      <div style="flex: 1; border: 1px solid #374151; border-radius: 0.25rem; overflow: hidden;">
        <illthorn-streams-ui .entries=${args.entries}></illthorn-streams-ui>
      </div>
    </div>
  `,
};

export const ScrollingBehavior: Story = {
  args: {
    entries: Array.from({ length: 20 }, (_, i) => ({
      id: `entry-${i}`,
      streamTag: createStreamTag(
        i % 3 === 0 ? "thoughts" : i % 3 === 1 ? "speech" : "logon",
        i % 3 === 0
          ? [createTextTag("[General] "), createTextTag(`Player${i}`), createLinkTag(`-${i}${i}${i}`, `Player${i}`), createTextTag(': "This is a thought message."\n')]
          : i % 3 === 1
            ? [createTextTag(`Someone says, "This is speech entry #${i + 1}."`)]
            : [createTextTag(`Game event occurred - entry #${i + 1}.`)],
      ),
      timestamp: new Date(Date.now() - (20 - i) * 60000),
      streamType: i % 3 === 0 ? "thoughts" : i % 3 === 1 ? "speech" : "logon",
    })),
  },
  render: (args) => html`
    <div style="width: 400px; height: 300px; background: #1e293b; padding: 1rem; border-radius: 0.5rem; display: flex; flex-direction: column;">
      <p style="color: white; margin: 0 0 0.5rem 0; font-size: 0.9rem;">
        Multiple entries demonstrating scrolling behavior
      </p>
      <div style="flex: 1; border: 1px solid #374151; border-radius: 0.25rem; overflow: hidden;">
        <illthorn-streams-ui .entries=${args.entries}></illthorn-streams-ui>
      </div>
    </div>
  `,
};

export const InteractiveDemo: Story = {
  args: {
    entries: thoughtsEntries.slice(),
  },
  render: (args) => {
    let entryCounter = 10;

    const addRandomEntry = () => {
      const types = ["thoughts", "speech", "logon", "death"];
      const messages = {
        thoughts: [
          'Someone thinks, "I wonder what\'s around the next corner."',
          'You think, "This adventure is getting interesting."',
          'Someone thinks, "Did I remember to bring enough supplies?"',
        ],
        speech: ['Someone says, "Watch out for traps!"', 'You say, "Thanks for the warning."', 'Someone says, "Anyone have a light source?"'],
        logon: ["A new adventurer has joined the realm.", "PlayerName has connected.", "A friend has logged in."],
        death: ["A goblin scout has been defeated!", "The ancient guardian falls!", "A wild creature has been slain!"],
      };

      const streamType = types[Math.floor(Math.random() * types.length)] as keyof typeof messages;
      const messageOptions = messages[streamType];
      const content = messageOptions[Math.floor(Math.random() * messageOptions.length)];

      const newEntry: StreamEntry = {
        id: `random-${entryCounter++}`,
        streamTag: createStreamTag(
          streamType,
          streamType === "thoughts"
            ? [
                createTextTag("[General] "),
                createTextTag(`RandomPlayer${entryCounter}`),
                createLinkTag(`-${entryCounter}`, `RandomPlayer${entryCounter}`),
                createTextTag(`: "${content}"\n`),
              ]
            : [createTextTag(content)],
        ),
        timestamp: new Date(),
        streamType,
      };

      args.entries = [...args.entries, newEntry];

      // Update the component
      const component = document.querySelector("illthorn-streams-ui");
      if (component) {
        component.entries = args.entries;
      }
    };

    const clearEntries = () => {
      args.entries = [];
      const component = document.querySelector("illthorn-streams-ui");
      if (component) {
        component.entries = args.entries;
      }
    };

    return html`
      <div style="width: 450px; height: 400px; background: #1e293b; padding: 1rem; border-radius: 0.5rem; display: flex; flex-direction: column;">
        <div style="color: white; margin-bottom: 0.5rem;">
          <p style="margin: 0 0 0.5rem 0; font-size: 0.9rem;">
            Interactive streams demo
          </p>
          <button 
            @click=${addRandomEntry}
            style="margin: 0 0.5rem 0.5rem 0; padding: 0.25rem 0.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.25rem; cursor: pointer;"
          >
            Add Random Entry
          </button>
          <button 
            @click=${clearEntries}
            style="margin: 0 0.5rem 0.5rem 0; padding: 0.25rem 0.5rem; background: #ef4444; color: white; border: none; border-radius: 0.25rem; cursor: pointer;"
          >
            Clear All
          </button>
        </div>
        <div style="flex: 1; border: 1px solid #374151; border-radius: 0.25rem; overflow: hidden;">
          <illthorn-streams-ui .entries=${args.entries}></illthorn-streams-ui>
        </div>
      </div>
    `;
  },
};
