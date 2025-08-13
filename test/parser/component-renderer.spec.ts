// ABOUTME: Test suite for ComponentRenderer to verify HTML entity decoding and game text rendering
// ABOUTME: Tests the modernized component-based rendering system with proper entity handling

import { render } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ComponentRenderer } from "../../src/frontend/parser/component-renderer";
import { makeTag } from "../../src/frontend/parser/tag";

describe("ComponentRenderer", () => {
  let renderer: ComponentRenderer;
  let container: HTMLElement;

  beforeEach(() => {
    renderer = new ComponentRenderer();
    // Create a container for rendering templates
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up container
    if (container?.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  // Helper function to render template and get text content
  const renderAndGetText = (templates: Array<unknown>): string => {
    container.innerHTML = "";
    // Create a wrapper div for each template to prevent overwriting
    const wrapper = document.createElement("div");
    for (const template of templates) {
      const templateContainer = document.createElement("span");
      render(template, templateContainer);
      wrapper.appendChild(templateContainer);
    }
    container.appendChild(wrapper);
    return container.textContent || "";
  };

  describe("HTML Entity Decoding", () => {
    it("should decode basic HTML entities in text nodes", () => {
      const textTag = makeTag(":text");
      textTag.text = "[go2]&gt;east";

      const result = renderer.render([textTag]);

      // The template should contain decoded text
      expect(result.content.length).toBe(1);

      // Render template to DOM and check text content
      const textContent = renderAndGetText(result.content);
      expect(textContent).toContain("[go2]>east");
      expect(textContent).not.toContain("&gt;");
    });

    it("should decode multiple HTML entities", () => {
      const textTag = makeTag(":text");
      textTag.text = "say &quot;Hello &amp; goodbye&quot; &lt;test&gt;";

      const result = renderer.render([textTag]);

      expect(result.content.length).toBe(1);

      const textContent = renderAndGetText(result.content);
      expect(textContent).toContain('say "Hello & goodbye" <test>');
      expect(textContent).not.toContain("&quot;");
      expect(textContent).not.toContain("&amp;");
      expect(textContent).not.toContain("&lt;");
      expect(textContent).not.toContain("&gt;");
    });

    it("should decode numeric character references", () => {
      const textTag = makeTag(":text");
      textTag.text = "Testing &#8594; arrows &#8249;&#8250;";

      const result = renderer.render([textTag]);

      expect(result.content.length).toBe(1);

      const textContent = renderAndGetText(result.content);
      expect(textContent).toContain("Testing → arrows ‹›");
    });

    it("should handle text without entities unchanged", () => {
      const textTag = makeTag(":text");
      textTag.text = "Normal text without entities";

      const result = renderer.render([textTag]);

      expect(result.content.length).toBe(1);

      const textContent = renderAndGetText(result.content);
      expect(textContent).toContain("Normal text without entities");
    });

    it("should handle empty text gracefully", () => {
      const textTag = makeTag(":text");
      textTag.text = "";

      const result = renderer.render([textTag]);

      // Should return template with empty content for empty string
      expect(result.content.length).toBe(1);

      const textContent = renderAndGetText(result.content);
      expect(textContent).toBe("");
    });

    it("should handle undefined text gracefully", () => {
      const textTag = makeTag(":text");
      // Explicitly set text to undefined
      // biome-ignore lint/suspicious/noExplicitAny: Testing undefined text property
      (textTag as any).text = undefined;

      const result = renderer.render([textTag]);

      // Should return no template for undefined text
      expect(result.content.length).toBe(0);
    });
  });

  describe("Lich Script Command Handling", () => {
    it("should properly decode Lich script commands", () => {
      const textTag = makeTag(":text");
      textTag.text = "[go2]&gt;east";

      const result = renderer.render([textTag]);

      expect(result.content.length).toBe(1);

      const textContent = renderAndGetText(result.content);
      expect(textContent).toContain("[go2]>east");
    });

    it("should handle complex Lich script patterns", () => {
      const textTag = makeTag(":text");
      textTag.text = "[bigshot]&gt;wield bow &amp; shoot target";

      const result = renderer.render([textTag]);

      expect(result.content.length).toBe(1);

      const textContent = renderAndGetText(result.content);
      expect(textContent).toContain("[bigshot]>wield bow & shoot target");
    });

    it("should handle multiple Lich commands in sequence", () => {
      const commands = ["[go2]&gt;east", "[go2]&gt;go archway", "Normal text content"];

      const tags = commands.map((cmd) => {
        const tag = makeTag(":text");
        tag.text = cmd;
        return tag;
      });

      const result = renderer.render(tags);

      expect(result.content.length).toBe(3);

      const textContent = renderAndGetText(result.content);

      expect(textContent).toContain("[go2]>east");
      expect(textContent).toContain("[go2]>go archway");
      expect(textContent).toContain("Normal text content");
    });
  });

  describe("Security", () => {
    it("should safely handle HTML-like content", () => {
      const textTag = makeTag(":text");
      textTag.text = "<script>alert('xss')</script>";

      const result = renderer.render([textTag]);

      expect(result.content.length).toBe(1);

      const textContent = renderAndGetText(result.content);
      // HTML decoding should extract text content, not execute scripts
      expect(textContent).toContain("alert('xss')");
      expect(textContent).not.toContain("<script>");
    });

    it("should handle malicious HTML entities safely", () => {
      const textTag = makeTag(":text");
      textTag.text = "&lt;img src=x onerror=alert(1)&gt;";

      const result = renderer.render([textTag]);

      expect(result.content.length).toBe(1);

      const textContent = renderAndGetText(result.content);
      expect(textContent).toContain("<img src=x onerror=alert(1)>");
      // Should be rendered as text, not as actual HTML elements
    });
  });

  describe("Mixed Content Rendering", () => {
    it("should decode entities in text while preserving component structure", () => {
      // Create a mixed content structure
      const outputTag = makeTag("output");
      outputTag.attrs = { class: "room" };

      const textChild = makeTag(":text");
      textChild.text = "Room: Test Location &gt; with entities";
      outputTag.children = [textChild];

      const result = renderer.render([outputTag]);

      expect(result.content.length).toBe(1);

      const textContent = renderAndGetText(result.content);
      expect(textContent).toContain("Room: Test Location > with entities");
      expect(textContent).not.toContain("&gt;");
    });

    it("should maintain rendering statistics accuracy", () => {
      const tags = [makeTag(":text"), makeTag("a"), makeTag("d")];

      tags[0].text = "Some text with &gt; entities";
      tags[1].attrs = { exist: "123" };
      tags[2].attrs = { cmd: "look" };

      const _result = renderer.render(tags);
      const stats = renderer.getRenderStats(tags);

      expect(stats.totalTags).toBe(3);
      expect(stats.textNodes).toBe(1);
      expect(stats.componentTags).toBe(2);
    });
  });
});
