import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { MockDataGenerator } from "../../../utils/mock-data";
import "./input-status-bar.lit";

const meta: Meta = {
  title: "Input System/Composite Components/Input Status Bar",
  component: "illthorn-input-status-bar-lit",
  parameters: {
    docs: {
      description: {
        component: "Composite component combining status indicators, room badge, and mini compass in a horizontal layout with responsive behavior.",
      },
    },
  },
  argTypes: {
    // Room properties
    roomId: {
      control: "text",
      description: "Current room ID",
    },
    roomTitle: {
      control: "text",
      description: "Current room title",
    },
    zone: {
      control: { type: "radio" },
      options: ["town", "wilderness", "dungeon", "special"],
      description: "Zone type for styling",
    },

    // Navigation properties
    activeDirections: {
      control: { type: "check" },
      options: ["north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest", "up", "down", "out"],
      description: "Available movement directions",
    },
    interactiveCompass: {
      control: "boolean",
      description: "Enable compass interaction",
    },

    // Status properties
    roundtime: {
      control: { type: "number", min: 0, max: 30 },
      description: "Roundtime in seconds",
    },
    casttime: {
      control: { type: "number", min: 0, max: 30 },
      description: "Casttime in seconds",
    },
    stance: {
      control: { type: "radio" },
      options: ["offensive", "advance", "forward", "neutral", "guarded", "defensive"],
      description: "Combat stance",
    },
    mindState: {
      control: { type: "radio" },
      options: ["clear", "muddled", "confused", "stunned"],
      description: "Mental state",
    },
    health: {
      control: { type: "number", min: 0, max: 100 },
      description: "Health percentage",
    },
    mana: {
      control: { type: "number", min: 0, max: 100 },
      description: "Mana percentage",
    },
    stamina: {
      control: { type: "number", min: 0, max: 100 },
      description: "Stamina percentage",
    },
    spirit: {
      control: { type: "number", min: 0, max: 100 },
      description: "Spirit percentage",
    },

    // Layout properties
    compact: {
      control: "boolean",
      description: "Enable compact layout",
    },
    showLabels: {
      control: "boolean",
      description: "Show labels on status indicators",
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    roomId: "12345",
    roomTitle: "A cozy tavern",
    zone: "town",
    activeDirections: ["north", "east", "south", "west"],
    interactiveCompass: false,
    roundtime: 0,
    casttime: 0,
    stance: "neutral",
    mindState: "clear",
    health: 95,
    mana: 80,
    stamina: 90,
    spirit: 100,
    compact: false,
    showLabels: true,
  },
  render: (args) => html`
    <div style="padding: 20px;">
      <h4>Input Status Bar - Default</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
        Composite component showing status, room info, and navigation together.
      </p>
      <illthorn-input-status-bar-lit
        .roomId=${args.roomId}
        .roomTitle=${args.roomTitle}
        .zone=${args.zone}
        .activeDirections=${args.activeDirections}
        .interactiveCompass=${args.interactiveCompass}
        .roundtime=${args.roundtime}
        .casttime=${args.casttime}
        .stance=${args.stance}
        .mindState=${args.mindState}
        .health=${args.health}
        .mana=${args.mana}
        .stamina=${args.stamina}
        .spirit=${args.spirit}
        .compact=${args.compact}
        .showLabels=${args.showLabels}
        @direction-clicked=${(e: CustomEvent) => {
          console.log("Direction clicked:", e.detail.direction);
          alert("Navigating " + e.detail.direction);
        }}
      ></illthorn-input-status-bar-lit>
    </div>
  `,
};

export const CompactMode: Story = {
  args: {
    ...Default.args,
    compact: true,
  },
  render: (args) => html`
    <div style="padding: 20px;">
      <h4>Compact Mode</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
        Space-efficient layout for smaller screens or constrained areas.
      </p>
      <illthorn-input-status-bar-lit
        .roomId=${args.roomId}
        .roomTitle=${args.roomTitle}
        .zone=${args.zone}
        .activeDirections=${args.activeDirections}
        .interactiveCompass=${args.interactiveCompass}
        .roundtime=${args.roundtime}
        .casttime=${args.casttime}
        .stance=${args.stance}
        .mindState=${args.mindState}
        .health=${args.health}
        .mana=${args.mana}
        .stamina=${args.stamina}
        .spirit=${args.spirit}
        .compact=${args.compact}
        .showLabels=${args.showLabels}
      ></illthorn-input-status-bar-lit>
    </div>
  `,
};

export const ActiveTimers: Story = {
  args: {
    ...Default.args,
    roundtime: 5,
    casttime: 3,
    stance: "offensive",
    health: 65,
    mana: 40,
  },
  render: (args) => html`
    <div style="padding: 20px;">
      <h4>Active Timers & Low Resources</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
        Shows active roundtime and casttime with low health/mana warnings.
      </p>
      <illthorn-input-status-bar-lit
        .roomId=${args.roomId}
        .roomTitle=${args.roomTitle}
        .zone=${args.zone}
        .activeDirections=${args.activeDirections}
        .interactiveCompass=${args.interactiveCompass}
        .roundtime=${args.roundtime}
        .casttime=${args.casttime}
        .stance=${args.stance}
        .mindState=${args.mindState}
        .health=${args.health}
        .mana=${args.mana}
        .stamina=${args.stamina}
        .spirit=${args.spirit}
        .compact=${args.compact}
        .showLabels=${args.showLabels}
      ></illthorn-input-status-bar-lit>
    </div>
  `,
};

export const InteractiveCompass: Story = {
  args: {
    ...Default.args,
    interactiveCompass: true,
    activeDirections: ["north", "northeast", "east", "up", "down"],
  },
  render: (args) => html`
    <div style="padding: 20px;">
      <h4>Interactive Compass</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
        Click on compass directions to navigate. Check the console for events.
      </p>
      <illthorn-input-status-bar-lit
        .roomId=${args.roomId}
        .roomTitle=${args.roomTitle}
        .zone=${args.zone}
        .activeDirections=${args.activeDirections}
        .interactiveCompass=${args.interactiveCompass}
        .roundtime=${args.roundtime}
        .casttime=${args.casttime}
        .stance=${args.stance}
        .mindState=${args.mindState}
        .health=${args.health}
        .mana=${args.mana}
        .stamina=${args.stamina}
        .spirit=${args.spirit}
        .compact=${args.compact}
        .showLabels=${args.showLabels}
        @direction-clicked=${(e: CustomEvent) => {
          console.log("Direction clicked:", e.detail.direction);
          alert("You move " + e.detail.direction + "!");
        }}
      ></illthorn-input-status-bar-lit>
    </div>
  `,
};

export const ZoneVariations: Story = {
  render: () => html`
    <div style="padding: 20px;">
      <h4>Zone Variations</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
        Different zone types affect room badge styling.
      </p>
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div>
          <h5>Town Zone</h5>
          <illthorn-input-status-bar-lit
            roomId="1001"
            roomTitle="Central Square"
            zone="town"
            .activeDirections=${["north", "east", "south", "west"]}
            health=${95}
            mana=${85}
            stamina=${90}
            spirit=${100}
          ></illthorn-input-status-bar-lit>
        </div>
        <div>
          <h5>Wilderness Zone</h5>
          <illthorn-input-status-bar-lit
            roomId="2001"
            roomTitle="Dense Forest Path"
            zone="wilderness"
            .activeDirections=${["north", "southwest", "up"]}
            health=${80}
            mana=${70}
            stamina=${85}
            spirit=${95}
            stance="guarded"
          ></illthorn-input-status-bar-lit>
        </div>
        <div>
          <h5>Dungeon Zone</h5>
          <illthorn-input-status-bar-lit
            roomId="3001"
            roomTitle="Dark Corridor"
            zone="dungeon"
            .activeDirections=${["north", "south"]}
            health=${60}
            mana=${50}
            stamina=${70}
            spirit=${80}
            roundtime=${3}
            stance="defensive"
          ></illthorn-input-status-bar-lit>
        </div>
        <div>
          <h5>Special Zone</h5>
          <illthorn-input-status-bar-lit
            roomId="9999"
            roomTitle="Ethereal Plane"
            zone="special"
            .activeDirections=${["out"]}
            health=${100}
            mana=${100}
            stamina=${100}
            spirit=${100}
            mindState="confused"
          ></illthorn-input-status-bar-lit>
        </div>
      </div>
    </div>
  `,
};

export const ResponsiveDemo: Story = {
  render: () => html`
    <div style="padding: 20px;">
      <h4>Responsive Layout Demo</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
        Resize the viewport to see responsive behavior.
      </p>
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div style="border: 1px solid var(--color-border); padding: 10px;">
          <h5>Wide Layout (800px+)</h5>
          <div style="width: 900px; border: 1px dashed #ccc;">
            <illthorn-input-status-bar-lit
              roomId="12345"
              roomTitle="Wide Layout Test Room"
              zone="town"
              .activeDirections=${["north", "east", "south", "west"]}
              health=${85}
              mana=${70}
              stamina=${95}
              spirit=${100}
            ></illthorn-input-status-bar-lit>
          </div>
        </div>

        <div style="border: 1px solid var(--color-border); padding: 10px;">
          <h5>Medium Layout (600px)</h5>
          <div style="width: 600px; border: 1px dashed #ccc;">
            <illthorn-input-status-bar-lit
              roomId="12345"
              roomTitle="Medium Layout Test Room"
              zone="wilderness"
              .activeDirections=${["north", "east", "south"]}
              health=${75}
              mana=${60}
              stamina=${85}
              spirit=${90}
            ></illthorn-input-status-bar-lit>
          </div>
        </div>

        <div style="border: 1px solid var(--color-border); padding: 10px;">
          <h5>Narrow Layout (400px)</h5>
          <div style="width: 400px; border: 1px dashed #ccc;">
            <illthorn-input-status-bar-lit
              roomId="12345"
              roomTitle="Narrow Layout Test Room"
              zone="dungeon"
              .activeDirections=${["north", "south"]}
              health=${65}
              mana=${50}
              stamina=${75}
              spirit=${80}
              compact=${true}
            ></illthorn-input-status-bar-lit>
          </div>
        </div>
      </div>
    </div>
  `,
};

export const DynamicScenarios: Story = {
  render: () => {
    const scenarios = [
      { name: "New Player", data: MockDataGenerator.scenarios.newPlayer() },
      { name: "Combat", data: MockDataGenerator.scenarios.combat() },
      { name: "Casting", data: MockDataGenerator.scenarios.casting() },
    ];

    return html`
      <div style="padding: 20px;">
        <h4>Dynamic Game Scenarios</h4>
        <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
          Different game states and scenarios showing realistic data combinations.
        </p>
        <div style="display: flex; flex-direction: column; gap: 20px;">
          ${scenarios.map(
            (scenario) => html`
              <div style="border: 1px solid var(--color-border); padding: 15px; border-radius: 4px;">
                <h5>${scenario.name} Scenario</h5>
                <div style="font-size: 0.9em; color: var(--color-text-secondary); margin-bottom: 10px;">
                  State: ${scenario.data.promptState} | Health: ${scenario.data.vitals.health}% |
                  Mana: ${scenario.data.vitals.mana}% | Location: ${scenario.data.room.title}
                </div>
                <illthorn-input-status-bar-lit
                  .roomId=${scenario.data.room.id}
                  .roomTitle=${scenario.data.room.title}
                  .zone=${scenario.data.room.zone}
                  .activeDirections=${scenario.data.navigation.exits}
                  .interactiveCompass=${true}
                  .roundtime=${scenario.data.timers.roundtime}
                  .casttime=${scenario.data.timers.casttime}
                  .stance=${scenario.data.combat.stance}
                  .mindState=${scenario.data.status.mind}
                  .health=${scenario.data.vitals.health}
                  .mana=${scenario.data.vitals.mana}
                  .stamina=${scenario.data.vitals.stamina}
                  .spirit=${scenario.data.vitals.spirit}
                  @direction-clicked=${(e: CustomEvent) => {
                    console.log(`${scenario.name} - Direction clicked:`, e.detail.direction);
                  }}
                ></illthorn-input-status-bar-lit>
              </div>
            `
          )}
        </div>
      </div>
    `;
  },
};

export const NoLabelsCompact: Story = {
  args: {
    ...Default.args,
    compact: true,
    showLabels: false,
    roomTitle: "Compact Display Mode - Very Long Room Title That Should Be Truncated",
  },
  render: (args) => html`
    <div style="padding: 20px;">
      <h4>Ultra Compact Mode</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
        Minimal space usage with no labels and compact sizing for tight layouts.
      </p>
      <div style="width: 350px; border: 1px dashed #ccc; padding: 5px;">
        <illthorn-input-status-bar-lit
          .roomId=${args.roomId}
          .roomTitle=${args.roomTitle}
          .zone=${args.zone}
          .activeDirections=${args.activeDirections}
          .interactiveCompass=${args.interactiveCompass}
          .roundtime=${args.roundtime}
          .casttime=${args.casttime}
          .stance=${args.stance}
          .mindState=${args.mindState}
          .health=${args.health}
          .mana=${args.mana}
          .stamina=${args.stamina}
          .spirit=${args.spirit}
          .compact=${args.compact}
          .showLabels=${args.showLabels}
        ></illthorn-input-status-bar-lit>
      </div>
    </div>
  `,
};