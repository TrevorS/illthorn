import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './compass.lit';
import { SimpleSessionMock } from '../../../../stories/mocks/simple-session';

const meta: Meta = {
  title: 'Session/Compass (Simple)',
  component: 'illthorn-compass',
  parameters: {
    docs: {
      description: {
        component: 'Clean compass stories with static data - no event noise.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const NoExits: Story = {
  render: () => {
    const session = SimpleSessionMock.create();
    
    return html`
      <illthorn-compass 
        .session=${session}
        .activeDirs=${[]}
      ></illthorn-compass>
    `;
  },
};

export const BasicExits: Story = {
  render: () => {
    const session = SimpleSessionMock.create();
    
    return html`
      <illthorn-compass 
        .session=${session}
        .activeDirs=${['north', 'south']}
      ></illthorn-compass>
    `;
  },
};

export const FullCompass: Story = {
  render: () => {
    const session = SimpleSessionMock.create();
    
    return html`
      <illthorn-compass 
        .session=${session}
        .activeDirs=${['north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest']}
      ></illthorn-compass>
    `;
  },
};

export const WithSpecialExits: Story = {
  render: () => {
    const session = SimpleSessionMock.create();
    
    return html`
      <illthorn-compass 
        .session=${session}
        .activeDirs=${['north', 'up', 'out']}
      ></illthorn-compass>
    `;
  },
};

export const SingleExit: Story = {
  render: () => {
    const session = SimpleSessionMock.create();
    
    return html`
      <illthorn-compass 
        .session=${session}
        .activeDirs=${['out']}
      ></illthorn-compass>
    `;
  },
};