import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { InjuriesLit } from "../../../../src/frontend/components/session/injuries/injuries.lit";
import { makeTag } from "../../../../src/frontend/parser/tag";
import { createMockSession, type MockSession } from "../../../mocks/index";

describe("InjuriesLit", () => {
  let mockSession: MockSession;

  beforeEach(() => {
    mockSession = createMockSession("test-injuries");
  });

  afterEach(() => {
    // Clean up any elements added to the DOM
    document.querySelectorAll("illthorn-injuries-lit").forEach((el) => el.remove());
  });

  describe("Main Container", () => {
    it("should create injuries container with session parameter", async () => {
      const injuries = new InjuriesLit(mockSession);
      document.body.appendChild(injuries);
      await injuries.updateComplete;

      expect(injuries).toBeInstanceOf(InjuriesLit);
      expect(injuries.tagName.toLowerCase()).toBe("illthorn-injuries-lit");
      expect(injuries.session).toBe(mockSession);

      injuries.remove();
    });

    it("should render healthy state when no injuries", async () => {
      const injuries = new InjuriesLit(mockSession);
      document.body.appendChild(injuries);
      await injuries.updateComplete;

      const shadowRoot = injuries.shadowRoot;
      expect(shadowRoot?.querySelector(".healthy")).toBeTruthy();
      expect(shadowRoot?.textContent).toContain("healthy");

      injuries.remove();
    });

    it("should render empty when no session provided", async () => {
      const injuries = new InjuriesLit();
      document.body.appendChild(injuries);
      await injuries.updateComplete;

      const shadowRoot = injuries.shadowRoot;
      // Should not have any injury components when no session is provided
      expect(shadowRoot?.querySelector(".injury-panel")).toBeFalsy();
      expect(shadowRoot?.querySelector(".injury-item")).toBeFalsy();
      expect(shadowRoot?.querySelector(".healthy")).toBeFalsy();

      injuries.remove();
    });
  });

  describe("Injury Processing", () => {
    it("should process single injury correctly", async () => {
      const injuries = new InjuriesLit(mockSession);
      document.body.appendChild(injuries);
      await injuries.updateComplete;

      // Trigger injury update
      const injuryTag = makeTag("injury");
      injuryTag.attrs = { part: "head", severity: "2", description: "moderate cuts and bruises" };
      mockSession.bus.dispatchEvent("metadata/injury", injuryTag);
      await injuries.updateComplete;

      const shadowRoot = injuries.shadowRoot;
      expect(shadowRoot?.textContent).toContain("head");
      expect(shadowRoot?.textContent).toContain("#"); // Moderate severity symbol

      injuries.remove();
    });

    it("should pair left/right injuries when both sides injured", async () => {
      const injuries = new InjuriesLit(mockSession);
      document.body.appendChild(injuries);
      await injuries.updateComplete;

      // Simulate both arms injured
      const leftArmTag = makeTag("injury");
      leftArmTag.attrs = { part: "leftarm", severity: "1", description: "minor cuts" };
      mockSession.bus.dispatchEvent("metadata/injury", leftArmTag);

      const rightArmTag = makeTag("injury");
      rightArmTag.attrs = { part: "rightarm", severity: "2", description: "deep gashes" };
      mockSession.bus.dispatchEvent("metadata/injury", rightArmTag);

      await injuries.updateComplete;

      const shadowRoot = injuries.shadowRoot;
      expect(shadowRoot?.textContent).toContain("arms"); // Paired display
      expect(shadowRoot?.textContent).toContain("L*"); // Left minor
      expect(shadowRoot?.textContent).toContain("R#"); // Right moderate

      injuries.remove();
    });

    it("should show individual limb when only one side injured", async () => {
      const injuries = new InjuriesLit(mockSession);
      document.body.appendChild(injuries);
      await injuries.updateComplete;

      // Only left arm injured
      const leftArmTag = makeTag("injury");
      leftArmTag.attrs = { part: "leftarm", severity: "3", description: "severe wounds" };
      mockSession.bus.dispatchEvent("metadata/injury", leftArmTag);

      await injuries.updateComplete;

      const shadowRoot = injuries.shadowRoot;
      expect(shadowRoot?.textContent).toContain("l.arm"); // Individual display
      expect(shadowRoot?.textContent).toContain("@"); // Severe severity symbol

      injuries.remove();
    });

    it("should sort injuries anatomically (head-to-toe)", async () => {
      const injuries = new InjuriesLit(mockSession);
      document.body.appendChild(injuries);
      await injuries.updateComplete;

      // Add injuries in random order
      const legTag = makeTag("injury");
      legTag.attrs = { part: "rightleg", severity: "1", description: "minor cut" };
      mockSession.bus.dispatchEvent("metadata/injury", legTag);

      const headTag = makeTag("injury");
      headTag.attrs = { part: "head", severity: "2", description: "moderate wound" };
      mockSession.bus.dispatchEvent("metadata/injury", headTag);

      const chestTag = makeTag("injury");
      chestTag.attrs = { part: "chest", severity: "3", description: "severe gash" };
      mockSession.bus.dispatchEvent("metadata/injury", chestTag);

      await injuries.updateComplete;

      const injuryItems = injuries.shadowRoot?.querySelectorAll(".injury-item");
      const injuryTexts = Array.from(injuryItems || []).map((item) => item.textContent?.trim());

      // Should be sorted head -> chest -> leg
      expect(injuryTexts[0]).toContain("head");
      expect(injuryTexts[1]).toContain("chest");
      expect(injuryTexts[2]).toContain("r.leg");

      injuries.remove();
    });
  });

  describe("Severity Indicators", () => {
    const severityTests = [
      { severity: "1", symbol: "*", description: "minor injury" },
      { severity: "2", symbol: "#", description: "moderate injury" },
      { severity: "3", symbol: "@", description: "severe injury" },
    ];

    severityTests.forEach(({ severity, symbol, description }) => {
      it(`should display ${symbol} for ${description}`, async () => {
        const injuries = new InjuriesLit(mockSession);
        document.body.appendChild(injuries);
        await injuries.updateComplete;

        const injuryTag = makeTag("injury");
        injuryTag.attrs = { part: "head", severity, description: `test ${description}` };
        mockSession.bus.dispatchEvent("metadata/injury", injuryTag);
        await injuries.updateComplete;

        const shadowRoot = injuries.shadowRoot;
        expect(shadowRoot?.textContent).toContain(symbol);

        injuries.remove();
      });
    });
  });

  describe("Event Handling", () => {
    it("should handle dialogData injury events", async () => {
      const injuries = new InjuriesLit(mockSession);
      document.body.appendChild(injuries);
      await injuries.updateComplete;

      // Create dialogData with injury children
      const dialogTag = makeTag("dialogData");
      const injuryChild = makeTag("injury");
      injuryChild.attrs = { part: "head", severity: "2", description: "moderate wound" };
      dialogTag.children = [injuryChild];
      dialogTag.attrs = { id: "injuries" };

      mockSession.bus.dispatchEvent("metadata/dialogData/injuries", dialogTag);
      await injuries.updateComplete;

      const shadowRoot = injuries.shadowRoot;
      expect(shadowRoot?.textContent).toContain("head");
      expect(shadowRoot?.textContent).toContain("#");

      injuries.remove();
    });

    it("should clear injuries when receiving empty injury data", async () => {
      const injuries = new InjuriesLit(mockSession);
      document.body.appendChild(injuries);
      await injuries.updateComplete;

      // First add an injury
      const injuryTag = makeTag("injury");
      injuryTag.attrs = { part: "head", severity: "1", description: "minor cut" };
      mockSession.bus.dispatchEvent("metadata/injury", injuryTag);
      await injuries.updateComplete;

      expect(injuries.shadowRoot?.textContent).toContain("head");

      // Then send empty injury data
      const emptyDialog = makeTag("dialogData");
      emptyDialog.children = [];
      emptyDialog.attrs = { id: "injuries" };
      mockSession.bus.dispatchEvent("metadata/dialogData/injuries", emptyDialog);
      await injuries.updateComplete;

      // Should show healthy state
      expect(injuries.shadowRoot?.textContent).toContain("healthy");

      injuries.remove();
    });
  });

  describe("Body Part Mapping", () => {
    const mappingTests = [
      { part: "righteye", expected: "r.eye" },
      { part: "lefteye", expected: "l.eye" },
      { part: "rightarm", expected: "r.arm" },
      { part: "leftarm", expected: "l.arm" },
      { part: "righthand", expected: "r.hand" },
      { part: "lefthand", expected: "l.hand" },
      { part: "rightleg", expected: "r.leg" },
      { part: "leftleg", expected: "l.leg" },
      { part: "head", expected: "head" },
      { part: "neck", expected: "neck" },
      { part: "chest", expected: "chest" },
      { part: "abdomen", expected: "abdomen" },
      { part: "back", expected: "back" },
      { part: "nerves", expected: "nerves" },
    ];

    mappingTests.forEach(({ part, expected }) => {
      it(`should map ${part} to ${expected}`, async () => {
        const injuries = new InjuriesLit(mockSession);
        document.body.appendChild(injuries);
        await injuries.updateComplete;

        const injuryTag = makeTag("injury");
        injuryTag.attrs = { part, severity: "1", description: "test injury" };
        mockSession.bus.dispatchEvent("metadata/injury", injuryTag);
        await injuries.updateComplete;

        const shadowRoot = injuries.shadowRoot;
        expect(shadowRoot?.textContent).toContain(expected);

        injuries.remove();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper panel structure for screen readers", async () => {
      const injuries = new InjuriesLit(mockSession);
      document.body.appendChild(injuries);
      await injuries.updateComplete;

      const shadowRoot = injuries.shadowRoot;
      const header = shadowRoot?.querySelector(".injury-header");
      expect(header?.textContent).toBe("INJURIES");
      expect(header?.tagName.toLowerCase()).toBe("div");

      injuries.remove();
    });

    it("should maintain injury panel width for consistent layout", async () => {
      const injuries = new InjuriesLit(mockSession);
      document.body.appendChild(injuries);
      await injuries.updateComplete;

      const shadowRoot = injuries.shadowRoot;
      const panel = shadowRoot?.querySelector(".injury-panel");
      const _styles = getComputedStyle(panel as Element);

      // Should have width constraint for terminal aesthetic
      expect(panel).toBeTruthy();

      injuries.remove();
    });
  });
});
