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
        component:
          "Streams container component that manages session integration and business logic for stream content processing. Handles bus events for thoughts, speech, logon, logoff, and death streams.",
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
          Container with mock session integration
        </p>
        <p style="margin: 0 0 0.5rem 0; font-size: 0.8rem; color: #9ca3af;">
          Stream events would be triggered via session bus in actual usage
        </p>
      </div>
      <div style="flex: 1; border: 1px solid #374151; border-radius: 0.25rem; overflow: hidden;">
        <illthorn-streams-container .session=${args.session}></illthorn-streams-container>
      </div>
    </div>
  `,
};
