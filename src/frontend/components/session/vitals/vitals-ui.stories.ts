import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./vitals-ui.lit";

const meta: Meta = {
  title: "Session/Vitals",
  component: "illthorn-vitals-ui",
  parameters: {
    docs: {
      description: {
        component: "Vitals UI component for displaying character vital statistics using the container/presentational pattern.",
      },
    },
  },
  argTypes: {
    healthData: {
      control: "object",
      description: "Health vital data with label, value, and percent",
    },
    manaData: {
      control: "object",
      description: "Mana vital data with label, value, and percent",
    },
    staminaData: {
      control: "object",
      description: "Stamina vital data with label, value, and percent",
    },
    spiritData: {
      control: "object",
      description: "Spirit vital data with label, value, and percent",
    },
    mindData: {
      control: "object",
      description: "Mind vital data with label, value, and percent",
    },
    stanceData: {
      control: "object",
      description: "Stance vital data with label and value (text only)",
    },
    encumbranceData: {
      control: "object",
      description: "Encumbrance vital data with label and value (text only)",
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    healthData: { label: "health", value: "50/100", percent: 50 },
    manaData: { label: "mana", value: "40/80", percent: 50 },
    staminaData: { label: "stamina", value: "45/90", percent: 50 },
    spiritData: { label: "spirit", value: "50/100", percent: 50 },
    mindData: { label: "mind", value: "focused", percent: 75 },
    stanceData: { label: "stance", value: "offensive", percent: 0 },
    encumbranceData: { label: "encumbrance", value: "none", percent: 0 },
  },
  render: (args) => html`
    <div style="width: 250px; background: #1e293b; padding: 1rem; border-radius: 0.5rem;">
      <illthorn-vitals-ui
        .healthData=${args.healthData}
        .manaData=${args.manaData}
        .staminaData=${args.staminaData}
        .spiritData=${args.spiritData}
        .mindData=${args.mindData}
        .stanceData=${args.stanceData}
        .encumbranceData=${args.encumbranceData}>
      </illthorn-vitals-ui>
    </div>
  `,
};

export const FullHealth: Story = {
  args: {
    healthData: { label: "health", value: "100/100", percent: 100 },
    manaData: { label: "mana", value: "80/80", percent: 100 },
    staminaData: { label: "stamina", value: "90/90", percent: 100 },
    spiritData: { label: "spirit", value: "100/100", percent: 100 },
    mindData: { label: "mind", value: "clear as a bell", percent: 100 },
    stanceData: { label: "stance", value: "offensive", percent: 0 },
    encumbranceData: { label: "encumbrance", value: "none", percent: 0 },
  },
  render: (args) => html`
    <div style="width: 250px; background: #1e293b; padding: 1rem; border-radius: 0.5rem;">
      <illthorn-vitals-ui
        .healthData=${args.healthData}
        .manaData=${args.manaData}
        .staminaData=${args.staminaData}
        .spiritData=${args.spiritData}
        .mindData=${args.mindData}
        .stanceData=${args.stanceData}
        .encumbranceData=${args.encumbranceData}>
      </illthorn-vitals-ui>
    </div>
  `,
};

export const CriticalHealth: Story = {
  args: {
    healthData: { label: "health", value: "15/100", percent: 15 },
    manaData: { label: "mana", value: "5/80", percent: 6 },
    staminaData: { label: "stamina", value: "20/90", percent: 22 },
    spiritData: { label: "spirit", value: "85/100", percent: 85 },
    mindData: { label: "mind", value: "muddled", percent: 25 },
    stanceData: { label: "stance", value: "defensive", percent: 0 },
    encumbranceData: { label: "encumbrance", value: "heavy", percent: 0 },
  },
  render: (args) => html`
    <div style="width: 250px; background: #1e293b; padding: 1rem; border-radius: 0.5rem;">
      <illthorn-vitals-ui
        .healthData=${args.healthData}
        .manaData=${args.manaData}
        .staminaData=${args.staminaData}
        .spiritData=${args.spiritData}
        .mindData=${args.mindData}
        .stanceData=${args.stanceData}
        .encumbranceData=${args.encumbranceData}>
      </illthorn-vitals-ui>
    </div>
  `,
};

export const IndeterminateStates: Story = {
  render: () => html`
    <div style="width: 250px; background: #1e293b; padding: 1rem; border-radius: 0.5rem;">
      <p style="color: white; margin: 0 0 0.5rem 0; font-size: 0.9rem;">
        Mixed states with some indeterminate vitals
      </p>
      <illthorn-vitals-ui
        .healthData=${{ label: "health", value: "85/100", percent: 85 }}
        .manaData=${{ label: "mana", value: undefined, percent: undefined }}
        .staminaData=${{ label: "stamina", value: "70/90", percent: 78 }}
        .spiritData=${{ label: "spirit", value: undefined, percent: undefined }}
        .mindData=${{ label: "mind", value: undefined, percent: undefined }}
        .stanceData=${{ label: "stance", value: "offensive", percent: 0 }}
        .encumbranceData=${{ label: "encumbrance", value: "none", percent: 0 }}>
      </illthorn-vitals-ui>
    </div>
  `,
};
