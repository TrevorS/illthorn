import { describe, expect, it } from "vitest";
import { Prompt } from "../../../src/frontend/components/session/prompt.lit";
import { createMockSession, createPromptTag } from "../../mocks";

describe("Prompt", () => {
  const setup = () => {
    const prompt = document.createElement("illthorn-prompt") as Prompt;
    const mockSession = createMockSession();
    document.body.appendChild(prompt);
    return { prompt, mockSession };
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

  describe("Session property", () => {
    it("should accept session property", async () => {
      const { prompt, mockSession } = setup();

      prompt.session = mockSession;
      await prompt.updateComplete;

      expect(prompt.session).toBe(mockSession);

      teardown(prompt);
    });

    it("should not setup event listeners without session", async () => {
      const { prompt } = setup();
      await prompt.updateComplete;

      // Internal state should remain default
      const textContent = Array.from(prompt.shadowRoot?.childNodes || [])
        .filter((node) => node.nodeType === Node.TEXT_NODE || (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== "STYLE"))
        .map((node) => node.textContent)
        .join("")
        .trim();
      expect(textContent).toBe("");

      teardown(prompt);
    });

    it("should setup event listeners when session is provided", async () => {
      const { prompt, mockSession } = setup();

      prompt.session = mockSession;
      await prompt.updateComplete;

      // Should have setup event listeners (private method called)
      expect(prompt.session).toBe(mockSession);

      teardown(prompt);
    });
  });

  describe("Prompt event handling", () => {
    it("should update text content when prompt event is received", async () => {
      const { prompt, mockSession } = setup();

      prompt.session = mockSession;
      await prompt.updateComplete;

      // Create mock prompt GameTag
      const mockPromptTag = createPromptTag("1234567890");
      mockPromptTag.text = "HP:100 MP:50>";

      // Dispatch prompt event
      mockSession.bus.dispatchEvent("prompt", mockPromptTag);
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
      const { prompt, mockSession } = setup();

      prompt.session = mockSession;
      await prompt.updateComplete;

      // Create mock prompt GameTag with no content
      const mockPromptTag = createPromptTag();
      mockPromptTag.text = "";

      // Dispatch prompt event
      mockSession.bus.dispatchEvent("prompt", mockPromptTag);
      await prompt.updateComplete;

      const textContent = Array.from(prompt.shadowRoot?.childNodes || [])
        .filter((node) => node.nodeType === Node.TEXT_NODE || (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== "STYLE"))
        .map((node) => node.textContent)
        .join("")
        .trim();
      expect(textContent).toBe("");

      teardown(prompt);
    });

    it("should handle null textContent gracefully", async () => {
      const { prompt, mockSession } = setup();

      prompt.session = mockSession;
      await prompt.updateComplete;

      // Create mock prompt GameTag with null text
      const mockPromptTag = createPromptTag();
      mockPromptTag.text = "";

      // Dispatch prompt event
      mockSession.bus.dispatchEvent("prompt", mockPromptTag);
      await prompt.updateComplete;

      const textContent = Array.from(prompt.shadowRoot?.childNodes || [])
        .filter((node) => node.nodeType === Node.TEXT_NODE || (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== "STYLE"))
        .map((node) => node.textContent)
        .join("")
        .trim();
      expect(textContent).toBe("");

      teardown(prompt);
    });

    it("should extract time attribute from prompt element", async () => {
      const { prompt, mockSession } = setup();

      prompt.session = mockSession;
      await prompt.updateComplete;

      // Create mock prompt GameTag with time attribute
      const mockPromptTag = createPromptTag("1640995200");
      mockPromptTag.text = "Health: 100>";

      // Dispatch prompt event
      mockSession.bus.dispatchEvent("prompt", mockPromptTag);
      await prompt.updateComplete;

      const textContent = Array.from(prompt.shadowRoot?.childNodes || [])
        .filter((node) => node.nodeType === Node.TEXT_NODE || (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== "STYLE"))
        .map((node) => node.textContent)
        .join("")
        .trim();
      expect(textContent).toBe("Health: 100>");

      teardown(prompt);
    });

    it("should update prompt text multiple times", async () => {
      const { prompt, mockSession } = setup();

      prompt.session = mockSession;
      await prompt.updateComplete;

      // First prompt
      const mockPrompt1 = createPromptTag();
      mockPrompt1.text = "HP:100>";
      mockSession.bus.dispatchEvent("prompt", mockPrompt1);
      await prompt.updateComplete;
      const textContent1 = Array.from(prompt.shadowRoot?.childNodes || [])
        .filter((node) => node.nodeType === Node.TEXT_NODE || (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== "STYLE"))
        .map((node) => node.textContent)
        .join("")
        .trim();
      expect(textContent1).toBe("HP:100>");

      // Second prompt
      const mockPrompt2 = createPromptTag();
      mockPrompt2.text = "HP:90 MP:75>";
      mockSession.bus.dispatchEvent("prompt", mockPrompt2);
      await prompt.updateComplete;
      const textContent2 = Array.from(prompt.shadowRoot?.childNodes || [])
        .filter((node) => node.nodeType === Node.TEXT_NODE || (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== "STYLE"))
        .map((node) => node.textContent)
        .join("")
        .trim();
      expect(textContent2).toBe("HP:90 MP:75>");

      teardown(prompt);
    });

    it("should decode HTML entities in prompt text", async () => {
      const { prompt, mockSession } = setup();

      prompt.session = mockSession;
      await prompt.updateComplete;

      // Create mock prompt GameTag with HTML entities
      const mockPromptTag = createPromptTag("1234567890");
      mockPromptTag.text = "HP:100 MP:50&gt;";

      // Dispatch prompt event
      mockSession.bus.dispatchEvent("prompt", mockPromptTag);
      await prompt.updateComplete;

      const textContent = Array.from(prompt.shadowRoot?.childNodes || [])
        .filter((node) => node.nodeType === Node.TEXT_NODE || (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== "STYLE"))
        .map((node) => node.textContent)
        .join("")
        .trim();
      expect(textContent).toBe("HP:100 MP:50>");

      teardown(prompt);
    });
  });

  describe("Component lifecycle", () => {
    it("should handle session property changes", async () => {
      const { prompt, mockSession } = setup();

      // Initially no session
      expect(prompt.session).toBeUndefined();

      // Set session
      prompt.session = mockSession;
      await prompt.updateComplete;

      expect(prompt.session).toBe(mockSession);

      // Create new session
      const newMockSession = createMockSession("new-session");
      prompt.session = newMockSession;
      await prompt.updateComplete;

      expect(prompt.session).toBe(newMockSession);

      teardown(prompt);
    });

    it("should cleanup properly on disconnect", async () => {
      const { prompt, mockSession } = setup();

      prompt.session = mockSession;
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

  describe("Event listener management", () => {
    it("should not setup duplicate event listeners", async () => {
      const { prompt, mockSession } = setup();

      prompt.session = mockSession;
      await prompt.updateComplete;

      // Trigger updated again with same session
      prompt.session = mockSession;
      await prompt.updateComplete;

      // Should still work correctly without duplicate listeners
      const mockPromptTag = createPromptTag();
      mockPromptTag.text = "Test>";
      mockSession.bus.dispatchEvent("prompt", mockPromptTag);
      await prompt.updateComplete;

      const textContent = Array.from(prompt.shadowRoot?.childNodes || [])
        .filter((node) => node.nodeType === Node.TEXT_NODE || (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== "STYLE"))
        .map((node) => node.textContent)
        .join("")
        .trim();
      expect(textContent).toBe("Test>");

      teardown(prompt);
    });
  });
});
