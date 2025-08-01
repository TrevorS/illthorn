import { describe, expect, test } from "vitest";
import { createCommandEchoHTML } from "../../../../src/frontend/components/session/feed/command-echo-html";

describe("createCommandEchoHTML", () => {
  describe("Regular commands", () => {
    test("should generate HTML for regular command", () => {
      const html = createCommandEchoHTML({ command: "look", isReplay: false });

      expect(html).toContain('class="command-echo"');
      expect(html).toContain('class="prefix"');
      expect(html).toContain("&gt;</span>");
      expect(html).toContain('class="command-text"');
      expect(html).toContain(">look</span>");
      expect(html).not.toContain('class="command-echo replay"');
    });

    test("should generate clean HTML without inline styles", () => {
      const html = createCommandEchoHTML({ command: "inventory", isReplay: false });

      // Should have proper CSS classes but no inline styles
      expect(html).toContain('class="command-echo"');
      expect(html).toContain('class="prefix"');
      expect(html).toContain('class="command-text"');
      expect(html).not.toContain("style=");
      expect(html).not.toContain("--color-command-echo-replay");
    });
  });

  describe("Replay commands", () => {
    test("should generate HTML for replay command", () => {
      const html = createCommandEchoHTML({ command: "cast 501", isReplay: true });

      expect(html).toContain('class="command-echo replay"');
      expect(html).toContain('class="prefix"');
      expect(html).toContain(">[Replay]</span>");
      expect(html).toContain('class="command-text"');
      expect(html).toContain(">cast 501</span>");
    });

    test("should generate clean HTML without inline styles for replay", () => {
      const html = createCommandEchoHTML({ command: "heal", isReplay: true });

      // Should have proper CSS classes but no inline styles
      expect(html).toContain('class="command-echo replay"');
      expect(html).toContain('class="prefix"');
      expect(html).toContain('class="command-text"');
      expect(html).not.toContain("style=");
    });
  });

  describe("HTML escaping", () => {
    test("should escape HTML special characters in command", () => {
      const html = createCommandEchoHTML({ command: "<script>alert('xss')</script>", isReplay: false });

      expect(html).toContain("&lt;script&gt;alert('xss')&lt;/script&gt;");
      expect(html).not.toContain("<script>");
    });

    test("should escape quotes and ampersands", () => {
      const html = createCommandEchoHTML({ command: 'say "Hello & goodbye"', isReplay: false });

      expect(html).toContain('say "Hello &amp; goodbye"');
    });

    test("should handle empty command", () => {
      const html = createCommandEchoHTML({ command: "", isReplay: false });

      expect(html).toContain('class="command-text"');
      expect(html).toContain("></span>");
      expect(html).toContain('class="prefix"');
      expect(html).toContain("&gt;</span>");
    });
  });

  describe("CSS structure", () => {
    test("should include all required CSS classes", () => {
      const html = createCommandEchoHTML({ command: "test", isReplay: false });

      expect(html).toContain('class="command-echo"');
      expect(html).toContain('class="prefix"');
      expect(html).toContain('class="command-text"');
    });

    test("should generate clean HTML without inline styling", () => {
      const html = createCommandEchoHTML({ command: "test", isReplay: false });

      // Should have CSS classes but no inline styles - styling handled by CSS
      expect(html).toContain('class="command-echo"');
      expect(html).not.toContain("style=");
      expect(html).not.toContain("font-family:");
      expect(html).not.toContain("display:");
      expect(html).not.toContain("border-left:");
      expect(html).not.toContain("background-color:");
    });

    test("should rely on CSS classes for theming", () => {
      const regularHtml = createCommandEchoHTML({ command: "test", isReplay: false });
      const replayHtml = createCommandEchoHTML({ command: "test", isReplay: true });

      // Should use CSS classes, not inline theme variables
      expect(regularHtml).toContain('class="command-echo"');
      expect(regularHtml).not.toContain("--color-");

      expect(replayHtml).toContain('class="command-echo replay"');
      expect(replayHtml).not.toContain("--color-");
    });
  });

  describe("DOM compatibility", () => {
    test("should produce valid HTML that can be parsed", () => {
      const html = createCommandEchoHTML({ command: "look around", isReplay: false });

      // Should be parseable as HTML
      const div = document.createElement("div");
      div.innerHTML = html;

      const echoElement = div.querySelector(".command-echo");
      expect(echoElement).toBeDefined();
      expect(echoElement?.querySelector(".prefix")?.textContent).toBe(">");
      expect(echoElement?.querySelector(".command-text")?.textContent).toBe("look around");
    });

    test("should maintain element structure after parsing", () => {
      const html = createCommandEchoHTML({ command: "inventory", isReplay: true });

      const div = document.createElement("div");
      div.innerHTML = html;

      const echoElement = div.querySelector(".command-echo.replay");
      expect(echoElement).toBeDefined();
      expect(echoElement?.querySelector(".prefix")?.textContent).toBe("[Replay]");
      expect(echoElement?.querySelector(".command-text")?.textContent).toBe("inventory");
    });
  });
});
