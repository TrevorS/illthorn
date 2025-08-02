import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./effects-ui.lit";
import "./effects-container.lit";
import { StorybookGameData, StorybookSessionMock } from "../../../../../stories/mocks/index";

const meta: Meta = {
  title: "Session/Effects",
  component: "illthorn-effects-ui",
  parameters: {
    docs: {
      description: {
        component: "Effects component for displaying active spell effects using the container/presentational pattern.",
      },
    },
  },
  argTypes: {
    spellEffects: {
      control: "object",
      description: "Array of spell effect data to display",
    },
    name: {
      control: "text",
      description: "Name identifier for the effects component",
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    spellEffects: [],
    name: "Active Spells",
  },
  render: (args) => html`<illthorn-effects-ui .spellEffects=${args.spellEffects} .name=${args.name}></illthorn-effects-ui>`,
};

export const NoSpells: Story = {
  args: {
    spellEffects: [],
    name: "Active Spells",
  },
  render: (args) => html`<illthorn-effects-ui .spellEffects=${args.spellEffects} .name=${args.name}></illthorn-effects-ui>`,
};

export const FewSpells: Story = {
  args: {
    spellEffects: [
      {
        text: "Bless",
        id: "bless-101",
        time: "12:45",
        value: "85",
      },
      {
        text: "Spirit Warding I",
        id: "spirit-warding-i-103",
        time: "8:20",
        value: "65",
      },
      {
        text: "Elemental Defense II",
        id: "elemental-defense-ii-406",
        time: "4:15",
        value: "40",
      },
    ],
    name: "Active Spells",
  },
  render: (args) => html`<illthorn-effects-ui .spellEffects=${args.spellEffects} .name=${args.name}></illthorn-effects-ui>`,
};

export const ManySpells: Story = {
  args: {
    spellEffects: [
      { text: "Bless", id: "bless-101", time: "15:30", value: "90" },
      { text: "Spirit Warding I", id: "spirit-warding-i-103", time: "12:15", value: "75" },
      { text: "Spirit Warding II", id: "spirit-warding-ii-107", time: "18:45", value: "95" },
      { text: "Elemental Defense I", id: "elemental-defense-i-401", time: "5:30", value: "45" },
      { text: "Elemental Defense II", id: "elemental-defense-ii-406", time: "7:20", value: "55" },
      { text: "Mass Blur", id: "mass-blur-911", time: "2:15", value: "25" },
      { text: "Prayer of Protection", id: "prayer-protection-303", time: "1:30", value: "15" },
      { text: "Thurfel's Ward", id: "thurfels-ward-503", time: "∞", value: "100" },
      { text: "Major Spiritual Protection", id: "major-spiritual-protection-219", time: "8:45", value: "60" },
      { text: "Spirit Defense", id: "spirit-defense-103", time: "0:45", value: "8" },
    ],
    name: "Active Spells",
  },
  render: (args) => html`<illthorn-effects-ui .spellEffects=${args.spellEffects} .name=${args.name}></illthorn-effects-ui>`,
};

export const CriticalSpells: Story = {
  args: {
    spellEffects: [
      { text: "Spirit Warding II", id: "spirit-warding-ii-107", time: "15:30", value: "85" },
      { text: "Mass Blur", id: "mass-blur-911", time: "1:45", value: "20" },
      { text: "Prayer of Protection", id: "prayer-protection-303", time: "0:30", value: "5" },
      { text: "Spirit Defense", id: "spirit-defense-103", time: "0:15", value: "2" },
    ],
    name: "Active Spells",
  },
  render: (args) => html`<illthorn-effects-ui .spellEffects=${args.spellEffects} .name=${args.name}></illthorn-effects-ui>`,
};

export const PanelDemo: Story = {
  args: {
    spellEffects: StorybookGameData.presets.commonSpells.map((spell, index) => ({
      text: spell,
      id: `${spell.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${100 + index}`,
      time: `${Math.floor(Math.random() * 20) + 1}:${Math.floor(Math.random() * 60)
        .toString()
        .padStart(2, "0")}`,
      value: (Math.floor(Math.random() * 80) + 20).toString(),
    })),
    name: "Active Spells",
  },
  render: (args) => html`
    <div style="width: 300px; background: var(--color-surface-variant); padding: 1rem; border-radius: 0.5rem;">
      <h3 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 1.1rem;">Active Spells</h3>
      <illthorn-effects-ui .spellEffects=${args.spellEffects} .name=${args.name}></illthorn-effects-ui>
    </div>
  `,
};

// Interactive story with controls for easy testing of different spell configurations
export const Interactive: Story = {
  args: {
    spellEffects: [
      { text: "Bless", id: "bless-101", time: "12:30", value: "75" },
      { text: "Spirit Warding I", id: "spirit-warding-i-103", time: "8:15", value: "60" },
      { text: "Mass Blur", id: "mass-blur-911", time: "2:45", value: "25" },
    ],
    name: "Active Spells",
  },
  argTypes: {
    spellEffects: {
      control: "object",
      description: "Array of spell effects to display - modify to test different configurations",
    },
    name: {
      control: "text",
      description: "Display name for the effects panel",
    },
  },
  render: (args) => html`<illthorn-effects-ui .spellEffects=${args.spellEffects} .name=${args.name}></illthorn-effects-ui>`,
};

// Container component story for session event testing
export const WithContainer: Story = {
  render: () => {
    const session = StorybookSessionMock.create();

    // Simulate session events for container testing
    setTimeout(() => {
      StorybookSessionMock.emitEvent("metadata/dialogData/Active Spells", {
        children: [
          {
            name: "progressBar",
            attrs: { text: "Bless", id: "bless-101", time: "12:30", value: "75" },
          },
          {
            name: "progressBar",
            attrs: { text: "Spirit Warding I", id: "spirit-warding-i-103", time: "8:15", value: "60" },
          },
        ],
      });
    }, 100);

    return html`<illthorn-effects-container .session=${session} name="Active Spells"></illthorn-effects-container>`;
  },
};
