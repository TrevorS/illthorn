import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./injuries-ui.lit";
import type { ProcessedInjury } from "./injuries-ui.lit";

const meta: Meta = {
  title: "Session/Injuries",
  component: "illthorn-injuries-ui",
  parameters: {
    docs: {
      description: {
        component: "Injuries UI component for displaying character wounds using the container/presentational pattern.",
      },
    },
  },
  argTypes: {
    injuries: {
      control: "object",
      description: "Array of processed injury data to display",
    },
  },
};

export default meta;
type Story = StoryObj;

// Helper template that simulates the panel wrapper from session-layout
const renderWithPanel = (args: Record<string, unknown>, description?: string) => html`
  <div style="width: 200px; background: #1e293b; padding: 1rem; border-radius: 0.5rem;">
    ${description ? html`<p style="color: white; margin: 0 0 0.5rem 0; font-size: 0.9rem;">${description}</p>` : ""}
    <div style="background: var(--color-background-secondary, #2a2a2a); border: 1px solid var(--color-border, #444); padding: 8px; font-family: monospace; font-size: 11px;">
      <div style="background: var(--color-surface, #333); color: var(--color-text-secondary, #aaa); text-align: center; text-transform: uppercase; letter-spacing: 1px; padding: 4px 8px; border-bottom: 1px solid var(--color-border, #444); margin: -8px -8px 8px -8px;">INJURIES</div>
      <illthorn-injuries-ui .injuries=${args.injuries}></illthorn-injuries-ui>
    </div>
  </div>
`;

export const Healthy: Story = {
  args: {
    injuries: [],
  },
  render: (args) => renderWithPanel(args),
};

export const SingleInjuries: Story = {
  args: {
    injuries: [
      {
        displayName: "head",
        severity: 2,
        paired: false,
      },
      {
        displayName: "chest",
        severity: 1,
        paired: false,
      },
      {
        displayName: "abdomen",
        severity: 3,
        paired: false,
      },
    ] as Array<ProcessedInjury>,
  },
  render: (args) => renderWithPanel(args),
};

export const PairedInjuries: Story = {
  args: {
    injuries: [
      {
        displayName: "arms",
        severity: 2,
        paired: true,
        leftSeverity: 1,
        rightSeverity: 2,
      },
      {
        displayName: "hands",
        severity: 3,
        paired: true,
        leftSeverity: 3,
        rightSeverity: 0,
      },
      {
        displayName: "legs",
        severity: 1,
        paired: true,
        leftSeverity: 0,
        rightSeverity: 1,
      },
    ] as Array<ProcessedInjury>,
  },
  render: (args) => renderWithPanel(args),
};

export const MixedInjuries: Story = {
  args: {
    injuries: [
      {
        displayName: "head",
        severity: 2,
        paired: false,
      },
      {
        displayName: "neck",
        severity: 1,
        paired: false,
      },
      {
        displayName: "arms",
        severity: 3,
        paired: true,
        leftSeverity: 2,
        rightSeverity: 3,
      },
      {
        displayName: "chest",
        severity: 2,
        paired: false,
      },
      {
        displayName: "hands",
        severity: 1,
        paired: true,
        leftSeverity: 1,
        rightSeverity: 0,
      },
      {
        displayName: "legs",
        severity: 2,
        paired: true,
        leftSeverity: 2,
        rightSeverity: 2,
      },
    ] as Array<ProcessedInjury>,
  },
  render: (args) => renderWithPanel(args),
};

export const SevereBattleDamage: Story = {
  args: {
    injuries: [
      {
        displayName: "head",
        severity: 3,
        paired: false,
      },
      {
        displayName: "neck",
        severity: 2,
        paired: false,
      },
      {
        displayName: "eyes",
        severity: 2,
        paired: true,
        leftSeverity: 1,
        rightSeverity: 2,
      },
      {
        displayName: "chest",
        severity: 3,
        paired: false,
      },
      {
        displayName: "abdomen",
        severity: 2,
        paired: false,
      },
      {
        displayName: "back",
        severity: 1,
        paired: false,
      },
      {
        displayName: "arms",
        severity: 3,
        paired: true,
        leftSeverity: 3,
        rightSeverity: 3,
      },
      {
        displayName: "hands",
        severity: 2,
        paired: true,
        leftSeverity: 2,
        rightSeverity: 1,
      },
      {
        displayName: "legs",
        severity: 3,
        paired: true,
        leftSeverity: 3,
        rightSeverity: 2,
      },
      {
        displayName: "nerves",
        severity: 1,
        paired: false,
      },
    ] as Array<ProcessedInjury>,
  },
  render: (args) => renderWithPanel(args, "Severe battle damage with mixed injury types"),
};

export const MinorScrapes: Story = {
  args: {
    injuries: [
      {
        displayName: "r.arm",
        severity: 1,
        paired: false,
      },
      {
        displayName: "l.hand",
        severity: 1,
        paired: false,
      },
      {
        displayName: "r.leg",
        severity: 1,
        paired: false,
      },
    ] as Array<ProcessedInjury>,
  },
  render: (args) => renderWithPanel(args, "Minor scrapes on individual limbs"),
};
