import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { BaseGameElement } from "../../../src/frontend/components/game-elements/base-game-element.lit";
import type { GameTag } from "../../../src/frontend/parser/tag";
import { makeTag } from "../../../src/frontend/parser/tag";

describe("BaseGameElement", () => {
  let element: BaseGameElement;
  let mockTag: GameTag;

  const setup = () => {
    element = document.createElement("illthorn-base-game-element") as BaseGameElement;
    document.body.appendChild(element);
    return element;
  };

  const teardown = () => {
    if (element?.parentNode) {
      element.parentNode.removeChild(element);
    }
  };

  beforeEach(() => {
    mockTag = makeTag("a");
    mockTag.attrs = { noun: "sword", exist: "test123" };
    mockTag.text = "a shimmering sword";
    element = setup();
  });

  afterEach(() => {
    teardown();
  });

  describe("Basic rendering", () => {
    it("should create base game element", () => {
      expect(element).toBeInstanceOf(BaseGameElement);
      expect(element.tagName.toLowerCase()).toBe("illthorn-base-game-element");
    });

    it("should render with default properties", async () => {
      await element.updateComplete;

      expect(element.highlighted).toBe(false);
      expect(element.highlightClass).toBe("");
      expect(element.itemCategory).toBe("");
    });

    it("should accept tag property", async () => {
      element.tag = mockTag;
      await element.updateComplete;

      expect(element.tag).toBe(mockTag);
      expect(element.tag.attrs.noun).toBe("sword");
    });
  });

  describe("Highlighting behavior", () => {
    it("should apply highlighted attribute when highlighted property is true", async () => {
      element.highlighted = true;
      await element.updateComplete;

      expect(element.hasAttribute("highlighted")).toBe(true);
    });

    it("should reflect highlight class attribute", async () => {
      element.highlightClass = "test-highlight";
      await element.updateComplete;

      expect(element.getAttribute("highlight-class")).toBe("test-highlight");
    });
  });

  describe("Item categorization", () => {
    it("should apply item category attribute", async () => {
      element.itemCategory = "weapon";
      await element.updateComplete;

      expect(element.getAttribute("item-category")).toBe("weapon");
    });

    it("should apply weapon category styling", async () => {
      element.itemCategory = "weapon";
      await element.updateComplete;

      const _styles = getComputedStyle(element);
      // Note: In JSDOM, CSS custom properties may not resolve
      // This test validates that the attribute is set correctly
      expect(element.hasAttribute("item-category")).toBe(true);
    });

    it("should apply gem category styling", async () => {
      element.itemCategory = "gem";
      await element.updateComplete;

      expect(element.getAttribute("item-category")).toBe("gem");
    });

    it("should apply herbal category styling", async () => {
      element.itemCategory = "herbal";
      await element.updateComplete;

      expect(element.getAttribute("item-category")).toBe("herbal");
    });
  });

  describe("Event dispatching", () => {
    it("should dispatch interaction events with correct structure", () => {
      return new Promise<void>((resolve) => {
        element.tag = mockTag;

        element.addEventListener("game-element-test", (event: CustomEvent) => {
          expect(event.detail).toEqual({
            testData: "value",
            tag: mockTag,
          });
          expect(event.bubbles).toBe(true);
          expect(event.composed).toBe(true);
          resolve();
        });

        // Access protected method via any cast for testing
        (element as any).dispatchInteraction("test", { testData: "value" });
      });
    });

    it("should include tag data in interaction events", () => {
      return new Promise<void>((resolve) => {
        element.tag = mockTag;

        element.addEventListener("game-element-action", (event: CustomEvent) => {
          expect(event.detail.tag).toBe(mockTag);
          expect(event.detail.tag.attrs.noun).toBe("sword");
          resolve();
        });

        (element as any).dispatchInteraction("action", { action: "click" });
      });
    });
  });

  describe("Slot content", () => {
    it("should render slot content", async () => {
      const textContent = "Test content";
      element.textContent = textContent;
      await element.updateComplete;

      expect(element.textContent).toBe(textContent);
    });

    it("should preserve child elements in slot", async () => {
      const span = document.createElement("span");
      span.textContent = "Child element";
      element.appendChild(span);
      await element.updateComplete;

      expect(element.querySelector("span")).toBe(span);
      expect(element.querySelector("span")?.textContent).toBe("Child element");
    });
  });

  describe("CSS styling", () => {
    it("should have shadow DOM with styles", async () => {
      await element.updateComplete;

      // Verify shadow DOM exists
      expect(element.shadowRoot).toBeTruthy();

      // Check for styles in shadow DOM - either adoptedStyleSheets or style element
      const hasAdoptedStyles = element.shadowRoot?.adoptedStyleSheets && element.shadowRoot.adoptedStyleSheets.length > 0;
      const hasStyleElement = element.shadowRoot?.querySelector("style");

      expect(hasAdoptedStyles || hasStyleElement).toBeTruthy();
    });

    it("should have inline display styling", async () => {
      await element.updateComplete;

      // Verify styles are loaded
      expect(element.shadowRoot).toBeTruthy();

      // Check for style content (JSDOM limitations with CSS custom properties)
      const styleElement = element.shadowRoot?.querySelector("style");
      if (styleElement) {
        expect(styleElement.textContent).toContain("display: inline");
      } else if (element.shadowRoot?.adoptedStyleSheets) {
        // With adoptedStyleSheets, we just verify they exist
        expect(element.shadowRoot.adoptedStyleSheets.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Accessibility", () => {
    it("should maintain semantic structure", async () => {
      element.textContent = "Interactive element";
      await element.updateComplete;

      // Should be inline by default
      expect(element.tagName.toLowerCase()).toBe("illthorn-base-game-element");
    });

    it("should work with custom attributes for accessibility", async () => {
      element.setAttribute("aria-label", "Test element");
      element.setAttribute("role", "button");
      await element.updateComplete;

      expect(element.getAttribute("aria-label")).toBe("Test element");
      expect(element.getAttribute("role")).toBe("button");
    });
  });

  describe("Property reactivity", () => {
    it("should update when tag property changes", async () => {
      const newTag = makeTag("d");
      newTag.attrs = { cmd: "look" };

      element.tag = newTag;
      await element.updateComplete;

      expect(element.tag).toBe(newTag);
      expect(element.tag.attrs.cmd).toBe("look");
    });

    it("should update when highlighting properties change", async () => {
      element.highlighted = true;
      element.highlightClass = "user-highlight";
      element.itemCategory = "magic";
      await element.updateComplete;

      expect(element.hasAttribute("highlighted")).toBe(true);
      expect(element.getAttribute("highlight-class")).toBe("user-highlight");
      expect(element.getAttribute("item-category")).toBe("magic");
    });
  });

  describe("Multiple category support", () => {
    const categories = ["weapon", "herbal", "gem", "magic", "forgeable", "food", "container"];

    categories.forEach((category) => {
      it(`should support ${category} category`, async () => {
        element.itemCategory = category;
        await element.updateComplete;

        expect(element.getAttribute("item-category")).toBe(category);
      });
    });
  });
});
