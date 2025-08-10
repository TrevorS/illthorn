import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./vital-text.lit";

const meta: Meta = {
  title: "Session/Vitals/VitalText",
  component: "illthorn-vital-text",
  parameters: {
    docs: {
      description: {
        component:
          "VitalText component displays text-only vital statistics without progress bars. Used for stance, encumbrance, level, and other vitals that don't need percentage display.",
      },
    },
  },
  argTypes: {
    label: {
      control: "text",
      description: "The label for the vital stat (e.g., 'stance', 'encumbrance', 'level')",
    },
    value: {
      control: "text",
      description: "The display value (e.g., 'defensive', 'light', '25')",
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    label: "stance",
    value: "defensive",
  },
  render: (args) => html`
    <div style="width: 200px; background: #1e293b; padding: 1rem; border-radius: 0.5rem;">
      <illthorn-vital-text
        label="${args.label}"
        value="${args.value}">
      </illthorn-vital-text>
    </div>
  `,
};

export const StanceOffensive: Story = {
  args: {
    label: "stance",
    value: "offensive",
  },
  render: (args) => html`
    <div style="width: 200px; background: #1e293b; padding: 1rem; border-radius: 0.5rem;">
      <illthorn-vital-text
        label="${args.label}"
        value="${args.value}">
      </illthorn-vital-text>
    </div>
  `,
};

export const EncumbranceNone: Story = {
  args: {
    label: "encumbrance",
    value: "none",
  },
  render: (args) => html`
    <div style="width: 200px; background: #1e293b; padding: 1rem; border-radius: 0.5rem;">
      <p style="color: white; margin: 0 0 0.5rem 0; font-size: 0.9rem;">
        Inverted vital (lower = better)
      </p>
      <illthorn-vital-text
        label="${args.label}"
        value="${args.value}">
      </illthorn-vital-text>
    </div>
  `,
};

export const Interactive: Story = {
  args: {
    label: "stance",
    value: "defensive",
  },
  render: (args) => html`
    <div style="width: 300px; background: #1e293b; padding: 1rem; border-radius: 0.5rem;">
      <h3 style="margin: 0 0 1rem 0; color: white; font-size: 1.1rem;">Interactive VitalText</h3>
      <p style="color: rgba(255,255,255,0.7); font-size: 0.9rem; margin: 0 0 1rem 0;">
        Use the controls below to explore different text vitals
      </p>
      <illthorn-vital-text
        label="${args.label}"
        value="${args.value}">
      </illthorn-vital-text>
      <div style="margin-top: 1rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.2);">
        <p style="color: rgba(255,255,255,0.6); font-size: 0.8rem; margin: 0;">
          Try labels: stance, encumbrance, level, experience, silver<br>
          Try stance values: offensive, defensive, guarded, neutral<br>
          Try encumbrance values: none, light, moderate, heavy, severe
        </p>
      </div>
    </div>
  `,
};
