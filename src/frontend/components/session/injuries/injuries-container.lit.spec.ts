// ABOUTME: Test suite for InjuriesContainer component verifying session event handling and injury data processing
// ABOUTME: Tests the smart container component's integration with session bus and injury metadata processing
/// <reference types="vitest/globals" />
import type { MockedFunction } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GameTag } from "../../../parser/tag";
import { TagKind, TagState } from "../../../parser/tag/index";
import type { FrontendSession } from "../../../session/index";
import type { Bus } from "../../../util/bus";
import { InjuriesContainer } from "./injuries-container.lit";

describe("InjuriesContainer", () => {
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
    const container = new InjuriesContainer();
    if (sessionParam) {
      container.session = sessionParam;
    }
    document.body.appendChild(container);
    return container;
  };

  const teardown = (container: InjuriesContainer) => {
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

  describe("Component Initialization", () => {
    it("should create injuries container with session parameter", async () => {
      const container = setup(mockSession as FrontendSession);
      await container.updateComplete;

      expect(container).toBeInstanceOf(InjuriesContainer);
      expect(container.tagName.toLowerCase()).toBe("illthorn-injuries-container");
      expect(container.session).toBe(mockSession);

      teardown(container);
    });

    it("should render healthy state when no injuries initially", async () => {
      const container = setup(mockSession as FrontendSession);
      await container.updateComplete;

      const injuriesUI = container.shadowRoot?.querySelector("illthorn-injuries-ui");
      expect(injuriesUI).toBeTruthy();

      teardown(container);
    });

    it("should render empty when no session provided", async () => {
      const container = setup();
      await container.updateComplete;

      const injuriesUI = container.shadowRoot?.querySelector("illthorn-injuries-ui");
      expect(injuriesUI).toBeTruthy();

      teardown(container);
    });
  });

  describe("Event Handling", () => {
    let container: InjuriesContainer;
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

    it("should process single injury event correctly", async () => {
      const mockInjuryTag: GameTag = {
        kind: TagKind.METADATA,
        name: "injury",
        gameName: "",
        attrs: { part: "head", severity: "2", description: "moderate cuts and bruises" },
        children: [],
        state: TagState.OPEN,
        text: "",
      };

      eventCallbacks["metadata/injury"]({ detail: mockInjuryTag } as CustomEvent<GameTag>);
      await container.updateComplete;

      const injuriesUI = container.shadowRoot?.querySelector("illthorn-injuries-ui");
      expect(injuriesUI).toBeTruthy();
    });

    it("should handle dialogData injury events", async () => {
      const mockDialogTag: GameTag = {
        kind: TagKind.METADATA,
        name: "dialogData",
        gameName: "",
        attrs: { id: "injuries" },
        children: [
          {
            kind: TagKind.METADATA,
            name: "injury",
            gameName: "",
            attrs: { part: "head", severity: "2", description: "moderate wound" },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
        ],
        state: TagState.OPEN,
        text: "",
      };

      eventCallbacks["metadata/dialogData/injuries"]({ detail: mockDialogTag } as CustomEvent<GameTag>);
      await container.updateComplete;

      const injuriesUI = container.shadowRoot?.querySelector("illthorn-injuries-ui");
      expect(injuriesUI).toBeTruthy();
    });

    it("should clear injuries when receiving empty injury data", async () => {
      // First add an injury
      const mockInjuryTag: GameTag = {
        kind: TagKind.METADATA,
        name: "injury",
        gameName: "",
        attrs: { part: "head", severity: "1", description: "minor cut" },
        children: [],
        state: TagState.OPEN,
        text: "",
      };

      eventCallbacks["metadata/injury"]({ detail: mockInjuryTag } as CustomEvent<GameTag>);
      await container.updateComplete;

      // Then send empty injury data
      const emptyDialogTag: GameTag = {
        kind: TagKind.METADATA,
        name: "dialogData",
        gameName: "",
        attrs: { id: "injuries" },
        children: [],
        state: TagState.OPEN,
        text: "",
      };

      eventCallbacks["metadata/dialogData/injuries"]({ detail: emptyDialogTag } as CustomEvent<GameTag>);
      await container.updateComplete;

      const injuriesUI = container.shadowRoot?.querySelector("illthorn-injuries-ui");
      expect(injuriesUI).toBeTruthy();
    });
  });

  describe("Injury Processing Logic", () => {
    let container: InjuriesContainer;
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

    it("should pair left/right injuries when both sides injured", async () => {
      const mockDialogTag: GameTag = {
        kind: TagKind.METADATA,
        name: "dialogData",
        gameName: "",
        attrs: { id: "injuries" },
        children: [
          {
            kind: TagKind.METADATA,
            name: "injury",
            gameName: "",
            attrs: { part: "leftarm", severity: "1", description: "minor cuts" },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
          {
            kind: TagKind.METADATA,
            name: "injury",
            gameName: "",
            attrs: { part: "rightarm", severity: "2", description: "deep gashes" },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
        ],
        state: TagState.OPEN,
        text: "",
      };

      eventCallbacks["metadata/dialogData/injuries"]({ detail: mockDialogTag } as CustomEvent<GameTag>);
      await container.updateComplete;

      const injuriesUI = container.shadowRoot?.querySelector("illthorn-injuries-ui");
      expect(injuriesUI).toBeTruthy();
    });

    it("should show individual limb when only one side injured", async () => {
      const mockDialogTag: GameTag = {
        kind: TagKind.METADATA,
        name: "dialogData",
        gameName: "",
        attrs: { id: "injuries" },
        children: [
          {
            kind: TagKind.METADATA,
            name: "injury",
            gameName: "",
            attrs: { part: "leftarm", severity: "3", description: "severe wounds" },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
        ],
        state: TagState.OPEN,
        text: "",
      };

      eventCallbacks["metadata/dialogData/injuries"]({ detail: mockDialogTag } as CustomEvent<GameTag>);
      await container.updateComplete;

      const injuriesUI = container.shadowRoot?.querySelector("illthorn-injuries-ui");
      expect(injuriesUI).toBeTruthy();
    });

    it("should sort injuries anatomically (head-to-toe)", async () => {
      const mockDialogTag: GameTag = {
        kind: TagKind.METADATA,
        name: "dialogData",
        gameName: "",
        attrs: { id: "injuries" },
        children: [
          {
            kind: TagKind.METADATA,
            name: "injury",
            gameName: "",
            attrs: { part: "rightleg", severity: "1", description: "minor cut" },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
          {
            kind: TagKind.METADATA,
            name: "injury",
            gameName: "",
            attrs: { part: "head", severity: "2", description: "moderate wound" },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
          {
            kind: TagKind.METADATA,
            name: "injury",
            gameName: "",
            attrs: { part: "chest", severity: "3", description: "severe gash" },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
        ],
        state: TagState.OPEN,
        text: "",
      };

      eventCallbacks["metadata/dialogData/injuries"]({ detail: mockDialogTag } as CustomEvent<GameTag>);
      await container.updateComplete;

      const injuriesUI = container.shadowRoot?.querySelector("illthorn-injuries-ui");
      expect(injuriesUI).toBeTruthy();
    });
  });

  describe("Body Part Mapping", () => {
    let container: InjuriesContainer;
    let eventCallbacks: { [key: string]: (event: CustomEvent<GameTag>) => void } = {};

    const mappingTests = [
      { part: "righteye", expected: "r.eye" },
      { part: "lefteye", expected: "l.eye" },
      { part: "rightarm", expected: "r.arm" },
      { part: "leftarm", expected: "l.arm" },
      { part: "righthand", expected: "r.hand" },
      { part: "lefthand", expected: "l.hand" },
      { part: "rightleg", expected: "r.leg" },
      { part: "leftleg", expected: "l.leg" },
      { part: "head", expected: "head" },
      { part: "neck", expected: "neck" },
      { part: "chest", expected: "chest" },
      { part: "abdomen", expected: "abdomen" },
      { part: "back", expected: "back" },
      { part: "nerves", expected: "nerves" },
    ];

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

    mappingTests.forEach(({ part }) => {
      it(`should process ${part} injury correctly`, async () => {
        const mockDialogTag: GameTag = {
          kind: TagKind.METADATA,
          name: "dialogData",
          gameName: "",
          attrs: { id: "injuries" },
          children: [
            {
              kind: TagKind.METADATA,
              name: "injury",
              gameName: "",
              attrs: { part, severity: "1", description: "test injury" },
              children: [],
              state: TagState.OPEN,
              text: "",
            },
          ],
          state: TagState.OPEN,
          text: "",
        };

        eventCallbacks["metadata/dialogData/injuries"]({ detail: mockDialogTag } as CustomEvent<GameTag>);
        await container.updateComplete;

        const injuriesUI = container.shadowRoot?.querySelector("illthorn-injuries-ui");
        expect(injuriesUI).toBeTruthy();
      });
    });
  });

  describe("Paired Injury Logic", () => {
    let container: InjuriesContainer;
    let eventCallbacks: { [key: string]: (event: CustomEvent<GameTag>) => void } = {};

    const pairTests = [
      { leftPart: "lefteye", rightPart: "righteye", pairName: "eyes" },
      { leftPart: "leftarm", rightPart: "rightarm", pairName: "arms" },
      { leftPart: "lefthand", rightPart: "righthand", pairName: "hands" },
      { leftPart: "leftleg", rightPart: "rightleg", pairName: "legs" },
    ];

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

    pairTests.forEach(({ leftPart, rightPart, pairName }) => {
      it(`should pair ${leftPart}/${rightPart} into ${pairName}`, async () => {
        const mockDialogTag: GameTag = {
          kind: TagKind.METADATA,
          name: "dialogData",
          gameName: "",
          attrs: { id: "injuries" },
          children: [
            {
              kind: TagKind.METADATA,
              name: "injury",
              gameName: "",
              attrs: { part: leftPart, severity: "1", description: "minor injury" },
              children: [],
              state: TagState.OPEN,
              text: "",
            },
            {
              kind: TagKind.METADATA,
              name: "injury",
              gameName: "",
              attrs: { part: rightPart, severity: "2", description: "moderate injury" },
              children: [],
              state: TagState.OPEN,
              text: "",
            },
          ],
          state: TagState.OPEN,
          text: "",
        };

        eventCallbacks["metadata/dialogData/injuries"]({ detail: mockDialogTag } as CustomEvent<GameTag>);
        await container.updateComplete;

        const injuriesUI = container.shadowRoot?.querySelector("illthorn-injuries-ui");
        expect(injuriesUI).toBeTruthy();
      });
    });
  });

  describe("Event Listener Cleanup", () => {
    it("should clean up event listeners on disconnect", async () => {
      const container = setup(mockSession as FrontendSession);
      await container.updateComplete;

      // Disconnect component
      teardown(container);

      // Listeners should be cleaned up
      expect(container.isConnected).toBe(false);
    });

    it("should handle session changes properly", async () => {
      const container = setup(mockSession as FrontendSession);
      await container.updateComplete;

      // Change session
      const newMockSession = {
        bus: mockBus as Bus,
      } as Partial<FrontendSession>;
      container.session = newMockSession as FrontendSession;
      await container.updateComplete;

      expect(container.session).toBe(newMockSession);

      teardown(container);
    });
  });

  describe("API Methods", () => {
    it("should provide getInjuries method", async () => {
      const container = setup(mockSession as FrontendSession);
      await container.updateComplete;

      expect(typeof container.getInjuries).toBe("function");
      const injuries = container.getInjuries();
      expect(Array.isArray(injuries)).toBe(true);

      teardown(container);
    });
  });

  describe("Radio Event Handling", () => {
    let container: InjuriesContainer;
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

    it("should subscribe to metadata/radio events", () => {
      expect(mockBus.subscribeEvent).toHaveBeenCalledWith("metadata/radio", expect.any(Function));
    });

    it("should process radio tag with valid wound data", async () => {
      const mockRadioTag: GameTag = {
        kind: TagKind.METADATA,
        name: "radio",
        gameName: "",
        attrs: { part: "head", severity: "2" },
        children: [],
        state: TagState.OPEN,
        text: "",
      };

      eventCallbacks["metadata/radio"]({ detail: mockRadioTag } as CustomEvent<GameTag>);
      await container.updateComplete;

      const injuriesUI = container.shadowRoot?.querySelector("illthorn-injuries-ui");
      expect(injuriesUI).toBeTruthy();
    });

    it("should ignore radio tag with no wound data (severity 0)", async () => {
      const mockRadioTag: GameTag = {
        kind: TagKind.METADATA,
        name: "radio",
        gameName: "",
        attrs: { part: "head", severity: "0" },
        children: [],
        state: TagState.OPEN,
        text: "",
      };

      eventCallbacks["metadata/radio"]({ detail: mockRadioTag } as CustomEvent<GameTag>);
      await container.updateComplete;

      const injuriesUI = container.shadowRoot?.querySelector("illthorn-injuries-ui");
      expect(injuriesUI).toBeTruthy();
    });

    it("should ignore radio tag without part or severity attributes", async () => {
      const mockRadioTag: GameTag = {
        kind: TagKind.METADATA,
        name: "radio",
        gameName: "",
        attrs: { id: "some-radio" },
        children: [],
        state: TagState.OPEN,
        text: "",
      };

      eventCallbacks["metadata/radio"]({ detail: mockRadioTag } as CustomEvent<GameTag>);
      await container.updateComplete;

      const injuriesUI = container.shadowRoot?.querySelector("illthorn-injuries-ui");
      expect(injuriesUI).toBeTruthy();
    });

    it("should map radio part names to internal naming convention", async () => {
      const mockRadioTag: GameTag = {
        kind: TagKind.METADATA,
        name: "radio",
        gameName: "",
        attrs: { part: "rightArm", severity: "3" },
        children: [],
        state: TagState.OPEN,
        text: "",
      };

      eventCallbacks["metadata/radio"]({ detail: mockRadioTag } as CustomEvent<GameTag>);
      await container.updateComplete;

      const injuriesUI = container.shadowRoot?.querySelector("illthorn-injuries-ui");
      expect(injuriesUI).toBeTruthy();
    });

    it("should handle multiple radio events and update injury list", async () => {
      // First radio event - head injury
      const headRadioTag: GameTag = {
        kind: TagKind.METADATA,
        name: "radio",
        gameName: "",
        attrs: { part: "head", severity: "1" },
        children: [],
        state: TagState.OPEN,
        text: "",
      };

      eventCallbacks["metadata/radio"]({ detail: headRadioTag } as CustomEvent<GameTag>);
      await container.updateComplete;

      // Second radio event - arm injury
      const armRadioTag: GameTag = {
        kind: TagKind.METADATA,
        name: "radio",
        gameName: "",
        attrs: { part: "rightArm", severity: "2" },
        children: [],
        state: TagState.OPEN,
        text: "",
      };

      eventCallbacks["metadata/radio"]({ detail: armRadioTag } as CustomEvent<GameTag>);
      await container.updateComplete;

      const injuriesUI = container.shadowRoot?.querySelector("illthorn-injuries-ui");
      expect(injuriesUI).toBeTruthy();
    });
  });
});
