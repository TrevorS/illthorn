import { beforeEach, describe, expect, it } from "vitest";
import "./hands-ui.lit";
import type { HandsUI } from "./hands-ui.lit";

describe("HandsUI", () => {
  let ui: HandsUI;

  beforeEach(async () => {
    ui = document.createElement("illthorn-hands-ui");
    document.body.appendChild(ui);
    await ui.updateComplete;
  });

  afterEach(() => {
    document.body.removeChild(ui);
  });

  it("should create component", () => {
    expect(ui).toBeDefined();
    expect(ui.tagName.toLowerCase()).toBe("illthorn-hands-ui");
  });

  it("should render three hand rows", async () => {
    await ui.updateComplete;

    const handRows = ui.shadowRoot?.querySelectorAll("illthorn-hand-row");
    expect(handRows).toBeDefined();
    expect(handRows?.length).toBe(3);
  });

  it("should pass content to hand rows", async () => {
    ui.leftContent = "a steel sword";
    ui.rightContent = "a bronze shield";
    ui.spellContent = "Fire Shield";
    await ui.updateComplete;

    const leftRow = ui.shadowRoot?.querySelector('illthorn-hand-row[handType="left"]');
    const rightRow = ui.shadowRoot?.querySelector('illthorn-hand-row[handType="right"]');
    const spellRow = ui.shadowRoot?.querySelector('illthorn-hand-row[handType="spell"]');

    expect(leftRow?.getAttribute("content")).toBe("a steel sword");
    expect(rightRow?.getAttribute("content")).toBe("a bronze shield");
    expect(spellRow?.getAttribute("content")).toBe("Fire Shield");
  });

  it("should set correct handType attributes", async () => {
    await ui.updateComplete;

    const leftRow = ui.shadowRoot?.querySelector('illthorn-hand-row[handType="left"]');
    const rightRow = ui.shadowRoot?.querySelector('illthorn-hand-row[handType="right"]');
    const spellRow = ui.shadowRoot?.querySelector('illthorn-hand-row[handType="spell"]');

    expect(leftRow?.getAttribute("handtype")).toBe("left");
    expect(rightRow?.getAttribute("handtype")).toBe("right");
    expect(spellRow?.getAttribute("handtype")).toBe("spell");
  });

  it("should use default content values", async () => {
    await ui.updateComplete;

    const leftRow = ui.shadowRoot?.querySelector('illthorn-hand-row[handType="left"]');
    const rightRow = ui.shadowRoot?.querySelector('illthorn-hand-row[handType="right"]');
    const spellRow = ui.shadowRoot?.querySelector('illthorn-hand-row[handType="spell"]');

    expect(leftRow?.getAttribute("content")).toBe("Empty");
    expect(rightRow?.getAttribute("content")).toBe("Empty");
    expect(spellRow?.getAttribute("content")).toBe("None");
  });

  it("should update content reactively", async () => {
    await ui.updateComplete;

    // Change content
    ui.leftContent = "new weapon";
    await ui.updateComplete;

    const leftRow = ui.shadowRoot?.querySelector('illthorn-hand-row[handType="left"]');
    expect(leftRow?.getAttribute("content")).toBe("new weapon");
  });
});
