import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./compass-rose-ui.lit";

const meta: Meta = {
  title: "Session/Compass Rose",
  component: "illthorn-compass-rose-ui",
  parameters: {
    docs: {
      description: {
        component: "Modern radial compass rose with horizontal layout - special exits on left, 8-directional compass on right, room info below.",
      },
    },
  },
  argTypes: {
    activeDirs: {
      control: "check",
      options: ["n", "s", "e", "w", "ne", "nw", "se", "sw", "up", "down", "out"],
      description: "Active directions to highlight on compass",
    },
    roomId: {
      control: "text",
      description: "Room ID number",
    },
    roomTitle: {
      control: "text",
      description: "Room title/name",
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    activeDirs: [],
    roomId: "",
    roomTitle: "",
  },
  render: (args) => html`
    <illthorn-compass-rose-ui
      .activeDirs=${args.activeDirs}
      .roomId=${args.roomId}
      .roomTitle=${args.roomTitle}
    ></illthorn-compass-rose-ui>
  `,
};

export const NoExits: Story = {
  args: {
    activeDirs: [],
    roomId: "95157",
    roomTitle: "Monastery, Gallery",
  },
  render: (args) => html`
    <illthorn-compass-rose-ui
      .activeDirs=${args.activeDirs}
      .roomId=${args.roomId}
      .roomTitle=${args.roomTitle}
    ></illthorn-compass-rose-ui>
  `,
};

export const BasicCardinal: Story = {
  args: {
    activeDirs: ["n", "s", "e", "w"],
    roomId: "12345",
    roomTitle: "Town Square",
  },
  render: (args) => html`
    <illthorn-compass-rose-ui
      .activeDirs=${args.activeDirs}
      .roomId=${args.roomId}
      .roomTitle=${args.roomTitle}
    ></illthorn-compass-rose-ui>
  `,
};

export const FullCompass: Story = {
  args: {
    activeDirs: ["n", "s", "e", "w", "ne", "nw", "se", "sw"],
    roomId: "54321",
    roomTitle: "Crossroads",
  },
  render: (args) => html`
    <illthorn-compass-rose-ui
      .activeDirs=${args.activeDirs}
      .roomId=${args.roomId}
      .roomTitle=${args.roomTitle}
    ></illthorn-compass-rose-ui>
  `,
};

export const WithSpecialExits: Story = {
  args: {
    activeDirs: ["n", "s", "up", "down", "out"],
    roomId: "99999",
    roomTitle: "Stairwell",
  },
  render: (args) => html`
    <illthorn-compass-rose-ui
      .activeDirs=${args.activeDirs}
      .roomId=${args.roomId}
      .roomTitle=${args.roomTitle}
    ></illthorn-compass-rose-ui>
  `,
};

export const AllDirections: Story = {
  args: {
    activeDirs: ["n", "s", "e", "w", "ne", "nw", "se", "sw", "up", "down", "out"],
    roomId: "11111",
    roomTitle: "Central Hub",
  },
  render: (args) => html`
    <illthorn-compass-rose-ui
      .activeDirs=${args.activeDirs}
      .roomId=${args.roomId}
      .roomTitle=${args.roomTitle}
    ></illthorn-compass-rose-ui>
  `,
};

export const LongRoomName: Story = {
  args: {
    activeDirs: ["n", "e", "w"],
    roomId: "95157",
    roomTitle: "The Grand Courtyard of the Monastery, Eastern Wing and Gallery of Ancient Artifacts",
  },
  render: (args) => html`
    <illthorn-compass-rose-ui
      .activeDirs=${args.activeDirs}
      .roomId=${args.roomId}
      .roomTitle=${args.roomTitle}
    ></illthorn-compass-rose-ui>
  `,
};

export const DiagonalsOnly: Story = {
  args: {
    activeDirs: ["ne", "se", "sw", "nw"],
    roomId: "22222",
    roomTitle: "Diagonal Path",
  },
  render: (args) => html`
    <illthorn-compass-rose-ui
      .activeDirs=${args.activeDirs}
      .roomId=${args.roomId}
      .roomTitle=${args.roomTitle}
    ></illthorn-compass-rose-ui>
  `,
};

export const SingleExit: Story = {
  args: {
    activeDirs: ["out"],
    roomId: "33333",
    roomTitle: "Dead End",
  },
  render: (args) => html`
    <illthorn-compass-rose-ui
      .activeDirs=${args.activeDirs}
      .roomId=${args.roomId}
      .roomTitle=${args.roomTitle}
    ></illthorn-compass-rose-ui>
  `,
};

export const NorthSouth: Story = {
  args: {
    activeDirs: ["n", "s"],
    roomId: "44444",
    roomTitle: "Hallway",
  },
  render: (args) => html`
    <illthorn-compass-rose-ui
      .activeDirs=${args.activeDirs}
      .roomId=${args.roomId}
      .roomTitle=${args.roomTitle}
    ></illthorn-compass-rose-ui>
  `,
};
