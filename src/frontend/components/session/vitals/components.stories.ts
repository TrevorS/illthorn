import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './components.lit';

// VitalStat Component Stories
const vitalStatMeta: Meta = {
  title: 'Session/Vitals/VitalStat',
  component: 'illthorn-vital-stat',
  parameters: {
    docs: {
      description: {
        component: 'Displays a vital statistic with label, value, and progress bar using Shoelace components.',
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'The label for the vital stat (e.g., "Health", "Mana")'
    },
    value: {
      control: 'text',
      description: 'The display value (e.g., "100/100", "45/80")'
    },
    percent: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Percentage value for progress bar (affects color thresholds)'
    },
    dataVital: {
      control: 'text',
      description: 'Data attribute for vital type'
    },
  },
};

export default vitalStatMeta;

export const HealthFullStory: StoryObj = {
  name: 'Health - Full',
  args: {
    label: 'Health',
    value: '100/100',
    percent: 100,
  },
};

export const HealthCriticalStory: StoryObj = {
  name: 'Health - Critical',
  args: {
    label: 'Health',
    value: '15/100',
    percent: 15,
  },
};

export const ManaModerateStory: StoryObj = {
  name: 'Mana - Moderate',
  args: {
    label: 'Mana',
    value: '45/80',
    percent: 56,
  },
};

export const StaminaLowStory: StoryObj = {
  name: 'Stamina - Low',
  args: {
    label: 'Stamina',
    value: '20/90',
    percent: 22,
  },
};

export const IndeterminateStateStory: StoryObj = {
  name: 'Indeterminate State',
  args: {
    label: 'Spirit',
    value: undefined,
    percent: undefined,
  },
};

export const AllVitalsDemo: StoryObj = {
  name: 'All Vitals Demo',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 0.5rem; width: 200px; background: var(--sl-color-neutral-900); padding: 1rem; border-radius: 0.5rem;">
      <h3 style="margin: 0 0 0.5rem 0; color: white; font-size: 1.1rem;">Character Stats</h3>
      <illthorn-vital-stat label="Health" value="85/100" percent="85"></illthorn-vital-stat>
      <illthorn-vital-stat label="Mana" value="45/80" percent="56"></illthorn-vital-stat>
      <illthorn-vital-stat label="Stamina" value="20/90" percent="22"></illthorn-vital-stat>
      <illthorn-vital-stat label="Spirit" value="100/100" percent="100"></illthorn-vital-stat>
      <illthorn-vital-stat label="Mind" value="95/100" percent="95"></illthorn-vital-stat>
    </div>
  `,
};

// VitalText Component Stories
const vitalTextMeta: Meta = {
  title: 'Session/Vitals/VitalText',
  component: 'illthorn-vital-text',
  parameters: {
    docs: {
      description: {
        component: 'Displays a text-only vital statistic without progress bar (used for encumbrance, etc.).',
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'The label for the vital text'
    },
    value: {
      control: 'text',
      description: 'The display value'
    },
    dataVital: {
      control: 'text',
      description: 'Data attribute for vital type'
    },
    inverted: {
      control: 'boolean',
      description: 'Whether this is an inverted vital (lower is better)'
    },
  },
};

export const EncumbranceStory: StoryObj = {
  title: 'Session/Vitals/VitalText',
  name: 'Encumbrance',
  args: {
    label: 'Encumbrance',
    value: 'None',
  },
};

export const ExperienceStory: StoryObj = {
  title: 'Session/Vitals/VitalText', 
  name: 'Experience',
  args: {
    label: 'Experience',
    value: '2,456,789',
  },
};

export const LevelStory: StoryObj = {
  title: 'Session/Vitals/VitalText',
  name: 'Level',
  args: {
    label: 'Level',
    value: '25',
  },
};

export const TextVitalsDemo: StoryObj = {
  title: 'Session/Vitals/VitalText',
  name: 'Text Vitals Demo',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 0.25rem; width: 200px; background: var(--sl-color-neutral-900); padding: 1rem; border-radius: 0.5rem;">
      <h3 style="margin: 0 0 0.5rem 0; color: white; font-size: 1.1rem;">Character Info</h3>
      <illthorn-vital-text label="Level" value="25"></illthorn-vital-text>
      <illthorn-vital-text label="Experience" value="2,456,789"></illthorn-vital-text>
      <illthorn-vital-text label="Encumbrance" value="None"></illthorn-vital-text>
      <illthorn-vital-text label="Silver" value="15,240"></illthorn-vital-text>
    </div>
  `,
};

// Combined Demo
export const CombinedVitalsDemo: StoryObj = {
  title: 'Session/Vitals/Combined',
  name: 'Full Vitals Panel',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 0.25rem; width: 200px; background: var(--sl-color-neutral-900); padding: 1rem; border-radius: 0.5rem;">
      <h3 style="margin: 0 0 0.5rem 0; color: white; font-size: 1.1rem;">Vitals</h3>
      
      <!-- Progress bar vitals -->
      <illthorn-vital-stat label="Health" value="85/100" percent="85"></illthorn-vital-stat>
      <illthorn-vital-stat label="Mana" value="45/80" percent="56"></illthorn-vital-stat>
      <illthorn-vital-stat label="Stamina" value="20/90" percent="22"></illthorn-vital-stat>
      <illthorn-vital-stat label="Spirit" value="100/100" percent="100"></illthorn-vital-stat>
      <illthorn-vital-stat label="Mind" value="95/100" percent="95"></illthorn-vital-stat>
      
      <hr style="border: 1px solid rgba(255,255,255,0.2); margin: 0.5rem 0;">
      
      <!-- Text-only vitals -->
      <illthorn-vital-text label="Level" value="25"></illthorn-vital-text>
      <illthorn-vital-text label="Experience" value="2,456,789"></illthorn-vital-text>
      <illthorn-vital-text label="Encumbrance" value="None"></illthorn-vital-text>
    </div>
  `,
};