import { describe, expect, it, vi } from "vitest";
import { SessionButton } from "../../../src/frontend/components/session/session-button.lit";
import { IllthornEvent } from "../../../src/frontend/events";
import { Illthorn } from "../../../src/frontend/illthorn";
import { createMockSession } from "../../mocks";

// Mock the session helpers
vi.mock("../../../src/frontend/session/helpers", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    focusSession: vi.fn(),
    renderSession: vi.fn(),
  };
});

describe("SessionButton", () => {
  const setup = () => {
    const sessionButton = document.createElement("illthorn-session-button") as SessionButton;
    const mockSession = createMockSession("test-session");
    // hasFocus property is already defined in MockSession interface
    mockSession.hasFocus = false;
    document.body.appendChild(sessionButton);
    return { sessionButton, mockSession };
  };

  const teardown = (sessionButton: SessionButton) => {
    if (sessionButton.parentNode) {
      sessionButton.parentNode.removeChild(sessionButton);
    }
  };

  describe("Basic rendering", () => {
    it("should create session-button element", () => {
      const { sessionButton } = setup();

      expect(sessionButton).toBeInstanceOf(SessionButton);
      expect(sessionButton.tagName.toLowerCase()).toBe("illthorn-session-button");

      teardown(sessionButton);
    });

    it("should render empty when no session provided", async () => {
      const { sessionButton } = setup();
      await sessionButton.updateComplete;

      // Check that rendered content (excluding styles) is empty - Light DOM has no content when no session
      const contentNodes = Array.from(sessionButton.childNodes || []).filter((node) => node.nodeType === Node.ELEMENT_NODE && node.nodeName !== "STYLE");
      expect(contentNodes.length).toBe(0);

      teardown(sessionButton);
    });

    it("should add action class on connection", async () => {
      const { sessionButton } = setup();
      await sessionButton.updateComplete;

      expect(sessionButton.classList.contains("action")).toBe(true);

      teardown(sessionButton);
    });
  });

  describe("Session property", () => {
    it("should accept session property", async () => {
      const { sessionButton, mockSession } = setup();

      sessionButton.session = mockSession;
      await sessionButton.updateComplete;

      expect(sessionButton.session).toBe(mockSession);

      teardown(sessionButton);
    });

    it("should render session name and tab number when session provided", async () => {
      const { sessionButton, mockSession } = setup();

      sessionButton.session = mockSession;
      await sessionButton.updateComplete;

      // Check that session name first character is displayed (Light DOM)
      const sessionNameElement = sessionButton.querySelector(".session-name");
      expect(sessionNameElement?.textContent?.trim()).toBe("t"); // First char of "test-session"
      expect(sessionNameElement?.getAttribute("title")).toBe("test-session");

      // Check that tab number is displayed (depends on position in parent)
      const altNumericElement = sessionButton.querySelector(".alt-numeric");
      const tabNumber = altNumericElement?.textContent?.trim();
      expect(tabNumber).toMatch(/^\d+$/); // Should be a number

      teardown(sessionButton);
    });

    it("should setup event listeners when session is provided", async () => {
      const { sessionButton, mockSession } = setup();

      sessionButton.session = mockSession;
      await sessionButton.updateComplete;

      // Should have setup event listeners
      expect(sessionButton.session).toBe(mockSession);

      teardown(sessionButton);
    });
  });

  describe("Focus state management", () => {
    it("should update active state when SESSION_FOCUS event is received", async () => {
      const { sessionButton, mockSession } = setup();

      sessionButton.session = mockSession;
      await sessionButton.updateComplete;

      // Initially not active
      expect(sessionButton.classList.contains("on")).toBe(false);

      // Dispatch SESSION_FOCUS event for this session
      Illthorn.bus.dispatchEvent(IllthornEvent.SESSION_FOCUS, mockSession);
      await sessionButton.updateComplete;

      expect(sessionButton.classList.contains("on")).toBe(true);

      teardown(sessionButton);
    });

    it("should remove active state when different session gets focus", async () => {
      const { sessionButton, mockSession } = setup();

      sessionButton.session = mockSession;
      await sessionButton.updateComplete;

      // Make this session active first
      Illthorn.bus.dispatchEvent(IllthornEvent.SESSION_FOCUS, mockSession);
      await sessionButton.updateComplete;
      expect(sessionButton.classList.contains("on")).toBe(true);

      // Focus different session
      const otherSession = createMockSession("other-session");
      Illthorn.bus.dispatchEvent(IllthornEvent.SESSION_FOCUS, otherSession);
      await sessionButton.updateComplete;

      expect(sessionButton.classList.contains("on")).toBe(false);

      teardown(sessionButton);
    });
  });

  describe("Tab number calculation", () => {
    it("should calculate tab number based on position in parent", async () => {
      const container = document.createElement("div");
      document.body.appendChild(container);

      // Create multiple session buttons
      const sessionButton1 = document.createElement("illthorn-session-button") as SessionButton;
      const sessionButton2 = document.createElement("illthorn-session-button") as SessionButton;
      const sessionButton3 = document.createElement("illthorn-session-button") as SessionButton;

      const session1 = createMockSession("session1");
      const session2 = createMockSession("session2");
      const session3 = createMockSession("session3");

      // Add to DOM first, then set session to trigger firstUpdated
      container.appendChild(sessionButton1);
      container.appendChild(sessionButton2);
      container.appendChild(sessionButton3);

      // Set sessions after DOM connection
      sessionButton1.session = session1;
      sessionButton2.session = session2;
      sessionButton3.session = session3;

      // Wait for initial connection and render
      await Promise.all([sessionButton1.updateComplete, sessionButton2.updateComplete, sessionButton3.updateComplete]);

      // Wait for tab number calculation (uses setTimeout) and mutation observer
      await new Promise((resolve) => setTimeout(resolve, 50));
      await Promise.all([sessionButton1.updateComplete, sessionButton2.updateComplete, sessionButton3.updateComplete]);

      // Check tab numbers (using Light DOM)
      const tab1 = sessionButton1.querySelector(".alt-numeric")?.textContent?.trim();
      const tab2 = sessionButton2.querySelector(".alt-numeric")?.textContent?.trim();
      const tab3 = sessionButton3.querySelector(".alt-numeric")?.textContent?.trim();

      expect(tab1).toBe("1");
      expect(tab2).toBe("2");
      expect(tab3).toBe("3");

      container.remove();
    });

    it("should handle no parent element gracefully", async () => {
      const { sessionButton, mockSession } = setup();

      // Remove from parent
      sessionButton.remove();

      sessionButton.session = mockSession;
      await sessionButton.updateComplete;

      // Should not throw error and default to 0
      const tabNumber = sessionButton.querySelector(".alt-numeric")?.textContent?.trim();
      expect(tabNumber).toBe("0");
    });
  });

  describe("Click handling", () => {
    it("should call focusSession when clicked", async () => {
      const { focusSession } = await import("../../../src/frontend/session/helpers");
      vi.clearAllMocks(); // Clear previous calls

      const { sessionButton, mockSession } = setup();

      sessionButton.session = mockSession;
      mockSession.hasFocus = false;
      await sessionButton.updateComplete;

      // Click the button
      const clickableDiv = sessionButton.querySelector("div");
      expect(clickableDiv).toBeTruthy();

      clickableDiv?.dispatchEvent(new MouseEvent("click"));
      await sessionButton.updateComplete;

      expect(focusSession).toHaveBeenCalledWith(mockSession);

      teardown(sessionButton);
    });

    it("should not call focusSession when session already has focus", async () => {
      const { focusSession } = await import("../../../src/frontend/session/helpers");
      vi.clearAllMocks(); // Clear previous calls

      const { sessionButton, mockSession } = setup();

      sessionButton.session = mockSession;
      mockSession.hasFocus = true; // Already has focus
      await sessionButton.updateComplete;

      // Click the button
      const clickableDiv = sessionButton.querySelector("div");
      clickableDiv?.dispatchEvent(new MouseEvent("click"));
      await sessionButton.updateComplete;

      expect(focusSession).not.toHaveBeenCalled();

      teardown(sessionButton);
    });

    it("should not call focusSession when no session is set", async () => {
      const { focusSession } = await import("../../../src/frontend/session/helpers");
      vi.clearAllMocks(); // Clear previous calls

      const { sessionButton } = setup();

      await sessionButton.updateComplete;

      // Click the button (no session set)
      const clickableDiv = sessionButton.querySelector("div");
      clickableDiv?.dispatchEvent(new MouseEvent("click"));
      await sessionButton.updateComplete;

      expect(focusSession).not.toHaveBeenCalled();

      teardown(sessionButton);
    });
  });

  describe("CSS Styling", () => {
    it("should have proper action class styling", async () => {
      const { sessionButton, mockSession } = setup();

      sessionButton.session = mockSession;
      await sessionButton.updateComplete;

      expect(sessionButton.classList.contains("action")).toBe(true);

      // Check that CSS styles are defined (Light DOM uses static styles)
      const styles = SessionButton.styles;
      const stylesText = styles.toString();
      expect(stylesText).toContain("illthorn-session-button.action");

      teardown(sessionButton);
    });

    it("should apply active styling when on class is present", async () => {
      const { sessionButton, mockSession } = setup();

      sessionButton.session = mockSession;
      await sessionButton.updateComplete;

      // Make active
      Illthorn.bus.dispatchEvent(IllthornEvent.SESSION_FOCUS, mockSession);
      await sessionButton.updateComplete;

      expect(sessionButton.classList.contains("on")).toBe(true);
      expect(sessionButton.classList.contains("action")).toBe(true);

      teardown(sessionButton);
    });

    it("should have proper session name styling", async () => {
      const { sessionButton, mockSession } = setup();

      sessionButton.session = mockSession;
      await sessionButton.updateComplete;

      const sessionNameElement = sessionButton.querySelector(".session-name");
      expect(sessionNameElement).toBeTruthy();

      teardown(sessionButton);
    });

    it("should have proper alt-numeric styling", async () => {
      const { sessionButton, mockSession } = setup();

      sessionButton.session = mockSession;
      await sessionButton.updateComplete;

      const altNumericElement = sessionButton.querySelector(".alt-numeric");
      expect(altNumericElement).toBeTruthy();

      teardown(sessionButton);
    });
  });

  describe("Component lifecycle", () => {
    it("should handle session property changes", async () => {
      const { sessionButton, mockSession } = setup();

      // Initially no session
      expect(sessionButton.session).toBeUndefined();

      // Set session
      sessionButton.session = mockSession;
      await sessionButton.updateComplete;

      expect(sessionButton.session).toBe(mockSession);

      // Create new session
      const newMockSession = createMockSession("new-session");
      newMockSession.hasFocus = false;
      sessionButton.session = newMockSession;
      await sessionButton.updateComplete;

      expect(sessionButton.session).toBe(newMockSession);

      // Check that new session name is rendered
      const sessionNameElement = sessionButton.querySelector(".session-name");
      expect(sessionNameElement?.textContent?.trim()).toBe("n"); // First char of "new-session"

      teardown(sessionButton);
    });

    it("should cleanup properly on disconnect", async () => {
      const { sessionButton, mockSession } = setup();

      sessionButton.session = mockSession;
      await sessionButton.updateComplete;

      // Disconnect the component
      sessionButton.remove();

      // Component should be removed from DOM
      expect(document.body.contains(sessionButton)).toBe(false);
    });

    it("should not setup duplicate event listeners", async () => {
      const { sessionButton, mockSession } = setup();

      sessionButton.session = mockSession;
      await sessionButton.updateComplete;

      // Trigger updated again with same session
      sessionButton.session = mockSession;
      await sessionButton.updateComplete;

      // Should still work correctly without duplicate listeners
      Illthorn.bus.dispatchEvent(IllthornEvent.SESSION_FOCUS, mockSession);
      await sessionButton.updateComplete;

      expect(sessionButton.classList.contains("on")).toBe(true);

      teardown(sessionButton);
    });
  });

  describe("DOM structure", () => {
    it("should render proper DOM structure", async () => {
      const { sessionButton, mockSession } = setup();

      sessionButton.session = mockSession;
      await sessionButton.updateComplete;

      const container = sessionButton.querySelector("div");
      expect(container).toBeTruthy();

      const sessionNameElement = container?.querySelector(".session-name");
      const altNumericElement = container?.querySelector(".alt-numeric");

      expect(sessionNameElement).toBeTruthy();
      expect(altNumericElement).toBeTruthy();
      expect(sessionNameElement?.getAttribute("title")).toBe("test-session");

      teardown(sessionButton);
    });
  });
});
