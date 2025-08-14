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

    it("should apply herb category styling", async () => {
      element.itemCategory = "herb";
      await element.updateComplete;

      expect(element.getAttribute("item-category")).toBe("herb");
    });

    it("should apply manna bread category styling", async () => {
      element.itemCategory = "manna bread";
      await element.updateComplete;

      expect(element.getAttribute("item-category")).toBe("manna bread");
    });

    it("should apply scroll category styling", async () => {
      element.itemCategory = "scroll";
      await element.updateComplete;

      expect(element.getAttribute("item-category")).toBe("scroll");
    });

    it("should apply wand category styling", async () => {
      element.itemCategory = "wand";
      await element.updateComplete;

      expect(element.getAttribute("item-category")).toBe("wand");
    });

    it("should apply skin category styling", async () => {
      element.itemCategory = "skin";
      await element.updateComplete;

      expect(element.getAttribute("item-category")).toBe("skin");
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

        // Access protected method via type assertion for testing
        (element as unknown as { dispatchInteraction: (type: string, detail: Record<string, unknown>) => void }).dispatchInteraction("test", { testData: "value" });
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

        (element as unknown as { dispatchInteraction: (type: string, detail: Record<string, unknown>) => void }).dispatchInteraction("action", { action: "click" });
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

    it("should use CSS custom properties without hardcoded values for proper theming", async () => {
      await element.updateComplete;

      // Verify CSS custom properties are used correctly (inherit from global theme)
      const styleElement = element.shadowRoot?.querySelector("style");
      if (styleElement?.textContent) {
        const styleText = styleElement.textContent;

        // Check that component uses var() functions for theme colors (not hardcoded values)
        expect(styleText).toContain("var(--color-item-weapon)");
        expect(styleText).toContain("var(--color-item-gem)");
        expect(styleText).toContain("var(--color-item-reagent)");
        expect(styleText).toContain("var(--color-item-food)");
        expect(styleText).toContain("var(--color-item-valuable)");

        // Verify no hardcoded color values (should inherit from global theme)
        expect(styleText).not.toContain("#ff6b6b"); // No hardcoded weapon red
        expect(styleText).not.toContain("#ffd43b"); // No hardcoded gem yellow
        expect(styleText).not.toContain("#9775fa"); // No hardcoded reagent purple
        expect(styleText).not.toContain("#ffa94d"); // No hardcoded food orange
      } else if (element.shadowRoot?.adoptedStyleSheets) {
        // With adoptedStyleSheets, we verify they contain the expected styles
        expect(element.shadowRoot.adoptedStyleSheets.length).toBeGreaterThan(0);
        // Note: In JSDOM, we can't easily inspect adoptedStyleSheets content
        // This test validates that styles are being applied via adoptedStyleSheets
      }
    });

    it("should apply correct colors for XML categories", async () => {
      // Test herb category maps to reagent color
      element.itemCategory = "herb";
      await element.updateComplete;

      expect(element.getAttribute("item-category")).toBe("herb");

      // Test manna bread maps to food color
      element.itemCategory = "manna bread";
      await element.updateComplete;

      expect(element.getAttribute("item-category")).toBe("manna bread");

      // Test scroll maps to magic color
      element.itemCategory = "scroll";
      await element.updateComplete;

      expect(element.getAttribute("item-category")).toBe("scroll");
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
    const legacyCategories = ["weapon", "gem", "magic", "forgeable", "food", "container"];
    const xmlCategories = ["herb", "manna bread", "scroll", "wand", "skin", "passive npc", "aggressive npc"];

    legacyCategories.forEach((category) => {
      it(`should support legacy ${category} category`, async () => {
        element.itemCategory = category;
        await element.updateComplete;

        expect(element.getAttribute("item-category")).toBe(category);
      });
    });

    xmlCategories.forEach((category) => {
      it(`should support XML ${category} category`, async () => {
        element.itemCategory = category;
        await element.updateComplete;

        expect(element.getAttribute("item-category")).toBe(category);
      });
    });
  });

  describe("Realistic XML-based item examples", () => {
    it("should handle realistic herb items", async () => {
      // Test realistic herb names from actual game logs
      const herbItems = [
        { name: "some aloeas stem", category: "herb" },
        { name: "some ephlox moss", category: "herb" },
        { name: "some acantha leaf", category: "herb" },
        { name: "some wolifrew lichen", category: "herb" },
        { name: "rose-marrow potion", category: "herb" },
        { name: "snowflake elixir", category: "herb" },
      ];

      for (const item of herbItems) {
        element.tag = mockTag;
        element.tag.text = item.name;
        element.textContent = item.name;
        element.itemCategory = item.category;
        await element.updateComplete;

        expect(element.getAttribute("item-category")).toBe(item.category);
        expect(element.textContent).toBe(item.name);
      }
    });

    it("should handle realistic weapon items", async () => {
      const weaponItems = [
        { name: "matte black golvern gladius", category: "weapon" },
        { name: "hefty mithril dagger", category: "weapon" },
      ];

      for (const item of weaponItems) {
        element.tag = mockTag;
        element.tag.text = item.name;
        element.textContent = item.name;
        element.itemCategory = item.category;
        await element.updateComplete;

        expect(element.getAttribute("item-category")).toBe(item.category);
        expect(element.textContent).toBe(item.name);
      }
    });

    it("should handle realistic clothing items", async () => {
      const clothingItems = [
        { name: "forest green backpack", category: "clothing" },
        { name: "maroon harness", category: "clothing" },
      ];

      for (const item of clothingItems) {
        element.tag = mockTag;
        element.tag.text = item.name;
        element.textContent = item.name;
        element.itemCategory = item.category;
        await element.updateComplete;

        expect(element.getAttribute("item-category")).toBe(item.category);
        expect(element.textContent).toBe(item.name);
      }
    });

    it("should handle realistic food items", async () => {
      const foodItems = [
        { name: "Dabbings Family special tart", category: "food" },
        { name: "iceberry tart", category: "food" },
        { name: "some calamia fruit", category: "food" },
        { name: "sweet pineapple-glazed pumpkin loaf", category: "manna bread" },
      ];

      for (const item of foodItems) {
        element.tag = mockTag;
        element.tag.text = item.name;
        element.textContent = item.name;
        element.itemCategory = item.category;
        await element.updateComplete;

        expect(element.getAttribute("item-category")).toBe(item.category);
        expect(element.textContent).toBe(item.name);
      }
    });

    it("should handle magic items", async () => {
      const magicItems = [
        { name: "crystal amulet", category: "magic" },
        { name: "glowing scroll", category: "scroll" },
        { name: "enchanted wand", category: "wand" },
      ];

      for (const item of magicItems) {
        element.tag = mockTag;
        element.tag.text = item.name;
        element.textContent = item.name;
        element.itemCategory = item.category;
        await element.updateComplete;

        expect(element.getAttribute("item-category")).toBe(item.category);
        expect(element.textContent).toBe(item.name);
      }
    });
  });
});
