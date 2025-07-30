import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { VitalStat, VitalText } from "../../../../src/frontend/components/session/vitals/components.lit";
import { Vitals } from "../../../../src/frontend/components/session/vitals/vitals.lit";
import { makeTag } from "../../../../src/frontend/parser/tag";
import { createMockSession, type MockSession } from "../../../mocks/index";

describe("Vitals", () => {
  let mockSession: MockSession;

  beforeEach(() => {
    mockSession = createMockSession("test-vitals");
  });

  afterEach(() => {
    // Clean up any elements added to the DOM
    document.querySelectorAll("illthorn-vitals-lit").forEach((el) => el.remove());
    document.querySelectorAll("illthorn-vital-stat").forEach((el) => el.remove());
    document.querySelectorAll("illthorn-vital-text").forEach((el) => el.remove());
  });

  describe("Main Container", () => {
    it("should create vitals container with session parameter", async () => {
      const vitals = new Vitals(mockSession);
      document.body.appendChild(vitals);
      await vitals.updateComplete;

      expect(vitals).toBeInstanceOf(Vitals);
      expect(vitals.tagName.toLowerCase()).toBe("illthorn-vitals-lit");
      expect(vitals.session).toBe(mockSession);

      vitals.remove();
    });

    it("should render all vital components when session is provided", async () => {
      const vitals = new Vitals(mockSession);
      document.body.appendChild(vitals);
      await vitals.updateComplete;

      const shadowRoot = vitals.shadowRoot;
      expect(shadowRoot?.querySelector("illthorn-vital-stat")).toBeTruthy();
      expect(shadowRoot?.querySelector("illthorn-vital-text")).toBeTruthy();

      // Should have 5 vital-stat components (health, stamina, spirit, mana, mind)
      const vitalStats = shadowRoot?.querySelectorAll("illthorn-vital-stat");
      expect(vitalStats?.length).toBe(5);

      // Should have 2 vital-text components (stance, encumbrance)
      const vitalTexts = shadowRoot?.querySelectorAll("illthorn-vital-text");
      expect(vitalTexts?.length).toBe(2);

      vitals.remove();
    });

    it("should render empty when no session provided", async () => {
      const vitals = new Vitals();
      document.body.appendChild(vitals);
      await vitals.updateComplete;

      const shadowRoot = vitals.shadowRoot;
      // Should not have any vital components when no session is provided
      expect(shadowRoot?.querySelector("illthorn-vital-stat")).toBeFalsy();
      expect(shadowRoot?.querySelector("illthorn-vital-text")).toBeFalsy();

      vitals.remove();
    });
  });

  describe("Health Vital Updates", () => {
    it("should update health vital when receiving health events", async () => {
      const vitals = new Vitals(mockSession);
      document.body.appendChild(vitals);
      await vitals.updateComplete;

      // Trigger health update
      const healthTag = makeTag("progressBar");
      healthTag.attrs = { id: "health", value: "75", text: "health 45/60" };
      mockSession.bus.dispatchEvent("metadata/progressBar/health", healthTag);
      await vitals.updateComplete;

      const healthStat = vitals.shadowRoot?.querySelector("illthorn-vital-stat");
      expect(healthStat?.getAttribute("label")).toBe("health");
      expect(healthStat?.getAttribute("value")).toBe("45/60");
      expect(healthStat?.getAttribute("percent")).toBe("75");

      vitals.remove();
    });
  });

  describe("Mind Vital Updates", () => {
    it("should update mind vital with special processing", async () => {
      const vitals = new Vitals(mockSession);
      document.body.appendChild(vitals);
      await vitals.updateComplete;

      // Trigger mind update
      const mindTag = makeTag("progressBar");
      mindTag.attrs = { id: "mindState", value: "100", text: "clear as a bell" };
      mockSession.bus.dispatchEvent("metadata/progressBar/mindState", mindTag);
      await vitals.updateComplete;

      const mindStats = vitals.shadowRoot?.querySelectorAll("illthorn-vital-stat");
      const mindStat = Array.from(mindStats || []).find((stat) => stat.getAttribute("label") === "mind");

      expect(mindStat?.getAttribute("label")).toBe("mind");
      expect(mindStat?.getAttribute("value")).toBe("clear as a bell");
      expect(mindStat?.getAttribute("percent")).toBe("100");

      vitals.remove();
    });
  });

  describe("Stance Vital Updates", () => {
    it("should update stance vital with first word extraction", async () => {
      const vitals = new Vitals(mockSession);
      document.body.appendChild(vitals);
      await vitals.updateComplete;

      // Trigger stance update
      const stanceTag = makeTag("progressBar");
      stanceTag.attrs = { id: "pbarStance", value: "0", text: "defensive stance" };
      mockSession.bus.dispatchEvent("metadata/progressBar/pbarStance", stanceTag);
      await vitals.updateComplete;

      const stanceTexts = vitals.shadowRoot?.querySelectorAll("illthorn-vital-text");
      const stanceStat = Array.from(stanceTexts || []).find((stat) => stat.getAttribute("label") === "stance");

      expect(stanceStat?.getAttribute("label")).toBe("stance");
      expect(stanceStat?.getAttribute("value")).toBe("defensive");

      vitals.remove();
    });
  });

  describe("Encumbrance Vital Updates", () => {
    it("should update encumbrance vital with lowercase processing", async () => {
      const vitals = new Vitals(mockSession);
      document.body.appendChild(vitals);
      await vitals.updateComplete;

      // Trigger encumbrance update
      const encumTag = makeTag("progressBar");
      encumTag.attrs = { id: "encumlevel", value: "0", text: "LIGHT" };
      mockSession.bus.dispatchEvent("metadata/progressBar/encumlevel", encumTag);
      await vitals.updateComplete;

      const encumTexts = vitals.shadowRoot?.querySelectorAll("illthorn-vital-text");
      const encumStat = Array.from(encumTexts || []).find((stat) => stat.getAttribute("label") === "encumbrance");

      expect(encumStat?.getAttribute("label")).toBe("encumbrance");
      expect(encumStat?.getAttribute("value")).toBe("light");

      vitals.remove();
    });
  });
});

describe("VitalStat Component", () => {
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
    expect(shadowRoot?.querySelector(".vital-meter")?.getAttribute("style")).toContain("width: 83%");

    vitalStat.remove();
  });

  it("should apply percentage-based CSS classes", async () => {
    const vitalStat = new VitalStat();
    vitalStat.percent = 25;

    document.body.appendChild(vitalStat);
    await vitalStat.updateComplete;

    expect(vitalStat.hasAttribute("low")).toBe(true);
    expect(vitalStat.hasAttribute("medium")).toBe(false);
    expect(vitalStat.hasAttribute("high")).toBe(false);

    vitalStat.remove();
  });
});

describe("VitalText Component", () => {
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
});
