// ABOUTME: Test suite for ParserFactory feature flag system
// ABOUTME: Ensures safe rollout and rollback capabilities for saxophone parser

import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { ParserType } from "../../src/frontend/parser/interface";
import { Parser } from "../../src/frontend/parser/parser";
import { ParserFactory } from "../../src/frontend/parser/parser-factory";
import { SaxophoneParser } from "../../src/frontend/parser/saxophone-parser";

describe("ParserFactory", () => {
  beforeEach(() => {
    // Reset factory to defaults before each test
    ParserFactory.reset();
  });

  afterEach(() => {
    // Clean up after each test
    ParserFactory.reset();
  });

  describe("Default Behavior", () => {
    test("creates custom parser by default", () => {
      const parser = ParserFactory.create();
      expect(parser).toBeInstanceOf(Parser);
    });

    test("getCurrentParserType returns custom by default", () => {
      const type = ParserFactory.getCurrentParserType();
      expect(type).toBe(ParserType.CUSTOM);
    });

    test("isSaxophoneEnabled returns false by default", () => {
      const enabled = ParserFactory.isSaxophoneEnabled();
      expect(enabled).toBe(false);
    });
  });

  describe("Override Parameters", () => {
    test("creates saxophone parser when overridden", () => {
      const parser = ParserFactory.create(ParserType.SAXOPHONE);
      expect(parser).toBeInstanceOf(SaxophoneParser);
    });

    test("creates custom parser when explicitly overridden", () => {
      const parser = ParserFactory.create(ParserType.CUSTOM);
      expect(parser).toBeInstanceOf(Parser);
    });

    test("getCurrentParserType respects override", () => {
      const type = ParserFactory.getCurrentParserType(ParserType.SAXOPHONE);
      expect(type).toBe(ParserType.SAXOPHONE);
    });

    test("isSaxophoneEnabled respects override", () => {
      const enabled = ParserFactory.isSaxophoneEnabled(ParserType.SAXOPHONE);
      expect(enabled).toBe(true);
    });
  });

  describe("Configuration", () => {
    test("configure changes default parser type", () => {
      ParserFactory.configure({ defaultType: ParserType.SAXOPHONE });

      const parser = ParserFactory.create();
      expect(parser).toBeInstanceOf(SaxophoneParser);

      const type = ParserFactory.getCurrentParserType();
      expect(type).toBe(ParserType.SAXOPHONE);
    });

    test("forceType overrides all other settings", () => {
      ParserFactory.configure({
        defaultType: ParserType.CUSTOM,
        forceType: ParserType.SAXOPHONE,
      });

      // Should ignore override parameter and use forced type
      const parser = ParserFactory.create(ParserType.CUSTOM);
      expect(parser).toBeInstanceOf(SaxophoneParser);

      const type = ParserFactory.getCurrentParserType(ParserType.CUSTOM);
      expect(type).toBe(ParserType.SAXOPHONE);
    });

    test("configure can change environment variable name", () => {
      ParserFactory.configure({ envVarName: "CUSTOM_PARSER_TYPE" });

      // This test just verifies the configuration doesn't break anything
      // Environment variable testing would require mocking process.env
      const parser = ParserFactory.create();
      expect(parser).toBeInstanceOf(Parser);
    });
  });

  describe("Helper Methods", () => {
    test("createBoth returns both parser types", () => {
      const parsers = ParserFactory.createBoth();

      expect(parsers.custom).toBeInstanceOf(Parser);
      expect(parsers.saxophone).toBeInstanceOf(SaxophoneParser);
    });

    test("reset restores default configuration", () => {
      ParserFactory.configure({
        defaultType: ParserType.SAXOPHONE,
        forceType: ParserType.SAXOPHONE,
      });

      // Verify configuration changed
      expect(ParserFactory.getCurrentParserType()).toBe(ParserType.SAXOPHONE);

      // Reset and verify defaults restored
      ParserFactory.reset();
      expect(ParserFactory.getCurrentParserType()).toBe(ParserType.CUSTOM);
    });
  });

  describe("Parser Type Validation", () => {
    test("invalid parser type defaults to custom", () => {
      // TypeScript would prevent this, but test runtime behavior
      const parser = ParserFactory.create("invalid" as ParserType);
      expect(parser).toBeInstanceOf(Parser);
    });

    test("undefined override uses default behavior", () => {
      const parser = ParserFactory.create(undefined);
      expect(parser).toBeInstanceOf(Parser);
    });
  });

  describe("API Compatibility", () => {
    test("both parsers implement XMLParser interface", () => {
      const parsers = ParserFactory.createBoth();

      // Test that both have required methods
      expect(typeof parsers.custom.parse).toBe("function");
      expect(typeof parsers.custom.reset).toBe("function");
      expect(typeof parsers.custom.isClosed).toBe("boolean");

      expect(typeof parsers.saxophone.parse).toBe("function");
      expect(typeof parsers.saxophone.reset).toBe("function");
      expect(typeof parsers.saxophone.isClosed).toBe("boolean");
    });

    test("both parsers can parse basic XML", () => {
      const parsers = ParserFactory.createBoth();
      const testXML = '<progressBar id="health" value="100" />';

      const customResult = parsers.custom.parse(testXML);
      const saxophoneResult = parsers.saxophone.parse(testXML);

      // Both should return arrays with elements
      expect(Array.isArray(customResult)).toBe(true);
      expect(Array.isArray(saxophoneResult)).toBe(true);
      expect(customResult.length).toBeGreaterThan(0);
      expect(saxophoneResult.length).toBeGreaterThan(0);

      // Both should have similar structure
      expect(customResult[0].name).toBe("progressBar");
      expect(saxophoneResult[0].name).toBe("progressBar");
    });
  });

  describe("Production Rollout Scenarios", () => {
    test("safe default rollout scenario", () => {
      // Default configuration should be safe (custom parser)
      ParserFactory.reset();
      expect(ParserFactory.isSaxophoneEnabled()).toBe(false);

      const parser = ParserFactory.create();
      expect(parser).toBeInstanceOf(Parser);
    });

    test("gradual rollout scenario", () => {
      // Enable saxophone parser
      ParserFactory.configure({ defaultType: ParserType.SAXOPHONE });
      expect(ParserFactory.isSaxophoneEnabled()).toBe(true);

      // But still allow override for testing
      const customParser = ParserFactory.create(ParserType.CUSTOM);
      expect(customParser).toBeInstanceOf(Parser);
    });

    test("emergency rollback scenario", () => {
      // Start with saxophone enabled
      ParserFactory.configure({ defaultType: ParserType.SAXOPHONE });
      expect(ParserFactory.isSaxophoneEnabled()).toBe(true);

      // Emergency rollback by forcing custom parser
      ParserFactory.configure({ forceType: ParserType.CUSTOM });
      expect(ParserFactory.isSaxophoneEnabled()).toBe(false);

      // Should create custom parser even with saxophone override
      const parser = ParserFactory.create(ParserType.SAXOPHONE);
      expect(parser).toBeInstanceOf(Parser);
    });
  });
});
