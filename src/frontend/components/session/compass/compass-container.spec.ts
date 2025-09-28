// ABOUTME: Test suite for CompassContainer component verifying session event handling and direction processing
// ABOUTME: Tests the smart container component's integration with session bus and compass metadata processing
/// <reference types="vitest/globals" />
import type { MockedFunction } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GameTag } from "../../../parser/tag";
import { TagKind, TagState } from "../../../parser/tag/index";
import type { FrontendSession } from "../../../session/index";
import type { Bus } from "../../../util/bus";
import { CompassContainer } from "./compass-container.lit";

describe("CompassContainer", () => {
  let mockSession: Partial<FrontendSession>;
  let mockBus: Partial<Bus> & {
    // biome-ignore lint/suspicious/noExplicitAny: Mock function requires any type for flexibility
    subscribeEvent: MockedFunction<any>;
    // biome-ignore lint/suspicious/noExplicitAny: Mock function requires any type for flexibility
    dispatchEvent: MockedFunction<any>;
  };

  const setup = (sessionParam?: FrontendSession) => {
    const container = new CompassContainer();
    if (sessionParam) {
      container.session = sessionParam;
    }
    document.body.appendChild(container);
    return container;
  };

  const teardown = (container: CompassContainer) => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  };

  beforeEach(() => {
    mockBus = {
      subscribeEvent: vi.fn(),
      dispatchEvent: vi.fn(),
    };
    mockSession = {
      bus: mockBus as Bus,
    } as Partial<FrontendSession>;
  });

  describe("Constructor", () => {
    it("should initialize with empty active directions", () => {
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
    it("should subscribe to compass metadata event when session is available", async () => {
      const container = setup(mockSession as FrontendSession);
      await container.updateComplete;

      expect(mockBus.subscribeEvent).toHaveBeenCalledWith("metadata/compass", expect.any(Function));

      teardown(container);
    });

    it("should not subscribe if session is missing", () => {
      const container = setup();

      expect(mockBus.subscribeEvent).not.toHaveBeenCalled();

      teardown(container);
    });

    it("should not subscribe if bus is missing", () => {
      const sessionWithoutBus: Partial<FrontendSession> = { ...mockSession, bus: undefined };
      const container = setup(sessionWithoutBus as FrontendSession);

      expect(mockBus.subscribeEvent).not.toHaveBeenCalled();

      teardown(container);
    });

    it("should set up event listeners when session property is updated", async () => {
      const container = setup();

      // Initially no subscription
      expect(mockBus.subscribeEvent).not.toHaveBeenCalled();

      // Add session property
      container.session = mockSession as FrontendSession;
      await container.updateComplete;

      // Should now subscribe
      expect(mockBus.subscribeEvent).toHaveBeenCalledWith("metadata/compass", expect.any(Function));

      teardown(container);
    });

    it("should not set up duplicate event listeners", async () => {
      const container = setup(mockSession as FrontendSession);
      await container.updateComplete;

      // Initial subscription
      expect(mockBus.subscribeEvent).toHaveBeenCalledTimes(1);

      // Update session property (same session)
      container.session = mockSession as FrontendSession;
      await container.updateComplete;

      // Should still only be called once (BaseContainerComponent handles duplicate prevention)
      expect(mockBus.subscribeEvent).toHaveBeenCalledTimes(1);

      teardown(container);
    });
  });

  describe("Compass Data Processing", () => {
    let container: CompassContainer;
    let eventCallback: (event: CustomEvent<GameTag>) => void;

    beforeEach(() => {
      mockBus.subscribeEvent = vi.fn().mockImplementation((_eventName: string, callback: (event: CustomEvent<GameTag>) => void) => {
        eventCallback = callback;
      });

      container = setup(mockSession as FrontendSession);
    });

    afterEach(() => {
      teardown(container);
    });

    it("should clear active directions when compass has no children", async () => {
      const mockCompass: GameTag = {
        kind: TagKind.METADATA,
        name: "compass",
        gameName: "",
        attrs: {},
        children: [],
        state: TagState.OPEN,
        text: "",
      };

      eventCallback({ detail: mockCompass } as CustomEvent<GameTag>);
      await container.updateComplete;

      // Check that UI component receives empty array
      // biome-ignore lint/suspicious/noExplicitAny: Testing UI component properties requires any type
      const uiComponent = container.shadowRoot?.querySelector("illthorn-compass-ui") as any;
      expect(uiComponent?.activeDirs).toEqual([]);
    });

    it("should process compass children into active directions", async () => {
      const mockCompass: GameTag = {
        kind: TagKind.METADATA,
        name: "compass",
        gameName: "",
        attrs: {},
        children: [
          {
            kind: TagKind.METADATA,
            name: "dir",
            gameName: "",
            attrs: {
              value: "north",
            },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
          {
            kind: TagKind.METADATA,
            name: "dir",
            gameName: "",
            attrs: {
              value: "east",
            },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
          {
            kind: TagKind.METADATA,
            name: "dir",
            gameName: "",
            attrs: {
              value: "south",
            },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
        ],
        state: TagState.OPEN,
        text: "",
      };

      eventCallback({ detail: mockCompass } as CustomEvent<GameTag>);
      await container.updateComplete;

      // biome-ignore lint/suspicious/noExplicitAny: Testing UI component properties requires any type
      const uiComponent = container.shadowRoot?.querySelector("illthorn-compass-ui") as any;
      const activeDirs = uiComponent?.activeDirs;

      expect(activeDirs).toHaveLength(3);
      expect(activeDirs).toEqual(["north", "east", "south"]);
    });

    it("should filter out non-string values", async () => {
      const mockCompass: GameTag = {
        kind: TagKind.METADATA,
        name: "compass",
        gameName: "",
        attrs: {},
        children: [
          {
            kind: TagKind.METADATA,
            name: "dir",
            gameName: "",
            attrs: {
              value: "north",
            },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
          {
            kind: TagKind.METADATA,
            name: "dir",
            gameName: "",
            attrs: {
              // biome-ignore lint/suspicious/noExplicitAny: Testing invalid type to verify filtering logic
              value: 123 as any, // Non-string value for testing filtering
            },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
          {
            kind: TagKind.METADATA,
            name: "dir",
            gameName: "",
            attrs: {
              value: "south",
            },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
        ],
        state: TagState.OPEN,
        text: "",
      };

      eventCallback({ detail: mockCompass } as CustomEvent<GameTag>);
      await container.updateComplete;

      // biome-ignore lint/suspicious/noExplicitAny: Testing UI component properties requires any type
      const uiComponent = container.shadowRoot?.querySelector("illthorn-compass-ui") as any;
      const activeDirs = uiComponent?.activeDirs;

      expect(activeDirs).toHaveLength(2);
      expect(activeDirs).toEqual(["north", "south"]);
    });

    it("should handle missing attributes gracefully", async () => {
      const mockCompass: GameTag = {
        kind: TagKind.METADATA,
        name: "compass",
        gameName: "",
        attrs: {},
        children: [
          {
            kind: TagKind.METADATA,
            name: "dir",
            gameName: "",
            attrs: {},
            children: [],
            state: TagState.OPEN,
            text: "",
          },
          {
            kind: TagKind.METADATA,
            name: "dir",
            gameName: "",
            attrs: {
              value: "west",
            },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
        ],
        state: TagState.OPEN,
        text: "",
      };

      eventCallback({ detail: mockCompass } as CustomEvent<GameTag>);
      await container.updateComplete;

      // biome-ignore lint/suspicious/noExplicitAny: Testing UI component properties requires any type
      const uiComponent = container.shadowRoot?.querySelector("illthorn-compass-ui") as any;
      const activeDirs = uiComponent?.activeDirs;

      expect(activeDirs).toHaveLength(1);
      expect(activeDirs).toEqual(["west"]);
    });

    it("should handle compass without children property", async () => {
      const mockCompass: GameTag = {
        kind: TagKind.METADATA,
        name: "compass",
        gameName: "",
        attrs: {},
        children: undefined, // Simulate missing children
        state: TagState.OPEN,
        text: "",
      };

      eventCallback({ detail: mockCompass } as CustomEvent<GameTag>);
      await container.updateComplete;

      // biome-ignore lint/suspicious/noExplicitAny: Testing UI component properties requires any type
      const uiComponent = container.shadowRoot?.querySelector("illthorn-compass-ui") as any;
      expect(uiComponent?.activeDirs).toEqual([]);
    });
  });

  describe("Property Reactivity", () => {
    it("should update when session property changes", async () => {
      const container = setup();

      container.session = mockSession as FrontendSession;
      await container.updateComplete;

      expect(container.session).toBe(mockSession);

      teardown(container);
    });
  });

  describe("Rendering", () => {
    it("should render compass UI component", async () => {
      const container = setup(mockSession as FrontendSession);
      await container.updateComplete;

      const uiComponent = container.shadowRoot?.querySelector("illthorn-compass-ui");
      expect(uiComponent).toBeTruthy();

      teardown(container);
    });

    it("should pass active directions to UI component", async () => {
      let eventCallback: (event: CustomEvent<GameTag>) => void;

      const mockBusWithCallback = {
        subscribeEvent: vi.fn().mockImplementation((_eventName: string, callback: (event: CustomEvent<GameTag>) => void) => {
          eventCallback = callback;
        }),
        dispatchEvent: vi.fn(),
      };

      const container = setup();
      container.session = { bus: mockBusWithCallback as unknown as Bus } as FrontendSession;
      await container.updateComplete;

      // Now trigger the compass event
      const mockCompass: GameTag = {
        kind: TagKind.METADATA,
        name: "compass",
        gameName: "",
        attrs: {},
        children: [
          {
            kind: TagKind.METADATA,
            name: "dir",
            gameName: "",
            attrs: { value: "north" },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
        ],
        state: TagState.OPEN,
        text: "",
      };

      eventCallback?.({ detail: mockCompass } as CustomEvent<GameTag>);
      await container.updateComplete;

      // biome-ignore lint/suspicious/noExplicitAny: Testing UI component properties requires any type
      const uiComponent = container.shadowRoot?.querySelector("illthorn-compass-ui") as any;
      expect(uiComponent?.activeDirs).toEqual(["north"]);

      teardown(container);
    });
  });
});
