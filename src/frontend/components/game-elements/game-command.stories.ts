import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

// Event action logging for stories
const action = (name: string) => (detail?: any) => {
  console.log(`[Story Event] ${name}:`, detail);
};
import "./game-command.lit";
import { makeTag } from "../../parser/tag";

// Mock game tag creation utility for commands
const createCommandTag = (cmd?: string, text = "") => {
  const tag = makeTag("d");
  tag.attrs = {};
  if (cmd) tag.attrs.cmd = cmd;
  tag.text = text;
  return tag;
};

const meta: Meta = {
  title: "Game Elements/GameCommand",
  component: "illthorn-game-command",
  parameters: {
    docs: {
      description: {
        component:
          "Clickable command elements from <d cmd='...'> tags with enhanced styling and execution feedback. Handles command execution with visual states, accessibility features, and automatic command type detection for specialized styling.",
      },
    },
  },
  argTypes: {
    tag: {
      control: false,
      description: "GameTag object containing parsed command data",
    },
    cmd: {
      control: "text",
      description: "Command string to execute when clicked",
    },
    highlighted: {
      control: "boolean",
      description: "Whether the command is currently highlighted",
    },
    highlightClass: {
      control: "text",
      description: "CSS class name for custom highlighting",
    },
    itemCategory: {
      control: "text",
      description: "Item category (usually empty for commands)",
    },
  },
};

export default meta;
type Story = StoryObj;

export const BasicCommand: Story = {
  args: {
    tag: createCommandTag("look", "look"),
    cmd: "look",
    highlighted: false,
    highlightClass: "",
    itemCategory: "",
  },
  render: (args) => html`
    <illthorn-game-command
      .tag=${args.tag}
      .cmd=${args.cmd}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-command=${action("game-element-command")}
      @game-element-execute=${action("game-element-execute")}
      @click=${() => action("clicked")("Command clicked")}
    >
      ${args.tag.text}
    </illthorn-game-command>
  `,
};

export const MovementCommand: Story = {
  args: {
    tag: createCommandTag("go north", "north"),
    cmd: "go north",
    highlighted: false,
    highlightClass: "",
    itemCategory: "",
  },
  render: (args) => html`
    <illthorn-game-command
      .tag=${args.tag}
      .cmd=${args.cmd}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-command=${action("game-element-command")}
      @game-element-execute=${action("game-element-execute")}
    >
      ${args.tag.text}
    </illthorn-game-command>
  `,
};

export const SocialCommand: Story = {
  args: {
    tag: createCommandTag("say hello", "say hello"),
    cmd: "say hello",
    highlighted: false,
    highlightClass: "",
    itemCategory: "",
  },
  render: (args) => html`
    <illthorn-game-command
      .tag=${args.tag}
      .cmd=${args.cmd}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-command=${action("game-element-command")}
      @game-element-execute=${action("game-element-execute")}
      cmd-type="social"
    >
      ${args.tag.text}
    </illthorn-game-command>
  `,
};

export const SystemCommand: Story = {
  args: {
    tag: createCommandTag("quit", "quit"),
    cmd: "quit",
    highlighted: false,
    highlightClass: "",
    itemCategory: "",
  },
  render: (args) => html`
    <illthorn-game-command
      .tag=${args.tag}
      .cmd=${args.cmd}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-command=${action("game-element-command")}
      @game-element-execute=${action("game-element-execute")}
      cmd-type="system"
    >
      ${args.tag.text}
    </illthorn-game-command>
  `,
};

export const LongCommand: Story = {
  args: {
    tag: createCommandTag("cast 906 at kobold", "cast 906 at kobold"),
    cmd: "cast 906 at kobold",
    highlighted: false,
    highlightClass: "",
    itemCategory: "",
  },
  render: (args) => html`
    <illthorn-game-command
      .tag=${args.tag}
      .cmd=${args.cmd}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-command=${action("game-element-command")}
      @game-element-execute=${action("game-element-execute")}
    >
      ${args.tag.text}
    </illthorn-game-command>
  `,
};

export const HighlightedCommand: Story = {
  args: {
    tag: createCommandTag("get sword", "get sword"),
    cmd: "get sword",
    highlighted: true,
    highlightClass: "",
    itemCategory: "",
  },
  render: (args) => html`
    <illthorn-game-command
      .tag=${args.tag}
      .cmd=${args.cmd}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-command=${action("game-element-command")}
      @game-element-execute=${action("game-element-execute")}
    >
      ${args.tag.text}
    </illthorn-game-command>
  `,
};

export const CustomHighlightCommand: Story = {
  args: {
    tag: createCommandTag("search", "search"),
    cmd: "search",
    highlighted: true,
    highlightClass: "user-important-command",
    itemCategory: "",
  },
  render: (args) => html`
    <style>
      .user-important-command {
        background: linear-gradient(45deg, #ff6b6b, #ffa726) !important;
        color: white !important;
        font-weight: bold !important;
        border: 2px solid #ff5722 !important;
        border-radius: 4px !important;
        padding: 3px 6px !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
      }
    </style>
    <illthorn-game-command
      .tag=${args.tag}
      .cmd=${args.cmd}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-command=${action("game-element-command")}
      @game-element-execute=${action("game-element-execute")}
    >
      ${args.tag.text}
    </illthorn-game-command>
  `,
};

export const ExecutingState: Story = {
  render: () => {
    // Simulate executing state
    const simulateExecution = (element: Element) => {
      const cmd = element as any;
      cmd._executing = true;
      cmd.requestUpdate();

      setTimeout(() => {
        cmd._executing = false;
        cmd.requestUpdate();
        action("execution-completed")("Command execution completed");
      }, 2000);
    };

    return html`
      <div>
        <p><strong>Click to simulate command execution:</strong></p>
        <illthorn-game-command
          .tag=${createCommandTag("look sword", "look sword")}
          cmd="look sword"
          @click=${(e: Event) => simulateExecution(e.target as Element)}
          @game-element-command=${action("game-element-command")}
        >
          look sword
        </illthorn-game-command>
        <p><em>Command will show executing state for 2 seconds</em></p>
      </div>
    `;
  },
};

export const InteractionDemo: Story = {
  render: () => html`
    <div style="padding: 16px;">
      <h4>Command Interaction Demo</h4>
      <p><strong>Click commands to execute them</strong></p>
      <p><strong>All commands support keyboard activation</strong></p>
      
      <div style="margin: 16px 0; line-height: 2;">
        You can 
        <illthorn-game-command
          .tag=${createCommandTag("go north", "go north")}
          cmd="go north"
          @game-element-command=${action("movement-command")}
        >go north</illthorn-game-command>,
        <illthorn-game-command
          .tag=${createCommandTag("look", "look")}
          cmd="look"
          @game-element-command=${action("look-command")}
        >look</illthorn-game-command> around,
        <illthorn-game-command
          .tag=${createCommandTag("get sword", "get sword")}
          cmd="get sword"
          @game-element-command=${action("get-command")}
        >get the sword</illthorn-game-command>, or
        <illthorn-game-command
          .tag=${createCommandTag("say hello", "say hello")}
          cmd="say hello"
          cmd-type="social"
          @game-element-command=${action("social-command")}
        >say hello</illthorn-game-command>.
      </div>
      
      <p><em>Check the Actions tab to see command events</em></p>
    </div>
  `,
};

export const AccessibilityDemo: Story = {
  render: () => html`
    <div style="padding: 16px;">
      <h4>Accessibility Features</h4>
      <p>All commands support:</p>
      <ul>
        <li>Tab navigation (try pressing Tab)</li>
        <li>Keyboard activation (Enter or Space)</li>
        <li>Screen reader friendly labels</li>
        <li>Focus indicators with rounded borders</li>
        <li>Hover states for visual feedback</li>
      </ul>
      
      <div style="margin: 16px 0; line-height: 2.5;">
        <illthorn-game-command
          .tag=${createCommandTag("inventory", "inventory")}
          cmd="inventory"
          @game-element-command=${action("inventory-command")}
        >inventory</illthorn-game-command>
        
        <illthorn-game-command
          .tag=${createCommandTag("who", "who")}
          cmd="who"
          @game-element-command=${action("who-command")}
        >who</illthorn-game-command>
        
        <illthorn-game-command
          .tag=${createCommandTag("time", "time")}
          cmd="time"
          @game-element-command=${action("time-command")}
        >time</illthorn-game-command>
      </div>
      
      <p><em>Try tabbing through and using Enter or Space to activate</em></p>
    </div>
  `,
};

export const CommandTypeShowcase: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; padding: 16px;">
      <div>
        <h4>Movement Commands</h4>
        <div style="line-height: 2;">
          <illthorn-game-command .tag=${createCommandTag("go north", "north")} cmd="go north" cmd-type="movement">north</illthorn-game-command><br>
          <illthorn-game-command .tag=${createCommandTag("go south", "south")} cmd="go south" cmd-type="movement">south</illthorn-game-command><br>
          <illthorn-game-command .tag=${createCommandTag("go up", "up")} cmd="go up" cmd-type="movement">up</illthorn-game-command><br>
          <illthorn-game-command .tag=${createCommandTag("go down", "down")} cmd="go down" cmd-type="movement">down</illthorn-game-command>
        </div>
      </div>
      
      <div>
        <h4>Action Commands</h4>
        <div style="line-height: 2;">
          <illthorn-game-command .tag=${createCommandTag("look", "look")} cmd="look">look</illthorn-game-command><br>
          <illthorn-game-command .tag=${createCommandTag("search", "search")} cmd="search">search</illthorn-game-command><br>
          <illthorn-game-command .tag=${createCommandTag("get all", "get all")} cmd="get all">get all</illthorn-game-command><br>
          <illthorn-game-command .tag=${createCommandTag("open door", "open door")} cmd="open door">open door</illthorn-game-command>
        </div>
      </div>
      
      <div>
        <h4>Social Commands</h4>
        <div style="line-height: 2;">
          <illthorn-game-command .tag=${createCommandTag("say hello", "say hello")} cmd="say hello" cmd-type="social">say hello</illthorn-game-command><br>
          <illthorn-game-command .tag=${createCommandTag("wave", "wave")} cmd="wave" cmd-type="social">wave</illthorn-game-command><br>
          <illthorn-game-command .tag=${createCommandTag("bow", "bow")} cmd="bow" cmd-type="social">bow</illthorn-game-command><br>
          <illthorn-game-command .tag=${createCommandTag("smile", "smile")} cmd="smile" cmd-type="social">smile</illthorn-game-command>
        </div>
      </div>
      
      <div>
        <h4>System Commands</h4>
        <div style="line-height: 2;">
          <illthorn-game-command .tag=${createCommandTag("save", "save")} cmd="save" cmd-type="system">save</illthorn-game-command><br>
          <illthorn-game-command .tag=${createCommandTag("quit", "quit")} cmd="quit" cmd-type="system">quit</illthorn-game-command><br>
          <illthorn-game-command .tag=${createCommandTag("who", "who")} cmd="who" cmd-type="system">who</illthorn-game-command><br>
          <illthorn-game-command .tag=${createCommandTag("time", "time")} cmd="time" cmd-type="system">time</illthorn-game-command>
        </div>
      </div>
    </div>
  `,
};

export const InlineTextDemo: Story = {
  render: () => html`
    <div style="padding: 16px; line-height: 1.8;">
      <h4>Commands in Game Text Context</h4>
      <p>
        You enter the room and see a treasure chest. You could 
        <illthorn-game-command .tag=${createCommandTag("open chest", "open chest")} cmd="open chest">open chest</illthorn-game-command> or 
        <illthorn-game-command .tag=${createCommandTag("search chest", "search chest")} cmd="search chest">search chest</illthorn-game-command> for traps first.
      </p>
      
      <p>
        A goblin blocks your path! You might want to 
        <illthorn-game-command .tag=${createCommandTag("attack goblin", "attack goblin")} cmd="attack goblin">attack goblin</illthorn-game-command>, 
        <illthorn-game-command .tag=${createCommandTag("cast 903 at goblin", "cast 903 at goblin")} cmd="cast 903 at goblin">cast 903 at goblin</illthorn-game-command>, or try to 
        <illthorn-game-command .tag=${createCommandTag("go around", "go around")} cmd="go around">go around</illthorn-game-command> it.
      </p>
      
      <p>
        The merchant says, "Welcome! You can 
        <illthorn-game-command .tag=${createCommandTag("list", "list")} cmd="list">list</illthorn-game-command> my wares or 
        <illthorn-game-command .tag=${createCommandTag("order 1", "order 1")} cmd="order 1">order 1</illthorn-game-command> if you see something you like."
      </p>
    </div>
  `,
};

export const HoverStatesDemo: Story = {
  render: () => html`
    <div style="padding: 16px;">
      <h4>Hover and Focus States</h4>
      <p><strong>Hover over commands to see visual feedback:</strong></p>
      
      <div style="margin: 16px 0; line-height: 2.5;">
        <illthorn-game-command .tag=${createCommandTag("examine torch", "examine torch")} cmd="examine torch">examine torch</illthorn-game-command>
        <illthorn-game-command .tag=${createCommandTag("get torch", "get torch")} cmd="get torch">get torch</illthorn-game-command>
        <illthorn-game-command .tag=${createCommandTag("light torch", "light torch")} cmd="light torch">light torch</illthorn-game-command>
      </div>
      
      <p>Commands show:</p>
      <ul>
        <li>Background color change on hover</li>
        <li>Subtle scale animation when clicked</li>
        <li>Focus outline for keyboard navigation</li>
        <li>Text shadow effects for enhanced visibility</li>
      </ul>
    </div>
  `,
};
