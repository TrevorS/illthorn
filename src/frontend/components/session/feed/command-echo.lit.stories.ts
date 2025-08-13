import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./command-echo.lit";

const meta: Meta = {
  title: "Session/Feed/CommandEcho",
  component: "illthorn-command-echo-lit",
  parameters: {
    docs: {
      description: {
        component:
          "Interactive command echo component with Shoelace integration. Displays echoed commands with copy functionality, timestamp tooltips, and visual distinction between regular and replay commands. Uses sl-tag for prefixes and sl-tooltip for enhanced UX.",
      },
    },
  },
  argTypes: {
    command: {
      control: "text",
      description: "The command text to display",
    },
    isReplay: {
      control: "boolean",
      description: "Whether this is a replay command (affects styling and prefix)",
    },
    timestamp: {
      control: "number",
      description: "Unix timestamp for the command execution time",
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    command: "look",
    isReplay: false,
    timestamp: Date.now(),
  },
};

export const ReplayCommand: Story = {
  args: {
    command: "cast 401",
    isReplay: true,
    timestamp: Date.now() - 30000, // 30 seconds ago
  },
};

export const WithTimestamp: Story = {
  args: {
    command: "inventory",
    isReplay: false,
    timestamp: new Date("2023-12-25 15:30:45").getTime(),
  },
  parameters: {
    docs: {
      description: {
        story: "Command with a specific timestamp that shows in the tooltip when hovering over the command text.",
      },
    },
  },
};

export const LongCommand: Story = {
  args: {
    command: "say This is a very long command that might wrap to multiple lines depending on the container width and font size settings",
    isReplay: false,
    timestamp: Date.now(),
  },
  parameters: {
    docs: {
      description: {
        story: "Tests how the component handles long command text with proper wrapping and layout.",
      },
    },
  },
};

export const InteractiveDemo: Story = {
  render: () => html`
    <div style="width: 500px; padding: 1rem; background: var(--color-background);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Interactive Command Echo</h3>
      
      <div style="margin-bottom: 2rem;">
        <illthorn-command-echo-lit
          command="get silver longsword"
          .isReplay=${false}
          .timestamp=${Date.now()}
        ></illthorn-command-echo-lit>
      </div>
      
      <div style="margin-bottom: 2rem;">
        <illthorn-command-echo-lit
          command="cast 401 at orc"
          .isReplay=${true}
          .timestamp=${Date.now() - 15000}
        ></illthorn-command-echo-lit>
      </div>
      
      <div style="color: var(--color-text); font-size: 0.9rem;">
        <h4 style="margin: 0 0 0.5rem 0;">Interactive Features:</h4>
        <ul style="margin: 0; padding-left: 1.5rem;">
          <li style="margin-bottom: 0.25rem;">Click command text to copy to clipboard</li>
          <li style="margin-bottom: 0.25rem;">Hover for timestamp tooltip</li>
          <li style="margin-bottom: 0.25rem;">Visual distinction between regular (>) and replay commands</li>
          <li>Shoelace tag components for consistent UI</li>
        </ul>
      </div>
    </div>
  `,
};

export const CopyFunctionality: Story = {
  render: () => html`
    <div style="width: 400px; padding: 1rem; background: var(--color-background);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Copy to Clipboard</h3>
      
      <div style="margin-bottom: 1rem;">
        <illthorn-command-echo-lit
          command="look north"
          .isReplay=${false}
          .timestamp=${Date.now()}
        ></illthorn-command-echo-lit>
      </div>
      
      <div style="margin-bottom: 1rem;">
        <illthorn-command-echo-lit
          command="wield bow"
          .isReplay=${false}
          .timestamp=${Date.now()}
        ></illthorn-command-echo-lit>
      </div>
      
      <div style="margin-bottom: 1rem;">
        <illthorn-command-echo-lit
          command="aim orc"
          .isReplay=${true}
          .timestamp=${Date.now() - 5000}
        ></illthorn-command-echo-lit>
      </div>
      
      <div style="padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem; color: var(--color-text); font-size: 0.9rem;">
        <div style="margin-bottom: 0.5rem;"><strong>Try it:</strong></div>
        <div style="margin-bottom: 0.25rem;">1. Click any command text above</div>
        <div style="margin-bottom: 0.25rem;">2. Command is copied to your clipboard</div>
        <div style="margin-bottom: 0.25rem;">3. Paste anywhere to verify</div>
        <div style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--color-text-secondary);">
          Includes fallback for browsers without Clipboard API
        </div>
      </div>
    </div>
  `,
};

export const TooltipDemo: Story = {
  render: () => html`
    <div style="width: 450px; padding: 1rem; background: var(--color-background);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Timestamp Tooltips</h3>
      
      <div style="margin-bottom: 2rem;">
        <h4 style="margin: 0 0 1rem 0; color: var(--color-text); font-size: 1rem;">Recent Command</h4>
        <illthorn-command-echo-lit
          command="north"
          .isReplay=${false}
          .timestamp=${Date.now() - 1000}
        ></illthorn-command-echo-lit>
      </div>
      
      <div style="margin-bottom: 2rem;">
        <h4 style="margin: 0 0 1rem 0; color: var(--color-text); font-size: 1rem;">30 Minutes Ago</h4>
        <illthorn-command-echo-lit
          command="prep 401"
          .isReplay=${true}
          .timestamp=${Date.now() - 30 * 60 * 1000}
        ></illthorn-command-echo-lit>
      </div>
      
      <div style="margin-bottom: 2rem;">
        <h4 style="margin: 0 0 1rem 0; color: var(--color-text); font-size: 1rem;">Earlier Today</h4>
        <illthorn-command-echo-lit
          command="get all from backpack"
          .isReplay=${false}
          .timestamp=${Date.now() - 3 * 60 * 60 * 1000}
        ></illthorn-command-echo-lit>
      </div>
      
      <div style="padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem; color: var(--color-text-secondary); font-size: 0.9rem;">
        <strong style="color: var(--color-text);">Hover over command text</strong> to see tooltips with:
        <div style="margin-top: 0.5rem;">• "Click to copy" instruction</div>
        <div>• Formatted execution timestamp</div>
      </div>
    </div>
  `,
};

export const HTMLEntityDecoding: Story = {
  render: () => html`
    <div style="width: 500px; padding: 1rem; background: var(--color-background);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">HTML Entity Decoding</h3>
      
      <div style="margin-bottom: 1rem;">
        <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 1rem;">Basic Entities</h4>
        <illthorn-command-echo-lit
          command="say Hello &gt; everyone &lt; test"
          .isReplay=${false}
          .timestamp=${Date.now()}
        ></illthorn-command-echo-lit>
      </div>
      
      <div style="margin-bottom: 1rem;">
        <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 1rem;">Ampersands & Quotes</h4>
        <illthorn-command-echo-lit
          command="whisper user &quot;Ready to go?&quot; &amp; let&apos;s start"
          .isReplay=${false}
          .timestamp=${Date.now()}
        ></illthorn-command-echo-lit>
      </div>
      
      <div style="margin-bottom: 1rem;">
        <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 1rem;">Complex Entities</h4>
        <illthorn-command-echo-lit
          command="say Testing &#8249; symbols &#8250; and &#8594; arrows"
          .isReplay=${true}
          .timestamp=${Date.now() - 10000}
        ></illthorn-command-echo-lit>
      </div>
      
      <div style="padding: 1rem; background: rgba(0, 255, 0, 0.1); border-radius: 0.5rem; color: var(--color-text); font-size: 0.9rem;">
        <div style="margin-bottom: 0.5rem;"><strong>✅ Automatic Decoding:</strong></div>
        <div style="margin-bottom: 0.25rem;">• &amp;gt; → > (greater than)</div>
        <div style="margin-bottom: 0.25rem;">• &amp;lt; → < (less than)</div>
        <div style="margin-bottom: 0.25rem;">• &amp;amp; → & (ampersand)</div>
        <div style="margin-bottom: 0.25rem;">• &amp;quot; → " (quote)</div>
        <div style="margin-bottom: 0.25rem;">• &amp;apos; → ' (apostrophe)</div>
        <div>• &#nnnn; → Unicode characters</div>
      </div>
    </div>
  `,
};

export const LichScriptCommands: Story = {
  render: () => html`
    <div style="width: 600px; padding: 1rem; background: var(--color-background);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Lich Script Commands</h3>
      
      <div style="margin-bottom: 2rem;">
        <h4 style="margin: 0 0 1rem 0; color: var(--color-text); font-size: 1rem;">Navigation Script (go2)</h4>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <illthorn-command-echo-lit
            command="[go2]&gt;east"
            .isReplay=${false}
            .timestamp=${Date.now() - 15000}
          ></illthorn-command-echo-lit>
          <illthorn-command-echo-lit
            command="[go2]&gt;go archway"
            .isReplay=${false}
            .timestamp=${Date.now() - 12000}
          ></illthorn-command-echo-lit>
          <illthorn-command-echo-lit
            command="[go2]&gt;north"
            .isReplay=${false}
            .timestamp=${Date.now() - 8000}
          ></illthorn-command-echo-lit>
        </div>
      </div>
      
      <div style="margin-bottom: 2rem;">
        <h4 style="margin: 0 0 1rem 0; color: var(--color-text); font-size: 1rem;">Combat Script (combat)</h4>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <illthorn-command-echo-lit
            command="[combat]&gt;target orc"
            .isReplay=${false}
            .timestamp=${Date.now() - 30000}
          ></illthorn-command-echo-lit>
          <illthorn-command-echo-lit
            command="[combat]&gt;attack"
            .isReplay=${true}
            .timestamp=${Date.now() - 25000}
          ></illthorn-command-echo-lit>
          <illthorn-command-echo-lit
            command="[combat]&gt;prep 401"
            .isReplay=${false}
            .timestamp=${Date.now() - 20000}
          ></illthorn-command-echo-lit>
        </div>
      </div>
      
      <div style="margin-bottom: 2rem;">
        <h4 style="margin: 0 0 1rem 0; color: var(--color-text); font-size: 1rem;">Hunting Script (bigshot)</h4>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <illthorn-command-echo-lit
            command="[bigshot]&gt;wield bow"
            .isReplay=${false}
            .timestamp=${Date.now() - 45000}
          ></illthorn-command-echo-lit>
          <illthorn-command-echo-lit
            command="[bigshot]&gt;aim orc"
            .isReplay=${false}
            .timestamp=${Date.now() - 40000}
          ></illthorn-command-echo-lit>
          <illthorn-command-echo-lit
            command="[bigshot]&gt;fire"
            .isReplay=${true}
            .timestamp=${Date.now() - 35000}
          ></illthorn-command-echo-lit>
        </div>
      </div>
      
      <div style="padding: 1rem; background: rgba(255, 165, 0, 0.1); border-left: 3px solid var(--color-warning, #ffa500); border-radius: 0.5rem;">
        <div style="color: var(--color-text); font-size: 0.9rem;">
          <div style="margin-bottom: 0.5rem;"><strong>🤖 Lich Script Features:</strong></div>
          <div style="margin-bottom: 0.25rem;">• Automatic detection of [scriptname]&gt;command format</div>
          <div style="margin-bottom: 0.25rem;">• "Script" tag with warning color (orange)</div>
          <div style="margin-bottom: 0.25rem;">• HTML entity decoding (&amp;gt; → >)</div>
          <div style="margin-bottom: 0.25rem;">• Same copy and timestamp functionality</div>
          <div>• Visual distinction from manual commands</div>
        </div>
      </div>
    </div>
  `,
};

export const HTMLSecurity: Story = {
  render: () => html`
    <div style="width: 500px; padding: 1rem; background: var(--color-background);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">HTML Security</h3>
      
      <div style="margin-bottom: 1rem;">
        <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 1rem;">Script Injection (Safe)</h4>
        <illthorn-command-echo-lit
          command="<script>alert('xss')</script>"
          .isReplay=${false}
          .timestamp=${Date.now()}
        ></illthorn-command-echo-lit>
      </div>
      
      <div style="margin-bottom: 1rem;">
        <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 1rem;">HTML Tags (Escaped)</h4>
        <illthorn-command-echo-lit
          command="say <b>Hello World</b>"
          .isReplay=${false}
          .timestamp=${Date.now()}
        ></illthorn-command-echo-lit>
      </div>
      
      <div style="margin-bottom: 1rem;">
        <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 1rem;">Event Handlers (Safe)</h4>
        <illthorn-command-echo-lit
          command='say <div onclick="malicious()">Click me</div>'
          .isReplay=${true}
          .timestamp=${Date.now()}
        ></illthorn-command-echo-lit>
      </div>
      
      <div style="padding: 1rem; background: var(--color-success); background: rgba(0, 255, 0, 0.1); border-radius: 0.5rem; color: var(--color-text); font-size: 0.9rem;">
        <div style="margin-bottom: 0.5rem;"><strong>✅ Security Features:</strong></div>
        <div style="margin-bottom: 0.25rem;">• All HTML is automatically escaped</div>
        <div style="margin-bottom: 0.25rem;">• Script tags are rendered as plain text</div>
        <div style="margin-bottom: 0.25rem;">• Event handlers cannot execute</div>
        <div>• Uses Lit's textContent for safe rendering</div>
      </div>
    </div>
  `,
};

export const SpecialCharacters: Story = {
  render: () => html`
    <div style="width: 500px; padding: 1rem; background: var(--color-background);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Special Characters</h3>
      
      <div style="margin-bottom: 1rem;">
        <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 1rem;">Quotes & Apostrophes</h4>
        <illthorn-command-echo-lit
          command='say "Hello, I\'m ready!"'
          .isReplay=${false}
          .timestamp=${Date.now()}
        ></illthorn-command-echo-lit>
      </div>
      
      <div style="margin-bottom: 1rem;">
        <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 1rem;">Ampersands & Symbols</h4>
        <illthorn-command-echo-lit
          command="get sword & shield"
          .isReplay=${false}
          .timestamp=${Date.now()}
        ></illthorn-command-echo-lit>
      </div>
      
      <div style="margin-bottom: 1rem;">
        <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 1rem;">Unicode Characters</h4>
        <illthorn-command-echo-lit
          command="say Hello! 👋 How are you? ⚔️"
          .isReplay=${true}
          .timestamp=${Date.now()}
        ></illthorn-command-echo-lit>
      </div>
      
      <div style="margin-bottom: 1rem;">
        <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 1rem;">Complex Punctuation</h4>
        <illthorn-command-echo-lit
          command="whisper 'Wait... what?! (Are you sure about this?)'"
          .isReplay=${false}
          .timestamp=${Date.now()}
        ></illthorn-command-echo-lit>
      </div>
      
      <div style="padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem; color: var(--color-text-secondary); font-size: 0.9rem;">
        All special characters are handled safely and display correctly without escaping issues.
      </div>
    </div>
  `,
};

export const EmptyCommand: Story = {
  render: () => html`
    <div style="width: 400px; padding: 1rem; background: var(--color-background);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Edge Cases</h3>
      
      <div style="margin-bottom: 1rem;">
        <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 1rem;">Empty Command</h4>
        <illthorn-command-echo-lit
          command=""
          .isReplay=${false}
          .timestamp=${Date.now()}
        ></illthorn-command-echo-lit>
      </div>
      
      <div style="margin-bottom: 1rem;">
        <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 1rem;">Whitespace Only</h4>
        <illthorn-command-echo-lit
          command="   "
          .isReplay=${false}
          .timestamp=${Date.now()}
        ></illthorn-command-echo-lit>
      </div>
      
      <div style="margin-bottom: 1rem;">
        <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text); font-size: 1rem;">No Timestamp</h4>
        <illthorn-command-echo-lit
          command="look"
          .isReplay=${false}
          .timestamp=${0}
        ></illthorn-command-echo-lit>
      </div>
      
      <div style="padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem; color: var(--color-text-secondary); font-size: 0.9rem;">
        <div style="margin-bottom: 0.5rem;"><strong style="color: var(--color-text);">Edge Case Handling:</strong></div>
        <div style="margin-bottom: 0.25rem;">• Empty commands still show prefix and structure</div>
        <div style="margin-bottom: 0.25rem;">• Copy functionality disabled for empty commands</div>
        <div>• Missing timestamps gracefully handled</div>
      </div>
    </div>
  `,
};

export const CommandTypes: Story = {
  render: () => html`
    <div style="width: 600px; padding: 1rem; background: var(--color-background);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Game Command Categories</h3>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
        <div>
          <h4 style="margin: 0 0 1rem 0; color: var(--color-text); font-size: 1rem;">Movement</h4>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <illthorn-command-echo-lit
              command="north"
              .isReplay=${false}
              .timestamp=${Date.now() - 10000}
            ></illthorn-command-echo-lit>
            <illthorn-command-echo-lit
              command="go door"
              .isReplay=${false}
              .timestamp=${Date.now() - 15000}
            ></illthorn-command-echo-lit>
            <illthorn-command-echo-lit
              command="climb stairs"
              .isReplay=${true}
              .timestamp=${Date.now() - 20000}
            ></illthorn-command-echo-lit>
          </div>
        </div>
        
        <div>
          <h4 style="margin: 0 0 1rem 0; color: var(--color-text); font-size: 1rem;">Combat</h4>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <illthorn-command-echo-lit
              command="attack orc"
              .isReplay=${false}
              .timestamp=${Date.now() - 5000}
            ></illthorn-command-echo-lit>
            <illthorn-command-echo-lit
              command="swing sword at goblin"
              .isReplay=${true}
              .timestamp=${Date.now() - 8000}
            ></illthorn-command-echo-lit>
            <illthorn-command-echo-lit
              command="aim bow"
              .isReplay=${false}
              .timestamp=${Date.now() - 12000}
            ></illthorn-command-echo-lit>
          </div>
        </div>
        
        <div>
          <h4 style="margin: 0 0 1rem 0; color: var(--color-text); font-size: 1rem;">Magic</h4>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <illthorn-command-echo-lit
              command="prep 401"
              .isReplay=${false}
              .timestamp=${Date.now() - 30000}
            ></illthorn-command-echo-lit>
            <illthorn-command-echo-lit
              command="cast at orc"
              .isReplay=${true}
              .timestamp=${Date.now() - 25000}
            ></illthorn-command-echo-lit>
            <illthorn-command-echo-lit
              command="incant 305"
              .isReplay=${false}
              .timestamp=${Date.now() - 35000}
            ></illthorn-command-echo-lit>
          </div>
        </div>
        
        <div>
          <h4 style="margin: 0 0 1rem 0; color: var(--color-text); font-size: 1rem;">Communication</h4>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <illthorn-command-echo-lit
              command="say Hello everyone!"
              .isReplay=${false}
              .timestamp=${Date.now() - 60000}
            ></illthorn-command-echo-lit>
            <illthorn-command-echo-lit
              command="whisper paladin Need healing"
              .isReplay=${false}
              .timestamp=${Date.now() - 45000}
            ></illthorn-command-echo-lit>
            <illthorn-command-echo-lit
              command="chat Ready to hunt?"
              .isReplay=${true}
              .timestamp=${Date.now() - 90000}
            ></illthorn-command-echo-lit>
          </div>
        </div>
      </div>
    </div>
  `,
};

export const ThemeIntegration: Story = {
  render: () => html`
    <div style="width: 500px; padding: 1rem; background: var(--color-background);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Theme Integration</h3>
      
      <div style="margin-bottom: 2rem;">
        <h4 style="margin: 0 0 1rem 0; color: var(--color-text); font-size: 1rem;">Regular Commands</h4>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <illthorn-command-echo-lit
            command="inventory"
            .isReplay=${false}
            .timestamp=${Date.now()}
          ></illthorn-command-echo-lit>
          <illthorn-command-echo-lit
            command="look around"
            .isReplay=${false}
            .timestamp=${Date.now()}
          ></illthorn-command-echo-lit>
        </div>
      </div>
      
      <div style="margin-bottom: 2rem;">
        <h4 style="margin: 0 0 1rem 0; color: var(--color-text); font-size: 1rem;">Replay Commands</h4>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <illthorn-command-echo-lit
            command="cast 401"
            .isReplay=${true}
            .timestamp=${Date.now() - 10000}
          ></illthorn-command-echo-lit>
          <illthorn-command-echo-lit
            command="prep 101"
            .isReplay=${true}
            .timestamp=${Date.now() - 15000}
          ></illthorn-command-echo-lit>
        </div>
      </div>
      
      <div style="padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem;">
        <div style="margin-bottom: 0.5rem; color: var(--color-text); font-weight: bold;">CSS Custom Properties Used:</div>
        <div style="font-family: monospace; font-size: 0.8rem; color: var(--color-text-secondary);">
          <div style="margin: 0.25rem 0;">--color-command-echo: Regular command color</div>
          <div style="margin: 0.25rem 0;">--color-command-echo-replay: Replay command color</div>
          <div style="margin: 0.25rem 0;">--color-command-echo-border: Left border color</div>
          <div style="margin: 0.25rem 0;">--color-command-echo-bg: Background color</div>
          <div style="margin: 0.25rem 0;">--font-family-monospace: Font family</div>
          <div style="margin: 0.25rem 0;">--color-surface: Hover background</div>
        </div>
      </div>
    </div>
  `,
};

export const FeedContext: Story = {
  render: () => html`
    <div style="width: 600px; background: var(--color-surface); border-radius: 0.5rem; overflow: hidden;">
      <!-- Simulated feed header -->
      <div style="background: var(--color-background); padding: 0.5rem 1rem; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center;">
        <div style="color: var(--color-text); font-weight: bold;">Game Feed</div>
        <div style="color: var(--color-text-secondary); font-size: 0.9rem;">Session: Wizard</div>
      </div>
      
      <!-- Feed content area -->
      <div style="background: var(--color-background); padding: 1rem; font-family: monospace; font-size: 0.9rem; min-height: 400px;">
        <!-- Game text -->
        <div style="margin-bottom: 0.5rem; color: var(--color-text);">
          <div style="color: var(--color-room-name, #ffffff); font-weight: bold; margin-bottom: 0.5rem;">Town Square Central</div>
          <div style="color: var(--color-room-description, #cccccc);">You are standing in the town square of a small village.</div>
        </div>
        
        <!-- Command echo in feed context -->
        <illthorn-command-echo-lit
          command="look merchant"
          .isReplay=${false}
          .timestamp=${Date.now() - 30000}
        ></illthorn-command-echo-lit>
        
        <!-- More game text -->
        <div style="margin: 0.5rem 0; color: var(--color-text);">
          You see a merchant standing near a wooden cart filled with various goods.
        </div>
        
        <!-- Another command echo -->
        <illthorn-command-echo-lit
          command="ask merchant about sword"
          .isReplay=${false}
          .timestamp=${Date.now() - 15000}
        ></illthorn-command-echo-lit>
        
        <!-- Game response -->
        <div style="margin: 0.5rem 0; color: var(--color-speech, #ffff88);">
          The merchant says, "Ah, you're interested in that silver longsword? It's 500 silvers."
        </div>
        
        <!-- Replay command -->
        <illthorn-command-echo-lit
          command="buy sword"
          .isReplay=${true}
          .timestamp=${Date.now() - 5000}
        ></illthorn-command-echo-lit>
        
        <!-- Game response -->
        <div style="margin: 0.5rem 0; color: var(--color-text);">
          You purchase a silver longsword for 500 silvers.
        </div>
      </div>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: "Shows how command echo components integrate within the game feed context, mixed with game text and responses.",
      },
    },
  },
};

export const ChatLog: Story = {
  render: () => html`
    <div style="width: 550px; padding: 1rem; background: var(--color-background);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Game Session Chat Log</h3>
      
      <div style="background: var(--color-surface); padding: 1rem; border-radius: 0.5rem; font-family: monospace; font-size: 0.9rem; height: 350px; overflow-y: auto;">
        <illthorn-command-echo-lit
          command="chat Hello everyone!"
          .isReplay=${false}
          .timestamp=${Date.now() - 300000}
        ></illthorn-command-echo-lit>
        
        <div style="margin: 0.5rem 0; color: var(--color-text);">[Chat] You: "Hello everyone!"</div>
        <div style="margin: 0.5rem 0; color: var(--color-speech, #ffff88);">[Chat] Paladin: "Hey there!"</div>
        
        <illthorn-command-echo-lit
          command="[go2]&gt;east"
          .isReplay=${false}
          .timestamp=${Date.now() - 290000}
        ></illthorn-command-echo-lit>
        
        <div style="margin: 0.5rem 0; color: var(--color-text);">You head east.</div>
        
        <illthorn-command-echo-lit
          command="prep 401"
          .isReplay=${false}
          .timestamp=${Date.now() - 280000}
        ></illthorn-command-echo-lit>
        
        <div style="margin: 0.5rem 0; color: var(--color-text);">You begin to weave the intricate pattern for Minor Elemental Edging...</div>
        
        <illthorn-command-echo-lit
          command="cast at orc"
          .isReplay=${false}
          .timestamp=${Date.now() - 250000}
        ></illthorn-command-echo-lit>
        
        <div style="margin: 0.5rem 0; color: var(--color-text);">You gesture at the orc. A brilliant silver blade materializes in the air!</div>
        
        <illthorn-command-echo-lit
          command="attack orc"
          .isReplay=${true}
          .timestamp=${Date.now() - 200000}
        ></illthorn-command-echo-lit>
        
        <div style="margin: 0.5rem 0; color: var(--color-text);">You swing a silver longsword at an orc!</div>
        
        <illthorn-command-echo-lit
          command="whisper paladin Thanks for the heal!"
          .isReplay=${false}
          .timestamp=${Date.now() - 150000}
        ></illthorn-command-echo-lit>
        
        <div style="margin: 0.5rem 0; color: var(--color-whisper, #ff88ff);">You whisper to Paladin, "Thanks for the heal!"</div>
        
        <illthorn-command-echo-lit
          command="loot"
          .isReplay=${true}
          .timestamp=${Date.now() - 100000}
        ></illthorn-command-echo-lit>
        
        <div style="margin: 0.5rem 0; color: var(--color-text);">You search the orc and find 50 silvers and a crude iron sword.</div>
      </div>
      
      <div style="margin-top: 1rem; color: var(--color-text-secondary); font-size: 0.9rem; text-align: center;">
        Realistic game session showing mixed command types with timestamps
      </div>
    </div>
  `,
};

export const ReplaySession: Story = {
  render: () => html`
    <div style="width: 500px; padding: 1rem; background: var(--color-background);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Replay Session</h3>
      <p style="margin: 0 0 1rem 0; color: var(--color-text-secondary); font-size: 0.9rem;">
        Commands being replayed from a previous session or macro
      </p>
      
      <div style="background: var(--color-surface); padding: 1rem; border-radius: 0.5rem; height: 300px; overflow-y: auto;">
        <illthorn-command-echo-lit
          command="[combat]&gt;prep 401"
          .isReplay=${true}
          .timestamp=${Date.now() - 60000}
        ></illthorn-command-echo-lit>
        
        <illthorn-command-echo-lit
          command="[combat]&gt;cast at orc"
          .isReplay=${true}
          .timestamp=${Date.now() - 55000}
        ></illthorn-command-echo-lit>
        
        <illthorn-command-echo-lit
          command="attack orc"
          .isReplay=${true}
          .timestamp=${Date.now() - 50000}
        ></illthorn-command-echo-lit>
        
        <illthorn-command-echo-lit
          command="prep 101"
          .isReplay=${true}
          .timestamp=${Date.now() - 45000}
        ></illthorn-command-echo-lit>
        
        <illthorn-command-echo-lit
          command="cast"
          .isReplay=${true}
          .timestamp=${Date.now() - 40000}
        ></illthorn-command-echo-lit>
        
        <illthorn-command-echo-lit
          command="loot"
          .isReplay=${true}
          .timestamp=${Date.now() - 35000}
        ></illthorn-command-echo-lit>
        
        <illthorn-command-echo-lit
          command="skin orc"
          .isReplay=${true}
          .timestamp=${Date.now() - 30000}
        ></illthorn-command-echo-lit>
      </div>
      
      <div style="margin-top: 1rem; padding: 1rem; background: rgba(255, 204, 0, 0.1); border-left: 3px solid var(--color-warning, #ffcc00); border-radius: 0.5rem;">
        <div style="color: var(--color-text); font-size: 0.9rem;">
          <strong>Replay Commands:</strong> Distinguished with "Replay" tag and different coloring to indicate they're not manual input.
        </div>
      </div>
    </div>
  `,
};

export const CombatSequence: Story = {
  render: () => html`
    <div style="width: 600px; padding: 1rem; background: var(--color-background);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Combat Sequence</h3>
      <p style="margin: 0 0 1rem 0; color: var(--color-text-secondary); font-size: 0.9rem;">
        Rapid combat commands with precise timestamps
      </p>
      
      <div style="background: var(--color-surface); padding: 1rem; border-radius: 0.5rem; height: 350px; overflow-y: auto; font-family: monospace; font-size: 0.9rem;">
        <div style="margin-bottom: 0.5rem; color: var(--color-text); font-weight: bold;">
          [Combat begins at ${new Date(Date.now() - 120000).toLocaleTimeString()}]
        </div>
        
        <illthorn-command-echo-lit
          command="wield sword"
          .isReplay=${false}
          .timestamp=${Date.now() - 120000}
        ></illthorn-command-echo-lit>
        
        <div style="margin: 0.5rem 0; color: var(--color-text);">You draw your silver longsword with a flourish!</div>
        
        <illthorn-command-echo-lit
          command="attack orc"
          .isReplay=${false}
          .timestamp=${Date.now() - 115000}
        ></illthorn-command-echo-lit>
        
        <div style="margin: 0.5rem 0; color: var(--color-text);">You swing at an orc!</div>
        <div style="margin: 0.5rem 0; color: var(--color-success, #88ff88);">Hit! 45 damage!</div>
        <div style="margin: 0.5rem 0; color: var(--color-text-secondary);">[Roundtime: 4 seconds]</div>
        
        <illthorn-command-echo-lit
          command="attack orc"
          .isReplay=${true}
          .timestamp=${Date.now() - 111000}
        ></illthorn-command-echo-lit>
        
        <div style="margin: 0.5rem 0; color: var(--color-text);">You swing at an orc!</div>
        <div style="margin: 0.5rem 0; color: var(--color-success, #88ff88);">Critical hit! 78 damage!</div>
        
        <illthorn-command-echo-lit
          command="prep 401"
          .isReplay=${false}
          .timestamp=${Date.now() - 105000}
        ></illthorn-command-echo-lit>
        
        <div style="margin: 0.5rem 0; color: var(--color-text);">You begin to weave...</div>
        
        <illthorn-command-echo-lit
          command="cast at goblin"
          .isReplay=${false}
          .timestamp=${Date.now() - 100000}
        ></illthorn-command-echo-lit>
        
        <div style="margin: 0.5rem 0; color: var(--color-text);">You gesture! A silver blade flies forth!</div>
        <div style="margin: 0.5rem 0; color: var(--color-success, #88ff88);">Strike! 52 damage to goblin!</div>
        
        <div style="margin-top: 1rem; color: var(--color-text); font-weight: bold;">
          [Combat ends - Victory! Duration: ${((Date.now() - (Date.now() - 120000)) / 1000).toFixed(0)}s]
        </div>
      </div>
      
      <div style="margin-top: 1rem; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem; color: var(--color-text-secondary); font-size: 0.9rem;">
        <strong style="color: var(--color-text);">Combat Features:</strong>
        <div style="margin-top: 0.5rem;">• Precise timestamps for combat timing</div>
        <div>• Mix of manual and replayed commands</div>
        <div>• Integration with game combat feedback</div>
      </div>
    </div>
  `,
};
