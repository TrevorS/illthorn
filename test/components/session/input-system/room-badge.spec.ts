// ABOUTME: Unit tests for illthorn-room-badge-lit component
// ABOUTME: Tests room display, text truncation, zone colors, and responsive behavior

import { describe, expect, it } from "vitest";
import { RoomBadgeLit } from "../../../../src/frontend/components/session/input-system/room-badge.lit";

describe("RoomBadgeLit", () => {
  const setup = () => {
    const element = document.createElement("illthorn-room-badge-lit") as RoomBadgeLit;
    document.body.appendChild(element);
    return { element };
  };

  const teardown = (element: RoomBadgeLit) => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  };

  describe("Initialization", () => {
    it("should create element with default properties", () => {
      const { element } = setup();

      expect(element).toBeInstanceOf(RoomBadgeLit);
      expect(element.roomId).toBe("");
      expect(element.roomTitle).toBe("");
      expect(element.roomZone).toBe("town");
      expect(element.maxWidth).toBe(200);
      expect(element.showTooltip).toBe(true);
      expect(element.compact).toBe(false);

      teardown(element);
    });

    it("should be registered as custom element", () => {
      expect(customElements.get("illthorn-room-badge-lit")).toBeDefined();
    });

    it("should have proper tag name", () => {
      const { element } = setup();
      expect(element.tagName.toLowerCase()).toBe("illthorn-room-badge-lit");
      teardown(element);
    });
  });

  describe("Basic Rendering", () => {
    it("should render room ID and title", async () => {
      const { element } = setup();
      element.roomId = "7120";
      element.roomTitle = "Town Square Central";
      element.maxWidth = 500; // Ensure plenty of space for full title
      await element.updateComplete;

      expect(element.shadowRoot).toBeDefined();
      const roomIdElement = element.shadowRoot!.querySelector(".room-id");
      const roomTitleElement = element.shadowRoot!.querySelector(".room-title");

      expect(roomIdElement?.textContent?.trim()).toBe("7120");
      expect(roomTitleElement?.textContent?.trim()).toBe("Town Square Central");

      teardown(element);
    });

    it("should render with empty values gracefully", async () => {
      const { element } = setup();
      element.roomId = "";
      element.roomTitle = "";
      await element.updateComplete;

      const roomIdElement = element.shadowRoot!.querySelector(".room-id");
      const roomTitleElement = element.shadowRoot!.querySelector(".room-title");

      expect(roomIdElement).toBeDefined();
      expect(roomTitleElement).toBeDefined();

      teardown(element);
    });

    it("should apply zone-specific CSS classes", async () => {
      const { element } = setup();
      element.roomZone = "dungeon";
      await element.updateComplete;

      expect(element.classList.contains("zone-dungeon")).toBe(true);

      teardown(element);
    });
  });

  describe("Text Truncation", () => {
    it("should not truncate short titles", async () => {
      const { element } = setup();
      element.roomTitle = "Town Square";
      element.maxWidth = 200;
      await element.updateComplete;

      const titleElement = element.shadowRoot!.querySelector(".room-title");
      expect(titleElement?.textContent?.trim()).toBe("Town Square");
      expect(titleElement?.classList.contains("truncated")).toBe(false);

      teardown(element);
    });

    it("should truncate long titles", async () => {
      const { element } = setup();
      element.roomTitle = "The Grand Hall of the Ancient Dwarven Kings of the Eastern Mountain Range";
      element.maxWidth = 100;
      await element.updateComplete;

      // Wait an additional tick to ensure state updates are complete
      await new Promise(resolve => setTimeout(resolve, 0));
      await element.updateComplete;

      const titleElement = element.shadowRoot!.querySelector(".room-title");
      expect(titleElement?.textContent?.trim().length).toBeLessThan(element.roomTitle.length);
      expect(titleElement?.classList.contains("truncated")).toBe(true);

      teardown(element);
    });

    it("should handle bracket notation intelligently", async () => {
      const { element } = setup();
      element.roomTitle = "[Wehnimer's Landing, Town Square Central]";
      element.maxWidth = 150;
      await element.updateComplete;

      const titleElement = element.shadowRoot!.querySelector(".room-title");
      const truncatedText = titleElement?.textContent?.trim();

      // Should preserve bracket structure when truncating
      expect(truncatedText).toBeTruthy();
      if (truncatedText && truncatedText !== element.roomTitle) {
        expect(truncatedText.startsWith("[")).toBe(true);
      }

      teardown(element);
    });

    it("should preserve important words when truncating", async () => {
      const { element } = setup();
      element.roomTitle = "The Ancient Temple of Great Knowledge and Wisdom";
      element.maxWidth = 120;
      await element.updateComplete;

      const titleElement = element.shadowRoot!.querySelector(".room-title");
      const truncatedText = titleElement?.textContent?.trim();

      // Should keep important words like "Temple"
      expect(truncatedText).toContain("Temple");

      teardown(element);
    });
  });

  describe("Zone Styling", () => {
    const zones = ["town", "wilderness", "dungeon", "special"];

    zones.forEach(zone => {
      it(`should apply ${zone} zone styling`, async () => {
        const { element } = setup();
        element.roomZone = zone as any;
        await element.updateComplete;

        expect(element.classList.contains(`zone-${zone}`)).toBe(true);

        teardown(element);
      });
    });

    it("should update zone styling when zone changes", async () => {
      const { element } = setup();
      element.roomZone = "town";
      await element.updateComplete;

      expect(element.classList.contains("zone-town")).toBe(true);

      element.roomZone = "dungeon";
      await element.updateComplete;

      expect(element.classList.contains("zone-town")).toBe(false);
      expect(element.classList.contains("zone-dungeon")).toBe(true);

      teardown(element);
    });
  });

  describe("Tooltip Functionality", () => {
    it("should show tooltip when enabled and text is truncated", async () => {
      const { element } = setup();
      element.roomTitle = "Very Long Room Title That Should Be Truncated";
      element.maxWidth = 50;
      element.showTooltip = true;
      await element.updateComplete;

      // Wait an additional tick to ensure state updates are complete
      await new Promise(resolve => setTimeout(resolve, 0));
      await element.updateComplete;

      const titleElement = element.shadowRoot!.querySelector(".room-title");
      expect(titleElement?.getAttribute("title")).toBe(element.roomTitle);

      teardown(element);
    });

    it("should not show tooltip when disabled", async () => {
      const { element } = setup();
      element.roomTitle = "Very Long Room Title That Should Be Truncated";
      element.maxWidth = 50;
      element.showTooltip = false;
      await element.updateComplete;

      const titleElement = element.shadowRoot!.querySelector(".room-title");
      expect(titleElement?.getAttribute("title")).toBeFalsy();

      teardown(element);
    });

    it("should not show tooltip for short text", async () => {
      const { element } = setup();
      element.roomTitle = "Short";
      element.maxWidth = 200;
      element.showTooltip = true;
      await element.updateComplete;

      const titleElement = element.shadowRoot!.querySelector(".room-title");
      expect(titleElement?.getAttribute("title")).toBeFalsy();

      teardown(element);
    });
  });

  describe("Compact Mode", () => {
    it("should apply compact styling when enabled", async () => {
      const { element } = setup();
      element.compact = true;
      await element.updateComplete;

      expect(element.classList.contains("compact")).toBe(true);

      teardown(element);
    });

    it("should hide room ID in compact mode", async () => {
      const { element } = setup();
      element.roomId = "7120";
      element.roomTitle = "Town Square";
      element.compact = true;
      await element.updateComplete;

      // In compact mode, room ID element should not exist in the DOM
      const roomIdElement = element.shadowRoot!.querySelector(".room-id");
      expect(roomIdElement).toBeNull();

      teardown(element);
    });
  });

  describe("Responsive Behavior", () => {
    it("should adjust truncation based on maxWidth", async () => {
      const { element } = setup();
      element.roomTitle = "A Moderately Long Room Title";

      // Test with wider width
      element.maxWidth = 300;
      await element.updateComplete;
      const wideText = element.shadowRoot!.querySelector(".room-title")?.textContent?.trim();

      // Test with narrower width
      element.maxWidth = 100;
      await element.updateComplete;
      const narrowText = element.shadowRoot!.querySelector(".room-title")?.textContent?.trim();

      expect(narrowText!.length).toBeLessThanOrEqual(wideText!.length);

      teardown(element);
    });

    it("should handle very small maxWidth values", async () => {
      const { element } = setup();
      element.roomTitle = "Long Title";
      element.maxWidth = 20;
      await element.updateComplete;

      const titleElement = element.shadowRoot!.querySelector(".room-title");
      expect(titleElement?.textContent?.trim()).toBeTruthy();
      expect(titleElement?.textContent?.trim().length).toBeGreaterThan(0);

      teardown(element);
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined room title", async () => {
      const { element } = setup();
      element.roomTitle = undefined as any;
      await element.updateComplete;

      const titleElement = element.shadowRoot!.querySelector(".room-title");
      expect(titleElement?.textContent?.trim()).toBe("");

      teardown(element);
    });

    it("should handle special characters in title", async () => {
      const { element } = setup();
      element.roomTitle = "[Room, With, Commas & Symbols!]";
      await element.updateComplete;

      const titleElement = element.shadowRoot!.querySelector(".room-title");
      expect(titleElement?.textContent?.trim()).toContain("Room");
      expect(titleElement?.textContent?.trim()).toContain("Symbols");

      teardown(element);
    });

    it("should handle very long room IDs", async () => {
      const { element } = setup();
      element.roomId = "999999999999999999";
      await element.updateComplete;

      const idElement = element.shadowRoot!.querySelector(".room-id");
      expect(idElement?.textContent?.trim()).toBe("999999999999999999");

      teardown(element);
    });

    it("should handle room title with only whitespace", async () => {
      const { element } = setup();
      element.roomTitle = "   \t\n   ";
      await element.updateComplete;

      const titleElement = element.shadowRoot!.querySelector(".room-title");
      expect(titleElement?.textContent?.trim()).toBe("");

      teardown(element);
    });
  });

  describe("Dynamic Updates", () => {
    it("should update display when properties change", async () => {
      const { element } = setup();
      element.roomTitle = "Initial Title";
      await element.updateComplete;

      let titleElement = element.shadowRoot!.querySelector(".room-title");
      expect(titleElement?.textContent?.trim()).toBe("Initial Title");

      element.roomTitle = "Updated Title";
      await element.updateComplete;

      titleElement = element.shadowRoot!.querySelector(".room-title");
      expect(titleElement?.textContent?.trim()).toBe("Updated Title");

      teardown(element);
    });

    it("should recalculate truncation when maxWidth changes", async () => {
      const { element } = setup();
      element.roomTitle = "A Long Room Title That Might Be Truncated";
      element.maxWidth = 300;
      await element.updateComplete;

      const fullText = element.shadowRoot!.querySelector(".room-title")?.textContent?.trim();

      element.maxWidth = 100;
      await element.updateComplete;

      const truncatedText = element.shadowRoot!.querySelector(".room-title")?.textContent?.trim();
      expect(truncatedText!.length).toBeLessThanOrEqual(fullText!.length);

      teardown(element);
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", async () => {
      const { element } = setup();
      element.roomId = "7120";
      element.roomTitle = "Town Square";
      await element.updateComplete;

      expect(element.getAttribute("role")).toBe("region");
      expect(element.getAttribute("aria-label")).toContain("room");

      teardown(element);
    });

    it("should provide accessible text for screen readers", async () => {
      const { element } = setup();
      element.roomId = "7120";
      element.roomTitle = "Town Square Central";
      await element.updateComplete;

      const ariaLabel = element.getAttribute("aria-label");
      expect(ariaLabel).toContain("7120");
      expect(ariaLabel).toContain("Town Square Central");

      teardown(element);
    });
  });
});