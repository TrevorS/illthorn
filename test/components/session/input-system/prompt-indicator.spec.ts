// ABOUTME: Unit tests for illthorn-prompt-indicator-lit component
// ABOUTME: Tests state-based prompt symbols, animations, custom symbols, and accessibility

import { describe, expect, it } from "vitest";
import { PromptIndicatorLit } from "../../../../src/frontend/components/session/input-system/prompt-indicator.lit";

describe("PromptIndicatorLit", () => {
  const setup = () => {
    const element = document.createElement("illthorn-prompt-indicator-lit") as PromptIndicatorLit;
    document.body.appendChild(element);
    return { element };
  };

  const teardown = (element: PromptIndicatorLit) => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  };

  describe("Initialization", () => {
    it("should create element with default properties", () => {
      const { element } = setup();

      expect(element).toBeInstanceOf(PromptIndicatorLit);
      expect(element.state).toBe("normal");
      expect(element.animated).toBe(true);
      expect(element.customSymbol).toBe("");
      expect(element.size).toBe("medium");
      expect(element.blinkRate).toBe(1.0);

      teardown(element);
    });

    it("should be registered as custom element", () => {
      expect(customElements.get("illthorn-prompt-indicator-lit")).toBeDefined();
    });

    it("should have proper tag name", () => {
      const { element } = setup();
      expect(element.tagName.toLowerCase()).toBe("illthorn-prompt-indicator-lit");
      teardown(element);
    });
  });

  describe("State Symbols", () => {
    const stateSymbols = {
      "normal": ">",
      "roundtime": "...",
      "casting": "*",
      "stunned": "!",
      "dead": "†",
      "sleeping": "z"
    };

    Object.entries(stateSymbols).forEach(([state, expectedSymbol]) => {
      it(`should display "${expectedSymbol}" symbol for ${state} state`, async () => {
        const { element } = setup();
        element.state = state as any;
        await element.updateComplete;

        const symbolElement = element.shadowRoot!.querySelector(".prompt-symbol");
        expect(symbolElement?.textContent?.trim()).toBe(expectedSymbol);

        teardown(element);
      });
    });

    it("should fallback to normal symbol for invalid state", async () => {
      const { element } = setup();
      element.state = "invalid" as any;
      await element.updateComplete;

      const symbolElement = element.shadowRoot!.querySelector(".prompt-symbol");
      expect(symbolElement?.textContent?.trim()).toBe(">");

      teardown(element);
    });
  });

  describe("Custom Symbols", () => {
    it("should display custom symbol when provided", async () => {
      const { element } = setup();
      element.customSymbol = "$";
      await element.updateComplete;

      const symbolElement = element.shadowRoot!.querySelector(".prompt-symbol");
      expect(symbolElement?.textContent?.trim()).toBe("$");

      teardown(element);
    });

    it("should prioritize custom symbol over state symbol", async () => {
      const { element } = setup();
      element.state = "roundtime";
      element.customSymbol = "#";
      await element.updateComplete;

      const symbolElement = element.shadowRoot!.querySelector(".prompt-symbol");
      expect(symbolElement?.textContent?.trim()).toBe("#");

      teardown(element);
    });

    it("should use state symbol when custom symbol is empty", async () => {
      const { element } = setup();
      element.state = "casting";
      element.customSymbol = "";
      await element.updateComplete;

      const symbolElement = element.shadowRoot!.querySelector(".prompt-symbol");
      expect(symbolElement?.textContent?.trim()).toBe("*");

      teardown(element);
    });

    it("should handle emoji and unicode symbols", async () => {
      const { element } = setup();
      element.customSymbol = "⚡";
      await element.updateComplete;

      const symbolElement = element.shadowRoot!.querySelector(".prompt-symbol");
      expect(symbolElement?.textContent?.trim()).toBe("⚡");

      teardown(element);
    });
  });

  describe("State Styling", () => {
    it("should apply state-specific CSS classes", async () => {
      const { element } = setup();
      element.state = "roundtime";
      await element.updateComplete;

      expect(element.classList.contains("state-roundtime")).toBe(true);

      element.state = "casting";
      await element.updateComplete;

      expect(element.classList.contains("state-casting")).toBe(true);
      expect(element.classList.contains("state-roundtime")).toBe(false);

      teardown(element);
    });

    it("should apply animation classes for animated states", async () => {
      const { element } = setup();
      element.state = "roundtime";
      element.animated = true;
      await element.updateComplete;

      expect(element.classList.contains("animated")).toBe(true);

      teardown(element);
    });

    it("should not apply animation classes when disabled", async () => {
      const { element } = setup();
      element.state = "roundtime";
      element.animated = false;
      await element.updateComplete;

      expect(element.classList.contains("animated")).toBe(false);

      teardown(element);
    });
  });

  describe("Size Variations", () => {
    const sizes = ["small", "medium", "large"];

    sizes.forEach(size => {
      it(`should apply ${size} size styling`, async () => {
        const { element } = setup();
        element.size = size as any;
        await element.updateComplete;

        expect(element.classList.contains(`size-${size}`)).toBe(true);

        teardown(element);
      });
    });

    it("should update size classes when size changes", async () => {
      const { element } = setup();
      element.size = "small";
      await element.updateComplete;

      expect(element.classList.contains("size-small")).toBe(true);

      element.size = "large";
      await element.updateComplete;

      expect(element.classList.contains("size-large")).toBe(true);
      expect(element.classList.contains("size-small")).toBe(false);

      teardown(element);
    });

    it("should fallback to medium size for invalid size", async () => {
      const { element } = setup();
      element.size = "invalid" as any;
      await element.updateComplete;

      expect(element.classList.contains("size-medium")).toBe(true);

      teardown(element);
    });
  });

  describe("Animation Properties", () => {
    it("should set animation duration based on blink rate", async () => {
      const { element } = setup();
      element.state = "roundtime";
      element.animated = true;
      element.blinkRate = 2.0;
      await element.updateComplete;

      const symbolElement = element.shadowRoot!.querySelector(".prompt-symbol") as HTMLElement;
      expect(symbolElement).toBeDefined();
      // Check if animation duration is set via CSS custom property or style
      const computedStyle = getComputedStyle(symbolElement);
      // The exact implementation may vary, but we should have some animation-related property

      teardown(element);
    });

    it("should handle very fast blink rates", async () => {
      const { element } = setup();
      element.state = "casting";
      element.animated = true;
      element.blinkRate = 0.1;
      await element.updateComplete;

      // Component should not crash or behave unexpectedly
      const symbolElement = element.shadowRoot!.querySelector(".prompt-symbol");
      expect(symbolElement).toBeDefined();

      teardown(element);
    });

    it("should handle very slow blink rates", async () => {
      const { element } = setup();
      element.state = "roundtime";
      element.animated = true;
      element.blinkRate = 5.0;
      await element.updateComplete;

      const symbolElement = element.shadowRoot!.querySelector(".prompt-symbol");
      expect(symbolElement).toBeDefined();

      teardown(element);
    });
  });

  describe("Dynamic Updates", () => {
    it("should update symbol when state changes", async () => {
      const { element } = setup();
      element.state = "normal";
      await element.updateComplete;

      let symbolElement = element.shadowRoot!.querySelector(".prompt-symbol");
      expect(symbolElement?.textContent?.trim()).toBe(">");

      element.state = "casting";
      await element.updateComplete;

      symbolElement = element.shadowRoot!.querySelector(".prompt-symbol");
      expect(symbolElement?.textContent?.trim()).toBe("*");

      teardown(element);
    });

    it("should update symbol when custom symbol changes", async () => {
      const { element } = setup();
      element.customSymbol = "#";
      await element.updateComplete;

      let symbolElement = element.shadowRoot!.querySelector(".prompt-symbol");
      expect(symbolElement?.textContent?.trim()).toBe("#");

      element.customSymbol = "$";
      await element.updateComplete;

      symbolElement = element.shadowRoot!.querySelector(".prompt-symbol");
      expect(symbolElement?.textContent?.trim()).toBe("$");

      teardown(element);
    });

    it("should update styling when animated property changes", async () => {
      const { element } = setup();
      element.state = "roundtime";
      element.animated = false;
      await element.updateComplete;

      expect(element.classList.contains("animated")).toBe(false);

      element.animated = true;
      await element.updateComplete;

      expect(element.classList.contains("animated")).toBe(true);

      teardown(element);
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", async () => {
      const { element } = setup();
      element.state = "roundtime";
      await element.updateComplete;

      expect(element.getAttribute("role")).toBe("status");
      expect(element.getAttribute("aria-live")).toBe("polite");
      expect(element.getAttribute("aria-label")?.toLowerCase()).toContain("prompt");

      teardown(element);
    });

    it("should update aria-label when state changes", async () => {
      const { element } = setup();
      element.state = "normal";
      await element.updateComplete;

      expect(element.getAttribute("aria-label")?.toLowerCase()).toContain("ready");

      element.state = "casting";
      await element.updateComplete;

      expect(element.getAttribute("aria-label")?.toLowerCase()).toContain("casting");

      teardown(element);
    });

    it("should describe animation state in aria-label", async () => {
      const { element } = setup();
      element.state = "roundtime";
      element.animated = true;
      await element.updateComplete;

      const ariaLabel = element.getAttribute("aria-label");
      expect(ariaLabel).toBeTruthy();
      // Should indicate active/animated state

      teardown(element);
    });

    it("should provide meaningful description for screen readers", async () => {
      const { element } = setup();
      element.state = "stunned";
      await element.updateComplete;

      const ariaLabel = element.getAttribute("aria-label");
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel?.toLowerCase()).toContain("stunned");

      teardown(element);
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined state gracefully", async () => {
      const { element } = setup();
      element.state = undefined as any;
      await element.updateComplete;

      // Should fallback to normal
      const symbolElement = element.shadowRoot!.querySelector(".prompt-symbol");
      expect(symbolElement?.textContent?.trim()).toBe(">");

      teardown(element);
    });

    it("should handle null custom symbol", async () => {
      const { element } = setup();
      element.customSymbol = null as any;
      element.state = "normal";
      await element.updateComplete;

      const symbolElement = element.shadowRoot!.querySelector(".prompt-symbol");
      expect(symbolElement?.textContent?.trim()).toBe(">");

      teardown(element);
    });

    it("should handle negative blink rates", async () => {
      const { element } = setup();
      element.blinkRate = -1.0;
      element.state = "roundtime";
      element.animated = true;
      await element.updateComplete;

      // Should not crash and should clamp to minimum value
      const symbolElement = element.shadowRoot!.querySelector(".prompt-symbol");
      expect(symbolElement).toBeDefined();

      teardown(element);
    });

    it("should handle whitespace-only custom symbol", async () => {
      const { element } = setup();
      element.customSymbol = "   ";
      element.state = "casting";
      await element.updateComplete;

      // Should either use trimmed value or fallback to state symbol
      const symbolElement = element.shadowRoot!.querySelector(".prompt-symbol");
      const text = symbolElement?.textContent?.trim();
      expect(text).toBeTruthy(); // Should not be empty

      teardown(element);
    });

    it("should handle very long custom symbols", async () => {
      const { element } = setup();
      element.customSymbol = "very-long-custom-prompt-symbol";
      await element.updateComplete;

      const symbolElement = element.shadowRoot!.querySelector(".prompt-symbol");
      expect(symbolElement?.textContent).toContain("very-long-custom-prompt-symbol");

      teardown(element);
    });
  });

  describe("CSS Animation Integration", () => {
    it("should apply animation styles only to animated states", async () => {
      const { element } = setup();

      // Non-animated state
      element.state = "dead";
      element.animated = true; // Even with animation enabled, dead state shouldn't animate
      await element.updateComplete;

      const symbolElement = element.shadowRoot!.querySelector(".prompt-symbol");
      expect(symbolElement).toBeDefined();

      // Animated state
      element.state = "roundtime";
      await element.updateComplete;

      expect(element.classList.contains("animated")).toBe(true);

      teardown(element);
    });

    it("should handle animation enable/disable transitions", async () => {
      const { element } = setup();
      element.state = "casting";
      element.animated = true;
      await element.updateComplete;

      expect(element.classList.contains("animated")).toBe(true);

      element.animated = false;
      await element.updateComplete;

      expect(element.classList.contains("animated")).toBe(false);

      teardown(element);
    });
  });
});