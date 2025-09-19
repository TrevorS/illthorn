// ABOUTME: Unit tests for illthorn-mini-compass-lit component
// ABOUTME: Tests rendering, click events, size variants, and state management following TDD principles

import { describe, expect, it } from "vitest";
import { MiniCompassLit } from "../../../../src/frontend/components/session/input-system/mini-compass.lit";

describe("MiniCompassLit", () => {
  const setup = () => {
    const element = document.createElement("illthorn-mini-compass-lit") as MiniCompassLit;
    document.body.appendChild(element);
    return { element };
  };

  const teardown = (element: MiniCompassLit) => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  };

  describe("Initialization", () => {
    it("should create element with default properties", () => {
      const { element } = setup();

      expect(element).toBeInstanceOf(MiniCompassLit);
      expect(element.activeDirections).toEqual([]);
      expect(element.size).toBe("medium");
      expect(element.interactive).toBe(false);
      expect(element.disabled).toBe(false);

      teardown(element);
    });

    it("should be registered as custom element", () => {
      expect(customElements.get("illthorn-mini-compass-lit")).toBeDefined();
    });

    it("should have proper tag name", () => {
      const { element } = setup();
      expect(element.tagName.toLowerCase()).toBe("illthorn-mini-compass-lit");
      teardown(element);
    });
  });

  describe("Rendering", () => {
    it("should render with no active directions", async () => {
      const { element } = setup();
      await element.updateComplete;

      expect(element.shadowRoot).toBeDefined();
      const buttons = element.shadowRoot!.querySelectorAll("button");
      expect(buttons.length).toBeGreaterThan(8); // At least the main directions

      teardown(element);
    });

    it("should render with active directions highlighted", async () => {
      const { element } = setup();
      element.activeDirections = ["n", "s"];
      await element.updateComplete;

      const buttons = element.shadowRoot!.querySelectorAll("button");
      const activeButtons = element.shadowRoot!.querySelectorAll("button.active");
      expect(activeButtons.length).toBe(2);

      teardown(element);
    });

    it("should show proper direction labels", async () => {
      const { element } = setup();
      element.activeDirections = ["n", "up", "out"];
      await element.updateComplete;

      const northButton = element.shadowRoot!.querySelector('[data-direction="n"]');
      const upButton = element.shadowRoot!.querySelector('[data-direction="up"]');
      const outButton = element.shadowRoot!.querySelector('[data-direction="out"]');

      expect(northButton?.textContent?.trim()).toBe("N");
      expect(upButton?.textContent?.trim()).toBe("U");
      expect(outButton?.textContent?.trim()).toBe("O");

      teardown(element);
    });
  });

  describe("Size Variants", () => {
    it("should apply small size class", async () => {
      const { element } = setup();
      element.size = "small";
      await element.updateComplete;

      expect(element.classList.contains("size-small")).toBe(true);

      teardown(element);
    });

    it("should apply medium size class by default", async () => {
      const { element } = setup();
      await element.updateComplete;

      expect(element.classList.contains("size-medium")).toBe(true);

      teardown(element);
    });

    it("should apply large size class", async () => {
      const { element } = setup();
      element.size = "large";
      await element.updateComplete;

      expect(element.classList.contains("size-large")).toBe(true);

      teardown(element);
    });
  });

  describe("Interactive Behavior", () => {
    it("should not respond to clicks when not interactive", async () => {
      const { element } = setup();
      element.interactive = false;
      element.activeDirections = ["n"];
      await element.updateComplete;

      let clickEventFired = false;
      element.addEventListener("direction-clicked", () => {
        clickEventFired = true;
      });

      const northButton = element.shadowRoot!.querySelector('[data-direction="n"]') as HTMLButtonElement;
      northButton.click();

      expect(clickEventFired).toBe(false);

      teardown(element);
    });

    it("should emit direction-clicked event when interactive", async () => {
      const { element } = setup();
      element.interactive = true;
      element.activeDirections = ["n"];
      await element.updateComplete;

      let clickedDirection = "";
      element.addEventListener("direction-clicked", (e: Event) => {
        const customEvent = e as CustomEvent;
        clickedDirection = customEvent.detail.direction;
      });

      const northButton = element.shadowRoot!.querySelector('[data-direction="n"]') as HTMLButtonElement;
      northButton.click();

      expect(clickedDirection).toBe("n");

      teardown(element);
    });

    it("should only emit events for active directions when interactive", async () => {
      const { element } = setup();
      element.interactive = true;
      element.activeDirections = ["n"]; // Only north is active
      await element.updateComplete;

      let eventCount = 0;
      element.addEventListener("direction-clicked", () => {
        eventCount++;
      });

      // Click inactive south button
      const southButton = element.shadowRoot!.querySelector('[data-direction="s"]') as HTMLButtonElement;
      southButton.click();
      expect(eventCount).toBe(0);

      // Click active north button
      const northButton = element.shadowRoot!.querySelector('[data-direction="n"]') as HTMLButtonElement;
      northButton.click();
      expect(eventCount).toBe(1);

      teardown(element);
    });
  });

  describe("Disabled State", () => {
    it("should apply disabled styles when disabled", async () => {
      const { element } = setup();
      element.disabled = true;
      await element.updateComplete;

      expect(element.classList.contains("disabled")).toBe(true);

      teardown(element);
    });

    it("should not respond to clicks when disabled", async () => {
      const { element } = setup();
      element.disabled = true;
      element.interactive = true;
      element.activeDirections = ["n"];
      await element.updateComplete;

      let clickEventFired = false;
      element.addEventListener("direction-clicked", () => {
        clickEventFired = true;
      });

      const northButton = element.shadowRoot!.querySelector('[data-direction="n"]') as HTMLButtonElement;
      northButton.click();

      expect(clickEventFired).toBe(false);

      teardown(element);
    });
  });

  describe("Direction Updates", () => {
    it("should update active directions dynamically", async () => {
      const { element } = setup();

      // Start with north
      element.activeDirections = ["n"];
      await element.updateComplete;

      let activeButtons = element.shadowRoot!.querySelectorAll("button.active");
      expect(activeButtons.length).toBe(1);

      // Change to east and south
      element.activeDirections = ["e", "s"];
      await element.updateComplete;

      activeButtons = element.shadowRoot!.querySelectorAll("button.active");
      expect(activeButtons.length).toBe(2);

      const eastButton = element.shadowRoot!.querySelector('[data-direction="e"]');
      const southButton = element.shadowRoot!.querySelector('[data-direction="s"]');
      expect(eastButton?.classList.contains("active")).toBe(true);
      expect(southButton?.classList.contains("active")).toBe(true);

      teardown(element);
    });

    it("should handle empty active directions array", async () => {
      const { element } = setup();
      element.activeDirections = ["n", "s", "e", "w"];
      await element.updateComplete;

      // Verify some buttons are active
      let activeButtons = element.shadowRoot!.querySelectorAll("button.active");
      expect(activeButtons.length).toBe(4);

      // Clear all directions
      element.activeDirections = [];
      await element.updateComplete;

      activeButtons = element.shadowRoot!.querySelectorAll("button.active");
      expect(activeButtons.length).toBe(0);

      teardown(element);
    });

    it("should handle special exit types", async () => {
      const { element } = setup();
      element.activeDirections = ["up", "down", "out"];
      await element.updateComplete;

      const upButton = element.shadowRoot!.querySelector('[data-direction="up"]');
      const downButton = element.shadowRoot!.querySelector('[data-direction="down"]');
      const outButton = element.shadowRoot!.querySelector('[data-direction="out"]');

      expect(upButton?.classList.contains("active")).toBe(true);
      expect(downButton?.classList.contains("active")).toBe(true);
      expect(outButton?.classList.contains("active")).toBe(true);

      teardown(element);
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", async () => {
      const { element } = setup();
      await element.updateComplete;

      expect(element.getAttribute("role")).toBe("navigation");
      expect(element.getAttribute("aria-label")).toContain("compass");

      teardown(element);
    });

    it("should have accessible button labels", async () => {
      const { element } = setup();
      element.activeDirections = ["n"];
      await element.updateComplete;

      const northButton = element.shadowRoot!.querySelector('[data-direction="n"]') as HTMLButtonElement;
      const ariaLabel = northButton.getAttribute("aria-label");
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toContain("north");

      teardown(element);
    });

    it("should indicate active state in ARIA", async () => {
      const { element } = setup();
      element.activeDirections = ["n", "s"];
      await element.updateComplete;

      const northButton = element.shadowRoot!.querySelector('[data-direction="n"]') as HTMLButtonElement;
      const southButton = element.shadowRoot!.querySelector('[data-direction="s"]') as HTMLButtonElement;
      const eastButton = element.shadowRoot!.querySelector('[data-direction="e"]') as HTMLButtonElement;

      expect(northButton.getAttribute("aria-pressed")).toBe("true");
      expect(southButton.getAttribute("aria-pressed")).toBe("true");
      expect(eastButton.getAttribute("aria-pressed")).toBe("false");

      teardown(element);
    });
  });

  describe("Edge Cases", () => {
    it("should handle invalid direction names gracefully", async () => {
      const { element } = setup();
      element.activeDirections = ["n", "invalid", "s"];
      await element.updateComplete;

      // Should only activate valid directions
      const activeButtons = element.shadowRoot!.querySelectorAll("button.active");
      expect(activeButtons.length).toBe(2); // Only n and s

      teardown(element);
    });

    it("should handle duplicate directions", async () => {
      const { element } = setup();
      element.activeDirections = ["n", "n", "s", "s"];
      await element.updateComplete;

      const activeButtons = element.shadowRoot!.querySelectorAll("button.active");
      expect(activeButtons.length).toBe(2); // Only unique n and s

      teardown(element);
    });

    it("should handle case variations", async () => {
      const { element } = setup();
      element.activeDirections = ["N", "South", "EAST"];
      await element.updateComplete;

      // Component should normalize case - checking for at least some active buttons
      const activeButtons = element.shadowRoot!.querySelectorAll("button.active");
      expect(activeButtons.length).toBeGreaterThan(0);

      teardown(element);
    });
  });
});