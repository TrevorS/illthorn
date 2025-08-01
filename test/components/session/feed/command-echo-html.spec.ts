import { describe, expect, test } from "vitest";
import { createCommandEchoHTML } from "../../../../src/frontend/components/session/feed/command-echo-html";

describe("createCommandEchoHTML", () => {
  describe("Regular commands", () => {
    test("should generate HTML for regular command", () => {
      const html = createCommandEchoHTML({ command: "look", isReplay: false });

      expect(html).toContain('class="command-echo"');
      expect(html).toContain('class="prefix"');
      expect(html).toContain(">></span>");
      expect(html).toContain('class="command-text"');
      expect(html).toContain(">look</span>");
      expect(html).toContain("--color-command-echo,");
      expect(html).toContain("font-style: italic"); // Command text is now italic
      expect(html).not.toContain('class="command-echo replay"');
    });

    test("should use proper CSS custom properties for regular commands", () => {
      const html = createCommandEchoHTML({ command: "inventory", isReplay: false });

      expect(html).toContain("--color-command-echo,");
      expect(html).toContain("--color-command-echo-border,");
      expect(html).toContain("--color-command-echo-bg,");
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
      expect(html).toContain("--color-command-echo-replay,");
      expect(html).toContain("font-style: italic");
    });

    test("should use proper CSS custom properties for replay commands", () => {
      const html = createCommandEchoHTML({ command: "heal", isReplay: true });

      expect(html).toContain("--color-command-echo-replay,");
      expect(html).toContain("--color-command-echo-replay-border,");
      expect(html).toContain("--color-command-echo-replay-bg,");
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
      expect(html).toContain(">></span>");
    });
  });

  describe("CSS structure", () => {
    test("should include all required CSS classes", () => {
      const html = createCommandEchoHTML({ command: "test", isReplay: false });

      expect(html).toContain('class="command-echo"');
      expect(html).toContain('class="prefix"');
      expect(html).toContain('class="command-text"');
    });

    test("should include proper inline styling", () => {
      const html = createCommandEchoHTML({ command: "test", isReplay: false });

      expect(html).toContain("font-family: var(--font-family-monospace");
      expect(html).toContain("MonoLisa");
      expect(html).toContain("display: block");
      expect(html).toContain("border-left:");
      expect(html).toContain("background-color:");
    });

    test("should have proper theme variable integration with fallbacks", () => {
      const regularHtml = createCommandEchoHTML({ command: "test", isReplay: false });
      const replayHtml = createCommandEchoHTML({ command: "test", isReplay: true });

      // Regular command should use theme variables with fallbacks
      expect(regularHtml).toContain("var(--color-text-secondary");
      expect(regularHtml).toContain("var(--color-border");
      expect(regularHtml).toContain("var(--color-surface-secondary");
      expect(regularHtml).toContain("#ccc"); // fallback
      expect(regularHtml).toContain("#666"); // fallback

      // Replay command should also use theme variables
      expect(replayHtml).toContain("var(--color-text-secondary");
      expect(replayHtml).toContain("var(--color-border");
      expect(replayHtml).toContain("var(--color-surface-secondary");
      expect(replayHtml).toContain("#ffcc00"); // fallback
      expect(replayHtml).toContain("#ff9900"); // fallback
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
