// ABOUTME: Test suite for VitalsContainer component verifying session event handling and vital data processing
// ABOUTME: Tests the smart container component's integration with session bus and vitals metadata processing
/// <reference types="vitest/globals" />
import type { MockedFunction } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GameTag } from "../../../parser/tag";
import { TagKind, TagState } from "../../../parser/tag/index";
import type { FrontendSession } from "../../../session/index";
import type { Bus } from "../../../util/bus";
import { VitalsContainer } from "./vitals-container.lit";

describe("VitalsContainer", () => {
  let mockSession: Partial<FrontendSession>;
  let mockBus: Partial<Bus> & {
    // biome-ignore lint/suspicious/noExplicitAny: Mock function requires any type for flexibility
    subscribeEvent: MockedFunction<any>;
    // biome-ignore lint/suspicious/noExplicitAny: Mock function requires any type for flexibility
    dispatchEvent: MockedFunction<any>;
    // biome-ignore lint/suspicious/noExplicitAny: Mock function requires any type for flexibility
    unsubscribeEvent: MockedFunction<any>;
  };

  const setup = (sessionParam?: FrontendSession) => {
    const container = new VitalsContainer();
    if (sessionParam) {
      container.session = sessionParam;
    }
    document.body.appendChild(container);
    return container;
  };

  const teardown = (container: VitalsContainer) => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  };

  beforeEach(() => {
    mockBus = {
      subscribeEvent: vi.fn(),
      dispatchEvent: vi.fn(),
      unsubscribeEvent: vi.fn(),
    };
    mockSession = {
      bus: mockBus as Bus,
    } as Partial<FrontendSession>;
  });

  describe("Constructor", () => {
    it("should initialize with default vital data", () => {
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
    it("should subscribe to all 7 vital metadata events when session is available", async () => {
      const container = setup(mockSession as FrontendSession);
      await container.updateComplete;

      expect(mockBus.subscribeEvent).toHaveBeenCalledWith("metadata/progressBar/health", expect.any(Function));
      expect(mockBus.subscribeEvent).toHaveBeenCalledWith("metadata/progressBar/mana", expect.any(Function));
      expect(mockBus.subscribeEvent).toHaveBeenCalledWith("metadata/progressBar/stamina", expect.any(Function));
      expect(mockBus.subscribeEvent).toHaveBeenCalledWith("metadata/progressBar/spirit", expect.any(Function));
      expect(mockBus.subscribeEvent).toHaveBeenCalledWith("metadata/progressBar/mind", expect.any(Function));
      expect(mockBus.subscribeEvent).toHaveBeenCalledWith("metadata/progressBar/pbarStance", expect.any(Function));
      expect(mockBus.subscribeEvent).toHaveBeenCalledWith("metadata/progressBar/encumlevel", expect.any(Function));

      expect(mockBus.subscribeEvent).toHaveBeenCalledTimes(7);

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

      // Should now subscribe to all vital events
      expect(mockBus.subscribeEvent).toHaveBeenCalledTimes(7);

      teardown(container);
    });

    it("should cleanup event listeners on disconnect", async () => {
      const container = setup(mockSession as FrontendSession);
      await container.updateComplete;

      // Should have subscribed to events
      expect(mockBus.subscribeEvent).toHaveBeenCalledTimes(7);

      // Disconnect should not throw errors and cleanup properly
      expect(() => {
        container.remove();
      }).not.toThrow();
    });
  });

  describe("Standard Vital Data Processing", () => {
    let container: VitalsContainer;
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

    it("should update health vital when receiving health events", async () => {
      const mockHealthVital: GameTag = {
        kind: TagKind.METADATA,
        name: "progressBar",
        gameName: "",
        attrs: { id: "health", value: "75", text: "health 45/60" },
        children: [],
        state: TagState.OPEN,
        text: "",
      };

      eventCallbacks["metadata/progressBar/health"]({ detail: mockHealthVital } as CustomEvent<GameTag>);
      await container.updateComplete;

      // Check that UI component receives updated health data
      // biome-ignore lint/suspicious/noExplicitAny: Testing UI component properties requires any type
      const uiComponent = container.shadowRoot?.querySelector("illthorn-vitals-ui") as any;
      expect(uiComponent?.healthData?.label).toBe("health");
      expect(uiComponent?.healthData?.value).toBe("45/60");
      expect(uiComponent?.healthData?.percent).toBe(75);
    });

    it("should update mana vital when receiving mana events", async () => {
      const mockManaVital: GameTag = {
        kind: TagKind.METADATA,
        name: "progressBar",
        gameName: "",
        attrs: { id: "mana", value: "56", text: "mana 45/80" },
        children: [],
        state: TagState.OPEN,
        text: "",
      };

      eventCallbacks["metadata/progressBar/mana"]({ detail: mockManaVital } as CustomEvent<GameTag>);
      await container.updateComplete;

      // biome-ignore lint/suspicious/noExplicitAny: Testing UI component properties requires any type
      const uiComponent = container.shadowRoot?.querySelector("illthorn-vitals-ui") as any;
      expect(uiComponent?.manaData?.label).toBe("mana");
      expect(uiComponent?.manaData?.value).toBe("45/80");
      expect(uiComponent?.manaData?.percent).toBe(56);
    });

    it("should update stamina vital when receiving stamina events", async () => {
      const mockStaminaVital: GameTag = {
        kind: TagKind.METADATA,
        name: "progressBar",
        gameName: "",
        attrs: { id: "stamina", value: "22", text: "stamina 20/90" },
        children: [],
        state: TagState.OPEN,
        text: "",
      };

      eventCallbacks["metadata/progressBar/stamina"]({ detail: mockStaminaVital } as CustomEvent<GameTag>);
      await container.updateComplete;

      // biome-ignore lint/suspicious/noExplicitAny: Testing UI component properties requires any type
      const uiComponent = container.shadowRoot?.querySelector("illthorn-vitals-ui") as any;
      expect(uiComponent?.staminaData?.label).toBe("stamina");
      expect(uiComponent?.staminaData?.value).toBe("20/90");
      expect(uiComponent?.staminaData?.percent).toBe(22);
    });

    it("should update spirit vital when receiving spirit events", async () => {
      const mockSpiritVital: GameTag = {
        kind: TagKind.METADATA,
        name: "progressBar",
        gameName: "",
        attrs: { id: "spirit", value: "100", text: "spirit 100/100" },
        children: [],
        state: TagState.OPEN,
        text: "",
      };

      eventCallbacks["metadata/progressBar/spirit"]({ detail: mockSpiritVital } as CustomEvent<GameTag>);
      await container.updateComplete;

      // biome-ignore lint/suspicious/noExplicitAny: Testing UI component properties requires any type
      const uiComponent = container.shadowRoot?.querySelector("illthorn-vitals-ui") as any;
      expect(uiComponent?.spiritData?.label).toBe("spirit");
      expect(uiComponent?.spiritData?.value).toBe("100/100");
      expect(uiComponent?.spiritData?.percent).toBe(100);
    });

    it("should handle zero percent vitals correctly", async () => {
      const mockZeroVital: GameTag = {
        kind: TagKind.METADATA,
        name: "progressBar",
        gameName: "",
        attrs: { id: "health", value: "0", text: "health 0/60" },
        children: [],
        state: TagState.OPEN,
        text: "",
      };

      eventCallbacks["metadata/progressBar/health"]({ detail: mockZeroVital } as CustomEvent<GameTag>);
      await container.updateComplete;

      // biome-ignore lint/suspicious/noExplicitAny: Testing UI component properties requires any type
      const uiComponent = container.shadowRoot?.querySelector("illthorn-vitals-ui") as any;
      expect(uiComponent?.healthData?.percent).toBe(0);
    });

    it("should calculate percentage from fraction when server sends incorrect value", async () => {
      // Game server bug: sometimes sends value="0" despite fraction showing 74/74
      const mockBuggedVital: GameTag = {
        kind: TagKind.METADATA,
        name: "progressBar",
        gameName: "",
        attrs: { id: "health", value: "0", text: "health 74/74" },
        children: [],
        state: TagState.OPEN,
        text: "",
      };

      eventCallbacks["metadata/progressBar/health"]({ detail: mockBuggedVital } as CustomEvent<GameTag>);
      await container.updateComplete;

      // biome-ignore lint/suspicious/noExplicitAny: Testing UI component properties requires any type
      const uiComponent = container.shadowRoot?.querySelector("illthorn-vitals-ui") as any;
      expect(uiComponent?.healthData?.percent).toBe(100); // Calculated from 74/74
    });
  });

  describe("Special Vital Data Processing", () => {
    let container: VitalsContainer;
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

    it("should update mind vital with special processing", async () => {
      const mockMindVital: GameTag = {
        kind: TagKind.METADATA,
        name: "progressBar",
        gameName: "",
        attrs: { id: "mind", value: "100", text: "mind clear" },
        children: [],
        state: TagState.OPEN,
        text: "",
      };

      eventCallbacks["metadata/progressBar/mind"]({ detail: mockMindVital } as CustomEvent<GameTag>);
      await container.updateComplete;

      // biome-ignore lint/suspicious/noExplicitAny: Testing UI component properties requires any type
      const uiComponent = container.shadowRoot?.querySelector("illthorn-vitals-ui") as any;
      expect(uiComponent?.mindData?.label).toBe("mind");
      expect(uiComponent?.mindData?.value).toBe("clear%");
      expect(uiComponent?.mindData?.percent).toBe(100);
    });

    it("should update stance vital with first word extraction", async () => {
      const mockStanceVital: GameTag = {
        kind: TagKind.METADATA,
        name: "progressBar",
        gameName: "",
        attrs: { id: "pbarStance", value: "0", text: "defensive stance" },
        children: [],
        state: TagState.OPEN,
        text: "",
      };

      eventCallbacks["metadata/progressBar/pbarStance"]({ detail: mockStanceVital } as CustomEvent<GameTag>);
      await container.updateComplete;

      // biome-ignore lint/suspicious/noExplicitAny: Testing UI component properties requires any type
      const uiComponent = container.shadowRoot?.querySelector("illthorn-vitals-ui") as any;
      expect(uiComponent?.stanceData?.label).toBe("stance");
      expect(uiComponent?.stanceData?.value).toBe("defensive"); // First word only
      expect(uiComponent?.stanceData?.percent).toBe(0);
    });

    it("should update encumbrance vital with lowercase processing", async () => {
      const mockEncumbranceVital: GameTag = {
        kind: TagKind.METADATA,
        name: "progressBar",
        gameName: "",
        attrs: { id: "encumlevel", value: "0", text: "LIGHT" },
        children: [],
        state: TagState.OPEN,
        text: "",
      };

      eventCallbacks["metadata/progressBar/encumlevel"]({ detail: mockEncumbranceVital } as CustomEvent<GameTag>);
      await container.updateComplete;

      // biome-ignore lint/suspicious/noExplicitAny: Testing UI component properties requires any type
      const uiComponent = container.shadowRoot?.querySelector("illthorn-vitals-ui") as any;
      expect(uiComponent?.encumbranceData?.label).toBe("encumbrance");
      expect(uiComponent?.encumbranceData?.value).toBe("light"); // Lowercased
      expect(uiComponent?.encumbranceData?.percent).toBe(0);
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

  describe("getVitals API", () => {
    it("should provide getVitals method for SessionUI compatibility", async () => {
      const container = setup(mockSession as FrontendSession);
      await container.updateComplete;

      const vitals = container.getVitals();
      expect(vitals).toBeTruthy();
      expect(vitals).toHaveProperty("stats");
      expect(vitals).toHaveProperty("texts");

      teardown(container);
    });

    it("should return empty vitals when UI component not available", () => {
      const container = setup();

      const vitals = container.getVitals();
      expect(vitals).toEqual({ stats: [], texts: [] });

      teardown(container);
    });
  });

  describe("Rendering", () => {
    it("should render vitals UI component", async () => {
      const container = setup(mockSession as FrontendSession);
      await container.updateComplete;

      const uiComponent = container.shadowRoot?.querySelector("illthorn-vitals-ui");
      expect(uiComponent).toBeTruthy();

      teardown(container);
    });

    it("should pass vital data to UI component", async () => {
      const container = setup(mockSession as FrontendSession);
      await container.updateComplete;

      // biome-ignore lint/suspicious/noExplicitAny: Testing UI component properties requires any type
      const uiComponent = container.shadowRoot?.querySelector("illthorn-vitals-ui") as any;
      expect(uiComponent?.healthData?.label).toBe("health");
      expect(uiComponent?.manaData?.label).toBe("mana");
      expect(uiComponent?.staminaData?.label).toBe("stamina");
      expect(uiComponent?.spiritData?.label).toBe("spirit");
      expect(uiComponent?.mindData?.label).toBe("mind");
      expect(uiComponent?.stanceData?.label).toBe("stance");
      expect(uiComponent?.encumbranceData?.label).toBe("encumbrance");

      teardown(container);
    });
  });
});
