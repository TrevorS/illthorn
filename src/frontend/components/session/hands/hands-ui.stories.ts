import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./hands-ui.lit";

const meta: Meta = {
  title: "Session/Hands",
  component: "illthorn-hands-ui",
  parameters: {
    docs: {
      description: {
        component: "Presentational UI component for displaying left, right, and spell hand components without session integration.",
      },
    },
  },
  argTypes: {
    leftContent: { control: "text" },
    rightContent: { control: "text" },
    spellContent: { control: "text" },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    return html`<illthorn-hands-ui></illthorn-hands-ui>`;
  },
};

export const EmptyHands: Story = {
  render: () => {
    return html`<illthorn-hands-ui
      leftContent="None"
      rightContent="None" 
      spellContent="None"
    ></illthorn-hands-ui>`;
  },
};

export const WarriorSetup: Story = {
  render: () => {
    return html`<illthorn-hands-ui
      leftContent="a gleaming steel sword"
      rightContent="a sturdy bronze shield"
      spellContent="None"
    ></illthorn-hands-ui>`;
  },
};

export const MageSetup: Story = {
  render: () => {
    return html`<illthorn-hands-ui
      leftContent="a crystal-tipped staff"
      rightContent="a small leather pouch"
      spellContent="Major Spiritual Protection"
    ></illthorn-hands-ui>`;
  },
};

export const RogueSetup: Story = {
  render: () => {
    return html`<illthorn-hands-ui
      leftContent="a razor-sharp dagger"
      rightContent="a lockpicking kit"
      spellContent="Invisibility"
    ></illthorn-hands-ui>`;
  },
};

export const LongItemNames: Story = {
  render: () => {
    return html`<illthorn-hands-ui
      leftContent="an ancient dwarven battle-axe with intricate runes"
      rightContent="a magnificent tower shield emblazoned with a golden griffin"
      spellContent="Spiritual Intervention of the Ancient Masters"
    ></illthorn-hands-ui>`;
  },
};

export const MixedStates: Story = {
  render: () => {
    return html`<illthorn-hands-ui
      leftContent="a polished silver wand"
      rightContent="None"
      spellContent="Spirit Warding II"
    ></illthorn-hands-ui>`;
  },
};
