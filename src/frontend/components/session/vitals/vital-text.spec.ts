// ABOUTME: Test suite for VitalText component verifying text-only vital display and data attributes
// ABOUTME: Tests individual VitalText component functionality for stance, encumbrance, and other text vitals
import { afterEach, describe, expect, it } from "vitest";
import { VitalText } from "./vital-text.lit";

describe("VitalText Component", () => {
  afterEach(() => {
    // Clean up any elements added to the DOM
    document.querySelectorAll("illthorn-vital-text").forEach((el) => el.remove());
  });

  describe("Basic Rendering", () => {
    it("should render with label and value", async () => {
      const vitalText = new VitalText();
      vitalText.label = "stance";
      vitalText.value = "defensive";

      document.body.appendChild(vitalText);
      await vitalText.updateComplete;

      const shadowRoot = vitalText.shadowRoot;
      expect(shadowRoot?.querySelector(".vital-label")?.textContent).toBe("stance");
      expect(shadowRoot?.querySelector(".vital-value")?.textContent).toBe("defensive");

      vitalText.remove();
    });

    it("should render with empty value", async () => {
      const vitalText = new VitalText();
      vitalText.label = "stance";
      vitalText.value = "";

      document.body.appendChild(vitalText);
      await vitalText.updateComplete;

      const shadowRoot = vitalText.shadowRoot;
      expect(shadowRoot?.querySelector(".vital-label")?.textContent).toBe("stance");
      expect(shadowRoot?.querySelector(".vital-value")?.textContent).toBe("");

      vitalText.remove();
    });

    it("should render with default empty values", async () => {
      const vitalText = new VitalText();

      document.body.appendChild(vitalText);
      await vitalText.updateComplete;

      expect(vitalText.label).toBe("");
      expect(vitalText.value).toBe("");

      vitalText.remove();
    });

    it("should have proper CSS layout structure", async () => {
      const vitalText = new VitalText();
      vitalText.label = "encumbrance";
      vitalText.value = "light";

      document.body.appendChild(vitalText);
      await vitalText.updateComplete;

      const shadowRoot = vitalText.shadowRoot;
      const vitalRow = shadowRoot?.querySelector(".vital-row");
      expect(vitalRow).toBeTruthy();

      const label = shadowRoot?.querySelector(".vital-label");
      const value = shadowRoot?.querySelector(".vital-value");
      expect(label).toBeTruthy();
      expect(value).toBeTruthy();

      vitalText.remove();
    });
  });

  describe("Data Attributes", () => {
    it("should update data-vital attribute based on label", async () => {
      const vitalText = new VitalText();
      vitalText.label = "stance";

      document.body.appendChild(vitalText);
      await vitalText.updateComplete;

      expect(vitalText.getAttribute("data-vital")).toBe("stance");

      vitalText.remove();
    });

    it("should set inverted attribute for encumbrance", async () => {
      const vitalText = new VitalText();
      vitalText.label = "encumbrance";

      document.body.appendChild(vitalText);
      await vitalText.updateComplete;

      expect(vitalText.hasAttribute("inverted")).toBe(true);

      vitalText.remove();
    });

    it("should not set inverted attribute for non-encumbrance vitals", async () => {
      const vitals = ["stance", "level", "experience", "silver"];

      for (const vital of vitals) {
        const vitalText = new VitalText();
        vitalText.label = vital;

        document.body.appendChild(vitalText);
        await vitalText.updateComplete;

        expect(vitalText.hasAttribute("inverted")).toBe(false);

        vitalText.remove();
      }
    });

    it("should update data-vital when label changes", async () => {
      const vitalText = new VitalText();
      vitalText.label = "stance";

      document.body.appendChild(vitalText);
      await vitalText.updateComplete;

      expect(vitalText.getAttribute("data-vital")).toBe("stance");

      vitalText.label = "encumbrance";
      await vitalText.updateComplete;

      expect(vitalText.getAttribute("data-vital")).toBe("encumbrance");
      expect(vitalText.hasAttribute("inverted")).toBe(true);

      vitalText.remove();
    });
  });

  describe("Styling", () => {
    it("should have proper CSS styles defined", () => {
      expect(VitalText.styles).toBeTruthy();

      const stylesText = VitalText.styles.toString();
      expect(stylesText).toContain(":host");
      expect(stylesText).toContain("display: block");
    });

    it("should apply proper layout classes", async () => {
      const vitalText = new VitalText();
      vitalText.label = "stance";
      vitalText.value = "offensive";

      document.body.appendChild(vitalText);
      await vitalText.updateComplete;

      const shadowRoot = vitalText.shadowRoot;
      const vitalRow = shadowRoot?.querySelector(".vital-row");
      const label = shadowRoot?.querySelector(".vital-label");
      const value = shadowRoot?.querySelector(".vital-value");

      expect(vitalRow?.classList.contains("vital-row")).toBe(true);
      expect(label?.classList.contains("vital-label")).toBe(true);
      expect(value?.classList.contains("vital-value")).toBe(true);

      vitalText.remove();
    });

    it("should use text primary color variables", () => {
      const stylesText = VitalText.styles.toString();
      expect(stylesText).toContain("var(--color-text-primary");
    });
  });

  describe("Common Vital Types", () => {
    it("should handle stance values correctly", async () => {
      const stances = ["offensive", "defensive", "guarded", "neutral"];

      for (const stance of stances) {
        const vitalText = new VitalText();
        vitalText.label = "stance";
        vitalText.value = stance;

        document.body.appendChild(vitalText);
        await vitalText.updateComplete;

        expect(vitalText.shadowRoot?.querySelector(".vital-value")?.textContent).toBe(stance);
        expect(vitalText.hasAttribute("inverted")).toBe(false);

        vitalText.remove();
      }
    });

    it("should handle encumbrance values correctly", async () => {
      const encumbrances = ["none", "light", "moderate", "heavy", "severe"];

      for (const encumbrance of encumbrances) {
        const vitalText = new VitalText();
        vitalText.label = "encumbrance";
        vitalText.value = encumbrance;

        document.body.appendChild(vitalText);
        await vitalText.updateComplete;

        expect(vitalText.shadowRoot?.querySelector(".vital-value")?.textContent).toBe(encumbrance);
        expect(vitalText.hasAttribute("inverted")).toBe(true);

        vitalText.remove();
      }
    });

    it("should handle numeric values as strings", async () => {
      const vitalText = new VitalText();
      vitalText.label = "level";
      vitalText.value = "25";

      document.body.appendChild(vitalText);
      await vitalText.updateComplete;

      expect(vitalText.shadowRoot?.querySelector(".vital-value")?.textContent).toBe("25");

      vitalText.remove();
    });

    it("should handle formatted numbers", async () => {
      const vitalText = new VitalText();
      vitalText.label = "experience";
      vitalText.value = "2,456,789";

      document.body.appendChild(vitalText);
      await vitalText.updateComplete;

      expect(vitalText.shadowRoot?.querySelector(".vital-value")?.textContent).toBe("2,456,789");

      vitalText.remove();
    });
  });

  describe("Component Lifecycle", () => {
    it("should handle property updates correctly", async () => {
      const vitalText = new VitalText();
      vitalText.label = "stance";
      vitalText.value = "defensive";

      document.body.appendChild(vitalText);
      await vitalText.updateComplete;

      // Update properties
      vitalText.value = "offensive";
      await vitalText.updateComplete;

      const shadowRoot = vitalText.shadowRoot;
      expect(shadowRoot?.querySelector(".vital-value")?.textContent).toBe("offensive");

      vitalText.remove();
    });

    it("should handle rapid property changes", async () => {
      const vitalText = new VitalText();

      document.body.appendChild(vitalText);
      await vitalText.updateComplete;

      // Rapid changes
      vitalText.label = "stance";
      vitalText.value = "defensive";
      vitalText.label = "encumbrance";
      vitalText.value = "light";
      await vitalText.updateComplete;

      expect(vitalText.getAttribute("data-vital")).toBe("encumbrance");
      expect(vitalText.hasAttribute("inverted")).toBe(true);
      expect(vitalText.shadowRoot?.querySelector(".vital-value")?.textContent).toBe("light");

      vitalText.remove();
    });

    it("should cleanup properly on disconnect", () => {
      const vitalText = new VitalText();

      expect(() => {
        vitalText.remove();
      }).not.toThrow();
    });

    it("should maintain state across multiple updates", async () => {
      const vitalText = new VitalText();
      vitalText.label = "stance";

      document.body.appendChild(vitalText);
      await vitalText.updateComplete;

      // Multiple sequential updates
      vitalText.value = "defensive";
      await vitalText.updateComplete;
      expect(vitalText.shadowRoot?.querySelector(".vital-value")?.textContent).toBe("defensive");

      vitalText.value = "offensive";
      await vitalText.updateComplete;
      expect(vitalText.shadowRoot?.querySelector(".vital-value")?.textContent).toBe("offensive");

      vitalText.value = "guarded";
      await vitalText.updateComplete;
      expect(vitalText.shadowRoot?.querySelector(".vital-value")?.textContent).toBe("guarded");

      vitalText.remove();
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long values", async () => {
      const vitalText = new VitalText();
      vitalText.label = "status";
      vitalText.value = "this is a very long status message that might overflow";

      document.body.appendChild(vitalText);
      await vitalText.updateComplete;

      expect(vitalText.shadowRoot?.querySelector(".vital-value")?.textContent).toBe("this is a very long status message that might overflow");

      vitalText.remove();
    });

    it("should handle special characters", async () => {
      const vitalText = new VitalText();
      vitalText.label = "special";
      vitalText.value = "ñöë$ & <symbols>";

      document.body.appendChild(vitalText);
      await vitalText.updateComplete;

      expect(vitalText.shadowRoot?.querySelector(".vital-value")?.textContent).toBe("ñöë$ & <symbols>");

      vitalText.remove();
    });

    it("should handle whitespace in values", async () => {
      const vitalText = new VitalText();
      vitalText.label = "stance";
      vitalText.value = "  defensive  ";

      document.body.appendChild(vitalText);
      await vitalText.updateComplete;

      expect(vitalText.shadowRoot?.querySelector(".vital-value")?.textContent).toBe("  defensive  ");

      vitalText.remove();
    });

    it("should handle mixed case labels for inverted detection", async () => {
      const testCases = ["Encumbrance", "ENCUMBRANCE", "encumbrance"];

      for (const label of testCases) {
        const vitalText = new VitalText();
        vitalText.label = label;

        document.body.appendChild(vitalText);
        await vitalText.updateComplete;

        // Only exact lowercase "encumbrance" should trigger inverted
        expect(vitalText.hasAttribute("inverted")).toBe(label === "encumbrance");

        vitalText.remove();
      }
    });
  });

  describe("TypeScript Integration", () => {
    it("should be properly registered in HTMLElementTagNameMap", () => {
      const element = document.createElement("illthorn-vital-text");
      expect(element).toBeInstanceOf(VitalText);
    });

    it("should have proper TypeScript types", () => {
      const vitalText = new VitalText();
      const text: VitalText = vitalText;
      expect(text).toBeTruthy();
    });

    it("should handle string value types correctly", () => {
      const vitalText = new VitalText();

      vitalText.value = "defensive";
      expect(typeof vitalText.value).toBe("string");

      vitalText.value = "";
      expect(typeof vitalText.value).toBe("string");
    });

    it("should handle boolean properties correctly", () => {
      const vitalText = new VitalText();

      expect(typeof vitalText.inverted).toBe("boolean");
      expect(vitalText.inverted).toBe(false);
    });
  });
});
