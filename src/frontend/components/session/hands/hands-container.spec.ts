import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockSession } from "../../../../../test/mocks/index";
import { type GameTag, TagKind, TagState } from "../../../parser/tag";
import type { FrontendSession } from "../../../session/index";
import "./hands-container.lit";
import type { HandsContainer } from "./hands-container.lit";

describe("HandsContainer", () => {
  let container: HandsContainer;
  let mockSession: ReturnType<typeof createMockSession>;

  beforeEach(async () => {
    mockSession = createMockSession("test");
    container = document.createElement("illthorn-hands-container");
    document.body.appendChild(container);
    await container.updateComplete;
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("should create component", () => {
    expect(container).toBeDefined();
    expect(container.tagName.toLowerCase()).toBe("illthorn-hands-container");
  });

  it("should initialize with default empty states", async () => {
    await container.updateComplete;

    const ui = container.shadowRoot?.querySelector("illthorn-hands-ui");
    expect(ui).toBeDefined();
    expect(ui?.getAttribute("leftcontent")).toBe("Empty");
    expect(ui?.getAttribute("rightcontent")).toBe("Empty");
    expect(ui?.getAttribute("spellcontent")).toBe("None");
  });

  it("should setup event listeners when session is provided", async () => {
    const subscribeSpy = vi.spyOn(mockSession.bus, "subscribeEvent");

    container.session = mockSession as unknown as FrontendSession;
    await container.updateComplete;

    expect(subscribeSpy).toHaveBeenCalledWith("metadata/left", expect.any(Function));
    expect(subscribeSpy).toHaveBeenCalledWith("metadata/right", expect.any(Function));
    expect(subscribeSpy).toHaveBeenCalledWith("metadata/spell", expect.any(Function));
  });

  it("should update left hand content from metadata events", async () => {
    container.session = mockSession as unknown as FrontendSession;
    await container.updateComplete;

    const leftTag: GameTag = {
      kind: TagKind.METADATA,
      name: "left",
      gameName: "left",
      attrs: {},
      children: [{ kind: TagKind.TEXT, name: ":text", gameName: "", attrs: {}, children: [], text: "a gleaming sword", state: TagState.OPEN }],
      text: "a gleaming sword",
      state: TagState.OPEN,
    };

    mockSession.bus.dispatchEvent("metadata/left", leftTag);
    await container.updateComplete;

    const ui = container.shadowRoot?.querySelector("illthorn-hands-ui");
    expect(ui?.getAttribute("leftcontent")).toBe("a gleaming sword");
  });

  it("should update right hand content from metadata events", async () => {
    container.session = mockSession as unknown as FrontendSession;
    await container.updateComplete;

    const rightTag: GameTag = {
      kind: TagKind.METADATA,
      name: "right",
      gameName: "right",
      attrs: {},
      children: [{ kind: TagKind.TEXT, name: ":text", gameName: "", attrs: {}, children: [], text: "a sturdy shield", state: TagState.OPEN }],
      text: "a sturdy shield",
      state: TagState.OPEN,
    };

    mockSession.bus.dispatchEvent("metadata/right", rightTag);
    await container.updateComplete;

    const ui = container.shadowRoot?.querySelector("illthorn-hands-ui");
    expect(ui?.getAttribute("rightcontent")).toBe("a sturdy shield");
  });

  it("should update spell content from metadata events", async () => {
    container.session = mockSession as unknown as FrontendSession;
    await container.updateComplete;

    const spellTag: GameTag = {
      kind: TagKind.METADATA,
      name: "spell",
      gameName: "spell",
      attrs: {},
      children: [{ kind: TagKind.TEXT, name: ":text", gameName: "", attrs: {}, children: [], text: "Fire Shield", state: TagState.OPEN }],
      text: "Fire Shield",
      state: TagState.OPEN,
    };

    mockSession.bus.dispatchEvent("metadata/spell", spellTag);
    await container.updateComplete;

    const ui = container.shadowRoot?.querySelector("illthorn-hands-ui");
    expect(ui?.getAttribute("spellcontent")).toBe("Fire Shield");
  });

  it("should handle empty metadata events", async () => {
    container.session = mockSession as unknown as FrontendSession;
    await container.updateComplete;

    const emptyTag: GameTag = {
      kind: TagKind.METADATA,
      name: "left",
      gameName: "left",
      attrs: {},
      children: [],
      text: "",
      state: TagState.OPEN,
    };

    mockSession.bus.dispatchEvent("metadata/left", emptyTag);
    await container.updateComplete;

    const ui = container.shadowRoot?.querySelector("illthorn-hands-ui");
    expect(ui?.getAttribute("leftcontent")).toBe("Empty");
  });

  it("should cleanup event listeners on disconnect", async () => {
    container.session = mockSession as unknown as FrontendSession;
    await container.updateComplete;

    const removeEventListenerSpy = vi.spyOn(mockSession.bus._ele, "removeEventListener");

    container.disconnectedCallback();

    expect(removeEventListenerSpy).toHaveBeenCalledTimes(3);
  });

  it("should handle session property changing to null", async () => {
    container.session = mockSession as unknown as FrontendSession;
    await container.updateComplete;

    // Change session to null
    container.session = undefined;
    await container.updateComplete;

    // Should still render with default content
    const ui = container.shadowRoot?.querySelector("illthorn-hands-ui");
    expect(ui).toBeDefined();
    expect(ui?.getAttribute("leftcontent")).toBe("Empty");
  });

  it("should handle metadata events without children arrays", async () => {
    container.session = mockSession as unknown as FrontendSession;
    await container.updateComplete;

    const malformedTag: GameTag = {
      kind: TagKind.METADATA,
      name: "left",
      gameName: "left",
      attrs: {},
      children: undefined as unknown as Array<GameTag>,
      text: "",
      state: TagState.OPEN,
    };

    mockSession.bus.dispatchEvent("metadata/left", malformedTag);
    await container.updateComplete;

    const ui = container.shadowRoot?.querySelector("illthorn-hands-ui");
    expect(ui?.getAttribute("leftcontent")).toBe("Empty");
  });

  it("should re-setup event listeners when session changes", async () => {
    const newMockSession = createMockSession("test2");
    const subscribeSpy = vi.spyOn(newMockSession.bus, "subscribeEvent");

    container.session = mockSession as unknown as FrontendSession;
    await container.updateComplete;

    // Change to new session
    container.session = newMockSession as unknown as FrontendSession;
    await container.updateComplete;

    expect(subscribeSpy).toHaveBeenCalledWith("metadata/left", expect.any(Function));
    expect(subscribeSpy).toHaveBeenCalledWith("metadata/right", expect.any(Function));
    expect(subscribeSpy).toHaveBeenCalledWith("metadata/spell", expect.any(Function));
  });
});
