import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./effects.lit";
import { StorybookGameData, StorybookSessionMock } from "../../../../../stories/mocks/index";

const meta: Meta = {
  title: "Session/Effects/Effects",
  component: "illthorn-effects-lit",
  parameters: {
    docs: {
      description: {
        component: "Container component for displaying active spell effects using SpellEffect components.",
      },
    },
  },
  argTypes: {
    session: { control: false },
    name: {
      control: "text",
      description: "Name identifier for the effects container",
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    name: "Active Spells",
  },
  render: (args) => {
    const session = StorybookSessionMock.create();
    return html`<illthorn-effects-lit .session=${session} name=${args.name}></illthorn-effects-lit>`;
  },
};

export const NoSpells: Story = {
  args: {
    name: "Active Spells",
  },
  render: (args) => {
    const session = StorybookSessionMock.create();

    // Simulate empty spell effects dialog
    setTimeout(() => {
      StorybookSessionMock.emitEvent("metadata/dialog/Active Spells", {
        children: [], // No spell effects
      });
    }, 100);

    return html`<illthorn-effects-lit .session=${session} name=${args.name}></illthorn-effects-lit>`;
  },
};

export const FewSpells: Story = {
  args: {
    name: "Active Spells",
  },
  render: (args) => {
    const session = StorybookSessionMock.create();

    setTimeout(() => {
      StorybookSessionMock.emitEvent("metadata/dialog/Active Spells", {
        children: [
          {
            name: "progressBar",
            attrs: {
              text: "Bless",
              id: "bless-101",
              time: "12:45",
              value: "85",
            },
          },
          {
            name: "progressBar",
            attrs: {
              text: "Spirit Warding I",
              id: "spirit-warding-i-103",
              time: "8:20",
              value: "65",
            },
          },
          {
            name: "progressBar",
            attrs: {
              text: "Elemental Defense II",
              id: "elemental-defense-ii-406",
              time: "4:15",
              value: "40",
            },
          },
        ],
      });
    }, 100);

    return html`<illthorn-effects-lit .session=${session} name=${args.name}></illthorn-effects-lit>`;
  },
};

export const ManySpells: Story = {
  args: {
    name: "Active Spells",
  },
  render: (args) => {
    const session = StorybookSessionMock.create();

    setTimeout(() => {
      StorybookSessionMock.emitEvent("metadata/dialog/Active Spells", {
        children: [
          {
            name: "progressBar",
            attrs: {
              text: "Bless",
              id: "bless-101",
              time: "15:30",
              value: "90",
            },
          },
          {
            name: "progressBar",
            attrs: {
              text: "Spirit Warding I",
              id: "spirit-warding-i-103",
              time: "12:15",
              value: "75",
            },
          },
          {
            name: "progressBar",
            attrs: {
              text: "Spirit Warding II",
              id: "spirit-warding-ii-107",
              time: "18:45",
              value: "95",
            },
          },
          {
            name: "progressBar",
            attrs: {
              text: "Elemental Defense I",
              id: "elemental-defense-i-401",
              time: "5:30",
              value: "45",
            },
          },
          {
            name: "progressBar",
            attrs: {
              text: "Elemental Defense II",
              id: "elemental-defense-ii-406",
              time: "7:20",
              value: "55",
            },
          },
          {
            name: "progressBar",
            attrs: {
              text: "Mass Blur",
              id: "mass-blur-911",
              time: "2:15",
              value: "25",
            },
          },
          {
            name: "progressBar",
            attrs: {
              text: "Prayer of Protection",
              id: "prayer-protection-303",
              time: "1:30",
              value: "15",
            },
          },
          {
            name: "progressBar",
            attrs: {
              text: "Thurfel's Ward",
              id: "thurfels-ward-503",
              time: "∞",
              value: "100",
            },
          },
          {
            name: "progressBar",
            attrs: {
              text: "Major Spiritual Protection",
              id: "major-spiritual-protection-219",
              time: "8:45",
              value: "60",
            },
          },
          {
            name: "progressBar",
            attrs: {
              text: "Spirit Defense",
              id: "spirit-defense-103",
              time: "0:45",
              value: "8",
            },
          },
        ],
      });
    }, 100);

    return html`<illthorn-effects-lit .session=${session} name=${args.name}></illthorn-effects-lit>`;
  },
};

export const CriticalSpells: Story = {
  args: {
    name: "Active Spells",
  },
  render: (args) => {
    const session = StorybookSessionMock.create();

    setTimeout(() => {
      StorybookSessionMock.emitEvent("metadata/dialog/Active Spells", {
        children: [
          {
            name: "progressBar",
            attrs: {
              text: "Spirit Warding II",
              id: "spirit-warding-ii-107",
              time: "15:30",
              value: "85",
            },
          },
          {
            name: "progressBar",
            attrs: {
              text: "Mass Blur",
              id: "mass-blur-911",
              time: "1:45",
              value: "20",
            },
          },
          {
            name: "progressBar",
            attrs: {
              text: "Prayer of Protection",
              id: "prayer-protection-303",
              time: "0:30",
              value: "5",
            },
          },
          {
            name: "progressBar",
            attrs: {
              text: "Spirit Defense",
              id: "spirit-defense-103",
              time: "0:15",
              value: "2",
            },
          },
        ],
      });
    }, 100);

    return html`<illthorn-effects-lit .session=${session} name=${args.name}></illthorn-effects-lit>`;
  },
};

export const EffectsPanelDemo: Story = {
  args: {
    name: "Active Spells",
  },
  render: (args) => {
    const session = StorybookSessionMock.create();

    setTimeout(() => {
      StorybookSessionMock.emitEvent("metadata/dialog/Active Spells", {
        children: StorybookGameData.presets.commonSpells.map((spell, index) => ({
          name: "progressBar",
          attrs: {
            text: spell,
            id: `${spell.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${100 + index}`,
            time: `${Math.floor(Math.random() * 20) + 1}:${Math.floor(Math.random() * 60)
              .toString()
              .padStart(2, "0")}`,
            value: (Math.floor(Math.random() * 80) + 20).toString(),
          },
        })),
      });
    }, 100);

    return html`
      <div style="width: 300px; background: var(--sl-color-neutral-900); padding: 1rem; border-radius: 0.5rem;">
        <h3 style="margin: 0 0 0.5rem 0; color: white; font-size: 1.1rem;">Active Spells</h3>
        <illthorn-effects-lit .session=${session} name=${args.name}></illthorn-effects-lit>
      </div>
    `;
  },
};

export const LiveUpdates: Story = {
  args: {
    name: "Active Spells",
  },
  render: (args) => {
    const session = StorybookSessionMock.create();
    let updateInterval: NodeJS.Timeout;

    const spells = [
      { name: "Bless", id: "bless-101", baseTime: 900 },
      { name: "Spirit Warding I", id: "spirit-warding-i-103", baseTime: 720 },
      { name: "Mass Blur", id: "mass-blur-911", baseTime: 180 },
      { name: "Prayer of Protection", id: "prayer-protection-303", baseTime: 120 },
    ];

    const currentTime = Date.now();

    const updateSpells = () => {
      const activeSpells = spells
        .map((spell) => {
          const timeRemaining = Math.max(0, spell.baseTime - Math.floor((Date.now() - currentTime) / 1000));
          const percent = Math.floor((timeRemaining / spell.baseTime) * 100);
          const minutes = Math.floor(timeRemaining / 60);
          const seconds = timeRemaining % 60;

          return {
            name: "progressBar",
            attrs: {
              text: spell.name,
              id: spell.id,
              time: timeRemaining > 0 ? `${minutes}:${seconds.toString().padStart(2, "0")}` : "0:00",
              value: percent.toString(),
            },
          };
        })
        .filter((spell) => parseInt(spell.attrs.value) > 0); // Remove expired spells

      StorybookSessionMock.emitEvent("metadata/dialog/Active Spells", {
        children: activeSpells,
      });
    };

    // Initial update
    setTimeout(() => {
      updateSpells();
      updateInterval = setInterval(updateSpells, 1000);

      // Clean up after 5 minutes
      setTimeout(() => {
        if (updateInterval) {
          clearInterval(updateInterval);
        }
      }, 300000);
    }, 100);

    return html`
      <div style="width: 300px; background: var(--sl-color-neutral-900); padding: 1rem; border-radius: 0.5rem;">
        <h3 style="margin: 0 0 0.5rem 0; color: white; font-size: 1.1rem;">Live Spell Timer Demo</h3>
        <p style="color: rgba(255,255,255,0.7); font-size: 0.8rem; margin: 0 0 1rem 0;">
          Watch spells expire in real-time
        </p>
        <illthorn-effects-lit .session=${session} name=${args.name}></illthorn-effects-lit>
      </div>
    `;
  },
};
