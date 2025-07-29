// ABOUTME: Test suite for Effects component verifying reactive rendering and bus integration
// ABOUTME: Tests API parity with vanilla Effects component including constructor signature and behavior
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Effects } from "../../../../src/frontend/components/session/effects/effects.lit";
import type { SpellEffect } from "../../../../src/frontend/components/session/effects/spell-effect.lit";
import type { GameTag } from "../../../../src/frontend/parser/tag";
import { TagKind, TagState } from "../../../../src/frontend/parser/tag/index";
import type { FrontendSession } from "../../../../src/frontend/session/index";

describe("Effects", () => {
  let mockSession: Partial<FrontendSession>;
  let mockBus: {
    subscribeEvent: vi.Mock;
    dispatchEvent: vi.Mock;
  };

  const setup = (sessionParam?: FrontendSession, name?: string) => {
    const effects = new Effects(sessionParam, name);
    document.body.appendChild(effects);
    return effects;
  };

  const teardown = (effects: Effects) => {
    if (effects.parentNode) {
      effects.parentNode.removeChild(effects);
    }
  };

  beforeEach(() => {
    mockBus = {
      subscribeEvent: vi.fn(),
    };
    mockSession = {
      bus: mockBus,
    };
  });

  describe("Constructor", () => {
    it("should accept session and name parameters", () => {
      const effects = setup(mockSession as FrontendSession, "Test Effect");

      expect(effects.session).toBe(mockSession);
      expect(effects.name).toBe("Test Effect");

      teardown(effects);
    });

    it("should add CSS class based on name", () => {
      const effects = setup(mockSession as FrontendSession, "Test Effect");

      expect(effects.classList.contains("test-effect")).toBe(true);

      teardown(effects);
    });

    it("should handle names with multiple spaces", () => {
      const effects = setup(mockSession as FrontendSession, "Multi Word Effect");

      expect(effects.classList.contains("multi-word-effect")).toBe(true);

      teardown(effects);
    });
  });

  describe("Bus Subscription", () => {
    it("should subscribe to correct metadata event", () => {
      const effects = setup(mockSession as FrontendSession, "TestEffect");

      expect(mockBus.subscribeEvent).toHaveBeenCalledWith("metadata/dialogData/TestEffect", expect.any(Function));

      teardown(effects);
    });

    it("should not subscribe if session is missing", () => {
      const effects = setup(undefined, "TestEffect");

      expect(mockBus.subscribeEvent).not.toHaveBeenCalled();

      teardown(effects);
    });

    it("should not subscribe if name is missing", () => {
      const effects = setup(mockSession as FrontendSession, "");

      expect(mockBus.subscribeEvent).not.toHaveBeenCalled();

      teardown(effects);
    });
  });

  describe("Dialog Rendering", () => {
    let effects: Effects;
    let eventCallback: (event: CustomEvent<GameTag>) => void;

    beforeEach(() => {
      mockBus.subscribeEvent = vi.fn().mockImplementation((_eventName: string, callback: (event: CustomEvent<GameTag>) => void) => {
        eventCallback = callback;
      });

      effects = setup(mockSession as FrontendSession, "TestEffect");
    });

    it("should render empty when dialog has no children", async () => {
      const mockDialog: GameTag = {
        kind: TagKind.METADATA,
        name: "dialogData",
        gameName: "",
        attrs: {},
        children: [],
        state: TagState.OPEN,
        text: "",
      };

      eventCallback({ detail: mockDialog });
      await effects.updateComplete;

      // Verify no spell effect elements are rendered
      const spellEffects = effects.shadowRoot?.querySelectorAll("illthorn-spell-effect");
      expect(spellEffects?.length || 0).toBe(0);

      teardown(effects);
    });

    it("should render spell effects from dialog children", async () => {
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
              text: "Spell Effect",
              id: "123",
              time: "30",
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
              text: "Another Effect",
              id: "456",
              time: "05",
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

      eventCallback({ detail: mockDialog });
      await effects.updateComplete;

      // Verify spell effects are rendered (they should be present as DOM elements)
      const spellEffects = effects.shadowRoot?.querySelectorAll("illthorn-spell-effect");
      expect(spellEffects?.length).toBe(2);

      // Check that the spell IDs are set correctly
      expect(spellEffects?.[0]?.dataset.spellId).toBe("123");
      expect(spellEffects?.[1]?.dataset.spellId).toBe("456");

      teardown(effects);
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
              id: "123",
              time: "30",
              value: "75",
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

      eventCallback({ detail: mockDialog });
      await effects.updateComplete;

      const spellEffects = effects.shadowRoot?.querySelectorAll("illthorn-spell-effect");
      expect(spellEffects?.length).toBe(1);
      expect(spellEffects?.[0]?.dataset.spellId).toBe("123");

      teardown(effects);
    });

    it("should handle time value with leading zero removal", async () => {
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
              text: "Spell Effect",
              id: "123",
              time: "05",
              value: "75",
            },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
        ],
        state: TagState.OPEN,
        text: "",
      };

      eventCallback({ detail: mockDialog });
      await effects.updateComplete;

      const spellEffects = effects.shadowRoot?.querySelectorAll("illthorn-spell-effect");
      expect(spellEffects?.length).toBe(1);
      // Verify the time was processed (leading zero removed from "05" to "5")
      expect((spellEffects?.[0] as SpellEffect)?.timeRemaining).toBe("5");

      teardown(effects);
    });
  });

  describe("Property Reactivity", () => {
    it("should update when session property changes", async () => {
      const effects = setup();

      effects.session = mockSession as FrontendSession;
      effects.name = "TestEffect";
      await effects.updateComplete;

      expect(effects.session).toBe(mockSession);
      expect(effects.name).toBe("TestEffect");

      teardown(effects);
    });
  });
});
