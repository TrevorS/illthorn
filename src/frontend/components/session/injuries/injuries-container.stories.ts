import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./injuries-container.lit";

// Mock session for stories
const createMockSession = () => ({
  bus: {
    subscribeEvent: () => {},
    dispatchEvent: () => {},
    _ele: document.createElement("div"),
  },
});

const meta: Meta = {
  title: "Session/Injuries/Container",
  component: "illthorn-injuries-container",
  parameters: {
    docs: {
      description: {
        component: "Injuries container component that manages session integration and business logic for injury processing, anatomical sorting, and left/right pairing.",
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
    <div style="width: 200px; background: #1e293b; padding: 1rem; border-radius: 0.5rem;">
      <p style="color: white; margin: 0 0 0.5rem 0; font-size: 0.9rem;">
        Container with mock session (healthy state)
      </p>
      <illthorn-injuries-container .session=${args.session}></illthorn-injuries-container>
    </div>
  `,
};

export const WithoutSession: Story = {
  args: {
    session: undefined,
  },
  render: (args) => html`
    <div style="width: 200px; background: #1e293b; padding: 1rem; border-radius: 0.5rem;">
      <p style="color: white; margin: 0 0 0.5rem 0; font-size: 0.9rem;">
        Container without session
      </p>
      <illthorn-injuries-container .session=${args.session}></illthorn-injuries-container>
    </div>
  `,
};
