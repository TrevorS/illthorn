// ABOUTME: Test suite for dotenv integration with ParserFactory
// ABOUTME: Ensures environment variables are properly loaded and used

import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { ParserType } from "../../src/frontend/parser/interface";
import { Parser } from "../../src/frontend/parser/parser";
import { ParserFactory } from "../../src/frontend/parser/parser-factory";
import { SaxophoneParser } from "../../src/frontend/parser/saxophone-parser";

describe("Dotenv Integration", () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    // Save original environment variable
    originalEnv = process.env.ILLTHORN_PARSER_TYPE;
    ParserFactory.reset();
  });

  afterEach(() => {
    // Restore original environment variable
    if (originalEnv !== undefined) {
      process.env.ILLTHORN_PARSER_TYPE = originalEnv;
    } else {
      delete process.env.ILLTHORN_PARSER_TYPE;
    }
    ParserFactory.reset();
  });

  describe("Environment Variable Detection", () => {
    test("uses custom parser when env var is set to custom", () => {
      process.env.ILLTHORN_PARSER_TYPE = "custom";

      const parser = ParserFactory.create();
      expect(parser).toBeInstanceOf(Parser);
      expect(ParserFactory.getCurrentParserType()).toBe(ParserType.CUSTOM);
    });

    test("uses saxophone parser when env var is set to saxophone", () => {
      process.env.ILLTHORN_PARSER_TYPE = "saxophone";

      const parser = ParserFactory.create();
      expect(parser).toBeInstanceOf(SaxophoneParser);
      expect(ParserFactory.getCurrentParserType()).toBe(ParserType.SAXOPHONE);
    });

    test("ignores invalid env var values", () => {
      process.env.ILLTHORN_PARSER_TYPE = "invalid";

      const parser = ParserFactory.create();
      expect(parser).toBeInstanceOf(Parser);
      expect(ParserFactory.getCurrentParserType()).toBe(ParserType.CUSTOM);
    });

    test("falls back to default when env var is unset", () => {
      delete process.env.ILLTHORN_PARSER_TYPE;

      const parser = ParserFactory.create();
      expect(parser).toBeInstanceOf(Parser);
      expect(ParserFactory.getCurrentParserType()).toBe(ParserType.CUSTOM);
    });
  });

  describe("Configuration Priority", () => {
    test("override parameter takes precedence over env var", () => {
      process.env.ILLTHORN_PARSER_TYPE = "saxophone";

      const parser = ParserFactory.create(ParserType.CUSTOM);
      expect(parser).toBeInstanceOf(Parser);
    });

    test("forceType overrides both env var and override parameter", () => {
      process.env.ILLTHORN_PARSER_TYPE = "custom";
      ParserFactory.configure({ forceType: ParserType.SAXOPHONE });

      const parser = ParserFactory.create(ParserType.CUSTOM);
      expect(parser).toBeInstanceOf(SaxophoneParser);
    });

    test("env var overrides default configuration", () => {
      process.env.ILLTHORN_PARSER_TYPE = "saxophone";
      ParserFactory.configure({ defaultType: ParserType.CUSTOM });

      const parser = ParserFactory.create();
      expect(parser).toBeInstanceOf(SaxophoneParser);
    });
  });

  describe("Custom Environment Variable Names", () => {
    test("respects custom env var name configuration", () => {
      process.env.CUSTOM_PARSER_TYPE = "saxophone";
      ParserFactory.configure({ envVarName: "CUSTOM_PARSER_TYPE" });

      const parser = ParserFactory.create();
      expect(parser).toBeInstanceOf(SaxophoneParser);
    });

    test("ignores default env var when custom name is configured", () => {
      process.env.ILLTHORN_PARSER_TYPE = "saxophone";
      process.env.CUSTOM_PARSER_TYPE = "custom";
      ParserFactory.configure({ envVarName: "CUSTOM_PARSER_TYPE" });

      const parser = ParserFactory.create();
      expect(parser).toBeInstanceOf(Parser);

      // Clean up
      delete process.env.CUSTOM_PARSER_TYPE;
    });
  });

  describe("Production Scenarios", () => {
    test("production deployment with env var", () => {
      // Simulate production environment
      process.env.NODE_ENV = "production";
      process.env.ILLTHORN_PARSER_TYPE = "saxophone";

      const parser = ParserFactory.create();
      expect(parser).toBeInstanceOf(SaxophoneParser);
      expect(ParserFactory.isSaxophoneEnabled()).toBe(true);
    });

    test("development with override", () => {
      // Simulate development environment
      process.env.NODE_ENV = "development";
      process.env.ILLTHORN_PARSER_TYPE = "saxophone";

      // Developer can still override for testing
      const customParser = ParserFactory.create(ParserType.CUSTOM);
      expect(customParser).toBeInstanceOf(Parser);
    });

    test("emergency rollback via env var", () => {
      // Start with saxophone
      process.env.ILLTHORN_PARSER_TYPE = "saxophone";
      expect(ParserFactory.isSaxophoneEnabled()).toBe(true);

      // Emergency rollback by changing env var
      process.env.ILLTHORN_PARSER_TYPE = "custom";

      // Factory should pick up the change
      const parser = ParserFactory.create();
      expect(parser).toBeInstanceOf(Parser);
      expect(ParserFactory.isSaxophoneEnabled()).toBe(false);
    });
  });

  describe(".env File Simulation", () => {
    test("simulates .env file loading", () => {
      // This would normally be loaded by dotenv.config()
      const envConfig = {
        ILLTHORN_PARSER_TYPE: "saxophone",
        NODE_ENV: "development",
      };

      // Apply env config
      Object.assign(process.env, envConfig);

      const parser = ParserFactory.create();
      expect(parser).toBeInstanceOf(SaxophoneParser);

      // Clean up
      Object.keys(envConfig).forEach((key) => {
        if (key !== "NODE_ENV") {
          // Don't mess with NODE_ENV
          delete process.env[key];
        }
      });
    });
  });
});
