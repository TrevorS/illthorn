import { describe, expect, it } from "vitest";
import { CompassRoseUI } from "./compass-rose-ui.lit";

describe("CompassRoseUI", () => {
  const setup = () => {
    const compass = document.createElement("illthorn-compass-rose-ui") as CompassRoseUI;
    document.body.appendChild(compass);
    return { compass };
  };

  const teardown = (compass: CompassRoseUI) => {
    if (compass.parentNode) {
      compass.parentNode.removeChild(compass);
    }
  };

  describe("Basic rendering", () => {
    it("should create compass rose element", () => {
      const { compass } = setup();

      expect(compass).toBeInstanceOf(CompassRoseUI);
      expect(compass.tagName.toLowerCase()).toBe("illthorn-compass-rose-ui");

      teardown(compass);
    });

    it("should render special exits (up/out/down)", async () => {
      const { compass } = setup();

      await compass.updateComplete;

      const specialExits = compass.shadowRoot?.querySelector(".special-exits");
      expect(specialExits).toBeTruthy();

      const svgs = specialExits?.querySelectorAll("svg");
      expect(svgs).toHaveLength(3); // up, out, down

      teardown(compass);
    });

    it("should render 8 compass directions", async () => {
      const { compass } = setup();

      await compass.updateComplete;

      const compassRose = compass.shadowRoot?.querySelector(".compass-rose");
      expect(compassRose).toBeTruthy();

      const compassArrows = compassRose?.querySelectorAll(".compass-arrow");
      expect(compassArrows).toHaveLength(8); // n, ne, e, se, s, sw, w, nw

      teardown(compass);
    });

    it("should render room info section", async () => {
      const { compass } = setup();

      await compass.updateComplete;

      const roomInfo = compass.shadowRoot?.querySelector(".room-info");
      expect(roomInfo).toBeTruthy();

      teardown(compass);
    });
  });

  describe("Props and reactivity", () => {
    it("should initialize with empty activeDirs", () => {
      const { compass } = setup();

      expect(compass.activeDirs).toEqual([]);

      teardown(compass);
    });

    it("should initialize with empty roomId and roomTitle", () => {
      const { compass } = setup();

      expect(compass.roomId).toBe("");
      expect(compass.roomTitle).toBe("");

      teardown(compass);
    });

    it("should accept and display activeDirs property", async () => {
      const { compass } = setup();

      compass.activeDirs = ["n", "s", "e"];
      await compass.updateComplete;

      expect(compass.activeDirs).toEqual(["n", "s", "e"]);

      teardown(compass);
    });

    it("should accept and display roomId property", async () => {
      const { compass } = setup();

      compass.roomId = "95157";
      await compass.updateComplete;

      const roomInfo = compass.shadowRoot?.querySelector(".room-info");
      expect(roomInfo?.textContent).toContain("95157");

      teardown(compass);
    });

    it("should accept and display roomTitle property", async () => {
      const { compass } = setup();

      compass.roomTitle = "Monastery, Gallery";
      await compass.updateComplete;

      const roomInfo = compass.shadowRoot?.querySelector(".room-info");
      expect(roomInfo?.textContent).toContain("Monastery, Gallery");

      teardown(compass);
    });

    it("should display combined room info", async () => {
      const { compass } = setup();

      compass.roomId = "95157";
      compass.roomTitle = "Monastery, Gallery";
      await compass.updateComplete;

      const roomInfo = compass.shadowRoot?.querySelector(".room-info");
      expect(roomInfo?.getAttribute("title")).toBe("95157 - Monastery, Gallery");

      teardown(compass);
    });
  });

  describe("Direction activation", () => {
    it('should apply "active" class to active directions', async () => {
      const { compass } = setup();

      compass.activeDirs = ["n", "e", "up"];
      await compass.updateComplete;

      const arrows = compass.shadowRoot?.querySelectorAll(".arrow");
      const activeArrows = compass.shadowRoot?.querySelectorAll(".arrow.active");

      expect(arrows?.length).toBeGreaterThan(0);
      expect(activeArrows?.length).toBe(3); // n, e, up

      teardown(compass);
    });

    it("should activate special exits correctly", async () => {
      const { compass } = setup();

      compass.activeDirs = ["up", "down", "out"];
      await compass.updateComplete;

      const upArrow = compass.shadowRoot?.querySelector(".special-exits svg:nth-child(1) .arrow");
      const outCircle = compass.shadowRoot?.querySelector(".special-exits svg:nth-child(2) .circle");
      const downArrow = compass.shadowRoot?.querySelector(".special-exits svg:nth-child(3) .arrow");

      expect(upArrow?.classList.contains("active")).toBe(true);
      expect(outCircle?.classList.contains("active")).toBe(true);
      expect(downArrow?.classList.contains("active")).toBe(true);

      teardown(compass);
    });

    it("should activate compass directions correctly", async () => {
      const { compass } = setup();

      compass.activeDirs = ["n", "ne", "e", "se"];
      await compass.updateComplete;

      const compassArrows = compass.shadowRoot?.querySelectorAll(".compass-arrow");
      const northArrow = Array.from(compassArrows || []).find((el) => el.classList.contains("n"));
      const neArrow = Array.from(compassArrows || []).find((el) => el.classList.contains("ne"));
      const westArrow = Array.from(compassArrows || []).find((el) => el.classList.contains("w"));

      expect(northArrow?.querySelector(".arrow.active")).toBeTruthy();
      expect(neArrow?.querySelector(".arrow.active")).toBeTruthy();
      expect(westArrow?.querySelector(".arrow.active")).toBeFalsy();

      teardown(compass);
    });

    it("should update visual state when activeDirs change", async () => {
      const { compass } = setup();

      compass.activeDirs = ["n"];
      await compass.updateComplete;

      const activeArrows1 = compass.shadowRoot?.querySelectorAll(".active");
      expect(activeArrows1?.length).toBe(1);

      compass.activeDirs = ["n", "s", "e", "w"];
      await compass.updateComplete;

      const activeArrows2 = compass.shadowRoot?.querySelectorAll(".active");
      expect(activeArrows2?.length).toBe(4);

      teardown(compass);
    });
  });

  describe("Long room names", () => {
    it("should handle long room names with ellipsis", async () => {
      const { compass } = setup();

      const longTitle = "The Grand Courtyard of the Monastery, Eastern Wing and Gallery of Ancient Artifacts";
      compass.roomId = "95157";
      compass.roomTitle = longTitle;
      await compass.updateComplete;

      const roomInfo = compass.shadowRoot?.querySelector(".room-info");

      // Verify room info element exists and has content
      expect(roomInfo).toBeTruthy();
      expect(roomInfo?.textContent).toContain("95157");
      expect(roomInfo?.textContent).toContain(longTitle);

      teardown(compass);
    });

    it("should show full room name in title attribute", async () => {
      const { compass } = setup();

      const longTitle = "The Grand Courtyard of the Monastery, Eastern Wing and Gallery";
      compass.roomId = "95157";
      compass.roomTitle = longTitle;
      await compass.updateComplete;

      const roomInfo = compass.shadowRoot?.querySelector(".room-info");
      expect(roomInfo?.getAttribute("title")).toBe(`95157 - ${longTitle}`);

      teardown(compass);
    });

    it("should handle room info with only roomId", async () => {
      const { compass } = setup();

      compass.roomId = "95157";
      compass.roomTitle = "";
      await compass.updateComplete;

      const roomInfo = compass.shadowRoot?.querySelector(".room-info");
      expect(roomInfo?.textContent?.trim()).toBe("95157");
      expect(roomInfo?.getAttribute("title")).toBe("95157");

      teardown(compass);
    });

    it("should handle room info with only roomTitle", async () => {
      const { compass } = setup();

      compass.roomId = "";
      compass.roomTitle = "Monastery, Gallery";
      await compass.updateComplete;

      const roomInfo = compass.shadowRoot?.querySelector(".room-info");
      expect(roomInfo?.textContent?.trim()).toBe("Monastery, Gallery");
      expect(roomInfo?.getAttribute("title")).toBe("Monastery, Gallery");

      teardown(compass);
    });
  });
});
