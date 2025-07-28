// ABOUTME: Test suite for SpellEffectLit component verifying text-based spell status display
// ABOUTME: Tests styling, property updates, and percentage-based visual feedback without progress bars
import { describe, expect, it } from "vitest";
import { SpellEffectLit } from "../../../src/frontend/components/session/spell-effect.lit";

describe("SpellEffectLit", () => {
  const setup = () => {
    const spellEffect = new SpellEffectLit();
    document.body.appendChild(spellEffect);
    return spellEffect;
  };

  const teardown = (spellEffect: SpellEffectLit) => {
    if (spellEffect.parentNode) {
      spellEffect.parentNode.removeChild(spellEffect);
    }
  };

  describe("Basic rendering", () => {
    it("should create spell effect element", () => {
      const spellEffect = setup();

      expect(spellEffect).toBeInstanceOf(SpellEffectLit);
      expect(spellEffect.tagName.toLowerCase()).toBe("illthorn-spell-effect");

      teardown(spellEffect);
    });

    it("should render with default properties", async () => {
      const spellEffect = setup();
      await spellEffect.updateComplete;

      const nameElement = spellEffect.shadowRoot?.querySelector(".spell-name");
      const timeElement = spellEffect.shadowRoot?.querySelector(".spell-time");

      expect(nameElement?.textContent).toBe("");
      expect(timeElement?.textContent).toBe("");

      teardown(spellEffect);
    });

    it("should render DOM structure with correct CSS classes", async () => {
      const spellEffect = setup();
      await spellEffect.updateComplete;

      const container = spellEffect.shadowRoot?.querySelector(".spell-item");
      const nameElement = spellEffect.shadowRoot?.querySelector(".spell-name");
      const timeElement = spellEffect.shadowRoot?.querySelector(".spell-time");

      expect(container).toBeTruthy();
      expect(nameElement).toBeTruthy();
      expect(timeElement).toBeTruthy();

      teardown(spellEffect);
    });
  });

  describe("Property updates", () => {
    it("should update spellName property and display in spell-name element", async () => {
      const spellEffect = setup();

      spellEffect.spellName = "Spirit Warding";
      await spellEffect.updateComplete;

      const nameElement = spellEffect.shadowRoot?.querySelector(".spell-name");
      expect(nameElement?.textContent).toBe("Spirit Warding");

      teardown(spellEffect);
    });

    it("should update timeRemaining property and display in spell-time element", async () => {
      const spellEffect = setup();

      spellEffect.timeRemaining = "3:42";
      await spellEffect.updateComplete;

      const timeElement = spellEffect.shadowRoot?.querySelector(".spell-time");
      expect(timeElement?.textContent).toBe("3:42");

      teardown(spellEffect);
    });

    it("should update spellId property and set dataset attribute", async () => {
      const spellEffect = setup();

      spellEffect.spellId = "123";
      await spellEffect.updateComplete;

      expect(spellEffect.dataset.spellId).toBe("123");

      teardown(spellEffect);
    });
  });

  describe("Percentage CSS class logic", () => {
    it("should add high class for percentage >= 66", async () => {
      const spellEffect = setup();

      spellEffect.percent = 75;
      await spellEffect.updateComplete;

      expect(spellEffect.classList.contains("high")).toBe(true);
      expect(spellEffect.classList.contains("medium")).toBe(false);
      expect(spellEffect.classList.contains("low")).toBe(false);

      teardown(spellEffect);
    });

    it("should add medium class for percentage between 33-65", async () => {
      const spellEffect = setup();

      spellEffect.percent = 50;
      await spellEffect.updateComplete;

      expect(spellEffect.classList.contains("high")).toBe(false);
      expect(spellEffect.classList.contains("medium")).toBe(true);
      expect(spellEffect.classList.contains("low")).toBe(false);

      teardown(spellEffect);
    });

    it("should add low class for percentage < 33", async () => {
      const spellEffect = setup();

      spellEffect.percent = 20;
      await spellEffect.updateComplete;

      expect(spellEffect.classList.contains("high")).toBe(false);
      expect(spellEffect.classList.contains("medium")).toBe(false);
      expect(spellEffect.classList.contains("low")).toBe(true);

      teardown(spellEffect);
    });

    it("should handle edge cases for percentage boundaries", async () => {
      const spellEffect = setup();

      // Test boundary at 66
      spellEffect.percent = 66;
      await spellEffect.updateComplete;
      expect(spellEffect.classList.contains("high")).toBe(true);

      // Test boundary at 33
      spellEffect.percent = 33;
      await spellEffect.updateComplete;
      expect(spellEffect.classList.contains("medium")).toBe(true);
      expect(spellEffect.classList.contains("low")).toBe(false);

      teardown(spellEffect);
    });
  });

  describe("CSS custom properties and theming", () => {
    it("should use CSS custom properties for theming", async () => {
      const spellEffect = setup();
      await spellEffect.updateComplete;

      const styles = SpellEffectLit.styles;
      expect(styles).toBeTruthy();

      teardown(spellEffect);
    });

    it("should have proper flexbox layout structure", async () => {
      const spellEffect = setup();
      spellEffect.spellName = "Test Spell";
      spellEffect.timeRemaining = "1:23";
      await spellEffect.updateComplete;

      const container = spellEffect.shadowRoot?.querySelector(".spell-item");
      const nameElement = spellEffect.shadowRoot?.querySelector(".spell-name");
      const timeElement = spellEffect.shadowRoot?.querySelector(".spell-time");

      // Verify structure exists for flex layout
      expect(container).toBeTruthy();
      expect(nameElement).toBeTruthy();
      expect(timeElement).toBeTruthy();

      teardown(spellEffect);
    });
  });

  describe("Component lifecycle", () => {
    it("should initialize percentage styling on connection", async () => {
      const spellEffect = setup();
      spellEffect.percent = 80;

      // Component should automatically apply classes when connected
      await spellEffect.updateComplete;

      expect(spellEffect.classList.contains("high")).toBe(true);

      teardown(spellEffect);
    });
  });
});
