import { describe, expect, it } from "vitest";
import { CompassLit } from "../src/frontend/components/session/compass.lit";
import { createMockCompassData, createMockSession, mockDirections } from "./mocks";

describe("CompassLit", () => {
  const setup = () => {
    const compass = document.createElement("illthorn-compass-lit") as CompassLit;
    const mockSession = createMockSession();
    document.body.appendChild(compass);
    return { compass, mockSession };
  };

  const teardown = (compass: CompassLit) => {
    if (compass.parentNode) {
      compass.parentNode.removeChild(compass);
    }
  };

  describe("Basic rendering", () => {
    it("should create compass element", () => {
      const { compass } = setup();

      expect(compass).toBeInstanceOf(CompassLit);
      expect(compass.tagName.toLowerCase()).toBe("illthorn-compass-lit");

      teardown(compass);
    });

    it("should render all direction buttons", async () => {
      const { compass, mockSession } = setup();

      compass.session = mockSession;
      await compass.updateComplete;

      const buttons = compass.shadowRoot?.querySelectorAll("a");
      expect(buttons).toHaveLength(15); // 15 items in DIRS array

      teardown(compass);
    });

    it("should render direction labels correctly", async () => {
      const { compass, mockSession } = setup();

      compass.session = mockSession;
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
      const { compass, mockSession } = setup();

      compass.session = mockSession;
      await compass.updateComplete;

      const buttons = compass.shadowRoot?.querySelectorAll("a");
      const emptyButtons = Array.from(buttons || []).filter((btn) => !btn.textContent || btn.textContent.trim() === "");

      emptyButtons.forEach((btn) => {
        expect(btn.style.visibility).toBe("hidden");
      });

      teardown(compass);
    });
  });

  describe("Session property", () => {
    it("should accept session property", async () => {
      const { compass, mockSession } = setup();

      compass.session = mockSession;
      await compass.updateComplete;

      expect(compass.session).toBe(mockSession);

      teardown(compass);
    });

    it("should initialize activeDirs as empty array", () => {
      const { compass } = setup();

      expect(compass.activeDirs).toEqual([]);

      teardown(compass);
    });

    it("should update activeDirs when compass data received", async () => {
      const { compass, mockSession } = setup();

      compass.session = mockSession;
      await compass.updateComplete;

      const compassData = createMockCompassData(mockDirections.basic);
      mockSession.bus.dispatchEvent("metadata/compass", compassData);
      await compass.updateComplete;

      expect(compass.activeDirs).toEqual(mockDirections.basic);

      teardown(compass);
    });
  });

  describe("Direction activation", () => {
    it('should apply "on" class to active directions', async () => {
      const { compass, mockSession } = setup();

      compass.session = mockSession;
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
      const { compass, mockSession } = setup();

      compass.session = mockSession;
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
      expect(CompassLit.DIRS).toHaveLength(15);
      expect(CompassLit.DIRS[1]).toBe("up");
      expect(CompassLit.DIRS[13]).toBe("down");
      expect(CompassLit.DIRS[7]).toBe("out");
    });

    it("should have correct MAP for direction abbreviations", () => {
      expect(CompassLit.MAP.up).toBe("u");
      expect(CompassLit.MAP.down).toBe("d");
      expect(CompassLit.MAP.out).toBe("o");
    });
  });
});
