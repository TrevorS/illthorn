// ABOUTME: Test suite for EffectsUI component verifying pure UI rendering with reactive properties
// ABOUTME: Tests the presentational component independently of session/event logic
/// <reference types="vitest/globals" />
import { describe, expect, it } from "vitest";
import { querySpellEffect } from "../../../../../test/helpers/test-dom-queries";
import type { SpellEffectData } from "./effects-ui.lit";
import { EffectsUI } from "./effects-ui.lit";

describe("EffectsUI", () => {
  const setup = () => {
    const component = document.createElement("illthorn-effects-ui") as EffectsUI;
    document.body.appendChild(component);
    return { component };
  };

  const teardown = (component: EffectsUI) => {
    if (component.parentNode) {
      component.parentNode.removeChild(component);
    }
  };

  describe("Basic rendering", () => {
    it("should create effects UI element", () => {
      const { component } = setup();

      expect(component).toBeInstanceOf(EffectsUI);
      expect(component.tagName.toLowerCase()).toBe("illthorn-effects-ui");

      teardown(component);
    });

    it("should initialize with empty spell effects", () => {
      const { component } = setup();

      expect(component.spellEffects).toEqual([]);
      expect(component.name).toBe("");

      teardown(component);
    });
  });

  describe("Reactive properties", () => {
    it("should accept spellEffects property", async () => {
      const { component } = setup();
      const testEffects: Array<SpellEffectData> = [
        { text: "Bless", id: "bless-101", time: "12:30", value: "75" },
        { text: "Spirit Warding", id: "spirit-102", time: "8:15", value: "60" },
      ];

      component.spellEffects = testEffects;
      await component.updateComplete;

      expect(component.spellEffects).toEqual(testEffects);

      teardown(component);
    });

    it("should accept name property", async () => {
      const { component } = setup();

      component.name = "Active Spells";
      await component.updateComplete;

      expect(component.name).toBe("Active Spells");

      teardown(component);
    });

    it("should react to property changes", async () => {
      const { component } = setup();

      component.spellEffects = [{ text: "Test", id: "test-1", time: "5:00", value: "50" }];
      await component.updateComplete;
      expect(component.spellEffects.length).toBe(1);

      component.spellEffects = [
        { text: "Test 1", id: "test-1", time: "5:00", value: "50" },
        { text: "Test 2", id: "test-2", time: "3:00", value: "30" },
      ];
      await component.updateComplete;
      expect(component.spellEffects.length).toBe(2);

      teardown(component);
    });
  });

  describe("Spell effect rendering", () => {
    it("should render spell effect components for each effect", async () => {
      const { component } = setup();
      const testEffects: Array<SpellEffectData> = [
        { text: "Bless", id: "bless-101", time: "12:30", value: "75" },
        { text: "Spirit Warding", id: "spirit-102", time: "8:15", value: "60" },
        { text: "Mass Blur", id: "mass-blur-103", time: "2:45", value: "25" },
      ];

      component.spellEffects = testEffects;
      await component.updateComplete;

      const spellEffectElements = component.shadowRoot?.querySelectorAll("illthorn-spell-effect");
      expect(spellEffectElements?.length).toBe(3);

      teardown(component);
    });

    it("should render no effects when spellEffects is empty", async () => {
      const { component } = setup();

      component.spellEffects = [];
      await component.updateComplete;

      const spellEffectElements = component.shadowRoot?.querySelectorAll("illthorn-spell-effect");
      expect(spellEffectElements?.length).toBe(0);

      teardown(component);
    });

    it("should pass correct props to spell effect components", async () => {
      const { component } = setup();
      const testEffect: SpellEffectData = {
        text: "Test Spell",
        id: "test-spell-123",
        time: "15:30",
        value: "85",
      };

      component.spellEffects = [testEffect];
      await component.updateComplete;

      const spellEffectElement = component.shadowRoot?.querySelector("illthorn-spell-effect");
      expect(spellEffectElement).toBeTruthy();

      // Check that properties are passed correctly
      expect(spellEffectElement?.getAttribute("spellName") || spellEffectElement?.spellName).toBe("Test Spell");
      expect(spellEffectElement?.getAttribute("timeRemaining") || spellEffectElement?.timeRemaining).toBe("15:30");
      expect(spellEffectElement?.getAttribute("spellId") || spellEffectElement?.spellId).toBe("test-spell-123");

      teardown(component);
    });
  });

  describe("CSS class handling", () => {
    it("should add CSS class based on name", async () => {
      const { component } = setup();

      component.name = "Active Spells";
      await component.updateComplete;

      expect(component.classList.contains("active-spells")).toBe(true);

      teardown(component);
    });

    it("should handle names with spaces and special characters", async () => {
      const { component } = setup();

      component.name = "Multi Word Effect!";
      await component.updateComplete;

      expect(component.classList.contains("multi-word-effect!")).toBe(true);

      teardown(component);
    });

    it("should update CSS class when name changes", async () => {
      const { component } = setup();

      component.name = "Original Name";
      await component.updateComplete;
      expect(component.classList.contains("original-name")).toBe(true);

      component.name = "New Name";
      await component.updateComplete;
      expect(component.classList.contains("new-name")).toBe(true);

      teardown(component);
    });
  });

  describe("Value parsing", () => {
    it("should handle numeric value conversion in spell effects", async () => {
      const { component } = setup();
      const testEffect: SpellEffectData = {
        text: "Test Spell",
        id: "test-123",
        time: "5:00",
        value: "42",
      };

      component.spellEffects = [testEffect];
      await component.updateComplete;

      const spellEffectElement = querySpellEffect(component.shadowRoot);
      expect(spellEffectElement?.percent).toBe(42);

      teardown(component);
    });

    it("should handle empty or invalid value strings", async () => {
      const { component } = setup();
      const testEffect: SpellEffectData = {
        text: "Test Spell",
        id: "test-123",
        time: "5:00",
        value: "",
      };

      component.spellEffects = [testEffect];
      await component.updateComplete;

      const spellEffectElement = querySpellEffect(component.shadowRoot);
      expect(spellEffectElement?.percent).toBe(0);

      teardown(component);
    });
  });
});
