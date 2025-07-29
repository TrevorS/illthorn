import { describe, expect, test } from "vitest";
import { HandLit, makeHandLit } from "../src/frontend/components/session/hand.lit";
import { makeTag } from "../src/frontend/parser/tag";
import { createMockSession } from "./mocks";

describe("HandLit", () => {
  const setup = () => {
    const element = new HandLit();
    const mockSession = createMockSession();
    document.body.appendChild(element);
    return { element, mockSession };
  };

  const teardown = (element: HandLit) => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  };

  test("should create element", () => {
    const { element } = setup();

    expect(element).toBeInstanceOf(HTMLElement);
    expect(element.tagName.toLowerCase()).toBe("illthorn-hand-lit");

    teardown(element);
  });

  test("should render default content and hand icon initially", async () => {
    const { element, mockSession } = setup();

    element.session = mockSession;
    element.name = "left";
    await element.updateComplete;

    const handIcon = element.shadowRoot?.querySelector(".hand-icon");
    const handContent = element.shadowRoot?.querySelector(".hand-content");

    expect(handIcon?.textContent || "").toBe("✋");
    expect(handContent?.textContent || "").toBe("None");

    teardown(element);
  });

  test("should show hand emoji for left hand", async () => {
    const { element, mockSession } = setup();

    element.session = mockSession;
    element.name = "left";
    await element.updateComplete;

    const handIcon = element.shadowRoot?.querySelector(".hand-icon");
    expect(handIcon?.textContent || "").toBe("✋");

    teardown(element);
  });

  test("should show hand emoji for right hand", async () => {
    const { element, mockSession } = setup();

    element.session = mockSession;
    element.name = "right";
    await element.updateComplete;

    const handIcon = element.shadowRoot?.querySelector(".hand-icon");
    expect(handIcon?.textContent || "").toBe("✋");

    teardown(element);
  });

  test("should show magic wand emoji for spell", async () => {
    const { element, mockSession } = setup();

    element.session = mockSession;
    element.name = "spell";
    await element.updateComplete;

    const handIcon = element.shadowRoot?.querySelector(".hand-icon");
    expect(handIcon?.textContent || "").toBe("🪄");

    teardown(element);
  });

  test("should update content on hand metadata event", async () => {
    const { element, mockSession } = setup();
    const testContent = "a silver sword";

    element.session = mockSession;
    element.name = "left";
    await element.updateComplete;

    // Create proper GameTag object for hand event
    const handTag = makeTag("left");
    const childTag = makeTag(":text");
    childTag.text = testContent;
    handTag.children = [childTag];

    mockSession.bus.dispatchEvent("metadata/left", handTag);
    await element.updateComplete;

    const handContent = element.shadowRoot?.querySelector(".hand-content");
    expect(handContent?.textContent || "").toBe(testContent);

    teardown(element);
  });

  test("should show 'None' when hand is empty", async () => {
    const { element, mockSession } = setup();

    element.session = mockSession;
    element.name = "left";
    await element.updateComplete;

    // Create proper GameTag object for empty hand event
    const handTag = makeTag("left");
    handTag.children = [];

    mockSession.bus.dispatchEvent("metadata/left", handTag);
    await element.updateComplete;

    const handContent = element.shadowRoot?.querySelector(".hand-content");
    expect(handContent?.textContent || "").toBe("None");

    teardown(element);
  });

  test("should handle children without text property", async () => {
    const { element, mockSession } = setup();

    element.session = mockSession;
    element.name = "left";
    await element.updateComplete;

    // Create proper GameTag object with child without text property
    const handTag = makeTag("left");
    const childTag = makeTag(":text");
    // childTag.text is empty/undefined
    handTag.children = [childTag];

    mockSession.bus.dispatchEvent("metadata/left", handTag);
    await element.updateComplete;

    const handContent = element.shadowRoot?.querySelector(".hand-content");
    expect(handContent?.textContent || "").toBe("None");

    teardown(element);
  });

  test("should add class name based on hand type", async () => {
    const { element, mockSession } = setup();

    element.session = mockSession;
    element.name = "spell";
    await element.updateComplete;

    expect(element.classList.contains("spell")).toBe(true);

    teardown(element);
  });

  test("should update class when name changes", async () => {
    const { element, mockSession } = setup();

    element.session = mockSession;
    element.name = "left";
    await element.updateComplete;
    expect(element.classList.contains("left")).toBe(true);

    element.name = "spell";
    await element.updateComplete;
    expect(element.classList.contains("left")).toBe(false);
    expect(element.classList.contains("spell")).toBe(true);

    teardown(element);
  });

  test("should handle different hand types with correct events", async () => {
    const { element, mockSession } = setup();
    const testContent = "a wooden staff";

    element.session = mockSession;
    element.name = "right";
    await element.updateComplete;

    // Create proper GameTag object for right hand event
    const handTag = makeTag("right");
    const childTag = makeTag(":text");
    childTag.text = testContent;
    handTag.children = [childTag];

    mockSession.bus.dispatchEvent("metadata/right", handTag);
    await element.updateComplete;

    const handContent = element.shadowRoot?.querySelector(".hand-content");
    expect(handContent?.textContent || "").toBe(testContent);

    teardown(element);
  });

  test("should have correct CSS structure", async () => {
    const { element, mockSession } = setup();

    element.session = mockSession;
    element.name = "left";
    await element.updateComplete;

    const handIcon = element.shadowRoot?.querySelector(".hand-icon");
    const handContent = element.shadowRoot?.querySelector(".hand-content");

    expect(handIcon).toBeTruthy();
    expect(handContent).toBeTruthy();
    expect(handIcon?.tagName.toLowerCase()).toBe("span");
    expect(handContent?.tagName.toLowerCase()).toBe("span");

    teardown(element);
  });

  test("should not setup event listeners without session or name", async () => {
    const { element } = setup();

    await element.updateComplete;

    const handContent = element.shadowRoot?.querySelector(".hand-content");
    expect(handContent?.textContent || "").toBe("None");

    teardown(element);
  });

  test("should handle session and name property changes", async () => {
    const { element } = setup();

    await element.updateComplete;

    const newMockSession = createMockSession();
    element.session = newMockSession;
    element.name = "right";
    await element.updateComplete;

    const testContent = "a golden ring";
    // Create proper GameTag object for right hand event
    const handTag = makeTag("right");
    const childTag = makeTag(":text");
    childTag.text = testContent;
    handTag.children = [childTag];

    newMockSession.bus.dispatchEvent("metadata/right", handTag);
    await element.updateComplete;

    const handContent = element.shadowRoot?.querySelector(".hand-content");
    expect(handContent?.textContent || "").toBe(testContent);

    teardown(element);
  });
});

describe("makeHandLit factory function", () => {
  test("should create HandLit element with correct properties", () => {
    const mockSession = createMockSession();
    const hand = makeHandLit(mockSession, "left");

    expect(hand).toBeInstanceOf(HTMLElement);
    expect(hand.tagName.toLowerCase()).toBe("illthorn-hand-lit");
    expect(hand.session).toBe(mockSession);
    expect(hand.name).toBe("left");
  });

  test("should create different hand types", () => {
    const mockSession = createMockSession();
    const leftHand = makeHandLit(mockSession, "left");
    const rightHand = makeHandLit(mockSession, "right");
    const spellHand = makeHandLit(mockSession, "spell");

    expect(leftHand.name).toBe("left");
    expect(rightHand.name).toBe("right");
    expect(spellHand.name).toBe("spell");
  });

  test("should create elements with proper session reference", () => {
    const mockSession = createMockSession();
    const hand = makeHandLit(mockSession, "spell");
    expect(hand.session).toBe(mockSession);
  });
});
