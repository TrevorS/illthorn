// ABOUTME: Test suite for HandUI presentational component verifying individual hand rendering
// ABOUTME: Tests the dumb UI component for individual hands without session dependencies
import { describe, expect, test } from "vitest";
import { HandUI } from "./hand-ui.lit";

describe("HandUI", () => {
  const setup = (options?: { handType?: string; content?: string }) => {
    const element = new HandUI();
    if (options?.handType) element.handType = options.handType;
    if (options?.content !== undefined) element.content = options.content;
    document.body.appendChild(element);
    return element;
  };

  const teardown = (element: HandUI) => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  };

  test("should create element", () => {
    const element = setup();

    expect(element).toBeInstanceOf(HTMLElement);
    expect(element.tagName.toLowerCase()).toBe("illthorn-hand-ui");

    teardown(element);
  });

  test("should render default content and hand icon initially", async () => {
    const element = setup({ handType: "left" });
    await element.updateComplete;

    const handIcon = element.shadowRoot?.querySelector(".hand-icon");
    const handContent = element.shadowRoot?.querySelector(".hand-content");

    expect(handIcon?.textContent || "").toBe("✋");
    expect(handContent?.textContent || "").toBe("None");

    teardown(element);
  });

  test("should show hand emoji for left hand", async () => {
    const element = setup({ handType: "left" });
    await element.updateComplete;

    const handIcon = element.shadowRoot?.querySelector(".hand-icon");
    expect(handIcon?.textContent || "").toBe("✋");

    teardown(element);
  });

  test("should show mirrored hand emoji for right hand", async () => {
    const element = setup({ handType: "right" });
    await element.updateComplete;

    const handIcon = element.shadowRoot?.querySelector(".hand-icon");
    expect(handIcon?.textContent || "").toBe("🤚");

    teardown(element);
  });

  test("should show magic wand emoji for spell", async () => {
    const element = setup({ handType: "spell" });
    await element.updateComplete;

    const handIcon = element.shadowRoot?.querySelector(".hand-icon");
    expect(handIcon?.textContent || "").toBe("🪄");

    teardown(element);
  });

  test("should display custom content", async () => {
    const element = setup({ handType: "left", content: "a sharp sword" });
    await element.updateComplete;

    const handContent = element.shadowRoot?.querySelector(".hand-content");
    expect(handContent?.textContent || "").toBe("a sharp sword");

    teardown(element);
  });

  test("should show empty content when content is empty string", async () => {
    const element = setup({ handType: "left", content: "" });
    await element.updateComplete;

    const handContent = element.shadowRoot?.querySelector(".hand-content");
    expect(handContent?.textContent).toBe("");

    teardown(element);
  });

  test("should add class name based on hand type", async () => {
    const element = setup({ handType: "left" });
    await element.updateComplete;

    expect(element.classList.contains("left")).toBe(true);

    teardown(element);
  });

  test("should update class when handType changes", async () => {
    const element = setup({ handType: "left" });
    await element.updateComplete;

    expect(element.classList.contains("left")).toBe(true);

    element.handType = "right";
    await element.updateComplete;

    expect(element.classList.contains("left")).toBe(false);
    expect(element.classList.contains("right")).toBe(true);

    teardown(element);
  });

  test("should handle different hand types with correct icons", async () => {
    const leftElement = setup({ handType: "left" });
    const rightElement = setup({ handType: "right" });
    const spellElement = setup({ handType: "spell" });

    await Promise.all([leftElement.updateComplete, rightElement.updateComplete, spellElement.updateComplete]);

    const leftIcon = leftElement.shadowRoot?.querySelector(".hand-icon");
    const rightIcon = rightElement.shadowRoot?.querySelector(".hand-icon");
    const spellIcon = spellElement.shadowRoot?.querySelector(".hand-icon");

    expect(leftIcon?.textContent || "").toBe("✋");
    expect(rightIcon?.textContent || "").toBe("🤚");
    expect(spellIcon?.textContent || "").toBe("🪄");

    teardown(leftElement);
    teardown(rightElement);
    teardown(spellElement);
  });

  test("should have correct CSS structure", () => {
    expect(HandUI.styles).toBeTruthy();

    const stylesText = HandUI.styles.toString();

    expect(stylesText).toContain(":host");
    expect(stylesText).toContain("padding: 0 1em");
    expect(stylesText).toContain("flex: 1");
    expect(stylesText).toContain(".hand-icon");
    expect(stylesText).toContain(".hand-content");
    expect(stylesText).toContain("-webkit-app-region: no-drag");
  });

  test("should handle content property changes", async () => {
    const element = setup({ handType: "left", content: "initial content" });
    await element.updateComplete;

    let handContent = element.shadowRoot?.querySelector(".hand-content");
    expect(handContent?.textContent || "").toBe("initial content");

    element.content = "updated content";
    await element.updateComplete;

    handContent = element.shadowRoot?.querySelector(".hand-content");
    expect(handContent?.textContent || "").toBe("updated content");

    teardown(element);
  });

  test("should handle handType property changes", async () => {
    const element = setup({ handType: "left" });
    await element.updateComplete;

    expect(element.classList.contains("left")).toBe(true);

    element.handType = "spell";
    await element.updateComplete;

    expect(element.classList.contains("left")).toBe(false);
    expect(element.classList.contains("spell")).toBe(true);

    const handIcon = element.shadowRoot?.querySelector(".hand-icon");
    expect(handIcon?.textContent || "").toBe("🪄");

    teardown(element);
  });

  describe("HandUI component instantiation", () => {
    test("should create HandUI element with correct properties", () => {
      const element = setup({ handType: "right", content: "test item" });

      expect(element.handType).toBe("right");
      expect(element.content).toBe("test item");

      teardown(element);
    });

    test("should create different hand types", () => {
      const leftHand = setup({ handType: "left" });
      const rightHand = setup({ handType: "right" });
      const spellHand = setup({ handType: "spell" });

      expect(leftHand.handType).toBe("left");
      expect(rightHand.handType).toBe("right");
      expect(spellHand.handType).toBe("spell");

      teardown(leftHand);
      teardown(rightHand);
      teardown(spellHand);
    });

    test("should create elements with proper content", () => {
      const element = setup({ content: "magical item" });

      expect(element.content).toBe("magical item");

      teardown(element);
    });
  });
});
