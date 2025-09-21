// ABOUTME: Tests for config manager - TOML loading/saving and path management

import { promises as fs } from "fs";
import * as os from "os";
import * as path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConfigManager } from "../../../src/backend/config/config-manager";
import type { HighlightConfig, MacroConfig } from "../../../src/backend/config/methods";

// Mock electron shell module
vi.mock("electron", () => ({
  shell: {
    openPath: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock fs promises
vi.mock("node:fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs")>();
  return {
    ...actual,
    promises: {
      mkdir: vi.fn(),
      access: vi.fn(),
      readFile: vi.fn(),
      writeFile: vi.fn(),
    },
  };
});

// Mock logger
vi.mock("../../../src/backend/logger", () => ({
  log: vi.fn(),
}));

describe("ConfigManager", () => {
  let configManager: ConfigManager;
  const mockFs = vi.mocked(fs);

  beforeEach(() => {
    configManager = new ConfigManager();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("getConfigPath", () => {
    it("should return config path and ensure directory exists", async () => {
      mockFs.mkdir.mockResolvedValue(undefined);

      const configPath = await configManager.getConfigPath();

      expect(configPath).toContain("illthorn");
      expect(mockFs.mkdir).toHaveBeenCalledWith(expect.stringContaining("illthorn"), { recursive: true });
    });

    it("should handle different platforms", async () => {
      mockFs.mkdir.mockResolvedValue(undefined);

      const configPath = await configManager.getConfigPath();

      if (process.platform === "win32") {
        expect(configPath).toMatch(/.*illthorn$/);
      } else {
        expect(configPath).toMatch(/.*\.config[/\\]illthorn$/);
      }
    });
  });

  describe("loadHighlights", () => {
    it("should create default config if file does not exist", async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.access.mockRejectedValue(new Error("File not found"));
      mockFs.writeFile.mockResolvedValue(undefined);

      const config = await configManager.loadHighlights();

      expect(config.settings.enabled).toBe(true);
      expect(config.settings.case_sensitive).toBe(false);
      expect(config.patterns).toHaveLength(1);
      expect(config.patterns[0].name).toBe("example");
      expect(mockFs.writeFile).toHaveBeenCalled();
    });

    it("should load existing config file", async () => {
      const mockConfig: HighlightConfig = {
        settings: { enabled: false, case_sensitive: true },
        patterns: [{ name: "test", pattern: "\\btest\\b", color: "#00ff00", bold: false }],
      };

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readFile.mockResolvedValue(`
[settings]
enabled = false
case_sensitive = true

[[patterns]]
name = "test"
pattern = "\\\\btest\\\\b"
color = "#00ff00"
bold = false
      `);

      const config = await configManager.loadHighlights();

      expect(config.settings.enabled).toBe(false);
      expect(config.settings.case_sensitive).toBe(true);
      expect(config.patterns).toHaveLength(1);
      expect(config.patterns[0].name).toBe("test");
    });

    it("should return defaults if TOML parsing fails", async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readFile.mockResolvedValue("invalid toml content [[[");

      const config = await configManager.loadHighlights();

      expect(config.settings.enabled).toBe(true);
      expect(config.patterns).toHaveLength(1);
      expect(config.patterns[0].name).toBe("example");
    });
  });

  describe("loadMacros", () => {
    it("should create default config if file does not exist", async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.access.mockRejectedValue(new Error("File not found"));
      mockFs.writeFile.mockResolvedValue(undefined);

      const config = await configManager.loadMacros();

      expect(config.settings.enabled).toBe(true);
      expect(config.examples).toBeDefined();
      expect(config.examples["f1"]).toBe("look");
      expect(mockFs.writeFile).toHaveBeenCalled();
    });

    it("should load existing macro config", async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readFile.mockResolvedValue(`
[settings]
enabled = true

[combat]
"ctrl+1" = "stance offensive"
"ctrl+2" = "stance defensive"
      `);

      const config = await configManager.loadMacros();

      expect(config.settings.enabled).toBe(true);
      expect(config.combat).toBeDefined();
      expect(config.combat["ctrl+1"]).toBe("stance offensive");
    });
  });

  describe("saveHighlights", () => {
    it("should save highlights config as TOML", async () => {
      const config: HighlightConfig = {
        settings: { enabled: true, case_sensitive: false },
        patterns: [{ name: "test", pattern: "\\btest\\b", color: "#ff0000", bold: true }],
      };

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      await configManager.saveHighlights(config);

      expect(mockFs.writeFile).toHaveBeenCalledWith(expect.stringContaining("highlights.toml"), expect.stringContaining("enabled = true"), "utf8");
    });

    it("should handle save errors", async () => {
      const config: HighlightConfig = {
        settings: { enabled: true, case_sensitive: false },
        patterns: [],
      };

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockRejectedValue(new Error("Permission denied"));

      await expect(configManager.saveHighlights(config)).rejects.toThrow("Failed to save config");
    });
  });

  describe("saveMacros", () => {
    it("should save macros config as TOML", async () => {
      const config: MacroConfig = {
        settings: { enabled: true },
        combat: { f1: "attack", f2: "defend" },
      };

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      await configManager.saveMacros(config);

      expect(mockFs.writeFile).toHaveBeenCalledWith(expect.stringContaining("macros.toml"), expect.stringContaining("enabled = true"), "utf8");
    });
  });

  describe("openInEditor", () => {
    it("should create file if it doesn't exist before opening", async () => {
      const { shell } = await import("electron");

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.access.mockRejectedValue(new Error("File not found"));
      mockFs.writeFile.mockResolvedValue(undefined);

      await configManager.openInEditor("highlights.toml");

      expect(mockFs.writeFile).toHaveBeenCalled();
      expect(shell.openPath).toHaveBeenCalledWith(expect.stringContaining("highlights.toml"));
    });

    it("should open existing file directly", async () => {
      const { shell } = await import("electron");

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.access.mockResolvedValue(undefined);

      await configManager.openInEditor("macros.toml");

      expect(mockFs.writeFile).not.toHaveBeenCalled();
      expect(shell.openPath).toHaveBeenCalledWith(expect.stringContaining("macros.toml"));
    });
  });

  describe("openConfigDir", () => {
    it("should open config directory", async () => {
      const { shell } = await import("electron");

      mockFs.mkdir.mockResolvedValue(undefined);

      await configManager.openConfigDir();

      expect(shell.openPath).toHaveBeenCalledWith(expect.stringContaining("illthorn"));
    });
  });
});
