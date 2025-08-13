import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

// Event action logging for stories
const action = (name: string) => (detail?: unknown) => {
  console.log(`[Story Event] ${name}:`, detail);
};
import "./base-game-element.lit";
import { makeTag } from "../../parser/tag";

// Mock game tag creation utility
const createMockTag = (tagName: string, attrs: Record<string, string> = {}, text = "") => {
  // TypeScript workaround for dynamic tag creation in stories
  const tag = makeTag(tagName as "a");
  tag.attrs = attrs;
  tag.text = text;
  return tag;
};

const meta: Meta = {
  title: "Game Elements/BaseGameElement",
  component: "illthorn-base-game-element",
  parameters: {
    docs: {
      description: {
        component:
          "Base class for all game element components providing highlighting, theming, and interaction patterns. Supports automatic item categorization and user-configurable highlighting with CSS custom properties for theme integration.",
      },
    },
  },
  argTypes: {
    tag: {
      control: false,
      description: "GameTag object containing parsed game data",
    },
    highlighted: {
      control: "boolean",
      description: "Whether the element is currently highlighted",
    },
    highlightClass: {
      control: "text",
      description: "CSS class name for custom highlighting styling",
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
      description: "Automatic item category for themed styling from XML data",
    },
  },
};

export default meta;
type Story = StoryObj;

// Set up event listeners for interaction demonstration
const _setupEventListeners = (element: Element) => {
  element.addEventListener("game-element-test", action("game-element-test"));
  element.addEventListener("game-element-action", action("game-element-action"));
  element.addEventListener("game-element-interaction", action("game-element-interaction"));
  return element;
};

export const Default: Story = {
  args: {
    tag: createMockTag("span", {}, "Basic game element"),
    highlighted: false,
    highlightClass: "",
    itemCategory: "",
  },
  render: (args) => html`
    <illthorn-base-game-element
      .tag=${args.tag}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-test=${action("game-element-test")}
      @game-element-action=${action("game-element-action")}
    >
      ${args.tag.text}
    </illthorn-base-game-element>
  `,
};

export const WeaponCategory: Story = {
  args: {
    tag: createMockTag("a", { noun: "gladius", exist: "125592513" }, "matte black golvern gladius"),
    highlighted: false,
    highlightClass: "",
    itemCategory: "weapon",
  },
  render: (args) => html`
    <illthorn-base-game-element
      .tag=${args.tag}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-test=${action("game-element-test")}
      @game-element-action=${action("game-element-action")}
    >
      ${args.tag.text}
    </illthorn-base-game-element>
  `,
};

export const GemCategory: Story = {
  args: {
    tag: createMockTag("a", { noun: "ruby", exist: "ruby456" }, "a glimmering ruby"),
    highlighted: false,
    highlightClass: "",
    itemCategory: "gem",
  },
  render: (args) => html`
    <illthorn-base-game-element
      .tag=${args.tag}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-test=${action("game-element-test")}
      @game-element-action=${action("game-element-action")}
    >
      ${args.tag.text}
    </illthorn-base-game-element>
  `,
};

export const HerbCategory: Story = {
  args: {
    tag: createMockTag("a", { noun: "stem", exist: "127527554" }, "some aloeas stem"),
    highlighted: false,
    highlightClass: "",
    itemCategory: "herb",
  },
  render: (args) => html`
    <illthorn-base-game-element
      .tag=${args.tag}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-test=${action("game-element-test")}
      @game-element-action=${action("game-element-action")}
    >
      ${args.tag.text}
    </illthorn-base-game-element>
  `,
};

export const MagicCategory: Story = {
  args: {
    tag: createMockTag("a", { noun: "amulet", exist: "127527523" }, "crystal amulet"),
    highlighted: false,
    highlightClass: "",
    itemCategory: "magic",
  },
  render: (args) => html`
    <illthorn-base-game-element
      .tag=${args.tag}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-test=${action("game-element-test")}
      @game-element-action=${action("game-element-action")}
    >
      ${args.tag.text}
    </illthorn-base-game-element>
  `,
};

export const ForgeableCategory: Story = {
  args: {
    tag: createMockTag("a", { noun: "ore", exist: "ore202" }, "some mithril ore"),
    highlighted: false,
    highlightClass: "",
    itemCategory: "forgeable",
  },
  render: (args) => html`
    <illthorn-base-game-element
      .tag=${args.tag}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-test=${action("game-element-test")}
      @game-element-action=${action("game-element-action")}
    >
      ${args.tag.text}
    </illthorn-base-game-element>
  `,
};

export const FoodCategory: Story = {
  args: {
    tag: createMockTag("a", { noun: "apple", exist: "apple303" }, "a juicy red apple"),
    highlighted: false,
    highlightClass: "",
    itemCategory: "food",
  },
  render: (args) => html`
    <illthorn-base-game-element
      .tag=${args.tag}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-test=${action("game-element-test")}
      @game-element-action=${action("game-element-action")}
    >
      ${args.tag.text}
    </illthorn-base-game-element>
  `,
};

export const ClothingCategory: Story = {
  args: {
    tag: createMockTag("a", { noun: "backpack", exist: "127527516" }, "forest green backpack"),
    highlighted: false,
    highlightClass: "",
    itemCategory: "clothing",
  },
  render: (args) => html`
    <illthorn-base-game-element
      .tag=${args.tag}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-test=${action("game-element-test")}
      @game-element-action=${action("game-element-action")}
    >
      ${args.tag.text}
    </illthorn-base-game-element>
  `,
};

export const Highlighted: Story = {
  args: {
    tag: createMockTag("a", { noun: "sword", exist: "sword123" }, "a sharp longsword"),
    highlighted: true,
    highlightClass: "",
    itemCategory: "weapon",
  },
  render: (args) => html`
    <illthorn-base-game-element
      .tag=${args.tag}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-test=${action("game-element-test")}
      @game-element-action=${action("game-element-action")}
    >
      ${args.tag.text}
    </illthorn-base-game-element>
  `,
};

export const CustomHighlightClass: Story = {
  args: {
    tag: createMockTag("a", { noun: "potion", exist: "potion505" }, "a shimmering blue potion"),
    highlighted: true,
    highlightClass: "user-custom-highlight",
    itemCategory: "magic",
  },
  render: (args) => html`
    <style>
      .user-custom-highlight {
        background: linear-gradient(45deg, #ff6b6b, #4ecdc4) !important;
        color: white !important;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5) !important;
        border-radius: 3px !important;
        padding: 2px 4px !important;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
      }
    </style>
    <illthorn-base-game-element
      .tag=${args.tag}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-test=${action("game-element-test")}
      @game-element-action=${action("game-element-action")}
    >
      ${args.tag.text}
    </illthorn-base-game-element>
  `,
};

// XML-specific category stories
export const MannaBreadCategory: Story = {
  args: {
    tag: createMockTag("a", { noun: "loaf", exist: "127527555" }, "sweet pineapple-glazed pumpkin loaf"),
    highlighted: false,
    highlightClass: "",
    itemCategory: "manna bread",
  },
  render: (args) => html`
    <illthorn-base-game-element
      .tag=${args.tag}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-test=${action("game-element-test")}
      @game-element-action=${action("game-element-action")}
    >
      ${args.tag.text}
    </illthorn-base-game-element>
  `,
};

export const ScrollCategory: Story = {
  args: {
    tag: createMockTag("a", { noun: "scroll", exist: "scroll123" }, "glowing scroll of healing"),
    highlighted: false,
    highlightClass: "",
    itemCategory: "scroll",
  },
  render: (args) => html`
    <illthorn-base-game-element
      .tag=${args.tag}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-test=${action("game-element-test")}
      @game-element-action=${action("game-element-action")}
    >
      ${args.tag.text}
    </illthorn-base-game-element>
  `,
};

export const WandCategory: Story = {
  args: {
    tag: createMockTag("a", { noun: "wand", exist: "wand456" }, "enchanted oak wand"),
    highlighted: false,
    highlightClass: "",
    itemCategory: "wand",
  },
  render: (args) => html`
    <illthorn-base-game-element
      .tag=${args.tag}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-test=${action("game-element-test")}
      @game-element-action=${action("game-element-action")}
    >
      ${args.tag.text}
    </illthorn-base-game-element>
  `,
};

export const SkinCategory: Story = {
  args: {
    tag: createMockTag("a", { noun: "skin", exist: "skin789" }, "supple troll skin"),
    highlighted: false,
    highlightClass: "",
    itemCategory: "skin",
  },
  render: (args) => html`
    <illthorn-base-game-element
      .tag=${args.tag}
      ?highlighted=${args.highlighted}
      .highlightClass=${args.highlightClass}
      .itemCategory=${args.itemCategory}
      @game-element-test=${action("game-element-test")}
      @game-element-action=${action("game-element-action")}
    >
      ${args.tag.text}
    </illthorn-base-game-element>
  `,
};

export const InteractionTest: Story = {
  args: {
    tag: createMockTag("a", { noun: "dagger", exist: "125592512" }, "hefty mithril dagger"),
    highlighted: false,
    highlightClass: "",
    itemCategory: "weapon",
  },
  render: (args) => html`
    <div>
      <p><strong>Click the element below to test interaction events:</strong></p>
      <illthorn-base-game-element
        .tag=${args.tag}
        ?highlighted=${args.highlighted}
        .highlightClass=${args.highlightClass}
        .itemCategory=${args.itemCategory}
        @game-element-test=${action("game-element-test")}
        @game-element-action=${action("game-element-action")}
        @click=${() => {
          // Simulate dispatching an interaction event
          const element = document.querySelector("illthorn-base-game-element");
          if (element) {
            // Access protected method for story demonstration
            (element as unknown as { dispatchInteraction: (type: string, detail: Record<string, unknown>) => void }).dispatchInteraction("test", {
              testData: "Clicked from story",
              timestamp: Date.now(),
            });
          }
        }}
        style="cursor: pointer; user-select: none;"
      >
        ${args.tag.text}
      </illthorn-base-game-element>
      <p><em>Check the Actions tab to see dispatched events</em></p>
    </div>
  `,
};

export const CategoryComparison: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; padding: 16px;">
      <div>
        <h4>Weapons (Red)</h4>
        <div style="line-height: 1.6;">
          <illthorn-base-game-element
            .tag=${createMockTag("a", { noun: "gladius" }, "matte black golvern gladius")}
            itemCategory="weapon"
          >matte black golvern gladius</illthorn-base-game-element><br>
          <illthorn-base-game-element
            .tag=${createMockTag("a", { noun: "dagger" }, "hefty mithril dagger")}
            itemCategory="weapon"
          >hefty mithril dagger</illthorn-base-game-element>
        </div>
      </div>
      
      <div>
        <h4>Herbs (Purple)</h4>
        <div style="line-height: 1.6;">
          <illthorn-base-game-element
            .tag=${createMockTag("a", { noun: "stem" }, "some aloeas stem")}
            itemCategory="herb"
          >some aloeas stem</illthorn-base-game-element><br>
          <illthorn-base-game-element
            .tag=${createMockTag("a", { noun: "moss" }, "some ephlox moss")}
            itemCategory="herb"
          >some ephlox moss</illthorn-base-game-element><br>
          <illthorn-base-game-element
            .tag=${createMockTag("a", { noun: "potion" }, "rose-marrow potion")}
            itemCategory="herb"
          >rose-marrow potion</illthorn-base-game-element>
        </div>
      </div>
      
      <div>
        <h4>Clothing (Green)</h4>
        <div style="line-height: 1.6;">
          <illthorn-base-game-element
            .tag=${createMockTag("a", { noun: "backpack" }, "forest green backpack")}
            itemCategory="clothing"
          >forest green backpack</illthorn-base-game-element><br>
          <illthorn-base-game-element
            .tag=${createMockTag("a", { noun: "harness" }, "maroon harness")}
            itemCategory="clothing"
          >maroon harness</illthorn-base-game-element>
        </div>
      </div>
      
      <div>
        <h4>Magic Items (Pink)</h4>
        <div style="line-height: 1.6;">
          <illthorn-base-game-element
            .tag=${createMockTag("a", { noun: "amulet" }, "crystal amulet")}
            itemCategory="magic"
          >crystal amulet</illthorn-base-game-element><br>
          <illthorn-base-game-element
            .tag=${createMockTag("a", { noun: "scroll" }, "glowing scroll")}
            itemCategory="scroll"
          >glowing scroll</illthorn-base-game-element><br>
          <illthorn-base-game-element
            .tag=${createMockTag("a", { noun: "wand" }, "enchanted wand")}
            itemCategory="wand"
          >enchanted wand</illthorn-base-game-element>
        </div>
      </div>
      
      <div>
        <h4>Food & Manna (Orange)</h4>
        <div style="line-height: 1.6;">
          <illthorn-base-game-element
            .tag=${createMockTag("a", { noun: "tart" }, "iceberry tart")}
            itemCategory="food"
          >iceberry tart</illthorn-base-game-element><br>
          <illthorn-base-game-element
            .tag=${createMockTag("a", { noun: "fruit" }, "some calamia fruit")}
            itemCategory="food"
          >some calamia fruit</illthorn-base-game-element><br>
          <illthorn-base-game-element
            .tag=${createMockTag("a", { noun: "loaf" }, "pumpkin loaf")}
            itemCategory="manna bread"
          >pumpkin loaf</illthorn-base-game-element>
        </div>
      </div>
      
      <div>
        <h4>Gems (Yellow)</h4>
        <div style="line-height: 1.6;">
          <illthorn-base-game-element
            .tag=${createMockTag("a", { noun: "ruby" }, "a glimmering ruby")}
            itemCategory="gem"
          >a glimmering ruby</illthorn-base-game-element><br>
          <illthorn-base-game-element
            .tag=${createMockTag("a", { noun: "diamond" }, "a brilliant diamond")}
            itemCategory="gem"
          >a brilliant diamond</illthorn-base-game-element>
        </div>
      </div>
      
      <div>
        <h4>Valuables (Pink)</h4>
        <div style="line-height: 1.6;">
          <illthorn-base-game-element
            .tag=${createMockTag("a", { noun: "skin" }, "supple troll skin")}
            itemCategory="skin"
          >supple troll skin</illthorn-base-game-element><br>
          <illthorn-base-game-element
            .tag=${createMockTag("a", { noun: "fang" }, "curved tiger fang")}
            itemCategory="valuable"
          >curved tiger fang</illthorn-base-game-element>
        </div>
      </div>
      
      <div>
        <h4>No Category (Gray)</h4>
        <div style="line-height: 1.6;">
          <illthorn-base-game-element
            .tag=${createMockTag("span", {}, "basic text")}
          >basic text</illthorn-base-game-element><br>
          <illthorn-base-game-element
            .tag=${createMockTag("span", {}, "unknown item")}
          >unknown item</illthorn-base-game-element>
        </div>
      </div>
    </div>
  `,
};

export const SlotContentTest: Story = {
  render: () => html`
    <div>
      <h4>Complex Slot Content</h4>
      <illthorn-base-game-element
        .tag=${createMockTag("div", {})}
        itemCategory="weapon"
      >
        <span style="font-weight: bold;">Complex</span>
        <em style="color: #888;"> nested </em>
        <strong style="text-decoration: underline;">content</strong>
      </illthorn-base-game-element>
      
      <h4>Mixed Content</h4>
      <illthorn-base-game-element
        .tag=${createMockTag("div", {})}
        itemCategory="gem"
        highlighted
      >
        Text with <code>inline code</code> and <a href="#" onclick="event.preventDefault()">links</a>
      </illthorn-base-game-element>
    </div>
  `,
};
