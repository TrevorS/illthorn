import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { MockDataGenerator } from "../../../utils/mock-data";
import "./command-line.lit";

const meta: Meta = {
  title: "Input System/Composite Components/Command Line",
  component: "illthorn-command-line-lit",
  parameters: {
    docs: {
      description: {
        component: "Composite component combining prompt indicator and smart input for synchronized command input interface.",
      },
    },
  },
  argTypes: {
    // Prompt properties
    promptState: {
      control: { type: "radio" },
      options: ["normal", "roundtime", "casting", "stunned", "dead", "sleeping"],
      description: "Current prompt state",
    },
    animated: {
      control: "boolean",
      description: "Enable prompt animation",
    },
    customSymbol: {
      control: "text",
      description: "Custom prompt symbol",
    },
    blinkRate: {
      control: { type: "number", min: 0.1, max: 3.0, step: 0.1 },
      description: "Prompt blink rate multiplier",
    },

    // Input properties
    value: {
      control: "text",
      description: "Current input value",
    },
    placeholder: {
      control: "text",
      description: "Input placeholder text",
    },
    disabled: {
      control: "boolean",
      description: "Disable input",
    },
    disabledReason: {
      control: "text",
      description: "Reason for disabled state",
    },
    commandHistory: {
      control: { type: "object" },
      description: "Array of command history",
    },
    maxHistorySize: {
      control: { type: "number", min: 10, max: 500 },
      description: "Maximum history size",
    },
    spellcheck: {
      control: "boolean",
      description: "Enable spellcheck",
    },

    // Layout properties
    size: {
      control: { type: "radio" },
      options: ["small", "medium", "large"],
      description: "Component size",
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    promptState: "normal",
    animated: true,
    customSymbol: "",
    blinkRate: 1.0,
    value: "",
    placeholder: "Enter command...",
    disabled: false,
    disabledReason: "",
    commandHistory: ["look", "inventory", "health"],
    maxHistorySize: 100,
    spellcheck: false,
    size: "medium",
  },
  render: (args) => html`
    <div style="padding: 20px;">
      <h4>Command Line - Default</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
        Standard command input with prompt indicator and smart input field.
      </p>
      <illthorn-command-line-lit
        .promptState=${args.promptState}
        .animated=${args.animated}
        .customSymbol=${args.customSymbol}
        .blinkRate=${args.blinkRate}
        .value=${args.value}
        .placeholder=${args.placeholder}
        .disabled=${args.disabled}
        .disabledReason=${args.disabledReason}
        .commandHistory=${args.commandHistory}
        .maxHistorySize=${args.maxHistorySize}
        .spellcheck=${args.spellcheck}
        .size=${args.size}
        @command-submit=${(e: CustomEvent) => {
          console.log("Command submitted:", e.detail.command);
          alert(`Command: ${e.detail.command}`);
        }}
        @input-focus=${(e: CustomEvent) => {
          console.log("Input focused");
        }}
        @input-blur=${(e: CustomEvent) => {
          console.log("Input blurred");
        }}
      ></illthorn-command-line-lit>
    </div>
  `,
};

export const DisabledStates: Story = {
  render: () => html`
    <div style="padding: 20px;">
      <h4>Disabled States</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
        Various disabled states with different prompt indicators and reasons.
      </p>
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div>
          <h5>Roundtime (3 seconds)</h5>
          <illthorn-command-line-lit
            promptState="roundtime"
            disabled=${true}
            disabledReason="roundtime"
            placeholder="Waiting for roundtime..."
            .commandHistory=${["attack orc", "dodge"]}
          ></illthorn-command-line-lit>
        </div>
        <div>
          <h5>Casting Spell</h5>
          <illthorn-command-line-lit
            promptState="casting"
            disabled=${true}
            disabledReason="casting"
            placeholder="Casting spell..."
            .commandHistory=${["prepare 401", "cast"]}
          ></illthorn-command-line-lit>
        </div>
        <div>
          <h5>Stunned</h5>
          <illthorn-command-line-lit
            promptState="stunned"
            disabled=${true}
            disabledReason="stunned"
            placeholder="You are stunned!"
            .commandHistory=${["stand", "look"]}
          ></illthorn-command-line-lit>
        </div>
        <div>
          <h5>Dead</h5>
          <illthorn-command-line-lit
            promptState="dead"
            disabled=${true}
            disabledReason="dead"
            placeholder="You are dead."
            .commandHistory=${["depart", "favor"]}
          ></illthorn-command-line-lit>
        </div>
        <div>
          <h5>Sleeping</h5>
          <illthorn-command-line-lit
            promptState="sleeping"
            disabled=${true}
            disabledReason="sleeping"
            placeholder="You are sleeping..."
            .commandHistory=${["sleep", "rest"]}
          ></illthorn-command-line-lit>
        </div>
      </div>
    </div>
  `,
};

export const SizeVariations: Story = {
  args: {
    ...Default.args,
    commandHistory: ["north", "south", "look"],
  },
  render: (args) => html`
    <div style="padding: 20px;">
      <h4>Size Variations</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
        Different sizes for various layout contexts.
      </p>
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div>
          <h5>Small Size</h5>
          <illthorn-command-line-lit
            .promptState=${args.promptState}
            .animated=${args.animated}
            .value=${args.value}
            .placeholder=${args.placeholder}
            .commandHistory=${args.commandHistory}
            size="small"
          ></illthorn-command-line-lit>
        </div>
        <div>
          <h5>Medium Size (Default)</h5>
          <illthorn-command-line-lit
            .promptState=${args.promptState}
            .animated=${args.animated}
            .value=${args.value}
            .placeholder=${args.placeholder}
            .commandHistory=${args.commandHistory}
            size="medium"
          ></illthorn-command-line-lit>
        </div>
        <div>
          <h5>Large Size</h5>
          <illthorn-command-line-lit
            .promptState=${args.promptState}
            .animated=${args.animated}
            .value=${args.value}
            .placeholder=${args.placeholder}
            .commandHistory=${args.commandHistory}
            size="large"
          ></illthorn-command-line-lit>
        </div>
      </div>
    </div>
  `,
};

export const CustomPromptSymbols: Story = {
  args: {
    ...Default.args,
    animated: true,
  },
  render: (args) => html`
    <div style="padding: 20px;">
      <h4>Custom Prompt Symbols</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
        Various custom prompt symbols with different states.
      </p>
      <div style="display: flex; flex-direction: column; gap: 15px;">
        <div>
          <h5>Hash Symbol (#)</h5>
          <illthorn-command-line-lit
            .promptState=${args.promptState}
            .animated=${args.animated}
            customSymbol="#"
            .placeholder=${args.placeholder}
            .commandHistory=${args.commandHistory}
          ></illthorn-command-line-lit>
        </div>
        <div>
          <h5>Dollar Sign ($)</h5>
          <illthorn-command-line-lit
            .promptState=${args.promptState}
            .animated=${args.animated}
            customSymbol="$"
            .placeholder=${args.placeholder}
            .commandHistory=${args.commandHistory}
          ></illthorn-command-line-lit>
        </div>
        <div>
          <h5>Arrow (➤)</h5>
          <illthorn-command-line-lit
            .promptState=${args.promptState}
            .animated=${args.animated}
            customSymbol="➤"
            .placeholder=${args.placeholder}
            .commandHistory=${args.commandHistory}
          ></illthorn-command-line-lit>
        </div>
        <div>
          <h5>Chevron (»)</h5>
          <illthorn-command-line-lit
            .promptState=${args.promptState}
            .animated=${args.animated}
            customSymbol="»"
            .placeholder=${args.placeholder}
            .commandHistory=${args.commandHistory}
          ></illthorn-command-line-lit>
        </div>
      </div>
    </div>
  `,
};

export const WithPrefilledInput: Story = {
  args: {
    ...Default.args,
    value: "cast at orc",
    promptState: "normal",
  },
  render: (args) => html`
    <div style="padding: 20px;">
      <h4>Pre-filled Input</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
        Command line with pre-filled input value, useful for command editing or echoing.
      </p>
      <illthorn-command-line-lit
        .promptState=${args.promptState}
        .animated=${args.animated}
        .value=${args.value}
        .placeholder=${args.placeholder}
        .commandHistory=${args.commandHistory}
        .size=${args.size}
        @command-submit=${(e: CustomEvent) => {
          console.log("Command submitted:", e.detail.command);
          alert(`Executing: ${e.detail.command}`);
        }}
      ></illthorn-command-line-lit>
    </div>
  `,
};

export const HistoryDemo: Story = {
  args: {
    ...Default.args,
    commandHistory: [
      "look",
      "inventory",
      "health",
      "north",
      "attack orc",
      "south",
      "west",
      "search",
      "get sword",
      "wield sword"
    ],
  },
  render: (args) => html`
    <div style="padding: 20px;">
      <h4>Command History Demo</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
        Use ↑/↓ arrow keys to navigate through command history. Try typing and using arrow keys.
      </p>
      <illthorn-command-line-lit
        .promptState=${args.promptState}
        .animated=${args.animated}
        .value=${args.value}
        .placeholder="Type a command or use ↑/↓ for history..."
        .commandHistory=${args.commandHistory}
        .maxHistorySize=${args.maxHistorySize}
        @command-submit=${(e: CustomEvent) => {
          console.log("Command submitted:", e.detail.command);
          alert(`Command added to history: ${e.detail.command}`);
        }}
      ></illthorn-command-line-lit>
      <div style="margin-top: 15px; padding: 10px; background: var(--color-background-secondary); border-radius: 4px;">
        <strong>Available History:</strong>
        <div style="font-family: monospace; font-size: 0.9em; margin-top: 5px;">
          ${args.commandHistory.map((cmd, i) => html`<div>${i + 1}. ${cmd}</div>`)}
        </div>
      </div>
    </div>
  `,
};

export const InteractiveDemo: Story = {
  render: () => {
    let commandLineRef: any;

    const handleCommandSubmit = (e: CustomEvent) => {
      const command = e.detail.command;
      console.log("Command submitted:", command);

      // Add to history
      if (commandLineRef) {
        commandLineRef.addToHistory(command);
      }

      // Simulate some responses
      if (command.includes("look")) {
        alert("You see a cozy tavern with wooden tables and a crackling fireplace.");
      } else if (command.includes("north")) {
        alert("You head north down a cobblestone path.");
      } else if (command.includes("inventory")) {
        alert("You are carrying: a leather pouch, some coins, and a rusty dagger.");
      } else {
        alert(`You typed: ${command}`);
      }
    };

    return html`
      <div style="padding: 20px;">
        <h4>Interactive Demo</h4>
        <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
          Try typing commands like "look", "north", or "inventory". Commands are added to history.
        </p>
        <illthorn-command-line-lit
          ${(el: any) => { commandLineRef = el; }}
          promptState="normal"
          placeholder="Enter a command..."
          .commandHistory=${["help", "score"]}
          @command-submit=${handleCommandSubmit}
        ></illthorn-command-line-lit>

        <div style="margin-top: 20px; padding: 15px; background: var(--color-background-secondary); border-radius: 4px;">
          <h5>Try these commands:</h5>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li><code>look</code> - Examine your surroundings</li>
            <li><code>north</code> - Move north</li>
            <li><code>inventory</code> - Check your items</li>
            <li>Use ↑/↓ arrow keys to browse history</li>
          </ul>
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
      <div style="padding: 20px;">
        <h4>Dynamic Game Scenarios</h4>
        <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 15px;">
          Different game states showing how the command line adapts to various situations.
        </p>
        <div style="display: flex; flex-direction: column; gap: 20px;">
          ${scenarios.map(
            (scenario) => html`
              <div style="border: 1px solid var(--color-border); padding: 15px; border-radius: 4px;">
                <h5>${scenario.name} Scenario</h5>
                <div style="font-size: 0.9em; color: var(--color-text-secondary); margin-bottom: 10px;">
                  State: ${scenario.data.promptState} |
                  ${scenario.data.disabled ? `Disabled (${scenario.data.disabledReason})` : "Active"}
                </div>
                <illthorn-command-line-lit
                  .promptState=${scenario.data.promptState}
                  .disabled=${scenario.data.disabled}
                  .disabledReason=${scenario.data.disabledReason}
                  .placeholder=${scenario.data.disabled ? `${scenario.data.disabledReason}...` : "Enter command..."}
                  .commandHistory=${scenario.data.commandHistory}
                  @command-submit=${(e: CustomEvent) => {
                    console.log(`${scenario.name} - Command:`, e.detail.command);
                  }}
                ></illthorn-command-line-lit>
              </div>
            `
          )}
        </div>
      </div>
    `;
  },
};