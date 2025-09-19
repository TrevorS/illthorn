import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { MockDataGenerator } from "../../../utils/mock-data";
import "./mini-compass.lit";

const meta: Meta = {
  title: "Input System/Mini Compass",
  component: "illthorn-mini-compass-lit",
  parameters: {
    docs: {
      description: {
        component: "Compact 3x3 compass for the input system status bar. Displays available movement directions in a minimal footprint.",
      },
    },
  },
  argTypes: {
    activeDirections: {
      control: { type: "check" },
      options: ["n", "ne", "e", "se", "s", "sw", "w", "nw", "up", "down", "out"],
      description: "Active directions to highlight on compass",
    },
    size: {
      control: { type: "radio" },
      options: ["small", "medium", "large"],
      description: "Size variant of the compass",
    },
    interactive: {
      control: "boolean",
      description: "Whether the compass responds to clicks",
    },
    disabled: {
      control: "boolean",
      description: "Whether the compass is disabled",
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    activeDirections: [],
    size: "medium",
    interactive: false,
    disabled: false,
  },
  render: (args) => html`
    <illthorn-mini-compass-lit
      .activeDirections=${args.activeDirections}
      .size=${args.size}
      .interactive=${args.interactive}
      .disabled=${args.disabled}
    ></illthorn-mini-compass-lit>
  `,
};

export const NoExits: Story = {
  args: {
    activeDirections: [],
  },
  render: (args) => html`
    <div style="padding: 20px;">
      <h4>Trapped Room (No Exits Available)</h4>
      <illthorn-mini-compass-lit .activeDirections=${args.activeDirections}></illthorn-mini-compass-lit>
    </div>
  `,
};

export const AllDirectionsActive: Story = {
  args: {
    activeDirections: ["n", "ne", "e", "se", "s", "sw", "w", "nw"],
  },
  render: (args) => html`
    <illthorn-mini-compass-lit .activeDirections=${args.activeDirections}></illthorn-mini-compass-lit>
  `,
};

export const CardinalOnly: Story = {
  args: {
    activeDirections: ["n", "e", "s", "w"],
  },
  render: (args) => html`
    <illthorn-mini-compass-lit .activeDirections=${args.activeDirections}></illthorn-mini-compass-lit>
  `,
};

export const WithVertical: Story = {
  args: {
    activeDirections: ["n", "s", "up", "down", "out"],
  },
  render: (args) => html`
    <div style="padding: 20px;">
      <h4>Multi-level Location with Special Exits</h4>
      <illthorn-mini-compass-lit .activeDirections=${args.activeDirections}></illthorn-mini-compass-lit>
    </div>
  `,
};

export const Interactive: Story = {
  args: {
    activeDirections: ["n", "e", "s", "w"],
    interactive: true,
  },
  render: (args) => html`
    <div style="padding: 20px;">
      <h4>Interactive Compass (Click to Navigate)</h4>
      <illthorn-mini-compass-lit
        .activeDirections=${args.activeDirections}
        .interactive=${args.interactive}
        @direction-clicked=${(e: CustomEvent) => {
          console.log("Direction clicked:", e.detail.direction);
          alert("Clicked direction: " + e.detail.direction);
        }}
      ></illthorn-mini-compass-lit>
    </div>
  `,
};

export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 30px; align-items: center; padding: 20px;">
      <div style="text-align: center;">
        <h4>Small</h4>
        <illthorn-mini-compass-lit
          size="small"
          .activeDirections=${["n", "e", "s", "w"]}
        ></illthorn-mini-compass-lit>
      </div>
      <div style="text-align: center;">
        <h4>Medium (Default)</h4>
        <illthorn-mini-compass-lit
          size="medium"
          .activeDirections=${["n", "e", "s", "w"]}
        ></illthorn-mini-compass-lit>
      </div>
      <div style="text-align: center;">
        <h4>Large</h4>
        <illthorn-mini-compass-lit
          size="large"
          .activeDirections=${["n", "e", "s", "w"]}
        ></illthorn-mini-compass-lit>
      </div>
    </div>
  `,
};

export const DisabledState: Story = {
  args: {
    activeDirections: ["n", "e", "s", "w"],
    disabled: true,
  },
  render: (args) => html`
    <div style="padding: 20px;">
      <h4>Disabled Compass</h4>
      <illthorn-mini-compass-lit
        .activeDirections=${args.activeDirections}
        .disabled=${args.disabled}
      ></illthorn-mini-compass-lit>
    </div>
  `,
};

export const SingleExit: Story = {
  args: {
    activeDirections: ["out"],
  },
  render: (args) => html`
    <div style="padding: 20px;">
      <h4>Single Exit Room</h4>
      <illthorn-mini-compass-lit .activeDirections=${args.activeDirections}></illthorn-mini-compass-lit>
    </div>
  `,
};

export const RandomScenarios: Story = {
  render: () => {
    const scenarios = [
      { name: "New Player", data: MockDataGenerator.scenarios.newPlayer() },
      { name: "Combat", data: MockDataGenerator.scenarios.combat() },
      { name: "Full Compass", data: MockDataGenerator.scenarios.fullCompass() },
      { name: "No Exits", data: MockDataGenerator.scenarios.noExits() },
    ];

    return html`
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; padding: 20px;">
        ${scenarios.map(
          (scenario) => html`
            <div style="text-align: center; border: 1px solid var(--color-border); padding: 15px; border-radius: 4px;">
              <h4>${scenario.name}</h4>
              <p style="font-size: 0.9em; color: var(--color-text-secondary); margin: 5px 0;">
                ${scenario.data.room.title}
              </p>
              <illthorn-mini-compass-lit
                .activeDirections=${scenario.data.navigation.exits}
              ></illthorn-mini-compass-lit>
            </div>
          `
        )}
      </div>
    `;
  },
};

export const StateTransitions: Story = {
  render: () => {
    let currentScenarioIndex = 0;
    const scenarios = [
      MockDataGenerator.scenarios.newPlayer(),
      MockDataGenerator.scenarios.combat(),
      MockDataGenerator.scenarios.fullCompass(),
      MockDataGenerator.scenarios.noExits(),
    ];

    const updateCompass = () => {
      const compass = document.querySelector("illthorn-mini-compass-lit") as any;
      if (compass) {
        currentScenarioIndex = (currentScenarioIndex + 1) % scenarios.length;
        compass.activeDirections = scenarios[currentScenarioIndex].navigation.exits;
      }
    };

    return html`
      <div style="padding: 20px; text-align: center;">
        <h4>Dynamic State Transitions</h4>
        <illthorn-mini-compass-lit
          .activeDirections=${scenarios[0].navigation.exits}
        ></illthorn-mini-compass-lit>
        <br />
        <button @click=${updateCompass} style="margin-top: 10px;">Change Room</button>
      </div>
    `;
  },
};