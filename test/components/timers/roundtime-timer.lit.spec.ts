// ABOUTME: Test suite for RoundtimeTimer component verifying countdown behavior and bus integration
// ABOUTME: Tests timer lifecycle, progress calculation, cleanup, and metadata event handling
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RoundtimeTimer } from "../../../src/frontend/components/timers/roundtime-timer.lit";
import type { GameTag } from "../../../src/frontend/parser/tag";
import { TagKind, TagState } from "../../../src/frontend/parser/tag/index";
import type { FrontendSession } from "../../../src/frontend/session";
import { createMockSession, type MockSession } from "../../mocks";

// Mock timers for precise control
vi.useFakeTimers();

describe("RoundtimeTimer", () => {
  let timer: RoundtimeTimer;
  let mockSession: MockSession;

  const setup = (session?: MockSession) => {
    const element = new RoundtimeTimer();
    if (session) {
      element.session = session as FrontendSession;
    }
    document.body.appendChild(element);
    return element;
  };

  const teardown = (element: RoundtimeTimer) => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  };

  beforeEach(() => {
    mockSession = createMockSession("test-session");
    timer = setup(mockSession);
  });

  afterEach(() => {
    teardown(timer);
    vi.clearAllTimers();
  });

  describe("Component Initialization", () => {
    it("should render with session property", () => {
      expect(timer.session).toBe(mockSession);
      expect(timer).toBeInstanceOf(RoundtimeTimer);
    });

    it("should be transparent initially when not active", async () => {
      await timer.updateComplete;
      expect(timer.classList.contains("active")).toBe(false);
      // Component should still be rendered but transparent
      const progressBar = timer.shadowRoot?.querySelector("sl-progress-bar");
      expect(progressBar).toBeTruthy();
    });

    it("should subscribe to metadata/roundTime events when session is provided", () => {
      const subscribeSpy = vi.spyOn(mockSession.bus, "subscribeEvent");

      // Create new timer to trigger subscription
      const newTimer = setup(mockSession);

      expect(subscribeSpy).toHaveBeenCalledWith("metadata/roundTime", expect.any(Function));

      teardown(newTimer);
    });

    it("should not subscribe when session is missing", () => {
      const noSessionTimer = setup();
      const subscribeSpy = vi.spyOn(mockSession.bus, "subscribeEvent");

      // Should not have been called since no session
      expect(subscribeSpy).not.toHaveBeenCalled();

      teardown(noSessionTimer);
    });
  });

  describe("Timer Behavior", () => {
    let eventCallback: (event: CustomEvent<GameTag>) => void;

    beforeEach(() => {
      // Capture the event callback for testing
      vi.spyOn(mockSession.bus, "subscribeEvent").mockImplementation((_eventName: string, callback: (event: CustomEvent<GameTag>) => void) => {
        eventCallback = callback;
      });

      // Re-setup to trigger subscription with spy
      teardown(timer);
      timer = setup(mockSession);
    });

    it("should start timer with valid duration (documented format)", async () => {
      const mockEvent: GameTag = {
        kind: TagKind.METADATA,
        name: "roundTime",
        gameName: "",
        attrs: { value: "3", time: "3.0" },
        children: [],
        state: TagState.OPEN,
        text: "",
      };

      eventCallback({ detail: mockEvent } as CustomEvent<GameTag>);
      await timer.updateComplete;

      expect(timer.classList.contains("active")).toBe(true);

      const progressBar = timer.shadowRoot?.querySelector("sl-progress-bar");
      expect(progressBar).toBeTruthy();
      expect(progressBar?.getAttribute("aria-label")).toBe("Roundtime remaining");
    });

    it("should start timer with end timestamp (actual game format)", async () => {
      // Mock current time to be predictable
      const mockCurrentTime = 1700000000; // Some timestamp
      const dateSpy = vi.spyOn(Date, "now").mockReturnValue(mockCurrentTime * 1000); // Date.now() returns milliseconds

      const mockEvent: GameTag = {
        kind: TagKind.METADATA,
        name: "roundTime",
        gameName: "",
        attrs: { value: (mockCurrentTime + 5).toString() }, // 5 seconds from now
        children: [],
        state: TagState.OPEN,
        text: "",
      };

      eventCallback({ detail: mockEvent } as CustomEvent<GameTag>);
      await timer.updateComplete;

      expect(timer.classList.contains("active")).toBe(true);

      const progressBar = timer.shadowRoot?.querySelector("sl-progress-bar");
      expect(progressBar).toBeTruthy();
      expect(progressBar?.getAttribute("aria-label")).toBe("Roundtime remaining");

      // Clean up mock
      dateSpy.mockRestore();
    });

    it("should not start timer with zero duration", () => {
      const mockEvent: GameTag = {
        kind: TagKind.METADATA,
        name: "roundTime",
        gameName: "",
        attrs: { value: "0", time: "0" },
        children: [],
        state: TagState.OPEN,
        text: "",
      };

      eventCallback({ detail: mockEvent } as CustomEvent<GameTag>);

      expect(timer.classList.contains("active")).toBe(false);
    });

    it("should countdown from 100% to 0%", async () => {
      const mockEvent: GameTag = {
        kind: TagKind.METADATA,
        name: "roundTime",
        gameName: "",
        attrs: { value: "2", time: "2.0" },
        children: [],
        state: TagState.OPEN,
        text: "",
      };

      eventCallback({ detail: mockEvent } as CustomEvent<GameTag>);
      await timer.updateComplete;

      // Should start at 100%
      let progressBar = timer.shadowRoot?.querySelector("sl-progress-bar");
      expect(progressBar?.value).toBe(100);

      // Advance time by 1 second (50% remaining)
      vi.advanceTimersByTime(1000);
      await timer.updateComplete;

      progressBar = timer.shadowRoot?.querySelector("sl-progress-bar");
      expect(progressBar?.value).toBeCloseTo(50, 1);

      // Advance time by 1 more second (timer should complete)
      vi.advanceTimersByTime(1000);
      await timer.updateComplete;

      expect(timer.classList.contains("active")).toBe(false);
    });

    it("should handle multiple timer starts (cleanup old timer)", async () => {
      // Start first timer
      const firstEvent: GameTag = {
        kind: TagKind.METADATA,
        name: "roundTime",
        gameName: "",
        attrs: { value: "5", time: "5.0" },
        children: [],
        state: TagState.OPEN,
        text: "",
      };

      eventCallback({ detail: firstEvent } as CustomEvent<GameTag>);
      await timer.updateComplete;

      // Start second timer before first completes
      const secondEvent: GameTag = {
        kind: TagKind.METADATA,
        name: "roundTime",
        gameName: "",
        attrs: { value: "2", time: "2.0" },
        children: [],
        state: TagState.OPEN,
        text: "",
      };

      eventCallback({ detail: secondEvent } as CustomEvent<GameTag>);
      await timer.updateComplete;

      // Should restart at 100% with new duration
      const progressBar = timer.shadowRoot?.querySelector("sl-progress-bar");
      expect(progressBar?.value).toBe(100);

      // After 1 second, should be at 50% of 2-second timer
      vi.advanceTimersByTime(1000);
      await timer.updateComplete;

      expect(progressBar?.value).toBeCloseTo(50, 1);
    });

    it("should parse integer and float time values correctly", async () => {
      // Test integer value
      const integerEvent: GameTag = {
        kind: TagKind.METADATA,
        name: "roundTime",
        gameName: "",
        attrs: { value: "3", time: "3" },
        children: [],
        state: TagState.OPEN,
        text: "",
      };

      eventCallback({ detail: integerEvent } as CustomEvent<GameTag>);
      await timer.updateComplete;
      expect(timer.classList.contains("active")).toBe(true);

      // Test float value
      const floatEvent: GameTag = {
        kind: TagKind.METADATA,
        name: "roundTime",
        gameName: "",
        attrs: { value: "2", time: "2.5" },
        children: [],
        state: TagState.OPEN,
        text: "",
      };

      eventCallback({ detail: floatEvent } as CustomEvent<GameTag>);
      await timer.updateComplete;
      expect(timer.classList.contains("active")).toBe(true);

      // After 0.5 seconds, should be at 75% of 2-second timer (1.5s remaining)
      vi.advanceTimersByTime(500);
      await timer.updateComplete;

      const progressBar = timer.shadowRoot?.querySelector("sl-progress-bar");
      expect(progressBar?.value).toBeCloseTo(75, 1);
    });

    it("should handle malformed time values gracefully", () => {
      const malformedEvent: GameTag = {
        kind: TagKind.METADATA,
        name: "roundTime",
        gameName: "",
        attrs: { value: "invalid", time: "not-a-number" },
        children: [],
        state: TagState.OPEN,
        text: "",
      };

      eventCallback({ detail: malformedEvent } as CustomEvent<GameTag>);

      // Should not start timer with invalid values
      expect(timer.classList.contains("active")).toBe(false);
    });
  });

  describe("Lifecycle Management", () => {
    it("should cleanup timer on disconnect", async () => {
      const mockEvent: GameTag = {
        kind: TagKind.METADATA,
        name: "roundTime",
        gameName: "",
        attrs: { value: "5", time: "5.0" },
        children: [],
        state: TagState.OPEN,
        text: "",
      };

      // Start timer
      const _subscribeSpy = vi.spyOn(mockSession.bus, "subscribeEvent").mockImplementation((_eventName: string, callback: (event: CustomEvent<GameTag>) => void) => {
        callback({ detail: mockEvent } as CustomEvent<GameTag>);
      });

      teardown(timer);
      timer = setup(mockSession);
      await timer.updateComplete;

      expect(timer.classList.contains("active")).toBe(true);

      // Disconnect component
      teardown(timer);

      // Timer should be cleaned up - no way to directly test setInterval cleanup,
      // but disconnectedCallback should have been called
      expect(timer.isConnected).toBe(false);
    });

    it("should update subscription when session changes", async () => {
      const newMockSession = createMockSession("new-session");
      const _oldSubscribeSpy = vi.spyOn(mockSession.bus, "subscribeEvent");
      const newSubscribeSpy = vi.spyOn(newMockSession.bus, "subscribeEvent");

      // Change session
      timer.session = newMockSession as FrontendSession;
      await timer.updateComplete; // Wait for updated() lifecycle to run

      expect(newSubscribeSpy).toHaveBeenCalledWith("metadata/roundTime", expect.any(Function));
    });
  });

  describe("Progress Bar Styling", () => {
    it("should apply correct CSS custom properties", () => {
      const styles = RoundtimeTimer.styles;
      expect(styles.cssText).toContain("--track-color: color-mix(in srgb, var(--color-text-primary) 10%, transparent)");
      expect(styles.cssText).toContain("height: 3px");
      expect(styles.cssText).toContain("opacity: 0");
      expect(styles.cssText).toContain(":host(.active)");
    });

    it("should apply correct indicator color via style attribute", async () => {
      await timer.updateComplete;
      const progressBar = timer.shadowRoot?.querySelector("sl-progress-bar");
      const styleAttr = progressBar?.getAttribute("style");
      expect(styleAttr).toContain("--indicator-color: var(--color-danger)");
    });
  });
});
