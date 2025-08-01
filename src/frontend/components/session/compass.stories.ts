import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './compass.lit';
import { StorybookSessionMock, StorybookGameData, createMockCompassData, mockDirections } from '../../../../stories/mocks/index';

const meta: Meta = {
  title: 'Session/Compass',
  component: 'illthorn-compass',
  parameters: {
    docs: {
      description: {
        component: 'Displays directional navigation compass with visual states based on available exits.',
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
    return html`<illthorn-compass .session=${session}></illthorn-compass>`;
  },
};

export const NoExits: Story = {
  render: () => {
    const session = StorybookSessionMock.create();
    
    setTimeout(() => {
      const compassData = createMockCompassData(mockDirections.empty);
      StorybookSessionMock.emitEvent('metadata/compass', compassData);
    }, 100);
    
    return html`<illthorn-compass .session=${session}></illthorn-compass>`;
  },
};

export const BasicExits: Story = {
  render: () => {
    const session = StorybookSessionMock.create();
    
    setTimeout(() => {
      const compassData = createMockCompassData(mockDirections.basic);
      StorybookSessionMock.emitEvent('metadata/compass', compassData);
    }, 100);
    
    return html`<illthorn-compass .session=${session}></illthorn-compass>`;
  },
};

export const FullCompass: Story = {
  render: () => {
    const session = StorybookSessionMock.create();
    
    setTimeout(() => {
      const compassData = createMockCompassData(mockDirections.full);
      StorybookSessionMock.emitEvent('metadata/compass', compassData);
    }, 100);
    
    return html`<illthorn-compass .session=${session}></illthorn-compass>`;
  },
};

export const WithSpecialExits: Story = {
  render: () => {
    const session = StorybookSessionMock.create();
    
    setTimeout(() => {
      const compassData = createMockCompassData(mockDirections.withSpecial);
      StorybookSessionMock.emitEvent('metadata/compass', compassData);
    }, 100);
    
    return html`<illthorn-compass .session=${session}></illthorn-compass>`;
  },
};

export const IndoorLocation: Story = {
  render: () => {
    const session = StorybookSessionMock.create();
    
    setTimeout(() => {
      const compassData = createMockCompassData(['north', 'south', 'east', 'west', 'up', 'down']);
      StorybookSessionMock.emitEvent('metadata/compass', compassData);
    }, 100);
    
    return html`<illthorn-compass .session=${session}></illthorn-compass>`;
  },
};

export const SingleExit: Story = {
  render: () => {
    const session = StorybookSessionMock.create();
    
    setTimeout(() => {
      const compassData = createMockCompassData(['out']);
      StorybookSessionMock.emitEvent('metadata/compass', compassData);
    }, 100);
    
    return html`<illthorn-compass .session=${session}></illthorn-compass>`;
  },
};

export const TwoExits: Story = {
  render: () => {
    const session = StorybookSessionMock.create();
    
    setTimeout(() => {
      const compassData = createMockCompassData(['north', 'south']);
      StorybookSessionMock.emitEvent('metadata/compass', compassData);
    }, 100);
    
    return html`<illthorn-compass .session=${session}></illthorn-compass>`;
  },
};

export const CompassPanelDemo: Story = {
  render: () => {
    const session = StorybookSessionMock.create();
    
    setTimeout(() => {
      const compassData = createMockCompassData(['north', 'east', 'southwest', 'up']);
      StorybookSessionMock.emitEvent('metadata/compass', compassData);
    }, 100);
    
    return html`
      <div style="background: var(--sl-color-neutral-900); padding: 1rem; border-radius: 0.5rem; display: inline-block;">
        <h3 style="margin: 0 0 1rem 0; color: white; font-size: 1.1rem; text-align: center;">Navigation</h3>
        <illthorn-compass .session=${session}></illthorn-compass>
      </div>
    `;
  },
};

export const VariousScenarios: Story = {
  render: () => {
    const session = StorybookSessionMock.create();
    
    const scenarios = [
      { name: 'Crossroads', exits: ['north', 'south', 'east', 'west'] },
      { name: 'Dead End', exits: ['south'] },
      { name: 'Stairway', exits: ['up', 'down'] },
      { name: 'Building Entrance', exits: ['north', 'out'] },
      { name: 'Full Compass', exits: ['north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest'] },
      { name: 'No Exits', exits: [] }
    ];
    
    return html`
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; max-width: 600px;">
        ${scenarios.map((scenario, index) => {
          const sessionForScenario = StorybookSessionMock.create(`scenario-${index}`);
          
          setTimeout(() => {
            const compassData = createMockCompassData(scenario.exits);
            StorybookSessionMock.emitEvent('metadata/compass', compassData);
          }, 100 + (index * 50));
          
          return html`
            <div style="background: var(--sl-color-neutral-900); padding: 1rem; border-radius: 0.5rem; text-align: center;">
              <h4 style="margin: 0 0 0.5rem 0; color: white; font-size: 0.9rem;">${scenario.name}</h4>
              <illthorn-compass .session=${sessionForScenario}></illthorn-compass>
            </div>
          `;
        })}
      </div>
    `;
  },
};

export const InteractiveDemo: Story = {
  render: () => {
    const session = StorybookSessionMock.create();
    let changeInterval: NodeJS.Timeout;
    
    const exitPatterns = [
      ['north', 'south'],
      ['north', 'south', 'east'],
      ['north', 'south', 'east', 'west'],
      ['north', 'south', 'east', 'west', 'up'],
      ['out'],
      [],
      ['northeast', 'southwest'],
      ['north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest']
    ];
    
    let currentPattern = 0;
    
    const updateCompass = () => {
      const compassData = createMockCompassData(exitPatterns[currentPattern]);
      StorybookSessionMock.emitEvent('metadata/compass', compassData);
      currentPattern = (currentPattern + 1) % exitPatterns.length;
    };
    
    setTimeout(() => {
      updateCompass(); // Initial
      changeInterval = setInterval(updateCompass, 2000);
      
      // Clean up after 20 seconds
      setTimeout(() => {
        if (changeInterval) {
          clearInterval(changeInterval);
        }
      }, 20000);
    }, 100);
    
    return html`
      <div style="background: var(--sl-color-neutral-900); padding: 1rem; border-radius: 0.5rem; display: inline-block;">
        <h3 style="margin: 0 0 0.5rem 0; color: white; font-size: 1.1rem; text-align: center;">Changing Exits</h3>
        <p style="color: rgba(255,255,255,0.7); font-size: 0.8rem; text-align: center; margin: 0 0 1rem 0;">
          Watch exits change every 2 seconds
        </p>
        <illthorn-compass .session=${session}></illthorn-compass>
      </div>
    `;
  },
};