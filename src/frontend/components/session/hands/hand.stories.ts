import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./hand.lit";
import { StorybookGameData, StorybookSessionMock } from "../../../../../stories/mocks/index";

const meta: Meta = {
  title: "Session/Hands/Hand",
  component: "illthorn-hand-lit",
  parameters: {
    docs: {
      description: {
        component: "Displays the contents of a character's hand (left, right, or spell slot) with appropriate icons.",
      },
    },
  },
  argTypes: {
    session: { control: false },
    name: {
      control: "select",
      options: ["leftHand", "rightHand", "spell"],
      description: "The hand/slot name to display",
    },
  },
};

export default meta;
type Story = StoryObj;

export const LeftHandEmpty: Story = {
  args: {
    name: "leftHand",
  },
  render: (args) => {
    const session = StorybookSessionMock.create();
    return html`<illthorn-hand-lit .session=${session} name=${args.name}></illthorn-hand-lit>`;
  },
};

export const RightHandEmpty: Story = {
  args: {
    name: "rightHand",
  },
  render: (args) => {
    const session = StorybookSessionMock.create();
    return html`<illthorn-hand-lit .session=${session} name=${args.name}></illthorn-hand-lit>`;
  },
};

export const SpellSlotEmpty: Story = {
  args: {
    name: "spell",
  },
  render: (args) => {
    const session = StorybookSessionMock.create();
    return html`<illthorn-hand-lit .session=${session} name=${args.name}></illthorn-hand-lit>`;
  },
};

export const LeftHandWithSword: Story = {
  args: {
    name: "leftHand",
  },
  render: (args) => {
    const session = StorybookSessionMock.create();

    // Simulate hand contents update
    setTimeout(() => {
      const handData = StorybookGameData.createHand("left", "a gleaming steel sword");
      StorybookSessionMock.emitEvent(`metadata/${args.name}`, handData);
    }, 100);

    return html`<illthorn-hand-lit .session=${session} name=${args.name}></illthorn-hand-lit>`;
  },
};

export const RightHandWithShield: Story = {
  args: {
    name: "rightHand",
  },
  render: (args) => {
    const session = StorybookSessionMock.create();

    setTimeout(() => {
      StorybookSessionMock.emitEvent(`metadata/${args.name}`, {
        children: [{ text: "a sturdy bronze shield" }],
      });
    }, 100);

    return html`<illthorn-hand-lit .session=${session} name=${args.name}></illthorn-hand-lit>`;
  },
};

export const SpellSlotActive: Story = {
  args: {
    name: "spell",
  },
  render: (args) => {
    const session = StorybookSessionMock.create();

    setTimeout(() => {
      StorybookSessionMock.emitEvent(`metadata/${args.name}`, {
        children: [{ text: "Spirit Warding I" }],
      });
    }, 100);

    return html`<illthorn-hand-lit .session=${session} name=${args.name}></illthorn-hand-lit>`;
  },
};

export const AllHandsTogether: Story = {
  render: () => {
    const session = StorybookSessionMock.create();

    // Simulate different content for each hand
    setTimeout(() => {
      StorybookSessionMock.emitEvent("metadata/leftHand", {
        children: [{ text: "a crystal-tipped staff" }],
      });
      StorybookSessionMock.emitEvent("metadata/rightHand", {
        children: [{ text: "a small leather pouch" }],
      });
      StorybookSessionMock.emitEvent("metadata/spell", {
        children: [{ text: "Major Spiritual Protection" }],
      });
    }, 100);

    return html`
      <div style="display: flex; gap: 1rem; background: var(--sl-color-neutral-100); padding: 1rem; border-radius: 0.5rem;">
        <illthorn-hand-lit .session=${session} name="leftHand"></illthorn-hand-lit>
        <illthorn-hand-lit .session=${session} name="rightHand"></illthorn-hand-lit>
        <illthorn-hand-lit .session=${session} name="spell"></illthorn-hand-lit>
      </div>
    `;
  },
};
