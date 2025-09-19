import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { MockDataGenerator } from "../../../utils/mock-data";
import "./status-indicators.lit";

const meta: Meta = {
  title: "Input System/Status Indicators",
  component: "illthorn-status-indicators-lit",
  parameters: {
    docs: {
      description: {
        component: "Compact status indicators showing roundtime, casttime, stance, and other character states in the input system status bar.",
      },
    },
  },
  argTypes: {
    roundtime: {
      control: { type: "number", min: 0, max: 20 },
      description: "Current roundtime in seconds (0 = inactive)",
    },
    casttime: {
      control: { type: "number", min: 0, max: 20 },
      description: "Current casttime in seconds (0 = inactive)",
    },
    stance: {
      control: { type: "select" },
      options: ["offensive", "advance", "forward", "neutral", "guarded", "defensive"],
      description: "Current combat stance",
    },
    mindState: {
      control: { type: "select" },
      options: ["clear", "muddled", "confused", "stunned"],
      description: "Current mind state",
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
    compact: {
      control: "boolean",
      description: "Use compact display mode for space-constrained layouts",
    },
    showLabels: {
      control: "boolean",
      description: "Show text labels alongside icons",
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    roundtime: 0,
    casttime: 0,
    stance: "neutral",
    mindState: "clear",
    health: 100,
    mana: 100,
    stamina: 100,
    spirit: 100,
    compact: false,
    showLabels: true,
  },
  render: (args) => html`
    <illthorn-status-indicators-lit
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
    ></illthorn-status-indicators-lit>
  `,
};

export const CombatActive: Story = {
  args: {
    roundtime: 3,
    casttime: 0,
    stance: "offensive",
    mindState: "clear",
    health: 75,
    mana: 50,
    stamina: 40,
    spirit: 90,
  },
  render: (args) => html`
    <div style="padding: 20px;">
      <h4>Combat State - Roundtime Active</h4>
      <illthorn-status-indicators-lit
        .roundtime=${args.roundtime}
        .casttime=${args.casttime}
        .stance=${args.stance}
        .mindState=${args.mindState}
        .health=${args.health}
        .mana=${args.mana}
        .stamina=${args.stamina}
        .spirit=${args.spirit}
      ></illthorn-status-indicators-lit>
    </div>
  `,
};

export const CastingActive: Story = {
  args: {
    roundtime: 0,
    casttime: 4,
    stance: "defensive",
    mindState: "clear",
    health: 100,
    mana: 30,
    stamina: 100,
    spirit: 100,
  },
  render: (args) => html`
    <div style="padding: 20px;">
      <h4>Spellcasting State - Casttime Active</h4>
      <illthorn-status-indicators-lit
        .roundtime=${args.roundtime}
        .casttime=${args.casttime}
        .stance=${args.stance}
        .mindState=${args.mindState}
        .health=${args.health}
        .mana=${args.mana}
        .stamina=${args.stamina}
        .spirit=${args.spirit}
      ></illthorn-status-indicators-lit>
    </div>
  `,
};

export const LowResources: Story = {
  args: {
    roundtime: 0,
    casttime: 0,
    stance: "guarded",
    mindState: "muddled",
    health: 25,
    mana: 15,
    stamina: 10,
    spirit: 35,
  },
  render: (args) => html`
    <div style="padding: 20px;">
      <h4>Critical State - Low Resources</h4>
      <illthorn-status-indicators-lit
        .roundtime=${args.roundtime}
        .casttime=${args.casttime}
        .stance=${args.stance}
        .mindState=${args.mindState}
        .health=${args.health}
        .mana=${args.mana}
        .stamina=${args.stamina}
        .spirit=${args.spirit}
      ></illthorn-status-indicators-lit>
    </div>
  `,
};

export const StunnedState: Story = {
  args: {
    roundtime: 0,
    casttime: 0,
    stance: "neutral",
    mindState: "stunned",
    health: 50,
    mana: 100,
    stamina: 100,
    spirit: 100,
  },
  render: (args) => html`
    <div style="padding: 20px;">
      <h4>Stunned Character</h4>
      <illthorn-status-indicators-lit
        .roundtime=${args.roundtime}
        .casttime=${args.casttime}
        .stance=${args.stance}
        .mindState=${args.mindState}
        .health=${args.health}
        .mana=${args.mana}
        .stamina=${args.stamina}
        .spirit=${args.spirit}
      ></illthorn-status-indicators-lit>
    </div>
  `,
};

export const CompactMode: Story = {
  render: () => html`
    <div style="padding: 20px;">
      <h4>Compact vs Normal Display</h4>
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div>
          <div style="font-weight: bold; margin-bottom: 10px;">Normal Mode:</div>
          <illthorn-status-indicators-lit
            .roundtime=${3}
            .casttime=${2}
            .stance="offensive"
            .mindState="clear"
            .health=${75}
            .mana=${60}
            .stamina=${45}
            .spirit=${90}
            .compact=${false}
            .showLabels=${true}
          ></illthorn-status-indicators-lit>
        </div>
        <div>
          <div style="font-weight: bold; margin-bottom: 10px;">Compact Mode:</div>
          <illthorn-status-indicators-lit
            .roundtime=${3}
            .casttime=${2}
            .stance="offensive"
            .mindState="clear"
            .health=${75}
            .mana=${60}
            .stamina=${45}
            .spirit=${90}
            .compact=${true}
            .showLabels=${false}
          ></illthorn-status-indicators-lit>
        </div>
      </div>
    </div>
  `,
};

export const StanceVariations: Story = {
  render: () => {
    const stances = ["offensive", "advance", "forward", "neutral", "guarded", "defensive"];

    return html`
      <div style="padding: 20px;">
        <h4>All Combat Stances</h4>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
          ${stances.map(
            (stance) => html`
              <div style="border: 1px solid var(--color-border); padding: 10px; border-radius: 4px;">
                <div style="font-weight: bold; margin-bottom: 5px; text-transform: capitalize;">${stance}</div>
                <illthorn-status-indicators-lit
                  .stance=${stance}
                  .health=${100}
                  .mana=${100}
                  .stamina=${100}
                  .spirit=${100}
                  .compact=${true}
                ></illthorn-status-indicators-lit>
              </div>
            `
          )}
        </div>
      </div>
    `;
  },
};

export const MindStateVariations: Story = {
  render: () => {
    const mindStates = ["clear", "muddled", "confused", "stunned"];

    return html`
      <div style="padding: 20px;">
        <h4>All Mind States</h4>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
          ${mindStates.map(
            (mindState) => html`
              <div style="border: 1px solid var(--color-border); padding: 10px; border-radius: 4px;">
                <div style="font-weight: bold; margin-bottom: 5px; text-transform: capitalize;">${mindState}</div>
                <illthorn-status-indicators-lit
                  .mindState=${mindState}
                  .stance="neutral"
                  .health=${100}
                  .mana=${100}
                  .stamina=${100}
                  .spirit=${100}
                ></illthorn-status-indicators-lit>
              </div>
            `
          )}
        </div>
      </div>
    `;
  },
};

export const TimerCountdowns: Story = {
  render: () => {
    // This story would demonstrate animated countdowns
    return html`
      <div style="padding: 20px;">
        <h4>Active Timer Countdowns</h4>
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div>
            <div style="margin-bottom: 10px;">Roundtime: 5 seconds</div>
            <illthorn-status-indicators-lit
              .roundtime=${5}
              .stance="offensive"
              .health=${80}
              .mana=${90}
              .stamina=${60}
              .spirit=${100}
            ></illthorn-status-indicators-lit>
          </div>
          <div>
            <div style="margin-bottom: 10px;">Casttime: 3 seconds</div>
            <illthorn-status-indicators-lit
              .casttime=${3}
              .stance="defensive"
              .health=${100}
              .mana=${40}
              .stamina=${100}
              .spirit=${100}
            ></illthorn-status-indicators-lit>
          </div>
          <div>
            <div style="margin-bottom: 10px;">Both Active</div>
            <illthorn-status-indicators-lit
              .roundtime=${2}
              .casttime=${6}
              .stance="neutral"
              .health=${90}
              .mana=${50}
              .stamina=${70}
              .spirit=${85}
            ></illthorn-status-indicators-lit>
          </div>
        </div>
      </div>
    `;
  },
};

export const DynamicScenarios: Story = {
  render: () => {
    const scenarios = [
      { name: "New Player", data: MockDataGenerator.scenarios.newPlayer() },
      { name: "Combat", data: MockDataGenerator.scenarios.combat() },
      { name: "Casting", data: MockDataGenerator.scenarios.casting() },
    ];

    return html`
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 20px;">
        <h4 style="grid-column: 1 / -1;">Dynamic Status Scenarios</h4>
        ${scenarios.map(
          (scenario) => html`
            <div style="border: 1px solid var(--color-border); padding: 15px; border-radius: 4px;">
              <div style="font-weight: bold; margin-bottom: 10px;">${scenario.name}</div>
              <div style="font-size: 0.9em; color: var(--color-text-secondary); margin-bottom: 10px;">
                ${scenario.data.room.title}
              </div>
              <illthorn-status-indicators-lit
                .roundtime=${scenario.data.status.roundtime}
                .casttime=${scenario.data.status.casttime}
                .stance=${scenario.data.status.stance}
                .mindState=${scenario.data.status.mindState}
                .health=${scenario.data.status.health}
                .mana=${scenario.data.status.mana}
                .stamina=${scenario.data.status.stamina}
                .spirit=${scenario.data.status.spirit}
              ></illthorn-status-indicators-lit>
            </div>
          `
        )}
      </div>
    `;
  },
};

export const ResponsiveLayout: Story = {
  render: () => html`
    <div style="padding: 20px;">
      <h4>Responsive Layout Testing</h4>
      ${[200, 300, 400, 500].map(
        (width) => html`
          <div style="width: ${width}px; border: 1px solid var(--color-border); margin: 15px 0; padding: 10px;">
            <div style="font-size: 0.8em; color: var(--color-text-secondary); margin-bottom: 5px;">
              Container: ${width}px
            </div>
            <illthorn-status-indicators-lit
              .roundtime=${2}
              .casttime=${0}
              .stance="forward"
              .mindState="clear"
              .health=${85}
              .mana=${65}
              .stamina=${55}
              .spirit=${95}
              .compact=${width < 300}
              .showLabels=${width > 250}
            ></illthorn-status-indicators-lit>
          </div>
        `
      )}
    </div>
  `,
};