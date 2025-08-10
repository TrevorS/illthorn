import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./vital-stat.lit";

const meta: Meta = {
  title: "Session/Vitals/VitalStat",
  component: "illthorn-vital-stat",
  parameters: {
    docs: {
      description: {
        component: "VitalStat component displays vital statistics with progress bars, threshold-based styling, and support for indeterminate states.",
      },
    },
  },
  argTypes: {
    label: {
      control: "text",
      description: "The label for the vital stat (e.g., 'health', 'mana', 'stamina')",
    },
    value: {
      control: "text",
      description: "The display value (e.g., '50/100', '45/80')",
    },
    percent: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "Percentage value for progress bar (0-100)",
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    label: "health",
    value: "50/100",
    percent: 50,
  },
  render: (args) => html`
    <div style="width: 200px; background: #1e293b; padding: 1rem; border-radius: 0.5rem;">
      <illthorn-vital-stat
        label="${args.label}"
        .value="${args.value}"
        .percent="${args.percent}">
      </illthorn-vital-stat>
    </div>
  `,
};

export const HealthFull: Story = {
  args: {
    label: "health",
    value: "100/100",
    percent: 100,
  },
  render: (args) => html`
    <div style="width: 200px; background: #1e293b; padding: 1rem; border-radius: 0.5rem;">
      <illthorn-vital-stat
        label="${args.label}"
        .value="${args.value}"
        .percent="${args.percent}">
      </illthorn-vital-stat>
    </div>
  `,
};

export const HealthCritical: Story = {
  args: {
    label: "health",
    value: "15/100",
    percent: 15,
  },
  render: (args) => html`
    <div style="width: 200px; background: #1e293b; padding: 1rem; border-radius: 0.5rem;">
      <illthorn-vital-stat
        label="${args.label}"
        .value="${args.value}"
        .percent="${args.percent}">
      </illthorn-vital-stat>
    </div>
  `,
};

export const Indeterminate: Story = {
  render: () => html`
    <div style="width: 200px; background: #1e293b; padding: 1rem; border-radius: 0.5rem;">
      <p style="color: white; margin: 0 0 0.5rem 0; font-size: 0.9rem;">
        Indeterminate state (undefined values)
      </p>
      <illthorn-vital-stat
        label="spirit"
        .value=${undefined}
        .percent=${undefined}>
      </illthorn-vital-stat>
    </div>
  `,
};

export const Interactive: Story = {
  args: {
    label: "health",
    value: "75/100",
    percent: 75,
  },
  render: (args) => html`
    <div style="width: 300px; background: #1e293b; padding: 1rem; border-radius: 0.5rem;">
      <h3 style="margin: 0 0 1rem 0; color: white; font-size: 1.1rem;">Interactive VitalStat</h3>
      <p style="color: rgba(255,255,255,0.7); font-size: 0.9rem; margin: 0 0 1rem 0;">
        Use the controls below to explore different states
      </p>
      <illthorn-vital-stat
        label="${args.label}"
        .value="${args.value}"
        .percent="${args.percent}">
      </illthorn-vital-stat>
      <div style="margin-top: 1rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.2);">
        <p style="color: rgba(255,255,255,0.6); font-size: 0.8rem; margin: 0;">
          Try different vital types: health, mana, stamina, spirit, mind<br>
          Try different percentages: 0-32 (low/red), 33-65 (medium), 66-100 (high)
        </p>
      </div>
    </div>
  `,
};
