// ABOUTME: Tests for HighlightManager functionality and TOML config integration

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HighlightConfig } from "../../../src/backend/config/methods";
import { HighlightManager } from "../../../src/frontend/highlights/manager";

// Mock the Config API
const mockConfig = {
  loadHighlights: vi.fn(),
  saveHighlights: vi.fn(),
  openInEditor: vi.fn(),
};

// Mock window.Config
Object.defineProperty(window, "Config", {
  value: mockConfig,
  writable: true,
});

describe("HighlightManager", () => {
  let manager: HighlightManager;
  let mockHighlightConfig: HighlightConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new HighlightManager();

    mockHighlightConfig = {
      settings: {
        enabled: true,
        case_sensitive: false,
      },
      patterns: [
        {
          name: "test-pattern",
          pattern: "\\btest\\b",
          color: "#ff0000",
          bold: true,
        },
        {
          name: "warning",
          pattern: "warning",
          background: "#ffff00",
          color: "#000000",
        },
      ],
    };

    mockConfig.loadHighlights.mockResolvedValue(mockHighlightConfig);
    mockConfig.saveHighlights.mockResolvedValue(undefined);
  });

  describe("initialization", () => {
    it("should initialize with config from TOML", async () => {
      await manager.initialize();

      expect(mockConfig.loadHighlights).toHaveBeenCalledOnce();
      const patterns = manager.getPatterns();
      expect(patterns).toHaveLength(2);
      expect(patterns[0].className).toBe("highlight-test-pattern");
    });

    it("should handle initialization errors gracefully", async () => {
      mockConfig.loadHighlights.mockRejectedValue(new Error("Config error"));

      await manager.initialize();

      const patterns = manager.getPatterns();
      expect(patterns).toHaveLength(0);
      expect(manager.getStats().configLoaded).toBe(true); // Still initialized with defaults
    });

    it("should only initialize once", async () => {
      await manager.initialize();
      await manager.initialize();

      expect(mockConfig.loadHighlights).toHaveBeenCalledOnce();
    });
  });

  describe("pattern compilation", () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it("should compile patterns with correct regex flags", () => {
      const patterns = manager.getPatterns();
      const testPattern = patterns.find((p) => p.className === "highlight-test-pattern");

      expect(testPattern?.regex.flags).toBe("gi"); // Case insensitive
    });

    it("should respect case sensitivity setting", async () => {
      mockHighlightConfig.settings.case_sensitive = true;
      mockConfig.loadHighlights.mockResolvedValue(mockHighlightConfig);

      await manager.reload();

      const patterns = manager.getPatterns();
      const testPattern = patterns.find((p) => p.className === "highlight-test-pattern");
      expect(testPattern?.regex.flags).toBe("g"); // Case sensitive
    });

    it("should handle invalid regex patterns", async () => {
      mockHighlightConfig.patterns = [
        {
          name: "invalid",
          pattern: "[unclosed", // Invalid regex
          color: "#ff0000",
        },
      ];
      mockConfig.loadHighlights.mockResolvedValue(mockHighlightConfig);

      await manager.reload();

      const patterns = manager.getPatterns();
      expect(patterns).toHaveLength(0); // Invalid pattern should be excluded
    });
  });

  describe("pattern management", () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it("should add new patterns", async () => {
      await manager.addPattern("new-pattern", "\\bnew\\b", { color: "#00ff00" });

      expect(mockConfig.saveHighlights).toHaveBeenCalled();
      expect(mockConfig.loadHighlights).toHaveBeenCalledTimes(2); // Initial + reload
    });

    it("should remove patterns by name", async () => {
      await manager.removePattern("test-pattern");

      expect(mockConfig.saveHighlights).toHaveBeenCalled();
    });

    it("should update pattern properties", async () => {
      await manager.updatePattern("test-pattern", { color: "#00ff00" });

      expect(mockConfig.saveHighlights).toHaveBeenCalled();
    });
  });

  describe("settings management", () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it("should enable/disable highlighting", async () => {
      await manager.setEnabled(false);

      expect(manager.getPatterns()).toHaveLength(0);
      expect(mockConfig.saveHighlights).toHaveBeenCalled();
    });

    it("should set case sensitivity", async () => {
      await manager.setCaseSensitive(true);

      expect(mockConfig.saveHighlights).toHaveBeenCalled();
    });
  });

  describe("pattern testing", () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it("should test patterns against text", () => {
      const matches = manager.testPattern("\\btest\\b", "this is a test string");

      expect(matches).toHaveLength(1);
      expect(matches[0][0]).toBe("test");
    });

    it("should handle invalid test patterns", () => {
      const matches = manager.testPattern("[unclosed", "test string");

      expect(matches).toHaveLength(0);
    });
  });

  describe("statistics and info", () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it("should provide accurate statistics", () => {
      const stats = manager.getStats();

      expect(stats.totalPatterns).toBe(2);
      expect(stats.enabled).toBe(true);
      expect(stats.caseSensitive).toBe(false);
      expect(stats.configLoaded).toBe(true);
    });

    it("should provide settings", () => {
      const settings = manager.getSettings();

      expect(settings.enabled).toBe(true);
      expect(settings.case_sensitive).toBe(false);
    });

    it("should provide all patterns", () => {
      const patterns = manager.getAllPatterns();

      expect(patterns).toHaveLength(2);
      expect(patterns[0].name).toBe("test-pattern");
    });
  });

  describe("class name sanitization", () => {
    it("should sanitize pattern names for CSS classes", async () => {
      mockHighlightConfig.patterns = [
        {
          name: "Test Pattern With Spaces!@#",
          pattern: "test",
          color: "#ff0000",
        },
      ];
      mockConfig.loadHighlights.mockResolvedValue(mockHighlightConfig);

      await manager.reload();

      const patterns = manager.getPatterns();
      expect(patterns[0].className).toBe("highlight-test-pattern-with-spaces---");
    });
  });

  describe("events", () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it("should dispatch highlight update events", async () => {
      const eventListener = vi.fn();

      // Mock the global Illthorn bus
      (global as unknown as { window: Window & typeof globalThis }).window = {
        ...global.window,
        Illthorn: {
          bus: {
            dispatchEvent: eventListener,
            subscribeEvent: vi.fn(),
          },
        },
        Config: mockConfig,
      } as Window & typeof globalThis;

      await manager.setEnabled(false);

      expect(eventListener).toHaveBeenCalledWith("config/highlights-reloaded", {
        patterns: expect.any(Array),
        settings: expect.any(Object),
      });
    });
  });
});
