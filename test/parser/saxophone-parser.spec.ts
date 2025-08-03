// ABOUTME: Test suite for SaxophoneParser implementation
// ABOUTME: Validates XML parsing functionality and game protocol handling

import { beforeEach, describe, expect, test } from "vitest";
import { SaxophoneParser } from "../../src/frontend/parser/saxophone-parser";
import { GameXMLTestData } from "../fixtures/game-xml";

// Helper function to extract all text content from parsed results
function extractAllText(tags: Array<{ text?: string; children?: Array<{ text?: string; children?: unknown[] }> }>): string {
  let text = "";
  for (const tag of tags) {
    if (tag.text) {
      text += tag.text;
    }
    if (tag.children) {
      text += extractAllText(tag.children);
    }
  }
  return text;
}

describe("SaxophoneParser", () => {
  let parser: SaxophoneParser;

  beforeEach(() => {
    parser = new SaxophoneParser();
  });

  describe("Basic API", () => {
    test("has required parser methods", () => {
      expect(parser.parse).toBeDefined();
      expect(parser.reset).toBeDefined();
      expect(parser.isClosed).toBeDefined();
    });

    test("parser starts in closed state", () => {
      expect(parser.isClosed).toBe(true);
    });

    test("reset method clears parser state", () => {
      parser.parse('<progressBar id="health" value="100" />');
      parser.reset();
      expect(parser.isClosed).toBe(true);
    });
  });

  describe("Vitals XML Parsing", () => {
    test("parses basic health update", () => {
      const result = parser.parse(GameXMLTestData.vitals.basic);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("progressBar");
      expect(result[0].attrs.id).toBe("health");
      expect(result[0].attrs.value).toBe("100");
    });

    test("parses full vitals set correctly", () => {
      const result = parser.parse(GameXMLTestData.vitals.fullSet);

      // Filter to only progressBar elements (exclude text nodes from line breaks)
      const progressBars = result.filter((tag) => tag.name === "progressBar");
      expect(progressBars).toHaveLength(5);

      const health = progressBars.find((tag) => tag.attrs.id === "health");
      const mana = progressBars.find((tag) => tag.attrs.id === "mana");
      const stamina = progressBars.find((tag) => tag.attrs.id === "stamina");

      expect(health?.attrs.value).toBe("85");
      expect(mana?.attrs.value).toBe("92");
      expect(stamina?.attrs.value).toBe("78");
    });
  });

  describe("Spell Effects XML Parsing", () => {
    test("parses single spell correctly", () => {
      const result = parser.parse(GameXMLTestData.spells.singleSpell);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("dialogData");
      expect(result[0].attrs.id).toBe("Active Spells");

      // Filter to only progressBar children (exclude text nodes)
      const spells = result[0].children.filter((child) => child.name === "progressBar");
      expect(spells).toHaveLength(1);

      const spell = spells[0];
      expect(spell.name).toBe("progressBar");
      expect(spell.attrs.text).toBe("Mass Blur");
      expect(spell.attrs.time).toBe("60");
    });

    test("parses multiple spells correctly", () => {
      const result = parser.parse(GameXMLTestData.spells.multipleSpells);
      expect(result).toHaveLength(1);

      const dialogData = result[0];

      // Filter to only progressBar children (exclude text nodes)
      const spells = dialogData.children.filter((child) => child.name === "progressBar");
      expect(spells).toHaveLength(3);

      expect(spells[0].attrs.text).toBe("Bless");
      expect(spells[1].attrs.text).toBe("Spirit Defense");
      expect(spells[2].attrs.text).toBe("Heroism");
    });
  });

  describe("Room Description XML Parsing", () => {
    test("correctly parses room descriptions", () => {
      const testCases = [GameXMLTestData.rooms.simple, GameXMLTestData.rooms.withCharacters, GameXMLTestData.rooms.withFormatting, GameXMLTestData.rooms.withStreams];

      testCases.forEach((xml) => {
        const saxResult = parser.parse(xml);

        // Saxophone parser should successfully parse all room descriptions
        expect(saxResult.length).toBeGreaterThan(0);

        // Extract text content from results
        const saxText = extractAllText(saxResult);

        // Core location text should be preserved
        const hasLocationText = saxText.includes("Landing") || saxText.includes("cabin") || saxText.includes("bridge") || saxText.includes("courtyard");
        expect(hasLocationText).toBe(true);

        // Should have style tags for formatting
        const saxStyles = saxResult.filter((tag) => tag.name === "style");
        expect(saxStyles.length).toBeGreaterThan(0);

        // Should properly parse direction tags when present
        if (saxText.includes("north") || saxText.includes("south") || saxText.includes("east") || saxText.includes("west")) {
          const saxDirections = saxResult.filter((tag) => tag.name === "d");
          expect(saxDirections.length).toBeGreaterThan(0);
        }

        // Should preserve character information when present
        if (xml.includes("Adventurer") || xml.includes("Bob")) {
          expect(saxText.includes("Adventurer Bob")).toBe(true);
        }
      });
    });
  });

  describe("Text Preprocessing", () => {
    test("converts pushBold/popBold to b tags", () => {
      const result = parser.parse(GameXMLTestData.misc.pushBoldPopBold);

      // Should contain b tags, not pushBold/popBold
      const hasB = result.some((tag) => tag.name === "b" || tag.children.some((child) => child.name === "b"));
      expect(hasB).toBe(true);
    });
  });

  describe("Mixed Content Parsing", () => {
    test("correctly parses mixed content", () => {
      const result = parser.parse(GameXMLTestData.misc.mixed);

      // Should successfully parse mixed content
      expect(result.length).toBeGreaterThan(0);

      // Should contain various tag types
      const hasStyleTags = result.some((tag) => tag.name === "style");
      const hasBoldTags = result.some((tag) => tag.name === "b");
      const hasProgressBars = result.some((tag) => tag.name === "progressBar");
      const hasTextContent = result.some((tag) => tag.name === ":text" && tag.text.trim().length > 0);

      expect(hasStyleTags).toBe(true);
      expect(hasBoldTags).toBe(true);
      expect(hasProgressBars).toBe(true);
      expect(hasTextContent).toBe(true);
    });

    test("handles text and tags together", () => {
      const xml = 'Some text <progressBar id="health" value="85" /> more text';
      const result = parser.parse(xml);

      expect(result.length).toBeGreaterThan(1);

      // Should have text tags and progressBar tag
      const hasText = result.some((tag) => tag.name === ":text");
      const hasProgressBar = result.some((tag) => tag.name === "progressBar");

      expect(hasText).toBe(true);
      expect(hasProgressBar).toBe(true);
    });
  });

  describe("Error Handling", () => {
    test("handles empty input gracefully", () => {
      const result = parser.parse("");
      expect(result).toEqual([]);
    });

    test("handles whitespace-only input gracefully", () => {
      const result = parser.parse("   \n  \t  ");
      expect(result).toEqual([]);
    });

    test("continues parsing after encountering errors", () => {
      // Test with some malformed XML - should attempt to continue
      const result = parser.parse(GameXMLTestData.malformed.unclosedTag);
      // Should return some result (even if empty) without throwing
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Performance Characteristics", () => {
    test("parses large XML documents efficiently", () => {
      const largeXML = GameXMLTestData.vitals.fullSet.repeat(100);

      const start = performance.now();
      const result = parser.parse(largeXML);
      const end = performance.now();

      expect(result.length).toBeGreaterThan(0);
      expect(end - start).toBeLessThan(100); // Should complete in under 100ms
    });

    test("memory usage remains reasonable for large documents", () => {
      // Create a large document with many individual progressBar tags (realistic scenario)
      const largeSpellList = Array.from({ length: 1000 }, (_, i) => `<progressBar id="spell${i}" text="Spell ${i}" time="300" value="80" />`).join("\n");

      const result = parser.parse(largeSpellList);

      // Should parse all 1000 progressBar tags (plus text nodes for newlines)
      const progressBars = result.filter((tag) => tag.name === "progressBar");
      expect(progressBars).toHaveLength(1000);
      expect(result.length).toBeGreaterThanOrEqual(1000);

      // Memory usage test - ensure parser doesn't leak memory
      const memBefore = process.memoryUsage().heapUsed;
      for (let i = 0; i < 10; i++) {
        parser.parse(largeSpellList);
      }
      const memAfter = process.memoryUsage().heapUsed;

      // Memory shouldn't grow excessively (allow 50MB increase for test environment variability)
      expect(memAfter - memBefore).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe("Stream Handling", () => {
    test("collects inventory content within stream tags", () => {
      const inventoryXML = `<pushStream id="inv"/>  a diamond-set platinum stickpin
  a faded gold ring
  a wool jacket<popStream/>`;

      const result = parser.parse(inventoryXML);

      // Should create one stream tag containing the inventory content
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("stream");
      expect(result[0].attrs.id).toBe("inv");

      // Stream tag should contain the text content
      expect(result[0].children.length).toBeGreaterThan(0);

      // Verify inventory items are in the stream, not at root level
      const inventoryText = result[0].children
        .filter((child) => child.name === ":text")
        .map((child) => child.text)
        .join("");

      expect(inventoryText).toContain("diamond-set platinum stickpin");
      expect(inventoryText).toContain("faded gold ring");
      expect(inventoryText).toContain("wool jacket");
    });

    test("does not add stream content to main output", () => {
      const mixedXML = `Before stream<pushStream id="inv"/>inventory item<popStream/>After stream`;

      const result = parser.parse(mixedXML);

      // Should have: "Before stream" text, stream tag, "After stream" text
      expect(result).toHaveLength(3);

      // Should contain stream content within a stream tag, not in main output
      const streamTag = result.find((r) => r.name === "stream" && r.attrs.id === "inv");
      expect(streamTag).toBeDefined();
      expect(streamTag?.children.some((child) => child.text?.includes("inventory item"))).toBe(true);

      // Should have "Before stream" and "After stream" text at root level
      const beforeText = result.find((r) => r.name === ":text" && r.text?.includes("Before"));
      const afterText = result.find((r) => r.name === ":text" && r.text?.includes("After"));
      expect(beforeText).toBeDefined();
      expect(afterText).toBeDefined();
    });
  });
});
