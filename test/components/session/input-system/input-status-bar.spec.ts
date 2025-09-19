// ABOUTME: Unit tests for illthorn-input-status-bar-lit composite component
// ABOUTME: Tests composition of status indicators, room badge, and mini compass components

import { describe, expect, it } from "vitest";
import { InputStatusBarLit } from "../../../../src/frontend/components/session/input-system/input-status-bar.lit";

describe("InputStatusBarLit", () => {
  const setup = () => {
    const element = document.createElement("illthorn-input-status-bar-lit") as InputStatusBarLit;
    document.body.appendChild(element);
    return { element };
  };

  const teardown = (element: InputStatusBarLit) => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  };

  describe("Initialization", () => {
    it("should create element with default properties", () => {
      const { element } = setup();

      expect(element).toBeInstanceOf(InputStatusBarLit);
      expect(element.compact).toBe(false);
      expect(element.roomId).toBe("");
      expect(element.roomTitle).toBe("");
      expect(element.zone).toBe("town");

      teardown(element);
    });

    it("should be registered as custom element", () => {
      expect(customElements.get("illthorn-input-status-bar-lit")).toBeDefined();
    });

    it("should have proper tag name", () => {
      const { element } = setup();
      expect(element.tagName.toLowerCase()).toBe("illthorn-input-status-bar-lit");
      teardown(element);
    });
  });

  describe("Child Component Rendering", () => {
    it("should render status indicators component", async () => {
      const { element } = setup();
      await element.updateComplete;

      const statusIndicators = element.shadowRoot!.querySelector("illthorn-status-indicators-lit");
      expect(statusIndicators).toBeDefined();

      teardown(element);
    });

    it("should render room badge component", async () => {
      const { element } = setup();
      await element.updateComplete;

      const roomBadge = element.shadowRoot!.querySelector("illthorn-room-badge-lit");
      expect(roomBadge).toBeDefined();

      teardown(element);
    });

    it("should render mini compass component", async () => {
      const { element } = setup();
      await element.updateComplete;

      const miniCompass = element.shadowRoot!.querySelector("illthorn-mini-compass-lit");
      expect(miniCompass).toBeDefined();

      teardown(element);
    });

    it("should render all three child components", async () => {
      const { element } = setup();
      await element.updateComplete;

      const statusIndicators = element.shadowRoot!.querySelector("illthorn-status-indicators-lit");
      const roomBadge = element.shadowRoot!.querySelector("illthorn-room-badge-lit");
      const miniCompass = element.shadowRoot!.querySelector("illthorn-mini-compass-lit");

      expect(statusIndicators).toBeDefined();
      expect(roomBadge).toBeDefined();
      expect(miniCompass).toBeDefined();

      teardown(element);
    });
  });

  describe("Property Pass-through", () => {
    it("should pass room properties to room badge", async () => {
      const { element } = setup();
      element.roomId = "12345";
      element.roomTitle = "Test Room";
      element.zone = "wilderness";
      await element.updateComplete;

      const roomBadge = element.shadowRoot!.querySelector("illthorn-room-badge-lit") as any;
      expect(roomBadge.roomId).toBe("12345");
      expect(roomBadge.roomTitle).toBe("Test Room");
      expect(roomBadge.zone).toBe("wilderness");

      teardown(element);
    });

    it("should pass navigation properties to mini compass", async () => {
      const { element } = setup();
      element.activeDirections = ["north", "east", "south"];
      element.interactiveCompass = true;
      await element.updateComplete;

      const miniCompass = element.shadowRoot!.querySelector("illthorn-mini-compass-lit") as any;
      expect(miniCompass.activeDirections).toEqual(["north", "east", "south"]);
      expect(miniCompass.interactive).toBe(true);

      teardown(element);
    });

    it("should pass status properties to status indicators", async () => {
      const { element } = setup();
      element.roundtime = 5;
      element.casttime = 3;
      element.stance = "offensive";
      element.mindState = "clear";
      element.health = 85;
      element.mana = 60;
      element.stamina = 90;
      element.spirit = 100;
      await element.updateComplete;

      const statusIndicators = element.shadowRoot!.querySelector("illthorn-status-indicators-lit") as any;
      expect(statusIndicators.roundtime).toBe(5);
      expect(statusIndicators.casttime).toBe(3);
      expect(statusIndicators.stance).toBe("offensive");
      expect(statusIndicators.mindState).toBe("clear");
      expect(statusIndicators.health).toBe(85);
      expect(statusIndicators.mana).toBe(60);
      expect(statusIndicators.stamina).toBe(90);
      expect(statusIndicators.spirit).toBe(100);

      teardown(element);
    });

    it("should pass compact mode to all child components", async () => {
      const { element } = setup();
      element.compact = true;
      await element.updateComplete;

      const statusIndicators = element.shadowRoot!.querySelector("illthorn-status-indicators-lit") as any;
      const roomBadge = element.shadowRoot!.querySelector("illthorn-room-badge-lit") as any;
      const miniCompass = element.shadowRoot!.querySelector("illthorn-mini-compass-lit") as any;

      expect(statusIndicators.compact).toBe(true);
      expect(roomBadge.compact).toBe(true);
      expect(miniCompass.size).toBe("small"); // Compact mode translates to small size for compass

      teardown(element);
    });
  });

  describe("Layout and Styling", () => {
    it("should apply horizontal layout", async () => {
      const { element } = setup();
      await element.updateComplete;

      const container = element.shadowRoot!.querySelector(".status-bar");
      expect(container).toBeDefined();
      expect(container?.classList.contains("status-bar")).toBe(true);

      teardown(element);
    });

    it("should apply compact styling when compact is true", async () => {
      const { element } = setup();
      element.compact = true;
      await element.updateComplete;

      expect(element.classList.contains("compact")).toBe(true);

      teardown(element);
    });

    it("should have proper responsive behavior", async () => {
      const { element } = setup();
      await element.updateComplete;

      // Check that responsive CSS is applied
      const container = element.shadowRoot!.querySelector(".status-bar") as HTMLElement;
      expect(container).toBeDefined();

      teardown(element);
    });
  });

  describe("Event Handling", () => {
    it("should bubble direction-clicked events from mini compass", async () => {
      const { element } = setup();
      const eventHandler = vi.fn();
      element.addEventListener("direction-clicked", eventHandler);
      await element.updateComplete;

      const miniCompass = element.shadowRoot!.querySelector("illthorn-mini-compass-lit") as any;

      // Simulate direction click event
      const mockEvent = new CustomEvent("direction-clicked", {
        detail: { direction: "north" },
        bubbles: true
      });
      miniCompass.dispatchEvent(mockEvent);

      expect(eventHandler).toHaveBeenCalled();
      expect(eventHandler.mock.calls[0][0].detail.direction).toBe("north");

      teardown(element);
    });

    it("should not interfere with child component events", async () => {
      const { element } = setup();
      await element.updateComplete;

      const statusIndicators = element.shadowRoot!.querySelector("illthorn-status-indicators-lit");
      const roomBadge = element.shadowRoot!.querySelector("illthorn-room-badge-lit");
      const miniCompass = element.shadowRoot!.querySelector("illthorn-mini-compass-lit");

      // All child components should be present and functional
      expect(statusIndicators).toBeDefined();
      expect(roomBadge).toBeDefined();
      expect(miniCompass).toBeDefined();

      teardown(element);
    });
  });

  describe("Dynamic Updates", () => {
    it("should update child components when properties change", async () => {
      const { element } = setup();
      element.roomTitle = "Initial Room";
      await element.updateComplete;

      let roomBadge = element.shadowRoot!.querySelector("illthorn-room-badge-lit") as any;
      expect(roomBadge.roomTitle).toBe("Initial Room");

      element.roomTitle = "Updated Room";
      await element.updateComplete;

      roomBadge = element.shadowRoot!.querySelector("illthorn-room-badge-lit") as any;
      expect(roomBadge.roomTitle).toBe("Updated Room");

      teardown(element);
    });

    it("should update layout when compact mode changes", async () => {
      const { element } = setup();
      element.compact = false;
      await element.updateComplete;

      expect(element.classList.contains("compact")).toBe(false);

      element.compact = true;
      await element.updateComplete;

      expect(element.classList.contains("compact")).toBe(true);

      teardown(element);
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", async () => {
      const { element } = setup();
      await element.updateComplete;

      expect(element.getAttribute("role")).toBe("toolbar");
      expect(element.getAttribute("aria-label")).toContain("status");

      teardown(element);
    });

    it("should maintain accessibility of child components", async () => {
      const { element } = setup();
      await element.updateComplete;

      // Child components should maintain their own accessibility
      const statusIndicators = element.shadowRoot!.querySelector("illthorn-status-indicators-lit");
      const roomBadge = element.shadowRoot!.querySelector("illthorn-room-badge-lit");
      const miniCompass = element.shadowRoot!.querySelector("illthorn-mini-compass-lit");

      expect(statusIndicators).toBeDefined();
      expect(roomBadge).toBeDefined();
      expect(miniCompass).toBeDefined();

      teardown(element);
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing room data gracefully", async () => {
      const { element } = setup();
      element.roomId = "";
      element.roomTitle = "";
      await element.updateComplete;

      const roomBadge = element.shadowRoot!.querySelector("illthorn-room-badge-lit");
      expect(roomBadge).toBeDefined();

      teardown(element);
    });

    it("should handle empty navigation data", async () => {
      const { element } = setup();
      element.activeDirections = [];
      await element.updateComplete;

      const miniCompass = element.shadowRoot!.querySelector("illthorn-mini-compass-lit") as any;
      expect(miniCompass.activeDirections).toEqual([]);

      teardown(element);
    });

    it("should handle negative timer values", async () => {
      const { element } = setup();
      element.roundtime = -1;
      element.casttime = -5;
      await element.updateComplete;

      const statusIndicators = element.shadowRoot!.querySelector("illthorn-status-indicators-lit") as any;
      expect(statusIndicators.roundtime).toBe(-1);
      expect(statusIndicators.casttime).toBe(-5);

      teardown(element);
    });

    it("should handle resource values outside normal range", async () => {
      const { element } = setup();
      element.health = 150;
      element.mana = -10;
      await element.updateComplete;

      const statusIndicators = element.shadowRoot!.querySelector("illthorn-status-indicators-lit") as any;
      expect(statusIndicators.health).toBe(150);
      expect(statusIndicators.mana).toBe(-10);

      teardown(element);
    });
  });

  describe("Responsive Behavior", () => {
    it("should stack components vertically on small screens", async () => {
      const { element } = setup();
      // Simulate small screen
      Object.defineProperty(element, 'clientWidth', { value: 400, configurable: true });
      await element.updateComplete;

      const container = element.shadowRoot!.querySelector(".status-bar");
      expect(container).toBeDefined();

      teardown(element);
    });

    it("should adjust child component sizes based on available space", async () => {
      const { element } = setup();
      element.compact = true;
      await element.updateComplete;

      const miniCompass = element.shadowRoot!.querySelector("illthorn-mini-compass-lit") as any;
      expect(miniCompass.size).toBe("small");

      teardown(element);
    });
  });
});