import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./injury-item.lit";

const meta: Meta = {
  title: "Session/Injuries/Individual",
  component: "illthorn-injury-item",
  parameters: {
    docs: {
      description: {
        component: "Individual injury item component that handles single and paired injury display with severity symbols and colors.",
      },
    },
  },
  argTypes: {
    displayName: {
      control: "text",
      description: "Display name of the body part (e.g., 'head', 'arms', 'r.arm')",
    },
    severity: {
      control: { type: "select" },
      options: [0, 1, 2, 3],
      description: "Injury severity: 0=healthy, 1=minor(*), 2=moderate(#), 3=severe(@)",
    },
    paired: {
      control: "boolean",
      description: "Whether this is a paired injury (shows L/R indicators)",
    },
    leftSeverity: {
      control: { type: "select" },
      options: [0, 1, 2, 3],
      description: "Left side severity for paired injuries",
      if: { arg: "paired", eq: true },
    },
    rightSeverity: {
      control: { type: "select" },
      options: [0, 1, 2, 3],
      description: "Right side severity for paired injuries",
      if: { arg: "paired", eq: true },
    },
  },
};

export default meta;
type Story = StoryObj;

export const HealthyPart: Story = {
  args: {
    displayName: "head",
    severity: 0,
    paired: false,
  },
  render: (args) => html`
    <div style="width: 200px; background: #1e293b; padding: 1rem; border-radius: 0.5rem; font-family: monospace; font-size: 11px;">
      <illthorn-injury-item
        .displayName=${args.displayName}
        .severity=${args.severity}
        .paired=${args.paired}
        .leftSeverity=${args.leftSeverity}
        .rightSeverity=${args.rightSeverity}>
      </illthorn-injury-item>
    </div>
  `,
};

export const MinorInjury: Story = {
  args: {
    displayName: "chest",
    severity: 1,
    paired: false,
  },
  render: (args) => html`
    <div style="width: 200px; background: #1e293b; padding: 1rem; border-radius: 0.5rem; font-family: monospace; font-size: 11px;">
      <illthorn-injury-item
        .displayName=${args.displayName}
        .severity=${args.severity}
        .paired=${args.paired}
        .leftSeverity=${args.leftSeverity}
        .rightSeverity=${args.rightSeverity}>
      </illthorn-injury-item>
    </div>
  `,
};

export const ModerateInjury: Story = {
  args: {
    displayName: "abdomen",
    severity: 2,
    paired: false,
  },
  render: (args) => html`
    <div style="width: 200px; background: #1e293b; padding: 1rem; border-radius: 0.5rem; font-family: monospace; font-size: 11px;">
      <illthorn-injury-item
        .displayName=${args.displayName}
        .severity=${args.severity}
        .paired=${args.paired}
        .leftSeverity=${args.leftSeverity}
        .rightSeverity=${args.rightSeverity}>
      </illthorn-injury-item>
    </div>
  `,
};

export const SevereInjury: Story = {
  args: {
    displayName: "back",
    severity: 3,
    paired: false,
  },
  render: (args) => html`
    <div style="width: 200px; background: #1e293b; padding: 1rem; border-radius: 0.5rem; font-family: monospace; font-size: 11px;">
      <illthorn-injury-item
        .displayName=${args.displayName}
        .severity=${args.severity}
        .paired=${args.paired}
        .leftSeverity=${args.leftSeverity}
        .rightSeverity=${args.rightSeverity}>
      </illthorn-injury-item>
    </div>
  `,
};

export const PairedArmsEqual: Story = {
  args: {
    displayName: "arms",
    severity: 2,
    paired: true,
    leftSeverity: 2,
    rightSeverity: 2,
  },
  render: (args) => html`
    <div style="width: 200px; background: #1e293b; padding: 1rem; border-radius: 0.5rem; font-family: monospace; font-size: 11px;">
      <illthorn-injury-item
        .displayName=${args.displayName}
        .severity=${args.severity}
        .paired=${args.paired}
        .leftSeverity=${args.leftSeverity}
        .rightSeverity=${args.rightSeverity}>
      </illthorn-injury-item>
    </div>
  `,
};

export const PairedArmsDifferent: Story = {
  args: {
    displayName: "arms",
    severity: 3,
    paired: true,
    leftSeverity: 1,
    rightSeverity: 3,
  },
  render: (args) => html`
    <div style="width: 200px; background: #1e293b; padding: 1rem; border-radius: 0.5rem; font-family: monospace; font-size: 11px;">
      <p style="color: white; margin: 0 0 0.5rem 0; font-size: 0.9rem;">
        Different severity on each side
      </p>
      <illthorn-injury-item
        .displayName=${args.displayName}
        .severity=${args.severity}
        .paired=${args.paired}
        .leftSeverity=${args.leftSeverity}
        .rightSeverity=${args.rightSeverity}>
      </illthorn-injury-item>
    </div>
  `,
};

export const PairedHandsOneHealthy: Story = {
  args: {
    displayName: "hands",
    severity: 2,
    paired: true,
    leftSeverity: 0,
    rightSeverity: 2,
  },
  render: (args) => html`
    <div style="width: 200px; background: #1e293b; padding: 1rem; border-radius: 0.5rem; font-family: monospace; font-size: 11px;">
      <p style="color: white; margin: 0 0 0.5rem 0; font-size: 0.9rem;">
        One side healthy, one injured
      </p>
      <illthorn-injury-item
        .displayName=${args.displayName}
        .severity=${args.severity}
        .paired=${args.paired}
        .leftSeverity=${args.leftSeverity}
        .rightSeverity=${args.rightSeverity}>
      </illthorn-injury-item>
    </div>
  `,
};

export const PairedLegsMaxDamage: Story = {
  args: {
    displayName: "legs",
    severity: 3,
    paired: true,
    leftSeverity: 3,
    rightSeverity: 3,
  },
  render: (args) => html`
    <div style="width: 200px; background: #1e293b; padding: 1rem; border-radius: 0.5rem; font-family: monospace; font-size: 11px;">
      <p style="color: white; margin: 0 0 0.5rem 0; font-size: 0.9rem;">
        Maximum damage on both sides
      </p>
      <illthorn-injury-item
        .displayName=${args.displayName}
        .severity=${args.severity}
        .paired=${args.paired}
        .leftSeverity=${args.leftSeverity}
        .rightSeverity=${args.rightSeverity}>
      </illthorn-injury-item>
    </div>
  `,
};

export const PairedEyesMinor: Story = {
  args: {
    displayName: "eyes",
    severity: 1,
    paired: true,
    leftSeverity: 1,
    rightSeverity: 0,
  },
  render: (args) => html`
    <div style="width: 200px; background: #1e293b; padding: 1rem; border-radius: 0.5rem; font-family: monospace; font-size: 11px;">
      <p style="color: white; margin: 0 0 0.5rem 0; font-size: 0.9rem;">
        Eye injury (one side affected)
      </p>
      <illthorn-injury-item
        .displayName=${args.displayName}
        .severity=${args.severity}
        .paired=${args.paired}
        .leftSeverity=${args.leftSeverity}
        .rightSeverity=${args.rightSeverity}>
      </illthorn-injury-item>
    </div>
  `,
};

export const SingleLimbInjuries: Story = {
  render: () => html`
    <div style="width: 200px; background: #1e293b; padding: 1rem; border-radius: 0.5rem; font-family: monospace; font-size: 11px;">
      <p style="color: white; margin: 0 0 0.5rem 0; font-size: 0.9rem;">
        Individual limb injuries (not paired)
      </p>
      <div style="display: flex; flex-direction: column; gap: 2px;">
        <illthorn-injury-item displayName="r.arm" .severity=${1} .paired=${false}></illthorn-injury-item>
        <illthorn-injury-item displayName="l.hand" .severity=${2} .paired=${false}></illthorn-injury-item>
        <illthorn-injury-item displayName="r.leg" .severity=${3} .paired=${false}></illthorn-injury-item>
        <illthorn-injury-item displayName="l.eye" .severity=${1} .paired=${false}></illthorn-injury-item>
      </div>
    </div>
  `,
};

export const SeverityComparison: Story = {
  render: () => html`
    <div style="width: 200px; background: #1e293b; padding: 1rem; border-radius: 0.5rem; font-family: monospace; font-size: 11px;">
      <p style="color: white; margin: 0 0 0.5rem 0; font-size: 0.9rem;">
        All severity levels on same body part
      </p>
      <div style="display: flex; flex-direction: column; gap: 2px;">
        <illthorn-injury-item displayName="head" .severity=${0} .paired=${false}></illthorn-injury-item>
        <illthorn-injury-item displayName="head" .severity=${1} .paired=${false}></illthorn-injury-item>
        <illthorn-injury-item displayName="head" .severity=${2} .paired=${false}></illthorn-injury-item>
        <illthorn-injury-item displayName="head" .severity=${3} .paired=${false}></illthorn-injury-item>
      </div>
    </div>
  `,
};
