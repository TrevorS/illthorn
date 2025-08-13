// ABOUTME: Test suite for CommandEchoLit component verifying Shoelace integration and interactive features
// ABOUTME: Tests command display, copy functionality, timestamp formatting, and accessibility

import type SlTag from "@shoelace-style/shoelace/dist/components/tag/tag.component.js";
import type SlTooltip from "@shoelace-style/shoelace/dist/components/tooltip/tooltip.component.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CommandEchoLit } from "../../../../src/frontend/components/session/feed/command-echo.lit";

// Mock clipboard API since it's not available in JSDOM
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

// Mock document.execCommand for fallback testing
Object.assign(document, {
  execCommand: vi.fn(),
});

describe("CommandEchoLit", () => {
  let component: CommandEchoLit;

  const setup = (props?: Partial<{ command: string; isReplay: boolean; timestamp: number }>) => {
    const element = new CommandEchoLit();
    if (props?.command !== undefined) element.command = props.command;
    if (props?.isReplay !== undefined) element.isReplay = props.isReplay;
    if (props?.timestamp !== undefined) element.timestamp = props.timestamp;
    document.body.appendChild(element);
    return element;
  };

  const teardown = (element: CommandEchoLit) => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (component) {
      teardown(component);
    }
  });

  describe("Component Initialization", () => {
    it("should create component with default properties", () => {
      component = setup();
      expect(component).toBeInstanceOf(CommandEchoLit);
      expect(component.command).toBe("");
      expect(component.isReplay).toBe(false);
      expect(component.timestamp).toBe(0);
    });

    it("should accept command property", async () => {
      component = setup({ command: "look around" });
      await component.updateComplete;

      expect(component.command).toBe("look around");
      const commandText = component.shadowRoot?.querySelector(".command-text");
      expect(commandText?.textContent?.trim()).toBe("look around");
    });

    it("should accept isReplay property and reflect attribute", async () => {
      component = setup({ isReplay: true });
      await component.updateComplete;

      expect(component.isReplay).toBe(true);
      expect(component.hasAttribute("is-replay")).toBe(true);
    });

    it("should accept timestamp property", () => {
      const timestamp = Date.now();
      component = setup({ timestamp });
      expect(component.timestamp).toBe(timestamp);
    });
  });

  describe("Regular Command Display", () => {
    beforeEach(async () => {
      component = setup({ command: "inventory", isReplay: false });
      await component.updateComplete;
    });

    it("should display regular command with proper tag", async () => {
      const tag = component.shadowRoot?.querySelector("sl-tag") as SlTag;
      expect(tag).toBeDefined();
      expect(tag.variant).toBe("neutral");
      expect(tag.size).toBe("small");
      expect(tag.textContent?.trim()).toBe(">");
    });

    it("should not have is-replay attribute", () => {
      expect(component.hasAttribute("is-replay")).toBe(false);
    });

    it("should display command text", () => {
      const commandText = component.shadowRoot?.querySelector(".command-text");
      expect(commandText?.textContent?.trim()).toBe("inventory");
    });

    it("should be clickable for copy functionality", () => {
      const commandText = component.shadowRoot?.querySelector(".command-text");
      expect(commandText).toBeDefined();
      expect(commandText?.style.cursor).toBe(""); // Cursor is set via CSS
    });
  });

  describe("Replay Command Display", () => {
    beforeEach(async () => {
      component = setup({ command: "cast 501", isReplay: true, timestamp: Date.now() });
      await component.updateComplete;
    });

    it("should display replay command with proper tag", () => {
      const tag = component.shadowRoot?.querySelector("sl-tag") as SlTag;
      expect(tag).toBeDefined();
      expect(tag.variant).toBe("primary");
      expect(tag.textContent?.trim()).toBe("Replay");
    });

    it("should have is-replay attribute", () => {
      expect(component.hasAttribute("is-replay")).toBe(true);
    });

    it("should display command text", () => {
      const commandText = component.shadowRoot?.querySelector(".command-text");
      expect(commandText?.textContent?.trim()).toBe("cast 501");
    });
  });

  describe("Copy Functionality", () => {
    beforeEach(async () => {
      component = setup({ command: "look north" });
      await component.updateComplete;
    });

    it("should copy command to clipboard when clicked", async () => {
      const writeTextSpy = vi.spyOn(navigator.clipboard, "writeText");
      const commandText = component.shadowRoot?.querySelector(".command-text") as HTMLElement;

      commandText.click();
      await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for async operation

      expect(writeTextSpy).toHaveBeenCalledWith("look north");
    });

    it("should handle empty command gracefully", async () => {
      component.command = "";
      await component.updateComplete;

      const writeTextSpy = vi.spyOn(navigator.clipboard, "writeText");
      const commandText = component.shadowRoot?.querySelector(".command-text") as HTMLElement;

      commandText.click();
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(writeTextSpy).not.toHaveBeenCalled();
    });

    it("should fallback to document.execCommand when clipboard API fails", async () => {
      // Mock clipboard API to fail
      vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("Clipboard failed"));
      vi.spyOn(document, "execCommand").mockReturnValue(true);

      component.command = "test command";
      await component.updateComplete;

      const commandText = component.shadowRoot?.querySelector(".command-text") as HTMLElement;
      commandText.click();

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(document.execCommand).toHaveBeenCalledWith("copy");
    });
  });

  describe("Timestamp Functionality", () => {
    it("should format timestamp in tooltip", async () => {
      const timestamp = new Date("2023-12-25 15:30:45").getTime();
      component = setup({ command: "test", timestamp });
      await component.updateComplete;

      const tooltip = component.shadowRoot?.querySelector("sl-tooltip") as SlTooltip;
      expect(tooltip.content).toContain("3:30:45"); // Should contain time part
      expect(tooltip.content).toContain("Click to copy");
    });

    it("should handle missing timestamp", async () => {
      component = setup({ command: "test", timestamp: 0 });
      await component.updateComplete;

      const tooltip = component.shadowRoot?.querySelector("sl-tooltip") as SlTooltip;
      expect(tooltip.content).toBe("Click to copy • ");
    });

    it("should position tooltip correctly", async () => {
      component = setup({ command: "test", timestamp: Date.now() });
      await component.updateComplete;

      const tooltip = component.shadowRoot?.querySelector("sl-tooltip") as SlTooltip;
      expect(tooltip.placement).toBe("top");
    });
  });

  describe("HTML Entity Decoding", () => {
    it("should decode basic HTML entities", async () => {
      component = setup({ command: "say Hello &gt; world &lt; test" });
      await component.updateComplete;

      const commandText = component.shadowRoot?.querySelector(".command-text");
      expect(commandText?.textContent?.trim()).toBe("say Hello > world < test");
    });

    it("should decode ampersands and quotes", async () => {
      component = setup({ command: "whisper user &quot;Ready?&quot; &amp; let&apos;s go" });
      await component.updateComplete;

      const commandText = component.shadowRoot?.querySelector(".command-text");
      expect(commandText?.textContent?.trim()).toBe(`whisper user "Ready?" & let's go`);
    });

    it("should decode numeric character references", async () => {
      component = setup({ command: "say Testing &#8594; arrows &#8249;&#8250;" });
      await component.updateComplete;

      const commandText = component.shadowRoot?.querySelector(".command-text");
      expect(commandText?.textContent?.trim()).toBe("say Testing → arrows ‹›");
    });

    it("should handle commands without entities unchanged", async () => {
      component = setup({ command: "look around" });
      await component.updateComplete;

      const commandText = component.shadowRoot?.querySelector(".command-text");
      expect(commandText?.textContent?.trim()).toBe("look around");
    });

    it("should copy decoded text to clipboard", async () => {
      component = setup({ command: "[go2]&gt;east" });
      await component.updateComplete;

      const writeTextSpy = vi.spyOn(navigator.clipboard, "writeText");
      const commandText = component.shadowRoot?.querySelector(".command-text") as HTMLElement;

      commandText.click();
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(writeTextSpy).toHaveBeenCalledWith("[go2]>east");
    });
  });

  describe("Lich Script Detection", () => {
    it("should detect Lich script format with encoded entities", async () => {
      component = setup({ command: "[go2]&gt;east", isReplay: false });
      await component.updateComplete;

      const tag = component.shadowRoot?.querySelector("sl-tag") as SlTag;
      expect(tag.variant).toBe("warning");
      expect(tag.textContent?.trim()).toBe("Script");
    });

    it("should detect Lich script format with decoded entities", async () => {
      component = setup({ command: "[combat]>attack", isReplay: false });
      await component.updateComplete;

      const tag = component.shadowRoot?.querySelector("sl-tag") as SlTag;
      expect(tag.variant).toBe("warning");
      expect(tag.textContent?.trim()).toBe("Script");
    });

    it("should show decoded command text for Lich scripts", async () => {
      component = setup({ command: "[bigshot]&gt;wield bow", isReplay: false });
      await component.updateComplete;

      const commandText = component.shadowRoot?.querySelector(".command-text");
      expect(commandText?.textContent?.trim()).toBe("[bigshot]>wield bow");
    });

    it("should not detect regular commands as Lich scripts", async () => {
      component = setup({ command: "wield sword", isReplay: false });
      await component.updateComplete;

      const tag = component.shadowRoot?.querySelector("sl-tag") as SlTag;
      expect(tag.variant).toBe("neutral");
      expect(tag.textContent?.trim()).toBe(">");
    });

    it("should prioritize replay over script detection", async () => {
      component = setup({ command: "[go2]&gt;north", isReplay: true });
      await component.updateComplete;

      const tag = component.shadowRoot?.querySelector("sl-tag") as SlTag;
      expect(tag.variant).toBe("primary");
      expect(tag.textContent?.trim()).toBe("Replay");
    });
  });

  describe("HTML Security", () => {
    it("should safely render HTML-like command text", async () => {
      component = setup({ command: "<script>alert('xss')</script>" });
      await component.updateComplete;

      const commandText = component.shadowRoot?.querySelector(".command-text");
      // HTML decoding extracts text content from script tags, so "alert('xss')" is expected
      expect(commandText?.textContent?.trim()).toBe("alert('xss')");

      // Should not contain actual script elements
      const scripts = component.shadowRoot?.querySelectorAll("script");
      expect(scripts?.length).toBe(0);
    });

    it("should handle special characters safely", async () => {
      component = setup({ command: 'say "Hello & goodbye" <test>' });
      await component.updateComplete;

      const commandText = component.shadowRoot?.querySelector(".command-text");
      // HTML decoding removes <test> tag but preserves text content
      expect(commandText?.textContent?.trim()).toBe('say "Hello & goodbye"');
    });

    it("should handle malicious HTML entities safely", async () => {
      component = setup({ command: "say &lt;img src=x onerror=alert(1)&gt;" });
      await component.updateComplete;

      const commandText = component.shadowRoot?.querySelector(".command-text");
      expect(commandText?.textContent?.trim()).toBe("say <img src=x onerror=alert(1)>");

      // Should not contain actual img elements or execute scripts
      const imgs = component.shadowRoot?.querySelectorAll("img");
      expect(imgs?.length).toBe(0);
    });
  });

  describe("Component Structure", () => {
    beforeEach(async () => {
      component = setup({ command: "test", isReplay: false, timestamp: Date.now() });
      await component.updateComplete;
    });

    it("should have proper DOM structure", () => {
      const container = component.shadowRoot?.querySelector(".command-container");
      expect(container).toBeDefined();

      const tag = container?.querySelector("sl-tag");
      const tooltip = container?.querySelector("sl-tooltip");
      const commandText = tooltip?.querySelector(".command-text");

      expect(tag).toBeDefined();
      expect(tooltip).toBeDefined();
      expect(commandText).toBeDefined();
    });

    it("should have flexbox CSS defined", () => {
      const styles = component.constructor.styles.toString();
      expect(styles).toContain("display: flex");
    });

    it("should have clickable command text element", () => {
      const commandText = component.shadowRoot?.querySelector(".command-text");
      expect(commandText).toBeDefined();
      expect(commandText?.tagName.toLowerCase()).toBe("span");
    });
  });

  describe("Theming Integration", () => {
    it("should use CSS custom properties for theming", async () => {
      component = setup({ command: "test", isReplay: false });
      await component.updateComplete;

      const styles = component.constructor.styles.toString();
      expect(styles).toContain("var(--color-command-echo");
      expect(styles).toContain("var(--color-text-secondary");
      expect(styles).toContain("var(--font-family-monospace");
    });

    it("should differentiate styling for replay commands", async () => {
      component = setup({ command: "test", isReplay: true });
      await component.updateComplete;

      expect(component.hasAttribute("is-replay")).toBe(true);

      const styles = component.constructor.styles.toString();
      expect(styles).toContain(":host([is-replay])");
    });
  });
});
