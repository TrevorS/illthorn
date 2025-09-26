// ABOUTME: Tests for config IPC handlers - ensures proper IPC communication

import { ipcMain } from "electron";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { HighlightConfig, MacroConfig } from "../../../src/backend/config/methods";
import { ConfigMethods } from "../../../src/backend/config/methods";

// Mock the config manager
const mockConfigManager = {
  getConfigPath: vi.fn(),
  loadHighlights: vi.fn(),
  loadMacros: vi.fn(),
  saveHighlights: vi.fn(),
  saveMacros: vi.fn(),
  openInEditor: vi.fn(),
  openConfigDir: vi.fn(),
};

vi.mock("../../../src/backend/config/config-manager", () => ({
  configManager: mockConfigManager,
}));

// Mock electron ipcMain
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
  },
}));

// Mock logger
vi.mock("../../../src/backend/logger", () => ({
  log: vi.fn(),
}));

describe("Config IPC Handlers", () => {
  let handlers: Record<string, (...args: unknown[]) => unknown>;

  beforeEach(async () => {
    vi.clearAllMocks();
    handlers = {};

    // Capture the handlers that are registered
    vi.mocked(ipcMain.handle).mockImplementation((channel: string, handler: (...args: unknown[]) => unknown) => {
      handlers[channel] = handler;
    });

    // Clear module cache and import fresh
    vi.resetModules();
    await import("../../../src/backend/config/ipc-handlers");
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("GetPath handler", () => {
    it("should handle getConfigPath requests", async () => {
      const mockPath = "/home/user/.config/illthorn";
      mockConfigManager.getConfigPath.mockResolvedValue(mockPath);

      const handler = handlers[ConfigMethods.GetPath];
      const result = await handler();

      expect(mockConfigManager.getConfigPath).toHaveBeenCalled();
      expect(result).toBe(mockPath);
    });

    it("should handle errors from getConfigPath", async () => {
      const error = new Error("Permission denied");
      mockConfigManager.getConfigPath.mockRejectedValue(error);

      const handler = handlers[ConfigMethods.GetPath];

      await expect(handler()).rejects.toThrow("Permission denied");
    });
  });

  describe("LoadHighlights handler", () => {
    it("should handle loadHighlights requests", async () => {
      const mockConfig: HighlightConfig = {
        settings: { enabled: true, case_sensitive: false },
        patterns: [{ name: "test", pattern: "\\btest\\b" }],
      };
      mockConfigManager.loadHighlights.mockResolvedValue(mockConfig);

      const handler = handlers[ConfigMethods.LoadHighlights];
      const result = await handler();

      expect(mockConfigManager.loadHighlights).toHaveBeenCalled();
      expect(result).toEqual(mockConfig);
    });

    it("should handle errors from loadHighlights", async () => {
      const error = new Error("Config file corrupted");
      mockConfigManager.loadHighlights.mockRejectedValue(error);

      const handler = handlers[ConfigMethods.LoadHighlights];

      await expect(handler()).rejects.toThrow("Config file corrupted");
    });
  });

  describe("LoadMacros handler", () => {
    it("should handle loadMacros requests", async () => {
      const mockConfig: MacroConfig = {
        settings: { enabled: true },
        combat: { f1: "attack" },
      };
      mockConfigManager.loadMacros.mockResolvedValue(mockConfig);

      const handler = handlers[ConfigMethods.LoadMacros];
      const result = await handler();

      expect(mockConfigManager.loadMacros).toHaveBeenCalled();
      expect(result).toEqual(mockConfig);
    });
  });

  describe("SaveHighlights handler", () => {
    it("should handle saveHighlights requests", async () => {
      const config: HighlightConfig = {
        settings: { enabled: true, case_sensitive: false },
        patterns: [{ name: "test", pattern: "\\btest\\b" }],
      };
      mockConfigManager.saveHighlights.mockResolvedValue(undefined);

      const handler = handlers[ConfigMethods.SaveHighlights];
      await handler({}, config);

      expect(mockConfigManager.saveHighlights).toHaveBeenCalledWith(config);
    });

    it("should handle errors from saveHighlights", async () => {
      const config: HighlightConfig = {
        settings: { enabled: true, case_sensitive: false },
        patterns: [],
      };
      const error = new Error("Write permission denied");
      mockConfigManager.saveHighlights.mockRejectedValue(error);

      const handler = handlers[ConfigMethods.SaveHighlights];

      await expect(handler({}, config)).rejects.toThrow("Write permission denied");
    });
  });

  describe("SaveMacros handler", () => {
    it("should handle saveMacros requests", async () => {
      const config: MacroConfig = {
        settings: { enabled: true },
        combat: { f1: "attack" },
      };
      mockConfigManager.saveMacros.mockResolvedValue(undefined);

      const handler = handlers[ConfigMethods.SaveMacros];
      await handler({}, config);

      expect(mockConfigManager.saveMacros).toHaveBeenCalledWith(config);
    });
  });

  describe("OpenInEditor handler", () => {
    it("should handle openInEditor requests", async () => {
      const filename = "highlights.toml";
      mockConfigManager.openInEditor.mockResolvedValue(undefined);

      const handler = handlers[ConfigMethods.OpenInEditor];
      await handler({}, filename);

      expect(mockConfigManager.openInEditor).toHaveBeenCalledWith(filename);
    });

    it("should handle errors from openInEditor", async () => {
      const filename = "highlights.toml";
      const error = new Error("No default editor configured");
      mockConfigManager.openInEditor.mockRejectedValue(error);

      const handler = handlers[ConfigMethods.OpenInEditor];

      await expect(handler({}, filename)).rejects.toThrow("No default editor configured");
    });
  });

  describe("OpenConfigDir handler", () => {
    it("should handle openConfigDir requests", async () => {
      mockConfigManager.openConfigDir.mockResolvedValue(undefined);

      const handler = handlers[ConfigMethods.OpenConfigDir];
      await handler();

      expect(mockConfigManager.openConfigDir).toHaveBeenCalled();
    });

    it("should handle errors from openConfigDir", async () => {
      const error = new Error("Directory not found");
      mockConfigManager.openConfigDir.mockRejectedValue(error);

      const handler = handlers[ConfigMethods.OpenConfigDir];

      await expect(handler()).rejects.toThrow("Directory not found");
    });
  });
});
