import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./roundtime-timer.lit";

const meta: Meta = {
  title: "Session/Timers/RoundtimeTimer",
  component: "illthorn-roundtime-timer-lit",
  parameters: {
    docs: {
      description: {
        component:
          "Countdown timer component that displays action cooldown (roundtime) remaining with smooth progress bar animation. Subscribes to metadata/roundTime events and uses red danger color styling.",
      },
    },
  },
  argTypes: {
    session: {
      control: false,
      description: "Frontend session object (not controllable in Storybook)",
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <div style="width: 300px; padding: 1rem; background: var(--color-background);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Roundtime Timer (Inactive)</h3>
      <illthorn-roundtime-timer-lit></illthorn-roundtime-timer-lit>
      <p style="margin: 1rem 0 0 0; font-size: 0.9rem; color: var(--color-text-secondary);">
        Timer is hidden when inactive (opacity: 0). It becomes visible during action cooldowns.
      </p>
    </div>
  `,
};

export const ActiveTimer: Story = {
  render: () => html`
    <div style="width: 300px; padding: 1rem; background: var(--color-background);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Active Roundtime Timer</h3>
      <div style="position: relative;">
        <illthorn-roundtime-timer-lit class="active" style="--indicator-color: var(--color-danger, red);"></illthorn-roundtime-timer-lit>
        <!-- Simulated progress bar for demo -->
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: rgba(255,255,255,0.1);">
          <div style="height: 100%; width: 65%; background: var(--color-danger, red); transition: width 0.1s ease-out;"></div>
        </div>
      </div>
      <p style="margin: 1rem 0 0 0; font-size: 0.9rem; color: var(--color-text-secondary);">
        Timer showing 65% progress with red danger color indicating action cooldown.
      </p>
    </div>
  `,
};

export const ProgressStages: Story = {
  render: () => html`
    <div style="width: 400px; padding: 1rem; background: var(--color-background);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Roundtime Progress Stages</h3>
      
      <div style="margin-bottom: 2rem;">
        <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 1rem;">Starting (100%)</h4>
        <div style="position: relative; height: 3px;">
          <div style="width: 100%; height: 3px; background: rgba(255,255,255,0.1);">
            <div style="height: 100%; width: 100%; background: var(--color-danger, red);"></div>
          </div>
        </div>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.8rem; color: var(--color-text-secondary);">Action just performed, full cooldown</p>
      </div>

      <div style="margin-bottom: 2rem;">
        <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 1rem;">In Progress (55%)</h4>
        <div style="position: relative; height: 3px;">
          <div style="width: 100%; height: 3px; background: rgba(255,255,255,0.1);">
            <div style="height: 100%; width: 55%; background: var(--color-danger, red);"></div>
          </div>
        </div>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.8rem; color: var(--color-text-secondary);">Cooldown in progress</p>
      </div>

      <div style="margin-bottom: 2rem;">
        <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 1rem;">Nearly Complete (20%)</h4>
        <div style="position: relative; height: 3px;">
          <div style="width: 100%; height: 3px; background: rgba(255,255,255,0.1);">
            <div style="height: 100%; width: 20%; background: var(--color-danger, red);"></div>
          </div>
        </div>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.8rem; color: var(--color-text-secondary);">Almost ready for next action</p>
      </div>

      <div>
        <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 1rem;">Complete (0%)</h4>
        <div style="position: relative; height: 3px; opacity: 0;">
          <div style="width: 100%; height: 3px; background: rgba(255,255,255,0.1);">
            <div style="height: 100%; width: 0%; background: var(--color-danger, red);"></div>
          </div>
        </div>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.8rem; color: var(--color-text-secondary);">Timer hidden when ready for action</p>
      </div>
    </div>
  `,
};

export const InGameContext: Story = {
  render: () => html`
    <div style="width: 500px; background: var(--color-surface); border-radius: 0.5rem; overflow: hidden;">
      <!-- Simulated command bar area -->
      <div style="background: var(--color-background); padding: 0.5rem; border-bottom: 1px solid var(--color-border);">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="color: var(--color-text-secondary); font-size: 0.9rem;">></span>
          <span style="color: var(--color-text); font-family: monospace;">swing sword at orc</span>
        </div>
      </div>
      
      <!-- Timer area -->
      <div style="position: relative; height: 3px;">
        <div style="width: 100%; height: 3px; background: rgba(255,255,255,0.1);">
          <div style="height: 100%; width: 75%; background: var(--color-danger, red); transition: width 3s linear;"></div>
        </div>
      </div>
      
      <!-- Game text area -->
      <div style="padding: 1rem; background: var(--color-background); color: var(--color-text); font-family: monospace; font-size: 0.9rem; min-height: 200px;">
        <div style="margin-bottom: 0.5rem;">You swing a steel longsword at an orc!</div>
        <div style="margin-bottom: 0.5rem; color: var(--color-success);">
          You hit the orc for 45 damage!
        </div>
        <div style="margin-bottom: 0.5rem; color: var(--color-text-secondary);">
          [Roundtime: 4 seconds]
        </div>
        <div style="color: var(--color-text-secondary);">
          You are still in combat cooldown...
        </div>
      </div>
    </div>
  `,
};

export const ComparisonWithCasttime: Story = {
  render: () => html`
    <div style="width: 400px; padding: 1rem; background: var(--color-background);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Timer Comparison</h3>
      
      <div style="margin-bottom: 2rem;">
        <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 1rem;">
          Roundtime Timer <span style="font-size: 0.8rem; color: var(--color-text-secondary);">(Red/Danger)</span>
        </h4>
        <div style="position: relative; height: 3px;">
          <div style="width: 100%; height: 3px; background: rgba(255,255,255,0.1);">
            <div style="height: 100%; width: 40%; background: var(--color-danger, red);"></div>
          </div>
        </div>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.8rem; color: var(--color-text-secondary);">
          Shows action cooldown progress
        </p>
      </div>

      <div>
        <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 1rem;">
          Casttime Timer <span style="font-size: 0.8rem; color: var(--color-text-secondary);">(Orange/Warning)</span>
        </h4>
        <div style="position: relative; height: 3px;">
          <div style="width: 100%; height: 3px; background: rgba(255,255,255,0.1);">
            <div style="height: 100%; width: 70%; background: var(--color-warning, orange);"></div>
          </div>
        </div>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.8rem; color: var(--color-text-secondary);">
          Shows spell casting progress
        </p>
      </div>
    </div>
  `,
};

export const CombatScenarios: Story = {
  render: () => html`
    <div style="width: 450px; padding: 1rem; background: var(--color-background);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Common Combat Scenarios</h3>
      
      <div style="margin-bottom: 2rem;">
        <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 1rem;">Melee Attack</h4>
        <div style="position: relative; height: 3px;">
          <div style="width: 100%; height: 3px; background: rgba(255,255,255,0.1);">
            <div style="height: 100%; width: 80%; background: var(--color-danger, red);"></div>
          </div>
        </div>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.8rem; color: var(--color-text-secondary);">
          Typical 3-5 second cooldown after weapon attacks
        </p>
      </div>

      <div style="margin-bottom: 2rem;">
        <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 1rem;">Ranged Attack</h4>
        <div style="position: relative; height: 3px;">
          <div style="width: 100%; height: 3px; background: rgba(255,255,255,0.1);">
            <div style="height: 100%; width: 60%; background: var(--color-danger, red);"></div>
          </div>
        </div>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.8rem; color: var(--color-text-secondary);">
          Bow/crossbow attacks with loading time
        </p>
      </div>

      <div style="margin-bottom: 2rem;">
        <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 1rem;">Spell Completion</h4>
        <div style="position: relative; height: 3px;">
          <div style="width: 100%; height: 3px; background: rgba(255,255,255,0.1);">
            <div style="height: 100%; width: 30%; background: var(--color-danger, red);"></div>
          </div>
        </div>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.8rem; color: var(--color-text-secondary);">
          Post-cast cooldown after offensive spells
        </p>
      </div>

      <div>
        <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 1rem;">Heavy Action</h4>
        <div style="position: relative; height: 3px;">
          <div style="width: 100%; height: 3px; background: rgba(255,255,255,0.1);">
            <div style="height: 100%; width: 90%; background: var(--color-danger, red);"></div>
          </div>
        </div>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.8rem; color: var(--color-text-secondary);">
          Longer cooldown for powerful abilities (6+ seconds)
        </p>
      </div>
    </div>
  `,
};

export const AccessibilityDemo: Story = {
  render: () => html`
    <div style="width: 400px; padding: 1rem; background: var(--color-background);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Accessibility Features</h3>
      
      <div style="margin-bottom: 1rem;">
        <illthorn-roundtime-timer-lit 
          class="active" 
          style="--indicator-color: var(--color-danger, red);"
          aria-label="Roundtime remaining"
        ></illthorn-roundtime-timer-lit>
        <!-- Simulated progress for demo -->
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: rgba(255,255,255,0.1); margin-top: -3px;">
          <div style="height: 100%; width: 45%; background: var(--color-danger, red);"></div>
        </div>
      </div>
      
      <div style="font-size: 0.9rem; color: var(--color-text);">
        <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem;">Built-in Accessibility:</h4>
        <ul style="margin: 0; padding-left: 1.5rem;">
          <li style="margin-bottom: 0.25rem;">
            <code style="background: rgba(255,255,255,0.1); padding: 0.1rem 0.3rem; border-radius: 3px;">aria-label</code>: 
            "Roundtime remaining"
          </li>
          <li style="margin-bottom: 0.25rem;">Progress bar semantics via Shoelace component</li>
          <li style="margin-bottom: 0.25rem;">Smooth animations with reduced motion support</li>
          <li style="margin-bottom: 0.25rem;">Keyboard accessible (focus management)</li>
          <li style="margin-bottom: 0.25rem;">
            Color coding: <span style="color: var(--color-danger, red);">Red</span> indicates restriction/cooldown
          </li>
          <li>Visual indicators with sufficient color contrast</li>
        </ul>
      </div>
    </div>
  `,
};
