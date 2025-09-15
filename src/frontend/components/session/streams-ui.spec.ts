// ABOUTME: Test suite for StreamsUI component verifying pure presentation logic and user interactions
// ABOUTME: Tests the presentation component's rendering, scrolling behavior, and entry display
/// <reference types="vitest/globals" />
import { afterEach, describe, expect, it } from "vitest";
import { createTextTag } from "../../../../test/mocks";
import { TagKind, TagState } from "../../parser/tag";
import type { StreamEntry } from "./streams-container.lit";
import { StreamsUI } from "./streams-ui.lit";

describe("StreamsUI", () => {
  const setup = () => {
    const component = new StreamsUI();
    document.body.appendChild(component);
    return component;
  };

  const teardown = (component: StreamsUI) => {
    if (component.parentNode) {
      component.parentNode.removeChild(component);
    }
  };

  // Helper function to create StreamEntry objects with proper GameTag structure
  const createStreamEntry = (id: string, content: string, streamType: string): StreamEntry => ({
    id,
    streamTag: {
      kind: TagKind.METADATA,
      name: "stream",
      gameName: "",
      attrs: { id: streamType },
      children: [createTextTag(content)],
      state: TagState.OPEN,
      text: "",
    },
    timestamp: new Date(),
    streamType,
  });

  afterEach(() => {
    // Clean up any remaining elements
    const components = document.querySelectorAll("illthorn-streams-ui");
    components.forEach((comp) => {
      if (comp.parentNode) {
        comp.parentNode.removeChild(comp);
      }
    });
  });

  describe("Basic rendering", () => {
    it("should create streams UI element", () => {
      const component = setup();

      expect(component).toBeInstanceOf(StreamsUI);
      expect(component.tagName.toLowerCase()).toBe("illthorn-streams-ui");

      teardown(component);
    });

    it("should initialize with empty entries", () => {
      const component = setup();

      expect(component.entries).toEqual([]);

      teardown(component);
    });

    it("should render empty state when no entries", async () => {
      const component = setup();
      component.entries = [];
      await component.updateComplete;

      const emptyMessage = component.shadowRoot?.querySelector(".streams-empty");
      expect(emptyMessage).toBeTruthy();
      expect(emptyMessage?.textContent).toContain("Streams Panel");

      teardown(component);
    });

    it("should render streams container", async () => {
      const component = setup();
      await component.updateComplete;

      const container = component.shadowRoot?.querySelector(".streams-container");
      expect(container).toBeTruthy();

      teardown(component);
    });
  });

  describe("Entry rendering", () => {
    const sampleEntries: StreamEntry[] = [
      {
        id: "test-1",
        streamTag: {
          kind: TagKind.METADATA,
          name: "stream",
          gameName: "",
          attrs: { id: "thoughts" },
          children: [createTextTag('Someone thinks, "This is a test thought"')],
          state: TagState.OPEN,
          text: "",
        },
        timestamp: new Date(),
        streamType: "thoughts",
      },
      {
        id: "test-2",
        streamTag: {
          kind: TagKind.METADATA,
          name: "stream",
          gameName: "",
          attrs: { id: "speech" },
          children: [createTextTag('Someone says, "Hello everyone!"')],
          state: TagState.OPEN,
          text: "",
        },
        timestamp: new Date(),
        streamType: "speech",
      },
      {
        id: "test-3",
        streamTag: {
          kind: TagKind.METADATA,
          name: "stream",
          gameName: "",
          attrs: { id: "death" },
          children: [createTextTag("A warrior has fallen in battle!")],
          state: TagState.OPEN,
          text: "",
        },
        timestamp: new Date(),
        streamType: "death",
      },
    ];

    it("should render stream entries when provided", async () => {
      const component = setup();
      component.entries = sampleEntries;
      await component.updateComplete;

      const entries = component.shadowRoot?.querySelectorAll(".stream-entry");
      expect(entries).toHaveLength(3);

      teardown(component);
    });

    it("should apply correct CSS classes to stream entries", async () => {
      const component = setup();
      component.entries = sampleEntries;
      await component.updateComplete;

      const entries = component.shadowRoot?.querySelectorAll(".stream-entry");
      expect(entries?.[0]?.classList.contains("thoughts")).toBe(true);
      expect(entries?.[1]?.classList.contains("speech")).toBe(true);
      expect(entries?.[2]?.classList.contains("death")).toBe(true);

      teardown(component);
    });

    it("should set correct data attributes on stream entries", async () => {
      const component = setup();
      component.entries = sampleEntries;
      await component.updateComplete;

      const entries = component.shadowRoot?.querySelectorAll(".stream-entry");
      expect(entries?.[0]?.getAttribute("data-stream-type")).toBe("thoughts");
      expect(entries?.[1]?.getAttribute("data-stream-type")).toBe("speech");
      expect(entries?.[2]?.getAttribute("data-stream-type")).toBe("death");

      teardown(component);
    });

    it("should display entry content correctly", async () => {
      const component = setup();
      component.entries = sampleEntries;
      await component.updateComplete;

      const entries = component.shadowRoot?.querySelectorAll(".stream-entry");
      // Extract expected text from GameTag children
      const expectedTexts = sampleEntries.map((entry) => entry.streamTag.children[0]?.text || "");

      expect(entries?.[0]?.textContent?.trim()).toBe(expectedTexts[0]);
      expect(entries?.[1]?.textContent?.trim()).toBe(expectedTexts[1]);
      expect(entries?.[2]?.textContent?.trim()).toBe(expectedTexts[2]);

      teardown(component);
    });

    it("should handle empty entries array", async () => {
      const component = setup();
      component.entries = sampleEntries;
      await component.updateComplete;

      // Should show entries initially
      let entries = component.shadowRoot?.querySelectorAll(".stream-entry");
      expect(entries).toHaveLength(3);

      // Clear entries
      component.entries = [];
      await component.updateComplete;

      // Should show empty state
      const emptyMessage = component.shadowRoot?.querySelector(".streams-empty");
      expect(emptyMessage).toBeTruthy();
      entries = component.shadowRoot?.querySelectorAll(".stream-entry");
      expect(entries).toHaveLength(0);

      teardown(component);
    });
  });

  describe("Stream type styling", () => {
    it("should handle all stream types correctly", async () => {
      const allStreamTypes: StreamEntry[] = [
        {
          id: "1",
          streamTag: {
            kind: TagKind.METADATA,
            name: "stream",
            gameName: "",
            attrs: { id: "thoughts" },
            children: [createTextTag("Thought message")],
            state: TagState.OPEN,
            text: "",
          },
          timestamp: new Date(),
          streamType: "thoughts",
        },
        {
          id: "2",
          streamTag: {
            kind: TagKind.METADATA,
            name: "stream",
            gameName: "",
            attrs: { id: "speech" },
            children: [createTextTag("Speech message")],
            state: TagState.OPEN,
            text: "",
          },
          timestamp: new Date(),
          streamType: "speech",
        },
        {
          id: "3",
          streamTag: {
            kind: TagKind.METADATA,
            name: "stream",
            gameName: "",
            attrs: { id: "logon" },
            children: [createTextTag("Logon message")],
            state: TagState.OPEN,
            text: "",
          },
          timestamp: new Date(),
          streamType: "logon",
        },
        {
          id: "4",
          streamTag: {
            kind: TagKind.METADATA,
            name: "stream",
            gameName: "",
            attrs: { id: "logoff" },
            children: [createTextTag("Logoff message")],
            state: TagState.OPEN,
            text: "",
          },
          timestamp: new Date(),
          streamType: "logoff",
        },
        {
          id: "5",
          streamTag: {
            kind: TagKind.METADATA,
            name: "stream",
            gameName: "",
            attrs: { id: "death" },
            children: [createTextTag("Death message")],
            state: TagState.OPEN,
            text: "",
          },
          timestamp: new Date(),
          streamType: "death",
        },
      ];

      const component = setup();
      component.entries = allStreamTypes;
      await component.updateComplete;

      const entries = component.shadowRoot?.querySelectorAll(".stream-entry");
      expect(entries).toHaveLength(5);

      // Check each stream type has correct classes and attributes
      allStreamTypes.forEach((entry, index) => {
        expect(entries?.[index]?.classList.contains(entry.streamType)).toBe(true);
        expect(entries?.[index]?.getAttribute("data-stream-type")).toBe(entry.streamType);
      });

      teardown(component);
    });
  });

  describe("Scrolling behavior", () => {
    it("should implement isScrolling property", () => {
      const component = setup();

      // isScrolling should be a boolean
      expect(typeof component.isScrolling).toBe("boolean");

      teardown(component);
    });

    it("should implement scrollToNow method", () => {
      const component = setup();

      expect(typeof component.scrollToNow).toBe("function");

      // Should return the component for chaining
      const result = component.scrollToNow();
      expect(result).toBe(component);

      teardown(component);
    });

    it("should handle auto-scroll when entries are updated and user is not scrolling", async () => {
      const component = setup();

      // Mock scrolling behavior
      Object.defineProperty(component, "isScrolling", {
        get: () => false, // User is at bottom
        configurable: true,
      });

      // Initial entries
      component.entries = [createStreamEntry("1", "First message", "thoughts")];
      await component.updateComplete;

      // Add more entries
      component.entries = [...component.entries, createStreamEntry("2", "Second message", "speech")];
      await component.updateComplete;

      // Component should handle the update correctly
      const entries = component.shadowRoot?.querySelectorAll(".stream-entry");
      expect(entries).toHaveLength(2);

      teardown(component);
    });
  });

  describe("Clear functionality", () => {
    it("should implement clear method", () => {
      const component = setup();

      expect(typeof component.clear).toBe("function");

      teardown(component);
    });

    it("should dispatch clear event when clear is called", () => {
      const component = setup();
      let clearEventFired = false;

      component.addEventListener("clear", () => {
        clearEventFired = true;
      });

      component.clear();

      expect(clearEventFired).toBe(true);

      teardown(component);
    });
  });

  describe("Long content handling", () => {
    it("should handle long content without breaking layout", async () => {
      const longContent = "A".repeat(500);
      const longEntries: StreamEntry[] = [createStreamEntry("long-1", longContent, "thoughts")];

      const component = setup();
      component.entries = longEntries;
      await component.updateComplete;

      const entries = component.shadowRoot?.querySelectorAll(".stream-entry");
      expect(entries).toHaveLength(1);
      expect(entries?.[0]?.textContent?.includes(longContent)).toBe(true);

      teardown(component);
    });

    it("should handle entries with special characters", async () => {
      const specialEntries: StreamEntry[] = [createStreamEntry("special-1", 'Someone thinks, "This has <special> &characters; "quotes" and símböls"', "thoughts")];

      const component = setup();
      component.entries = specialEntries;
      await component.updateComplete;

      const entries = component.shadowRoot?.querySelectorAll(".stream-entry");
      expect(entries).toHaveLength(1);
      expect(entries?.[0]?.textContent?.includes("characters")).toBe(true);

      teardown(component);
    });
  });

  describe("Property reactivity", () => {
    it("should update display when entries property changes", async () => {
      const component = setup();

      // Start with empty
      component.entries = [];
      await component.updateComplete;
      expect(component.shadowRoot?.querySelector(".streams-empty")).toBeTruthy();

      // Add entries
      component.entries = [createStreamEntry("1", "New message", "thoughts")];
      await component.updateComplete;

      const entries = component.shadowRoot?.querySelectorAll(".stream-entry");
      expect(entries).toHaveLength(1);
      expect(component.shadowRoot?.querySelector(".streams-empty")).toBeFalsy();

      // Clear entries again
      component.entries = [];
      await component.updateComplete;
      expect(component.shadowRoot?.querySelector(".streams-empty")).toBeTruthy();

      teardown(component);
    });

    it("should handle rapid property changes", async () => {
      const component = setup();

      // Rapid updates
      for (let i = 0; i < 10; i++) {
        component.entries = [createStreamEntry(`${i}`, `Message ${i}`, "thoughts")];
      }
      await component.updateComplete;

      const entries = component.shadowRoot?.querySelectorAll(".stream-entry");
      expect(entries).toHaveLength(1);
      expect(entries?.[0]?.textContent?.trim()).toBe("Message 9");

      teardown(component);
    });
  });

  describe("CSS and styling", () => {
    it("should have proper host styling", () => {
      const component = setup();

      const styles = StreamsUI.styles;
      expect(styles).toBeTruthy();
      expect(styles.toString()).toContain(":host");

      teardown(component);
    });

    it("should apply theme-aware CSS custom properties", async () => {
      const component = setup();
      await component.updateComplete;

      // The component should use CSS custom properties for theming
      const styles = StreamsUI.styles.toString();
      expect(styles).toContain("var(--");
      expect(styles).toContain("--color-");

      teardown(component);
    });
  });
});
