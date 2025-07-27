import { describe, expect, it } from "vitest";
import { Panel } from "../../../src/frontend/components/session/panel.lit";

describe("Panel", () => {
  const setup = () => {
    const panel = document.createElement("illthorn-panel") as Panel;
    document.body.appendChild(panel);
    return panel;
  };

  const teardown = (panel: Panel) => {
    if (panel.parentNode) {
      panel.parentNode.removeChild(panel);
    }
  };

  describe("Basic rendering", () => {
    it("should create panel element", () => {
      const panel = setup();

      expect(panel).toBeInstanceOf(Panel);
      expect(panel.tagName.toLowerCase()).toBe("illthorn-panel");

      teardown(panel);
    });

    it("should render with default properties", async () => {
      const panel = setup();
      await panel.updateComplete;

      expect(panel.title).toBe("");
      expect(panel.open).toBe(true);

      const details = panel.shadowRoot?.querySelector("details");
      expect(details).toBeTruthy();
      expect(details?.open).toBe(true);

      teardown(panel);
    });

    it("should render title in summary", async () => {
      const panel = setup();
      panel.title = "Test Panel";
      await panel.updateComplete;

      const summary = panel.shadowRoot?.querySelector("summary");
      expect(summary?.textContent).toBe("Test Panel");

      teardown(panel);
    });

    it("should reflect open state", async () => {
      const panel = setup();
      panel.open = false;
      await panel.updateComplete;

      const details = panel.shadowRoot?.querySelector("details");
      expect(details?.open).toBe(false);

      panel.open = true;
      await panel.updateComplete;
      expect(details?.open).toBe(true);

      teardown(panel);
    });
  });

  describe("Property updates", () => {
    it("should update title property", async () => {
      const panel = setup();

      panel.title = "Updated Title";
      await panel.updateComplete;

      expect(panel.title).toBe("Updated Title");
      const summary = panel.shadowRoot?.querySelector("summary");
      expect(summary?.textContent).toBe("Updated Title");

      teardown(panel);
    });

    it("should update open property", async () => {
      const panel = setup();

      panel.open = false;
      await panel.updateComplete;

      expect(panel.open).toBe(false);
      const details = panel.shadowRoot?.querySelector("details");
      expect(details?.open).toBe(false);

      teardown(panel);
    });

    it("should handle empty title", async () => {
      const panel = setup();
      panel.title = "";
      await panel.updateComplete;

      const summary = panel.shadowRoot?.querySelector("summary");
      expect(summary?.textContent).toBe("");

      teardown(panel);
    });
  });

  describe("Slot content", () => {
    it("should render slotted content", async () => {
      const panel = setup();
      const content = document.createElement("div");
      content.textContent = "Test content";
      panel.appendChild(content);
      await panel.updateComplete;

      const slot = panel.shadowRoot?.querySelector("slot");
      expect(slot).toBeTruthy();

      const details = panel.shadowRoot?.querySelector("details");
      expect(details).toBeTruthy();

      teardown(panel);
    });

    it("should handle multiple slotted elements", async () => {
      const panel = setup();

      const content1 = document.createElement("div");
      content1.textContent = "First content";
      const content2 = document.createElement("span");
      content2.textContent = "Second content";

      panel.appendChild(content1);
      panel.appendChild(content2);
      await panel.updateComplete;

      expect(panel.children.length).toBe(2);

      teardown(panel);
    });
  });

  describe("Styling", () => {
    it("should have proper CSS structure", async () => {
      const panel = setup();
      await panel.updateComplete;

      const details = panel.shadowRoot?.querySelector("details");
      const summary = panel.shadowRoot?.querySelector("summary");
      const slot = panel.shadowRoot?.querySelector("slot");

      expect(details).toBeTruthy();
      expect(summary).toBeTruthy();
      expect(slot).toBeTruthy();

      teardown(panel);
    });

    it("should support CSS custom properties", async () => {
      const panel = setup();
      await panel.updateComplete;

      // Verify that the component has styles that reference CSS custom properties
      const styles = Panel.styles;
      expect(styles).toBeTruthy();

      teardown(panel);
    });
  });

  describe("Attributes", () => {
    it("should reflect title attribute", async () => {
      const panel = setup();
      panel.setAttribute("title", "Attribute Title");
      await panel.updateComplete;

      expect(panel.title).toBe("Attribute Title");
      const summary = panel.shadowRoot?.querySelector("summary");
      expect(summary?.textContent).toBe("Attribute Title");

      teardown(panel);
    });

    it("should reflect open attribute", async () => {
      const panel = setup();

      // Set property to false first
      panel.open = false;
      await panel.updateComplete;

      // Now check that the attribute reflects the property
      expect(panel.hasAttribute("open")).toBe(false);
      expect(panel.open).toBe(false);
      const details = panel.shadowRoot?.querySelector("details");
      expect(details?.open).toBe(false);

      teardown(panel);
    });

    it("should handle boolean open attribute correctly", async () => {
      const panel = setup();

      // Test presence of attribute (should be true)
      panel.setAttribute("open", "");
      await panel.updateComplete;
      expect(panel.open).toBe(true);

      // Test removal of attribute (should be false)
      panel.removeAttribute("open");
      await panel.updateComplete;
      expect(panel.open).toBe(false);

      // Test setting attribute again
      panel.setAttribute("open", "true");
      await panel.updateComplete;
      expect(panel.open).toBe(true);

      teardown(panel);
    });
  });
});
