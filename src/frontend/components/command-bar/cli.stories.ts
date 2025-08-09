import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./cli.lit";

const meta: Meta = {
  title: "Session/CLI",
  component: "illthorn-cli-lit",
  parameters: {
    docs: {
      description: {
        component: "Command-line interface component for game interaction with integrated timers, command history, readline-style key bindings, and support for multiple command types (game commands, internal :commands, and direct ;commands).",
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

export const ShoelaceTest: Story = {
  render: () => html`
    <div style="width: 500px; padding: 1rem; background: var(--color-surface, #333); border-radius: 0.5rem;">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text, #fff);">Shoelace Component Test</h3>
      <div style="background: var(--color-background, #222); padding: 0.5rem; border-radius: 0.25rem; min-height: 50px; border: 1px solid #666;">
        <sl-input placeholder="Test Shoelace input" style="
          --sl-input-background-color: rgba(255, 255, 255, 0.1);
          --sl-input-color: #fff;
          --sl-input-placeholder-color: rgba(255, 255, 255, 0.5);
        "></sl-input>
        <div style="color: #999; font-style: italic; margin-top: 0.5rem;">
          Raw sl-input test - if this shows, Shoelace is working
        </div>
      </div>
    </div>
  `,
};

export const Default: Story = {
  render: () => html`
    <div style="width: 500px; padding: 1rem; background: var(--color-surface, #333); border-radius: 0.5rem;">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text, #fff);">Default CLI</h3>
      <div style="background: var(--color-background, #222); padding: 0.5rem; border-radius: 0.25rem; min-height: 50px; border: 1px solid #666;">
        <illthorn-cli-lit></illthorn-cli-lit>
        <!-- Fallback content to test if component isn't loading -->
        <div style="color: #999; font-style: italic; margin-top: 0.5rem;">
          If CLI component doesn't appear above, there may be an import issue.
        </div>
      </div>
      <p style="margin: 1rem 0 0 0; font-size: 0.9rem; color: var(--color-text-secondary, #ccc);">
        Command input with integrated timer display area. Timers appear above input when active.
      </p>
    </div>
  `,
};

export const WithPlaceholderText: Story = {
  render: () => html`
    <div style="width: 500px; padding: 1rem; background: var(--color-surface, #333); border-radius: 0.5rem;">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text, #fff);">CLI with Placeholder</h3>
      <div style="background: var(--color-background, #222); padding: 0.5rem; border-radius: 0.25rem; min-height: 50px;">
        <illthorn-cli-lit></illthorn-cli-lit>
      </div>
      <p style="margin: 1rem 0 0 0; font-size: 0.9rem; color: var(--color-text-secondary, #ccc);">
        Shows placeholder text "Enter command..." when empty. Click to focus and start typing.
      </p>
    </div>
  `,
};

export const WithActiveTimers: Story = {
  render: () => html`
    <div style="width: 500px; padding: 1rem; background: var(--color-background);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">CLI with Active Timers</h3>
      <div style="position: relative;">
        <!-- Simulated CLI structure with timers -->
        <div style="display: flex; flex-direction: column; width: 100%;">
          <!-- Timer area -->
          <div style="display: flex; flex-direction: column; width: 100%; min-height: 8px; margin-bottom: 2px; gap: 1px;">
            <!-- Simulated roundtime timer -->
            <div style="width: 100%; height: 3px; background: rgba(255,255,255,0.1);">
              <div style="height: 100%; width: 65%; background: var(--color-danger, red); transition: width 0.1s ease-out;"></div>
            </div>
            <!-- Simulated casttime timer -->
            <div style="width: 100%; height: 3px; background: rgba(255,255,255,0.1);">
              <div style="height: 100%; width: 80%; background: var(--color-warning, orange); transition: width 0.1s ease-out;"></div>
            </div>
          </div>
          
          <!-- Input area -->
          <div style="display: flex; align-items: center; width: 100%;">
            <div style="
              width: 100%;
              background: rgba(255, 255, 255, 0.1);
              color: #fff;
              font-family: 'Monaco', 'Menlo', monospace;
              font-size: 1em;
              padding: 0.5em;
              border: none;
              outline: none;
            ">look</div>
          </div>
        </div>
      </div>
      <p style="margin: 1rem 0 0 0; font-size: 0.9rem; color: var(--color-text-secondary);">
        Both timers active: roundtime (red) and casttime (orange) with sample command input.
      </p>
    </div>
  `,
};

export const CommandTypes: Story = {
  render: () => html`
    <div style="width: 600px; padding: 1rem; background: var(--color-background);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Command Types</h3>
      
      <div style="display: grid; gap: 1.5rem;">
        <div>
          <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 1rem;">
            Game Commands <span style="font-size: 0.8rem; color: var(--color-text-secondary);">(default)</span>
          </h4>
          <div style="
            width: 100%;
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 1em;
            padding: 0.5em;
            border: none;
            outline: none;
            margin-bottom: 0.25rem;
          ">look around</div>
          <p style="margin: 0; font-size: 0.8rem; color: var(--color-text-secondary);">
            Regular commands sent to the game server
          </p>
        </div>

        <div>
          <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 1rem;">
            Internal Commands <span style="font-size: 0.8rem; color: var(--color-text-secondary);">(:prefix)</span>
          </h4>
          <div style="
            width: 100%;
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 1em;
            padding: 0.5em;
            border: none;
            outline: none;
            margin-bottom: 0.25rem;
          ">:theme dark-king</div>
          <p style="margin: 0; font-size: 0.8rem; color: var(--color-text-secondary);">
            Illthorn application commands (theme, settings, etc.)
          </p>
        </div>

        <div>
          <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 1rem;">
            Direct Commands <span style="font-size: 0.8rem; color: var(--color-text-secondary);">(;prefix)</span>
          </h4>
          <div style="
            width: 100%;
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 1em;
            padding: 0.5em;
            border: none;
            outline: none;
            margin-bottom: 0.25rem;
          ">;send get all</div>
          <p style="margin: 0; font-size: 0.8rem; color: var(--color-text-secondary);">
            Direct session commands, bypass normal processing
          </p>
        </div>

        <div>
          <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 1rem;">
            Multi-line Commands <span style="font-size: 0.8rem; color: var(--color-text-secondary);">(\\r separator)</span>
          </h4>
          <div style="
            width: 100%;
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 1em;
            padding: 0.5em;
            border: none;
            outline: none;
            margin-bottom: 0.25rem;
          ">get sword\\r wield sword</div>
          <p style="margin: 0; font-size: 0.8rem; color: var(--color-text-secondary);">
            Multiple commands executed in sequence
          </p>
        </div>
      </div>
    </div>
  `,
};

export const InGameContext: Story = {
  render: () => html`
    <div style="width: 600px; background: var(--color-surface); border-radius: 0.5rem; overflow: hidden;">
      <!-- Simulated game feed area -->
      <div style="background: var(--color-background); padding: 1rem; min-height: 300px; font-family: monospace; font-size: 0.9rem; color: var(--color-text);">
        <div style="margin-bottom: 0.5rem;">
          <span style="color: var(--color-text-secondary);">&gt;</span> look
        </div>
        <div style="margin-bottom: 1rem; color: var(--color-text);">
          <p style="margin: 0 0 0.5rem 0;"><strong>Town Square Central</strong></p>
          <p style="margin: 0 0 0.5rem 0;">This is the heart of the main square of Wehnimer's Landing. The town square is full of people and activity.</p>
          <p style="margin: 0; color: var(--color-text-secondary);"><em>Obvious exits: north, south, east, west, northeast, northwest, southeast, southwest</em></p>
        </div>
        <div style="margin-bottom: 0.5rem;">
          <span style="color: var(--color-text-secondary);">&gt;</span> <span style="color: var(--color-success);">swing sword at orc</span>
        </div>
        <div style="margin-bottom: 0.5rem; color: var(--color-success);">
          You swing a steel longsword at an orc!
        </div>
        <div style="margin-bottom: 0.5rem; color: var(--color-success);">
          You hit the orc for 45 damage!
        </div>
        <div style="color: var(--color-text-secondary);">
          [Roundtime: 3 seconds]
        </div>
      </div>
      
      <!-- CLI area with timers -->
      <div style="background: var(--color-background); border-top: 1px solid var(--color-border);">
        <!-- Timer area -->
        <div style="display: flex; flex-direction: column; width: 100%; min-height: 8px; margin-bottom: 2px; gap: 1px; padding: 0 1rem;">
          <!-- Active roundtime timer -->
          <div style="width: 100%; height: 3px; background: rgba(255,255,255,0.1);">
            <div style="height: 100%; width: 45%; background: var(--color-danger, red); transition: width 3s linear;"></div>
          </div>
        </div>
        
        <!-- Input area -->
        <div style="padding: 0 1rem 0.5rem 1rem;">
          <div style="display: flex; align-items: center; width: 100%;">
            <div style="
              width: 100%;
              background: rgba(255, 255, 255, 0.1);
              color: #fff;
              font-family: 'Monaco', 'Menlo', monospace;
              font-size: 1em;
              padding: 0.5em;
              border: none;
              outline: none;
            ">cast 401 at orc</div>
          </div>
        </div>
      </div>
    </div>
  `,
};

export const KeyboardFeatures: Story = {
  render: () => html`
    <div style="width: 600px; padding: 1rem; background: var(--color-background);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Keyboard Features</h3>
      
      <div style="margin-bottom: 2rem;">
        <illthorn-cli-lit></illthorn-cli-lit>
      </div>
      
      <div style="font-size: 0.9rem; color: var(--color-text);">
        <div style="display: grid; grid-template-columns: auto 1fr; gap: 1rem; margin-bottom: 1.5rem;">
          <div style="font-weight: bold;">Navigation:</div>
          <div>
            <div><kbd style="background: rgba(255,255,255,0.1); padding: 0.1rem 0.3rem; border-radius: 3px; margin-right: 0.5rem;">↑/↓</kbd>Command history</div>
            <div><kbd style="background: rgba(255,255,255,0.1); padding: 0.1rem 0.3rem; border-radius: 3px; margin-right: 0.5rem;">Ctrl+A/E</kbd>Line start/end</div>
            <div><kbd style="background: rgba(255,255,255,0.1); padding: 0.1rem 0.3rem; border-radius: 3px; margin-right: 0.5rem;">Alt+←/→</kbd>Word navigation</div>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: auto 1fr; gap: 1rem; margin-bottom: 1.5rem;">
          <div style="font-weight: bold;">Commands:</div>
          <div>
            <div><kbd style="background: rgba(255,255,255,0.1); padding: 0.1rem 0.3rem; border-radius: 3px; margin-right: 0.5rem;">Enter</kbd>Submit command</div>
            <div><kbd style="background: rgba(255,255,255,0.1); padding: 0.1rem 0.3rem; border-radius: 3px; margin-right: 0.5rem;">Ctrl+K</kbd>Clear input</div>
            <div><kbd style="background: rgba(255,255,255,0.1); padding: 0.1rem 0.3rem; border-radius: 3px; margin-right: 0.5rem;">Ctrl+P</kbd>Replay last command</div>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: auto 1fr; gap: 1rem;">
          <div style="font-weight: bold;">Features:</div>
          <div>
            <div>• Command echo in game log</div>
            <div>• Rapid history navigation</div>
            <div>• Automatic focus management</div>
            <div>• Integrated timer display</div>
            <div>• Multi-command support (\\r)</div>
          </div>
        </div>
      </div>
    </div>
  `,
};

export const StylingVariations: Story = {
  render: () => html`
    <div style="width: 700px; padding: 1rem; background: var(--color-background);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Styling Variations</h3>
      
      <div style="display: grid; gap: 2rem;">
        <div>
          <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 1rem;">Default Theme</h4>
          <div style="
            width: 100%;
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 1em;
            padding: 0.5em;
            border: none;
            outline: none;
          ">help commands</div>
        </div>

        <div>
          <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 1rem;">Focused State</h4>
          <div style="
            width: 100%;
            background: rgba(255, 255, 255, 0.15);
            color: #fff;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 1em;
            padding: 0.5em;
            border: none;
            outline: none;
            box-shadow: 0 0 0 1px rgba(255,255,255,0.1);
          ">inventory</div>
        </div>

        <div>
          <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 1rem;">With Placeholder</h4>
          <div style="
            width: 100%;
            background: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.5);
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 1em;
            font-style: italic;
            padding: 0.5em;
            border: none;
            outline: none;
          ">Enter command...</div>
        </div>
      </div>

      <div style="margin-top: 1.5rem; font-size: 0.9rem; color: var(--color-text);">
        <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem;">CSS Custom Properties:</h4>
        <div style="font-family: monospace; font-size: 0.8rem;">
          <div style="margin: 0.25rem 0;">--sl-input-background-color: rgba(255, 255, 255, 0.1)</div>
          <div style="margin: 0.25rem 0;">--sl-input-background-color-focus: rgba(255, 255, 255, 0.15)</div>
          <div style="margin: 0.25rem 0;">--sl-input-color: #fff</div>
          <div style="margin: 0.25rem 0;">--sl-input-font-family: "MonoLisa", monospace</div>
          <div style="margin: 0.25rem 0;">--sl-input-placeholder-color: rgba(255, 255, 255, 0.5)</div>
        </div>
      </div>
    </div>
  `,
};

export const AccessibilityDemo: Story = {
  render: () => html`
    <div style="width: 500px; padding: 1rem; background: var(--color-background);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Accessibility Features</h3>
      
      <div style="margin-bottom: 1rem;">
        <illthorn-cli-lit></illthorn-cli-lit>
      </div>
      
      <div style="font-size: 0.9rem; color: var(--color-text);">
        <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem;">Built-in Accessibility:</h4>
        <ul style="margin: 0; padding-left: 1.5rem;">
          <li style="margin-bottom: 0.25rem;">Semantic input element with proper labeling</li>
          <li style="margin-bottom: 0.25rem;">Keyboard navigation support (arrows, shortcuts)</li>
          <li style="margin-bottom: 0.25rem;">Screen reader compatible with Shoelace components</li>
          <li style="margin-bottom: 0.25rem;">Focus management and visual focus indicators</li>
          <li style="margin-bottom: 0.25rem;">Timer progress bars with aria-labels</li>
          <li style="margin-bottom: 0.25rem;">High contrast monospace font for readability</li>
          <li>Placeholder text provides usage guidance</li>
        </ul>
      </div>
    </div>
  `,
};