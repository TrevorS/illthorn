import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./vitals.lit";
import { StorybookGameData, StorybookSessionMock } from "../../../../../stories/mocks/index";

const meta: Meta = {
  title: "Session/Vitals/Vitals",
  component: "illthorn-vitals-lit",
  parameters: {
    docs: {
      description: {
        component: "Main vitals container that handles all session communication and coordinates vital display using VitalStat and VitalText components.",
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
    return html`<illthorn-vitals-lit .session=${session}></illthorn-vitals-lit>`;
  },
};

export const FullHealth: Story = {
  render: () => {
    const session = StorybookSessionMock.create();

    // Simulate full health data
    setTimeout(() => {
      StorybookSessionMock.emitEvent("metadata/progressBar/health", StorybookGameData.createVitalUpdate("health", 100, 100));
      StorybookSessionMock.emitEvent("metadata/progressBar/mana", StorybookGameData.createVitalUpdate("mana", 80, 80));
      StorybookSessionMock.emitEvent("metadata/progressBar/stamina", StorybookGameData.createVitalUpdate("stamina", 90, 90));
      StorybookSessionMock.emitEvent("metadata/progressBar/spirit", StorybookGameData.createVitalUpdate("spirit", 100, 100));
      StorybookSessionMock.emitEvent("metadata/progressBar/mindState", {
        attrs: { value: "100", text: "100/100" },
      });
    }, 100);

    return html`<illthorn-vitals-lit .session=${session}></illthorn-vitals-lit>`;
  },
};

export const CriticalHealth: Story = {
  render: () => {
    const session = StorybookSessionMock.create();

    setTimeout(() => {
      StorybookSessionMock.emitEvent("metadata/progressBar/health", StorybookGameData.createVitalUpdate("health", 15, 100));
      StorybookSessionMock.emitEvent("metadata/progressBar/mana", StorybookGameData.createVitalUpdate("mana", 5, 80));
      StorybookSessionMock.emitEvent("metadata/progressBar/stamina", StorybookGameData.createVitalUpdate("stamina", 20, 90));
      StorybookSessionMock.emitEvent("metadata/progressBar/spirit", StorybookGameData.createVitalUpdate("spirit", 85, 100));
      StorybookSessionMock.emitEvent("metadata/progressBar/mindState", {
        attrs: { value: "95", text: "95/100" },
      });
    }, 100);

    return html`<illthorn-vitals-lit .session=${session}></illthorn-vitals-lit>`;
  },
};

export const MixedStates: Story = {
  render: () => {
    const session = StorybookSessionMock.create();

    setTimeout(() => {
      // Mixed vital states
      StorybookSessionMock.emitEvent("metadata/progressBar/health", StorybookGameData.createVitalUpdate("health", 75, 100));
      StorybookSessionMock.emitEvent("metadata/progressBar/mana", StorybookGameData.createVitalUpdate("mana", 25, 80));
      StorybookSessionMock.emitEvent("metadata/progressBar/stamina", StorybookGameData.createVitalUpdate("stamina", 45, 90));
      StorybookSessionMock.emitEvent("metadata/progressBar/spirit", StorybookGameData.createVitalUpdate("spirit", 100, 100));
      StorybookSessionMock.emitEvent("metadata/progressBar/mindState", {
        attrs: { value: "60", text: "60/100" },
      });

      // Stance and encumbrance
      StorybookSessionMock.emitEvent("metadata/progressBar/pbarStance", {
        attrs: { text: "defensive forward" },
      });
      StorybookSessionMock.emitEvent("metadata/progressBar/encumbrance", {
        attrs: { text: "light" },
      });
    }, 100);

    return html`<illthorn-vitals-lit .session=${session}></illthorn-vitals-lit>`;
  },
};

export const IndeterminateStates: Story = {
  render: () => {
    const session = StorybookSessionMock.create();

    // Simulate some indeterminate states (no data received yet)
    setTimeout(() => {
      StorybookSessionMock.emitEvent("metadata/progressBar/health", StorybookGameData.createVitalUpdate("health", 85, 100));
      StorybookSessionMock.emitEvent("metadata/progressBar/stamina", StorybookGameData.createVitalUpdate("stamina", 70, 90));
      // Leave mana, spirit, and mind as indeterminate (no events)
    }, 100);

    return html`<illthorn-vitals-lit .session=${session}></illthorn-vitals-lit>`;
  },
};

export const VitalsPanelDemo: Story = {
  render: () => {
    const session = StorybookSessionMock.create();

    setTimeout(() => {
      // Realistic game scenario
      StorybookSessionMock.emitEvent("metadata/progressBar/health", StorybookGameData.createVitalUpdate("health", 92, 100));
      StorybookSessionMock.emitEvent("metadata/progressBar/mana", StorybookGameData.createVitalUpdate("mana", 45, 80));
      StorybookSessionMock.emitEvent("metadata/progressBar/stamina", StorybookGameData.createVitalUpdate("stamina", 88, 90));
      StorybookSessionMock.emitEvent("metadata/progressBar/spirit", StorybookGameData.createVitalUpdate("spirit", 100, 100));
      StorybookSessionMock.emitEvent("metadata/progressBar/mindState", {
        attrs: { value: "85", text: "85/100" },
      });
      StorybookSessionMock.emitEvent("metadata/progressBar/pbarStance", {
        attrs: { text: "offensive forward" },
      });
      StorybookSessionMock.emitEvent("metadata/progressBar/encumbrance", {
        attrs: { text: "none" },
      });
    }, 100);

    return html`
      <div style="width: 200px; background: var(--sl-color-neutral-900); padding: 1rem; border-radius: 0.5rem;">
        <h3 style="margin: 0 0 0.5rem 0; color: white; font-size: 1.1rem;">Character Vitals</h3>
        <illthorn-vitals-lit .session=${session}></illthorn-vitals-lit>
      </div>
    `;
  },
};

export const InteractiveDemo: Story = {
  render: () => {
    const session = StorybookSessionMock.create();
    let updateInterval: NodeJS.Timeout;

    // Simulate changing vitals over time
    setTimeout(() => {
      let healthPercent = 100;
      let manaPercent = 80;
      let staminaPercent = 90;

      const updateVitals = () => {
        // Simulate gradual health loss and mana/stamina recovery
        healthPercent = Math.max(10, healthPercent - Math.random() * 3);
        manaPercent = Math.min(80, manaPercent + Math.random() * 2);
        staminaPercent = Math.min(90, staminaPercent + Math.random() * 1.5);

        StorybookSessionMock.emitEvent("metadata/progressBar/health", {
          attrs: {
            value: healthPercent.toFixed(0),
            text: `${Math.floor(healthPercent)}/100`,
          },
        });
        StorybookSessionMock.emitEvent("metadata/progressBar/mana", {
          attrs: {
            value: manaPercent.toFixed(0),
            text: `${Math.floor(manaPercent * 0.8)}/80`,
          },
        });
        StorybookSessionMock.emitEvent("metadata/progressBar/stamina", {
          attrs: {
            value: staminaPercent.toFixed(0),
            text: `${Math.floor(staminaPercent * 0.9)}/90`,
          },
        });
      };

      // Initial update
      updateVitals();

      // Update every 2 seconds
      updateInterval = setInterval(updateVitals, 2000);

      // Clean up after 30 seconds
      setTimeout(() => {
        if (updateInterval) {
          clearInterval(updateInterval);
        }
      }, 30000);
    }, 100);

    return html`
      <div style="width: 200px; background: var(--sl-color-neutral-900); padding: 1rem; border-radius: 0.5rem;">
        <h3 style="margin: 0 0 0.5rem 0; color: white; font-size: 1.1rem;">Live Demo</h3>
        <p style="color: rgba(255,255,255,0.7); font-size: 0.8rem; margin: 0 0 1rem 0;">
          Watch vitals change over time
        </p>
        <illthorn-vitals-lit .session=${session}></illthorn-vitals-lit>
      </div>
    `;
  },
};
