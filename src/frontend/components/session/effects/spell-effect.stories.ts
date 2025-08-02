import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./spell-effect.lit";

const meta: Meta = {
  title: "Session/Effects/SpellEffect",
  component: "illthorn-spell-effect",
  parameters: {
    docs: {
      description: {
        component: "Displays a single spell effect with name and time remaining, styled by duration category.",
      },
    },
  },
  argTypes: {
    spellName: {
      control: "text",
      description: "The name of the spell effect",
    },
    timeRemaining: {
      control: "text",
      description: 'Time remaining display (e.g., "5:30", "∞")',
    },
    spellId: {
      control: "text",
      description: "Unique spell identifier",
    },
    percent: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "Percentage of time remaining (affects color styling)",
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    spellName: "Bless",
    timeRemaining: "10:45",
    spellId: "bless-101",
    percent: 75,
  },
};

export const HighDuration: Story = {
  args: {
    spellName: "Spirit Warding II",
    timeRemaining: "15:20",
    spellId: "spirit-warding-ii-107",
    percent: 85,
  },
};

export const MediumDuration: Story = {
  args: {
    spellName: "Elemental Defense I",
    timeRemaining: "5:30",
    spellId: "elemental-defense-i-401",
    percent: 45,
  },
};

export const LowDuration: Story = {
  args: {
    spellName: "Mass Blur",
    timeRemaining: "1:15",
    spellId: "mass-blur-911",
    percent: 15,
  },
};

export const PermanentSpell: Story = {
  args: {
    spellName: "Thurfel's Ward",
    timeRemaining: "∞",
    spellId: "thurfels-ward-503",
    percent: 100,
  },
};

export const LongSpellName: Story = {
  args: {
    spellName: "Major Spiritual Protection",
    timeRemaining: "8:45",
    spellId: "major-spiritual-protection-219",
    percent: 60,
  },
};

export const VeryLongSpellName: Story = {
  args: {
    spellName: "Spiritual Intervention of the Ancient Masters",
    timeRemaining: "2:30",
    spellId: "spiritual-intervention-ancient-masters-custom",
    percent: 25,
  },
};

export const SpellList: Story = {
  render: () => html`
    <div style="width: 300px; background: var(--sl-color-neutral-100); padding: 1rem; border-radius: 0.5rem;">
      <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem;">Active Spells</h3>
      <illthorn-spell-effect 
        spellName="Bless" 
        timeRemaining="12:45" 
        spellId="bless-101" 
        percent="85">
      </illthorn-spell-effect>
      <illthorn-spell-effect 
        spellName="Spirit Warding I" 
        timeRemaining="8:20" 
        spellId="spirit-warding-i-103" 
        percent="65">
      </illthorn-spell-effect>
      <illthorn-spell-effect 
        spellName="Elemental Defense II" 
        timeRemaining="4:15" 
        spellId="elemental-defense-ii-406" 
        percent="40">
      </illthorn-spell-effect>
      <illthorn-spell-effect 
        spellName="Mass Blur" 
        timeRemaining="1:30" 
        spellId="mass-blur-911" 
        percent="20">
      </illthorn-spell-effect>
      <illthorn-spell-effect 
        spellName="Prayer of Protection" 
        timeRemaining="0:45" 
        spellId="prayer-protection-303" 
        percent="8">
      </illthorn-spell-effect>
      <illthorn-spell-effect 
        spellName="Thurfel's Ward" 
        timeRemaining="∞" 
        spellId="thurfels-ward-503" 
        percent="100">
      </illthorn-spell-effect>
    </div>
  `,
};
