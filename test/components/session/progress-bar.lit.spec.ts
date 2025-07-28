import { describe, expect, it } from "vitest";
import { ProgressBarLit } from "../../../src/frontend/components/session/progress-bar.lit";

describe("ProgressBarLit", () => {
  const setup = (name = "test") => {
    const progressBar = new ProgressBarLit(name);
    document.body.appendChild(progressBar);
    return progressBar;
  };

  const teardown = (progressBar: ProgressBarLit) => {
    if (progressBar.parentNode) {
      progressBar.parentNode.removeChild(progressBar);
    }
  };

  describe("Constructor and name parameter", () => {
    it("should create progress bar element with name parameter", () => {
      const progressBar = setup("health");

      expect(progressBar).toBeInstanceOf(ProgressBarLit);
      expect(progressBar.tagName.toLowerCase()).toBe("illthorn-progress-bar-lit");

      teardown(progressBar);
    });

    it("should add name as CSS class with lowercase and hyphen replacement", () => {
      const progressBar = setup("Health Bar");

      expect(progressBar.classList.contains("health-bar")).toBe(true);

      teardown(progressBar);
    });

    it("should handle single word names", () => {
      const progressBar = setup("mana");

      expect(progressBar.classList.contains("mana")).toBe(true);

      teardown(progressBar);
    });
  });

  describe("Basic rendering", () => {
    it("should render with default properties", async () => {
      const progressBar = setup();
      await progressBar.updateComplete;

      expect(progressBar.title).toBe("");
      expect(progressBar.percent).toBe("");
      expect(progressBar.value).toBe("");

      const meter = progressBar.shadowRoot?.querySelector(".meter");
      const flavorText = progressBar.shadowRoot?.querySelector(".flavor-text");
      const valueSpan = progressBar.shadowRoot?.querySelector(".value");

      expect(meter).toBeTruthy();
      expect(flavorText).toBeTruthy();
      expect(valueSpan).toBeTruthy();

      teardown(progressBar);
    });

    it("should render DOM structure with correct CSS classes", async () => {
      const progressBar = setup();
      await progressBar.updateComplete;

      const meter = progressBar.shadowRoot?.querySelector("span.meter");
      const flavorText = progressBar.shadowRoot?.querySelector("span.flavor-text");
      const valueSpan = progressBar.shadowRoot?.querySelector("span.value");

      expect(meter).toBeTruthy();
      expect(flavorText).toBeTruthy();
      expect(valueSpan).toBeTruthy();

      teardown(progressBar);
    });
  });

  describe("Property updates", () => {
    it("should update title property and display in flavor-text", async () => {
      const progressBar = setup();
      progressBar.title = "Health";
      await progressBar.updateComplete;

      expect(progressBar.title).toBe("Health");
      const flavorText = progressBar.shadowRoot?.querySelector(".flavor-text");
      expect(flavorText?.textContent).toBe("Health");

      teardown(progressBar);
    });

    it("should update value property and display in value span", async () => {
      const progressBar = setup();
      progressBar.value = "100/100";
      await progressBar.updateComplete;

      expect(progressBar.value).toBe("100/100");
      const valueSpan = progressBar.shadowRoot?.querySelector(".value");
      expect(valueSpan?.textContent).toBe("100/100");

      teardown(progressBar);
    });

    it("should update percent property and apply meter width", async () => {
      const progressBar = setup();
      progressBar.percent = "75";
      await progressBar.updateComplete;

      expect(progressBar.percent).toBe("75");
      const meter = progressBar.shadowRoot?.querySelector(".meter") as HTMLElement;
      expect(meter?.style.width).toBe("75%");

      teardown(progressBar);
    });
  });

  describe("Attribute compatibility (API parity)", () => {
    it("should handle setAttribute for title", async () => {
      const progressBar = setup();
      progressBar.setAttribute("title", "Mana");
      await progressBar.updateComplete;

      expect(progressBar.title).toBe("Mana");
      const flavorText = progressBar.shadowRoot?.querySelector(".flavor-text");
      expect(flavorText?.textContent).toBe("Mana");

      teardown(progressBar);
    });

    it("should handle setAttribute for percent", async () => {
      const progressBar = setup();
      progressBar.setAttribute("percent", "50");
      await progressBar.updateComplete;

      expect(progressBar.percent).toBe("50");
      const meter = progressBar.shadowRoot?.querySelector(".meter") as HTMLElement;
      expect(meter?.style.width).toBe("50%");

      teardown(progressBar);
    });

    it("should handle setAttribute for value", async () => {
      const progressBar = setup();
      progressBar.setAttribute("value", "50/100");
      await progressBar.updateComplete;

      expect(progressBar.value).toBe("50/100");
      const valueSpan = progressBar.shadowRoot?.querySelector(".value");
      expect(valueSpan?.textContent).toBe("50/100");

      teardown(progressBar);
    });
  });

  describe("Percentage CSS class logic", () => {
    it("should add high class for percentage >= 66", async () => {
      const progressBar = setup();
      progressBar.percent = "80";
      await progressBar.updateComplete;

      expect(progressBar.classList.contains("high")).toBe(true);
      expect(progressBar.classList.contains("medium")).toBe(false);
      expect(progressBar.classList.contains("low")).toBe(false);

      teardown(progressBar);
    });

    it("should add medium class for percentage between 33-65", async () => {
      const progressBar = setup();
      progressBar.percent = "50";
      await progressBar.updateComplete;

      expect(progressBar.classList.contains("high")).toBe(false);
      expect(progressBar.classList.contains("medium")).toBe(true);
      expect(progressBar.classList.contains("low")).toBe(false);

      teardown(progressBar);
    });

    it("should add low class for percentage < 33", async () => {
      const progressBar = setup();
      progressBar.percent = "20";
      await progressBar.updateComplete;

      expect(progressBar.classList.contains("high")).toBe(false);
      expect(progressBar.classList.contains("medium")).toBe(false);
      expect(progressBar.classList.contains("low")).toBe(true);

      teardown(progressBar);
    });

    it("should handle edge cases for percentage boundaries", async () => {
      const progressBar = setup();

      // Test 66% (should be high)
      progressBar.percent = "66";
      await progressBar.updateComplete;
      expect(progressBar.classList.contains("high")).toBe(true);

      // Test 65% (should be medium)
      progressBar.percent = "65";
      await progressBar.updateComplete;
      expect(progressBar.classList.contains("medium")).toBe(true);

      // Test 33% (should be medium)
      progressBar.percent = "33";
      await progressBar.updateComplete;
      expect(progressBar.classList.contains("medium")).toBe(true);

      // Test 32% (should be low)
      progressBar.percent = "32";
      await progressBar.updateComplete;
      expect(progressBar.classList.contains("low")).toBe(true);

      teardown(progressBar);
    });

    it("should handle invalid percentage strings", async () => {
      const progressBar = setup();
      progressBar.percent = "invalid";
      await progressBar.updateComplete;

      // Should default to 0 via parseInt
      expect(progressBar.classList.contains("low")).toBe(true);
      const meter = progressBar.shadowRoot?.querySelector(".meter") as HTMLElement;
      expect(meter?.style.width).toBe("0%");

      teardown(progressBar);
    });
  });

  describe("Legacy method compatibility", () => {
    it("should have updateText method that updates title", async () => {
      const progressBar = setup();
      progressBar.updateText("Spirit");
      await progressBar.updateComplete;

      expect(progressBar.title).toBe("Spirit");
      const flavorText = progressBar.shadowRoot?.querySelector(".flavor-text");
      expect(flavorText?.textContent).toBe("Spirit");

      teardown(progressBar);
    });

    it("should have updateValue method that updates value", async () => {
      const progressBar = setup();
      progressBar.updateValue("75/100");
      await progressBar.updateComplete;

      expect(progressBar.value).toBe("75/100");
      const valueSpan = progressBar.shadowRoot?.querySelector(".value");
      expect(valueSpan?.textContent).toBe("75/100");

      teardown(progressBar);
    });

    it("should have updatePercent method that updates percent and classes", async () => {
      const progressBar = setup();
      progressBar.updatePercent("90");
      await progressBar.updateComplete;

      expect(progressBar.classList.contains("high")).toBe(true);
      const meter = progressBar.shadowRoot?.querySelector(".meter") as HTMLElement;
      expect(meter?.style.width).toBe("90%");

      teardown(progressBar);
    });
  });

  describe("CSS custom properties and theming", () => {
    it("should use CSS custom properties for theming", async () => {
      const progressBar = setup();
      await progressBar.updateComplete;

      const styles = ProgressBarLit.styles;
      expect(styles).toBeTruthy();

      teardown(progressBar);
    });

    it("should apply meter width directly to meter element", async () => {
      const progressBar = setup();
      progressBar.percent = "60";
      await progressBar.updateComplete;

      const meter = progressBar.shadowRoot?.querySelector(".meter") as HTMLElement;
      expect(meter?.style.width).toBe("60%");

      teardown(progressBar);
    });
  });

  describe("Component lifecycle", () => {
    it("should initialize percentage styling on connection", async () => {
      const progressBar = setup();
      progressBar.percent = "40";

      // Trigger connectedCallback
      document.body.removeChild(progressBar);
      document.body.appendChild(progressBar);
      await progressBar.updateComplete;

      expect(progressBar.classList.contains("medium")).toBe(true);

      teardown(progressBar);
    });
  });
});
