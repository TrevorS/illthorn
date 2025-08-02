// ABOUTME: Test suite for VitalsUI presentational component verifying UI rendering and property handling
// ABOUTME: Tests the dumb UI component's rendering logic without session dependencies
import { afterEach, describe, expect, it } from "vitest";
import type { VitalStat } from "./vital-stat.lit";
import type { VitalText } from "./vital-text.lit";
import { VitalsUI } from "./vitals-ui.lit";

interface VitalData {
  label: string;
  value?: string; // Optional - undefined means indeterminate state
  percent?: number; // Optional - undefined means indeterminate state
}

describe("VitalsUI", () => {
  const setup = (options?: {
    healthData?: VitalData;
    manaData?: VitalData;
    staminaData?: VitalData;
    spiritData?: VitalData;
    mindData?: VitalData;
    stanceData?: VitalData;
    encumbranceData?: VitalData;
  }) => {
    const component = new VitalsUI();
    if (options?.healthData !== undefined) component.healthData = options.healthData;
    if (options?.manaData !== undefined) component.manaData = options.manaData;
    if (options?.staminaData !== undefined) component.staminaData = options.staminaData;
    if (options?.spiritData !== undefined) component.spiritData = options.spiritData;
    if (options?.mindData !== undefined) component.mindData = options.mindData;
    if (options?.stanceData !== undefined) component.stanceData = options.stanceData;
    if (options?.encumbranceData !== undefined) component.encumbranceData = options.encumbranceData;
    document.body.appendChild(component);
    return component;
  };

  const teardown = (component: VitalsUI) => {
    if (component.parentNode) {
      component.parentNode.removeChild(component);
    }
  };

  afterEach(() => {
    document.body.innerHTML = "";
  });

  describe("Basic Rendering", () => {
    it("should create vitals UI element", () => {
      const component = setup();

      expect(component).toBeTruthy();
      expect(component.tagName.toLowerCase()).toBe("illthorn-vitals-ui");

      teardown(component);
    });

    it("should render with proper host styling", async () => {
      const component = setup();
      await component.updateComplete;

      expect(component.shadowRoot).toBeTruthy();

      teardown(component);
    });

    it("should render all vital components", async () => {
      const component = setup();
      await component.updateComplete;

      const shadowRoot = component.shadowRoot;
      expect(shadowRoot).toBeTruthy();

      // Should have 5 vital-stat components (health, stamina, spirit, mana, mind)
      const vitalStats = shadowRoot?.querySelectorAll("illthorn-vital-stat");
      expect(vitalStats?.length).toBe(5);

      // Should have 2 vital-text components (stance, encumbrance)
      const vitalTexts = shadowRoot?.querySelectorAll("illthorn-vital-text");
      expect(vitalTexts?.length).toBe(2);

      teardown(component);
    });
  });

  describe("Vital Data Properties", () => {
    it("should accept and display health data", async () => {
      const healthData = { label: "health", value: "85/100", percent: 85 };
      const component = setup({ healthData });
      await component.updateComplete;

      expect(component.healthData).toBe(healthData);

      const healthStat = component.shadowRoot?.querySelector('illthorn-vital-stat[label="health"]') as VitalStat;
      expect(healthStat?.label).toBe("health");
      expect(healthStat?.value).toBe("85/100");
      expect(healthStat?.percent).toBe(85);

      teardown(component);
    });

    it("should accept and display mana data", async () => {
      const manaData = { label: "mana", value: "45/80", percent: 56 };
      const component = setup({ manaData });
      await component.updateComplete;

      expect(component.manaData).toBe(manaData);

      const manaStat = component.shadowRoot?.querySelector('illthorn-vital-stat[label="mana"]') as VitalStat;
      expect(manaStat?.label).toBe("mana");
      expect(manaStat?.value).toBe("45/80");
      expect(manaStat?.percent).toBe(56);

      teardown(component);
    });

    it("should accept and display stamina data", async () => {
      const staminaData = { label: "stamina", value: "20/90", percent: 22 };
      const component = setup({ staminaData });
      await component.updateComplete;

      expect(component.staminaData).toBe(staminaData);

      const staminaStat = component.shadowRoot?.querySelector('illthorn-vital-stat[label="stamina"]') as VitalStat;
      expect(staminaStat?.label).toBe("stamina");
      expect(staminaStat?.value).toBe("20/90");
      expect(staminaStat?.percent).toBe(22);

      teardown(component);
    });

    it("should accept and display spirit data", async () => {
      const spiritData = { label: "spirit", value: "100/100", percent: 100 };
      const component = setup({ spiritData });
      await component.updateComplete;

      expect(component.spiritData).toBe(spiritData);

      const spiritStat = component.shadowRoot?.querySelector('illthorn-vital-stat[label="spirit"]') as VitalStat;
      expect(spiritStat?.label).toBe("spirit");
      expect(spiritStat?.value).toBe("100/100");
      expect(spiritStat?.percent).toBe(100);

      teardown(component);
    });

    it("should accept and display mind data", async () => {
      const mindData = { label: "mind", value: "clear as a bell", percent: 100 };
      const component = setup({ mindData });
      await component.updateComplete;

      expect(component.mindData).toBe(mindData);

      const mindStat = component.shadowRoot?.querySelector('illthorn-vital-stat[label="mind"]') as VitalStat;
      expect(mindStat?.label).toBe("mind");
      expect(mindStat?.value).toBe("clear as a bell");
      expect(mindStat?.percent).toBe(100);

      teardown(component);
    });

    it("should accept and display stance data", async () => {
      const stanceData = { label: "stance", value: "defensive", percent: 0 };
      const component = setup({ stanceData });
      await component.updateComplete;

      expect(component.stanceData).toBe(stanceData);

      const stanceText = component.shadowRoot?.querySelector('illthorn-vital-text[label="stance"]') as VitalText;
      expect(stanceText?.label).toBe("stance");
      expect(stanceText?.value).toBe("defensive");

      teardown(component);
    });

    it("should accept and display encumbrance data", async () => {
      const encumbranceData = { label: "encumbrance", value: "light", percent: 0 };
      const component = setup({ encumbranceData });
      await component.updateComplete;

      expect(component.encumbranceData).toBe(encumbranceData);

      const encumbranceText = component.shadowRoot?.querySelector('illthorn-vital-text[label="encumbrance"]') as VitalText;
      expect(encumbranceText?.label).toBe("encumbrance");
      expect(encumbranceText?.value).toBe("light");

      teardown(component);
    });

    it("should use default vital data when not provided", async () => {
      const component = setup();
      await component.updateComplete;

      expect(component.healthData.label).toBe("health");
      expect(component.manaData.label).toBe("mana");
      expect(component.staminaData.label).toBe("stamina");
      expect(component.spiritData.label).toBe("spirit");
      expect(component.mindData.label).toBe("mind");
      expect(component.stanceData.label).toBe("stance");
      expect(component.encumbranceData.label).toBe("encumbrance");

      teardown(component);
    });

    it("should be reactive to vital data changes", async () => {
      const component = setup();
      await component.updateComplete;

      component.healthData = { label: "health", value: "50/100", percent: 50 };
      await component.updateComplete;

      const healthStat = component.shadowRoot?.querySelector('illthorn-vital-stat[label="health"]') as VitalStat;
      expect(healthStat?.value).toBe("50/100");
      expect(healthStat?.percent).toBe(50);

      teardown(component);
    });
  });

  describe("Indeterminate States", () => {
    it("should handle undefined values for indeterminate states", async () => {
      const healthData: VitalData = { label: "health", value: undefined, percent: undefined };
      const component = setup({ healthData });
      await component.updateComplete;

      const healthStat = component.shadowRoot?.querySelector('illthorn-vital-stat[label="health"]') as VitalStat;
      expect(healthStat?.value).toBe(undefined);
      expect(healthStat?.percent).toBe(undefined);

      teardown(component);
    });

    it("should preserve undefined values for indeterminate state functionality", async () => {
      const healthData: VitalData = { label: "health", value: undefined, percent: undefined };
      const component = setup({ healthData });
      await component.updateComplete;

      const healthStat = component.shadowRoot?.querySelector('illthorn-vital-stat[label="health"]') as VitalStat;
      expect(healthStat?.value).toBe(undefined);
      expect(healthStat?.percent).toBe(undefined);

      teardown(component);
    });
  });

  describe("getVitals API", () => {
    it("should return vitals interface with stats and texts arrays", async () => {
      const component = setup();
      await component.updateComplete;

      const vitals = component.getVitals();

      expect(vitals).toBeTruthy();
      expect(vitals.stats).toBeTruthy();
      expect(vitals.texts).toBeTruthy();
      expect(Array.isArray(vitals.stats)).toBe(true);
      expect(Array.isArray(vitals.texts)).toBe(true);

      teardown(component);
    });

    it("should return correct number of vital components", async () => {
      const component = setup();
      await component.updateComplete;

      const vitals = component.getVitals();

      expect(vitals.stats.length).toBe(5); // health, mana, stamina, spirit, mind
      expect(vitals.texts.length).toBe(2); // stance, encumbrance

      teardown(component);
    });

    it("should return vital components with correct types", async () => {
      const component = setup();
      await component.updateComplete;

      const vitals = component.getVitals();

      vitals.stats.forEach((stat) => {
        expect(stat.tagName.toLowerCase()).toBe("illthorn-vital-stat");
      });

      vitals.texts.forEach((text) => {
        expect(text.tagName.toLowerCase()).toBe("illthorn-vital-text");
      });

      teardown(component);
    });

    it("should return empty arrays when shadowRoot not available", () => {
      const component = setup();
      // Don't wait for updateComplete to test early state

      const vitals = component.getVitals();
      expect(vitals).toEqual({ stats: [], texts: [] });

      teardown(component);
    });
  });

  describe("CSS Styling", () => {
    it("should have proper CSS styling defined", () => {
      expect(VitalsUI.styles).toBeTruthy();

      const stylesText = VitalsUI.styles.toString();

      expect(stylesText).toContain(":host");
      expect(stylesText).toContain("display: flex");
      expect(stylesText).toContain("flex-direction: column");
    });
  });

  describe("Component Lifecycle", () => {
    it("should handle vital data property changes", async () => {
      const component = setup();
      await component.updateComplete;

      component.healthData = { label: "health", value: "new value", percent: 75 };
      component.stanceData = { label: "stance", value: "new stance", percent: 0 };
      await component.updateComplete;

      expect(component.healthData.value).toBe("new value");
      expect(component.healthData.percent).toBe(75);
      expect(component.stanceData.value).toBe("new stance");

      teardown(component);
    });

    it("should cleanup properly on disconnect", () => {
      const component = setup();

      expect(() => {
        component.remove();
      }).not.toThrow();
    });
  });

  describe("TypeScript Integration", () => {
    it("should have proper TypeScript types", async () => {
      const component = setup();
      const vitals: VitalsUI = component;
      expect(vitals).toBeTruthy();

      teardown(component);
    });

    it("should be properly registered in HTMLElementTagNameMap", () => {
      const element = document.createElement("illthorn-vitals-ui");
      expect(element).toBeInstanceOf(VitalsUI);
    });
  });
});
