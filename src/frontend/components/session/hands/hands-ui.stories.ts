import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./hands-ui.lit";
import "../panel.lit";

const meta: Meta = {
  title: "Session/Hands",
  component: "illthorn-hands-ui",
  parameters: {
    docs: {
      description: {
        component: "Hands component for displaying left hand, right hand, and spell preparation status within an illthorn-panel container.",
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
    return html`
      <div style="width: 14em; background: var(--color-background); padding: 1em;">
        <illthorn-panel title="hands" .open=${true}>
          <illthorn-hands-ui></illthorn-hands-ui>
        </illthorn-panel>
      </div>
    `;
  },
};

export const EmptyHands: Story = {
  render: () => {
    return html`
      <div style="width: 14em; background: var(--color-background); padding: 1em;">
        <illthorn-panel title="hands" .open=${true}>
          <illthorn-hands-ui
            leftContent="Empty"
            rightContent="Empty" 
            spellContent="None"
          ></illthorn-hands-ui>
        </illthorn-panel>
      </div>
    `;
  },
};

export const WarriorSetup: Story = {
  render: () => {
    return html`
      <div style="width: 14em; background: var(--color-background); padding: 1em;">
        <illthorn-panel title="hands" .open=${true}>
          <illthorn-hands-ui
            leftContent="a gleaming steel sword"
            rightContent="a sturdy bronze shield"
            spellContent="None"
          ></illthorn-hands-ui>
        </illthorn-panel>
      </div>
    `;
  },
};

export const MageSetup: Story = {
  render: () => {
    return html`
      <div style="width: 14em; background: var(--color-background); padding: 1em;">
        <illthorn-panel title="hands" .open=${true}>
          <illthorn-hands-ui
            leftContent="a crystal-tipped staff"
            rightContent="a small leather pouch"
            spellContent="Major Spiritual Protection"
          ></illthorn-hands-ui>
        </illthorn-panel>
      </div>
    `;
  },
};

export const RogueSetup: Story = {
  render: () => {
    return html`
      <div style="width: 14em; background: var(--color-background); padding: 1em;">
        <illthorn-panel title="hands" .open=${true}>
          <illthorn-hands-ui
            leftContent="a razor-sharp dagger"
            rightContent="a lockpicking kit"
            spellContent="Invisibility"
          ></illthorn-hands-ui>
        </illthorn-panel>
      </div>
    `;
  },
};

export const LongItemNames: Story = {
  render: () => {
    return html`
      <div style="width: 14em; background: var(--color-background); padding: 1em;">
        <illthorn-panel title="hands" .open=${true}>
          <illthorn-hands-ui
            leftContent="an ancient dwarven battle-axe with intricate runes and golden inlays"
            rightContent="a magnificent tower shield emblazoned with a golden griffin and precious gems"
            spellContent="Spiritual Intervention of the Ancient Masters and Divine Protection"
          ></illthorn-hands-ui>
        </illthorn-panel>
      </div>
    `;
  },
};

export const MixedStates: Story = {
  render: () => {
    return html`
      <div style="width: 14em; background: var(--color-background); padding: 1em;">
        <illthorn-panel title="hands" .open=${true}>
          <illthorn-hands-ui
            leftContent="a polished silver wand"
            rightContent="Empty"
            spellContent="Spirit Warding II"
          ></illthorn-hands-ui>
        </illthorn-panel>
      </div>
    `;
  },
};

export const ClosedPanel: Story = {
  render: () => {
    return html`
      <div style="width: 14em; background: var(--color-background); padding: 1em;">
        <illthorn-panel title="hands" .open=${false}>
          <illthorn-hands-ui
            leftContent="a gleaming steel sword"
            rightContent="a sturdy bronze shield"
            spellContent="Fire Shield"
          ></illthorn-hands-ui>
        </illthorn-panel>
      </div>
    `;
  },
};
