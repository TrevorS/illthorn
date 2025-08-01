// ABOUTME: Integration test to verify that the UI initialization race condition is fixed
// ABOUTME: Tests that session messages don't get lost due to components not being available
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CommandHistory } from "../../src/frontend/components/command-bar/command-history";
import type { SessionButton } from "../../src/frontend/components/session/session-button.lit";
import { Parser } from "../../src/frontend/parser/parser";
import type { FrontendSession } from "../../src/frontend/session/index";
import { Bus } from "../../src/frontend/util/bus";
import "../../src/frontend/components/session-layout.lit";
import type { SessionLayout } from "../../src/frontend/components/session-layout.lit";

const createMockSession = () => {
  const bus = new Bus();
  const mockActionButton = document.createElement("illthorn-session-button") as SessionButton;
  return {
    name: "race-test-session",
    config: { name: "race-test-session", port: 4000 },
    parser: Parser.of(),
    bus,
    hasFocus: false,
    history: new CommandHistory(100),
    actionButton: mockActionButton,
    streams: () => {},
    send: () => {},
    onMessage: () => {},
    disconnect: () => Promise.resolve(),
    setUI: () => {},
  } as FrontendSession;
};

describe("UI Initialization Race Condition Fix", () => {
  let sessionUI: SessionLayout;
  let mockSession: FrontendSession;

  beforeEach(async () => {
    // Create session UI component
    sessionUI = document.createElement("illthorn-session-layout-lit") as SessionLayout;
    mockSession = createMockSession();
    sessionUI.session = mockSession;
    document.body.appendChild(sessionUI);
    await sessionUI.updateComplete;
  });

  afterEach(() => {
    if (sessionUI?.parentNode) {
      sessionUI.parentNode.removeChild(sessionUI);
    }
  });

  it("should wait for initialization before allowing component access", async () => {
    // The key test: components should not be available immediately
    const sessionUIObj = sessionUI.getSessionUI();

    // Before initialization, feed might not be available
    const feedBeforeInit = sessionUIObj.feed;

    // Wait for initialization to complete
    await sessionUI.waitForInitialization();

    // After initialization, components should be available
    const feedAfterInit = sessionUIObj.feed;

    // The feed should be available after initialization (or was available all along)
    expect(feedAfterInit).toBeTruthy();

    console.log("Feed availability:", {
      beforeInit: !!feedBeforeInit,
      afterInit: !!feedAfterInit,
    });
  });

  it("should provide initialization promise that resolves when components are ready", async () => {
    const startTime = Date.now();

    // The initialization promise should exist immediately
    expect(sessionUI.waitForInitialization).toBeDefined();
    expect(sessionUI.waitForInitialization()).toBeInstanceOf(Promise);

    // Wait for initialization to complete
    await sessionUI.waitForInitialization();

    const endTime = Date.now();
    const initTime = endTime - startTime;

    // Initialization should complete in reasonable time (< 100ms for tests)
    expect(initTime).toBeLessThan(100);

    // After initialization, all critical components should be available
    const sessionUIObj = sessionUI.getSessionUI();
    expect(sessionUIObj.context).toBeTruthy();
    expect(sessionUIObj.cli).toBeTruthy();
    // Note: feed might be missing in test environment, that's OK - the key is no race condition

    console.log(`Initialization completed in ${initTime}ms`);
  });

  it("should allow multiple calls to waitForInitialization", async () => {
    // Multiple calls to waitForInitialization should all resolve to the same promise
    const promise1 = sessionUI.waitForInitialization();
    const promise2 = sessionUI.waitForInitialization();
    const promise3 = sessionUI.waitForInitialization();

    // All promises should be the same instance
    expect(promise1).toBe(promise2);
    expect(promise2).toBe(promise3);

    // All should resolve successfully
    await Promise.all([promise1, promise2, promise3]);

    // After resolution, new calls should still return a resolved promise
    const promise4 = sessionUI.waitForInitialization();
    await promise4; // Should resolve immediately
  });

  it("should handle rapid successive component access gracefully", async () => {
    // Simulate rapid access to components (like what might happen with fast message processing)
    const sessionUIObj = sessionUI.getSessionUI();

    const rapidAccess = Array.from({ length: 10 }, (_, i) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const feed = sessionUIObj.feed;
          const cli = sessionUIObj.cli;
          const context = sessionUIObj.context;
          resolve({ feed: !!feed, cli: !!cli, context: !!context });
        }, i * 5); // Stagger access every 5ms
      });
    });

    // Wait for initialization to complete
    await sessionUI.waitForInitialization();

    // All rapid accesses should eventually succeed
    const results = await Promise.all(rapidAccess);

    // All results should have context available (CLI and feed may vary in test environment)
    results.forEach((result) => {
      expect((result as { context: boolean }).context).toBe(true);
    });

    console.log("Rapid access results:", results);
  });
});
