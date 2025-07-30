// ABOUTME: Tests for the hands container component that manages left, right, and spell hands
// ABOUTME: Verifies component creation, session integration, and getHands API functionality
import { afterEach, describe, expect, test } from "vitest";
import type { Hand } from "../../../src/frontend/components/session/hand.lit";
import { Hands } from "../../../src/frontend/components/session/hands.lit";
import type { FrontendSession as Session } from "../../../src/frontend/session/index";
import { createMockSession } from "../../mocks";

describe("Hands", () => {
  let handsComponent: Hands;
  let mockSession: Session;

  const setup = async () => {
    mockSession = createMockSession();
    handsComponent = document.createElement("illthorn-hands-lit") as Hands;
    handsComponent.session = mockSession;
    document.body.appendChild(handsComponent);
    await handsComponent.updateComplete;
    return { handsComponent, mockSession };
  };

  afterEach(() => {
    document.body.innerHTML = "";
  });

  describe("Basic component rendering", () => {
    test("should create hands element", async () => {
      const { handsComponent } = await setup();

      expect(handsComponent).toBeTruthy();
      expect(handsComponent.tagName.toLowerCase()).toBe("illthorn-hands-lit");
    });

    test("should render with proper host styling", async () => {
      const { handsComponent } = await setup();

      expect(handsComponent).toBeTruthy();

      // Component should use Shadow DOM
      expect(handsComponent.shadowRoot).toBeTruthy();
    });

    test("should render all three hand components", async () => {
      const { handsComponent } = await setup();

      const shadowRoot = handsComponent.shadowRoot;
      expect(shadowRoot).toBeTruthy();

      const leftHand = shadowRoot?.querySelector('illthorn-hand-lit[name="left"]');
      const rightHand = shadowRoot?.querySelector('illthorn-hand-lit[name="right"]');
      const spellHand = shadowRoot?.querySelector('illthorn-hand-lit[name="spell"]');

      expect(leftHand).toBeTruthy();
      expect(rightHand).toBeTruthy();
      expect(spellHand).toBeTruthy();
    });
  });

  describe("Session property handling", () => {
    test("should accept session property", async () => {
      const { handsComponent, mockSession } = await setup();
      expect(handsComponent.session).toBe(mockSession);
    });

    test("should pass session to all hand components", async () => {
      const { handsComponent, mockSession } = await setup();

      const shadowRoot = handsComponent.shadowRoot;
      const leftHand = shadowRoot?.querySelector('illthorn-hand-lit[name="left"]') as Hand;
      const rightHand = shadowRoot?.querySelector('illthorn-hand-lit[name="right"]') as Hand;
      const spellHand = shadowRoot?.querySelector('illthorn-hand-lit[name="spell"]') as Hand;

      expect(leftHand?.session).toBe(mockSession);
      expect(rightHand?.session).toBe(mockSession);
      expect(spellHand?.session).toBe(mockSession);
    });

    test("should be reactive to session changes", async () => {
      const { handsComponent } = await setup();
      const newSession = createMockSession();

      handsComponent.session = newSession;
      await handsComponent.updateComplete;

      const shadowRoot = handsComponent.shadowRoot;
      const leftHand = shadowRoot?.querySelector('illthorn-hand-lit[name="left"]') as Hand;
      const rightHand = shadowRoot?.querySelector('illthorn-hand-lit[name="right"]') as Hand;
      const spellHand = shadowRoot?.querySelector('illthorn-hand-lit[name="spell"]') as Hand;

      expect(leftHand?.session).toBe(newSession);
      expect(rightHand?.session).toBe(newSession);
      expect(spellHand?.session).toBe(newSession);
    });
  });

  describe("getHands API", () => {
    test("should return hands interface with all three hands", async () => {
      const { handsComponent } = await setup();

      const hands = handsComponent.getHands();

      expect(hands).toBeTruthy();
      expect(hands.left).toBeTruthy();
      expect(hands.right).toBeTruthy();
      expect(hands.spell).toBeTruthy();
    });

    test("should return hand components with correct names", async () => {
      const { handsComponent } = await setup();

      const hands = handsComponent.getHands();

      expect(hands.left?.name).toBe("left");
      expect(hands.right?.name).toBe("right");
      expect(hands.spell?.name).toBe("spell");
    });

    test("should return hand components with correct sessions", async () => {
      const { handsComponent, mockSession } = await setup();

      const hands = handsComponent.getHands();

      expect(hands.left?.session).toBe(mockSession);
      expect(hands.right?.session).toBe(mockSession);
      expect(hands.spell?.session).toBe(mockSession);
    });

    test("should return hand components with correct tag names", async () => {
      const { handsComponent } = await setup();

      const hands = handsComponent.getHands();

      expect(hands.left?.tagName.toLowerCase()).toBe("illthorn-hand-lit");
      expect(hands.right?.tagName.toLowerCase()).toBe("illthorn-hand-lit");
      expect(hands.spell?.tagName.toLowerCase()).toBe("illthorn-hand-lit");
    });
  });

  describe("CSS Styling", () => {
    test("should have proper CSS styling defined", () => {
      expect(Hands.styles).toBeTruthy();

      // Convert CSSResult to string to check contents
      const stylesText = Hands.styles.toString();

      // Should have host display styling
      expect(stylesText).toContain(":host");
      expect(stylesText).toContain("display: flex");
      expect(stylesText).toContain("align-items: center");
      expect(stylesText).toContain("justify-content: center");
    });

    test("should apply drag region styling", () => {
      const stylesText = Hands.styles.toString();
      expect(stylesText).toContain("-webkit-app-region: drag");
    });

    test("should have proper layout constraints", () => {
      const stylesText = Hands.styles.toString();
      expect(stylesText).toContain("min-height: 2em");
      expect(stylesText).toContain("max-width: 90%");
      expect(stylesText).toContain("margin: 0 auto");
    });
  });

  describe("Component lifecycle", () => {
    test("should handle session property changes", async () => {
      const { handsComponent } = await setup();
      const newSession = createMockSession();

      handsComponent.session = newSession;
      await handsComponent.updateComplete;

      expect(handsComponent.session).toBe(newSession);

      const hands = handsComponent.getHands();
      expect(hands.left?.session).toBe(newSession);
      expect(hands.right?.session).toBe(newSession);
      expect(hands.spell?.session).toBe(newSession);
    });

    test("should cleanup properly on disconnect", () => {
      expect(() => {
        handsComponent.remove();
      }).not.toThrow();
    });
  });

  describe("Error handling", () => {
    test("should handle missing session gracefully", async () => {
      const handsWithoutSession = document.createElement("illthorn-hands-lit") as Hands;
      document.body.appendChild(handsWithoutSession);
      await handsWithoutSession.updateComplete;

      expect(() => {
        const hands = handsWithoutSession.getHands();
        expect(hands.left).toBeTruthy();
        expect(hands.right).toBeTruthy();
        expect(hands.spell).toBeTruthy();
      }).not.toThrow();
    });
  });

  describe("TypeScript integration", () => {
    test("should have proper TypeScript types", async () => {
      const { handsComponent } = await setup();
      // Test that TypeScript compilation succeeds
      const hands: Hands = handsComponent;
      expect(hands).toBeTruthy();
    });

    test("should be properly registered in HTMLElementTagNameMap", () => {
      const element = document.createElement("illthorn-hands-lit");
      expect(element).toBeInstanceOf(Hands);
    });
  });
});
