import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

// Event action logging for stories
const action = (name: string) => (detail?: unknown) => {
  console.log(`[Story Event] ${name}:`, detail);
};
import "./game-link.lit";
import { makeTag } from "../../parser/tag";

// Mock game tag creation utility for links
const createLinkTag = (exist?: string, noun?: string, coord?: string, text = "") => {
  const tag = makeTag("a");
  tag.attrs = {};
  if (exist) tag.attrs.exist = exist;
  if (noun) tag.attrs.noun = noun;
  if (coord) tag.attrs.coord = coord;
  tag.text = text;
  return tag;
};

const meta: Meta = {
  title: "Game Elements/GameLink",
  component: "illthorn-game-link",
  parameters: {
    docs: {
      description: {
        component:
          "Interactive game links with automatic item highlighting and context menus. Handles <a exist='...' noun='...'> elements from game XML with enhanced capabilities including item categorization, accessibility features, and command execution.",
      },
    },
  },
  argTypes: {
    tag: {
      control: false,
      description: "GameTag object containing parsed game link data",
    },
    exist: {
      control: "text",
      description: "Game object ID for lookups and commands",
    },
    noun: {
      control: "text",
      description: "Object noun for item categorization",
    },
    coord: {
      control: "text",
      description: "Command coordinate for executable links",
    },
    highlighted: {
      control: "boolean",
      description: "Whether the link is currently highlighted",
    },
    highlightClass: {
      control: "text",
      description: "CSS class name for custom highlighting",
    },
    itemCategory: {
      control: "select",
      options: [
        "",
        "weapon",
        "armor",
        "clothing",
        "gem",
        "jewelry",
        "reagent",
        "food",
        "valuable",
        "box",
        "junk",
        "herb",
        "manna bread",
        "scroll",
        "wand",
        "skin",
        "magic",
        "passive npc",
        "aggressive npc",
      ],
      description: "Automatic item category from XML data",
    },
  },
};

export default meta;
type Story = StoryObj;

export const BasicItemLink: Story = {
  args: {
    tag: createLinkTag("125592513", "gladius", undefined, "matte black golvern gladius"),
    exist: "125592513",
    noun: "gladius",
    highlighted: false,
    highlightClass: "",
    itemCategory: "weapon",
  },
  render: (args) => html`
    <illthorn-game-link
      .tag=${args.tag}
      .exist=${args.exist}
      .noun=${args.noun}
      .coord=${args.coord}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-menu=${action("game-element-menu")}
      @game-element-context-menu=${action("game-element-context-menu")}
      @game-element-command=${action("game-element-command")}
    >
      ${args.tag.text}
    </illthorn-game-link>
  `,
};

export const CommandLink: Story = {
  args: {
    tag: createLinkTag("gate456", "gate", "open gate", "wooden gate"),
    exist: "gate456",
    noun: "gate",
    coord: "open gate",
    highlighted: false,
    highlightClass: "",
    itemCategory: "",
  },
  render: (args) => html`
    <illthorn-game-link
      .tag=${args.tag}
      .exist=${args.exist}
      .noun=${args.noun}
      .coord=${args.coord}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-menu=${action("game-element-menu")}
      @game-element-context-menu=${action("game-element-context-menu")}
      @game-element-command=${action("game-element-command")}
    >
      ${args.tag.text}
    </illthorn-game-link>
  `,
};

export const GemLink: Story = {
  args: {
    tag: createLinkTag("ruby789", "ruby", undefined, "a glimmering ruby"),
    exist: "ruby789",
    noun: "ruby",
    highlighted: false,
    highlightClass: "",
    itemCategory: "gem",
  },
  render: (args) => html`
    <illthorn-game-link
      .tag=${args.tag}
      .exist=${args.exist}
      .noun=${args.noun}
      .coord=${args.coord}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-menu=${action("game-element-menu")}
      @game-element-context-menu=${action("game-element-context-menu")}
      @game-element-command=${action("game-element-command")}
    >
      ${args.tag.text}
    </illthorn-game-link>
  `,
};

export const HerbLink: Story = {
  args: {
    tag: createLinkTag("127527554", "stem", undefined, "some aloeas stem"),
    exist: "127527554",
    noun: "stem",
    highlighted: false,
    highlightClass: "",
    itemCategory: "herb",
  },
  render: (args) => html`
    <illthorn-game-link
      .tag=${args.tag}
      .exist=${args.exist}
      .noun=${args.noun}
      .coord=${args.coord}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-menu=${action("game-element-menu")}
      @game-element-context-menu=${action("game-element-context-menu")}
      @game-element-command=${action("game-element-command")}
    >
      ${args.tag.text}
    </illthorn-game-link>
  `,
};

export const JewelryLink: Story = {
  args: {
    tag: createLinkTag("ring202", "ring", undefined, "an ornate gold ring"),
    exist: "ring202",
    noun: "ring",
    highlighted: false,
    highlightClass: "",
    itemCategory: "jewelry",
  },
  render: (args) => html`
    <illthorn-game-link
      .tag=${args.tag}
      .exist=${args.exist}
      .noun=${args.noun}
      .coord=${args.coord}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-menu=${action("game-element-menu")}
      @game-element-context-menu=${action("game-element-context-menu")}
      @game-element-command=${action("game-element-command")}
    >
      ${args.tag.text}
    </illthorn-game-link>
  `,
};

export const ValuableLink: Story = {
  args: {
    tag: createLinkTag("fang303", "fang", undefined, "a curved tiger fang"),
    exist: "fang303",
    noun: "fang",
    highlighted: false,
    highlightClass: "",
    itemCategory: "valuable",
  },
  render: (args) => html`
    <illthorn-game-link
      .tag=${args.tag}
      .exist=${args.exist}
      .noun=${args.noun}
      .coord=${args.coord}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-menu=${action("game-element-menu")}
      @game-element-context-menu=${action("game-element-context-menu")}
      @game-element-command=${action("game-element-command")}
    >
      ${args.tag.text}
    </illthorn-game-link>
  `,
};

export const ArmorLink: Story = {
  args: {
    tag: createLinkTag("shield404", "shield", undefined, "a sturdy iron shield"),
    exist: "shield404",
    noun: "shield",
    highlighted: false,
    highlightClass: "",
    itemCategory: "armor",
  },
  render: (args) => html`
    <illthorn-game-link
      .tag=${args.tag}
      .exist=${args.exist}
      .noun=${args.noun}
      .coord=${args.coord}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-menu=${action("game-element-menu")}
      @game-element-context-menu=${action("game-element-context-menu")}
      @game-element-command=${action("game-element-command")}
    >
      ${args.tag.text}
    </illthorn-game-link>
  `,
};

export const ClothingLink: Story = {
  args: {
    tag: createLinkTag("127527516", "backpack", undefined, "forest green backpack"),
    exist: "127527516",
    noun: "backpack",
    highlighted: false,
    highlightClass: "",
    itemCategory: "clothing",
  },
  render: (args) => html`
    <illthorn-game-link
      .tag=${args.tag}
      .exist=${args.exist}
      .noun=${args.noun}
      .coord=${args.coord}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-menu=${action("game-element-menu")}
      @game-element-context-menu=${action("game-element-context-menu")}
      @game-element-command=${action("game-element-command")}
    >
      ${args.tag.text}
    </illthorn-game-link>
  `,
};

export const FoodLink: Story = {
  args: {
    tag: createLinkTag("127527536", "tart", undefined, "iceberry tart"),
    exist: "127527536",
    noun: "tart",
    highlighted: false,
    highlightClass: "",
    itemCategory: "food",
  },
  render: (args) => html`
    <illthorn-game-link
      .tag=${args.tag}
      .exist=${args.exist}
      .noun=${args.noun}
      .coord=${args.coord}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-menu=${action("game-element-menu")}
      @game-element-context-menu=${action("game-element-context-menu")}
      @game-element-command=${action("game-element-command")}
    >
      ${args.tag.text}
    </illthorn-game-link>
  `,
};

export const ContainerLink: Story = {
  args: {
    tag: createLinkTag("box707", "box", undefined, "a sturdy wooden box"),
    exist: "box707",
    noun: "box",
    highlighted: false,
    highlightClass: "",
    itemCategory: "box",
  },
  render: (args) => html`
    <illthorn-game-link
      .tag=${args.tag}
      .exist=${args.exist}
      .noun=${args.noun}
      .coord=${args.coord}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-menu=${action("game-element-menu")}
      @game-element-context-menu=${action("game-element-context-menu")}
      @game-element-command=${action("game-element-command")}
    >
      ${args.tag.text}
    </illthorn-game-link>
  `,
};

// XML-specific category stories
export const MannaBreadLink: Story = {
  args: {
    tag: createLinkTag("127527555", "loaf", undefined, "sweet pineapple-glazed pumpkin loaf"),
    exist: "127527555",
    noun: "loaf",
    highlighted: false,
    highlightClass: "",
    itemCategory: "manna bread",
  },
  render: (args) => html`
    <illthorn-game-link
      .tag=${args.tag}
      .exist=${args.exist}
      .noun=${args.noun}
      .coord=${args.coord}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-menu=${action("game-element-menu")}
      @game-element-context-menu=${action("game-element-context-menu")}
      @game-element-command=${action("game-element-command")}
    >
      ${args.tag.text}
    </illthorn-game-link>
  `,
};

export const ScrollLink: Story = {
  args: {
    tag: createLinkTag("scroll123", "scroll", undefined, "glowing scroll of healing"),
    exist: "scroll123",
    noun: "scroll",
    highlighted: false,
    highlightClass: "",
    itemCategory: "scroll",
  },
  render: (args) => html`
    <illthorn-game-link
      .tag=${args.tag}
      .exist=${args.exist}
      .noun=${args.noun}
      .coord=${args.coord}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-menu=${action("game-element-menu")}
      @game-element-context-menu=${action("game-element-context-menu")}
      @game-element-command=${action("game-element-command")}
    >
      ${args.tag.text}
    </illthorn-game-link>
  `,
};

export const WandLink: Story = {
  args: {
    tag: createLinkTag("wand456", "wand", undefined, "enchanted oak wand"),
    exist: "wand456",
    noun: "wand",
    highlighted: false,
    highlightClass: "",
    itemCategory: "wand",
  },
  render: (args) => html`
    <illthorn-game-link
      .tag=${args.tag}
      .exist=${args.exist}
      .noun=${args.noun}
      .coord=${args.coord}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-menu=${action("game-element-menu")}
      @game-element-context-menu=${action("game-element-context-menu")}
      @game-element-command=${action("game-element-command")}
    >
      ${args.tag.text}
    </illthorn-game-link>
  `,
};

export const SkinLink: Story = {
  args: {
    tag: createLinkTag("skin789", "skin", undefined, "supple troll skin"),
    exist: "skin789",
    noun: "skin",
    highlighted: false,
    highlightClass: "",
    itemCategory: "skin",
  },
  render: (args) => html`
    <illthorn-game-link
      .tag=${args.tag}
      .exist=${args.exist}
      .noun=${args.noun}
      .coord=${args.coord}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-menu=${action("game-element-menu")}
      @game-element-context-menu=${action("game-element-context-menu")}
      @game-element-command=${action("game-element-command")}
    >
      ${args.tag.text}
    </illthorn-game-link>
  `,
};

export const HighlightedLink: Story = {
  args: {
    tag: createLinkTag("125592512", "dagger", undefined, "hefty mithril dagger"),
    exist: "125592512",
    noun: "dagger",
    highlighted: true,
    highlightClass: "",
    itemCategory: "weapon",
  },
  render: (args) => html`
    <illthorn-game-link
      .tag=${args.tag}
      .exist=${args.exist}
      .noun=${args.noun}
      .coord=${args.coord}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-menu=${action("game-element-menu")}
      @game-element-context-menu=${action("game-element-context-menu")}
      @game-element-command=${action("game-element-command")}
    >
      ${args.tag.text}
    </illthorn-game-link>
  `,
};

export const CustomHighlightLink: Story = {
  args: {
    tag: createLinkTag("crystal909", "crystal", undefined, "a pulsing mana crystal"),
    exist: "crystal909",
    noun: "crystal",
    highlighted: true,
    highlightClass: "user-search-highlight",
    itemCategory: "gem",
  },
  render: (args) => html`
    <style>
      .user-search-highlight {
        background: #ffeb3b !important;
        color: #333 !important;
        box-shadow: 0 0 5px rgba(255, 235, 59, 0.6) !important;
        border-radius: 2px !important;
        padding: 1px 3px !important;
      }
    </style>
    <illthorn-game-link
      .tag=${args.tag}
      .exist=${args.exist}
      .noun=${args.noun}
      .coord=${args.coord}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-menu=${action("game-element-menu")}
      @game-element-context-menu=${action("game-element-context-menu")}
      @game-element-command=${action("game-element-command")}
    >
      ${args.tag.text}
    </illthorn-game-link>
  `,
};

export const InteractionDemo: Story = {
  render: () => html`
    <div style="padding: 16px;">
      <h4>Link Interaction Demo</h4>
      <p><strong>Left-click:</strong> Triggers menu interaction</p>
      <p><strong>Right-click:</strong> Shows context menu</p>
      <p><strong>Command links have dotted underline</strong></p>
      
      <div style="margin: 16px 0; line-height: 1.8;">
        <p>You see 
          <illthorn-game-link
            .tag=${createLinkTag("sword123", "sword", undefined, "a sharp longsword")}
            exist="sword123"
            noun="sword"
            itemCategory="weapon"
            @game-element-menu=${action("menu-interaction")}
            @game-element-context-menu=${action("context-menu")}
          >a sharp longsword</illthorn-game-link>,
          <illthorn-game-link
            .tag=${createLinkTag("ruby456", "ruby", undefined, "a glimmering ruby")}
            exist="ruby456"
            noun="ruby"
            itemCategory="gem"
            @game-element-menu=${action("menu-interaction")}
            @game-element-context-menu=${action("context-menu")}
          >a glimmering ruby</illthorn-game-link>, and
          <illthorn-game-link
            .tag=${createLinkTag("gate789", "gate", "open gate", "a wooden gate")}
            exist="gate789"
            noun="gate"
            coord="open gate"
            @game-element-command=${action("command-interaction")}
            @game-element-context-menu=${action("context-menu")}
          >a wooden gate</illthorn-game-link> here.
        </p>
      </div>
      
      <p><em>Check the Actions tab to see interaction events</em></p>
    </div>
  `,
};

export const AccessibilityDemo: Story = {
  render: () => html`
    <div style="padding: 16px;">
      <h4>Accessibility Features</h4>
      <p>All links support:</p>
      <ul>
        <li>Tab navigation (try pressing Tab)</li>
        <li>Keyboard activation (Enter or Space)</li>
        <li>Screen reader labels with category info</li>
        <li>Focus indicators</li>
      </ul>
      
      <div style="margin: 16px 0; line-height: 2;">
        <illthorn-game-link
          .tag=${createLinkTag("helm123", "helm", undefined, "a polished steel helm")}
          exist="helm123"
          noun="helm"
          itemCategory="armor"
          @game-element-menu=${action("menu-interaction")}
          @game-element-context-menu=${action("context-menu")}
        >a polished steel helm</illthorn-game-link>
        
        <illthorn-game-link
          .tag=${createLinkTag("potion456", "potion", undefined, "a healing potion")}
          exist="potion456"
          noun="potion"
          itemCategory="reagent"
          @game-element-menu=${action("menu-interaction")}
          @game-element-context-menu=${action("context-menu")}
        >a healing potion</illthorn-game-link>
        
        <illthorn-game-link
          .tag=${createLinkTag("door789", "door", "open door", "an oak door")}
          exist="door789"
          noun="door"
          coord="open door"
          @game-element-command=${action("command-interaction")}
          @game-element-context-menu=${action("context-menu")}
        >an oak door</illthorn-game-link>
      </div>
    </div>
  `,
};

export const CategoryShowcase: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; padding: 16px;">
      <div>
        <h4>Weapons (Red)</h4>
        <div style="line-height: 1.6;">
          <illthorn-game-link .tag=${createLinkTag("125592513", "gladius")} exist="125592513" noun="gladius" itemCategory="weapon">matte black golvern gladius</illthorn-game-link><br>
          <illthorn-game-link .tag=${createLinkTag("125592512", "dagger")} exist="125592512" noun="dagger" itemCategory="weapon">hefty mithril dagger</illthorn-game-link>
        </div>
      </div>
      
      <div>
        <h4>Herbs (Purple)</h4>
        <div style="line-height: 1.6;">
          <illthorn-game-link .tag=${createLinkTag("127527554", "stem")} exist="127527554" noun="stem" itemCategory="herb">some aloeas stem</illthorn-game-link><br>
          <illthorn-game-link .tag=${createLinkTag("127527553", "moss")} exist="127527553" noun="moss" itemCategory="herb">some basal moss</illthorn-game-link><br>
          <illthorn-game-link .tag=${createLinkTag("127527547", "leaf")} exist="127527547" noun="leaf" itemCategory="herb">some acantha leaf</illthorn-game-link><br>
          <illthorn-game-link .tag=${createLinkTag("127527552", "potion")} exist="127527552" noun="potion" itemCategory="herb">rose-marrow potion</illthorn-game-link>
        </div>
      </div>
      
      <div>
        <h4>Clothing (Green)</h4>
        <div style="line-height: 1.6;">
          <illthorn-game-link .tag=${createLinkTag("127527516", "backpack")} exist="127527516" noun="backpack" itemCategory="clothing">forest green backpack</illthorn-game-link><br>
          <illthorn-game-link .tag=${createLinkTag("125592511", "harness")} exist="125592511" noun="harness" itemCategory="clothing">maroon harness</illthorn-game-link>
        </div>
      </div>
      
      <div>
        <h4>Magic Items (Pink)</h4>
        <div style="line-height: 1.6;">
          <illthorn-game-link .tag=${createLinkTag("127527523", "amulet")} exist="127527523" noun="amulet" itemCategory="magic">crystal amulet</illthorn-game-link><br>
          <illthorn-game-link .tag=${createLinkTag("scroll123", "scroll")} exist="scroll123" noun="scroll" itemCategory="scroll">glowing scroll</illthorn-game-link><br>
          <illthorn-game-link .tag=${createLinkTag("wand456", "wand")} exist="wand456" noun="wand" itemCategory="wand">enchanted wand</illthorn-game-link>
        </div>
      </div>
      
      <div>
        <h4>Food & Manna (Orange)</h4>
        <div style="line-height: 1.6;">
          <illthorn-game-link .tag=${createLinkTag("127527536", "tart")} exist="127527536" noun="tart" itemCategory="food">iceberry tart</illthorn-game-link><br>
          <illthorn-game-link .tag=${createLinkTag("127527533", "fruit")} exist="127527533" noun="fruit" itemCategory="food">some calamia fruit</illthorn-game-link><br>
          <illthorn-game-link .tag=${createLinkTag("127527555", "loaf")} exist="127527555" noun="loaf" itemCategory="manna bread">sweet pumpkin loaf</illthorn-game-link>
        </div>
      </div>
      
      <div>
        <h4>Gems (Yellow)</h4>
        <div style="line-height: 1.6;">
          <illthorn-game-link .tag=${createLinkTag("ruby456", "ruby")} exist="ruby456" noun="ruby" itemCategory="gem">a glimmering ruby</illthorn-game-link><br>
          <illthorn-game-link .tag=${createLinkTag("diamond789", "diamond")} exist="diamond789" noun="diamond" itemCategory="gem">a brilliant diamond</illthorn-game-link>
        </div>
      </div>
      
      <div>
        <h4>Jewelry (Purple)</h4>
        <div style="line-height: 1.6;">
          <illthorn-game-link .tag=${createLinkTag("ring202", "ring")} exist="ring202" noun="ring" itemCategory="jewelry">an ornate gold ring</illthorn-game-link><br>
          <illthorn-game-link .tag=${createLinkTag("pendant303", "pendant")} exist="pendant303" noun="pendant" itemCategory="jewelry">a silver pendant</illthorn-game-link>
        </div>
      </div>
      
      <div>
        <h4>Valuables (Pink)</h4>
        <div style="line-height: 1.6;">
          <illthorn-game-link .tag=${createLinkTag("skin789", "skin")} exist="skin789" noun="skin" itemCategory="skin">supple troll skin</illthorn-game-link><br>
          <illthorn-game-link .tag=${createLinkTag("fang404", "fang")} exist="fang404" noun="fang" itemCategory="valuable">curved tiger fang</illthorn-game-link>
        </div>
      </div>
    </div>
  `,
};
