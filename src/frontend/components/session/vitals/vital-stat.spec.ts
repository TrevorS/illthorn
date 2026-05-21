// ABOUTME: Test suite for VitalStat component verifying progress bar rendering, threshold styling, and accessibility
// ABOUTME: Tests individual VitalStat component functionality without container dependencies
import { afterEach, describe, expect, it } from "vitest";
import { VitalStat } from "./vital-stat.lit";

describe("VitalStat Component", () => {
  afterEach(() => {
    // Clean up any elements added to the DOM
    document.querySelectorAll("illthorn-vital-stat").forEach((el) => {
      el.remove();
    });
  });

  describe("Basic Rendering", () => {
    it("should render with label, value, and percent", async () => {
      const vitalStat = new VitalStat();
      vitalStat.label = "health";
      vitalStat.value = "50/60";
      vitalStat.percent = 83;

      document.body.appendChild(vitalStat);
      await vitalStat.updateComplete;

      const shadowRoot = vitalStat.shadowRoot;
      expect(shadowRoot?.querySelector(".vital-label")?.textContent).toBe("health");
      expect(shadowRoot?.querySelector(".vital-value")?.textContent).toBe("50/60");

      // Check for Shoelace progress bar
      const progressBar = shadowRoot?.querySelector("sl-progress-bar");
      expect(progressBar).toBeTruthy();
      expect(progressBar?.getAttribute("value")).toBe("83");

      vitalStat.remove();
    });

    it("should render progress bar with full percentage for 100% vitals", async () => {
      const vitalStat = new VitalStat();
      vitalStat.label = "health";
      vitalStat.value = "74/74";
      vitalStat.percent = 100;

      document.body.appendChild(vitalStat);
      await vitalStat.updateComplete;

      const progressBar = vitalStat.shadowRoot?.querySelector("sl-progress-bar");
      expect(progressBar?.getAttribute("value")).toBe("100");
      expect(progressBar?.classList.contains("vital-high")).toBe(true);

      vitalStat.remove();
    });

    it("should handle indeterminate state properly", async () => {
      const vitalStat = new VitalStat();
      vitalStat.label = "health";
      vitalStat.value = undefined;
      vitalStat.percent = undefined;

      document.body.appendChild(vitalStat);
      await vitalStat.updateComplete;

      const shadowRoot = vitalStat.shadowRoot;
      expect(shadowRoot?.querySelector(".vital-value")?.textContent).toBe("...");
      expect(shadowRoot?.querySelector(".vital-value")?.classList.contains("indeterminate")).toBe(true);

      const progressBar = shadowRoot?.querySelector("sl-progress-bar");
      expect(progressBar?.hasAttribute("indeterminate")).toBe(true);

      vitalStat.remove();
    });

    it("should render with default empty values", async () => {
      const vitalStat = new VitalStat();

      document.body.appendChild(vitalStat);
      await vitalStat.updateComplete;

      expect(vitalStat.label).toBe("");
      expect(vitalStat.value).toBe(undefined);
      expect(vitalStat.percent).toBe(undefined);

      vitalStat.remove();
    });
  });

  describe("Threshold-based CSS Classes", () => {
    it("should apply percentage-based CSS classes for low threshold", async () => {
      const vitalStat = new VitalStat();
      vitalStat.percent = 25;

      document.body.appendChild(vitalStat);
      await vitalStat.updateComplete;

      expect(vitalStat.hasAttribute("low")).toBe(true);
      expect(vitalStat.hasAttribute("medium")).toBe(false);
      expect(vitalStat.hasAttribute("high")).toBe(false);

      vitalStat.remove();
    });

    it("should apply percentage-based CSS classes for medium threshold", async () => {
      const vitalStat = new VitalStat();
      vitalStat.percent = 50;

      document.body.appendChild(vitalStat);
      await vitalStat.updateComplete;

      expect(vitalStat.hasAttribute("low")).toBe(false);
      expect(vitalStat.hasAttribute("medium")).toBe(true);
      expect(vitalStat.hasAttribute("high")).toBe(false);

      vitalStat.remove();
    });

    it("should apply percentage-based CSS classes for high threshold", async () => {
      const vitalStat = new VitalStat();
      vitalStat.percent = 75;

      document.body.appendChild(vitalStat);
      await vitalStat.updateComplete;

      expect(vitalStat.hasAttribute("low")).toBe(false);
      expect(vitalStat.hasAttribute("medium")).toBe(false);
      expect(vitalStat.hasAttribute("high")).toBe(true);

      vitalStat.remove();
    });

    it("should apply high threshold for indeterminate state", async () => {
      const vitalStat = new VitalStat();

      document.body.appendChild(vitalStat);
      await vitalStat.updateComplete;

      // First set a defined value to trigger a change
      vitalStat.percent = 50;
      await vitalStat.updateComplete;

      // Then set to undefined for indeterminate state
      vitalStat.percent = undefined;
      await vitalStat.updateComplete;

      expect(vitalStat.hasAttribute("high")).toBe(true);
      expect(vitalStat.hasAttribute("low")).toBe(false);
      expect(vitalStat.hasAttribute("medium")).toBe(false);

      vitalStat.remove();
    });

    it("should apply correct threshold class to progress bar", async () => {
      const vitalStat = new VitalStat();
      vitalStat.percent = 25; // Low threshold

      document.body.appendChild(vitalStat);
      await vitalStat.updateComplete;

      const progressBar = vitalStat.shadowRoot?.querySelector("sl-progress-bar");
      expect(progressBar?.classList.contains("vital-low")).toBe(true);

      vitalStat.remove();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible label for screen readers", async () => {
      const vitalStat = new VitalStat();
      vitalStat.label = "health";
      vitalStat.value = "50/60";
      vitalStat.percent = 83;

      document.body.appendChild(vitalStat);
      await vitalStat.updateComplete;

      const progressBar = vitalStat.shadowRoot?.querySelector("sl-progress-bar");
      expect(progressBar?.getAttribute("label")).toBe("health: 50/60");

      vitalStat.remove();
    });

    it("should update data-vital attribute based on label", async () => {
      const vitalStat = new VitalStat();
      vitalStat.label = "health";

      document.body.appendChild(vitalStat);
      await vitalStat.updateComplete;

      expect(vitalStat.getAttribute("data-vital")).toBe("health");

      vitalStat.remove();
    });

    it("should handle accessible label with indeterminate value", async () => {
      const vitalStat = new VitalStat();
      vitalStat.label = "mana";
      vitalStat.value = undefined;

      document.body.appendChild(vitalStat);
      await vitalStat.updateComplete;

      const progressBar = vitalStat.shadowRoot?.querySelector("sl-progress-bar");
      expect(progressBar?.getAttribute("label")).toBe("mana: undefined");

      vitalStat.remove();
    });
  });

  describe("Vital-specific Styling", () => {
    it("should apply stat-specific color classes", async () => {
      const testCases = [
        { label: "health", expectedClass: "vital-type-health" },
        { label: "mana", expectedClass: "vital-type-mana" },
        { label: "stamina", expectedClass: "vital-type-stamina" },
        { label: "spirit", expectedClass: "vital-type-spirit" },
        { label: "mind", expectedClass: "vital-type-mind" },
      ];

      for (const testCase of testCases) {
        const vitalStat = new VitalStat();
        vitalStat.label = testCase.label;
        vitalStat.value = "100/100";
        vitalStat.percent = 100;

        document.body.appendChild(vitalStat);
        await vitalStat.updateComplete;

        const progressBar = vitalStat.shadowRoot?.querySelector("sl-progress-bar");
        expect(progressBar?.classList.contains(testCase.expectedClass)).toBe(true);
        expect(progressBar?.classList.contains("vital-high")).toBe(true);

        vitalStat.remove();
      }
    });

    it("should apply inline theme variable styles for different vital types", async () => {
      const testCases = [
        { label: "health", expectedVar: "var(--color-vital-health)" },
        { label: "mana", expectedVar: "var(--color-vital-mana)" },
        { label: "stamina", expectedVar: "var(--color-vital-stamina)" },
        { label: "spirit", expectedVar: "var(--color-vital-spirit)" },
        { label: "mind", expectedVar: "var(--color-vital-mind)" },
      ];

      for (const testCase of testCases) {
        const vitalStat = new VitalStat();
        vitalStat.label = testCase.label;
        vitalStat.value = "100/100";
        vitalStat.percent = 100;

        document.body.appendChild(vitalStat);
        await vitalStat.updateComplete;

        const progressBar = vitalStat.shadowRoot?.querySelector("sl-progress-bar");
        const style = progressBar?.getAttribute("style");
        expect(style).toContain(`--indicator-color: ${testCase.expectedVar}`);

        vitalStat.remove();
      }
    });

    it("should use critical theme variable for low vitals", async () => {
      const vitalStat = new VitalStat();
      vitalStat.label = "health";
      vitalStat.value = "5/100";
      vitalStat.percent = 5; // Low threshold

      document.body.appendChild(vitalStat);
      await vitalStat.updateComplete;

      const progressBar = vitalStat.shadowRoot?.querySelector("sl-progress-bar");
      const style = progressBar?.getAttribute("style");
      expect(style).toContain("--indicator-color: var(--color-vital-critical)");

      vitalStat.remove();
    });

    it("should use appropriate theme variable for indeterminate state", async () => {
      const vitalStat = new VitalStat();
      vitalStat.label = "health";
      vitalStat.value = undefined;
      vitalStat.percent = undefined;

      document.body.appendChild(vitalStat);
      await vitalStat.updateComplete;

      const progressBar = vitalStat.shadowRoot?.querySelector("sl-progress-bar");
      const style = progressBar?.getAttribute("style");
      expect(style).toContain("--indicator-color: var(--color-vital-health)");

      vitalStat.remove();
    });
  });

  describe("Component Lifecycle", () => {
    it("should handle property updates correctly", async () => {
      const vitalStat = new VitalStat();
      vitalStat.label = "health";
      vitalStat.value = "50/100";
      vitalStat.percent = 50;

      document.body.appendChild(vitalStat);
      await vitalStat.updateComplete;

      // Update properties
      vitalStat.percent = 25;
      await vitalStat.updateComplete;

      expect(vitalStat.hasAttribute("low")).toBe(true);

      const progressBar = vitalStat.shadowRoot?.querySelector("sl-progress-bar");
      expect(progressBar?.getAttribute("value")).toBe("25");

      vitalStat.remove();
    });

    it("should update label and data-vital synchronously", async () => {
      const vitalStat = new VitalStat();
      vitalStat.label = "health";

      document.body.appendChild(vitalStat);
      await vitalStat.updateComplete;

      expect(vitalStat.getAttribute("data-vital")).toBe("health");

      vitalStat.label = "mana";
      await vitalStat.updateComplete;

      expect(vitalStat.getAttribute("data-vital")).toBe("mana");

      vitalStat.remove();
    });

    it("should handle rapid property changes", async () => {
      const vitalStat = new VitalStat();

      document.body.appendChild(vitalStat);
      await vitalStat.updateComplete;

      // Rapid changes
      vitalStat.percent = 100;
      vitalStat.percent = 50;
      vitalStat.percent = 10;
      await vitalStat.updateComplete;

      expect(vitalStat.hasAttribute("low")).toBe(true);
      expect(vitalStat.hasAttribute("medium")).toBe(false);
      expect(vitalStat.hasAttribute("high")).toBe(false);

      vitalStat.remove();
    });

    it("should cleanup properly on disconnect", () => {
      const vitalStat = new VitalStat();

      expect(() => {
        vitalStat.remove();
      }).not.toThrow();
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero percent vitals correctly", async () => {
      const vitalStat = new VitalStat();
      vitalStat.label = "health";
      vitalStat.value = "0/100";
      vitalStat.percent = 0;

      document.body.appendChild(vitalStat);
      await vitalStat.updateComplete;

      const progressBar = vitalStat.shadowRoot?.querySelector("sl-progress-bar");
      expect(progressBar?.getAttribute("value")).toBe("0");
      expect(vitalStat.hasAttribute("low")).toBe(true);

      vitalStat.remove();
    });

    it("should handle negative percent values", async () => {
      const vitalStat = new VitalStat();
      vitalStat.percent = -5;

      document.body.appendChild(vitalStat);
      await vitalStat.updateComplete;

      expect(vitalStat.hasAttribute("low")).toBe(true);

      const progressBar = vitalStat.shadowRoot?.querySelector("sl-progress-bar");
      expect(progressBar?.getAttribute("value")).toBe("-5");

      vitalStat.remove();
    });

    it("should handle percent values over 100", async () => {
      const vitalStat = new VitalStat();
      vitalStat.percent = 150;

      document.body.appendChild(vitalStat);
      await vitalStat.updateComplete;

      expect(vitalStat.hasAttribute("high")).toBe(true);

      const progressBar = vitalStat.shadowRoot?.querySelector("sl-progress-bar");
      expect(progressBar?.getAttribute("value")).toBe("150");

      vitalStat.remove();
    });

    it("should handle null percent values as indeterminate", async () => {
      const vitalStat = new VitalStat();

      document.body.appendChild(vitalStat);
      await vitalStat.updateComplete;

      // First set a defined value to trigger a change
      vitalStat.percent = 50;
      await vitalStat.updateComplete;

      // Then set to null for indeterminate state
      vitalStat.percent = null as unknown as number | undefined;
      await vitalStat.updateComplete;

      const progressBar = vitalStat.shadowRoot?.querySelector("sl-progress-bar");
      expect(progressBar?.hasAttribute("indeterminate")).toBe(true);
      expect(vitalStat.hasAttribute("high")).toBe(true);

      vitalStat.remove();
    });
  });

  describe("TypeScript Integration", () => {
    it("should be properly registered in HTMLElementTagNameMap", () => {
      const element = document.createElement("illthorn-vital-stat");
      expect(element).toBeInstanceOf(VitalStat);
    });

    it("should have proper TypeScript types", () => {
      const vitalStat = new VitalStat();
      const stat: VitalStat = vitalStat;
      expect(stat).toBeTruthy();
    });

    it("should handle undefined and string value types correctly", () => {
      const vitalStat = new VitalStat();

      vitalStat.value = "100/100";
      expect(typeof vitalStat.value).toBe("string");

      vitalStat.value = undefined;
      expect(vitalStat.value).toBe(undefined);
    });
  });
});
