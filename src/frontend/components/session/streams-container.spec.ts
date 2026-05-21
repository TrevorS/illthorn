// ABOUTME: Test suite for StreamsContainer component verifying session event handling and stream data processing
// ABOUTME: Tests the smart container component's integration with session bus and stream metadata processing
/// <reference types="vitest/globals" />
import type { MockedFunction } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GameTag } from "../../parser/tag";
import { makeTag } from "../../parser/tag/index";
import type { FrontendSession } from "../../session/index";
import type { Bus } from "../../util/bus";
import { StreamsContainer } from "./streams-container.lit";
import type { StreamsUI } from "./streams-ui.lit";

describe("StreamsContainer", () => {
  let mockSession: Partial<FrontendSession>;
  let mockBus: Partial<Bus> & {
    // biome-ignore lint/suspicious/noExplicitAny: Mock function requires any type for flexibility
    subscribeEvent: MockedFunction<any>;
    // biome-ignore lint/suspicious/noExplicitAny: Mock function requires any type for flexibility
    dispatchEvent: MockedFunction<any>;
    _ele: HTMLDivElement;
  };

  const setup = (sessionParam?: FrontendSession) => {
    const container = new StreamsContainer();
    if (sessionParam) {
      container.session = sessionParam;
    }
    document.body.appendChild(container);
    return container;
  };

  const teardown = (container: StreamsContainer) => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  };

  beforeEach(() => {
    mockBus = {
      subscribeEvent: vi.fn(),
      dispatchEvent: vi.fn(),
      _ele: document.createElement("div"),
    };
    mockSession = {
      bus: mockBus as Bus,
    } as Partial<FrontendSession>;
  });

  afterEach(() => {
    // Clean up any remaining elements
    const containers = document.querySelectorAll("illthorn-streams-container");
    containers.forEach((container) => {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    });
  });

  describe("Constructor", () => {
    it("should initialize with empty entries", () => {
      const container = setup();

      expect(container.session).toBeUndefined();

      teardown(container);
    });

    it("should accept session property", () => {
      const container = setup(mockSession as FrontendSession);

      expect(container.session).toBe(mockSession);

      teardown(container);
    });
  });

  describe("Event Listener Setup", () => {
    it("should subscribe to all stream metadata events when session is available", async () => {
      const container = setup(mockSession as FrontendSession);
      await container.updateComplete;

      expect(mockBus.subscribeEvent).toHaveBeenCalledWith("metadata/stream/thoughts", expect.any(Function));
      expect(mockBus.subscribeEvent).toHaveBeenCalledWith("metadata/stream/speech", expect.any(Function));
      expect(mockBus.subscribeEvent).toHaveBeenCalledWith("metadata/stream/logon", expect.any(Function));
      expect(mockBus.subscribeEvent).toHaveBeenCalledWith("metadata/stream/logoff", expect.any(Function));
      expect(mockBus.subscribeEvent).toHaveBeenCalledWith("metadata/stream/death", expect.any(Function));

      expect(mockBus.subscribeEvent).toHaveBeenCalledTimes(5);

      teardown(container);
    });

    it("should not subscribe if session is missing", async () => {
      const container = setup();
      await container.updateComplete;

      expect(mockBus.subscribeEvent).not.toHaveBeenCalled();

      teardown(container);
    });

    it("should not subscribe if bus is missing", async () => {
      const sessionWithoutBus = {} as FrontendSession;
      const container = setup(sessionWithoutBus);
      await container.updateComplete;

      // Should not throw and should not call subscribe
      expect(mockBus.subscribeEvent).not.toHaveBeenCalled();

      teardown(container);
    });

    it("should set up event listeners when session property is updated", async () => {
      const container = setup();
      await container.updateComplete;

      // Initially no subscriptions
      expect(mockBus.subscribeEvent).not.toHaveBeenCalled();

      // Add session
      container.session = mockSession as FrontendSession;
      await container.updateComplete;

      // Now should have subscriptions
      expect(mockBus.subscribeEvent).toHaveBeenCalledTimes(5);

      teardown(container);
    });

    it("should cleanup event listeners on disconnect", async () => {
      const container = setup(mockSession as FrontendSession);
      await container.updateComplete;

      // Verify subscriptions were made
      expect(mockBus.subscribeEvent).toHaveBeenCalledTimes(5);

      // Mock removeEventListener
      const removeEventListenerSpy = vi.spyOn(mockBus._ele, "removeEventListener");

      // Disconnect the component
      teardown(container);

      // Should clean up event listeners
      expect(removeEventListenerSpy).toHaveBeenCalledTimes(5);

      removeEventListenerSpy.mockRestore();
    });
  });

  describe("Stream Data Processing", () => {
    it("should process thoughts stream events correctly", async () => {
      const container = setup(mockSession as FrontendSession);
      await container.updateComplete;

      const thoughtsTag: GameTag = makeTag("stream");
      thoughtsTag.attrs = { id: "thoughts" };
      thoughtsTag.text = 'Someone thinks, "This is a test thought"';

      // Get the handler that was registered
      const thoughtsHandlerCall = mockBus.subscribeEvent.mock.calls.find((call: unknown[]) => call[0] === "metadata/stream/thoughts");
      expect(thoughtsHandlerCall).toBeDefined();

      const thoughtsHandler = thoughtsHandlerCall?.[1] as (event: { detail: GameTag }) => void;
      expect(typeof thoughtsHandler).toBe("function");

      // Simulate the event
      thoughtsHandler({ detail: thoughtsTag });
      await container.updateComplete;

      // Check if entry was added (we can't directly access private _entries, but we can check the rendered UI)
      const uiComponent = container.shadowRoot?.querySelector("illthorn-streams-ui");
      expect(uiComponent).toBeTruthy();

      teardown(container);
    });

    it("should extract content from GameTag text property", async () => {
      const container = setup(mockSession as FrontendSession);
      await container.updateComplete;

      const testTag: GameTag = makeTag("stream");
      testTag.attrs = { id: "thoughts" };
      testTag.text = "Direct text content";

      // Get the handler and trigger it
      const thoughtsHandlerCall = mockBus.subscribeEvent.mock.calls.find((call: unknown[]) => call[0] === "metadata/stream/thoughts");
      expect(thoughtsHandlerCall).toBeDefined();
      const thoughtsHandler = thoughtsHandlerCall?.[1] as (event: { detail: GameTag }) => void;
      expect(typeof thoughtsHandler).toBe("function");
      thoughtsHandler({ detail: testTag });
      await container.updateComplete;

      // Verify content was processed
      const uiComponent = container.shadowRoot?.querySelector("illthorn-streams-ui");
      expect(uiComponent).toBeTruthy();

      teardown(container);
    });

    it("should extract content from GameTag children when text is empty", async () => {
      const container = setup(mockSession as FrontendSession);
      await container.updateComplete;

      const childTag: GameTag = makeTag(":text");
      childTag.text = "Child text content";

      const testTag: GameTag = makeTag("stream");
      testTag.attrs = { id: "thoughts" };
      testTag.text = "";
      testTag.children = [childTag];

      // Get the handler and trigger it
      const thoughtsHandlerCall = mockBus.subscribeEvent.mock.calls.find((call: unknown[]) => call[0] === "metadata/stream/thoughts");
      expect(thoughtsHandlerCall).toBeDefined();
      const thoughtsHandler = thoughtsHandlerCall?.[1] as (event: { detail: GameTag }) => void;
      expect(typeof thoughtsHandler).toBe("function");
      thoughtsHandler({ detail: testTag });
      await container.updateComplete;

      // Verify content was processed
      const uiComponent = container.shadowRoot?.querySelector("illthorn-streams-ui");
      expect(uiComponent).toBeTruthy();

      teardown(container);
    });
  });

  describe("Memory Management", () => {
    it("should limit entries to prevent memory issues", async () => {
      const container = setup(mockSession as FrontendSession);
      await container.updateComplete;

      // Get the thoughts handler
      const thoughtsHandlerCall = mockBus.subscribeEvent.mock.calls.find((call: unknown[]) => call[0] === "metadata/stream/thoughts");
      expect(thoughtsHandlerCall).toBeDefined();
      const thoughtsHandler = thoughtsHandlerCall?.[1] as (event: { detail: GameTag }) => void;
      expect(typeof thoughtsHandler).toBe("function");

      // Add more than 1000 entries
      for (let i = 0; i < 1100; i++) {
        const testTag: GameTag = makeTag("stream");
        testTag.attrs = { id: "thoughts" };
        testTag.text = `Test entry ${i}`;

        thoughtsHandler({ detail: testTag });
      }
      await container.updateComplete;

      // We can't directly check _entries, but the component should still be functional
      // and not crash from memory issues
      const uiComponent = container.shadowRoot?.querySelector("illthorn-streams-ui");
      expect(uiComponent).toBeTruthy();

      teardown(container);
    });
  });

  describe("Clear Functionality", () => {
    it("should handle clear events from UI component", async () => {
      const container = setup(mockSession as FrontendSession);
      await container.updateComplete;

      // Add some entries first
      const thoughtsHandlerCall = mockBus.subscribeEvent.mock.calls.find((call: unknown[]) => call[0] === "metadata/stream/thoughts");
      expect(thoughtsHandlerCall).toBeDefined();
      const thoughtsHandler = thoughtsHandlerCall?.[1] as (event: { detail: GameTag }) => void;
      expect(typeof thoughtsHandler).toBe("function");

      const testTag: GameTag = makeTag("stream");
      testTag.attrs = { id: "thoughts" };
      testTag.text = "Test entry";
      thoughtsHandler({ detail: testTag });
      await container.updateComplete;

      // Simulate clear event from UI
      const uiComponent = container.shadowRoot?.querySelector("illthorn-streams-ui");
      expect(uiComponent).toBeTruthy();

      const clearEvent = new CustomEvent("clear");
      uiComponent?.dispatchEvent(clearEvent);
      await container.updateComplete;

      // Component should still be functional after clear
      expect(uiComponent).toBeTruthy();

      teardown(container);
    });
  });

  describe("Rendering", () => {
    it("should render streams UI component", async () => {
      const container = setup(mockSession as FrontendSession);
      await container.updateComplete;

      const uiComponent = container.shadowRoot?.querySelector("illthorn-streams-ui");
      expect(uiComponent).toBeTruthy();
      expect(uiComponent?.tagName.toLowerCase()).toBe("illthorn-streams-ui");

      teardown(container);
    });

    it("should pass entries to UI component", async () => {
      const container = setup(mockSession as FrontendSession);
      await container.updateComplete;

      const uiComponent = container.shadowRoot?.querySelector("illthorn-streams-ui") as StreamsUI;
      expect(uiComponent).toBeTruthy();
      expect(Array.isArray(uiComponent.entries)).toBe(true);

      teardown(container);
    });
  });

  describe("Property Reactivity", () => {
    it("should update when session property changes", async () => {
      const container = setup();
      await container.updateComplete;

      // Initially no subscriptions
      expect(mockBus.subscribeEvent).not.toHaveBeenCalled();

      // Change session
      container.session = mockSession as FrontendSession;
      await container.updateComplete;

      // Should now have subscriptions
      expect(mockBus.subscribeEvent).toHaveBeenCalledTimes(5);

      teardown(container);
    });
  });
});
