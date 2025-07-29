import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionsMenu } from "../../src/frontend/components/sessions-menu.lit";
import { IllthornEvent } from "../../src/frontend/events";
import { Illthorn } from "../../src/frontend/illthorn";
import { SessionMap } from "../../src/frontend/session/map";
import { createMockSession, type MockSession } from "../mocks";

// Mock the session helpers
vi.mock("../../src/frontend/session/helpers", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    focusSession: vi.fn(),
    renderSession: vi.fn(),
  };
});

describe("SessionsMenu", () => {
  let sessionsMenu: SessionsMenu;

  const setup = () => {
    sessionsMenu = document.createElement("illthorn-sessions-menu-lit") as SessionsMenu;
    document.body.appendChild(sessionsMenu);
    return sessionsMenu;
  };

  const teardown = () => {
    if (sessionsMenu?.parentNode) {
      sessionsMenu.parentNode.removeChild(sessionsMenu);
    }
    // Clear SessionMap after each test
    SessionMap.clear();
  };

  beforeEach(() => {
    SessionMap.clear();
  });

  afterEach(() => {
    teardown();
  });

  describe("Basic rendering", () => {
    it("should create sessions-menu element", () => {
      setup();

      expect(sessionsMenu).toBeInstanceOf(SessionsMenu);
      expect(sessionsMenu.tagName.toLowerCase()).toBe("illthorn-sessions-menu-lit");
    });

    it("should render no-sessions message when no sessions exist", async () => {
      setup();
      await sessionsMenu.updateComplete;

      const noSessionsElement = sessionsMenu.querySelector(".no-sessions");
      expect(noSessionsElement).toBeTruthy();
      expect(noSessionsElement?.textContent?.trim()).toContain("No active sessions");
      expect(noSessionsElement?.textContent?.trim()).toContain("Use :c to connect");
    });

    it("should render sessions container when sessions exist", async () => {
      const mockSession = createMockSession("test-session");
      SessionMap.set("test-session", mockSession as MockSession);

      setup();
      await sessionsMenu.updateComplete;

      const sessionsContainer = sessionsMenu.querySelector(".sessions-container");
      const noSessionsElement = sessionsMenu.querySelector(".no-sessions");

      expect(sessionsContainer).toBeTruthy();
      expect(noSessionsElement).toBeFalsy();
    });
  });

  describe("Session management", () => {
    it("should initialize sessions from SessionMap", async () => {
      const mockSession1 = createMockSession("session1", 4001);
      const mockSession2 = createMockSession("session2", 4002);

      SessionMap.set("session1", mockSession1 as MockSession);
      SessionMap.set("session2", mockSession2 as MockSession);

      setup();
      await sessionsMenu.updateComplete;

      const sessionButtons = sessionsMenu.querySelectorAll("illthorn-session-button");
      expect(sessionButtons?.length).toBe(2);
    });

    it("should sort sessions by port number", async () => {
      const mockSession1 = createMockSession("session1", 4003);
      const mockSession2 = createMockSession("session2", 4001);
      const mockSession3 = createMockSession("session3", 4002);

      SessionMap.set("session1", mockSession1 as MockSession);
      SessionMap.set("session2", mockSession2 as MockSession);
      SessionMap.set("session3", mockSession3 as MockSession);

      setup();
      await sessionsMenu.updateComplete;

      const sessionButtons = sessionsMenu.querySelectorAll("illthorn-session-button");
      expect(sessionButtons?.length).toBe(3);

      // Verify order by checking session property
      const firstButton = sessionButtons?.[0] as MockSession;
      const secondButton = sessionButtons?.[1] as MockSession;
      const thirdButton = sessionButtons?.[2] as MockSession;

      expect(firstButton.session?.name).toBe("session2"); // port 4001
      expect(secondButton.session?.name).toBe("session3"); // port 4002
      expect(thirdButton.session?.name).toBe("session1"); // port 4003
    });

    it("should refresh sessions when refreshSessions is called", async () => {
      setup();
      await sessionsMenu.updateComplete;

      // Initially no sessions
      let sessionButtons = sessionsMenu.querySelectorAll("illthorn-session-button");
      expect(sessionButtons?.length).toBe(0);

      // Add a session to SessionMap
      const mockSession = createMockSession("new-session");
      (mockSession as MockSession).port = 4001;
      SessionMap.set("new-session", mockSession as MockSession);

      // Manually refresh (simulating what would happen via watcher)
      sessionsMenu.refreshSessions();
      await sessionsMenu.updateComplete;

      sessionButtons = sessionsMenu.querySelectorAll("illthorn-session-button");
      expect(sessionButtons?.length).toBe(1);
    });

    it("should identify active session from hasFocus property", async () => {
      const mockSession1 = createMockSession("session1");
      const mockSession2 = createMockSession("session2");

      (mockSession1 as MockSession).port = 4001;
      (mockSession2 as MockSession).port = 4002;
      mockSession2.hasFocus = true; // Mark as active

      SessionMap.set("session1", mockSession1 as MockSession);
      SessionMap.set("session2", mockSession2 as MockSession);

      setup();
      sessionsMenu.refreshSessions(); // Refresh to detect active session
      await sessionsMenu.updateComplete;
      await sessionsMenu.updateComplete; // Wait for the CSS class updates in updated()

      // Verify that the active session is identified
      const sessionButtons = sessionsMenu.querySelectorAll("illthorn-session-button");
      const activeButton = Array.from(sessionButtons || []).find(
        (button: Element) => (button as HTMLElement & { session?: MockSession }).session?.name === "session2",
      ) as HTMLElement;

      expect(activeButton).toBeTruthy();
      expect(activeButton?.classList.contains("on")).toBe(true);
    });
  });

  describe("Event handling", () => {
    it("should handle SESSION_FOCUS events", async () => {
      const mockSession1 = createMockSession("session1");
      const mockSession2 = createMockSession("session2");

      (mockSession1 as MockSession).port = 4001;
      (mockSession2 as MockSession).port = 4002;

      SessionMap.set("session1", mockSession1 as MockSession);
      SessionMap.set("session2", mockSession2 as MockSession);

      setup();
      await sessionsMenu.updateComplete;

      // Dispatch SESSION_FOCUS event
      Illthorn.bus.dispatchEvent(IllthornEvent.SESSION_FOCUS, mockSession2 as MockSession);
      await sessionsMenu.updateComplete;

      // Verify active session is updated
      const sessionButtons = sessionsMenu.querySelectorAll("illthorn-session-button");
      const activeButton = Array.from(sessionButtons || []).find(
        (button: Element) => (button as HTMLElement & { session?: MockSession }).session?.name === "session2",
      ) as HTMLElement;

      expect(activeButton).toBeTruthy();
      expect(activeButton?.classList.contains("on")).toBe(true);
    });

    it("should handle SESSION_NEW events", async () => {
      setup();
      await sessionsMenu.updateComplete;

      // Initially no sessions
      let sessionButtons = sessionsMenu.querySelectorAll("illthorn-session-button");
      expect(sessionButtons?.length).toBe(0);

      // Add session to SessionMap and dispatch event
      const mockSession = createMockSession("new-session");
      (mockSession as MockSession).port = 4001;
      SessionMap.set("new-session", mockSession as MockSession);

      Illthorn.bus.dispatchEvent(IllthornEvent.SESSION_NEW, mockSession as MockSession);
      await sessionsMenu.updateComplete;

      sessionButtons = sessionsMenu.querySelectorAll("illthorn-session-button");
      expect(sessionButtons?.length).toBe(1);
    });

    it("should not setup duplicate event listeners", async () => {
      setup();
      await sessionsMenu.updateComplete;

      // Force connectedCallback to be called again
      sessionsMenu.disconnectedCallback();
      sessionsMenu.connectedCallback();
      await sessionsMenu.updateComplete;

      // Event handling should still work
      const mockSession = createMockSession("test-session");
      (mockSession as MockSession).port = 4001;
      SessionMap.set("test-session", mockSession as MockSession);

      Illthorn.bus.dispatchEvent(IllthornEvent.SESSION_NEW, mockSession as MockSession);
      await sessionsMenu.updateComplete;

      const sessionButtons = sessionsMenu.querySelectorAll("illthorn-session-button");
      expect(sessionButtons?.length).toBe(1);
    });
  });

  describe("SessionMap watching", () => {
    it("should automatically detect new sessions added to SessionMap", async () => {
      setup();
      await sessionsMenu.updateComplete;

      // Initially no sessions
      let sessionButtons = sessionsMenu.querySelectorAll("illthorn-session-button");
      expect(sessionButtons?.length).toBe(0);

      // Add session to SessionMap
      const mockSession = createMockSession("auto-detected");
      (mockSession as MockSession).port = 4001;
      SessionMap.set("auto-detected", mockSession as MockSession);

      // Wait for the polling mechanism to detect the change (100ms interval + processing time)
      await new Promise((resolve) => setTimeout(resolve, 150));
      await sessionsMenu.updateComplete;

      sessionButtons = sessionsMenu.querySelectorAll("illthorn-session-button");
      expect(sessionButtons?.length).toBe(1);
    });

    it("should automatically detect sessions removed from SessionMap", async () => {
      const mockSession = createMockSession("to-be-removed");
      (mockSession as MockSession).port = 4001;
      SessionMap.set("to-be-removed", mockSession as MockSession);

      setup();
      await sessionsMenu.updateComplete;

      // Initially one session
      let sessionButtons = sessionsMenu.querySelectorAll("illthorn-session-button");
      expect(sessionButtons?.length).toBe(1);

      // Remove session from SessionMap
      SessionMap.delete("to-be-removed");

      // Wait for the polling mechanism to detect the change
      await new Promise((resolve) => setTimeout(resolve, 150));
      await sessionsMenu.updateComplete;

      sessionButtons = sessionsMenu.querySelectorAll("illthorn-session-button");
      expect(sessionButtons?.length).toBe(0);
    });

    it("should cleanup watcher on disconnect", async () => {
      setup();
      await sessionsMenu.updateComplete;

      // Disconnect the component
      sessionsMenu.disconnectedCallback();

      // Add a session after disconnect - should not trigger updates
      const mockSession = createMockSession("post-disconnect");
      (mockSession as MockSession).port = 4001;
      SessionMap.set("post-disconnect", mockSession as MockSession);

      // Wait longer than the polling interval
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Should not have updated since component is disconnected
      const sessionButtons = sessionsMenu.querySelectorAll("illthorn-session-button");
      expect(sessionButtons?.length).toBe(0);
    });
  });

  describe("Session button integration", () => {
    it("should render session buttons with correct properties", async () => {
      const mockSession = createMockSession("test-session");
      (mockSession as MockSession).port = 4001;
      mockSession.hasFocus = true;

      SessionMap.set("test-session", mockSession as MockSession);

      setup();
      await sessionsMenu.updateComplete;

      const sessionButton = sessionsMenu.querySelector("illthorn-session-button") as MockSession;
      expect(sessionButton).toBeTruthy();
      expect(sessionButton.session).toBe(mockSession);
      expect(sessionButton.active).toBe(true);
    });

    it("should update session button active states when active session changes", async () => {
      const mockSession1 = createMockSession("session1");
      const mockSession2 = createMockSession("session2");

      (mockSession1 as MockSession).port = 4001;
      (mockSession2 as MockSession).port = 4002;
      mockSession1.hasFocus = true; // Initially active

      SessionMap.set("session1", mockSession1 as MockSession);
      SessionMap.set("session2", mockSession2 as MockSession);

      setup();
      await sessionsMenu.updateComplete;

      // Change active session
      mockSession1.hasFocus = false;
      mockSession2.hasFocus = true;
      sessionsMenu.handleSessionFocus(mockSession2 as MockSession);
      await sessionsMenu.updateComplete;

      const sessionButtons = sessionsMenu.querySelectorAll("illthorn-session-button");
      const button1 = Array.from(sessionButtons || []).find((button: Element) => (button as HTMLElement & { session?: MockSession }).session?.name === "session1") as HTMLElement;
      const button2 = Array.from(sessionButtons || []).find((button: Element) => (button as HTMLElement & { session?: MockSession }).session?.name === "session2") as HTMLElement;

      expect(button1?.classList.contains("on")).toBe(false);
      expect(button2?.classList.contains("on")).toBe(true);
    });

    it("should maintain session button CSS classes for styling", async () => {
      const mockSession = createMockSession("test-session");
      (mockSession as MockSession).port = 4001;
      mockSession.hasFocus = true;

      SessionMap.set("test-session", mockSession as MockSession);

      setup();
      await sessionsMenu.updateComplete;

      const sessionButton = sessionsMenu.querySelector("illthorn-session-button") as MockSession;
      expect(sessionButton).toBeTruthy();

      // Allow time for the updated() method to set CSS classes
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(sessionButton.classList.contains("on")).toBe(true);
    });
  });

  describe("CSS and styling", () => {
    it("should have proper host styling", async () => {
      setup();
      await sessionsMenu.updateComplete;

      // Since we're using Light DOM, check the static styles property instead
      const styles = SessionsMenu.styles;
      expect(styles).toBeTruthy();
      const stylesText = styles.toString();
      expect(stylesText).toContain("illthorn-sessions-menu-lit");
      expect(stylesText).toContain("display: flex");
      expect(stylesText).toContain("flex-direction: column");
    });

    it("should style sessions container properly", async () => {
      const mockSession = createMockSession("test-session");
      (mockSession as MockSession).port = 4001;
      SessionMap.set("test-session", mockSession as MockSession);

      setup();
      await sessionsMenu.updateComplete;

      const sessionsContainer = sessionsMenu.querySelector(".sessions-container");
      expect(sessionsContainer).toBeTruthy();

      // Check static styles for Light DOM components
      const styles = SessionsMenu.styles;
      const stylesText = styles.toString();
      expect(stylesText).toContain(".sessions-container");
    });

    it("should style no-sessions message properly", async () => {
      setup();
      await sessionsMenu.updateComplete;

      const noSessionsElement = sessionsMenu.querySelector(".no-sessions");
      expect(noSessionsElement).toBeTruthy();

      // Check static styles for Light DOM components
      const styles = SessionsMenu.styles;
      const stylesText = styles.toString();
      expect(stylesText).toContain(".no-sessions");
    });

    it("should have proper session button styling", async () => {
      setup();
      await sessionsMenu.updateComplete;

      // Check static styles for Light DOM components
      const styles = SessionsMenu.styles;
      const stylesText = styles.toString();
      expect(stylesText).toContain("illthorn-session-button");
      expect(stylesText).toContain("display: block");
      expect(stylesText).toContain("width: 100%");
    });
  });

  describe("Component lifecycle", () => {
    it("should initialize properly on connection", async () => {
      const mockSession = createMockSession("init-session");
      (mockSession as MockSession).port = 4001;
      SessionMap.set("init-session", mockSession as MockSession);

      setup();
      await sessionsMenu.updateComplete;

      const sessionButtons = sessionsMenu.querySelectorAll("illthorn-session-button");
      expect(sessionButtons?.length).toBe(1);
    });

    it("should cleanup properly on disconnection", async () => {
      setup();
      await sessionsMenu.updateComplete;

      // Verify event listeners were setup
      expect((sessionsMenu as MockSession)._eventListenerSetup).toBe(true);
      expect((sessionsMenu as MockSession)._sessionMapObserver).toBeTruthy();

      // Disconnect
      sessionsMenu.disconnectedCallback();

      // Verify cleanup
      expect((sessionsMenu as MockSession)._eventListenerSetup).toBe(false);
      expect((sessionsMenu as MockSession)._sessionMapObserver).toBe(null);
    });

    it("should handle multiple connect/disconnect cycles", async () => {
      setup();
      await sessionsMenu.updateComplete;

      // Disconnect and reconnect
      sessionsMenu.disconnectedCallback();
      sessionsMenu.connectedCallback();
      await sessionsMenu.updateComplete;

      // Should still work properly
      const mockSession = createMockSession("cycle-test");
      (mockSession as MockSession).port = 4001;
      SessionMap.set("cycle-test", mockSession as MockSession);

      sessionsMenu.refreshSessions();
      await sessionsMenu.updateComplete;

      const sessionButtons = sessionsMenu.querySelectorAll("illthorn-session-button");
      expect(sessionButtons?.length).toBe(1);
    });
  });

  describe("Error handling", () => {
    it("should handle sessions without port property gracefully", async () => {
      const mockSession = createMockSession("no-port-session");
      // Intentionally not setting port property

      SessionMap.set("no-port-session", mockSession as MockSession);

      setup();
      await sessionsMenu.updateComplete;

      // Should not crash and should still render the session
      const sessionButtons = sessionsMenu.querySelectorAll("illthorn-session-button");
      expect(sessionButtons?.length).toBe(1);
    });

    it("should handle empty SessionMap gracefully", async () => {
      SessionMap.clear();

      setup();
      await sessionsMenu.updateComplete;

      const noSessionsElement = sessionsMenu.querySelector(".no-sessions");
      expect(noSessionsElement).toBeTruthy();
      expect(noSessionsElement?.textContent?.trim()).toContain("No active sessions");
      expect(noSessionsElement?.textContent?.trim()).toContain("Use :c to connect");
    });

    it("should handle rapid SessionMap changes", async () => {
      setup();
      await sessionsMenu.updateComplete;

      // Rapidly add and remove sessions
      for (let i = 0; i < 5; i++) {
        const mockSession = createMockSession(`rapid-${i}`);
        (mockSession as MockSession).port = 4000 + i;
        SessionMap.set(`rapid-${i}`, mockSession as MockSession);
      }

      // Wait for polling to catch up
      await new Promise((resolve) => setTimeout(resolve, 150));
      await sessionsMenu.updateComplete;

      let sessionButtons = sessionsMenu.querySelectorAll("illthorn-session-button");
      expect(sessionButtons?.length).toBe(5);

      // Remove all sessions
      SessionMap.clear();

      // Wait for polling to catch up
      await new Promise((resolve) => setTimeout(resolve, 150));
      await sessionsMenu.updateComplete;

      sessionButtons = sessionsMenu.querySelectorAll("illthorn-session-button");
      expect(sessionButtons?.length).toBe(0);
    });
  });
});
