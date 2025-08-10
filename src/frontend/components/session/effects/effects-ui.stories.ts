import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./effects-ui.lit";

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
