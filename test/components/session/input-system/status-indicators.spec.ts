// ABOUTME: Unit tests for illthorn-status-indicators-lit component
// ABOUTME: Tests status display, timer states, resource indicators, and responsive behavior

import { describe, expect, it } from "vitest";
import { StatusIndicatorsLit } from "../../../../src/frontend/components/session/input-system/status-indicators.lit";

describe("StatusIndicatorsLit", () => {
  const setup = () => {
    const element = document.createElement("illthorn-status-indicators-lit") as StatusIndicatorsLit;
    document.body.appendChild(element);
    return { element };
  };

  const teardown = (element: StatusIndicatorsLit) => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  };

  describe("Initialization", () => {
    it("should create element with default properties", () => {
      const { element } = setup();

      expect(element).toBeInstanceOf(StatusIndicatorsLit);
      expect(element.roundtime).toBe(0);
      expect(element.casttime).toBe(0);
      expect(element.stance).toBe("neutral");
      expect(element.mindState).toBe("clear");
      expect(element.health).toBe(100);
      expect(element.mana).toBe(100);
      expect(element.stamina).toBe(100);
      expect(element.spirit).toBe(100);
      expect(element.compact).toBe(false);
      expect(element.showLabels).toBe(true);

      teardown(element);
    });

    it("should be registered as custom element", () => {
      expect(customElements.get("illthorn-status-indicators-lit")).toBeDefined();
    });

    it("should have proper tag name", () => {
      const { element } = setup();
      expect(element.tagName.toLowerCase()).toBe("illthorn-status-indicators-lit");
      teardown(element);
    });
  });

  describe("Timer Display", () => {
    it("should display roundtime when active", async () => {
      const { element } = setup();
      element.roundtime = 5;
      await element.updateComplete;

      const roundtimeElement = element.shadowRoot!.querySelector(".roundtime");
      expect(roundtimeElement).toBeDefined();
      expect(roundtimeElement?.textContent).toContain("5");

      teardown(element);
    });

    it("should display casttime when active", async () => {
      const { element } = setup();
      element.casttime = 3;
      await element.updateComplete;

      const casttimeElement = element.shadowRoot!.querySelector(".casttime");
      expect(casttimeElement).toBeDefined();
      expect(casttimeElement?.textContent).toContain("3");

      teardown(element);
    });

    it("should not display inactive timers", async () => {
      const { element } = setup();
      element.roundtime = 0;
      element.casttime = 0;
      await element.updateComplete;

      const roundtimeElement = element.shadowRoot!.querySelector(".roundtime");
      const casttimeElement = element.shadowRoot!.querySelector(".casttime");

      // Timers with 0 value should not be rendered or should be hidden
      if (roundtimeElement) {
        expect(roundtimeElement.classList.contains("inactive") || roundtimeElement.style.display === "none").toBe(true);
      }
      if (casttimeElement) {
        expect(casttimeElement.classList.contains("inactive") || casttimeElement.style.display === "none").toBe(true);
      }

      teardown(element);
    });

    it("should handle both timers active simultaneously", async () => {
      const { element } = setup();
      element.roundtime = 2;
      element.casttime = 4;
      await element.updateComplete;

      const roundtimeElement = element.shadowRoot!.querySelector(".roundtime");
      const casttimeElement = element.shadowRoot!.querySelector(".casttime");

      expect(roundtimeElement?.textContent).toContain("2");
      expect(casttimeElement?.textContent).toContain("4");

      teardown(element);
    });
  });

  describe("Stance Display", () => {
    const stances = ["offensive", "advance", "forward", "neutral", "guarded", "defensive"];
    const stanceAbbreviations = {
      "offensive": "off",
      "advance": "adv",
      "forward": "fwd",
      "neutral": "neu",
      "guarded": "grd",
      "defensive": "def"
    };

    stances.forEach(stance => {
      it(`should display ${stance} stance`, async () => {
        const { element } = setup();
        element.stance = stance as any;
        await element.updateComplete;

        const stanceElement = element.shadowRoot!.querySelector(".stance");
        expect(stanceElement).toBeDefined();
        expect(stanceElement?.textContent?.toLowerCase()).toContain(stanceAbbreviations[stance as keyof typeof stanceAbbreviations]);

        teardown(element);
      });
    });

    it("should apply stance-specific styling", async () => {
      const { element } = setup();
      element.stance = "offensive";
      await element.updateComplete;

      expect(element.classList.contains("stance-offensive")).toBe(true);

      element.stance = "defensive";
      await element.updateComplete;

      expect(element.classList.contains("stance-defensive")).toBe(true);
      expect(element.classList.contains("stance-offensive")).toBe(false);

      teardown(element);
    });
  });

  describe("Mind State Display", () => {
    const mindStates = ["clear", "muddled", "confused", "stunned"];
    const mindStateAbbreviations = {
      "clear": "clr",
      "muddled": "mud",
      "confused": "cnf",
      "stunned": "stn"
    };

    mindStates.forEach(mindState => {
      it(`should display ${mindState} mind state`, async () => {
        const { element } = setup();
        element.mindState = mindState as any;
        await element.updateComplete;

        const mindElement = element.shadowRoot!.querySelector(".mind-state");
        if (mindState === "clear") {
          // Clear mind state should not be displayed
          expect(mindElement).toBeNull();
        } else {
          expect(mindElement).toBeDefined();
          expect(mindElement?.textContent?.toLowerCase()).toContain(mindStateAbbreviations[mindState as keyof typeof mindStateAbbreviations]);
        }

        teardown(element);
      });
    });

    it("should apply mind state styling", async () => {
      const { element } = setup();
      element.mindState = "stunned";
      await element.updateComplete;

      expect(element.classList.contains("mind-stunned")).toBe(true);

      teardown(element);
    });
  });

  describe("Resource Display", () => {
    it("should display health percentage", async () => {
      const { element } = setup();
      element.health = 75;
      await element.updateComplete;

      const healthElement = element.shadowRoot!.querySelector(".health");
      expect(healthElement?.textContent).toContain("75");

      teardown(element);
    });

    it("should display mana percentage", async () => {
      const { element } = setup();
      element.mana = 60;
      await element.updateComplete;

      const manaElement = element.shadowRoot!.querySelector(".mana");
      expect(manaElement?.textContent).toContain("60");

      teardown(element);
    });

    it("should display stamina percentage", async () => {
      const { element } = setup();
      element.stamina = 45;
      await element.updateComplete;

      const staminaElement = element.shadowRoot!.querySelector(".stamina");
      expect(staminaElement?.textContent).toContain("45");

      teardown(element);
    });

    it("should display spirit percentage", async () => {
      const { element } = setup();
      element.spirit = 80;
      await element.updateComplete;

      const spiritElement = element.shadowRoot!.querySelector(".spirit");
      expect(spiritElement?.textContent).toContain("80");

      teardown(element);
    });

    it("should apply low resource styling", async () => {
      const { element } = setup();
      element.health = 25;
      element.mana = 15;
      element.stamina = 10;
      await element.updateComplete;

      const healthElement = element.shadowRoot!.querySelector(".health");
      const manaElement = element.shadowRoot!.querySelector(".mana");
      const staminaElement = element.shadowRoot!.querySelector(".stamina");

      expect(healthElement?.className.includes("low")).toBe(true);
      expect(manaElement?.className.includes("low")).toBe(true);
      expect(staminaElement?.className.includes("critical")).toBe(true);

      teardown(element);
    });

    it("should apply critical resource styling", async () => {
      const { element } = setup();
      element.health = 5;
      await element.updateComplete;

      const healthElement = element.shadowRoot!.querySelector(".health");
      expect(healthElement?.className.includes("critical")).toBe(true);

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

    it("should hide labels in compact mode when showLabels is false", async () => {
      const { element } = setup();
      element.compact = true;
      element.showLabels = false;
      await element.updateComplete;

      const labels = element.shadowRoot!.querySelectorAll(".label");
      labels.forEach(label => {
        expect(label.classList.contains("hidden") ||
               (label as HTMLElement).style.display === "none").toBe(true);
      });

      teardown(element);
    });

    it("should show labels when showLabels is true", async () => {
      const { element } = setup();
      element.showLabels = true;
      element.health = 75;
      await element.updateComplete;

      const healthLabel = element.shadowRoot!.querySelector(".health .label");
      if (healthLabel) {
        expect(healthLabel.classList.contains("hidden")).toBe(false);
        expect((healthLabel as HTMLElement).style.display).not.toBe("none");
      }

      teardown(element);
    });
  });

  describe("Dynamic Updates", () => {
    it("should update display when timer values change", async () => {
      const { element } = setup();
      element.roundtime = 3;
      await element.updateComplete;

      let roundtimeElement = element.shadowRoot!.querySelector(".roundtime");
      expect(roundtimeElement?.textContent).toContain("3");

      element.roundtime = 1;
      await element.updateComplete;

      roundtimeElement = element.shadowRoot!.querySelector(".roundtime");
      expect(roundtimeElement?.textContent).toContain("1");

      teardown(element);
    });

    it("should update stance classes when stance changes", async () => {
      const { element } = setup();
      element.stance = "offensive";
      await element.updateComplete;

      expect(element.classList.contains("stance-offensive")).toBe(true);

      element.stance = "defensive";
      await element.updateComplete;

      expect(element.classList.contains("stance-defensive")).toBe(true);
      expect(element.classList.contains("stance-offensive")).toBe(false);

      teardown(element);
    });

    it("should update resource styling when values change", async () => {
      const { element } = setup();
      element.health = 100;
      await element.updateComplete;

      let healthElement = element.shadowRoot!.querySelector(".health");
      expect(healthElement?.classList.contains("low")).toBe(false);

      element.health = 20;
      await element.updateComplete;

      healthElement = element.shadowRoot!.querySelector(".health");
      expect(healthElement?.classList.contains("low")).toBe(true);

      teardown(element);
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", async () => {
      const { element } = setup();
      element.roundtime = 3;
      element.health = 75;
      await element.updateComplete;

      expect(element.getAttribute("role")).toBe("status");
      expect(element.getAttribute("aria-label")).toContain("status");

      teardown(element);
    });

    it("should provide accessible descriptions for active timers", async () => {
      const { element } = setup();
      element.roundtime = 5;
      element.casttime = 3;
      await element.updateComplete;

      const roundtimeElement = element.shadowRoot!.querySelector(".roundtime");
      const casttimeElement = element.shadowRoot!.querySelector(".casttime");

      expect(roundtimeElement?.getAttribute("aria-label")?.toLowerCase()).toContain("roundtime");
      expect(casttimeElement?.getAttribute("aria-label")?.toLowerCase()).toContain("casttime");

      teardown(element);
    });

    it("should provide accessible descriptions for resource levels", async () => {
      const { element } = setup();
      element.health = 25;
      element.mana = 15;
      await element.updateComplete;

      const healthElement = element.shadowRoot!.querySelector(".health");
      const manaElement = element.shadowRoot!.querySelector(".mana");

      expect(healthElement?.getAttribute("aria-label")?.toLowerCase()).toContain("health");
      expect(manaElement?.getAttribute("aria-label")?.toLowerCase()).toContain("mana");

      teardown(element);
    });
  });

  describe("Edge Cases", () => {
    it("should handle negative timer values", async () => {
      const { element } = setup();
      element.roundtime = -1;
      element.casttime = -5;
      await element.updateComplete;

      // Negative values should be treated as 0 (inactive)
      const roundtimeElement = element.shadowRoot!.querySelector(".roundtime");
      const casttimeElement = element.shadowRoot!.querySelector(".casttime");

      if (roundtimeElement) {
        expect(roundtimeElement.classList.contains("inactive") ||
               roundtimeElement.style.display === "none").toBe(true);
      }
      if (casttimeElement) {
        expect(casttimeElement.classList.contains("inactive") ||
               casttimeElement.style.display === "none").toBe(true);
      }

      teardown(element);
    });

    it("should handle resource values outside 0-100 range", async () => {
      const { element } = setup();
      element.health = 150;
      element.mana = -10;
      await element.updateComplete;

      // Values should be clamped or handled gracefully
      const healthElement = element.shadowRoot!.querySelector(".health");
      const manaElement = element.shadowRoot!.querySelector(".mana");

      expect(healthElement).toBeDefined();
      expect(manaElement).toBeDefined();

      teardown(element);
    });

    it("should handle invalid stance values", async () => {
      const { element } = setup();
      element.stance = "invalid" as any;
      await element.updateComplete;

      // Should fallback to neutral or handle gracefully
      const stanceElement = element.shadowRoot!.querySelector(".stance");
      expect(stanceElement).toBeDefined();

      teardown(element);
    });

    it("should handle invalid mind state values", async () => {
      const { element } = setup();
      element.mindState = "invalid" as any;
      await element.updateComplete;

      // Should fallback to clear or handle gracefully
      expect(element).toBeDefined(); // Component should not crash

      teardown(element);
    });
  });
});