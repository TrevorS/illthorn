// ABOUTME: Test suite for EffectsContainer component verifying session event handling and data processing
// ABOUTME: Tests the smart container component's integration with session bus and dialog data processing
/// <reference types="vitest/globals" />
import type { MockedFunction } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GameTag } from "../../../parser/tag";
import { TagKind, TagState } from "../../../parser/tag/index";
import type { FrontendSession } from "../../../session/index";
import type { Bus } from "../../../util/bus";
import { EffectsContainer } from "./effects-container.lit";

describe("EffectsContainer", () => {
  let mockSession: Partial<FrontendSession>;
  let mockBus: Partial<Bus> & {
    // biome-ignore lint/suspicious/noExplicitAny: Mock function requires any type for flexibility
    subscribeEvent: MockedFunction<any>;
    // biome-ignore lint/suspicious/noExplicitAny: Mock function requires any type for flexibility
    dispatchEvent: MockedFunction<any>;
  };

  const setup = (sessionParam?: FrontendSession, name?: string) => {
    const container = new EffectsContainer(sessionParam, name);
    document.body.appendChild(container);
    return container;
  };

  const teardown = (container: EffectsContainer) => {
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
    it("should accept session and name parameters", () => {
      const container = setup(mockSession as FrontendSession, "Test Effect");

      expect(container.session).toBe(mockSession);
      expect(container.name).toBe("Test Effect");

      teardown(container);
    });

    it("should handle undefined parameters", () => {
      const container = setup();

      expect(container.session).toBeUndefined();
      expect(container.name).toBe("");

      teardown(container);
    });
  });

  describe("Event Listener Setup", () => {
    it("should subscribe to correct metadata event", async () => {
      const container = setup(mockSession as FrontendSession, "TestEffect");
      await container.updateComplete;

      expect(mockBus.subscribeEvent).toHaveBeenCalledWith("metadata/dialogData/TestEffect", expect.any(Function));

      teardown(container);
    });

    it("should not subscribe if session is missing", () => {
      const container = setup(undefined, "TestEffect");

      expect(mockBus.subscribeEvent).not.toHaveBeenCalled();

      teardown(container);
    });

    it("should not subscribe if name is missing", () => {
      const container = setup(mockSession as FrontendSession, "");

      expect(mockBus.subscribeEvent).not.toHaveBeenCalled();

      teardown(container);
    });

    it("should not subscribe if bus is missing", () => {
      const sessionWithoutBus: Partial<FrontendSession> = { ...mockSession, bus: undefined };
      const container = setup(sessionWithoutBus as FrontendSession, "TestEffect");

      expect(mockBus.subscribeEvent).not.toHaveBeenCalled();

      teardown(container);
    });
  });

  describe("Dialog Data Processing", () => {
    let container: EffectsContainer;
    let eventCallback: (event: CustomEvent<GameTag>) => void;

    beforeEach(() => {
      mockBus.subscribeEvent = vi.fn().mockImplementation((_eventName: string, callback: (event: CustomEvent<GameTag>) => void) => {
        eventCallback = callback;
      });

      container = setup(mockSession as FrontendSession, "TestEffect");
    });

    afterEach(() => {
      teardown(container);
    });

    it("should clear effects when dialog has no children", async () => {
      const mockDialog: GameTag = {
        kind: TagKind.METADATA,
        name: "dialogData",
        gameName: "",
        attrs: {},
        children: [],
        state: TagState.OPEN,
        text: "",
      };

      eventCallback({ detail: mockDialog } as CustomEvent<GameTag>);
      await container.updateComplete;

      // Check that UI component receives empty array
      // biome-ignore lint/suspicious/noExplicitAny: Testing UI component properties requires any type
      const uiComponent = container.shadowRoot?.querySelector("illthorn-effects-ui") as any;
      expect(uiComponent?.spellEffects).toEqual([]);
    });

    it("should process progressBar children into spell effects", async () => {
      const mockDialog: GameTag = {
        kind: TagKind.METADATA,
        name: "dialogData",
        gameName: "",
        attrs: {},
        children: [
          {
            kind: TagKind.METADATA,
            name: "progressBar",
            gameName: "",
            attrs: {
              text: "Bless",
              id: "bless-101",
              time: "12:30",
              value: "75",
            },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
          {
            kind: TagKind.METADATA,
            name: "progressBar",
            gameName: "",
            attrs: {
              text: "Spirit Warding I",
              id: "spirit-warding-i-103",
              time: "08:15",
              value: "60",
            },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
        ],
        state: TagState.OPEN,
        text: "",
      };

      eventCallback({ detail: mockDialog } as CustomEvent<GameTag>);
      await container.updateComplete;

      // biome-ignore lint/suspicious/noExplicitAny: Testing UI component properties requires any type
      const uiComponent = container.shadowRoot?.querySelector("illthorn-effects-ui") as any;
      const spellEffects = uiComponent?.spellEffects;

      expect(spellEffects).toHaveLength(2);
      expect(spellEffects[0]).toEqual({
        text: "Bless",
        id: "bless-101",
        time: "12:30", // Should remain unchanged
        value: "75",
      });
      expect(spellEffects[1]).toEqual({
        text: "Spirit Warding I",
        id: "spirit-warding-i-103",
        time: "8:15", // Leading zero should be removed
        value: "60",
      });
    });

    it("should filter only progressBar children", async () => {
      const mockDialog: GameTag = {
        kind: TagKind.METADATA,
        name: "dialogData",
        gameName: "",
        attrs: {},
        children: [
          {
            kind: TagKind.METADATA,
            name: "progressBar",
            gameName: "",
            attrs: {
              text: "Valid Effect",
              id: "valid-123",
              time: "5:00",
              value: "50",
            },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
          {
            kind: TagKind.METADATA,
            name: "otherTag",
            gameName: "",
            attrs: {
              text: "Should be ignored",
            },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
        ],
        state: TagState.OPEN,
        text: "",
      };

      eventCallback({ detail: mockDialog } as CustomEvent<GameTag>);
      await container.updateComplete;

      // biome-ignore lint/suspicious/noExplicitAny: Testing UI component properties requires any type
      const uiComponent = container.shadowRoot?.querySelector("illthorn-effects-ui") as any;
      const spellEffects = uiComponent?.spellEffects;

      expect(spellEffects).toHaveLength(1);
      expect(spellEffects[0].text).toBe("Valid Effect");
    });

    it("should handle missing attributes gracefully", async () => {
      const mockDialog: GameTag = {
        kind: TagKind.METADATA,
        name: "dialogData",
        gameName: "",
        attrs: {},
        children: [
          {
            kind: TagKind.METADATA,
            name: "progressBar",
            gameName: "",
            attrs: {
              text: "Partial Data",
              // Missing id, time, value
            },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
        ],
        state: TagState.OPEN,
        text: "",
      };

      eventCallback({ detail: mockDialog } as CustomEvent<GameTag>);
      await container.updateComplete;

      // biome-ignore lint/suspicious/noExplicitAny: Testing UI component properties requires any type
      const uiComponent = container.shadowRoot?.querySelector("illthorn-effects-ui") as any;
      const spellEffects = uiComponent?.spellEffects;

      expect(spellEffects).toHaveLength(1);
      expect(spellEffects[0]).toEqual({
        text: "Partial Data",
        id: "",
        time: "",
        value: "",
      });
    });

    it("should remove leading zero from time values", async () => {
      const mockDialog: GameTag = {
        kind: TagKind.METADATA,
        name: "dialogData",
        gameName: "",
        attrs: {},
        children: [
          {
            kind: TagKind.METADATA,
            name: "progressBar",
            gameName: "",
            attrs: {
              text: "Test Spell",
              id: "test-123",
              time: "05:30",
              value: "50",
            },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
        ],
        state: TagState.OPEN,
        text: "",
      };

      eventCallback({ detail: mockDialog } as CustomEvent<GameTag>);
      await container.updateComplete;

      // biome-ignore lint/suspicious/noExplicitAny: Testing UI component properties requires any type
      const uiComponent = container.shadowRoot?.querySelector("illthorn-effects-ui") as any;
      const spellEffects = uiComponent?.spellEffects;

      expect(spellEffects[0].time).toBe("5:30");
    });
  });

  describe("Property Reactivity", () => {
    it("should update when session property changes", async () => {
      const container = setup();

      container.session = mockSession as FrontendSession;
      container.name = "TestEffect";
      await container.updateComplete;

      expect(container.session).toBe(mockSession);
      expect(container.name).toBe("TestEffect");

      teardown(container);
    });

    it("should pass name to UI component", async () => {
      const container = setup(mockSession as FrontendSession, "Test Effects Panel");
      await container.updateComplete;

      // biome-ignore lint/suspicious/noExplicitAny: Testing UI component properties requires any type
      const uiComponent = container.shadowRoot?.querySelector("illthorn-effects-ui") as any;
      expect(uiComponent?.name).toBe("Test Effects Panel");

      teardown(container);
    });
  });

  describe("Rendering", () => {
    it("should render effects UI component", async () => {
      const container = setup(mockSession as FrontendSession, "Test Effect");
      await container.updateComplete;

      const uiComponent = container.shadowRoot?.querySelector("illthorn-effects-ui");
      expect(uiComponent).toBeTruthy();

      teardown(container);
    });
  });
});
