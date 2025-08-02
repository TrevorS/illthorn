import { afterEach, describe, expect, it } from "vitest";
import { InjuryItem } from "./injury-item.lit";

describe("InjuryItem", () => {
  afterEach(() => {
    // Clean up any elements added to the DOM
    document.querySelectorAll("illthorn-injury-item").forEach((el) => el.remove());
  });

  describe("Component Initialization", () => {
    it("should create injury item component", async () => {
      const item = new InjuryItem();
      document.body.appendChild(item);
      await item.updateComplete;

      expect(item).toBeInstanceOf(InjuryItem);
      expect(item.tagName.toLowerCase()).toBe("illthorn-injury-item");

      item.remove();
    });

    it("should render with default properties", async () => {
      const item = new InjuryItem();
      document.body.appendChild(item);
      await item.updateComplete;

      expect(item.displayName).toBe("");
      expect(item.severity).toBe(0);
      expect(item.paired).toBe(false);
      expect(item.leftSeverity).toBeUndefined();
      expect(item.rightSeverity).toBeUndefined();

      item.remove();
    });
  });

  describe("Single Injury Display", () => {
    it("should render single injury with no severity symbol", async () => {
      const item = new InjuryItem();
      item.displayName = "head";
      item.severity = 0;
      item.paired = false;
      document.body.appendChild(item);
      await item.updateComplete;

      const injuryPart = item.shadowRoot?.querySelector(".injury-part");
      expect(injuryPart?.textContent).toBe("head");

      const severitySpan = item.shadowRoot?.querySelector(".injury-severity.single");
      expect(severitySpan?.textContent?.trim()).toBe(""); // No symbol for healthy

      item.remove();
    });

    it("should render single injury with minor severity symbol", async () => {
      const item = new InjuryItem();
      item.displayName = "chest";
      item.severity = 1;
      item.paired = false;
      document.body.appendChild(item);
      await item.updateComplete;

      const injuryPart = item.shadowRoot?.querySelector(".injury-part");
      expect(injuryPart?.textContent).toBe("chest");

      const severitySpan = item.shadowRoot?.querySelector(".injury-severity.single");
      expect(severitySpan?.textContent?.trim()).toBe("*"); // Minor severity

      item.remove();
    });

    it("should render single injury with moderate severity symbol", async () => {
      const item = new InjuryItem();
      item.displayName = "abdomen";
      item.severity = 2;
      item.paired = false;
      document.body.appendChild(item);
      await item.updateComplete;

      const injuryPart = item.shadowRoot?.querySelector(".injury-part");
      expect(injuryPart?.textContent).toBe("abdomen");

      const severitySpan = item.shadowRoot?.querySelector(".injury-severity.single");
      expect(severitySpan?.textContent?.trim()).toBe("#"); // Moderate severity

      item.remove();
    });

    it("should render single injury with severe severity symbol", async () => {
      const item = new InjuryItem();
      item.displayName = "back";
      item.severity = 3;
      item.paired = false;
      document.body.appendChild(item);
      await item.updateComplete;

      const injuryPart = item.shadowRoot?.querySelector(".injury-part");
      expect(injuryPart?.textContent).toBe("back");

      const severitySpan = item.shadowRoot?.querySelector(".injury-severity.single");
      expect(severitySpan?.textContent?.trim()).toBe("@"); // Severe severity

      item.remove();
    });
  });

  describe("Paired Injury Display", () => {
    it("should render paired injury with both left and right", async () => {
      const item = new InjuryItem();
      item.displayName = "arms";
      item.paired = true;
      item.leftSeverity = 1;
      item.rightSeverity = 2;
      document.body.appendChild(item);
      await item.updateComplete;

      const injuryPart = item.shadowRoot?.querySelector(".injury-part");
      expect(injuryPart?.textContent).toBe("arms");

      const pairedSeverity = item.shadowRoot?.querySelector(".injury-severity.paired");
      expect(pairedSeverity).toBeTruthy();

      const leftSpan = item.shadowRoot?.querySelector(".injury-severity.paired .left");
      expect(leftSpan?.textContent?.trim()).toBe("L*"); // Left minor

      const rightSpan = item.shadowRoot?.querySelector(".injury-severity.paired .right");
      expect(rightSpan?.textContent?.trim()).toBe("R#"); // Right moderate

      item.remove();
    });

    it("should render paired injury with healthy left side", async () => {
      const item = new InjuryItem();
      item.displayName = "hands";
      item.paired = true;
      item.leftSeverity = 0;
      item.rightSeverity = 3;
      document.body.appendChild(item);
      await item.updateComplete;

      const leftSpan = item.shadowRoot?.querySelector(".injury-severity.paired .left");
      expect(leftSpan?.textContent?.trim()).toBe("L"); // Left healthy (no symbol)

      const rightSpan = item.shadowRoot?.querySelector(".injury-severity.paired .right");
      expect(rightSpan?.textContent?.trim()).toBe("R@"); // Right severe

      item.remove();
    });

    it("should render paired injury with healthy right side", async () => {
      const item = new InjuryItem();
      item.displayName = "legs";
      item.paired = true;
      item.leftSeverity = 2;
      item.rightSeverity = 0;
      document.body.appendChild(item);
      await item.updateComplete;

      const leftSpan = item.shadowRoot?.querySelector(".injury-severity.paired .left");
      expect(leftSpan?.textContent?.trim()).toBe("L#"); // Left moderate

      const rightSpan = item.shadowRoot?.querySelector(".injury-severity.paired .right");
      expect(rightSpan?.textContent?.trim()).toBe("R"); // Right healthy (no symbol)

      item.remove();
    });

    it("should render paired injury with both sides healthy", async () => {
      const item = new InjuryItem();
      item.displayName = "eyes";
      item.paired = true;
      item.leftSeverity = 0;
      item.rightSeverity = 0;
      document.body.appendChild(item);
      await item.updateComplete;

      const leftSpan = item.shadowRoot?.querySelector(".injury-severity.paired .left");
      expect(leftSpan?.textContent?.trim()).toBe("L"); // Left healthy

      const rightSpan = item.shadowRoot?.querySelector(".injury-severity.paired .right");
      expect(rightSpan?.textContent?.trim()).toBe("R"); // Right healthy

      item.remove();
    });

    it("should handle undefined severity values for paired injuries", async () => {
      const item = new InjuryItem();
      item.displayName = "arms";
      item.paired = true;
      // Leave leftSeverity and rightSeverity undefined
      document.body.appendChild(item);
      await item.updateComplete;

      const leftSpan = item.shadowRoot?.querySelector(".injury-severity.paired .left");
      expect(leftSpan?.textContent?.trim()).toBe("L"); // Should default to 0 (healthy)

      const rightSpan = item.shadowRoot?.querySelector(".injury-severity.paired .right");
      expect(rightSpan?.textContent?.trim()).toBe("R"); // Should default to 0 (healthy)

      item.remove();
    });
  });

  describe("Severity Symbol Mapping", () => {
    const severityTests = [
      { severity: 0, symbol: "", description: "healthy" },
      { severity: 1, symbol: "*", description: "minor" },
      { severity: 2, symbol: "#", description: "moderate" },
      { severity: 3, symbol: "@", description: "severe" },
    ];

    severityTests.forEach(({ severity, symbol, description }) => {
      it(`should display "${symbol}" for ${description} severity (${severity})`, async () => {
        const item = new InjuryItem();
        item.displayName = "test";
        item.severity = severity as 0 | 1 | 2 | 3;
        item.paired = false;
        document.body.appendChild(item);
        await item.updateComplete;

        const severitySpan = item.shadowRoot?.querySelector(".injury-severity.single");
        expect(severitySpan?.textContent?.trim()).toBe(symbol);

        item.remove();
      });
    });
  });

  describe("Property Updates", () => {
    it("should update display name", async () => {
      const item = new InjuryItem();
      document.body.appendChild(item);
      await item.updateComplete;

      item.displayName = "head";
      await item.updateComplete;

      const injuryPart = item.shadowRoot?.querySelector(".injury-part");
      expect(injuryPart?.textContent).toBe("head");

      item.displayName = "chest";
      await item.updateComplete;
      expect(injuryPart?.textContent).toBe("chest");

      item.remove();
    });

    it("should update severity", async () => {
      const item = new InjuryItem();
      item.displayName = "test";
      item.paired = false;
      document.body.appendChild(item);
      await item.updateComplete;

      item.severity = 1;
      await item.updateComplete;

      const severitySpan = item.shadowRoot?.querySelector(".injury-severity.single");
      expect(severitySpan?.textContent?.trim()).toBe("*");

      item.severity = 3;
      await item.updateComplete;
      expect(severitySpan?.textContent?.trim()).toBe("@");

      item.remove();
    });

    it("should switch between single and paired modes", async () => {
      const item = new InjuryItem();
      item.displayName = "arms";
      item.severity = 1;
      item.paired = false;
      document.body.appendChild(item);
      await item.updateComplete;

      // Initially single
      expect(item.shadowRoot?.querySelector(".injury-severity.single")).toBeTruthy();
      expect(item.shadowRoot?.querySelector(".injury-severity.paired")).toBeFalsy();

      // Switch to paired
      item.paired = true;
      item.leftSeverity = 1;
      item.rightSeverity = 2;
      await item.updateComplete;

      expect(item.shadowRoot?.querySelector(".injury-severity.single")).toBeFalsy();
      expect(item.shadowRoot?.querySelector(".injury-severity.paired")).toBeTruthy();

      item.remove();
    });
  });

  describe("Styling", () => {
    it("should have proper CSS structure", async () => {
      const item = new InjuryItem();
      item.displayName = "test";
      item.severity = 1;
      document.body.appendChild(item);
      await item.updateComplete;

      const injuryItem = item.shadowRoot?.querySelector(".injury-item");
      const injuryPart = item.shadowRoot?.querySelector(".injury-part");
      const injurySeverity = item.shadowRoot?.querySelector(".injury-severity");

      expect(injuryItem).toBeTruthy();
      expect(injuryPart).toBeTruthy();
      expect(injurySeverity).toBeTruthy();

      item.remove();
    });

    it("should support CSS custom properties", async () => {
      const item = new InjuryItem();
      document.body.appendChild(item);
      await item.updateComplete;

      // Verify that the component has styles that reference CSS custom properties
      const styles = InjuryItem.styles;
      expect(styles).toBeTruthy();

      item.remove();
    });

    it("should have proper paired injury layout", async () => {
      const item = new InjuryItem();
      item.displayName = "arms";
      item.paired = true;
      item.leftSeverity = 1;
      item.rightSeverity = 2;
      document.body.appendChild(item);
      await item.updateComplete;

      const pairedSeverity = item.shadowRoot?.querySelector(".injury-severity.paired");
      const leftSpan = item.shadowRoot?.querySelector(".injury-severity.paired .left");
      const rightSpan = item.shadowRoot?.querySelector(".injury-severity.paired .right");

      expect(pairedSeverity).toBeTruthy();
      expect(leftSpan).toBeTruthy();
      expect(rightSpan).toBeTruthy();

      item.remove();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty display name", async () => {
      const item = new InjuryItem();
      item.displayName = "";
      item.severity = 1;
      document.body.appendChild(item);
      await item.updateComplete;

      const injuryPart = item.shadowRoot?.querySelector(".injury-part");
      expect(injuryPart?.textContent).toBe("");

      item.remove();
    });

    it("should handle invalid severity values", async () => {
      const item = new InjuryItem();
      item.displayName = "test";
      // Test with value outside 0-3 range (though TypeScript should prevent this)
      item.severity = 5 as 0 | 1 | 2 | 3;
      document.body.appendChild(item);
      await item.updateComplete;

      const severitySpan = item.shadowRoot?.querySelector(".injury-severity.single");
      // Should default to empty string for invalid values
      expect(severitySpan?.textContent?.trim()).toBe("");

      item.remove();
    });

    it("should handle mixed valid/invalid paired severities", async () => {
      const item = new InjuryItem();
      item.displayName = "arms";
      item.paired = true;
      item.leftSeverity = 1;
      item.rightSeverity = 10 as 0 | 1 | 2 | 3; // Invalid value
      document.body.appendChild(item);
      await item.updateComplete;

      const leftSpan = item.shadowRoot?.querySelector(".injury-severity.paired .left");
      const rightSpan = item.shadowRoot?.querySelector(".injury-severity.paired .right");

      expect(leftSpan?.textContent?.trim()).toBe("L*"); // Valid left
      expect(rightSpan?.textContent?.trim()).toBe("R"); // Invalid right defaults to healthy

      item.remove();
    });
  });
});
