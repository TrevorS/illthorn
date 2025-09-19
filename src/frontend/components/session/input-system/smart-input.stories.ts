import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { MockDataGenerator } from "../../../utils/mock-data";
import "./smart-input.lit";

const meta: Meta = {
  title: "Input System/Smart Input",
  component: "illthorn-smart-input-lit",
  parameters: {
    docs: {
      description: {
        component: "Enhanced input field with command history navigation and readline-style keyboard shortcuts for sophisticated command entry.",
      },
    },
  },
  argTypes: {
    value: {
      control: "text",
      description: "Current input value",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text when empty",
    },
    disabled: {
      control: "boolean",
      description: "Whether input is disabled",
    },
    size: {
      control: { type: "radio" },
      options: ["small", "medium", "large"],
      description: "Input field size",
    },
    spellcheck: {
      control: "boolean",
      description: "Enable browser spellcheck",
    },
    maxHistorySize: {
      control: { type: "number", min: 10, max: 500 },
      description: "Maximum number of commands to store in history",
    },
    disabledReason: {
      control: "text",
      description: "Reason why input is disabled (shown in placeholder)",
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    value: "",
    placeholder: "Enter command...",
    disabled: false,
    size: "medium",
    spellcheck: false,
    maxHistorySize: 100,
  },
  render: (args) => html`
    <div style="padding: 20px; min-height: 150px;">
      <h4>Basic Smart Input</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
        Type commands and press Enter to submit. Try keyboard shortcuts!
      </p>
      <illthorn-smart-input-lit
        .value=${args.value}
        .placeholder=${args.placeholder}
        .disabled=${args.disabled}
        .size=${args.size}
        .spellcheck=${args.spellcheck}
        .maxHistorySize=${args.maxHistorySize}
        .commandHistory=${MockDataGenerator.generateCommandHistory()}
        @command-submit=${(e: CustomEvent) => {
          console.log("Command submitted:", e.detail.command);
          alert("Command submitted: " + e.detail.command);
        }}
      ></illthorn-smart-input-lit>
    </div>
  `,
};

export const WithPrefilledCommand: Story = {
  args: {
    value: "look at large wooden chest",
  },
  render: (args) => html`
    <div style="padding: 20px; min-height: 150px;">
      <h4>Pre-filled Command</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
        Input with pre-filled command text. Try Ctrl+A to select all or Ctrl+K to clear.
      </p>
      <illthorn-smart-input-lit
        .value=${args.value}
        placeholder="Enter command..."
      ></illthorn-smart-input-lit>
    </div>
  `,
};

export const CommandHistory: Story = {
  render: () => {
    const history = MockDataGenerator.generateCommandHistory();

    return html`
      <div style="padding: 20px; min-height: 250px;">
        <h4>Command History Navigation</h4>
        <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
          Use ↑/↓ arrow keys to navigate through command history. Type something, then use arrows to see preserved text.
        </p>
        <illthorn-smart-input-lit
          .commandHistory=${history}
          placeholder="Press ↑/↓ to navigate command history..."
          @command-submit=${(e: CustomEvent) => {
            console.log("Command submitted:", e.detail.command);
            alert("Submitted: " + e.detail.command);
          }}
        ></illthorn-smart-input-lit>
        <div style="margin-top: 15px; padding: 10px; background: var(--color-background-secondary); border-radius: 4px;">
          <div style="font-size: 0.9em; font-weight: bold; margin-bottom: 5px;">Available History (newest first):</div>
          <div style="font-family: monospace; font-size: 0.8em;">
            ${history.slice().reverse().slice(0, 8).map((cmd, i) => html`<div>${i + 1}. ${cmd}</div>`)}
          </div>
        </div>
      </div>
    `;
  },
};

export const KeyboardShortcuts: Story = {
  render: () => html`
    <div style="padding: 20px; min-height: 300px;">
      <h4>Readline-Style Keyboard Shortcuts</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
        Test all the readline-style keyboard shortcuts. Type some text first, then try the shortcuts.
      </p>
      <illthorn-smart-input-lit
        .commandHistory=${MockDataGenerator.generateCommandHistory()}
        .value="test some text for shortcuts"
        placeholder="Type text and test keyboard shortcuts..."
        @command-submit=${(e: CustomEvent) => {
          console.log("Command submitted:", e.detail.command);
          alert("Submitted: " + e.detail.command);
        }}
        @undo-request=${() => {
          console.log("Undo requested");
          alert("Undo requested (no more undo history)");
        }}
      ></illthorn-smart-input-lit>

      <div style="margin-top: 20px; padding: 15px; background: var(--color-background-secondary); border-radius: 4px;">
        <h5>Available Keyboard Shortcuts:</h5>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 0.9em;">
          <div>
            <strong>Navigation:</strong>
            <ul style="margin: 5px 0; padding-left: 15px;">
              <li><kbd>↑</kbd>/<kbd>↓</kbd> - Navigate command history</li>
              <li><kbd>Ctrl+Home</kbd> - Move cursor to beginning</li>
              <li><kbd>Ctrl+End</kbd> - Move cursor to end</li>
            </ul>
          </div>
          <div>
            <strong>Editing:</strong>
            <ul style="margin: 5px 0; padding-left: 15px;">
              <li><kbd>Ctrl+A</kbd> - Select all text</li>
              <li><kbd>Ctrl+K</kbd> - Clear input</li>
              <li><kbd>Ctrl+W</kbd> - Delete word backward</li>
              <li><kbd>Ctrl+Z</kbd> - Undo last action</li>
            </ul>
          </div>
        </div>
        <div style="margin-top: 10px;">
          <strong>Commands:</strong>
          <ul style="margin: 5px 0; padding-left: 15px; font-size: 0.9em;">
            <li><kbd>Ctrl+R</kbd> - Repeat last command</li>
            <li><kbd>Ctrl+L</kbd> - Focus input</li>
            <li><kbd>Enter</kbd> - Submit command</li>
          </ul>
        </div>
      </div>
    </div>
  `,
};

export const DisabledStates: Story = {
  render: () => html`
    <div style="padding: 20px;">
      <h4>Disabled States</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
        Input is disabled in various game states with descriptive placeholders.
      </p>
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div>
          <div style="margin-bottom: 10px; font-weight: bold;">Roundtime Active (3s)</div>
          <illthorn-smart-input-lit
            .disabled=${true}
            .value="attack goblin"
            placeholder="Input disabled during roundtime..."
            .disabledReason="roundtime active"
          ></illthorn-smart-input-lit>
        </div>
        <div>
          <div style="margin-bottom: 10px; font-weight: bold;">Casting Spell (2s)</div>
          <illthorn-smart-input-lit
            .disabled=${true}
            .value="cast 401"
            placeholder="Input disabled while casting..."
            .disabledReason="casting spell"
          ></illthorn-smart-input-lit>
        </div>
        <div>
          <div style="margin-bottom: 10px; font-weight: bold;">Character Stunned</div>
          <illthorn-smart-input-lit
            .disabled=${true}
            placeholder="Input disabled while stunned..."
            .disabledReason="stunned"
          ></illthorn-smart-input-lit>
        </div>
        <div>
          <div style="margin-bottom: 10px; font-weight: bold;">Normal State (for comparison)</div>
          <illthorn-smart-input-lit
            .disabled=${false}
            placeholder="Normal input - ready for commands"
          ></illthorn-smart-input-lit>
        </div>
      </div>
    </div>
  `,
};

export const SizeVariations: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 20px; padding: 20px;">
      <h4>Size Variations</h4>
      <div style="display: flex; flex-direction: column; gap: 15px;">
        <div>
          <div style="margin-bottom: 8px; font-weight: bold;">Small</div>
          <illthorn-smart-input-lit
            size="small"
            .value="Small input field example"
            placeholder="Small input field..."
          ></illthorn-smart-input-lit>
        </div>
        <div>
          <div style="margin-bottom: 8px; font-weight: bold;">Medium (Default)</div>
          <illthorn-smart-input-lit
            size="medium"
            .value="Medium input field example"
            placeholder="Medium input field..."
          ></illthorn-smart-input-lit>
        </div>
        <div>
          <div style="margin-bottom: 8px; font-weight: bold;">Large</div>
          <illthorn-smart-input-lit
            size="large"
            .value="Large input field example"
            placeholder="Large input field..."
          ></illthorn-smart-input-lit>
        </div>
      </div>
    </div>
  `,
};

export const LongCommandTest: Story = {
  args: {
    value: "say This is a very long command that might exceed the normal width of the input field and we need to test how it handles scrolling and display of very long text content that users might type in typical game scenarios",
  },
  render: (args) => html`
    <div style="padding: 20px; min-height: 150px;">
      <h4>Long Command Handling</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
        Tests horizontal scrolling and cursor positioning with very long commands. Try using Ctrl+Home/End to navigate.
      </p>
      <illthorn-smart-input-lit
        .value=${args.value}
        placeholder="Type a very long command..."
        @command-submit=${(e: CustomEvent) => {
          console.log("Long command submitted:", e.detail.command);
        }}
      ></illthorn-smart-input-lit>
    </div>
  `,
};

export const MultipleInputScenarios: Story = {
  render: () => html`
    <div style="padding: 20px; min-height: 350px;">
      <h4>Multiple Input Scenarios</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
        Different input scenarios showing various command types and states.
      </p>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
        <div>
          <div style="margin-bottom: 10px; font-weight: bold;">Movement Commands</div>
          <illthorn-smart-input-lit
            .value="go north"
            .commandHistory=${["go north", "go east", "go west", "go up", "go down"]}
            placeholder="Movement commands..."
            @command-submit=${(e: CustomEvent) => {
              console.log("Movement command:", e.detail.command);
            }}
          ></illthorn-smart-input-lit>
          <div style="margin-top: 8px; font-size: 0.8em; color: var(--color-text-secondary);">
            Recent: go north, go east, go west, go up, go down
          </div>
        </div>
        <div>
          <div style="margin-bottom: 10px; font-weight: bold;">Combat Commands</div>
          <illthorn-smart-input-lit
            .value="attack goblin"
            .commandHistory=${["attack goblin", "attack orc", "cast 401", "stance offensive", "retreat"]}
            placeholder="Combat commands..."
            @command-submit=${(e: CustomEvent) => {
              console.log("Combat command:", e.detail.command);
            }}
          ></illthorn-smart-input-lit>
          <div style="margin-top: 8px; font-size: 0.8em; color: var(--color-text-secondary);">
            Recent: attack goblin, attack orc, cast 401, stance offensive, retreat
          </div>
        </div>
        <div>
          <div style="margin-bottom: 10px; font-weight: bold;">Social Commands</div>
          <illthorn-smart-input-lit
            .value="say Hello everyone!"
            .commandHistory=${["say Hello everyone!", "whisper to friend You there?", "smile", "bow"]}
            placeholder="Social commands..."
            @command-submit=${(e: CustomEvent) => {
              console.log("Social command:", e.detail.command);
            }}
          ></illthorn-smart-input-lit>
          <div style="margin-top: 8px; font-size: 0.8em; color: var(--color-text-secondary);">
            Recent: say Hello everyone!, whisper to friend, smile, bow
          </div>
        </div>
        <div>
          <div style="margin-bottom: 10px; font-weight: bold;">Utility Commands</div>
          <illthorn-smart-input-lit
            .value="look"
            .commandHistory=${["look", "inventory", "time", "who", "skills"]}
            placeholder="Utility commands..."
            @command-submit=${(e: CustomEvent) => {
              console.log("Utility command:", e.detail.command);
            }}
          ></illthorn-smart-input-lit>
          <div style="margin-top: 8px; font-size: 0.8em; color: var(--color-text-secondary);">
            Recent: look, inventory, time, who, skills
          </div>
        </div>
      </div>
    </div>
  `,
};

export const WordEditingDemo: Story = {
  render: () => html`
    <div style="padding: 20px; min-height: 200px;">
      <h4>Word Editing Features</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
        Demonstrates word-level editing capabilities. Try <kbd>Ctrl+W</kbd> to delete words backward.
      </p>
      <illthorn-smart-input-lit
        .value="look at large wooden chest in northeast corner"
        placeholder="Test word editing features..."
        @command-submit=${(e: CustomEvent) => {
          console.log("Command:", e.detail.command);
        }}
      ></illthorn-smart-input-lit>
      <div style="margin-top: 15px; padding: 10px; background: var(--color-background-secondary); border-radius: 4px;">
        <div style="font-size: 0.9em; font-weight: bold; margin-bottom: 5px;">Word Editing Features:</div>
        <ul style="font-size: 0.8em; margin: 0; padding-left: 15px;">
          <li><kbd>Ctrl+W</kbd> - Delete word backward</li>
          <li><kbd>Ctrl+A</kbd> - Select all text</li>
          <li><kbd>Ctrl+K</kbd> - Clear from cursor to end</li>
          <li><kbd>Ctrl+Home</kbd>/<kbd>Ctrl+End</kbd> - Move to start/end</li>
        </ul>
        <div style="margin-top: 8px; font-size: 0.8em; color: var(--color-text-secondary);">
          Position cursor anywhere in the text above and try Ctrl+W to delete the word at cursor.
        </div>
      </div>
    </div>
  `,
};

export const PerformanceTest: Story = {
  render: () => {
    const largeHistory = Array.from({ length: 200 }, (_, i) => `command ${i + 1} with some longer text to test performance`);

    return html`
      <div style="padding: 20px; min-height: 200px;">
        <h4>Performance Test - Large History</h4>
        <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
          Testing with 200 commands in history to ensure smooth navigation performance.
        </p>
        <illthorn-smart-input-lit
          .commandHistory=${largeHistory}
          .maxHistorySize=${200}
          placeholder="Use ↑/↓ to navigate through 200 commands..."
          @command-submit=${(e: CustomEvent) => {
            console.log("Performance test command:", e.detail.command);
          }}
        ></illthorn-smart-input-lit>
        <div style="margin-top: 10px; font-size: 0.8em; color: var(--color-text-secondary);">
          History contains 200 commands. Navigation should be responsive even with large history.
        </div>
      </div>
    `;
  },
};

export const DynamicScenarios: Story = {
  render: () => {
    const scenarios = [
      { name: "New Player", data: MockDataGenerator.scenarios.newPlayer() },
      { name: "Combat", data: MockDataGenerator.scenarios.combat() },
      { name: "Casting", data: MockDataGenerator.scenarios.casting() },
    ];

    return html`
      <div style="display: grid; grid-template-columns: 1fr; gap: 20px; padding: 20px;">
        <h4>Dynamic Input Scenarios</h4>
        <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
          Input behavior changes based on game state and character situation.
        </p>
        ${scenarios.map(
          (scenario) => html`
            <div style="border: 1px solid var(--color-border); padding: 15px; border-radius: 4px;">
              <div style="font-weight: bold; margin-bottom: 5px;">${scenario.name} Scenario</div>
              <div style="font-size: 0.9em; color: var(--color-text-secondary); margin-bottom: 10px;">
                Location: ${scenario.data.room.title}<br>
                Prompt State: ${scenario.data.promptState}<br>
                ${scenario.data.promptState !== "normal" ? "(Input disabled)" : "(Input enabled)"}
              </div>
              <illthorn-smart-input-lit
                .disabled=${scenario.data.promptState === "roundtime" ||
                           scenario.data.promptState === "casting" ||
                           scenario.data.promptState === "stunned"}
                .disabledReason=${scenario.data.promptState !== "normal" ? scenario.data.promptState : undefined}
                .commandHistory=${MockDataGenerator.generateCommandHistory()}
                placeholder=${scenario.data.promptState === "normal" ? "Enter command..." : `Disabled: ${scenario.data.promptState}`}
                @command-submit=${(e: CustomEvent) => {
                  console.log(`${scenario.name} command:`, e.detail.command);
                  alert(`${scenario.name}: ` + e.detail.command);
                }}
              ></illthorn-smart-input-lit>
            </div>
          `
        )}
      </div>
    `;
  },
};