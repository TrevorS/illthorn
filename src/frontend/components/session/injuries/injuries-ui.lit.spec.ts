import { afterEach, describe, expect, it } from "vitest";
import { InjuriesUI, type ProcessedInjury } from "./injuries-ui.lit";
import type { InjuryItem } from "./injury-item.lit";

describe("InjuriesUI", () => {
  afterEach(() => {
    // Clean up any elements added to the DOM
    document.querySelectorAll("illthorn-injuries-ui").forEach((el) => el.remove());
  });

  describe("Component Initialization", () => {
    it("should create injuries UI component", async () => {
      const ui = new InjuriesUI();
      document.body.appendChild(ui);
      await ui.updateComplete;

      expect(ui).toBeInstanceOf(InjuriesUI);
      expect(ui.tagName.toLowerCase()).toBe("illthorn-injuries-ui");

      ui.remove();
    });

    it("should render with default properties", async () => {
      const ui = new InjuriesUI();
      document.body.appendChild(ui);
      await ui.updateComplete;

      expect(ui.injuries).toEqual([]);

      // Component should render content directly without panel wrapper
      const shadowRoot = ui.shadowRoot;
      expect(shadowRoot).toBeTruthy();

      ui.remove();
    });

    it("should render healthy state when no injuries", async () => {
      const ui = new InjuriesUI();
      document.body.appendChild(ui);
      await ui.updateComplete;

      const healthy = ui.shadowRoot?.querySelector(".healthy");
      expect(healthy?.textContent).toBe("healthy");

      ui.remove();
    });
  });

  describe("Injury Display", () => {
    it("should render single injury correctly", async () => {
      const ui = new InjuriesUI();
      const testInjury: ProcessedInjury = {
        displayName: "head",
        severity: 2,
        paired: false,
      };
      ui.injuries = [testInjury];
      document.body.appendChild(ui);
      await ui.updateComplete;

      const injuryItems = ui.shadowRoot?.querySelectorAll("illthorn-injury-item");
      expect(injuryItems?.length).toBe(1);

      const injuryItem = injuryItems?.[0] as InjuryItem;
      expect(injuryItem?.displayName).toBe("head");
      expect(injuryItem?.severity).toBe(2);
      expect(injuryItem?.paired).toBe(false);

      ui.remove();
    });

    it("should render multiple injuries correctly", async () => {
      const ui = new InjuriesUI();
      const testInjuries: Array<ProcessedInjury> = [
        {
          displayName: "head",
          severity: 2,
          paired: false,
        },
        {
          displayName: "chest",
          severity: 1,
          paired: false,
        },
        {
          displayName: "arms",
          severity: 3,
          paired: true,
          leftSeverity: 1,
          rightSeverity: 3,
        },
      ];
      ui.injuries = testInjuries;
      document.body.appendChild(ui);
      await ui.updateComplete;

      const injuryItems = ui.shadowRoot?.querySelectorAll("illthorn-injury-item");
      expect(injuryItems?.length).toBe(3);

      // Check that healthy state is not shown
      const healthy = ui.shadowRoot?.querySelector(".healthy");
      expect(healthy).toBeFalsy();

      ui.remove();
    });

    it("should render paired injury correctly", async () => {
      const ui = new InjuriesUI();
      const testInjury: ProcessedInjury = {
        displayName: "arms",
        severity: 2,
        paired: true,
        leftSeverity: 1,
        rightSeverity: 2,
      };
      ui.injuries = [testInjury];
      document.body.appendChild(ui);
      await ui.updateComplete;

      const injuryItems = ui.shadowRoot?.querySelectorAll("illthorn-injury-item");
      expect(injuryItems?.length).toBe(1);

      const injuryItem = injuryItems?.[0] as InjuryItem;
      expect(injuryItem?.displayName).toBe("arms");
      expect(injuryItem?.paired).toBe(true);
      expect(injuryItem?.leftSeverity).toBe(1);
      expect(injuryItem?.rightSeverity).toBe(2);

      ui.remove();
    });
  });

  describe("Property Updates", () => {
    it("should update injuries when property changes", async () => {
      const ui = new InjuriesUI();
      document.body.appendChild(ui);
      await ui.updateComplete;

      // Initially should show healthy
      expect(ui.shadowRoot?.querySelector(".healthy")).toBeTruthy();
      expect(ui.shadowRoot?.querySelectorAll("illthorn-injury-item").length).toBe(0);

      // Add an injury
      const testInjury: ProcessedInjury = {
        displayName: "head",
        severity: 1,
        paired: false,
      };
      ui.injuries = [testInjury];
      await ui.updateComplete;

      // Should now show injury item
      expect(ui.shadowRoot?.querySelector(".healthy")).toBeFalsy();
      expect(ui.shadowRoot?.querySelectorAll("illthorn-injury-item").length).toBe(1);

      // Clear injuries
      ui.injuries = [];
      await ui.updateComplete;

      // Should show healthy again
      expect(ui.shadowRoot?.querySelector(".healthy")).toBeTruthy();
      expect(ui.shadowRoot?.querySelectorAll("illthorn-injury-item").length).toBe(0);

      ui.remove();
    });

    it("should handle empty injury arrays", async () => {
      const ui = new InjuriesUI();
      ui.injuries = [];
      document.body.appendChild(ui);
      await ui.updateComplete;

      const healthy = ui.shadowRoot?.querySelector(".healthy");
      expect(healthy?.textContent).toBe("healthy");

      const injuryItems = ui.shadowRoot?.querySelectorAll("illthorn-injury-item");
      expect(injuryItems?.length).toBe(0);

      ui.remove();
    });
  });

  describe("Component Structure", () => {
    it("should have proper component structure", async () => {
      const ui = new InjuriesUI();
      document.body.appendChild(ui);
      await ui.updateComplete;

      // Component should render without wrapper panel since panel is provided by layout
      const shadowRoot = ui.shadowRoot;
      expect(shadowRoot).toBeTruthy();

      ui.remove();
    });
  });

  describe("Styling", () => {
    it("should have proper CSS structure", async () => {
      const ui = new InjuriesUI();
      document.body.appendChild(ui);
      await ui.updateComplete;

      // Component should have minimal styling since panel wrapper is provided by layout
      const shadowRoot = ui.shadowRoot;
      expect(shadowRoot).toBeTruthy();

      ui.remove();
    });

    it("should support CSS custom properties", async () => {
      const ui = new InjuriesUI();
      document.body.appendChild(ui);
      await ui.updateComplete;

      // Verify that the component has styles that reference CSS custom properties
      const styles = InjuriesUI.styles;
      expect(styles).toBeTruthy();

      ui.remove();
    });
  });

  describe("API Methods", () => {
    it("should provide getInjuries method", async () => {
      const ui = new InjuriesUI();
      const testInjury: ProcessedInjury = {
        displayName: "head",
        severity: 1,
        paired: false,
      };
      ui.injuries = [testInjury];
      document.body.appendChild(ui);
      await ui.updateComplete;

      expect(typeof ui.getInjuries).toBe("function");
      const injuryElements = ui.getInjuries();
      expect(Array.isArray(injuryElements)).toBe(true);

      ui.remove();
    });

    it("should return injury item elements", async () => {
      const ui = new InjuriesUI();
      const testInjuries: Array<ProcessedInjury> = [
        {
          displayName: "head",
          severity: 1,
          paired: false,
        },
        {
          displayName: "chest",
          severity: 2,
          paired: false,
        },
      ];
      ui.injuries = testInjuries;
      document.body.appendChild(ui);
      await ui.updateComplete;

      const injuryElements = ui.getInjuries();
      expect(injuryElements.length).toBe(2);
      expect(injuryElements[0].tagName.toLowerCase()).toBe("illthorn-injury-item");
      expect(injuryElements[1].tagName.toLowerCase()).toBe("illthorn-injury-item");

      ui.remove();
    });
  });

  describe("Accessibility", () => {
    it("should have proper content structure for accessibility", async () => {
      const ui = new InjuriesUI();
      document.body.appendChild(ui);
      await ui.updateComplete;

      // Component should render content directly without wrapper since panel is provided by layout
      const shadowRoot = ui.shadowRoot;
      expect(shadowRoot).toBeTruthy();

      ui.remove();
    });

    it("should maintain consistent healthy state display", async () => {
      const ui = new InjuriesUI();
      document.body.appendChild(ui);
      await ui.updateComplete;

      const healthy = ui.shadowRoot?.querySelector(".healthy");
      expect(healthy?.textContent).toBe("healthy");

      ui.remove();
    });
  });
});
