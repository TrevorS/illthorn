// ABOUTME: Test suite for HandsContainer component verifying session event handling and data flow
// ABOUTME: Tests the smart container component's integration with session bus and hands metadata processing
/// <reference types="vitest/globals" />
import type { MockedFunction } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GameTag } from "../../../parser/tag";
import { TagKind, TagState } from "../../../parser/tag/index";
import type { FrontendSession } from "../../../session/index";
import type { Bus } from "../../../util/bus";
import { HandsContainer } from "./hands-container.lit";

describe("HandsContainer", () => {
  let mockSession: Partial<FrontendSession>;
  let mockBus: Partial<Bus> & {
    // biome-ignore lint/suspicious/noExplicitAny: Mock function requires any type for flexibility
    subscribeEvent: MockedFunction<any>;
    // biome-ignore lint/suspicious/noExplicitAny: Mock function requires any type for flexibility
    dispatchEvent: MockedFunction<any>;
  };

  const setup = (sessionParam?: FrontendSession) => {
    const container = new HandsContainer();
    if (sessionParam) {
      container.session = sessionParam;
    }
    document.body.appendChild(container);
    return container;
  };

  const teardown = (container: HandsContainer) => {
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
    it("should initialize with default hand content", () => {
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
    it("should subscribe to hand metadata events when session is available", () => {
      const container = setup(mockSession as FrontendSession);

      expect(mockBus.subscribeEvent).toHaveBeenCalledWith("metadata/left", expect.any(Function));
      expect(mockBus.subscribeEvent).toHaveBeenCalledWith("metadata/right", expect.any(Function));
      expect(mockBus.subscribeEvent).toHaveBeenCalledWith("metadata/spell", expect.any(Function));

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

      // Should now subscribe to all three hand events
      expect(mockBus.subscribeEvent).toHaveBeenCalledWith("metadata/left", expect.any(Function));
      expect(mockBus.subscribeEvent).toHaveBeenCalledWith("metadata/right", expect.any(Function));
      expect(mockBus.subscribeEvent).toHaveBeenCalledWith("metadata/spell", expect.any(Function));

      teardown(container);
    });
  });

  describe("Hand Data Processing", () => {
    let container: HandsContainer;
    let eventCallbacks: { [key: string]: (event: CustomEvent<GameTag>) => void } = {};

    beforeEach(() => {
      mockBus.subscribeEvent = vi.fn().mockImplementation((eventName: string, callback: (event: CustomEvent<GameTag>) => void) => {
        eventCallbacks[eventName] = callback;
      });

      container = setup(mockSession as FrontendSession);
    });

    afterEach(() => {
      teardown(container);
      eventCallbacks = {};
    });

    it("should update left hand content when receiving left hand events", async () => {
      const mockLeftHand: GameTag = {
        kind: TagKind.METADATA,
        name: "left",
        gameName: "",
        attrs: {},
        children: [
          {
            kind: TagKind.INLINE,
            name: "text",
            gameName: "",
            attrs: {},
            children: [],
            state: TagState.CLOSED,
            text: "a sharp sword",
          },
        ],
        state: TagState.OPEN,
        text: "",
      };

      eventCallbacks["metadata/left"]({ detail: mockLeftHand } as CustomEvent<GameTag>);
      await container.updateComplete;

      // Check that UI component receives updated content
      // biome-ignore lint/suspicious/noExplicitAny: Testing UI component properties requires any type
      const uiComponent = container.shadowRoot?.querySelector("illthorn-hands-ui") as any;
      expect(uiComponent?.leftContent).toBe("a sharp sword");
    });

    it("should update right hand content when receiving right hand events", async () => {
      const mockRightHand: GameTag = {
        kind: TagKind.METADATA,
        name: "right",
        gameName: "",
        attrs: {},
        children: [
          {
            kind: TagKind.INLINE,
            name: "text",
            gameName: "",
            attrs: {},
            children: [],
            state: TagState.CLOSED,
            text: "a wooden shield",
          },
        ],
        state: TagState.OPEN,
        text: "",
      };

      eventCallbacks["metadata/right"]({ detail: mockRightHand } as CustomEvent<GameTag>);
      await container.updateComplete;

      // biome-ignore lint/suspicious/noExplicitAny: Testing UI component properties requires any type
      const uiComponent = container.shadowRoot?.querySelector("illthorn-hands-ui") as any;
      expect(uiComponent?.rightContent).toBe("a wooden shield");
    });

    it("should update spell content when receiving spell hand events", async () => {
      const mockSpellHand: GameTag = {
        kind: TagKind.METADATA,
        name: "spell",
        gameName: "",
        attrs: {},
        children: [
          {
            kind: TagKind.INLINE,
            name: "text",
            gameName: "",
            attrs: {},
            children: [],
            state: TagState.CLOSED,
            text: "Major Sanctuary",
          },
        ],
        state: TagState.OPEN,
        text: "",
      };

      eventCallbacks["metadata/spell"]({ detail: mockSpellHand } as CustomEvent<GameTag>);
      await container.updateComplete;

      // biome-ignore lint/suspicious/noExplicitAny: Testing UI component properties requires any type
      const uiComponent = container.shadowRoot?.querySelector("illthorn-hands-ui") as any;
      expect(uiComponent?.spellContent).toBe("Major Sanctuary");
    });

    it("should handle empty hand events correctly", async () => {
      const mockEmptyHand: GameTag = {
        kind: TagKind.METADATA,
        name: "left",
        gameName: "",
        attrs: {},
        children: [],
        state: TagState.OPEN,
        text: "",
      };

      eventCallbacks["metadata/left"]({ detail: mockEmptyHand } as CustomEvent<GameTag>);
      await container.updateComplete;

      // biome-ignore lint/suspicious/noExplicitAny: Testing UI component properties requires any type
      const uiComponent = container.shadowRoot?.querySelector("illthorn-hands-ui") as any;
      expect(uiComponent?.leftContent).toBe("None");
    });

    it("should handle hand events without children property", async () => {
      const mockHandWithoutChildren: GameTag = {
        kind: TagKind.METADATA,
        name: "right",
        gameName: "",
        attrs: {},
        children: undefined, // Simulate missing children
        state: TagState.OPEN,
        text: "",
      };

      eventCallbacks["metadata/right"]({ detail: mockHandWithoutChildren } as CustomEvent<GameTag>);
      await container.updateComplete;

      // biome-ignore lint/suspicious/noExplicitAny: Testing UI component properties requires any type
      const uiComponent = container.shadowRoot?.querySelector("illthorn-hands-ui") as any;
      expect(uiComponent?.rightContent).toBe("None");
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

  describe("getHands API", () => {
    it("should provide getHands method for SessionUI compatibility", async () => {
      const container = setup(mockSession as FrontendSession);
      await container.updateComplete;

      const hands = container.getHands();
      expect(hands).toBeTruthy();
      expect(hands).toHaveProperty("left");
      expect(hands).toHaveProperty("right");
      expect(hands).toHaveProperty("spell");

      teardown(container);
    });

    it("should return null hands when UI component not available", () => {
      const container = setup();

      const hands = container.getHands();
      expect(hands).toEqual({ left: null, right: null, spell: null });

      teardown(container);
    });
  });

  describe("Rendering", () => {
    it("should render hands UI component", async () => {
      const container = setup(mockSession as FrontendSession);
      await container.updateComplete;

      const uiComponent = container.shadowRoot?.querySelector("illthorn-hands-ui");
      expect(uiComponent).toBeTruthy();

      teardown(container);
    });

    it("should pass hand content to UI component", async () => {
      const container = setup(mockSession as FrontendSession);
      await container.updateComplete;

      // biome-ignore lint/suspicious/noExplicitAny: Testing UI component properties requires any type
      const uiComponent = container.shadowRoot?.querySelector("illthorn-hands-ui") as any;
      expect(uiComponent?.leftContent).toBe("None");
      expect(uiComponent?.rightContent).toBe("None");
      expect(uiComponent?.spellContent).toBe("None");

      teardown(container);
    });
  });
});
