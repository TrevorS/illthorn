import { describe, expect, it } from "vitest";
import { createMockSession } from "../../../../../test/mocks";
import { CompassUI } from "./compass-ui.lit";

describe("CompassUI", () => {
  const setup = () => {
    const compass = document.createElement("illthorn-compass-ui") as CompassUI;
    const mockSession = createMockSession();
    document.body.appendChild(compass);
    return { compass, mockSession };
  };

  const teardown = (compass: CompassUI) => {
    if (compass.parentNode) {
      compass.parentNode.removeChild(compass);
    }
  };

  describe("Basic rendering", () => {
    it("should create compass element", () => {
      const { compass } = setup();

      expect(compass).toBeInstanceOf(CompassUI);
      expect(compass.tagName.toLowerCase()).toBe("illthorn-compass-ui");

      teardown(compass);
    });

    it("should render all direction buttons", async () => {
      const { compass } = setup();

      await compass.updateComplete;

      const buttons = compass.shadowRoot?.querySelectorAll("a");
      expect(buttons).toHaveLength(15); // 15 items in DIRS array

      teardown(compass);
    });

    it("should render direction labels correctly", async () => {
      const { compass } = setup();

      await compass.updateComplete;

      const buttons = compass.shadowRoot?.querySelectorAll("a");

      // Check specific mappings
      const upButton = Array.from(buttons || []).find((btn) => btn.title === "up");
      expect(upButton?.textContent?.trim()).toBe("u");

      const downButton = Array.from(buttons || []).find((btn) => btn.title === "down");
      expect(downButton?.textContent?.trim()).toBe("d");

      const outButton = Array.from(buttons || []).find((btn) => btn.title === "out");
      expect(outButton?.textContent?.trim()).toBe("o");

      teardown(compass);
    });

    it("should hide empty direction slots", async () => {
      const { compass } = setup();

      await compass.updateComplete;

      const buttons = compass.shadowRoot?.querySelectorAll("a");
      const emptyButtons = Array.from(buttons || []).filter((btn) => !btn.textContent || btn.textContent.trim() === "");

      emptyButtons.forEach((btn) => {
        expect(btn.style.visibility).toBe("hidden");
      });

      teardown(compass);
    });
  });

  describe("ActiveDirs property", () => {
    it("should initialize activeDirs as empty array", () => {
      const { compass } = setup();

      expect(compass.activeDirs).toEqual([]);

      teardown(compass);
    });

    it("should accept activeDirs property", async () => {
      const { compass } = setup();

      compass.activeDirs = ["n", "s", "e"];
      await compass.updateComplete;

      expect(compass.activeDirs).toEqual(["n", "s", "e"]);

      teardown(compass);
    });

    it("should react to activeDirs changes", async () => {
      const { compass } = setup();

      compass.activeDirs = ["n"];
      await compass.updateComplete;
      expect(compass.activeDirs).toEqual(["n"]);

      compass.activeDirs = ["n", "s", "e", "w"];
      await compass.updateComplete;
      expect(compass.activeDirs).toEqual(["n", "s", "e", "w"]);

      teardown(compass);
    });
  });

  describe("Direction activation", () => {
    it('should apply "on" class to active directions', async () => {
      const { compass } = setup();

      compass.activeDirs = ["n", "e"];
      await compass.updateComplete;

      const buttons = compass.shadowRoot?.querySelectorAll("a");
      const northButton = Array.from(buttons || []).find((btn) => btn.title === "n");
      const eastButton = Array.from(buttons || []).find((btn) => btn.title === "e");
      const westButton = Array.from(buttons || []).find((btn) => btn.title === "w");

      expect(northButton?.classList.contains("on")).toBe(true);
      expect(eastButton?.classList.contains("on")).toBe(true);
      expect(westButton?.classList.contains("on")).toBe(false);

      teardown(compass);
    });

    it("should update visual state when activeDirs change", async () => {
      const { compass } = setup();

      compass.activeDirs = ["n"];
      await compass.updateComplete;

      const activeButtons1 = compass.shadowRoot?.querySelectorAll("a.on");
      expect(activeButtons1?.length).toBe(1);

      compass.activeDirs = ["n", "s", "e"];
      await compass.updateComplete;

      const activeButtons2 = compass.shadowRoot?.querySelectorAll("a.on");
      expect(activeButtons2?.length).toBe(3);

      teardown(compass);
    });
  });

  describe("Static properties", () => {
    it("should have correct DIRS array", () => {
      expect(CompassUI.DIRS).toHaveLength(15);
      expect(CompassUI.DIRS[1]).toBe("up");
      expect(CompassUI.DIRS[13]).toBe("down");
      expect(CompassUI.DIRS[7]).toBe("out");
    });

    it("should have correct MAP for direction abbreviations", () => {
      expect(CompassUI.MAP.up).toBe("u");
      expect(CompassUI.MAP.down).toBe("d");
      expect(CompassUI.MAP.out).toBe("o");
    });
  });
});
