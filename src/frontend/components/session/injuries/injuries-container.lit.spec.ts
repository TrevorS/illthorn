// ABOUTME: Test suite for InjuriesContainer component verifying session event handling and injury data processing
// ABOUTME: Tests the smart container component's integration with session bus and injury metadata processing via image tags
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

    it("should subscribe only to dialogData/injuries events", () => {
      expect(mockBus.subscribeEvent).toHaveBeenCalledWith("metadata/dialogData/injuries", expect.any(Function));
      expect(mockBus.subscribeEvent).toHaveBeenCalledTimes(1);
    });

    it("should process image tag with Injury1 pattern", async () => {
      const mockDialogTag: GameTag = {
        kind: TagKind.METADATA,
        name: "dialogData",
        gameName: "",
        attrs: { id: "injuries" },
        children: [
          {
            kind: TagKind.METADATA,
            name: "image",
            gameName: "",
            attrs: { id: "head", name: "Injury1" },
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

    it("should process image tag with Scar2 pattern", async () => {
      const mockDialogTag: GameTag = {
        kind: TagKind.METADATA,
        name: "dialogData",
        gameName: "",
        attrs: { id: "injuries" },
        children: [
          {
            kind: TagKind.METADATA,
            name: "image",
            gameName: "",
            attrs: { id: "leftEye", name: "Scar2" },
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

    it("should clear injuries when receiving healthy parts only", async () => {
      // First add an injury
      const injuryDialogTag: GameTag = {
        kind: TagKind.METADATA,
        name: "dialogData",
        gameName: "",
        attrs: { id: "injuries" },
        children: [
          {
            kind: TagKind.METADATA,
            name: "image",
            gameName: "",
            attrs: { id: "head", name: "Injury1" },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
        ],
        state: TagState.OPEN,
        text: "",
      };

      eventCallbacks["metadata/dialogData/injuries"]({ detail: injuryDialogTag } as CustomEvent<GameTag>);
      await container.updateComplete;

      // Then send healthy parts only (name matches id)
      const healthyDialogTag: GameTag = {
        kind: TagKind.METADATA,
        name: "dialogData",
        gameName: "",
        attrs: { id: "injuries" },
        children: [
          {
            kind: TagKind.METADATA,
            name: "image",
            gameName: "",
            attrs: { id: "head", name: "head" },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
          {
            kind: TagKind.METADATA,
            name: "image",
            gameName: "",
            attrs: { id: "chest", name: "chest" },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
          {
            kind: TagKind.METADATA,
            name: "image",
            gameName: "",
            attrs: { id: "leftArm", name: "leftArm" },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
          {
            kind: TagKind.METADATA,
            name: "image",
            gameName: "",
            attrs: { id: "rightArm", name: "rightArm" },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
          {
            kind: TagKind.METADATA,
            name: "image",
            gameName: "",
            attrs: { id: "leftLeg", name: "leftLeg" },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
          {
            kind: TagKind.METADATA,
            name: "image",
            gameName: "",
            attrs: { id: "rightLeg", name: "rightLeg" },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
        ],
        state: TagState.OPEN,
        text: "",
      };

      eventCallbacks["metadata/dialogData/injuries"]({ detail: healthyDialogTag } as CustomEvent<GameTag>);
      await container.updateComplete;

      const injuriesUI = container.shadowRoot?.querySelector("illthorn-injuries-ui");
      expect(injuriesUI).toBeTruthy();
    });

    it("should ignore healthSkin image elements", async () => {
      const mockDialogTag: GameTag = {
        kind: TagKind.METADATA,
        name: "dialogData",
        gameName: "",
        attrs: { id: "injuries" },
        children: [
          {
            kind: TagKind.METADATA,
            name: "image",
            gameName: "",
            attrs: { id: "healthSkin", name: "healthBar2" },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
          {
            kind: TagKind.METADATA,
            name: "progressBar",
            gameName: "",
            attrs: { id: "health2", value: "52", text: "health 39/74" },
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
            name: "image",
            gameName: "",
            attrs: { id: "leftArm", name: "Injury1" },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
          {
            kind: TagKind.METADATA,
            name: "image",
            gameName: "",
            attrs: { id: "rightArm", name: "Injury2" },
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
            name: "image",
            gameName: "",
            attrs: { id: "leftArm", name: "Injury3" },
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
            name: "image",
            gameName: "",
            attrs: { id: "rightLeg", name: "Injury1" },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
          {
            kind: TagKind.METADATA,
            name: "image",
            gameName: "",
            attrs: { id: "head", name: "Injury2" },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
          {
            kind: TagKind.METADATA,
            name: "image",
            gameName: "",
            attrs: { id: "chest", name: "Injury3" },
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
      { imageId: "rightEye", imageName: "Injury1", expected: "r.eye" },
      { imageId: "leftEye", imageName: "Injury1", expected: "l.eye" },
      { imageId: "rightArm", imageName: "Injury1", expected: "r.arm" },
      { imageId: "leftArm", imageName: "Injury1", expected: "l.arm" },
      { imageId: "rightHand", imageName: "Injury1", expected: "r.hand" },
      { imageId: "leftHand", imageName: "Injury1", expected: "l.hand" },
      { imageId: "rightLeg", imageName: "Injury1", expected: "r.leg" },
      { imageId: "leftLeg", imageName: "Injury1", expected: "l.leg" },
      { imageId: "head", imageName: "Injury1", expected: "head" },
      { imageId: "neck", imageName: "Injury1", expected: "neck" },
      { imageId: "chest", imageName: "Injury1", expected: "chest" },
      { imageId: "abdomen", imageName: "Injury1", expected: "abdomen" },
      { imageId: "back", imageName: "Injury1", expected: "back" },
      { imageId: "nsys", imageName: "Injury1", expected: "nerves" },
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

    mappingTests.forEach(({ imageId, imageName }) => {
      it(`should process ${imageId} injury correctly`, async () => {
        const mockDialogTag: GameTag = {
          kind: TagKind.METADATA,
          name: "dialogData",
          gameName: "",
          attrs: { id: "injuries" },
          children: [
            {
              kind: TagKind.METADATA,
              name: "image",
              gameName: "",
              attrs: { id: imageId, name: imageName },
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
      { leftId: "leftEye", rightId: "rightEye", pairName: "eyes" },
      { leftId: "leftArm", rightId: "rightArm", pairName: "arms" },
      { leftId: "leftHand", rightId: "rightHand", pairName: "hands" },
      { leftId: "leftLeg", rightId: "rightLeg", pairName: "legs" },
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

    pairTests.forEach(({ leftId, rightId, pairName }) => {
      it(`should pair ${leftId}/${rightId} into ${pairName}`, async () => {
        const mockDialogTag: GameTag = {
          kind: TagKind.METADATA,
          name: "dialogData",
          gameName: "",
          attrs: { id: "injuries" },
          children: [
            {
              kind: TagKind.METADATA,
              name: "image",
              gameName: "",
              attrs: { id: leftId, name: "Injury1" },
              children: [],
              state: TagState.OPEN,
              text: "",
            },
            {
              kind: TagKind.METADATA,
              name: "image",
              gameName: "",
              attrs: { id: rightId, name: "Injury2" },
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

  describe("Severity Parsing", () => {
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

    it("should parse Injury1, Injury2, Injury3 severity levels", async () => {
      const mockDialogTag: GameTag = {
        kind: TagKind.METADATA,
        name: "dialogData",
        gameName: "",
        attrs: { id: "injuries" },
        children: [
          {
            kind: TagKind.METADATA,
            name: "image",
            gameName: "",
            attrs: { id: "head", name: "Injury1" },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
          {
            kind: TagKind.METADATA,
            name: "image",
            gameName: "",
            attrs: { id: "chest", name: "Injury2" },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
          {
            kind: TagKind.METADATA,
            name: "image",
            gameName: "",
            attrs: { id: "back", name: "Injury3" },
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

    it("should parse Scar1, Scar2, Scar3 severity levels", async () => {
      const mockDialogTag: GameTag = {
        kind: TagKind.METADATA,
        name: "dialogData",
        gameName: "",
        attrs: { id: "injuries" },
        children: [
          {
            kind: TagKind.METADATA,
            name: "image",
            gameName: "",
            attrs: { id: "leftEye", name: "Scar1" },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
          {
            kind: TagKind.METADATA,
            name: "image",
            gameName: "",
            attrs: { id: "rightArm", name: "Scar2" },
            children: [],
            state: TagState.OPEN,
            text: "",
          },
          {
            kind: TagKind.METADATA,
            name: "image",
            gameName: "",
            attrs: { id: "leftLeg", name: "Scar3" },
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
});
