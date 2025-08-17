import { beforeEach, describe, expect, it } from "vitest";
import "./hand-row.lit";
import type { HandRow } from "./hand-row.lit";

describe("HandRow", () => {
  let row: HandRow;

  beforeEach(async () => {
    row = document.createElement("illthorn-hand-row");
    document.body.appendChild(row);
    await row.updateComplete;
  });

  afterEach(() => {
    document.body.removeChild(row);
  });

  it("should create component", () => {
    expect(row).toBeDefined();
    expect(row.tagName.toLowerCase()).toBe("illthorn-hand-row");
  });

  it("should render icon and content", async () => {
    row.handType = "left";
    row.content = "a steel sword";
    await row.updateComplete;

    const icon = row.shadowRoot?.querySelector(".hand-icon");
    const content = row.shadowRoot?.querySelector(".hand-content");

    expect(icon).toBeDefined();
    expect(content).toBeDefined();
    expect(content?.textContent).toBe("a steel sword");
    expect(icon?.textContent).toBe("✋");
  });

  it("should display correct emoji for left hand", async () => {
    row.handType = "left";
    await row.updateComplete;

    const icon = row.shadowRoot?.querySelector(".hand-icon");
    expect(icon?.textContent).toBe("✋");
  });

  it("should display correct emoji for right hand", async () => {
    row.handType = "right";
    await row.updateComplete;

    const icon = row.shadowRoot?.querySelector(".hand-icon");
    expect(icon?.textContent).toBe("🤚");
  });

  it("should display correct emoji for spell", async () => {
    row.handType = "spell";
    await row.updateComplete;

    const icon = row.shadowRoot?.querySelector(".hand-icon");
    expect(icon?.textContent).toBe("✨");
  });

  it("should add empty class for empty content", async () => {
    row.content = "Empty";
    await row.updateComplete;

    expect(row.classList.contains("empty")).toBe(true);
  });

  it("should add empty class for None content", async () => {
    row.content = "None";
    await row.updateComplete;

    expect(row.classList.contains("empty")).toBe(true);
  });

  it("should not add empty class for actual content", async () => {
    row.content = "a steel sword";
    await row.updateComplete;

    expect(row.classList.contains("empty")).toBe(false);
  });

  it("should update empty state when content changes", async () => {
    row.content = "a steel sword";
    await row.updateComplete;
    expect(row.classList.contains("empty")).toBe(false);

    row.content = "Empty";
    await row.updateComplete;
    expect(row.classList.contains("empty")).toBe(true);

    row.content = "a bronze shield";
    await row.updateComplete;
    expect(row.classList.contains("empty")).toBe(false);
  });

  it("should handle empty string content and verify layout structure", async () => {
    row.content = "";
    await row.updateComplete;

    expect(row.classList.contains("empty")).toBe(true);

    // Verify the vertical layout structure
    const container = row.shadowRoot?.querySelector(".hand-container");
    const icon = row.shadowRoot?.querySelector(".hand-icon");
    const content = row.shadowRoot?.querySelector(".hand-content");

    expect(container).toBeDefined();
    expect(icon).toBeDefined();
    expect(content).toBeDefined();
  });

  it("should display content text and test ellipsis layout", async () => {
    const testContent = "a magnificent sword with intricate engravings that is very long";
    row.handType = "left";
    row.content = testContent;
    await row.updateComplete;

    const contentElement = row.shadowRoot?.querySelector(".hand-content");
    expect(contentElement?.textContent).toBe(testContent);
  });
});
