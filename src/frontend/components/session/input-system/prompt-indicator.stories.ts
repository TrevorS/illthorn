import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { MockDataGenerator } from "../../../utils/mock-data";
import "./prompt-indicator.lit";

const meta: Meta = {
  title: "Input System/Prompt Indicator",
  component: "illthorn-prompt-indicator-lit",
  parameters: {
    docs: {
      description: {
        component: "Dynamic prompt symbol that changes appearance based on character state (normal, roundtime, casting, stunned, etc.).",
      },
    },
  },
  argTypes: {
    state: {
      control: { type: "select" },
      options: ["normal", "roundtime", "casting", "stunned", "dead", "sleeping"],
      description: "Current character state affecting prompt appearance",
    },
    animated: {
      control: "boolean",
      description: "Enable animations for state transitions and active states",
    },
    customSymbol: {
      control: "text",
      description: "Override default prompt symbol with custom text",
    },
    size: {
      control: { type: "radio" },
      options: ["small", "medium", "large"],
      description: "Size of the prompt indicator",
    },
    blinkRate: {
      control: { type: "range", min: 0.5, max: 3, step: 0.1 },
      description: "Animation blink rate in seconds (for animated states)",
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    state: "normal",
    animated: true,
    customSymbol: "",
    size: "medium",
    blinkRate: 1.0,
  },
  render: (args) => html`
    <illthorn-prompt-indicator-lit
      .state=${args.state}
      .animated=${args.animated}
      .customSymbol=${args.customSymbol}
      .size=${args.size}
      .blinkRate=${args.blinkRate}
    ></illthorn-prompt-indicator-lit>
  `,
};

export const AllStates: Story = {
  render: () => {
    const states = [
      { state: "normal", description: "Ready for input", symbol: ">" },
      { state: "roundtime", description: "RT active (3s remaining)", symbol: "..." },
      { state: "casting", description: "Spell in progress", symbol: "*" },
      { state: "stunned", description: "Character stunned", symbol: "!" },
      { state: "dead", description: "Character dead", symbol: "†" },
      { state: "sleeping", description: "Character sleeping", symbol: "z" },
    ];

    return html`
      <div style="padding: 20px;">
        <h4>All Prompt States</h4>
        <div style="display: grid; grid-template-columns: 80px 60px 1fr; gap: 15px; align-items: center;">
          <strong>State</strong>
          <strong>Symbol</strong>
          <strong>Description</strong>

          ${states.map(
            ({ state, description, symbol }) => html`
              <span style="text-transform: capitalize;">${state}:</span>
              <div style="display: flex; align-items: center; min-height: 30px;">
                <illthorn-prompt-indicator-lit
                  .state=${state}
                  .animated=${state === "roundtime" || state === "casting"}
                ></illthorn-prompt-indicator-lit>
              </div>
              <span style="font-size: 0.9em; color: var(--color-text-secondary);">${description}</span>
            `
          )}
        </div>
      </div>
    `;
  },
};

export const AnimatedStates: Story = {
  render: () => html`
    <div style="padding: 20px;">
      <h4>Animated State Transitions</h4>
      <div style="display: flex; gap: 30px; align-items: center;">
        <div style="text-align: center;">
          <div style="margin-bottom: 10px;">Roundtime Active</div>
          <illthorn-prompt-indicator-lit
            .state="roundtime"
            .animated=${true}
          ></illthorn-prompt-indicator-lit>
        </div>
        <div style="text-align: center;">
          <div style="margin-bottom: 10px;">Casting Spell</div>
          <illthorn-prompt-indicator-lit
            .state="casting"
            .animated=${true}
          ></illthorn-prompt-indicator-lit>
        </div>
        <div style="text-align: center;">
          <div style="margin-bottom: 10px;">Sleeping (Pulse)</div>
          <illthorn-prompt-indicator-lit
            .state="sleeping"
            .animated=${true}
          ></illthorn-prompt-indicator-lit>
        </div>
      </div>
    </div>
  `,
};

export const SizeVariations: Story = {
  render: () => html`
    <div style="display: flex; gap: 40px; align-items: center; padding: 20px;">
      <div style="text-align: center;">
        <h4>Small</h4>
        <illthorn-prompt-indicator-lit
          size="small"
          .state="normal"
        ></illthorn-prompt-indicator-lit>
      </div>
      <div style="text-align: center;">
        <h4>Medium (Default)</h4>
        <illthorn-prompt-indicator-lit
          size="medium"
          .state="normal"
        ></illthorn-prompt-indicator-lit>
      </div>
      <div style="text-align: center;">
        <h4>Large</h4>
        <illthorn-prompt-indicator-lit
          size="large"
          .state="normal"
        ></illthorn-prompt-indicator-lit>
      </div>
    </div>
  `,
};

export const CustomSymbols: Story = {
  render: () => {
    const customPrompts = [
      { symbol: "$", description: "Dollar sign prompt" },
      { symbol: "#", description: "Hash prompt" },
      { symbol: "❯", description: "Modern shell prompt" },
      { symbol: "⚡", description: "Lightning bolt" },
      { symbol: "🎯", description: "Target emoji" },
    ];

    return html`
      <div style="padding: 20px;">
        <h4>Custom Prompt Symbols</h4>
        <div style="display: grid; grid-template-columns: 60px 1fr; gap: 15px; align-items: center;">
          ${customPrompts.map(
            ({ symbol, description }) => html`
              <illthorn-prompt-indicator-lit
                .state="normal"
                .customSymbol=${symbol}
                .animated=${false}
              ></illthorn-prompt-indicator-lit>
              <span>${description}</span>
            `
          )}
        </div>
      </div>
    `;
  },
};

export const StateTransitions: Story = {
  render: () => {
    let currentStateIndex = 0;
    const states = ["normal", "roundtime", "casting", "stunned", "normal"];

    const updatePrompt = () => {
      const prompt = document.querySelector("illthorn-prompt-indicator-lit") as any;
      if (prompt) {
        currentStateIndex = (currentStateIndex + 1) % states.length;
        prompt.state = states[currentStateIndex];
      }
    };

    return html`
      <div style="padding: 20px; text-align: center;">
        <h4>Dynamic State Transitions</h4>
        <div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin: 20px 0;">
          <illthorn-prompt-indicator-lit
            .state=${states[0]}
            .animated=${true}
          ></illthorn-prompt-indicator-lit>
          <span style="font-family: monospace; color: var(--color-text-secondary);">
            Current state: <span id="current-state">${states[0]}</span>
          </span>
        </div>
        <button
          @click=${() => {
            updatePrompt();
            const stateSpan = document.getElementById('current-state');
            if (stateSpan) stateSpan.textContent = states[currentStateIndex];
          }}
          style="padding: 8px 16px; background: var(--color-primary); color: var(--color-surface); border: none; border-radius: 4px; cursor: pointer;"
        >
          Next State
        </button>
      </div>
    `;
  },
};

export const BlinkRateControl: Story = {
  render: () => html`
    <div style="padding: 20px;">
      <h4>Animation Blink Rate Control</h4>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px;">
        <div style="text-align: center;">
          <div style="margin-bottom: 10px;">Slow (2s)</div>
          <illthorn-prompt-indicator-lit
            .state="roundtime"
            .animated=${true}
            .blinkRate=${2.0}
          ></illthorn-prompt-indicator-lit>
        </div>
        <div style="text-align: center;">
          <div style="margin-bottom: 10px;">Normal (1s)</div>
          <illthorn-prompt-indicator-lit
            .state="roundtime"
            .animated=${true}
            .blinkRate=${1.0}
          ></illthorn-prompt-indicator-lit>
        </div>
        <div style="text-align: center;">
          <div style="margin-bottom: 10px;">Fast (0.5s)</div>
          <illthorn-prompt-indicator-lit
            .state="roundtime"
            .animated=${true}
            .blinkRate=${0.5}
          ></illthorn-prompt-indicator-lit>
        </div>
      </div>
    </div>
  `,
};

export const DynamicScenarios: Story = {
  render: () => {
    const scenarios = [
      { name: "New Player", data: MockDataGenerator.scenarios.newPlayer() },
      { name: "Combat", data: MockDataGenerator.scenarios.combat() },
      { name: "Casting", data: MockDataGenerator.scenarios.casting() },
      { name: "No Exits", data: MockDataGenerator.scenarios.noExits() },
    ];

    return html`
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; padding: 20px;">
        <h4 style="grid-column: 1 / -1;">Dynamic Prompt Scenarios</h4>
        ${scenarios.map(
          (scenario) => html`
            <div style="border: 1px solid var(--color-border); padding: 15px; border-radius: 4px;">
              <div style="font-weight: bold; margin-bottom: 5px;">${scenario.name}</div>
              <div style="font-size: 0.9em; color: var(--color-text-secondary); margin-bottom: 10px;">
                ${scenario.data.room.title}
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <illthorn-prompt-indicator-lit
                  .state=${scenario.data.promptState}
                  .animated=${scenario.data.promptState === "roundtime" || scenario.data.promptState === "casting"}
                ></illthorn-prompt-indicator-lit>
                <span style="font-size: 0.9em; color: var(--color-text-secondary);">
                  State: ${scenario.data.promptState}
                </span>
              </div>
            </div>
          `
        )}
      </div>
    `;
  },
};

export const AccessibilityTest: Story = {
  render: () => html`
    <div style="padding: 20px;">
      <h4>Accessibility and Screen Reader Support</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 20px;">
        Each prompt state should announce its meaning to screen readers.
      </p>
      <div style="display: grid; grid-template-columns: 100px 1fr; gap: 15px; align-items: center;">
        ${["normal", "roundtime", "casting", "stunned", "dead"].map(
          (state) => html`
            <illthorn-prompt-indicator-lit
              .state=${state}
              .animated=${state === "roundtime" || state === "casting"}
              aria-label="Prompt state: ${state}"
              role="status"
              aria-live="polite"
            ></illthorn-prompt-indicator-lit>
            <span>Screen reader announces: "Prompt state: ${state}"</span>
          `
        )}
      </div>
    </div>
  `,
};

export const ContextualPrompts: Story = {
  render: () => html`
    <div style="padding: 20px;">
      <h4>Context-Aware Prompts</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-bottom: 20px;">
        Different contexts might call for different prompt styles.
      </p>
      <div style="display: grid; grid-template-columns: 60px 1fr; gap: 15px; align-items: center;">
        <illthorn-prompt-indicator-lit .state="normal"></illthorn-prompt-indicator-lit>
        <span>General gameplay</span>

        <illthorn-prompt-indicator-lit .state="roundtime" .animated=${true}></illthorn-prompt-indicator-lit>
        <span>Combat - cannot act</span>

        <illthorn-prompt-indicator-lit .state="casting" .animated=${true}></illthorn-prompt-indicator-lit>
        <span>Spellcasting - cannot interrupt</span>

        <illthorn-prompt-indicator-lit .state="stunned"></illthorn-prompt-indicator-lit>
        <span>Stunned - temporary disability</span>

        <illthorn-prompt-indicator-lit .state="dead"></illthorn-prompt-indicator-lit>
        <span>Dead - ghost mode</span>

        <illthorn-prompt-indicator-lit .state="sleeping"></illthorn-prompt-indicator-lit>
        <span>Resting - limited commands</span>
      </div>
    </div>
  `,
};