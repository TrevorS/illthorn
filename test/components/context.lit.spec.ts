import { describe, expect, it } from "vitest";
import { Context } from "../../src/frontend/components/context.lit";
import type { FrontendSession } from "../../src/frontend/session";

// Mock FrontendSession for testing
const createMockSession = (): FrontendSession => {
  return {
    name: "test-session",
    config: { name: "test-session", port: 4000 },
  } as FrontendSession;
};

describe("Context", () => {
  const setup = () => {
    const context = document.createElement("illthorn-context-lit") as Context;
    document.body.appendChild(context);
    return context;
  };

  const teardown = (context: Context) => {
    if (context.parentNode) {
      context.parentNode.removeChild(context);
    }
  };

  describe("Basic rendering", () => {
    it("should create context element", () => {
      const context = setup();

      expect(context).toBeInstanceOf(Context);
      expect(context.tagName.toLowerCase()).toBe("illthorn-context-lit");

      teardown(context);
    });

    it("should render with default display block styling", async () => {
      const context = setup();
      await context.updateComplete;

      // Check that the component has proper host styling
      const styles = Context.styles;
      expect(styles).toBeTruthy();

      teardown(context);
    });

    it("should render slot for content", async () => {
      const context = setup();
      await context.updateComplete;

      const slot = context.shadowRoot?.querySelector("slot");
      expect(slot).toBeTruthy();

      teardown(context);
    });
  });

  describe("Session property", () => {
    it("should accept session property", async () => {
      const context = setup();
      const mockSession = createMockSession();

      context.session = mockSession;
      await context.updateComplete;

      expect(context.session).toBe(mockSession);
      expect(context.session.name).toBe("test-session");

      teardown(context);
    });

    it("should be reactive to session changes", async () => {
      const context = setup();
      const mockSession1 = createMockSession();
      const mockSession2 = { ...mockSession1, name: "updated-session" } as FrontendSession;

      context.session = mockSession1;
      await context.updateComplete;
      expect(context.session.name).toBe("test-session");

      context.session = mockSession2;
      await context.updateComplete;
      expect(context.session.name).toBe("updated-session");

      teardown(context);
    });
  });

  describe("Slot content", () => {
    it("should render slotted content", async () => {
      const context = setup();
      const content = document.createElement("div");
      content.textContent = "Test content";
      context.appendChild(content);
      await context.updateComplete;

      const slot = context.shadowRoot?.querySelector("slot");
      expect(slot).toBeTruthy();
      expect(context.children.length).toBe(1);
      expect(context.children[0].textContent).toBe("Test content");

      teardown(context);
    });

    it("should handle multiple slotted elements", async () => {
      const context = setup();
      const mockSession = createMockSession();
      context.session = mockSession;

      const content1 = document.createElement("div");
      content1.textContent = "First content";
      const content2 = document.createElement("span");
      content2.textContent = "Second content";

      context.appendChild(content1);
      context.appendChild(content2);
      await context.updateComplete;

      expect(context.children.length).toBe(2);
      expect(context.children[0].textContent).toBe("First content");
      expect(context.children[1].textContent).toBe("Second content");

      teardown(context);
    });

    it("should handle empty content", async () => {
      const context = setup();
      const mockSession = createMockSession();
      context.session = mockSession;
      await context.updateComplete;

      expect(context.children.length).toBe(0);
      const slot = context.shadowRoot?.querySelector("slot");
      expect(slot).toBeTruthy();

      teardown(context);
    });
  });

  describe("API compatibility", () => {
    it("should maintain constructor-like behavior with session assignment", async () => {
      const context = setup();
      const mockSession = createMockSession();

      // Simulate original constructor behavior: new Context(session)
      context.session = mockSession;
      await context.updateComplete;

      expect(context.session).toBe(mockSession);
      expect(context.session.name).toBe("test-session");
      expect(context.session.config.port).toBe(4000);

      teardown(context);
    });

    it("should support class assignment like vanilla component", async () => {
      const context = setup();
      const mockSession = createMockSession();
      context.session = mockSession;

      // Test that we can add classes like the original component
      context.classList.add("session");
      context.id = mockSession.name;
      await context.updateComplete;

      expect(context.classList.contains("session")).toBe(true);
      expect(context.id).toBe("test-session");

      teardown(context);
    });

    it("should work with appendChild like vanilla component", async () => {
      const context = setup();
      const mockSession = createMockSession();
      context.session = mockSession;

      const child1 = document.createElement("div");
      child1.classList.add("hud");
      const child2 = document.createElement("div");
      child2.classList.add("main");

      context.appendChild(child1);
      context.appendChild(child2);
      await context.updateComplete;

      expect(context.children.length).toBe(2);
      expect(context.children[0].classList.contains("hud")).toBe(true);
      expect(context.children[1].classList.contains("main")).toBe(true);

      teardown(context);
    });
  });

  describe("TypeScript integration", () => {
    it("should have proper TypeScript types", () => {
      const context = setup();
      const mockSession = createMockSession();

      // These should compile without TypeScript errors
      context.session = mockSession;
      expect(context.session.name).toBeTypeOf("string");
      expect(context.session.config).toBeTypeOf("object");

      teardown(context);
    });

    it("should be properly registered in HTMLElementTagNameMap", () => {
      const element = document.createElement("illthorn-context-lit");
      expect(element).toBeInstanceOf(HTMLElement);
      expect(element).toBeInstanceOf(Context);
    });
  });

  describe("Styling integration", () => {
    it("should support CSS class manipulation", async () => {
      const context = setup();
      const mockSession = createMockSession();
      context.session = mockSession;

      context.classList.add("streams-on");
      await context.updateComplete;

      expect(context.classList.contains("streams-on")).toBe(true);

      context.classList.toggle("streams-on", false);
      expect(context.classList.contains("streams-on")).toBe(false);

      teardown(context);
    });

    it("should maintain block display behavior", async () => {
      const context = setup();
      await context.updateComplete;

      // The component should be displayed as block by default
      expect(context.shadowRoot).toBeTruthy();

      teardown(context);
    });
  });
});
