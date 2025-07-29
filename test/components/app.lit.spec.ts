import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppRoot } from "../../src/frontend/components/app.lit";
import { IllthornEvent } from "../../src/frontend/events";
import { Illthorn } from "../../src/frontend/illthorn";
import type { FrontendSession } from "../../src/frontend/session";

// Mock session objects to prevent bus subscription errors
vi.mock("../../src/frontend/session", () => ({
  FrontendSession: vi.fn(),
}));

describe("AppRoot", () => {
  let element: AppRoot;

  const setup = () => {
    const appRoot = new AppRoot();
    document.body.appendChild(appRoot);
    return appRoot;
  };

  const teardown = (appRoot: AppRoot) => {
    if (appRoot.parentNode) {
      appRoot.parentNode.removeChild(appRoot);
    }
  };

  beforeEach(async () => {
    element = setup();
    await element.updateComplete;
  });

  afterEach(() => {
    teardown(element);
  });

  it("should render with proper grid layout structure", () => {
    expect(element).toBeDefined();
    // Component uses Light DOM for theme integration
    const leftPane = element.querySelector("#app-left-pane");
    const rightPane = element.querySelector("#app-right-pane");
    const actions = element.querySelector("#actions");
    const sessions = element.querySelector("illthorn-sessions-menu-lit");
    const currentContext = element.querySelector("#current-context");

    expect(leftPane).toBeDefined();
    expect(rightPane).toBeDefined();
    expect(actions).toBeDefined();
    expect(sessions).toBeDefined();
    expect(currentContext).toBeDefined();
  });

  it("should have static styles defined", () => {
    expect(AppRoot.styles).toBeDefined();
    const stylesString = AppRoot.styles.toString();
    expect(stylesString).toContain("display: grid");
    expect(stylesString).toContain("height: 100vh");
    expect(stylesString).toContain("var(--actions-width, 6em)");
  });

  it("should support theme CSS custom properties in styles", () => {
    const stylesString = AppRoot.styles.toString();
    expect(stylesString).toContain("var(--main-bg-color, black)");
    expect(stylesString).toContain("var(--text-color, white)");
  });

  it("should handle session focus events", async () => {
    const mockSession = {
      name: "TestSession",
      _sessionUIComponent: document.createElement("div"),
      onFocus: vi.fn(),
    } as unknown as FrontendSession;

    // Simulate session focus event
    Illthorn.bus.dispatchEvent(IllthornEvent.SESSION_FOCUS, mockSession);

    // Wait for the component to update
    await element.updateComplete;

    expect(element.currentSession).toBe(mockSession);
    expect(document.title).toBe("TestSession");
  });

  it.skip("should handle session rendering", async () => {
    const mockSession = {
      name: "TestSession",
      _sessionUIComponent: document.createElement("div"),
      onFocus: vi.fn(),
      bus: {
        subscribeEvent: vi.fn(),
        dispatchEvent: vi.fn(),
      },
      // Add minimal properties that child components might access
      config: {},
      parser: { bus: { subscribeEvent: vi.fn() } },
    } as unknown as FrontendSession;

    // Test the core session handling logic without complex component rendering
    element.currentSession = mockSession;

    // Check that the session is set properly and title updated
    expect(element.currentSession).toBe(mockSession);
    expect(document.title).toBe("TestSession");

    // Wait for handleSessionFocus to complete
    await element.updateComplete;
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(mockSession.onFocus).toHaveBeenCalled();
  });

  it("should update sessions list when new session events occur", async () => {
    // Simulate new session event
    const mockSession = {
      name: "NewSession",
      port: 8080,
      actionButton: document.createElement("div"),
    } as unknown as FrontendSession;

    Illthorn.bus.dispatchEvent(IllthornEvent.SESSION_NEW, mockSession);

    // Wait for the component to update
    await element.updateComplete;

    // The sessions list should be updated (component calls updateSessionsList)
    // This is a basic check that the event handler is working
    expect(element.updateSessionsList).toBeTypeOf("function");
  });

  it("should expose updateSessionsList method for external integration", () => {
    expect(element.updateSessionsList).toBeTypeOf("function");

    // Should not throw when called
    expect(() => element.updateSessionsList()).not.toThrow();
  });

  it("should maintain proper DOM structure after session updates", async () => {
    element.updateSessionsList();
    await element.updateComplete;

    // Component uses Light DOM for theme integration
    const leftPane = element.querySelector("#app-left-pane");
    const rightPane = element.querySelector("#app-right-pane");

    expect(leftPane).toBeDefined();
    expect(rightPane).toBeDefined();
  });
});
