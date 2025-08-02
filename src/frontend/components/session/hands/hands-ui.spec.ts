// ABOUTME: Test suite for HandsUI presentational component verifying UI rendering and interaction
// ABOUTME: Tests the dumb UI component's rendering logic without session dependencies
import { afterEach, describe, expect, it } from "vitest";
import type { HandUI } from "./hand-ui.lit";
import { HandsUI } from "./hands-ui.lit";

describe("HandsUI", () => {
  const setup = (options?: { leftContent?: string; rightContent?: string; spellContent?: string }) => {
    const component = new HandsUI();
    if (options?.leftContent !== undefined) component.leftContent = options.leftContent;
    if (options?.rightContent !== undefined) component.rightContent = options.rightContent;
    if (options?.spellContent !== undefined) component.spellContent = options.spellContent;
    document.body.appendChild(component);
    return component;
  };

  const teardown = (component: HandsUI) => {
    if (component.parentNode) {
      component.parentNode.removeChild(component);
    }
  };

  afterEach(() => {
    document.body.innerHTML = "";
  });

  describe("Basic Rendering", () => {
    it("should create hands UI element", () => {
      const component = setup();

      expect(component).toBeTruthy();
      expect(component.tagName.toLowerCase()).toBe("illthorn-hands-ui");

      teardown(component);
    });

    it("should render with proper host styling", async () => {
      const component = setup();
      await component.updateComplete;

      expect(component.shadowRoot).toBeTruthy();

      teardown(component);
    });

    it("should render all three hand UI components", async () => {
      const component = setup();
      await component.updateComplete;

      const shadowRoot = component.shadowRoot;
      expect(shadowRoot).toBeTruthy();

      const leftHand = shadowRoot?.querySelector('illthorn-hand-ui[handType="left"]');
      const rightHand = shadowRoot?.querySelector('illthorn-hand-ui[handType="right"]');
      const spellHand = shadowRoot?.querySelector('illthorn-hand-ui[handType="spell"]');

      expect(leftHand).toBeTruthy();
      expect(rightHand).toBeTruthy();
      expect(spellHand).toBeTruthy();

      teardown(component);
    });
  });

  describe("Content Properties", () => {
    it("should accept and display left hand content", async () => {
      const component = setup({ leftContent: "a sharp sword" });
      await component.updateComplete;

      expect(component.leftContent).toBe("a sharp sword");

      const leftHand = component.shadowRoot?.querySelector('illthorn-hand-ui[handType="left"]') as HandUI;
      expect(leftHand?.content).toBe("a sharp sword");

      teardown(component);
    });

    it("should accept and display right hand content", async () => {
      const component = setup({ rightContent: "a wooden shield" });
      await component.updateComplete;

      expect(component.rightContent).toBe("a wooden shield");

      const rightHand = component.shadowRoot?.querySelector('illthorn-hand-ui[handType="right"]') as HandUI;
      expect(rightHand?.content).toBe("a wooden shield");

      teardown(component);
    });

    it("should accept and display spell content", async () => {
      const component = setup({ spellContent: "Major Sanctuary" });
      await component.updateComplete;

      expect(component.spellContent).toBe("Major Sanctuary");

      const spellHand = component.shadowRoot?.querySelector('illthorn-hand-ui[handType="spell"]') as HandUI;
      expect(spellHand?.content).toBe("Major Sanctuary");

      teardown(component);
    });

    it("should use default 'None' content when not provided", async () => {
      const component = setup();
      await component.updateComplete;

      expect(component.leftContent).toBe("None");
      expect(component.rightContent).toBe("None");
      expect(component.spellContent).toBe("None");

      teardown(component);
    });

    it("should be reactive to content changes", async () => {
      const component = setup();
      await component.updateComplete;

      component.leftContent = "new weapon";
      await component.updateComplete;

      const leftHand = component.shadowRoot?.querySelector('illthorn-hand-ui[handType="left"]') as HandUI;
      expect(leftHand?.content).toBe("new weapon");

      teardown(component);
    });
  });

  describe("getHands API", () => {
    it("should return hands interface with all three hands", async () => {
      const component = setup();
      await component.updateComplete;

      const hands = component.getHands();

      expect(hands).toBeTruthy();
      expect(hands.left).toBeTruthy();
      expect(hands.right).toBeTruthy();
      expect(hands.spell).toBeTruthy();

      teardown(component);
    });

    it("should return hand components with correct hand types", async () => {
      const component = setup();
      await component.updateComplete;

      const hands = component.getHands();

      expect(hands.left?.handType).toBe("left");
      expect(hands.right?.handType).toBe("right");
      expect(hands.spell?.handType).toBe("spell");

      teardown(component);
    });

    it("should return hand components with correct tag names", async () => {
      const component = setup();
      await component.updateComplete;

      const hands = component.getHands();

      expect(hands.left?.tagName.toLowerCase()).toBe("illthorn-hand-ui");
      expect(hands.right?.tagName.toLowerCase()).toBe("illthorn-hand-ui");
      expect(hands.spell?.tagName.toLowerCase()).toBe("illthorn-hand-ui");

      teardown(component);
    });

    it("should return null hands when components not available", () => {
      const component = setup();
      // Don't wait for updateComplete to test early state

      const hands = component.getHands();
      expect(hands).toEqual({ left: null, right: null, spell: null });

      teardown(component);
    });
  });

  describe("CSS Styling", () => {
    it("should have proper CSS styling defined", () => {
      expect(HandsUI.styles).toBeTruthy();

      const stylesText = HandsUI.styles.toString();

      expect(stylesText).toContain(":host");
      expect(stylesText).toContain("display: flex");
      expect(stylesText).toContain("align-items: center");
      expect(stylesText).toContain("justify-content: center");
    });

    it("should apply drag region styling", () => {
      const stylesText = HandsUI.styles.toString();
      expect(stylesText).toContain("-webkit-app-region: drag");
    });

    it("should have proper layout constraints", () => {
      const stylesText = HandsUI.styles.toString();
      expect(stylesText).toContain("min-height: 2em");
      expect(stylesText).toContain("max-width: 90%");
      expect(stylesText).toContain("margin: 0 auto");
    });
  });

  describe("Component Lifecycle", () => {
    it("should handle content property changes", async () => {
      const component = setup();
      await component.updateComplete;

      component.leftContent = "new item";
      component.rightContent = "another item";
      component.spellContent = "spell name";
      await component.updateComplete;

      expect(component.leftContent).toBe("new item");
      expect(component.rightContent).toBe("another item");
      expect(component.spellContent).toBe("spell name");

      teardown(component);
    });

    it("should cleanup properly on disconnect", () => {
      const component = setup();

      expect(() => {
        component.remove();
      }).not.toThrow();
    });
  });

  describe("TypeScript Integration", () => {
    it("should have proper TypeScript types", async () => {
      const component = setup();
      const hands: HandsUI = component;
      expect(hands).toBeTruthy();

      teardown(component);
    });

    it("should be properly registered in HTMLElementTagNameMap", () => {
      const element = document.createElement("illthorn-hands-ui");
      expect(element).toBeInstanceOf(HandsUI);
    });
  });
});
