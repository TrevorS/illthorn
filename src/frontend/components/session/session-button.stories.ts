import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./session-button.lit";

// Mock session data for stories
const createMockSession = (name: string, hasFocus = false) => ({
  name,
  hasFocus,
  id: `session-${name.toLowerCase()}`,
  connected: true,
  port: 8080,
});

const meta: Meta = {
  title: "Session/SessionButton",
  component: "illthorn-session-button",
  parameters: {
    docs: {
      description: {
        component:
          "Session switching button component that displays session name initial and tab number. Handles click events to focus sessions and automatically updates active state based on session focus events.",
      },
    },
  },
  argTypes: {
    session: {
      control: false,
      description: "Frontend session object containing name and state",
    },
    active: {
      control: "boolean",
      description: "Whether this session button represents the currently active session",
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    active: false,
  },
  render: (args) => html`
    <div style="width: 200px; padding: 1rem; background: var(--color-background); display: flex; justify-content: center;">
      <illthorn-session-button 
        .session=${createMockSession("Warrior")} 
        .active=${args.active}
      ></illthorn-session-button>
    </div>
  `,
};

export const Active: Story = {
  args: {
    active: true,
  },
  render: (args) => html`
    <div style="width: 200px; padding: 1rem; background: var(--color-background); display: flex; justify-content: center;">
      <illthorn-session-button 
        .session=${createMockSession("Wizard", true)} 
        .active=${args.active}
      ></illthorn-session-button>
    </div>
  `,
};

export const SessionStates: Story = {
  render: () => html`
    <div style="width: 400px; padding: 1rem; background: var(--color-background);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Session Button States</h3>
      
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; align-items: center;">
        <div style="text-align: center;">
          <h4 style="margin: 0 0 1rem 0; color: var(--color-text); font-size: 1rem;">Inactive (50% opacity)</h4>
          <illthorn-session-button 
            .session=${createMockSession("Rogue")} 
            .active=${false}
          ></illthorn-session-button>
        </div>
        
        <div style="text-align: center;">
          <h4 style="margin: 0 0 1rem 0; color: var(--color-text); font-size: 1rem;">Active (100% opacity)</h4>
          <illthorn-session-button 
            .session=${createMockSession("Paladin")} 
            .active=${true}
          ></illthorn-session-button>
        </div>
      </div>
      
      <p style="margin: 2rem 0 0 0; font-size: 0.9rem; color: var(--color-text-secondary); text-align: center;">
        Click inactive buttons to switch sessions. Active session is highlighted with full opacity.
      </p>
    </div>
  `,
};

export const CharacterNames: Story = {
  render: () => html`
    <div style="width: 500px; padding: 1rem; background: var(--color-background);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Different Character Names</h3>
      
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; align-items: center; text-align: center;">
        <div>
          <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 0.9rem;">Single Letter</h4>
          <illthorn-session-button 
            .session=${createMockSession("K")} 
            .active=${false}
          ></illthorn-session-button>
        </div>
        
        <div>
          <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 0.9rem;">Short Name</h4>
          <illthorn-session-button 
            .session=${createMockSession("Bob")} 
            .active=${false}
          ></illthorn-session-button>
        </div>
        
        <div>
          <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 0.9rem;">Long Name</h4>
          <illthorn-session-button 
            .session=${createMockSession("Shadowbane")} 
            .active=${true}
          ></illthorn-session-button>
        </div>
        
        <div>
          <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 0.9rem;">Lowercase</h4>
          <illthorn-session-button 
            .session=${createMockSession("archer")} 
            .active=${false}
          ></illthorn-session-button>
        </div>
        
        <div>
          <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 0.9rem;">Numbers</h4>
          <illthorn-session-button 
            .session=${createMockSession("Player123")} 
            .active=${false}
          ></illthorn-session-button>
        </div>
        
        <div>
          <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 0.9rem;">Special Chars</h4>
          <illthorn-session-button 
            .session=${createMockSession("Lord-Knight")} 
            .active=${false}
          ></illthorn-session-button>
        </div>
      </div>
      
      <p style="margin: 1.5rem 0 0 0; font-size: 0.9rem; color: var(--color-text-secondary); text-align: center;">
        Button shows first character of session name. Hover over buttons to see full name in tooltip.
      </p>
    </div>
  `,
};

export const SessionList: Story = {
  render: () => html`
    <div style="width: 300px; padding: 1rem; background: var(--color-surface); border-radius: 0.5rem;">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text); text-align: center;">Active Sessions</h3>
      
      <!-- Simulated session button list -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 0.2rem;">
        <illthorn-session-button 
          .session=${createMockSession("Warrior")} 
          .active=${true}
        ></illthorn-session-button>
        
        <illthorn-session-button 
          .session=${createMockSession("Wizard")} 
          .active=${false}
        ></illthorn-session-button>
        
        <illthorn-session-button 
          .session=${createMockSession("Rogue")} 
          .active=${false}
        ></illthorn-session-button>
        
        <illthorn-session-button 
          .session=${createMockSession("Paladin")} 
          .active=${false}
        ></illthorn-session-button>
      </div>
      
      <div style="margin-top: 1.5rem; text-align: center;">
        <p style="margin: 0 0 0.5rem 0; font-size: 0.9rem; color: var(--color-text);">
          <strong>Warrior</strong> (Active)
        </p>
        <p style="margin: 0; font-size: 0.8rem; color: var(--color-text-secondary);">
          Use Alt+1-4 or click to switch sessions
        </p>
      </div>
    </div>
  `,
};

export const InApplicationContext: Story = {
  render: () => html`
    <div style="width: 600px; background: var(--color-surface); border-radius: 0.5rem; overflow: hidden;">
      <!-- Simulated application header -->
      <div style="background: var(--color-background); padding: 0.5rem 1rem; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center;">
        <div style="color: var(--color-text); font-weight: bold;">Illthorn</div>
        <div style="color: var(--color-text-secondary); font-size: 0.9rem;">Connected</div>
      </div>
      
      <div style="display: grid; grid-template-columns: 80px 1fr; height: 400px;">
        <!-- Session sidebar -->
        <div style="background: var(--color-surface); border-right: 1px solid var(--color-border); padding: 1rem 0; display: flex; flex-direction: column; align-items: center; gap: 0.4rem;">
          <illthorn-session-button 
            .session=${createMockSession("Wizard")} 
            .active=${true}
          ></illthorn-session-button>
          
          <illthorn-session-button 
            .session=${createMockSession("Fighter")} 
            .active=${false}
          ></illthorn-session-button>
          
          <illthorn-session-button 
            .session=${createMockSession("Rogue")} 
            .active=${false}
          ></illthorn-session-button>
        </div>
        
        <!-- Main content area -->
        <div style="background: var(--color-background); padding: 1rem; color: var(--color-text);">
          <div style="text-align: center; margin-top: 2rem;">
            <h2 style="margin: 0 0 1rem 0;">Wizard Session</h2>
            <p style="color: var(--color-text-secondary); margin: 0 0 2rem 0;">Currently active session</p>
            
            <div style="background: var(--color-surface); padding: 1rem; border-radius: 0.5rem; text-align: left;">
              <div style="font-family: monospace; font-size: 0.9rem;">
                <div style="margin-bottom: 0.5rem;">&gt; look</div>
                <div style="margin-bottom: 0.5rem;">Town Square Central</div>
                <div style="color: var(--color-text-secondary);">You are standing in the town square...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};

export const InteractiveDemo: Story = {
  render: () => html`
    <div style="width: 500px; padding: 1rem; background: var(--color-background);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Interactive Demo</h3>
      
      <div style="display: flex; justify-content: center; gap: 1rem; margin: 2rem 0;">
        <illthorn-session-button 
          .session=${createMockSession("Gandalf")} 
          .active=${true}
        ></illthorn-session-button>
        
        <illthorn-session-button 
          .session=${createMockSession("Aragorn")} 
          .active=${false}
        ></illthorn-session-button>
        
        <illthorn-session-button 
          .session=${createMockSession("Legolas")} 
          .active=${false}
        ></illthorn-session-button>
      </div>
      
      <div style="text-align: center; color: var(--color-text);">
        <p style="margin: 0 0 1rem 0;">Try clicking the inactive buttons!</p>
        <p style="margin: 0; font-size: 0.9rem; color: var(--color-text-secondary);">
          (In actual app, this would switch to that session)
        </p>
      </div>
      
      <div style="margin-top: 2rem; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem;">
        <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 1rem;">Features:</h4>
        <ul style="margin: 0; padding-left: 1.5rem; color: var(--color-text-secondary); font-size: 0.9rem;">
          <li>Auto-numbered tabs based on position</li>
          <li>Hover effects for better UX</li>
          <li>Tooltip shows full character name</li>
          <li>Active state visual feedback</li>
          <li>Keyboard shortcuts (Alt+number)</li>
        </ul>
      </div>
    </div>
  `,
};

export const VisualStates: Story = {
  render: () => html`
    <div style="width: 600px; padding: 1rem; background: var(--color-background);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Visual State Breakdown</h3>
      
      <div style="display: grid; gap: 2rem;">
        <div style="display: flex; align-items: center; gap: 2rem;">
          <div style="text-align: center;">
            <div style="margin-bottom: 1rem;">
              <illthorn-session-button 
                .session=${createMockSession("Test")} 
                .active=${false}
              ></illthorn-session-button>
            </div>
            <h4 style="margin: 0; color: var(--color-text); font-size: 0.9rem;">Default State</h4>
            <p style="margin: 0.25rem 0 0 0; font-size: 0.8rem; color: var(--color-text-secondary);">50% opacity</p>
          </div>
          
          <div style="flex: 1; color: var(--color-text); font-size: 0.9rem;">
            <div style="margin-bottom: 0.5rem;"><strong>Visual Elements:</strong></div>
            <div style="margin-bottom: 0.25rem;">• 48×48px container with border</div>
            <div style="margin-bottom: 0.25rem;">• 34×34px circular button</div>
            <div style="margin-bottom: 0.25rem;">• Character initial (bold, centered)</div>
            <div style="margin-bottom: 0.25rem;">• Tab number badge (top-left)</div>
          </div>
        </div>
        
        <div style="display: flex; align-items: center; gap: 2rem;">
          <div style="text-align: center;">
            <div style="margin-bottom: 1rem;">
              <illthorn-session-button 
                .session=${createMockSession("Test")} 
                .active=${true}
              ></illthorn-session-button>
            </div>
            <h4 style="margin: 0; color: var(--color-text); font-size: 0.9rem;">Active State</h4>
            <p style="margin: 0.25rem 0 0 0; font-size: 0.8rem; color: var(--color-text-secondary);">100% opacity</p>
          </div>
          
          <div style="flex: 1; color: var(--color-text); font-size: 0.9rem;">
            <div style="margin-bottom: 0.5rem;"><strong>Active Styling:</strong></div>
            <div style="margin-bottom: 0.25rem;">• Full opacity (1.0)</div>
            <div style="margin-bottom: 0.25rem;">• Reflects active attribute</div>
            <div style="margin-bottom: 0.25rem;">• Updates via SESSION_FOCUS events</div>
            <div style="margin-bottom: 0.25rem;">• Visual focus indicator</div>
          </div>
        </div>
      </div>
      
      <div style="margin-top: 2rem; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem; color: var(--color-text); font-size: 0.9rem;">
        <div style="margin-bottom: 0.5rem;"><strong>CSS Custom Properties Used:</strong></div>
        <div style="font-family: monospace; font-size: 0.8rem;">
          <div style="margin: 0.25rem 0;">--color-border: Border color</div>
          <div style="margin: 0.25rem 0;">--color-text-primary: Button text color</div>
          <div style="margin: 0.25rem 0;">--color-text-secondary: Badge background</div>
          <div style="margin: 0.25rem 0;">--color-background-primary: Badge text color</div>
        </div>
      </div>
    </div>
  `,
};
