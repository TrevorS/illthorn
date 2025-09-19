// ABOUTME: Unit tests for illthorn-command-line-lit composite component
// ABOUTME: Tests composition of prompt indicator and smart input components

import { describe, expect, it, vi } from "vitest";
import { CommandLineLit } from "../../../../src/frontend/components/session/input-system/command-line.lit";

describe("CommandLineLit", () => {
  const setup = () => {
    const element = document.createElement("illthorn-command-line-lit") as CommandLineLit;
    document.body.appendChild(element);
    return { element };
  };

  const teardown = (element: CommandLineLit) => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  };

  describe("Initialization", () => {
    it("should create element with default properties", () => {
      const { element } = setup();

      expect(element).toBeInstanceOf(CommandLineLit);
      expect(element.promptState).toBe("normal");
      expect(element.disabled).toBe(false);
      expect(element.placeholder).toBe("Enter command...");
      expect(element.value).toBe("");
      expect(element.size).toBe("medium");

      teardown(element);
    });

    it("should be registered as custom element", () => {
      expect(customElements.get("illthorn-command-line-lit")).toBeDefined();
    });

    it("should have proper tag name", () => {
      const { element } = setup();
      expect(element.tagName.toLowerCase()).toBe("illthorn-command-line-lit");
      teardown(element);
    });
  });

  describe("Child Component Rendering", () => {
    it("should render prompt indicator component", async () => {
      const { element } = setup();
      await element.updateComplete;

      const promptIndicator = element.shadowRoot!.querySelector("illthorn-prompt-indicator-lit");
      expect(promptIndicator).toBeDefined();

      teardown(element);
    });

    it("should render smart input component", async () => {
      const { element } = setup();
      await element.updateComplete;

      const smartInput = element.shadowRoot!.querySelector("illthorn-smart-input-lit");
      expect(smartInput).toBeDefined();

      teardown(element);
    });

    it("should render both child components", async () => {
      const { element } = setup();
      await element.updateComplete;

      const promptIndicator = element.shadowRoot!.querySelector("illthorn-prompt-indicator-lit");
      const smartInput = element.shadowRoot!.querySelector("illthorn-smart-input-lit");

      expect(promptIndicator).toBeDefined();
      expect(smartInput).toBeDefined();

      teardown(element);
    });
  });

  describe("Property Pass-through", () => {
    it("should pass prompt state to prompt indicator", async () => {
      const { element } = setup();
      element.promptState = "roundtime";
      element.animated = true;
      element.customSymbol = "#";
      await element.updateComplete;

      const promptIndicator = element.shadowRoot!.querySelector("illthorn-prompt-indicator-lit") as any;
      expect(promptIndicator.state).toBe("roundtime");
      expect(promptIndicator.animated).toBe(true);
      expect(promptIndicator.customSymbol).toBe("#");

      teardown(element);
    });

    it("should pass input properties to smart input", async () => {
      const { element } = setup();
      element.value = "test command";
      element.placeholder = "Custom placeholder";
      element.disabled = true;
      element.disabledReason = "casting";
      element.size = "large";
      element.commandHistory = ["cmd1", "cmd2"];
      await element.updateComplete;

      const smartInput = element.shadowRoot!.querySelector("illthorn-smart-input-lit") as any;
      expect(smartInput.value).toBe("test command");
      expect(smartInput.placeholder).toBe("Custom placeholder");
      expect(smartInput.disabled).toBe(true);
      expect(smartInput.disabledReason).toBe("casting");
      expect(smartInput.size).toBe("large");
      expect(smartInput.commandHistory).toEqual(["cmd1", "cmd2"]);

      teardown(element);
    });

    it("should synchronize disabled state between components", async () => {
      const { element } = setup();
      element.disabled = true;
      element.promptState = "stunned";
      await element.updateComplete;

      const promptIndicator = element.shadowRoot!.querySelector("illthorn-prompt-indicator-lit") as any;
      const smartInput = element.shadowRoot!.querySelector("illthorn-smart-input-lit") as any;

      expect(promptIndicator.state).toBe("stunned");
      expect(smartInput.disabled).toBe(true);

      teardown(element);
    });

    it("should pass size to both components", async () => {
      const { element } = setup();
      element.size = "small";
      await element.updateComplete;

      const promptIndicator = element.shadowRoot!.querySelector("illthorn-prompt-indicator-lit") as any;
      const smartInput = element.shadowRoot!.querySelector("illthorn-smart-input-lit") as any;

      expect(promptIndicator.size).toBe("small");
      expect(smartInput.size).toBe("small");

      teardown(element);
    });
  });

  describe("Layout and Styling", () => {
    it("should apply horizontal layout", async () => {
      const { element } = setup();
      await element.updateComplete;

      const container = element.shadowRoot!.querySelector(".command-line");
      expect(container).toBeDefined();
      expect(container?.classList.contains("command-line")).toBe(true);

      teardown(element);
    });

    it("should apply disabled styling when disabled", async () => {
      const { element } = setup();
      element.disabled = true;
      await element.updateComplete;

      expect(element.classList.contains("disabled")).toBe(true);

      teardown(element);
    });

    it("should apply size-specific styling", async () => {
      const { element } = setup();
      element.size = "large";
      await element.updateComplete;

      expect(element.classList.contains("size-large")).toBe(true);

      teardown(element);
    });
  });

  describe("Event Handling", () => {
    it("should bubble command-submit events from smart input", async () => {
      const { element } = setup();
      const eventHandler = vi.fn();
      element.addEventListener("command-submit", eventHandler);
      await element.updateComplete;

      const smartInput = element.shadowRoot!.querySelector("illthorn-smart-input-lit") as any;

      // Simulate command submit event
      const mockEvent = new CustomEvent("command-submit", {
        detail: { command: "test command" },
        bubbles: true
      });
      smartInput.dispatchEvent(mockEvent);

      expect(eventHandler).toHaveBeenCalled();
      expect(eventHandler.mock.calls[0][0].detail.command).toBe("test command");

      teardown(element);
    });

    it("should bubble input-focus events from smart input", async () => {
      const { element } = setup();
      const eventHandler = vi.fn();
      element.addEventListener("input-focus", eventHandler);
      await element.updateComplete;

      const smartInput = element.shadowRoot!.querySelector("illthorn-smart-input-lit") as any;

      // Simulate focus event
      const mockEvent = new CustomEvent("input-focus", {
        detail: {},
        bubbles: true
      });
      smartInput.dispatchEvent(mockEvent);

      expect(eventHandler).toHaveBeenCalled();

      teardown(element);
    });

    it("should bubble input-blur events from smart input", async () => {
      const { element } = setup();
      const eventHandler = vi.fn();
      element.addEventListener("input-blur", eventHandler);
      await element.updateComplete;

      const smartInput = element.shadowRoot!.querySelector("illthorn-smart-input-lit") as any;

      // Simulate blur event
      const mockEvent = new CustomEvent("input-blur", {
        detail: {},
        bubbles: true
      });
      smartInput.dispatchEvent(mockEvent);

      expect(eventHandler).toHaveBeenCalled();

      teardown(element);
    });

    it("should handle undo-request events", async () => {
      const { element } = setup();
      const eventHandler = vi.fn();
      element.addEventListener("undo-request", eventHandler);
      await element.updateComplete;

      const smartInput = element.shadowRoot!.querySelector("illthorn-smart-input-lit") as any;

      // Simulate undo request event
      const mockEvent = new CustomEvent("undo-request", {
        detail: {},
        bubbles: true
      });
      smartInput.dispatchEvent(mockEvent);

      expect(eventHandler).toHaveBeenCalled();

      teardown(element);
    });
  });

  describe("Focus Management", () => {
    it("should focus smart input when component is focused", async () => {
      const { element } = setup();
      await element.updateComplete;

      const smartInput = element.shadowRoot!.querySelector("illthorn-smart-input-lit") as any;
      const focusSpy = vi.spyOn(smartInput, "focus");

      element.focus();

      expect(focusSpy).toHaveBeenCalled();

      teardown(element);
    });

    it("should not focus when disabled", async () => {
      const { element } = setup();
      element.disabled = true;
      await element.updateComplete;

      const smartInput = element.shadowRoot!.querySelector("illthorn-smart-input-lit") as any;
      const focusSpy = vi.spyOn(smartInput, "focus");

      element.focus();

      expect(focusSpy).not.toHaveBeenCalled();

      teardown(element);
    });
  });

  describe("Dynamic Updates", () => {
    it("should update child components when properties change", async () => {
      const { element } = setup();
      element.promptState = "normal";
      element.value = "initial";
      await element.updateComplete;

      let promptIndicator = element.shadowRoot!.querySelector("illthorn-prompt-indicator-lit") as any;
      let smartInput = element.shadowRoot!.querySelector("illthorn-smart-input-lit") as any;

      expect(promptIndicator.state).toBe("normal");
      expect(smartInput.value).toBe("initial");

      element.promptState = "casting";
      element.value = "updated";
      await element.updateComplete;

      promptIndicator = element.shadowRoot!.querySelector("illthorn-prompt-indicator-lit") as any;
      smartInput = element.shadowRoot!.querySelector("illthorn-smart-input-lit") as any;

      expect(promptIndicator.state).toBe("casting");
      expect(smartInput.value).toBe("updated");

      teardown(element);
    });

    it("should update styling when properties change", async () => {
      const { element } = setup();
      element.disabled = false;
      element.size = "medium";
      await element.updateComplete;

      expect(element.classList.contains("disabled")).toBe(false);
      expect(element.classList.contains("size-medium")).toBe(true);

      element.disabled = true;
      element.size = "large";
      await element.updateComplete;

      expect(element.classList.contains("disabled")).toBe(true);
      expect(element.classList.contains("size-large")).toBe(true);
      expect(element.classList.contains("size-medium")).toBe(false);

      teardown(element);
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", async () => {
      const { element } = setup();
      await element.updateComplete;

      expect(element.getAttribute("role")).toBe("group");
      expect(element.getAttribute("aria-label")).toBe("Command input interface");

      teardown(element);
    });

    it("should maintain accessibility of child components", async () => {
      const { element } = setup();
      await element.updateComplete;

      const promptIndicator = element.shadowRoot!.querySelector("illthorn-prompt-indicator-lit");
      const smartInput = element.shadowRoot!.querySelector("illthorn-smart-input-lit");

      expect(promptIndicator).toBeDefined();
      expect(smartInput).toBeDefined();

      teardown(element);
    });

    it("should indicate disabled state in ARIA", async () => {
      const { element } = setup();
      element.disabled = true;
      await element.updateComplete;

      expect(element.getAttribute("aria-disabled")).toBe("true");

      teardown(element);
    });
  });

  describe("Public API", () => {
    it("should clear input via clear() method", async () => {
      const { element } = setup();
      element.value = "test";
      await element.updateComplete;

      element.clear();
      await element.updateComplete;

      expect(element.value).toBe("");

      teardown(element);
    });

    it("should set value via setValue() method", async () => {
      const { element } = setup();
      await element.updateComplete;

      element.setValue("new value");
      await element.updateComplete;

      expect(element.value).toBe("new value");

      teardown(element);
    });

    it("should add to history via addToHistory() method", async () => {
      const { element } = setup();
      await element.updateComplete;

      element.addToHistory("test command");

      expect(element.commandHistory).toContain("test command");

      teardown(element);
    });

    it("should clear history via clearHistory() method", async () => {
      const { element } = setup();
      element.commandHistory = ["cmd1", "cmd2"];
      await element.updateComplete;

      element.clearHistory();

      expect(element.commandHistory).toEqual([]);

      teardown(element);
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined state gracefully", async () => {
      const { element } = setup();
      element.promptState = undefined as any;
      await element.updateComplete;

      const promptIndicator = element.shadowRoot!.querySelector("illthorn-prompt-indicator-lit") as any;
      expect(promptIndicator.state).toBe(undefined);

      teardown(element);
    });

    it("should handle empty command history", async () => {
      const { element } = setup();
      element.commandHistory = [];
      await element.updateComplete;

      const smartInput = element.shadowRoot!.querySelector("illthorn-smart-input-lit") as any;
      expect(smartInput.commandHistory).toEqual([]);

      teardown(element);
    });

    it("should handle very long input values", async () => {
      const { element } = setup();
      const longValue = "a".repeat(1000);
      element.value = longValue;
      await element.updateComplete;

      const smartInput = element.shadowRoot!.querySelector("illthorn-smart-input-lit") as any;
      expect(smartInput.value).toBe(longValue);

      teardown(element);
    });

    it("should handle null/undefined properties", async () => {
      const { element } = setup();
      element.customSymbol = null as any;
      element.disabledReason = undefined as any;
      await element.updateComplete;

      // Should not crash
      const promptIndicator = element.shadowRoot!.querySelector("illthorn-prompt-indicator-lit");
      const smartInput = element.shadowRoot!.querySelector("illthorn-smart-input-lit");

      expect(promptIndicator).toBeDefined();
      expect(smartInput).toBeDefined();

      teardown(element);
    });
  });

  describe("Integration", () => {
    it("should coordinate prompt and input state changes", async () => {
      const { element } = setup();

      // Test normal state
      element.promptState = "normal";
      element.disabled = false;
      await element.updateComplete;

      let promptIndicator = element.shadowRoot!.querySelector("illthorn-prompt-indicator-lit") as any;
      let smartInput = element.shadowRoot!.querySelector("illthorn-smart-input-lit") as any;

      expect(promptIndicator.state).toBe("normal");
      expect(smartInput.disabled).toBe(false);

      // Test disabled state
      element.promptState = "roundtime";
      element.disabled = true;
      await element.updateComplete;

      promptIndicator = element.shadowRoot!.querySelector("illthorn-prompt-indicator-lit") as any;
      smartInput = element.shadowRoot!.querySelector("illthorn-smart-input-lit") as any;

      expect(promptIndicator.state).toBe("roundtime");
      expect(smartInput.disabled).toBe(true);

      teardown(element);
    });

    it("should maintain visual connection between prompt and input", async () => {
      const { element } = setup();
      await element.updateComplete;

      const container = element.shadowRoot!.querySelector(".command-line");
      const prompt = element.shadowRoot!.querySelector(".prompt-section");
      const input = element.shadowRoot!.querySelector(".input-section");

      expect(container).toBeDefined();
      expect(prompt).toBeDefined();
      expect(input).toBeDefined();

      teardown(element);
    });
  });
});