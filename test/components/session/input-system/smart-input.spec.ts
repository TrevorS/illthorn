// ABOUTME: Unit tests for illthorn-smart-input-lit component
// ABOUTME: Tests command history navigation, readline keybindings, input handling, and disabled states

import { describe, expect, it, vi } from "vitest";
import { SmartInputLit } from "../../../../src/frontend/components/session/input-system/smart-input.lit";

describe("SmartInputLit", () => {
  const setup = () => {
    const element = document.createElement("illthorn-smart-input-lit") as SmartInputLit;
    document.body.appendChild(element);
    return { element };
  };

  const teardown = (element: SmartInputLit) => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  };

  const simulateKeyPress = (element: HTMLElement, key: string, ctrlKey = false, shiftKey = false) => {
    const event = new KeyboardEvent("keydown", {
      key,
      ctrlKey,
      shiftKey,
      bubbles: true,
      cancelable: true,
    });
    element.dispatchEvent(event);
  };

  describe("Initialization", () => {
    it("should create element with default properties", () => {
      const { element } = setup();

      expect(element).toBeInstanceOf(SmartInputLit);
      expect(element.value).toBe("");
      expect(element.placeholder).toBe("Enter command...");
      expect(element.disabled).toBe(false);
      expect(element.size).toBe("medium");
      expect(element.commandHistory).toEqual([]);
      expect(element.maxHistorySize).toBe(100);

      teardown(element);
    });

    it("should be registered as custom element", () => {
      expect(customElements.get("illthorn-smart-input-lit")).toBeDefined();
    });

    it("should render input field with correct attributes", async () => {
      const { element } = setup();
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector("input");
      expect(input).toBeDefined();
      expect(input?.type).toBe("text");
      expect(input?.placeholder).toBe("Enter command...");
      expect(input?.disabled).toBe(false);

      teardown(element);
    });
  });

  describe("Basic Input Handling", () => {
    it("should update value when typing", async () => {
      const { element } = setup();
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector("input") as HTMLInputElement;
      input.value = "test command";
      input.dispatchEvent(new Event("input", { bubbles: true }));

      expect(element.value).toBe("test command");

      teardown(element);
    });

    it("should handle submit on Enter key", async () => {
      const { element } = setup();
      const submitHandler = vi.fn();
      element.addEventListener("command-submit", submitHandler);

      element.value = "test command";
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector("input") as HTMLInputElement;
      const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true });
      input.dispatchEvent(event);

      expect(submitHandler).toHaveBeenCalled();
      expect(submitHandler.mock.calls[0][0].detail.command).toBe("test command");

      teardown(element);
    });

    it("should clear input after submit", async () => {
      const { element } = setup();
      element.value = "test command";
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector("input") as HTMLInputElement;
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

      expect(element.value).toBe("");

      teardown(element);
    });

    it("should add submitted command to history", async () => {
      const { element } = setup();
      element.value = "first command";
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector("input") as HTMLInputElement;
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

      expect(element.commandHistory).toContain("first command");
      expect(element.commandHistory[element.commandHistory.length - 1]).toBe("first command");

      teardown(element);
    });

    it("should not submit empty commands", async () => {
      const { element } = setup();
      const submitHandler = vi.fn();
      element.addEventListener("command-submit", submitHandler);

      element.value = "";
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector("input") as HTMLInputElement;
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

      expect(submitHandler).not.toHaveBeenCalled();
      expect(element.commandHistory).toEqual([]);

      teardown(element);
    });
  });

  describe("Command History Navigation", () => {
    it("should navigate backward through history with Up arrow", async () => {
      const { element } = setup();
      element.commandHistory = ["cmd1", "cmd2", "cmd3"];
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector("input") as HTMLInputElement;

      // Press up once
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
      expect(element.value).toBe("cmd3");

      // Press up again
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
      expect(element.value).toBe("cmd2");

      // Press up again
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
      expect(element.value).toBe("cmd1");

      teardown(element);
    });

    it("should navigate forward through history with Down arrow", async () => {
      const { element } = setup();
      element.commandHistory = ["cmd1", "cmd2", "cmd3"];
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector("input") as HTMLInputElement;

      // Navigate to oldest
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
      expect(element.value).toBe("cmd1");

      // Navigate forward
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      expect(element.value).toBe("cmd2");

      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      expect(element.value).toBe("cmd3");

      // Navigate to empty (current)
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      expect(element.value).toBe("");

      teardown(element);
    });

    it("should preserve typed text when navigating history", async () => {
      const { element } = setup();
      element.commandHistory = ["old command"];
      element.value = "new text";
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector("input") as HTMLInputElement;

      // Navigate up
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
      expect(element.value).toBe("old command");

      // Navigate down should restore typed text
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      expect(element.value).toBe("new text");

      teardown(element);
    });

    it("should stop at boundaries when navigating history", async () => {
      const { element } = setup();
      element.commandHistory = ["cmd1", "cmd2"];
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector("input") as HTMLInputElement;

      // Try to go past the oldest
      for (let i = 0; i < 5; i++) {
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
      }
      expect(element.value).toBe("cmd1");

      // Try to go past the newest
      for (let i = 0; i < 5; i++) {
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      }
      expect(element.value).toBe("");

      teardown(element);
    });

    it("should handle empty history gracefully", async () => {
      const { element } = setup();
      element.commandHistory = [];
      element.value = "current text";
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector("input") as HTMLInputElement;

      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
      expect(element.value).toBe("current text");

      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      expect(element.value).toBe("current text");

      teardown(element);
    });

    it("should limit history size to maxHistorySize", async () => {
      const { element } = setup();
      element.maxHistorySize = 3;
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector("input") as HTMLInputElement;

      // Add 5 commands
      for (let i = 1; i <= 5; i++) {
        element.value = `cmd${i}`;
        await element.updateComplete;
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      }

      // Should only have last 3
      expect(element.commandHistory).toEqual(["cmd3", "cmd4", "cmd5"]);
      expect(element.commandHistory.length).toBe(3);

      teardown(element);
    });

    it("should not add duplicate consecutive commands to history", async () => {
      const { element } = setup();
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector("input") as HTMLInputElement;

      // Submit same command twice
      element.value = "same command";
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

      element.value = "same command";
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

      expect(element.commandHistory).toEqual(["same command"]);

      teardown(element);
    });
  });

  describe("Readline Keybindings", () => {
    it("should select all text with Ctrl+A", async () => {
      const { element } = setup();
      element.value = "test text";
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector("input") as HTMLInputElement;
      input.focus();

      const selectSpy = vi.spyOn(input, "select");
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "a", ctrlKey: true, bubbles: true }));

      expect(selectSpy).toHaveBeenCalled();

      teardown(element);
    });

    it("should clear input with Ctrl+K", async () => {
      const { element } = setup();
      element.value = "text to clear";
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector("input") as HTMLInputElement;
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }));

      expect(element.value).toBe("");

      teardown(element);
    });

    it("should repeat last command with Ctrl+R", async () => {
      const { element } = setup();
      element.commandHistory = ["previous", "last command"];
      element.value = "";
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector("input") as HTMLInputElement;
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "r", ctrlKey: true, bubbles: true }));

      expect(element.value).toBe("last command");

      teardown(element);
    });

    it("should focus input with Ctrl+L", async () => {
      const { element } = setup();
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector("input") as HTMLInputElement;
      const focusSpy = vi.spyOn(input, "focus");

      input.dispatchEvent(new KeyboardEvent("keydown", { key: "l", ctrlKey: true, bubbles: true }));

      expect(focusSpy).toHaveBeenCalled();

      teardown(element);
    });

    it("should move cursor to beginning with Ctrl+Home", async () => {
      const { element } = setup();
      element.value = "test text";
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector("input") as HTMLInputElement;
      input.selectionStart = 5;
      input.selectionEnd = 5;

      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", ctrlKey: true, bubbles: true }));

      expect(input.selectionStart).toBe(0);
      expect(input.selectionEnd).toBe(0);

      teardown(element);
    });

    it("should move cursor to end with Ctrl+End", async () => {
      const { element } = setup();
      element.value = "test text";
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector("input") as HTMLInputElement;
      input.selectionStart = 0;
      input.selectionEnd = 0;

      input.dispatchEvent(new KeyboardEvent("keydown", { key: "End", ctrlKey: true, bubbles: true }));

      expect(input.selectionStart).toBe(9);
      expect(input.selectionEnd).toBe(9);

      teardown(element);
    });

    it("should delete word backward with Ctrl+W", async () => {
      const { element } = setup();
      element.value = "one two three";
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector("input") as HTMLInputElement;
      input.selectionStart = 13;
      input.selectionEnd = 13;

      input.dispatchEvent(new KeyboardEvent("keydown", { key: "w", ctrlKey: true, bubbles: true }));

      expect(element.value).toBe("one two ");

      teardown(element);
    });

    it("should undo with Ctrl+Z", async () => {
      const { element } = setup();
      const undoSpy = vi.fn();
      element.addEventListener("undo-request", undoSpy);
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector("input") as HTMLInputElement;
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "z", ctrlKey: true, bubbles: true }));

      expect(undoSpy).toHaveBeenCalled();

      teardown(element);
    });
  });

  describe("Disabled State", () => {
    it("should disable input when disabled prop is true", async () => {
      const { element } = setup();
      element.disabled = true;
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector("input") as HTMLInputElement;
      expect(input.disabled).toBe(true);

      teardown(element);
    });

    it("should show disabled reason in placeholder", async () => {
      const { element } = setup();
      element.disabled = true;
      element.disabledReason = "roundtime";
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector("input") as HTMLInputElement;
      expect(input.placeholder).toContain("roundtime");

      teardown(element);
    });

    it("should not handle keybindings when disabled", async () => {
      const { element } = setup();
      element.disabled = true;
      element.value = "text";
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector("input") as HTMLInputElement;
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }));

      expect(element.value).toBe("text"); // Should not clear

      teardown(element);
    });

    it("should not submit commands when disabled", async () => {
      const { element } = setup();
      const submitHandler = vi.fn();
      element.addEventListener("command-submit", submitHandler);
      element.disabled = true;
      element.value = "command";
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector("input") as HTMLInputElement;
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

      expect(submitHandler).not.toHaveBeenCalled();

      teardown(element);
    });
  });

  describe("Size Variations", () => {
    const sizes = ["small", "medium", "large"];

    sizes.forEach(size => {
      it(`should apply ${size} size styling`, async () => {
        const { element } = setup();
        element.size = size as any;
        await element.updateComplete;

        expect(element.classList.contains(`size-${size}`)).toBe(true);

        teardown(element);
      });
    });

    it("should update size classes when size changes", async () => {
      const { element } = setup();
      element.size = "small";
      await element.updateComplete;

      expect(element.classList.contains("size-small")).toBe(true);

      element.size = "large";
      await element.updateComplete;

      expect(element.classList.contains("size-large")).toBe(true);
      expect(element.classList.contains("size-small")).toBe(false);

      teardown(element);
    });
  });

  describe("Focus Management", () => {
    it("should focus input when component is focused", async () => {
      const { element } = setup();
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector("input") as HTMLInputElement;
      const focusSpy = vi.spyOn(input, "focus");

      element.focus();

      expect(focusSpy).toHaveBeenCalled();

      teardown(element);
    });

    it("should emit focus event", async () => {
      const { element } = setup();
      const focusHandler = vi.fn();
      element.addEventListener("input-focus", focusHandler);
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector("input") as HTMLInputElement;
      input.dispatchEvent(new FocusEvent("focus", { bubbles: true }));

      expect(focusHandler).toHaveBeenCalled();

      teardown(element);
    });

    it("should emit blur event", async () => {
      const { element } = setup();
      const blurHandler = vi.fn();
      element.addEventListener("input-blur", blurHandler);
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector("input") as HTMLInputElement;
      input.dispatchEvent(new FocusEvent("blur", { bubbles: true }));

      expect(blurHandler).toHaveBeenCalled();

      teardown(element);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long input gracefully", async () => {
      const { element } = setup();
      const longText = "a".repeat(1000);
      element.value = longText;
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector("input") as HTMLInputElement;
      expect(input.value).toBe(longText);

      teardown(element);
    });

    it("should handle rapid key presses", async () => {
      const { element } = setup();
      element.commandHistory = ["cmd1", "cmd2", "cmd3"];
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector("input") as HTMLInputElement;

      // Rapid up arrow presses
      for (let i = 0; i < 10; i++) {
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
      }

      // Should be at oldest command
      expect(element.value).toBe("cmd1");

      teardown(element);
    });

    it("should handle special characters in commands", async () => {
      const { element } = setup();
      const specialCommand = "!@#$%^&*()_+-=[]{}|;':\",./<>?";
      element.value = specialCommand;
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector("input") as HTMLInputElement;
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

      expect(element.commandHistory).toContain(specialCommand);

      teardown(element);
    });

    it("should trim whitespace from commands", async () => {
      const { element } = setup();
      element.value = "  command with spaces  ";
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector("input") as HTMLInputElement;
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

      expect(element.commandHistory[0]).toBe("command with spaces");

      teardown(element);
    });
  });

  describe("Public API", () => {
    it("should clear input via clear() method", async () => {
      const { element } = setup();
      element.value = "text to clear";
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

      element.addToHistory("manual command");

      expect(element.commandHistory).toContain("manual command");

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
});