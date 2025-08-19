import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./streams-container.lit";

// Mock session for stories
const createMockSession = () => ({
  bus: {
    subscribeEvent: () => {},
    dispatchEvent: () => {},
    _ele: document.createElement("div"),
  },
});

const meta: Meta = {
  title: "Session/Streams/Container",
  component: "illthorn-streams-container",
  parameters: {
    docs: {
      description: {
        component: "Streams container component that manages session integration and business logic for stream content processing. Handles bus events for thoughts, speech, logon, logoff, and death streams.",
      },
    },
  },
  argTypes: {
    session: {
      control: "object",
      description: "Mock session object with bus for event handling",
    },
  },
};

export default meta;
type Story = StoryObj;

export const WithSession: Story = {
  args: {
    session: createMockSession(),
  },
  render: (args) => html`
    <div style="width: 400px; height: 300px; background: #1e293b; padding: 1rem; border-radius: 0.5rem; display: flex; flex-direction: column;">
      <p style="color: white; margin: 0 0 0.5rem 0; font-size: 0.9rem;">
        Container with mock session (empty state)
      </p>
      <div style="flex: 1; border: 1px solid #374151; border-radius: 0.25rem; overflow: hidden;">
        <illthorn-streams-container .session=${args.session}></illthorn-streams-container>
      </div>
    </div>
  `,
};

export const WithoutSession: Story = {
  args: {
    session: undefined,
  },
  render: (args) => html`
    <div style="width: 400px; height: 300px; background: #1e293b; padding: 1rem; border-radius: 0.5rem; display: flex; flex-direction: column;">
      <p style="color: white; margin: 0 0 0.5rem 0; font-size: 0.9rem;">
        Container without session
      </p>
      <div style="flex: 1; border: 1px solid #374151; border-radius: 0.25rem; overflow: hidden;">
        <illthorn-streams-container .session=${args.session}></illthorn-streams-container>
      </div>
    </div>
  `,
};

export const SimulatedEventFlow: Story = {
  args: {
    session: createMockSession(),
  },
  render: (args) => html`
    <div style="width: 400px; height: 400px; background: #1e293b; padding: 1rem; border-radius: 0.5rem; display: flex; flex-direction: column;">
      <div style="color: white; margin-bottom: 0.5rem;">
        <p style="margin: 0 0 0.5rem 0; font-size: 0.9rem;">
          Container with simulated stream events
        </p>
        <button 
          @click=${() => {
            const container = document.querySelector('illthorn-streams-container');
            if (container && container._handleStreamEntry) {
              const thoughtsTag = {
                name: 'stream',
                attrs: { id: 'thoughts' },
                text: 'Someone thinks, "This is a test thought message"',
                children: []
              };
              container._handleStreamEntry(thoughtsTag, 'thoughts');
            }
          }}
          style="margin: 0 0.5rem 0.5rem 0; padding: 0.25rem 0.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.25rem; cursor: pointer;"
        >
          Add Thought
        </button>
        <button 
          @click=${() => {
            const container = document.querySelector('illthorn-streams-container');
            if (container && container._handleStreamEntry) {
              const speechTag = {
                name: 'stream',
                attrs: { id: 'speech' },
                text: 'Someone says, "Hello everyone!"',
                children: []
              };
              container._handleStreamEntry(speechTag, 'speech');
            }
          }}
          style="margin: 0 0.5rem 0.5rem 0; padding: 0.25rem 0.5rem; background: #10b981; color: white; border: none; border-radius: 0.25rem; cursor: pointer;"
        >
          Add Speech
        </button>
        <button 
          @click=${() => {
            const container = document.querySelector('illthorn-streams-container');
            if (container && container._handleClear) {
              container._handleClear();
            }
          }}
          style="margin: 0 0.5rem 0.5rem 0; padding: 0.25rem 0.5rem; background: #ef4444; color: white; border: none; border-radius: 0.25rem; cursor: pointer;"
        >
          Clear
        </button>
      </div>
      <div style="flex: 1; border: 1px solid #374151; border-radius: 0.25rem; overflow: hidden;">
        <illthorn-streams-container .session=${args.session}></illthorn-streams-container>
      </div>
    </div>
  `,
};