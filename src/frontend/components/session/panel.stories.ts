import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./panel.lit";

const meta: Meta = {
  title: "Session/Panel",
  component: "illthorn-panel",
  parameters: {
    docs: {
      description: {
        component: "Collapsible content container using HTML details element with customizable title and open state.",
      },
    },
  },
  argTypes: {
    title: {
      control: "text",
      description: "The title displayed in the panel header",
    },
    open: {
      control: "boolean",
      description: "Whether the panel is open (expanded) or closed (collapsed)",
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    title: "Room",
    open: true,
  },
  render: (args) => html`
    <div style="width: 300px; background: var(--color-surface); border-radius: 0.5rem; overflow: hidden;">
      <illthorn-panel .title=${args.title} .open=${args.open}>
        <div style="padding: 1rem; background: var(--color-background); color: var(--color-text);">
          <p><strong>North Gate, Wehnimer's Landing</strong></p>
          <p>You are standing at the north gate of Wehnimer's Landing. The gate is open and you can see the town bustling with activity beyond.</p>
          <p><em>Obvious exits: north, south, east, west</em></p>
        </div>
      </illthorn-panel>
    </div>
  `,
};

export const Closed: Story = {
  args: {
    title: "Room",
    open: false,
  },
  render: (args) => html`
    <div style="width: 300px; background: var(--color-surface); border-radius: 0.5rem; overflow: hidden;">
      <illthorn-panel .title=${args.title} .open=${args.open}>
        <div style="padding: 1rem; background: var(--color-background); color: var(--color-text);">
          <p><strong>North Gate, Wehnimer's Landing</strong></p>
          <p>You are standing at the north gate of Wehnimer's Landing. The gate is open and you can see the town bustling with activity beyond.</p>
          <p><em>Obvious exits: north, south, east, west</em></p>
        </div>
      </illthorn-panel>
    </div>
  `,
};

export const Vitals: Story = {
  args: {
    title: "Vitals",
    open: true,
  },
  render: (args) => html`
    <div style="width: 300px; background: var(--color-surface); border-radius: 0.5rem; overflow: hidden;">
      <illthorn-panel .title=${args.title} .open=${args.open}>
        <div style="padding: 0.5rem; background: var(--color-background); color: var(--color-text);">
          <div style="display: grid; grid-template-columns: 1fr 3fr; gap: 0.5rem; align-items: center;">
            <span>Health:</span>
            <div style="background: rgba(255,255,255,0.1); border-radius: 3px; height: 20px; position: relative;">
              <div style="background: #4ade80; height: 100%; width: 85%; border-radius: 3px;"></div>
            </div>
            <span>Mana:</span>
            <div style="background: rgba(255,255,255,0.1); border-radius: 3px; height: 20px; position: relative;">
              <div style="background: #3b82f6; height: 100%; width: 72%; border-radius: 3px;"></div>
            </div>
            <span>Stamina:</span>
            <div style="background: rgba(255,255,255,0.1); border-radius: 3px; height: 20px; position: relative;">
              <div style="background: #f59e0b; height: 100%; width: 92%; border-radius: 3px;"></div>
            </div>
          </div>
        </div>
      </illthorn-panel>
    </div>
  `,
};

export const ActiveSpells: Story = {
  args: {
    title: "Active Spells",
    open: true,
  },
  render: (args) => html`
    <div style="width: 300px; background: var(--color-surface); border-radius: 0.5rem; overflow: hidden;">
      <illthorn-panel .title=${args.title} .open=${args.open}>
        <div style="padding: 0.5rem; background: var(--color-background); color: var(--color-text);">
          <div style="display: flex; flex-direction: column; gap: 0.25rem; font-size: 12px;">
            <div style="display: flex; justify-content: space-between; padding: 0.25rem 0;">
              <span>Bless</span>
              <span style="color: var(--color-success);">12:45</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 0.25rem 0;">
              <span>Spirit Warding I</span>
              <span style="color: var(--color-success);">8:20</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 0.25rem 0;">
              <span>Elemental Defense II</span>
              <span style="color: var(--color-warning);">4:15</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 0.25rem 0;">
              <span>Mass Blur</span>
              <span style="color: var(--color-danger);">1:30</span>
            </div>
          </div>
        </div>
      </illthorn-panel>
    </div>
  `,
};

export const EmptyPanel: Story = {
  args: {
    title: "Empty",
    open: true,
  },
  render: (args) => html`
    <div style="width: 300px; background: var(--color-surface); border-radius: 0.5rem; overflow: hidden;">
      <illthorn-panel .title=${args.title} .open=${args.open}>
        <div style="padding: 1rem; background: var(--color-background); color: var(--color-text-secondary); text-align: center; font-style: italic;">
          No content available
        </div>
      </illthorn-panel>
    </div>
  `,
};

export const LongTitle: Story = {
  args: {
    title: "Very Long Panel Title That Might Wrap",
    open: true,
  },
  render: (args) => html`
    <div style="width: 300px; background: var(--color-surface); border-radius: 0.5rem; overflow: hidden;">
      <illthorn-panel .title=${args.title} .open=${args.open}>
        <div style="padding: 1rem; background: var(--color-background); color: var(--color-text);">
          <p>This panel has a very long title to test how the header handles text overflow and wrapping.</p>
        </div>
      </illthorn-panel>
    </div>
  `,
};

export const MultiplePanels: Story = {
  render: () => html`
    <div style="width: 300px; display: flex; flex-direction: column; gap: 1px; background: var(--color-border);">
      <illthorn-panel title="Room" .open=${true}>
        <div style="padding: 0.75rem; background: var(--color-background); color: var(--color-text); font-size: 12px;">
          <p><strong>Town Square Central</strong></p>
          <p>This is the heart of the main square of Wehnimer's Landing.</p>
          <p><em>Obvious exits: north, south, east, west, northeast, northwest, southeast, southwest</em></p>
        </div>
      </illthorn-panel>
      
      <illthorn-panel title="Vitals" .open=${true}>
        <div style="padding: 0.5rem; background: var(--color-background); color: var(--color-text); font-size: 12px;">
          <div style="display: grid; grid-template-columns: auto 1fr; gap: 0.5rem; align-items: center;">
            <span>Health:</span>
            <div style="background: rgba(255,255,255,0.1); border-radius: 2px; height: 16px;">
              <div style="background: #4ade80; height: 100%; width: 85%; border-radius: 2px;"></div>
            </div>
            <span>Mana:</span>
            <div style="background: rgba(255,255,255,0.1); border-radius: 2px; height: 16px;">
              <div style="background: #3b82f6; height: 100%; width: 72%; border-radius: 2px;"></div>
            </div>
            <span>Stamina:</span>
            <div style="background: rgba(255,255,255,0.1); border-radius: 2px; height: 16px;">
              <div style="background: #f59e0b; height: 100%; width: 92%; border-radius: 2px;"></div>
            </div>
          </div>
        </div>
      </illthorn-panel>
      
      <illthorn-panel title="Active Spells" .open=${false}>
        <div style="padding: 0.5rem; background: var(--color-background); color: var(--color-text); font-size: 11px;">
          <div>Bless (12:45)</div>
          <div>Spirit Warding I (8:20)</div>
          <div>Elemental Defense II (4:15)</div>
        </div>
      </illthorn-panel>
      
      <illthorn-panel title="Injuries" .open=${true}>
        <div style="padding: 0.5rem; background: var(--color-background); color: var(--color-text); text-align: center; font-style: italic; font-size: 11px;">
          No injuries
        </div>
      </illthorn-panel>
    </div>
  `,
};

export const InteractiveDemo: Story = {
  args: {
    title: "Interactive Panel",
    open: true,
  },
  render: (args) => html`
    <div style="width: 300px; background: var(--color-surface); border-radius: 0.5rem; overflow: hidden;">
      <illthorn-panel .title=${args.title} .open=${args.open}>
        <div style="padding: 1rem; background: var(--color-background); color: var(--color-text);">
          <p>Click the header above to toggle this panel's visibility.</p>
          <p>This demonstrates the collapsible functionality using the native HTML details element.</p>
          <div style="margin-top: 1rem; padding: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 4px;">
            <strong>Features:</strong>
            <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
              <li>Native HTML details/summary semantics</li>
              <li>Smooth expand/collapse animation</li>
              <li>Keyboard accessible</li>
              <li>Customizable title and content</li>
            </ul>
          </div>
        </div>
      </illthorn-panel>
    </div>
  `,
};
