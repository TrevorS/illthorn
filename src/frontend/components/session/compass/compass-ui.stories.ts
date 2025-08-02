import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./compass-ui.lit";

const meta: Meta = {
  title: "Session/Compass",
  component: "illthorn-compass-ui",
  parameters: {
    docs: {
      description: {
        component: "Pure UI compass component with reliable prop-based rendering - no event timing issues.",
      },
    },
  },
  argTypes: {
    activeDirs: {
      control: "check",
      options: ["n", "s", "e", "w", "ne", "nw", "se", "sw", "up", "down", "out"],
      description: "Active directions to highlight on compass",
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    activeDirs: [],
  },
  render: (args) => html`<illthorn-compass-ui .activeDirs=${args.activeDirs}></illthorn-compass-ui>`,
};

export const NoExits: Story = {
  args: {
    activeDirs: [],
  },
  render: (args) => html`<illthorn-compass-ui .activeDirs=${args.activeDirs}></illthorn-compass-ui>`,
};

export const BasicExits: Story = {
  args: {
    activeDirs: ["n", "s"],
  },
  render: (args) => html`<illthorn-compass-ui .activeDirs=${args.activeDirs}></illthorn-compass-ui>`,
};

export const FullCompass: Story = {
  args: {
    activeDirs: ["n", "s", "e", "w", "ne", "nw", "se", "sw"],
  },
  render: (args) => html`<illthorn-compass-ui .activeDirs=${args.activeDirs}></illthorn-compass-ui>`,
};

export const WithSpecialExits: Story = {
  args: {
    activeDirs: ["n", "up", "out"],
  },
  render: (args) => html`<illthorn-compass-ui .activeDirs=${args.activeDirs}></illthorn-compass-ui>`,
};

export const IndoorLocation: Story = {
  args: {
    activeDirs: ["n", "s", "e", "w", "up", "down"],
  },
  render: (args) => html`<illthorn-compass-ui .activeDirs=${args.activeDirs}></illthorn-compass-ui>`,
};

export const SingleExit: Story = {
  args: {
    activeDirs: ["out"],
  },
  render: (args) => html`<illthorn-compass-ui .activeDirs=${args.activeDirs}></illthorn-compass-ui>`,
};

export const TwoExits: Story = {
  args: {
    activeDirs: ["n", "s"],
  },
  render: (args) => html`<illthorn-compass-ui .activeDirs=${args.activeDirs}></illthorn-compass-ui>`,
};
