// ABOUTME: Integration tests for item highlighting system with XML data and component integration
// ABOUTME: Tests the complete pipeline from XML loading through categorization to component rendering

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ItemHighlighter } from "../../../src/frontend/components/game-elements/item-highlighting";
import { clearXMLCache } from "../../../src/frontend/components/game-elements/xml-data-parser";

// Mock the window.App API for IPC calls
const mockLoadGameObjectXML = vi.fn();

// Set up global window.App mock
beforeEach(() => {
  (global as { window?: unknown }).window = {
    App: {
      loadGameObjectXML: mockLoadGameObjectXML,
    },
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

// Mock XML content for realistic testing
const mockXMLContent = `<?xml version="1.0" encoding="UTF-8"?>
<gameObjects>
  <type name="weapon">
    <noun>sword</noun>
    <noun>dagger</noun>
    <noun>gladius</noun>
    <noun>scimitar</noun>
    <noun>rapier</noun>
    <name>enchanted.*sword</name>
    <exclude>wooden.*sword</exclude>
  </type>
  <type name="herb">
    <noun>stem</noun>
    <noun>moss</noun>
    <noun>leaf</noun>
    <noun>lichen</noun>
    <noun>potion</noun>
    <noun>elixir</noun>
    <noun>tincture</noun>
  </type>
  <type name="gem">
    <noun>ruby</noun>
    <noun>diamond</noun>
    <noun>emerald</noun>
    <noun>sapphire</noun>
    <noun>amethyst</noun>
    <noun>crystal</noun>
  </type>
  <type name="manna bread">
    <noun>loaf</noun>
    <noun>bread</noun>
  </type>
  <type name="scroll">
    <noun>scroll</noun>
    <noun>parchment</noun>
    <noun>manuscript</noun>
  </type>
  <type name="wand">
    <noun>wand</noun>
    <noun>rod</noun>
    <noun>staff</noun>
  </type>
  <type name="clothing">
    <noun>backpack</noun>
    <noun>harness</noun>
    <noun>robe</noun>
    <noun>cloak</noun>
    <noun>tunic</noun>
  </type>
  <type name="magic">
    <noun>amulet</noun>
    <noun>orb</noun>
    <noun>talisman</noun>
    <noun>pendant</noun>
  </type>
  <type name="skin">
    <noun>skin</noun>
    <noun>hide</noun>
    <noun>pelt</noun>
  </type>
  <type name="food">
    <noun>tart</noun>
    <noun>fruit</noun>
    <noun>cake</noun>
    <noun>pie</noun>
  </type>
  <type name="passive npc">
    <noun>merchant</noun>
    <noun>shopkeeper</noun>
    <noun>clerk</noun>
  </type>
  <type name="aggressive npc">
    <noun>bandit</noun>
    <noun>warrior</noun>
    <noun>assassin</noun>
  </type>
</gameObjects>`;

describe("ItemHighlighter Integration", () => {
  beforeEach(async () => {
    // Set up successful XML loading for each test
    mockLoadGameObjectXML.mockResolvedValue({
      success: true,
      content: mockXMLContent,
      path: "/app/data/gameobj-data.xml",
    });

    // Initialize the highlighter
    await ItemHighlighter.initialize();
  });

  describe("XML Integration", () => {
    it("should initialize with XML data successfully", async () => {
      // With Vite raw import, no IPC calls are made - XML is loaded directly
      expect(mockLoadGameObjectXML).toHaveBeenCalledTimes(0);

      // Test that categorization works after initialization
      const category = await ItemHighlighter.categorizeGameElement({ noun: "sword", exist: "sword123", name: "a sharp sword" });
      expect(category.category).toBe("weapon");
      expect(category.confidence).toBe("high");
      expect(category.source).toBe("noun");
    });

    it("should handle caching correctly on repeated initialization", async () => {
      // Clear both ItemHighlighter and XML parser caches to start fresh
      ItemHighlighter.clearCache();
      clearXMLCache();

      // Initialize twice - should use cache on second call
      await ItemHighlighter.initialize();
      await ItemHighlighter.initialize();

      // Should still work correctly after repeated initialization
      const category = await ItemHighlighter.categorizeGameElement({ noun: "sword", exist: "sword123", name: "a sharp sword" });
      expect(category.category).toBe("weapon");
      expect(category.confidence).toBe("high");
      expect(category.source).toBe("noun");
    });
  });

  describe("Realistic Game Item Categorization", () => {
    beforeEach(async () => {
      // Ensure fresh initialization for each test in this group
      ItemHighlighter.clearCache();
      clearXMLCache();

      // Set up successful XML loading for each test
      mockLoadGameObjectXML.mockResolvedValue({
        success: true,
        content: mockXMLContent,
        path: "/app/data/gameobj-data.xml",
      });

      // Initialize the highlighter
      await ItemHighlighter.initialize();
    });

    it("should categorize realistic herb items from game logs", async () => {
      const herbItems = [
        { noun: "stem", exist: "127527554", name: "some aloeas stem", expected: "herb" },
        { noun: "moss", exist: "127527553", name: "some ephlox moss", expected: "herb" },
        { noun: "moss", exist: "127527550", name: "some basal moss", expected: "herb" },
        { noun: "leaf", exist: "127527549", name: "some ambrominas leaf", expected: "herb" },
        { noun: "leaf", exist: "127527547", name: "some acantha leaf", expected: "herb" },
        { noun: "lichen", exist: "127527546", name: "some wolifrew lichen", expected: "herb" },
        { noun: "potion", exist: "127527552", name: "rose-marrow potion", expected: "herb" },
        { noun: "elixir", exist: "127527541", name: "snowflake elixir", expected: "herb" },
      ];

      for (const item of herbItems) {
        const result = await ItemHighlighter.categorizeGameElement({ noun: item.noun, exist: item.exist, name: item.name });
        expect(result.category).toBe(item.expected);
        expect(result.confidence).toBe("high");
        expect(result.source).toBe("noun");
      }
    });

    it("should categorize realistic weapon items from game logs", async () => {
      const weaponItems = [
        { noun: "gladius", exist: "125592513", name: "matte black golvern gladius", expected: "weapon" },
        { noun: "dagger", exist: "125592512", name: "hefty mithril dagger", expected: "weapon" },
      ];

      for (const item of weaponItems) {
        const result = await ItemHighlighter.categorizeGameElement({ noun: item.noun, exist: item.exist, name: item.name });
        expect(result.category).toBe(item.expected);
        expect(result.confidence).toBe("high");
        expect(result.source).toBe("noun");
      }
    });

    it("should categorize realistic clothing items from game logs", async () => {
      const clothingItems = [
        { noun: "backpack", exist: "127527516", name: "forest green backpack", expected: "clothing" },
        { noun: "harness", exist: "125592511", name: "maroon harness", expected: "clothing" },
      ];

      for (const item of clothingItems) {
        const result = await ItemHighlighter.categorizeGameElement({ noun: item.noun, exist: item.exist, name: item.name });
        expect(result.category).toBe(item.expected);
        expect(result.confidence).toBe("high");
        expect(result.source).toBe("noun");
      }
    });

    it("should categorize realistic magic items from game logs", async () => {
      const magicItems = [{ noun: "amulet", exist: "127527523", name: "crystal amulet", expected: "magic" }];

      for (const item of magicItems) {
        const result = await ItemHighlighter.categorizeGameElement({ noun: item.noun, exist: item.exist, name: item.name });
        expect(result.category).toBe(item.expected);
        expect(result.confidence).toBe("high");
        expect(result.source).toBe("noun");
      }
    });

    it("should categorize realistic food items from game logs", async () => {
      const foodItems = [
        // Note: These specific tarts are excluded from food category in XML and categorized correctly as herbs
        { noun: "tart", exist: "127527543", name: "Dabbings Family special tart", expected: "herb" },
        { noun: "tart", exist: "127527540", name: "Leaftoe's lichen tart", expected: "herb" },
        { noun: "tart", exist: "127527536", name: "iceberry tart", expected: "herb" },
        // Generic tarts should still be food
        { noun: "tart", exist: "127527538", name: "a basic tart", expected: "food" },
        { noun: "apple", exist: "127527533", name: "a red apple", expected: "food" },
      ];

      for (const item of foodItems) {
        const result = await ItemHighlighter.categorizeGameElement({ noun: item.noun, exist: item.exist, name: item.name });
        expect(result.category).toBe(item.expected);
        expect(result.confidence).toBe("high");
        expect(result.source).toBe("noun");
      }
    });

    it("should handle unknown items gracefully", async () => {
      const unknownItems = [
        { noun: "Xecks", exist: "-11227146", name: "Xecks" },
        { noun: "unknown", exist: "999999", name: "mysterious unknown object" },
      ];

      for (const item of unknownItems) {
        const result = await ItemHighlighter.categorizeGameElement({ noun: item.noun, exist: item.exist, name: item.name });
        expect(result.category).toBeNull();
        expect(result.confidence).toBe("low");
        expect(result.source).toBe("fallback");
      }
    });
  });

  describe("Category Mapping Validation", () => {
    beforeEach(async () => {
      // Ensure fresh initialization for each test in this group
      ItemHighlighter.clearCache();
      clearXMLCache();

      // Set up successful XML loading for each test
      mockLoadGameObjectXML.mockResolvedValue({
        success: true,
        content: mockXMLContent,
        path: "/app/data/gameobj-data.xml",
      });

      // Initialize the highlighter
      await ItemHighlighter.initialize();
    });

    it("should provide correct category mappings for XML categories", async () => {
      // Test that each XML category maps to an appropriate display category using actual noun patterns
      const categoryMappings = [
        { noun: "bezoar", expected: "reagent" },
        { noun: "pin", expected: "jewelry" },
        { noun: "gem", expected: "gem" },
        { noun: "ruby", expected: "gem" },
        { noun: "diamond", expected: "gem" },
        { noun: "apple", expected: "food" },
        { noun: "tart", expected: "food" },
      ];

      for (const mapping of categoryMappings) {
        const result = await ItemHighlighter.categorizeGameElement({ noun: mapping.noun, exist: "test123", name: `test ${mapping.noun}` });
        expect(result.category).toBe(mapping.expected);
      }
    });

    it("should categorize NPCs correctly", async () => {
      // Test that NPCs are categorized correctly using actual XML category names
      const passiveResult = await ItemHighlighter.categorizeGameElement({ noun: "merchant", exist: "npc1", name: "halfling merchant" });
      expect(passiveResult.category).toBe("passive npc");
      expect(passiveResult.confidence).toBe("high");
      expect(passiveResult.source).toBe("noun");
    });

    it("should distinguish between scrolls, wands, and general magic items", async () => {
      const scrollResult = await ItemHighlighter.categorizeGameElement({ noun: "scroll", exist: "item1", name: "a glowing scroll" });
      expect(scrollResult.category).toBe("scroll");

      const wandResult = await ItemHighlighter.categorizeGameElement({ noun: "wand", exist: "item2", name: "an enchanted wand" });
      expect(wandResult.category).toBe("wand");

      const amuletResult = await ItemHighlighter.categorizeGameElement({ noun: "amulet", exist: "item3", name: "a crystal amulet" });
      expect(amuletResult.category).toBe("magic");
    });
  });

  describe("Performance and Caching", () => {
    beforeEach(async () => {
      // Ensure fresh initialization for each test in this group
      ItemHighlighter.clearCache();
      clearXMLCache();

      // Set up successful XML loading for each test
      mockLoadGameObjectXML.mockResolvedValue({
        success: true,
        content: mockXMLContent,
        path: "/app/data/gameobj-data.xml",
      });

      // Initialize the highlighter
      await ItemHighlighter.initialize();
    });

    it("should use cached XML data for subsequent categorizations", async () => {
      // First categorization loads XML
      await ItemHighlighter.categorizeGameElement({ noun: "sword", exist: "test1", name: "a sword" });

      // Reset mock to ensure no additional IPC calls
      mockLoadGameObjectXML.mockReset();

      // Subsequent categorizations should use cached data
      await ItemHighlighter.categorizeGameElement({ noun: "dagger", exist: "test2", name: "a dagger" });
      await ItemHighlighter.categorizeGameElement({ noun: "stem", exist: "test3", name: "some stem" });

      // Should not have made any additional IPC calls
      expect(mockLoadGameObjectXML).not.toHaveBeenCalled();
    });

    it("should handle rapid categorization requests efficiently", async () => {
      const start = performance.now();

      // Categorize many items rapidly
      for (let i = 0; i < 100; i++) {
        await ItemHighlighter.categorizeGameElement({ noun: "sword", exist: `item${i}`, name: `sword ${i}` });
        await ItemHighlighter.categorizeGameElement({ noun: "stem", exist: `herb${i}`, name: `stem ${i}` });
        await ItemHighlighter.categorizeGameElement({ noun: "ruby", exist: `gem${i}`, name: `ruby ${i}` });
      }

      const end = performance.now();
      const duration = end - start;

      // Should complete quickly (under 100ms)
      expect(duration).toBeLessThan(100);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    beforeEach(async () => {
      // Ensure fresh initialization for each test in this group
      ItemHighlighter.clearCache();
      clearXMLCache();

      // Set up successful XML loading for each test
      mockLoadGameObjectXML.mockResolvedValue({
        success: true,
        content: mockXMLContent,
        path: "/app/data/gameobj-data.xml",
      });

      // Initialize the highlighter
      await ItemHighlighter.initialize();
    });

    it("should handle empty or null inputs gracefully", async () => {
      const result1 = await ItemHighlighter.categorizeGameElement({ noun: "", exist: "", name: "" });
      expect(result1.category).toBeNull();
      expect(result1.confidence).toBe("low");

      const result2 = await ItemHighlighter.categorizeGameElement({ noun: "test", exist: "", name: "" });
      expect(result2.category).toBeNull();
      expect(result2.confidence).toBe("low");
    });

    it("should handle very long item names", async () => {
      const longName = `${"a".repeat(1000)} sword`;
      const result = await ItemHighlighter.categorizeGameElement({ noun: "sword", exist: "test", name: longName });
      expect(result.category).toBe("weapon");
      expect(result.confidence).toBe("high");
    });

    it("should handle special characters in item names", async () => {
      const specialName = "a sword with special chars: äöü @#$%^&*()";
      const result = await ItemHighlighter.categorizeGameElement({ noun: "sword", exist: "test", name: specialName });
      expect(result.category).toBe("weapon");
      expect(result.confidence).toBe("high");
    });

    it("should handle case variations consistently", async () => {
      const variations = [
        { noun: "SWORD", name: "A SWORD", expected: "weapon" },
        { noun: "Sword", name: "A Sword", expected: "weapon" },
        { noun: "sword", name: "a sword", expected: "weapon" },
        { noun: "sWoRd", name: "A sWoRd", expected: "weapon" },
      ];

      for (const variation of variations) {
        const result = await ItemHighlighter.categorizeGameElement({ noun: variation.noun, exist: "test", name: variation.name });
        expect(result.category).toBe(variation.expected);
        expect(result.confidence).toBe("high");
      }
    });
  });

  describe("Integration with Component System", () => {
    beforeEach(async () => {
      // Ensure fresh initialization for each test in this group
      ItemHighlighter.clearCache();
      clearXMLCache();

      // Set up successful XML loading for each test
      mockLoadGameObjectXML.mockResolvedValue({
        success: true,
        content: mockXMLContent,
        path: "/app/data/gameobj-data.xml",
      });

      // Initialize the highlighter
      await ItemHighlighter.initialize();
    });

    it("should return categorization results in the expected format for components", async () => {
      const result = await ItemHighlighter.categorizeGameElement({ noun: "sword", exist: "test123", name: "a sharp sword" });

      // Verify the result has all expected properties
      expect(result).toHaveProperty("category");
      expect(result).toHaveProperty("confidence");
      expect(result).toHaveProperty("source");

      // Verify property types
      expect(typeof result.category).toBe("string");
      expect(typeof result.confidence).toBe("string");
      expect(typeof result.source).toBe("string");

      // Verify confidence levels are valid
      expect(["high", "medium", "low"]).toContain(result.confidence);

      // Verify source types are valid
      expect(["noun", "name", "exist", "fallback"]).toContain(result.source);
    });

    it("should work with getItemCategory helper method", async () => {
      const category = await ItemHighlighter.getItemCategory("sword", "a sharp sword");
      expect(category).toBe("weapon");

      const unknownCategory = await ItemHighlighter.getItemCategory("unknown", "unknown item");
      expect(unknownCategory).toBeNull();
    });
  });
});
