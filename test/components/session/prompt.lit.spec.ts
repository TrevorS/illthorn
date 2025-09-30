import { describe, expect, it } from "vitest";
import { Prompt } from "../../../src/frontend/components/session/prompt.lit";

describe("Prompt", () => {
  const setup = () => {
    const prompt = document.createElement("illthorn-prompt") as Prompt;
    document.body.appendChild(prompt);
    return { prompt };
  };

  const teardown = (prompt: Prompt) => {
    if (prompt.parentNode) {
      prompt.parentNode.removeChild(prompt);
    }
  };

  describe("Basic rendering", () => {
    it("should create prompt element", () => {
      const { prompt } = setup();

      expect(prompt).toBeInstanceOf(Prompt);
      expect(prompt.tagName.toLowerCase()).toBe("illthorn-prompt");

      teardown(prompt);
    });

    it("should render with default empty content", async () => {
      const { prompt } = setup();
      await prompt.updateComplete;

      // The component renders directly to shadow root, excluding style content
      const textNodes = Array.from(prompt.shadowRoot?.childNodes || [])
        .filter((node) => node.nodeType === Node.TEXT_NODE || (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== "STYLE"))
        .map((node) => node.textContent)
        .join("")
        .trim();

      expect(textNodes).toBe("");

      teardown(prompt);
    });

    it("should have proper CSS styling defined", async () => {
      const { prompt } = setup();
      await prompt.updateComplete;

      // Check that CSS styles are present in shadow DOM
      const styleElement = prompt.shadowRoot?.querySelector("style");
      expect(styleElement).toBeTruthy();
      expect(styleElement?.textContent).toContain('font-family: "MonoLisa"');
      expect(styleElement?.textContent).toContain("display: inline-block");
      expect(styleElement?.textContent).toContain("text-align: right");
      expect(styleElement?.textContent).toContain("font-size: 1.6em");

      teardown(prompt);
    });
  });

  describe("promptText property", () => {
    it("should accept promptText property", async () => {
      const { prompt } = setup();

      prompt.promptText = "HP:100 MP:50>";
      await prompt.updateComplete;

      expect(prompt.promptText).toBe("HP:100 MP:50>");

      teardown(prompt);
    });

    it("should initialize with empty string by default", () => {
      const { prompt } = setup();

      expect(prompt.promptText).toBe("");

      teardown(prompt);
    });

    it("should be reactive to property changes", async () => {
      const { prompt } = setup();

      // Initial empty state
      expect(prompt.promptText).toBe("");

      // Set prompt text
      prompt.promptText = "Test>";
      await prompt.updateComplete;

      expect(prompt.promptText).toBe("Test>");

      teardown(prompt);
    });
  });

  describe("Text rendering", () => {
    it("should render provided prompt text", async () => {
      const { prompt } = setup();

      prompt.promptText = "HP:100 MP:50>";
      await prompt.updateComplete;

      const textContent = Array.from(prompt.shadowRoot?.childNodes || [])
        .filter((node) => node.nodeType === Node.TEXT_NODE || (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== "STYLE"))
        .map((node) => node.textContent)
        .join("")
        .trim();
      expect(textContent).toBe("HP:100 MP:50>");

      teardown(prompt);
    });

    it("should handle empty prompt text gracefully", async () => {
      const { prompt } = setup();

      prompt.promptText = "";
      await prompt.updateComplete;

      const textContent = Array.from(prompt.shadowRoot?.childNodes || [])
        .filter((node) => node.nodeType === Node.TEXT_NODE || (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== "STYLE"))
        .map((node) => node.textContent)
        .join("")
        .trim();
      expect(textContent).toBe("");

      teardown(prompt);
    });

    it("should update text content when property changes", async () => {
      const { prompt } = setup();

      // First prompt
      prompt.promptText = "HP:100>";
      await prompt.updateComplete;
      const textContent1 = Array.from(prompt.shadowRoot?.childNodes || [])
        .filter((node) => node.nodeType === Node.TEXT_NODE || (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== "STYLE"))
        .map((node) => node.textContent)
        .join("")
        .trim();
      expect(textContent1).toBe("HP:100>");

      // Second prompt
      prompt.promptText = "HP:90 MP:75>";
      await prompt.updateComplete;
      const textContent2 = Array.from(prompt.shadowRoot?.childNodes || [])
        .filter((node) => node.nodeType === Node.TEXT_NODE || (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== "STYLE"))
        .map((node) => node.textContent)
        .join("")
        .trim();
      expect(textContent2).toBe("HP:90 MP:75>");

      teardown(prompt);
    });

    it("should handle special characters in prompt text", async () => {
      const { prompt } = setup();

      prompt.promptText = "Health: 100> <Ready>";
      await prompt.updateComplete;

      const textContent = Array.from(prompt.shadowRoot?.childNodes || [])
        .filter((node) => node.nodeType === Node.TEXT_NODE || (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== "STYLE"))
        .map((node) => node.textContent)
        .join("")
        .trim();
      expect(textContent).toBe("Health: 100> <Ready>");

      teardown(prompt);
    });
  });

  describe("Component lifecycle", () => {
    it("should handle property changes correctly", async () => {
      const { prompt } = setup();

      // Initially empty
      expect(prompt.promptText).toBe("");

      // Set text
      prompt.promptText = "Test>";
      await prompt.updateComplete;

      expect(prompt.promptText).toBe("Test>");

      // Change text
      prompt.promptText = "New text>";
      await prompt.updateComplete;

      expect(prompt.promptText).toBe("New text>");

      teardown(prompt);
    });

    it("should cleanup properly on disconnect", async () => {
      const { prompt } = setup();

      prompt.promptText = "Test>";
      await prompt.updateComplete;

      // Disconnect the component
      prompt.remove();

      // Component should be removed from DOM
      expect(document.body.contains(prompt)).toBe(false);
    });
  });

  describe("CSS Custom Properties and Theming", () => {
    it("should define MonoLisa font family in styles", async () => {
      const { prompt } = setup();
      await prompt.updateComplete;

      const styleElement = prompt.shadowRoot?.querySelector("style");
      expect(styleElement?.textContent).toContain("MonoLisa");

      teardown(prompt);
    });

    it("should define proper styling for CLI integration", async () => {
      const { prompt } = setup();
      await prompt.updateComplete;

      const styleElement = prompt.shadowRoot?.querySelector("style");
      expect(styleElement?.textContent).toContain("text-align: right");
      expect(styleElement?.textContent).toContain("font-size: 1.6em");

      teardown(prompt);
    });
  });
});
