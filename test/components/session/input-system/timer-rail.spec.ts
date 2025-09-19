// ABOUTME: Unit tests for illthorn-timer-rail-lit composite component
// ABOUTME: Tests horizontal layout of multiple timer components with responsive behavior

import { describe, expect, it, vi } from "vitest";
import { TimerRailLit } from "../../../../src/frontend/components/session/input-system/timer-rail.lit";

describe("TimerRailLit", () => {
  const setup = () => {
    const element = document.createElement("illthorn-timer-rail-lit") as TimerRailLit;
    document.body.appendChild(element);
    return { element };
  };

  const teardown = (element: TimerRailLit) => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  };

  describe("Initialization", () => {
    it("should create element with default properties", () => {
      const { element } = setup();

      expect(element).toBeInstanceOf(TimerRailLit);
      expect(element.timers).toEqual([]);
      expect(element.compact).toBe(false);
      expect(element.showLabels).toBe(true);
      expect(element.maxTimers).toBe(6);

      teardown(element);
    });

    it("should be registered as custom element", () => {
      expect(customElements.get("illthorn-timer-rail-lit")).toBeDefined();
    });

    it("should have proper tag name", () => {
      const { element } = setup();
      expect(element.tagName.toLowerCase()).toBe("illthorn-timer-rail-lit");
      teardown(element);
    });
  });

  describe("Timer Rendering", () => {
    it("should render no timers when timers array is empty", async () => {
      const { element } = setup();
      element.timers = [];
      await element.updateComplete;

      const timerComponents = element.shadowRoot!.querySelectorAll("illthorn-timer-lit");
      expect(timerComponents.length).toBe(0);

      teardown(element);
    });

    it("should render single timer", async () => {
      const { element } = setup();
      element.timers = [
        { id: "rt", label: "RT", value: 5, maxValue: 5, type: "countdown", color: "orange" }
      ];
      await element.updateComplete;

      const timerComponents = element.shadowRoot!.querySelectorAll("illthorn-timer-lit");
      expect(timerComponents.length).toBe(1);

      const timer = timerComponents[0] as any;
      expect(timer.id).toBe("rt");
      expect(timer.label).toBe("RT");
      expect(timer.value).toBe(5);

      teardown(element);
    });

    it("should render multiple timers", async () => {
      const { element } = setup();
      element.timers = [
        { id: "rt", label: "RT", value: 3, maxValue: 5, type: "countdown", color: "orange" },
        { id: "ct", label: "CT", value: 2, maxValue: 8, type: "countdown", color: "blue" },
        { id: "spell", label: "Spell", value: 300, maxValue: 600, type: "countup", color: "purple" }
      ];
      await element.updateComplete;

      const timerComponents = element.shadowRoot!.querySelectorAll("illthorn-timer-lit");
      expect(timerComponents.length).toBe(3);

      const rtTimer = timerComponents[0] as any;
      expect(rtTimer.id).toBe("rt");
      expect(rtTimer.value).toBe(3);

      const ctTimer = timerComponents[1] as any;
      expect(ctTimer.id).toBe("ct");
      expect(ctTimer.value).toBe(2);

      const spellTimer = timerComponents[2] as any;
      expect(spellTimer.id).toBe("spell");
      expect(spellTimer.value).toBe(300);

      teardown(element);
    });

    it("should limit number of rendered timers to maxTimers", async () => {
      const { element } = setup();
      element.maxTimers = 3;
      element.timers = [
        { id: "rt", label: "RT", value: 5, maxValue: 5, type: "countdown", color: "orange" },
        { id: "ct", label: "CT", value: 8, maxValue: 8, type: "countdown", color: "blue" },
        { id: "spell1", label: "Spell 1", value: 300, maxValue: 600, type: "countup", color: "purple" },
        { id: "spell2", label: "Spell 2", value: 400, maxValue: 600, type: "countup", color: "green" },
        { id: "spell3", label: "Spell 3", value: 500, maxValue: 600, type: "countup", color: "red" }
      ];
      await element.updateComplete;

      const timerComponents = element.shadowRoot!.querySelectorAll("illthorn-timer-lit");
      expect(timerComponents.length).toBe(3);

      teardown(element);
    });
  });

  describe("Property Pass-through", () => {
    it("should pass timer properties to child components", async () => {
      const { element } = setup();
      element.timers = [
        { id: "rt", label: "Roundtime", value: 5, maxValue: 10, type: "countdown", color: "orange", urgent: true }
      ];
      element.compact = true;
      element.showLabels = false;
      await element.updateComplete;

      const timer = element.shadowRoot!.querySelector("illthorn-timer-lit") as any;
      expect(timer.id).toBe("rt");
      expect(timer.label).toBe("Roundtime");
      expect(timer.value).toBe(5);
      expect(timer.maxValue).toBe(10);
      expect(timer.type).toBe("countdown");
      expect(timer.color).toBe("orange");
      expect(timer.urgent).toBe(true);
      expect(timer.compact).toBe(true);
      expect(timer.showLabel).toBe(false);

      teardown(element);
    });

    it("should apply compact mode to all timers", async () => {
      const { element } = setup();
      element.timers = [
        { id: "rt", label: "RT", value: 5, maxValue: 5, type: "countdown", color: "orange" },
        { id: "ct", label: "CT", value: 3, maxValue: 8, type: "countdown", color: "blue" }
      ];
      element.compact = true;
      await element.updateComplete;

      const timerComponents = element.shadowRoot!.querySelectorAll("illthorn-timer-lit");
      expect(timerComponents.length).toBe(2);

      Array.from(timerComponents).forEach((timer: any) => {
        expect(timer.compact).toBe(true);
      });

      teardown(element);
    });

    it("should apply label visibility to all timers", async () => {
      const { element } = setup();
      element.timers = [
        { id: "rt", label: "RT", value: 5, maxValue: 5, type: "countdown", color: "orange" },
        { id: "ct", label: "CT", value: 3, maxValue: 8, type: "countdown", color: "blue" }
      ];
      element.showLabels = false;
      await element.updateComplete;

      const timerComponents = element.shadowRoot!.querySelectorAll("illthorn-timer-lit");

      Array.from(timerComponents).forEach((timer: any) => {
        expect(timer.showLabel).toBe(false);
      });

      teardown(element);
    });
  });

  describe("Layout and Styling", () => {
    it("should apply horizontal layout", async () => {
      const { element } = setup();
      await element.updateComplete;

      const container = element.shadowRoot!.querySelector(".timer-rail");
      expect(container).toBeDefined();
      expect(container?.classList.contains("timer-rail")).toBe(true);

      teardown(element);
    });

    it("should apply compact styling when compact is true", async () => {
      const { element } = setup();
      element.compact = true;
      await element.updateComplete;

      expect(element.classList.contains("compact")).toBe(true);

      teardown(element);
    });

    it("should handle empty state gracefully", async () => {
      const { element } = setup();
      element.timers = [];
      await element.updateComplete;

      const container = element.shadowRoot!.querySelector(".timer-rail");
      expect(container).toBeDefined();

      teardown(element);
    });
  });

  describe("Event Handling", () => {
    it("should bubble timer-expired events from child timers", async () => {
      const { element } = setup();
      const eventHandler = vi.fn();
      element.addEventListener("timer-expired", eventHandler);

      element.timers = [
        { id: "rt", label: "RT", value: 0, maxValue: 5, type: "countdown", color: "orange" }
      ];
      await element.updateComplete;

      const timer = element.shadowRoot!.querySelector("illthorn-timer-lit") as any;

      // Simulate timer expired event
      const mockEvent = new CustomEvent("timer-expired", {
        detail: { id: "rt" },
        bubbles: true
      });
      timer.dispatchEvent(mockEvent);

      expect(eventHandler).toHaveBeenCalled();
      expect(eventHandler.mock.calls[0][0].detail.id).toBe("rt");

      teardown(element);
    });

    it("should bubble timer-clicked events from child timers", async () => {
      const { element } = setup();
      const eventHandler = vi.fn();
      element.addEventListener("timer-clicked", eventHandler);

      element.timers = [
        { id: "spell", label: "Spell", value: 300, maxValue: 600, type: "countup", color: "purple" }
      ];
      await element.updateComplete;

      const timer = element.shadowRoot!.querySelector("illthorn-timer-lit") as any;

      // Simulate timer clicked event
      const mockEvent = new CustomEvent("timer-clicked", {
        detail: { id: "spell" },
        bubbles: true
      });
      timer.dispatchEvent(mockEvent);

      expect(eventHandler).toHaveBeenCalled();
      expect(eventHandler.mock.calls[0][0].detail.id).toBe("spell");

      teardown(element);
    });

    it("should not interfere with child timer events", async () => {
      const { element } = setup();
      element.timers = [
        { id: "rt", label: "RT", value: 5, maxValue: 5, type: "countdown", color: "orange" },
        { id: "ct", label: "CT", value: 3, maxValue: 8, type: "countdown", color: "blue" }
      ];
      await element.updateComplete;

      const timerComponents = element.shadowRoot!.querySelectorAll("illthorn-timer-lit");
      expect(timerComponents.length).toBe(2);

      // All timer components should be present and functional
      Array.from(timerComponents).forEach((timer) => {
        expect(timer).toBeDefined();
      });

      teardown(element);
    });
  });

  describe("Dynamic Updates", () => {
    it("should update timers when timers array changes", async () => {
      const { element } = setup();
      element.timers = [
        { id: "rt", label: "RT", value: 5, maxValue: 5, type: "countdown", color: "orange" }
      ];
      await element.updateComplete;

      let timerComponents = element.shadowRoot!.querySelectorAll("illthorn-timer-lit");
      expect(timerComponents.length).toBe(1);

      element.timers = [
        { id: "rt", label: "RT", value: 3, maxValue: 5, type: "countdown", color: "orange" },
        { id: "ct", label: "CT", value: 2, maxValue: 8, type: "countdown", color: "blue" }
      ];
      await element.updateComplete;

      timerComponents = element.shadowRoot!.querySelectorAll("illthorn-timer-lit");
      expect(timerComponents.length).toBe(2);

      teardown(element);
    });

    it("should update timer values when array items change", async () => {
      const { element } = setup();
      element.timers = [
        { id: "rt", label: "RT", value: 5, maxValue: 5, type: "countdown", color: "orange" }
      ];
      await element.updateComplete;

      let timer = element.shadowRoot!.querySelector("illthorn-timer-lit") as any;
      expect(timer.value).toBe(5);

      element.timers = [
        { id: "rt", label: "RT", value: 3, maxValue: 5, type: "countdown", color: "orange" }
      ];
      await element.updateComplete;

      timer = element.shadowRoot!.querySelector("illthorn-timer-lit") as any;
      expect(timer.value).toBe(3);

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

      expect(element.getAttribute("role")).toBe("group");
      expect(element.getAttribute("aria-label")).toBe("Timer display");

      teardown(element);
    });

    it("should maintain accessibility of child components", async () => {
      const { element } = setup();
      element.timers = [
        { id: "rt", label: "RT", value: 5, maxValue: 5, type: "countdown", color: "orange" },
        { id: "ct", label: "CT", value: 3, maxValue: 8, type: "countdown", color: "blue" }
      ];
      await element.updateComplete;

      const timerComponents = element.shadowRoot!.querySelectorAll("illthorn-timer-lit");

      // Child components should maintain their own accessibility
      Array.from(timerComponents).forEach((timer) => {
        expect(timer).toBeDefined();
      });

      teardown(element);
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined timers gracefully", async () => {
      const { element } = setup();
      element.timers = undefined as any;
      await element.updateComplete;

      const timerComponents = element.shadowRoot!.querySelectorAll("illthorn-timer-lit");
      expect(timerComponents.length).toBe(0);

      teardown(element);
    });

    it("should handle null timers gracefully", async () => {
      const { element } = setup();
      element.timers = null as any;
      await element.updateComplete;

      const timerComponents = element.shadowRoot!.querySelectorAll("illthorn-timer-lit");
      expect(timerComponents.length).toBe(0);

      teardown(element);
    });

    it("should handle invalid timer objects", async () => {
      const { element } = setup();
      element.timers = [
        { id: "valid", label: "Valid", value: 5, maxValue: 5, type: "countdown", color: "orange" },
        null as any,
        { id: "incomplete" } as any,
        undefined as any
      ];
      await element.updateComplete;

      // Should filter out invalid timers and only render valid ones
      const timerComponents = element.shadowRoot!.querySelectorAll("illthorn-timer-lit");
      expect(timerComponents.length).toBe(1);

      const validTimer = timerComponents[0] as any;
      expect(validTimer.id).toBe("valid");

      teardown(element);
    });

    it("should handle zero maxTimers", async () => {
      const { element } = setup();
      element.maxTimers = 0;
      element.timers = [
        { id: "rt", label: "RT", value: 5, maxValue: 5, type: "countdown", color: "orange" }
      ];
      await element.updateComplete;

      const timerComponents = element.shadowRoot!.querySelectorAll("illthorn-timer-lit");
      expect(timerComponents.length).toBe(0);

      teardown(element);
    });

    it("should handle negative maxTimers", async () => {
      const { element } = setup();
      element.maxTimers = -5;
      element.timers = [
        { id: "rt", label: "RT", value: 5, maxValue: 5, type: "countdown", color: "orange" }
      ];
      await element.updateComplete;

      const timerComponents = element.shadowRoot!.querySelectorAll("illthorn-timer-lit");
      expect(timerComponents.length).toBe(0);

      teardown(element);
    });
  });

  describe("Public API", () => {
    it("should add timer via addTimer() method", async () => {
      const { element } = setup();
      element.timers = [];
      await element.updateComplete;

      element.addTimer({ id: "new", label: "New", value: 10, maxValue: 10, type: "countdown", color: "red" });
      await element.updateComplete;

      expect(element.timers.length).toBe(1);
      expect(element.timers[0].id).toBe("new");

      teardown(element);
    });

    it("should remove timer via removeTimer() method", async () => {
      const { element } = setup();
      element.timers = [
        { id: "rt", label: "RT", value: 5, maxValue: 5, type: "countdown", color: "orange" },
        { id: "ct", label: "CT", value: 3, maxValue: 8, type: "countdown", color: "blue" }
      ];
      await element.updateComplete;

      element.removeTimer("rt");
      await element.updateComplete;

      expect(element.timers.length).toBe(1);
      expect(element.timers[0].id).toBe("ct");

      teardown(element);
    });

    it("should update timer via updateTimer() method", async () => {
      const { element } = setup();
      element.timers = [
        { id: "rt", label: "RT", value: 5, maxValue: 5, type: "countdown", color: "orange" }
      ];
      await element.updateComplete;

      element.updateTimer("rt", { value: 3 });
      await element.updateComplete;

      expect(element.timers[0].value).toBe(3);

      teardown(element);
    });

    it("should clear all timers via clearTimers() method", async () => {
      const { element } = setup();
      element.timers = [
        { id: "rt", label: "RT", value: 5, maxValue: 5, type: "countdown", color: "orange" },
        { id: "ct", label: "CT", value: 3, maxValue: 8, type: "countdown", color: "blue" }
      ];
      await element.updateComplete;

      element.clearTimers();
      await element.updateComplete;

      expect(element.timers.length).toBe(0);

      teardown(element);
    });

    it("should find timer via findTimer() method", async () => {
      const { element } = setup();
      element.timers = [
        { id: "rt", label: "RT", value: 5, maxValue: 5, type: "countdown", color: "orange" },
        { id: "ct", label: "CT", value: 3, maxValue: 8, type: "countdown", color: "blue" }
      ];
      await element.updateComplete;

      const foundTimer = element.findTimer("ct");
      expect(foundTimer).toBeDefined();
      expect(foundTimer?.id).toBe("ct");

      const notFound = element.findTimer("missing");
      expect(notFound).toBeUndefined();

      teardown(element);
    });
  });

  describe("Responsive Behavior", () => {
    it("should handle overflow with many timers", async () => {
      const { element } = setup();
      element.timers = Array.from({ length: 10 }, (_, i) => ({
        id: `timer${i}`,
        label: `T${i}`,
        value: i,
        maxValue: 10,
        type: "countdown" as const,
        color: "blue"
      }));
      await element.updateComplete;

      const container = element.shadowRoot!.querySelector(".timer-rail");
      expect(container).toBeDefined();

      teardown(element);
    });

    it("should adjust layout in compact mode", async () => {
      const { element } = setup();
      element.compact = true;
      element.timers = [
        { id: "rt", label: "RT", value: 5, maxValue: 5, type: "countdown", color: "orange" },
        { id: "ct", label: "CT", value: 3, maxValue: 8, type: "countdown", color: "blue" }
      ];
      await element.updateComplete;

      const timerComponents = element.shadowRoot!.querySelectorAll("illthorn-timer-lit");
      Array.from(timerComponents).forEach((timer: any) => {
        expect(timer.compact).toBe(true);
      });

      teardown(element);
    });
  });
});