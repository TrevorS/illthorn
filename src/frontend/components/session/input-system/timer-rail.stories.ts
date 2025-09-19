import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./timer-rail.lit";

const meta: Meta = {
  title: "Input System/Composite Components/Timer Rail",
  component: "illthorn-timer-rail-lit",
  parameters: {
    docs: {
      description: {
        component: "Composite component displaying multiple timers in a horizontal scrollable layout with management API.",
      },
    },
  },
  argTypes: {
    timers: {
      control: { type: "object" },
      description: "Array of timer objects to display",
    },
    compact: {
      control: "boolean",
      description: "Enable compact layout for smaller spaces",
    },
    showLabels: {
      control: "boolean",
      description: "Show labels on all timers",
    },
    maxTimers: {
      control: { type: "number", min: 0, max: 20 },
      description: "Maximum number of timers to display",
    },
  },
};

export default meta;
type Story = StoryObj;

const defaultTimers = [
  { id: "rt", label: "RT", value: 5, maxValue: 5, type: "countdown" as const, color: "#ff8c00" },
  { id: "ct", label: "CT", value: 3, maxValue: 8, type: "countdown" as const, color: "#4169e1" },
  { id: "spell", label: "Spell", value: 300, maxValue: 600, type: "countup" as const, color: "#9932cc" },
];

export const Default: Story = {
  args: {
    timers: defaultTimers,
    compact: false,
    showLabels: true,
    maxTimers: 6,
  },
  render: (args) => html`
    <div style="padding: 20px;">
      <h4>Timer Rail - Default</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
        Horizontal display of multiple timers with different types and colors.
      </p>
      <illthorn-timer-rail-lit
        .timers=${args.timers}
        .compact=${args.compact}
        .showLabels=${args.showLabels}
        .maxTimers=${args.maxTimers}
        @timer-expired=${(e: CustomEvent) => {
          console.log("Timer expired:", e.detail);
          alert(`Timer ${e.detail.label} expired!`);
        }}
        @timer-clicked=${(e: CustomEvent) => {
          console.log("Timer clicked:", e.detail);
          alert(`Clicked ${e.detail.label}: ${e.detail.value}`);
        }}
      ></illthorn-timer-rail-lit>
    </div>
  `,
};

export const EmptyState: Story = {
  args: {
    timers: [],
    compact: false,
    showLabels: true,
    maxTimers: 6,
  },
  render: (args) => html`
    <div style="padding: 20px;">
      <h4>Empty State</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
        Timer rail with no active timers.
      </p>
      <illthorn-timer-rail-lit
        .timers=${args.timers}
        .compact=${args.compact}
        .showLabels=${args.showLabels}
        .maxTimers=${args.maxTimers}
      ></illthorn-timer-rail-lit>
    </div>
  `,
};

export const CompactMode: Story = {
  args: {
    ...Default.args,
    compact: true,
  },
  render: (args) => html`
    <div style="padding: 20px;">
      <h4>Compact Mode</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
        Space-efficient layout for smaller areas or sidebars.
      </p>
      <illthorn-timer-rail-lit
        .timers=${args.timers}
        .compact=${args.compact}
        .showLabels=${args.showLabels}
        .maxTimers=${args.maxTimers}
        @timer-clicked=${(e: CustomEvent) => {
          console.log("Compact timer clicked:", e.detail);
        }}
      ></illthorn-timer-rail-lit>
    </div>
  `,
};

export const NoLabels: Story = {
  args: {
    ...Default.args,
    showLabels: false,
  },
  render: (args) => html`
    <div style="padding: 20px;">
      <h4>No Labels</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
        Ultra-minimal display showing only progress bars and values.
      </p>
      <illthorn-timer-rail-lit
        .timers=${args.timers}
        .compact=${args.compact}
        .showLabels=${args.showLabels}
        .maxTimers=${args.maxTimers}
      ></illthorn-timer-rail-lit>
    </div>
  `,
};

export const TimerTypes: Story = {
  args: {
    timers: [
      { id: "countdown", label: "Countdown", value: 15, maxValue: 30, type: "countdown" as const, color: "#ff6b6b" },
      { id: "countup", label: "Countup", value: 45, maxValue: 60, type: "countup" as const, color: "#4ecdc4" },
      { id: "static", label: "Static", value: 75, maxValue: 100, type: "static" as const, color: "#45b7d1" },
    ],
    compact: false,
    showLabels: true,
    maxTimers: 6,
  },
  render: (args) => html`
    <div style="padding: 20px;">
      <h4>Timer Types</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
        Different timer types: countdown (decreasing), countup (increasing), and static (fixed).
      </p>
      <illthorn-timer-rail-lit
        .timers=${args.timers}
        .compact=${args.compact}
        .showLabels=${args.showLabels}
        .maxTimers=${args.maxTimers}
      ></illthorn-timer-rail-lit>
    </div>
  `,
};

export const UrgentTimers: Story = {
  args: {
    timers: [
      { id: "rt-urgent", label: "RT", value: 1, maxValue: 5, type: "countdown" as const, color: "#ff8c00", urgent: true },
      { id: "ct-normal", label: "CT", value: 5, maxValue: 8, type: "countdown" as const, color: "#4169e1" },
      { id: "health-urgent", label: "Heal", value: 5, maxValue: 30, type: "countdown" as const, color: "#28a745", urgent: true },
    ],
    compact: false,
    showLabels: true,
    maxTimers: 6,
  },
  render: (args) => html`
    <div style="padding: 20px;">
      <h4>Urgent Timers</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
        Timers with urgent state show pulsing animation and red highlighting.
      </p>
      <illthorn-timer-rail-lit
        .timers=${args.timers}
        .compact=${args.compact}
        .showLabels=${args.showLabels}
        .maxTimers=${args.maxTimers}
        @timer-expired=${(e: CustomEvent) => {
          console.log("Urgent timer expired:", e.detail);
          alert(`⚠️ URGENT: ${e.detail.label} expired!`);
        }}
      ></illthorn-timer-rail-lit>
    </div>
  `,
};

export const ManyTimers: Story = {
  args: {
    timers: [
      { id: "rt", label: "RT", value: 3, maxValue: 5, type: "countdown" as const, color: "#ff8c00" },
      { id: "ct", label: "CT", value: 2, maxValue: 8, type: "countdown" as const, color: "#4169e1" },
      { id: "spell1", label: "Blur", value: 180, maxValue: 300, type: "countup" as const, color: "#9932cc" },
      { id: "spell2", label: "Haste", value: 240, maxValue: 400, type: "countup" as const, color: "#ff1493" },
      { id: "spell3", label: "Shield", value: 120, maxValue: 200, type: "countup" as const, color: "#00ced1" },
      { id: "spell4", label: "Bless", value: 90, maxValue: 120, type: "countup" as const, color: "#ffd700" },
      { id: "spell5", label: "Prayer", value: 60, maxValue: 100, type: "countup" as const, color: "#adff2f" },
      { id: "spell6", label: "Spirit", value: 300, maxValue: 500, type: "countup" as const, color: "#ff69b4" },
    ],
    compact: false,
    showLabels: true,
    maxTimers: 6,
  },
  render: (args) => html`
    <div style="padding: 20px;">
      <h4>Many Timers with Scrolling</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
        When there are more timers than maxTimers, the rail becomes scrollable horizontally.
      </p>
      <illthorn-timer-rail-lit
        .timers=${args.timers}
        .compact=${args.compact}
        .showLabels=${args.showLabels}
        .maxTimers=${args.maxTimers}
      ></illthorn-timer-rail-lit>
      <div style="margin-top: 10px; font-size: 0.9em; color: var(--color-text-secondary);">
        Total timers: ${args.timers.length} | Max displayed: ${args.maxTimers} | Scroll to see more →
      </div>
    </div>
  `,
};

export const LimitedTimers: Story = {
  args: {
    ...ManyTimers.args,
    maxTimers: 3,
  },
  render: (args) => html`
    <div style="padding: 20px;">
      <h4>Limited Timer Display</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
        Only first 3 timers are shown when maxTimers is set to 3.
      </p>
      <illthorn-timer-rail-lit
        .timers=${args.timers}
        .compact=${args.compact}
        .showLabels=${args.showLabels}
        .maxTimers=${args.maxTimers}
      ></illthorn-timer-rail-lit>
      <div style="margin-top: 10px; font-size: 0.9em; color: var(--color-text-secondary);">
        Showing ${args.maxTimers} of ${args.timers.length} timers
      </div>
    </div>
  `,
};

export const ResponsiveDemo: Story = {
  render: () => html`
    <div style="padding: 20px;">
      <h4>Responsive Layout Demo</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
        Resize containers to see how the timer rail adapts to different widths.
      </p>
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div style="border: 1px solid var(--color-border); padding: 10px;">
          <h5>Wide Layout (600px)</h5>
          <div style="width: 600px; border: 1px dashed #ccc;">
            <illthorn-timer-rail-lit
              .timers=${defaultTimers}
              .showLabels=${true}
            ></illthorn-timer-rail-lit>
          </div>
        </div>

        <div style="border: 1px solid var(--color-border); padding: 10px;">
          <h5>Medium Layout (400px)</h5>
          <div style="width: 400px; border: 1px dashed #ccc;">
            <illthorn-timer-rail-lit
              .timers=${defaultTimers}
              .showLabels=${true}
            ></illthorn-timer-rail-lit>
          </div>
        </div>

        <div style="border: 1px solid var(--color-border); padding: 10px;">
          <h5>Narrow Layout (250px) - Compact</h5>
          <div style="width: 250px; border: 1px dashed #ccc;">
            <illthorn-timer-rail-lit
              .timers=${defaultTimers}
              .compact=${true}
              .showLabels=${false}
            ></illthorn-timer-rail-lit>
          </div>
        </div>
      </div>
    </div>
  `,
};

export const InteractiveDemo: Story = {
  render: () => {
    let timerRailRef: any;
    let timerId = 1;

    const addRandomTimer = () => {
      const types = ["countdown", "countup", "static"] as const;
      const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57", "#ff9ff3"];

      const newTimer = {
        id: `timer-${timerId++}`,
        label: `T${timerId - 1}`,
        value: Math.floor(Math.random() * 60) + 1,
        maxValue: Math.floor(Math.random() * 100) + 20,
        type: types[Math.floor(Math.random() * types.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        urgent: Math.random() > 0.8,
      };

      if (timerRailRef) {
        timerRailRef.addTimer(newTimer);
      }
    };

    const clearAllTimers = () => {
      if (timerRailRef) {
        timerRailRef.clearTimers();
      }
    };

    const updateRandomTimer = () => {
      if (timerRailRef && timerRailRef.getActiveTimerCount() > 0) {
        const timers = timerRailRef.timers;
        if (timers.length > 0) {
          const randomIndex = Math.floor(Math.random() * timers.length);
          const timerId = timers[randomIndex].id;
          timerRailRef.updateTimer(timerId, {
            value: Math.floor(Math.random() * 60) + 1,
            urgent: Math.random() > 0.7
          });
        }
      }
    };

    return html`
      <div style="padding: 20px;">
        <h4>Interactive Timer Management</h4>
        <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
          Use the buttons to add, update, or clear timers. Click on timers to see events.
        </p>

        <div style="margin-bottom: 20px;">
          <button @click=${addRandomTimer} style="margin-right: 10px;">Add Random Timer</button>
          <button @click=${updateRandomTimer} style="margin-right: 10px;">Update Random Timer</button>
          <button @click=${clearAllTimers}>Clear All</button>
        </div>

        <illthorn-timer-rail-lit
          ${(el: any) => { timerRailRef = el; }}
          .timers=${[
            { id: "rt", label: "RT", value: 5, maxValue: 5, type: "countdown" as const, color: "#ff8c00" },
            { id: "ct", label: "CT", value: 3, maxValue: 8, type: "countdown" as const, color: "#4169e1" },
          ]}
          @timer-expired=${(e: CustomEvent) => {
            console.log("Timer expired:", e.detail);
            alert(`⏰ ${e.detail.label} expired!`);
          }}
          @timer-clicked=${(e: CustomEvent) => {
            console.log("Timer clicked:", e.detail);
            alert(`Clicked ${e.detail.label}: ${e.detail.value}/${e.detail.maxValue}`);
          }}
        ></illthorn-timer-rail-lit>

        <div style="margin-top: 15px; padding: 10px; background: var(--color-background-secondary); border-radius: 4px; font-size: 0.9em;">
          <strong>API Methods Available:</strong>
          <ul style="margin: 5px 0; padding-left: 20px;">
            <li><code>addTimer(timer)</code> - Add a new timer</li>
            <li><code>removeTimer(id)</code> - Remove timer by ID</li>
            <li><code>updateTimer(id, updates)</code> - Update timer properties</li>
            <li><code>clearTimers()</code> - Remove all timers</li>
            <li><code>findTimer(id)</code> - Find timer by ID</li>
          </ul>
        </div>
      </div>
    `;
  },
};