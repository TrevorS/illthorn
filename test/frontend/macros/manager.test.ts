// ABOUTME: Tests for MacroManager functionality and TOML config integration

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MacroConfig } from "../../../src/backend/config/methods";
import { MacroManager } from "../../../src/frontend/macros/manager";

// Mock keyboardjs
vi.mock("keyboardjs", () => ({
  default: {
    on: vi.fn(),
    off: vi.fn(),
  },
}));

// Get the mocked keyboardjs for test assertions
import keyboardjs from "keyboardjs";

const mockKeyboardjs = keyboardjs as {
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
};

// Mock session helpers
vi.mock("../../../src/frontend/session/helpers", () => ({
  currentSession: vi.fn(),
}));

// Get the mocked session helpers
import { currentSession } from "../../../src/frontend/session/helpers";

const mockCurrentSession = currentSession as ReturnType<typeof vi.fn>;
const mockSession = {
  sendCommand: vi.fn(),
};

// Mock the Config API
const mockConfig = {
  loadMacros: vi.fn(),
  saveMacros: vi.fn(),
  openInEditor: vi.fn(),
};

// Mock window.Config
Object.defineProperty(window, "Config", {
  value: mockConfig,
  writable: true,
});

describe("MacroManager", () => {
  let manager: MacroManager;
  let mockMacroConfig: MacroConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new MacroManager();
    mockCurrentSession.mockReturnValue(mockSession);

    mockMacroConfig = {
      settings: {
        enabled: true,
      },
      combat: {
        f1: "stance offensive",
        f2: "stance defensive",
      },
      movement: {
        "ctrl+n": "north",
        "ctrl+s": "south",
      },
    };

    mockConfig.loadMacros.mockResolvedValue(mockMacroConfig);
    mockConfig.saveMacros.mockResolvedValue(undefined);
  });

  describe("initialization", () => {
    it("should initialize with config from TOML", async () => {
      await manager.initialize();

      expect(mockConfig.loadMacros).toHaveBeenCalledOnce();
      const bindings = manager.getBindings();
      expect(bindings).toHaveLength(4);
      expect(mockKeyboardjs.on).toHaveBeenCalledTimes(4);
    });

    it("should handle initialization errors gracefully", async () => {
      mockConfig.loadMacros.mockRejectedValue(new Error("Config error"));

      await manager.initialize();

      const bindings = manager.getBindings();
      expect(bindings).toHaveLength(0);
      expect(manager.getStats().configLoaded).toBe(true); // Still initialized with defaults
    });

    it("should only initialize once", async () => {
      await manager.initialize();
      await manager.initialize();

      expect(mockConfig.loadMacros).toHaveBeenCalledOnce();
    });
  });

  describe("key binding", () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it("should bind macros with normalized keys", () => {
      const bindings = manager.getBindings();
      const f1Binding = bindings.find((b) => b.key === "f1");
      const ctrlNBinding = bindings.find((b) => b.key === "ctrl+n");

      expect(f1Binding).toBeDefined();
      expect(f1Binding?.command).toBe("stance offensive");
      expect(f1Binding?.category).toBe("combat");

      expect(ctrlNBinding).toBeDefined();
      expect(ctrlNBinding?.command).toBe("north");
      expect(ctrlNBinding?.category).toBe("movement");
    });

    it("should normalize key formats consistently", () => {
      const result = manager.testKeyBinding("Ctrl + N");
      expect(result.valid).toBe(true);
      expect(result.normalized).toBe("ctrl+n");
    });

    it("should handle invalid key bindings", () => {
      const result = manager.testKeyBinding("");
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Empty key binding");
    });

    it("should check if keys are already bound", async () => {
      expect(manager.isKeyBound("f1")).toBe(true);
      expect(manager.isKeyBound("f3")).toBe(false);
    });
  });

  describe("command execution", () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it("should execute single commands", () => {
      // Simulate keypress by finding the callback
      const f1Call = mockKeyboardjs.on.mock.calls.find((call) => call[0] === "f1");
      expect(f1Call).toBeDefined();

      const callback = f1Call[1];
      const mockEvent = { preventDefault: vi.fn() };
      callback(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockSession.sendCommand).toHaveBeenCalledWith("stance offensive");
    });

    it("should execute multi-line commands", async () => {
      // Add a multi-line macro
      await manager.addMacro("test", "f5", "look\\nsay hello\\nbow");

      // Find the new binding
      const f5Call = mockKeyboardjs.on.mock.calls.find((call) => call[0] === "f5");
      expect(f5Call).toBeDefined();

      const callback = f5Call[1];
      callback({ preventDefault: vi.fn() });

      expect(mockSession.sendCommand).toHaveBeenCalledTimes(3);
      expect(mockSession.sendCommand).toHaveBeenCalledWith("look");
      expect(mockSession.sendCommand).toHaveBeenCalledWith("say hello");
      expect(mockSession.sendCommand).toHaveBeenCalledWith("bow");
    });

    it("should handle no active session gracefully", () => {
      mockCurrentSession.mockReturnValue(null);

      const f1Call = mockKeyboardjs.on.mock.calls.find((call) => call[0] === "f1");
      const callback = f1Call[1];
      callback({ preventDefault: vi.fn() });

      expect(mockSession.sendCommand).not.toHaveBeenCalled();
    });
  });

  describe("macro management", () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it("should add new macros", async () => {
      await manager.addMacro("test", "f10", "test command");

      expect(mockConfig.saveMacros).toHaveBeenCalled();
      expect(mockConfig.loadMacros).toHaveBeenCalledTimes(2); // Initial + reload
    });

    it("should remove macros", async () => {
      await manager.removeMacro("combat", "f1");

      expect(mockConfig.saveMacros).toHaveBeenCalled();
    });

    it("should update macro commands", async () => {
      await manager.updateMacro("combat", "f1", "stance guarded");

      expect(mockConfig.saveMacros).toHaveBeenCalled();
    });
  });

  describe("category management", () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it("should get all categories", () => {
      const categories = manager.getCategories();
      expect(categories).toContain("combat");
      expect(categories).toContain("movement");
      expect(categories).toHaveLength(2);
    });

    it("should get bindings by category", () => {
      const combatBindings = manager.getBindingsByCategory("combat");
      expect(combatBindings).toHaveLength(2);
      expect(combatBindings[0].category).toBe("combat");
    });
  });

  describe("enable/disable functionality", () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it("should disable all macros when disabled", async () => {
      await manager.setEnabled(false);

      expect(mockKeyboardjs.off).toHaveBeenCalledTimes(4); // All bindings unbound
      expect(manager.getBindings()).toHaveLength(0);
    });

    it("should re-enable macros when enabled", async () => {
      await manager.setEnabled(false);
      vi.clearAllMocks();

      await manager.setEnabled(true);

      expect(mockKeyboardjs.on).toHaveBeenCalledTimes(4); // All bindings rebound
    });
  });

  describe("unbinding", () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it("should unbind all user macros", async () => {
      await manager.unbindUserMacros();

      expect(mockKeyboardjs.off).toHaveBeenCalledTimes(4);
      expect(manager.getBindings()).toHaveLength(0);
    });

    it("should handle unbinding errors gracefully", async () => {
      mockKeyboardjs.off.mockImplementation(() => {
        throw new Error("Unbind error");
      });

      await manager.unbindUserMacros();

      // Should complete despite errors
      expect(manager.getBindings()).toHaveLength(0);
    });
  });

  describe("reload functionality", () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it("should unbind old macros and bind new ones on reload", async () => {
      // Change config
      mockMacroConfig.combat = { f3: "stance parry" };
      mockConfig.loadMacros.mockResolvedValue(mockMacroConfig);

      await manager.reload();

      // Should unbind old keys and bind new ones
      expect(mockKeyboardjs.off).toHaveBeenCalledWith("f1", expect.any(Function));
      expect(mockKeyboardjs.off).toHaveBeenCalledWith("f2", expect.any(Function));
      expect(mockKeyboardjs.on).toHaveBeenCalledWith("f3", expect.any(Function));
    });
  });

  describe("statistics and info", () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it("should provide accurate statistics", () => {
      const stats = manager.getStats();

      expect(stats.totalBindings).toBe(4);
      expect(stats.categories).toBe(2);
      expect(stats.enabled).toBe(true);
      expect(stats.configLoaded).toBe(true);
    });

    it("should provide settings", () => {
      const settings = manager.getSettings();

      expect(settings.enabled).toBe(true);
    });
  });

  describe("legacy import", () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it("should import legacy macro format", async () => {
      const legacyMacros = {
        f7: "get all",
        f8: "drop all",
      };

      await manager.importLegacyMacros(legacyMacros);

      expect(mockConfig.saveMacros).toHaveBeenCalled();
      const savedConfig = mockConfig.saveMacros.mock.calls[0][0];
      expect(savedConfig.imported).toEqual(legacyMacros);
    });
  });
});
