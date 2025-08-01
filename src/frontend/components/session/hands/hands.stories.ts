import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./hands.lit";
import { StorybookSessionMock } from "../../../../../stories/mocks/index";

const meta: Meta = {
  title: "Session/Hands/Hands",
  component: "illthorn-hands-lit",
  parameters: {
    docs: {
      description: {
        component: "Container component for managing left, right, and spell hand components with session integration.",
      },
    },
  },
  argTypes: {
    session: { control: false },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const session = StorybookSessionMock.create();
    return html`<illthorn-hands-lit .session=${session}></illthorn-hands-lit>`;
  },
};

export const EmptyHands: Story = {
  render: () => {
    const session = StorybookSessionMock.create();

    // Explicitly set all hands to empty
    setTimeout(() => {
      StorybookSessionMock.emitEvent("metadata/left", {
        children: [{ text: "None" }],
      });
      StorybookSessionMock.emitEvent("metadata/right", {
        children: [{ text: "None" }],
      });
      StorybookSessionMock.emitEvent("metadata/spell", {
        children: [{ text: "None" }],
      });
    }, 100);

    return html`<illthorn-hands-lit .session=${session}></illthorn-hands-lit>`;
  },
};

export const WarriorSetup: Story = {
  render: () => {
    const session = StorybookSessionMock.create();

    setTimeout(() => {
      StorybookSessionMock.emitEvent("metadata/left", {
        children: [{ text: "a gleaming steel sword" }],
      });
      StorybookSessionMock.emitEvent("metadata/right", {
        children: [{ text: "a sturdy bronze shield" }],
      });
      StorybookSessionMock.emitEvent("metadata/spell", {
        children: [{ text: "None" }],
      });
    }, 100);

    return html`<illthorn-hands-lit .session=${session}></illthorn-hands-lit>`;
  },
};

export const MageSetup: Story = {
  render: () => {
    const session = StorybookSessionMock.create();

    setTimeout(() => {
      StorybookSessionMock.emitEvent("metadata/left", {
        children: [{ text: "a crystal-tipped staff" }],
      });
      StorybookSessionMock.emitEvent("metadata/right", {
        children: [{ text: "a small leather pouch" }],
      });
      StorybookSessionMock.emitEvent("metadata/spell", {
        children: [{ text: "Major Spiritual Protection" }],
      });
    }, 100);

    return html`<illthorn-hands-lit .session=${session}></illthorn-hands-lit>`;
  },
};

export const RogueSetup: Story = {
  render: () => {
    const session = StorybookSessionMock.create();

    setTimeout(() => {
      StorybookSessionMock.emitEvent("metadata/left", {
        children: [{ text: "a razor-sharp dagger" }],
      });
      StorybookSessionMock.emitEvent("metadata/right", {
        children: [{ text: "a lockpicking kit" }],
      });
      StorybookSessionMock.emitEvent("metadata/spell", {
        children: [{ text: "Invisibility" }],
      });
    }, 100);

    return html`<illthorn-hands-lit .session=${session}></illthorn-hands-lit>`;
  },
};

export const LongItemNames: Story = {
  render: () => {
    const session = StorybookSessionMock.create();

    setTimeout(() => {
      StorybookSessionMock.emitEvent("metadata/left", {
        children: [{ text: "an ancient dwarven battle-axe with intricate runes" }],
      });
      StorybookSessionMock.emitEvent("metadata/right", {
        children: [{ text: "a magnificent tower shield emblazoned with a golden griffin" }],
      });
      StorybookSessionMock.emitEvent("metadata/spell", {
        children: [{ text: "Spiritual Intervention of the Ancient Masters" }],
      });
    }, 100);

    return html`<illthorn-hands-lit .session=${session}></illthorn-hands-lit>`;
  },
};

export const MixedStates: Story = {
  render: () => {
    const session = StorybookSessionMock.create();

    setTimeout(() => {
      StorybookSessionMock.emitEvent("metadata/left", {
        children: [{ text: "a polished silver wand" }],
      });
      StorybookSessionMock.emitEvent("metadata/right", {
        children: [{ text: "None" }],
      });
      StorybookSessionMock.emitEvent("metadata/spell", {
        children: [{ text: "Spirit Warding II" }],
      });
    }, 100);

    return html`<illthorn-hands-lit .session=${session}></illthorn-hands-lit>`;
  },
};

export const HandsPanelDemo: Story = {
  render: () => {
    const session = StorybookSessionMock.create();

    setTimeout(() => {
      StorybookSessionMock.emitEvent("metadata/left", {
        children: [{ text: "a glowing enchanted sword" }],
      });
      StorybookSessionMock.emitEvent("metadata/right", {
        children: [{ text: "a crystalline orb" }],
      });
      StorybookSessionMock.emitEvent("metadata/spell", {
        children: [{ text: "Thurfel's Ward" }],
      });
    }, 100);

    return html`
      <div style="background: var(--sl-color-neutral-900); padding: 1rem; border-radius: 0.5rem; min-width: 400px;">
        <h3 style="margin: 0 0 1rem 0; color: white; font-size: 1.1rem; text-align: center;">Character Hands</h3>
        <illthorn-hands-lit .session=${session}></illthorn-hands-lit>
      </div>
    `;
  },
};

export const InteractiveDemo: Story = {
  render: () => {
    const session = StorybookSessionMock.create();
    let changeInterval: NodeJS.Timeout;

    const weaponSets = [
      {
        left: "a gleaming steel sword",
        right: "a sturdy bronze shield",
        spell: "Bless",
      },
      {
        left: "a crystal-tipped staff",
        right: "a spell component pouch",
        spell: "Major Spiritual Protection",
      },
      {
        left: "a razor-sharp dagger",
        right: "a throwing knife",
        spell: "Invisibility",
      },
      {
        left: "a polished bow",
        right: "a leather quiver",
        spell: "None",
      },
      {
        left: "None",
        right: "None",
        spell: "None",
      },
    ];

    let currentSet = 0;

    const updateHands = () => {
      const set = weaponSets[currentSet];
      StorybookSessionMock.emitEvent("metadata/left", {
        children: [{ text: set.left }],
      });
      StorybookSessionMock.emitEvent("metadata/right", {
        children: [{ text: set.right }],
      });
      StorybookSessionMock.emitEvent("metadata/spell", {
        children: [{ text: set.spell }],
      });

      currentSet = (currentSet + 1) % weaponSets.length;
    };

    setTimeout(() => {
      updateHands(); // Initial
      changeInterval = setInterval(updateHands, 3000);

      // Clean up after 30 seconds
      setTimeout(() => {
        if (changeInterval) {
          clearInterval(changeInterval);
        }
      }, 30000);
    }, 100);

    return html`
      <div style="background: var(--sl-color-neutral-900); padding: 1rem; border-radius: 0.5rem; min-width: 400px;">
        <h3 style="margin: 0 0 0.5rem 0; color: white; font-size: 1.1rem; text-align: center;">Equipment Changes</h3>
        <p style="color: rgba(255,255,255,0.7); font-size: 0.8rem; text-align: center; margin: 0 0 1rem 0;">
          Watch hands change every 3 seconds
        </p>
        <illthorn-hands-lit .session=${session}></illthorn-hands-lit>
      </div>
    `;
  },
};
