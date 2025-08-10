import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

// Event action logging for stories
const action = (name: string) => (detail?: any) => {
  console.log(`[Story Event] ${name}:`, detail);
};
import "./game-monster.lit";
import { makeTag } from "../../parser/tag";

// Mock game tag creation utility for monsters
const createMonsterTag = (exist?: string, noun?: string, text = "") => {
  const tag = makeTag("b");
  tag.attrs = {};
  if (exist) tag.attrs.exist = exist;
  if (noun) tag.attrs.noun = noun;
  tag.text = text;
  return tag;
};

const meta: Meta = {
  title: "Game Elements/GameMonster",
  component: "illthorn-game-monster",
  parameters: {
    docs: {
      description: {
        component:
          "Monster display component for <b> wrapped entities with enhanced styling and threat assessment. Provides distinctive styling and interaction for hostile game entities with threat levels, health status tracking, and targeting capabilities.",
      },
    },
  },
  argTypes: {
    tag: {
      control: false,
      description: "GameTag object containing parsed monster data",
    },
    exist: {
      control: "text",
      description: "Monster ID for targeting and commands",
    },
    noun: {
      control: "text",
      description: "Monster noun for identification",
    },
    level: {
      control: "text",
      description: "Monster level indicator",
    },
    threat: {
      control: "select",
      options: ["low", "medium", "high", "extreme"],
      description: "Threat assessment level",
    },
    highlighted: {
      control: "boolean",
      description: "Whether the monster is currently highlighted",
    },
    highlightClass: {
      control: "text",
      description: "CSS class name for custom highlighting",
    },
  },
};

export default meta;
type Story = StoryObj;

export const BasicMonster: Story = {
  args: {
    tag: createMonsterTag("orc123", "orc", "an orc warrior"),
    exist: "orc123",
    noun: "orc",
    level: "35",
    threat: "medium",
    highlighted: false,
    highlightClass: "",
  },
  render: (args) => html`
    <illthorn-game-monster
      .tag=${args.tag}
      .exist=${args.exist}
      .noun=${args.noun}
      .level=${args.level}
      .threat=${args.threat}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      @game-element-target=${action("game-element-target")}
      @game-element-attack=${action("game-element-attack")}
      @game-element-context-menu=${action("game-element-context-menu")}
    >
      ${args.tag.text}
    </illthorn-game-monster>
  `,
};

export const LowThreatMonster: Story = {
  args: {
    tag: createMonsterTag("rat456", "rat", "a sewer rat"),
    exist: "rat456",
    noun: "rat",
    level: "1",
    threat: "low",
    highlighted: false,
    highlightClass: "",
  },
  render: (args) => html`
    <illthorn-game-monster
      .tag=${args.tag}
      .exist=${args.exist}
      .noun=${args.noun}
      .level=${args.level}
      .threat=${args.threat}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      @game-element-target=${action("game-element-target")}
      @game-element-attack=${action("game-element-attack")}
    >
      ${args.tag.text}
    </illthorn-game-monster>
  `,
};

export const MediumThreatMonster: Story = {
  args: {
    tag: createMonsterTag("goblin789", "goblin", "a goblin warrior"),
    exist: "goblin789",
    noun: "goblin",
    level: "15",
    threat: "medium",
    highlighted: false,
    highlightClass: "",
  },
  render: (args) => html`
    <illthorn-game-monster
      .tag=${args.tag}
      .exist=${args.exist}
      .noun=${args.noun}
      .level=${args.level}
      .threat=${args.threat}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      @game-element-target=${action("game-element-target")}
      @game-element-attack=${action("game-element-attack")}
    >
      ${args.tag.text}
    </illthorn-game-monster>
  `,
};

export const HighThreatMonster: Story = {
  args: {
    tag: createMonsterTag("troll101", "troll", "a massive war troll"),
    exist: "troll101",
    noun: "troll",
    level: "50",
    threat: "high",
    highlighted: false,
    highlightClass: "",
  },
  render: (args) => html`
    <illthorn-game-monster
      .tag=${args.tag}
      .exist=${args.exist}
      .noun=${args.noun}
      .level=${args.level}
      .threat=${args.threat}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      @game-element-target=${action("game-element-target")}
      @game-element-attack=${action("game-element-attack")}
    >
      ${args.tag.text}
    </illthorn-game-monster>
  `,
};

export const ExtremeThreatMonster: Story = {
  args: {
    tag: createMonsterTag("dragon202", "dragon", "an ancient red dragon"),
    exist: "dragon202",
    noun: "dragon",
    level: "95",
    threat: "extreme",
    highlighted: false,
    highlightClass: "",
  },
  render: (args) => html`
    <illthorn-game-monster
      .tag=${args.tag}
      .exist=${args.exist}
      .noun=${args.noun}
      .level=${args.level}
      .threat=${args.threat}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      @game-element-target=${action("game-element-target")}
      @game-element-attack=${action("game-element-attack")}
    >
      ${args.tag.text}
    </illthorn-game-monster>
  `,
};

export const TargetedMonster: Story = {
  render: () => {
    const simulateTargeting = (element: Element) => {
      const monster = element as any;
      monster._isTargeted = !monster._isTargeted;
      monster.requestUpdate();
      action("targeting-toggled")(monster._isTargeted ? "Targeted" : "Untargeted");
    };

    return html`
      <div>
        <p><strong>Click to toggle targeting:</strong></p>
        <illthorn-game-monster
          .tag=${createMonsterTag("kobold303", "kobold", "a kobold hunter")}
          exist="kobold303"
          noun="kobold"
          level="25"
          threat="medium"
          @click=${(e: Event) => simulateTargeting(e.target as Element)}
          @game-element-target=${action("game-element-target")}
        >
          a kobold hunter
        </illthorn-game-monster>
        <p><em>Targeted monsters show enhanced styling and glow effects</em></p>
      </div>
    `;
  },
};

export const WoundedMonster: Story = {
  render: () => {
    const simulateHealthStates = () => {
      const states = ["healthy", "wounded", "badly-wounded", "near-death"];
      let currentIndex = 0;

      return (element: Element) => {
        const monster = element as any;
        currentIndex = (currentIndex + 1) % states.length;
        monster._healthStatus = states[currentIndex];
        monster.requestUpdate();
        action("health-changed")(states[currentIndex]);
      };
    };

    const healthCycler = simulateHealthStates();

    return html`
      <div>
        <p><strong>Click to cycle through health states:</strong></p>
        <illthorn-game-monster
          .tag=${createMonsterTag("ogre404", "ogre", "a wounded hill ogre")}
          exist="ogre404"
          noun="ogre"
          level="40"
          threat="high"
          @click=${(e: Event) => healthCycler(e.target as Element)}
          @game-element-target=${action("game-element-target")}
        >
          a wounded hill ogre
        </illthorn-game-monster>
        <p><em>Health states: healthy → wounded → badly-wounded → near-death</em></p>
      </div>
    `;
  },
};

export const DeadMonster: Story = {
  args: {
    tag: createMonsterTag("skeleton505", "skeleton", "the corpse of a skeleton"),
    exist: "skeleton505",
    noun: "skeleton",
    level: "20",
    threat: "low",
    highlighted: false,
    highlightClass: "",
  },
  render: (args) => html`
    <illthorn-game-monster
      .tag=${args.tag}
      .exist=${args.exist}
      .noun=${args.noun}
      .level=${args.level}
      .threat=${args.threat}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      dead
    >
      ${args.tag.text}
    </illthorn-game-monster>
  `,
};

export const HighlightedMonster: Story = {
  args: {
    tag: createMonsterTag("wraith606", "wraith", "a ghostly wraith"),
    exist: "wraith606",
    noun: "wraith",
    level: "45",
    threat: "high",
    highlighted: true,
    highlightClass: "",
  },
  render: (args) => html`
    <illthorn-game-monster
      .tag=${args.tag}
      .exist=${args.exist}
      .noun=${args.noun}
      .level=${args.level}
      .threat=${args.threat}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      @game-element-target=${action("game-element-target")}
    >
      ${args.tag.text}
    </illthorn-game-monster>
  `,
};

export const CustomHighlightMonster: Story = {
  args: {
    tag: createMonsterTag("demon707", "demon", "a shadow demon"),
    exist: "demon707",
    noun: "demon",
    level: "60",
    threat: "extreme",
    highlighted: true,
    highlightClass: "user-priority-target",
  },
  render: (args) => html`
    <style>
      .user-priority-target {
        background: radial-gradient(circle, #ff1744, #d50000) !important;
        color: white !important;
        font-weight: bold !important;
        border: 2px solid #ffff00 !important;
        border-radius: 4px !important;
        padding: 2px 4px !important;
        box-shadow: 0 0 10px #ff1744, inset 0 0 10px rgba(255, 255, 255, 0.2) !important;
        animation: priority-pulse 1.5s infinite !important;
      }
      
      @keyframes priority-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
    </style>
    <illthorn-game-monster
      .tag=${args.tag}
      .exist=${args.exist}
      .noun=${args.noun}
      .level=${args.level}
      .threat=${args.threat}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      @game-element-target=${action("game-element-target")}
    >
      ${args.tag.text}
    </illthorn-game-monster>
  `,
};

export const InteractionDemo: Story = {
  render: () => html`
    <div style="padding: 16px;">
      <h4>Monster Interaction Demo</h4>
      <p><strong>Left-click:</strong> Target monster</p>
      <p><strong>Right-click:</strong> Show context menu with combat options</p>
      <p><strong>Double-click:</strong> Quick attack</p>
      
      <div style="margin: 16px 0; line-height: 2.5;">
        <p>You see several creatures here:</p>
        <illthorn-game-monster
          .tag=${createMonsterTag("spider123", "spider", "a giant spider")}
          exist="spider123"
          noun="spider"
          level="12"
          threat="low"
          @game-element-target=${action("target-spider")}
          @game-element-context-menu=${action("spider-context-menu")}
        >a giant spider</illthorn-game-monster>,
        <illthorn-game-monster
          .tag=${createMonsterTag("bear456", "bear", "a grizzly bear")}
          exist="bear456"
          noun="bear"
          level="35"
          threat="medium"
          @game-element-target=${action("target-bear")}
          @game-element-context-menu=${action("bear-context-menu")}
        >a grizzly bear</illthorn-game-monster>, and
        <illthorn-game-monster
          .tag=${createMonsterTag("wizard789", "wizard", "a dark wizard")}
          exist="wizard789"
          noun="wizard"
          level="55"
          threat="high"
          @game-element-target=${action("target-wizard")}
          @game-element-context-menu=${action("wizard-context-menu")}
        >a dark wizard</illthorn-game-monster>.
      </div>
      
      <p><em>Check the Actions tab to see interaction events</em></p>
    </div>
  `,
};

export const ThreatLevelShowcase: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; padding: 16px;">
      <div>
        <h4>Low Threat (Green)</h4>
        <div style="line-height: 2;">
          <illthorn-game-monster .tag=${createMonsterTag("rat1", "rat")} exist="rat1" noun="rat" threat="low">a sewer rat</illthorn-game-monster><br>
          <illthorn-game-monster .tag=${createMonsterTag("bat2", "bat")} exist="bat2" noun="bat" threat="low">a cave bat</illthorn-game-monster><br>
          <illthorn-game-monster .tag=${createMonsterTag("rabbit3", "rabbit")} exist="rabbit3" noun="rabbit" threat="low">a wild rabbit</illthorn-game-monster>
        </div>
      </div>
      
      <div>
        <h4>Medium Threat (Orange)</h4>
        <div style="line-height: 2;">
          <illthorn-game-monster .tag=${createMonsterTag("orc1", "orc")} exist="orc1" noun="orc" threat="medium">an orc scout</illthorn-game-monster><br>
          <illthorn-game-monster .tag=${createMonsterTag("wolf2", "wolf")} exist="wolf2" noun="wolf" threat="medium">a grey wolf</illthorn-game-monster><br>
          <illthorn-game-monster .tag=${createMonsterTag("goblin3", "goblin")} exist="goblin3" noun="goblin" threat="medium">a goblin warrior</illthorn-game-monster>
        </div>
      </div>
      
      <div>
        <h4>High Threat (Red)</h4>
        <div style="line-height: 2;">
          <illthorn-game-monster .tag=${createMonsterTag("troll1", "troll")} exist="troll1" noun="troll" threat="high">a stone troll</illthorn-game-monster><br>
          <illthorn-game-monster .tag=${createMonsterTag("ogre2", "ogre")} exist="ogre2" noun="ogre" threat="high">a hill ogre</illthorn-game-monster><br>
          <illthorn-game-monster .tag=${createMonsterTag("giant3", "giant")} exist="giant3" noun="giant" threat="high">a fire giant</illthorn-game-monster>
        </div>
      </div>
      
      <div>
        <h4>Extreme Threat (Purple)</h4>
        <div style="line-height: 2;">
          <illthorn-game-monster .tag=${createMonsterTag("dragon1", "dragon")} exist="dragon1" noun="dragon" threat="extreme">an ancient dragon</illthorn-game-monster><br>
          <illthorn-game-monster .tag=${createMonsterTag("lich2", "lich")} exist="lich2" noun="lich" threat="extreme">a powerful lich</illthorn-game-monster><br>
          <illthorn-game-monster .tag=${createMonsterTag("demon3", "demon")} exist="demon3" noun="demon" threat="extreme">a greater demon</illthorn-game-monster>
        </div>
      </div>
    </div>
  `,
};

export const CombatScenario: Story = {
  render: () => html`
    <div style="padding: 16px; line-height: 1.8;">
      <h4>Combat Scenario</h4>
      <p>
        You enter the dungeon chamber and immediately spot danger. 
        <illthorn-game-monster .tag=${createMonsterTag("orc1", "orc")} exist="orc1" noun="orc" threat="medium" level="25">An orc captain</illthorn-game-monster> 
        stands guard near the treasure chest, while 
        <illthorn-game-monster .tag=${createMonsterTag("goblin1", "goblin")} exist="goblin1" noun="goblin" threat="low" level="15">a goblin scout</illthorn-game-monster> 
        and 
        <illthorn-game-monster .tag=${createMonsterTag("goblin2", "goblin")} exist="goblin2" noun="goblin" threat="low" level="12">another goblin scout</illthorn-game-monster> 
        patrol the perimeter.
      </p>
      
      <p>
        In the shadows, you notice something far more dangerous: 
        <illthorn-game-monster .tag=${createMonsterTag("wraith1", "wraith")} exist="wraith1" noun="wraith" threat="high" level="45">a ghostly wraith</illthorn-game-monster> 
        floating near the altar. This could be a challenging fight!
      </p>
      
      <p>
        <strong>Combat Status:</strong><br>
        Target: <illthorn-game-monster .tag=${createMonsterTag("target1", "orc")} exist="target1" noun="orc" threat="medium">orc captain</illthorn-game-monster> (currently targeted)<br>
        Health: <illthorn-game-monster .tag=${createMonsterTag("wounded1", "orc")} exist="wounded1" noun="orc" threat="medium">wounded orc captain</illthorn-game-monster> (badly wounded)<br>
        Defeated: <illthorn-game-monster .tag=${createMonsterTag("dead1", "goblin")} exist="dead1" noun="goblin" threat="low" dead>the corpse of a goblin scout</illthorn-game-monster>
      </p>
    </div>
  `,
};

export const AccessibilityDemo: Story = {
  render: () => html`
    <div style="padding: 16px;">
      <h4>Accessibility Features</h4>
      <p>All monsters support:</p>
      <ul>
        <li>Tab navigation (try pressing Tab)</li>
        <li>Keyboard activation (Enter or Space to target)</li>
        <li>Screen reader friendly labels with threat levels</li>
        <li>High contrast focus indicators</li>
        <li>Color-blind friendly threat indicators (using multiple visual cues)</li>
      </ul>
      
      <div style="margin: 16px 0; line-height: 2.5;">
        <illthorn-game-monster
          .tag=${createMonsterTag("spider404", "spider", "a cave spider")}
          exist="spider404"
          noun="spider"
          level="8"
          threat="low"
          @game-element-target=${action("target-spider")}
        >a cave spider</illthorn-game-monster>
        
        <illthorn-game-monster
          .tag=${createMonsterTag("warrior505", "warrior", "an orc warrior")}
          exist="warrior505"
          noun="warrior"
          level="30"
          threat="medium"
          @game-element-target=${action("target-warrior")}
        >an orc warrior</illthorn-game-monster>
        
        <illthorn-game-monster
          .tag=${createMonsterTag("mage606", "mage", "a dark mage")}
          exist="mage606"
          noun="mage"
          level="50"
          threat="high"
          @game-element-target=${action("target-mage")}
        >a dark mage</illthorn-game-monster>
      </div>
    </div>
  `,
};
