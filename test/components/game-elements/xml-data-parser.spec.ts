// ABOUTME: Comprehensive test suite for XML data parser with IPC integration and categorization logic
// ABOUTME: Tests XML loading, parsing, caching, error handling, and item categorization patterns

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadGameObjectData, type ParsedXMLData, XMLDataParser } from "../../../src/frontend/components/game-elements/xml-data-parser";

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

// Mock XML content for testing
const mockXMLContent = `<?xml version="1.0" encoding="UTF-8"?>
<gameObjects>
  <type name="weapon">
    <noun>sword</noun>
    <noun>dagger</noun>
    <noun>(gladius|scimitar|rapier)</noun>
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
  </type>
  <type name="gem">
    <noun>ruby</noun>
    <noun>diamond</noun>
    <noun>emerald</noun>
  </type>
  <type name="manna bread">
    <noun>loaf</noun>
    <noun>bread</noun>
  </type>
  <type name="scroll">
    <noun>scroll</noun>
    <noun>parchment</noun>
  </type>
  <type name="wand">
    <noun>wand</noun>
    <noun>rod</noun>
  </type>
  <type name="clothing">
    <noun>backpack</noun>
    <noun>harness</noun>
    <noun>robe</noun>
  </type>
  <type name="magic">
    <noun>amulet</noun>
    <noun>orb</noun>
    <noun>crystal</noun>
  </type>
</gameObjects>`;

describe("XMLDataParser", () => {
  describe("parseGameObjectData", () => {
    it("should parse XML content and extract item categories", async () => {
      const result = await XMLDataParser.parseGameObjectData(mockXMLContent);

      expect(result.types.size).toBe(8);
      expect(result.categories.size).toBeGreaterThan(0);

      // Check specific categories exist
      expect(result.types.has("weapon")).toBe(true);
      expect(result.types.has("herb")).toBe(true);
      expect(result.types.has("gem")).toBe(true);
      expect(result.types.has("manna bread")).toBe(true);
      expect(result.types.has("scroll")).toBe(true);
      expect(result.types.has("wand")).toBe(true);
      expect(result.types.has("clothing")).toBe(true);
      expect(result.types.has("magic")).toBe(true);
    });

    it("should extract noun patterns correctly", async () => {
      const result = await XMLDataParser.parseGameObjectData(mockXMLContent);
      const weaponData = result.types.get("weapon");

      expect(weaponData).toBeDefined();
      expect(weaponData?.nounPatterns.length).toBe(3);

      // Test that patterns are compiled as RegExp objects
      expect(weaponData?.nounPatterns[0]).toBeInstanceOf(RegExp);
      expect(weaponData?.nounPatterns[0].test("sword")).toBe(true);
      expect(weaponData?.nounPatterns[1].test("dagger")).toBe(true);
    });

    it("should build quick lookup categories map", async () => {
      const result = await XMLDataParser.parseGameObjectData(mockXMLContent);

      // Check that simple nouns are in the quick lookup
      expect(result.categories.get("sword")).toBe("weapon");
      expect(result.categories.get("dagger")).toBe("weapon");
      expect(result.categories.get("stem")).toBe("herb");
      expect(result.categories.get("moss")).toBe("herb");
      expect(result.categories.get("ruby")).toBe("gem");
      expect(result.categories.get("loaf")).toBe("manna bread");
      expect(result.categories.get("backpack")).toBe("clothing");
      expect(result.categories.get("amulet")).toBe("magic");
    });

    it("should handle invalid XML gracefully", async () => {
      const invalidXML = "<invalid><xml>";
      const result = await XMLDataParser.parseGameObjectData(invalidXML);

      // Should return empty maps for invalid XML
      expect(result.types.size).toBe(0);
      expect(result.categories.size).toBe(0);
    });
  });

  describe("findBestCategory", () => {
    let parsedData: ParsedXMLData;

    beforeEach(async () => {
      parsedData = await XMLDataParser.parseGameObjectData(mockXMLContent);
    });

    it("should find category using quick lookup for simple nouns", () => {
      const category = XMLDataParser.findBestCategory("sword", "a sharp sword", parsedData);
      expect(category).toBe("weapon");

      const herbCategory = XMLDataParser.findBestCategory("stem", "some aloeas stem", parsedData);
      expect(herbCategory).toBe("herb");

      const gemCategory = XMLDataParser.findBestCategory("ruby", "a glimmering ruby", parsedData);
      expect(gemCategory).toBe("gem");
    });

    it("should handle pattern matching for complex nouns", () => {
      const category = XMLDataParser.findBestCategory("gladius", "matte black golvern gladius", parsedData);
      expect(category).toBe("weapon");

      const scimitarCategory = XMLDataParser.findBestCategory("scimitar", "curved scimitar", parsedData);
      expect(scimitarCategory).toBe("weapon");
    });

    it("should return null for unknown items", () => {
      const category = XMLDataParser.findBestCategory("unknown", "mysterious unknown item", parsedData);
      expect(category).toBeNull();
    });

    it("should handle case insensitive matching", () => {
      const category = XMLDataParser.findBestCategory("SWORD", "A SHARP SWORD", parsedData);
      expect(category).toBe("weapon");
    });
  });

  describe("getCategoryDisplayName", () => {
    it("should return display names for known categories", () => {
      expect(XMLDataParser.getCategoryDisplayName("gem")).toBe("Gems & Stones");
      expect(XMLDataParser.getCategoryDisplayName("jewelry")).toBe("Jewelry");
      expect(XMLDataParser.getCategoryDisplayName("weapon")).toBe("Weapons");
      expect(XMLDataParser.getCategoryDisplayName("reagent")).toBe("Reagents & Components");
    });

    it("should return the original category for unknown categories", () => {
      expect(XMLDataParser.getCategoryDisplayName("unknown")).toBe("unknown");
      expect(XMLDataParser.getCategoryDisplayName("herb")).toBe("herb");
    });
  });
});

describe("loadGameObjectData", () => {
  it("should handle IPC loading failure gracefully when no cache exists", async () => {
    // Test failure case first (before cache is populated)
    mockLoadGameObjectXML.mockResolvedValue({
      success: false,
      error: "File not found",
      content: null,
      path: null,
    });

    const result = await loadGameObjectData();

    expect(result.types.size).toBe(0);
    expect(result.categories.size).toBe(0);
  });

  it("should handle IPC network errors gracefully when no cache exists", async () => {
    // Reset and test network error
    mockLoadGameObjectXML.mockRejectedValue(new Error("Network error"));

    const result = await loadGameObjectData();

    expect(result.types.size).toBe(0);
    expect(result.categories.size).toBe(0);
  });

  it("should load XML data via IPC and cache results", async () => {
    // Reset mock for successful load
    mockLoadGameObjectXML.mockResolvedValue({
      success: true,
      content: mockXMLContent,
      path: "/app/data/gameobj-data.xml",
    });

    const result1 = await loadGameObjectData();
    const result2 = await loadGameObjectData();

    // Should only call IPC once due to caching
    expect(mockLoadGameObjectXML).toHaveBeenCalledTimes(1);
    expect(result1).toBe(result2); // Should return the same cached instance
    expect(result1.types.size).toBe(8);
  });

  it("should return cached data even after failed IPC calls", async () => {
    // After a successful load above, even failed IPC calls should return cached data
    mockLoadGameObjectXML.mockResolvedValue({
      success: false,
      error: "File not found",
      content: null,
      path: null,
    });

    const result = await loadGameObjectData();

    // Should return cached data from previous successful load
    expect(result.types.size).toBe(8);
    expect(result.categories.size).toBeGreaterThan(0);
  });
});

describe("Realistic XML categorization scenarios", () => {
  let parsedData: ParsedXMLData;

  beforeEach(async () => {
    parsedData = await XMLDataParser.parseGameObjectData(mockXMLContent);
  });

  it("should categorize realistic herb items correctly", () => {
    const herbItems = [
      { noun: "stem", name: "some aloeas stem", expected: "herb" },
      { noun: "moss", name: "some ephlox moss", expected: "herb" },
      { noun: "leaf", name: "some acantha leaf", expected: "herb" },
      { noun: "lichen", name: "some wolifrew lichen", expected: "herb" },
      { noun: "potion", name: "rose-marrow potion", expected: "herb" },
      { noun: "elixir", name: "snowflake elixir", expected: "herb" },
    ];

    for (const item of herbItems) {
      const category = XMLDataParser.findBestCategory(item.noun, item.name, parsedData);
      expect(category).toBe(item.expected);
    }
  });

  it("should categorize realistic weapon items correctly", () => {
    const weaponItems = [
      { noun: "gladius", name: "matte black golvern gladius", expected: "weapon" },
      { noun: "dagger", name: "hefty mithril dagger", expected: "weapon" },
      { noun: "sword", name: "a sharp longsword", expected: "weapon" },
      { noun: "scimitar", name: "curved scimitar", expected: "weapon" },
    ];

    for (const item of weaponItems) {
      const category = XMLDataParser.findBestCategory(item.noun, item.name, parsedData);
      expect(category).toBe(item.expected);
    }
  });

  it("should categorize realistic clothing items correctly", () => {
    const clothingItems = [
      { noun: "backpack", name: "forest green backpack", expected: "clothing" },
      { noun: "harness", name: "maroon harness", expected: "clothing" },
      { noun: "robe", name: "flowing silk robe", expected: "clothing" },
    ];

    for (const item of clothingItems) {
      const category = XMLDataParser.findBestCategory(item.noun, item.name, parsedData);
      expect(category).toBe(item.expected);
    }
  });

  it("should categorize realistic magic items correctly", () => {
    const magicItems = [
      { noun: "amulet", name: "crystal amulet", expected: "magic" },
      { noun: "scroll", name: "glowing scroll of healing", expected: "scroll" },
      { noun: "wand", name: "enchanted oak wand", expected: "wand" },
      { noun: "orb", name: "swirling crystal orb", expected: "magic" },
    ];

    for (const item of magicItems) {
      const category = XMLDataParser.findBestCategory(item.noun, item.name, parsedData);
      expect(category).toBe(item.expected);
    }
  });

  it("should categorize realistic food items correctly", () => {
    const foodItems = [
      { noun: "loaf", name: "sweet pineapple-glazed pumpkin loaf", expected: "manna bread" },
      { noun: "bread", name: "fresh bread loaf", expected: "manna bread" },
    ];

    for (const item of foodItems) {
      const category = XMLDataParser.findBestCategory(item.noun, item.name, parsedData);
      expect(category).toBe(item.expected);
    }
  });
});
