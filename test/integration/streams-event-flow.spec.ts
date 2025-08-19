// ABOUTME: Integration test for complete streams event flow from session to container to UI
// ABOUTME: Tests the full data flow: session metadata dispatch → container bus subscription → UI rendering
/// <reference types="vitest/globals" />
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { GameTag } from "../../src/frontend/parser/tag";
import { makeTag } from "../../src/frontend/parser/tag";
import type { FrontendSession } from "../../src/frontend/session";
import { Bus } from "../../src/frontend/util/bus";
import type { StreamsContainer } from "../../src/frontend/components/session/streams-container.lit";
import "../../src/frontend/components/session/streams-container.lit";

describe("Streams Event Flow Integration", () => {
  let mockSession: Partial<FrontendSession>;
  let bus: Bus;
  let container: StreamsContainer;

  const setup = async () => {
    // Create real bus for integration testing
    bus = new Bus();
    
    // Create mock session with real bus
    mockSession = {
      bus,
      name: "test-session"
    } as Partial<FrontendSession>;

    // Create and attach container
    container = document.createElement("illthorn-streams-container") as StreamsContainer;
    container.session = mockSession as FrontendSession;
    document.body.appendChild(container);
    await container.updateComplete;
  };

  const teardown = () => {
    if (container?.parentNode) {
      container.parentNode.removeChild(container);
    }
  };

  afterEach(() => {
    teardown();
    // Clean up any remaining elements
    const containers = document.querySelectorAll("illthorn-streams-container");
    containers.forEach((c) => {
      if (c.parentNode) {
        c.parentNode.removeChild(c);
      }
    });
  });

  describe("Complete Event Flow", () => {
    it("should handle thoughts stream from session dispatch to UI rendering", async () => {
      await setup();

      // Create a thoughts stream tag (like what session would dispatch)
      const thoughtsTag: GameTag = makeTag("stream");
      thoughtsTag.attrs = { id: "thoughts" };
      thoughtsTag.text = 'Someone thinks, "This is a test thought message"';

      // Dispatch the event like the session would
      bus.dispatchEvent("metadata/stream/thoughts", thoughtsTag);
      await container.updateComplete;

      // Verify the UI component received and rendered the entry
      const uiComponent = container.shadowRoot?.querySelector("illthorn-streams-ui");
      expect(uiComponent).toBeTruthy();
      
      // Check if the entry was rendered
      const streamEntries = uiComponent?.shadowRoot?.querySelectorAll(".stream-entry");
      expect(streamEntries?.length).toBeGreaterThan(0);
      
      // Verify content and stream type
      const firstEntry = streamEntries?.[0];
      expect(firstEntry?.textContent?.trim()).toBe(thoughtsTag.text);
      expect(firstEntry?.classList.contains("thoughts")).toBe(true);
      expect(firstEntry?.getAttribute("data-stream-type")).toBe("thoughts");
    });

    it("should handle speech stream from session dispatch to UI rendering", async () => {
      await setup();

      // Create a speech stream tag
      const speechTag: GameTag = makeTag("stream");
      speechTag.attrs = { id: "speech" };
      speechTag.text = 'Someone says, "Hello everyone!"';

      // Dispatch the event
      bus.dispatchEvent("metadata/stream/speech", speechTag);
      await container.updateComplete;

      // Verify UI rendering
      const uiComponent = container.shadowRoot?.querySelector("illthorn-streams-ui");
      const streamEntries = uiComponent?.shadowRoot?.querySelectorAll(".stream-entry");
      expect(streamEntries?.length).toBeGreaterThan(0);
      
      const firstEntry = streamEntries?.[0];
      expect(firstEntry?.textContent?.trim()).toBe(speechTag.text);
      expect(firstEntry?.classList.contains("speech")).toBe(true);
      expect(firstEntry?.getAttribute("data-stream-type")).toBe("speech");
    });

    it("should handle multiple stream types in sequence", async () => {
      await setup();

      // Create multiple stream tags
      const streams = [
        { type: "logon", text: "Player has connected." },
        { type: "speech", text: 'Player says, "Hello!"' },
        { type: "thoughts", text: 'Someone thinks, "Nice to meet you."' },
        { type: "death", text: "A goblin has been slain!" },
        { type: "logoff", text: "Player has disconnected." }
      ];

      // Dispatch all events
      for (const stream of streams) {
        const streamTag: GameTag = makeTag("stream");
        streamTag.attrs = { id: stream.type };
        streamTag.text = stream.text;
        
        bus.dispatchEvent(`metadata/stream/${stream.type}`, streamTag);
      }
      await container.updateComplete;

      // Verify all entries were rendered
      const uiComponent = container.shadowRoot?.querySelector("illthorn-streams-ui");
      const streamEntries = uiComponent?.shadowRoot?.querySelectorAll(".stream-entry");
      expect(streamEntries?.length).toBe(streams.length);

      // Verify each entry has correct content and styling
      streams.forEach((stream, index) => {
        const entry = streamEntries?.[index];
        expect(entry?.textContent?.trim()).toBe(stream.text);
        expect(entry?.classList.contains(stream.type)).toBe(true);
        expect(entry?.getAttribute("data-stream-type")).toBe(stream.type);
      });
    });

    it("should handle stream tags with children content", async () => {
      await setup();

      // Create a stream tag with child content (like parser might create)
      const childTag: GameTag = makeTag(":text");
      childTag.text = "Child content from parser";

      const parentStreamTag: GameTag = makeTag("stream");
      parentStreamTag.attrs = { id: "thoughts" };
      parentStreamTag.text = ""; // Empty main text
      parentStreamTag.children = [childTag];

      // Dispatch the event
      bus.dispatchEvent("metadata/stream/thoughts", parentStreamTag);
      await container.updateComplete;

      // Verify content extraction from children
      const uiComponent = container.shadowRoot?.querySelector("illthorn-streams-ui");
      const streamEntries = uiComponent?.shadowRoot?.querySelectorAll(".stream-entry");
      expect(streamEntries?.length).toBeGreaterThan(0);
      
      const firstEntry = streamEntries?.[0];
      expect(firstEntry?.textContent?.trim()).toBe("Child content from parser");
    });

    it("should handle clearing streams from UI to container", async () => {
      await setup();

      // Add some stream entries first
      const thoughtsTag: GameTag = makeTag("stream");
      thoughtsTag.attrs = { id: "thoughts" };
      thoughtsTag.text = "Test thought";
      
      bus.dispatchEvent("metadata/stream/thoughts", thoughtsTag);
      await container.updateComplete;

      // Verify entry exists
      const uiComponent = container.shadowRoot?.querySelector("illthorn-streams-ui") as any;
      let streamEntries = uiComponent?.shadowRoot?.querySelectorAll(".stream-entry");
      expect(streamEntries?.length).toBeGreaterThan(0);

      // Simulate clear event from UI
      const clearEvent = new CustomEvent("clear");
      uiComponent?.dispatchEvent(clearEvent);
      await container.updateComplete;

      // Should show empty state
      const emptyMessage = uiComponent?.shadowRoot?.querySelector(".streams-empty");
      expect(emptyMessage).toBeTruthy();
    });

    it("should handle rapid successive stream events", async () => {
      await setup();

      // Rapidly dispatch multiple events
      const promises = [];
      for (let i = 0; i < 50; i++) {
        const streamTag: GameTag = makeTag("stream");
        streamTag.attrs = { id: "thoughts" };
        streamTag.text = `Rapid thought ${i}`;
        
        bus.dispatchEvent("metadata/stream/thoughts", streamTag);
        promises.push(container.updateComplete);
      }
      
      // Wait for all updates to complete
      await Promise.all(promises);

      // Component should handle rapid updates without issues
      const uiComponent = container.shadowRoot?.querySelector("illthorn-streams-ui");
      expect(uiComponent).toBeTruthy();
      
      const streamEntries = uiComponent?.shadowRoot?.querySelectorAll(".stream-entry");
      expect(streamEntries?.length).toBeGreaterThan(0);
    });

    it("should maintain order of stream entries", async () => {
      await setup();

      // Create ordered sequence of messages
      const messages = [
        "First message",
        "Second message", 
        "Third message"
      ];

      // Dispatch in order
      for (let i = 0; i < messages.length; i++) {
        const streamTag: GameTag = makeTag("stream");
        streamTag.attrs = { id: "thoughts" };
        streamTag.text = messages[i];
        
        bus.dispatchEvent("metadata/stream/thoughts", streamTag);
        
        // Small delay to ensure ordering
        await new Promise(resolve => setTimeout(resolve, 1));
      }
      await container.updateComplete;

      // Verify order is maintained
      const uiComponent = container.shadowRoot?.querySelector("illthorn-streams-ui");
      const streamEntries = uiComponent?.shadowRoot?.querySelectorAll(".stream-entry");
      
      expect(streamEntries?.length).toBe(messages.length);
      messages.forEach((message, index) => {
        expect(streamEntries?.[index]?.textContent?.trim()).toBe(message);
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle malformed stream events gracefully", async () => {
      await setup();

      // Create malformed stream tag (missing required properties)
      const malformedTag: GameTag = makeTag("stream");
      // Missing attrs.id and text content

      // Should not crash when processing malformed event
      expect(() => {
        bus.dispatchEvent("metadata/stream/thoughts", malformedTag);
      }).not.toThrow();

      await container.updateComplete;

      // Component should still be functional
      const uiComponent = container.shadowRoot?.querySelector("illthorn-streams-ui");
      expect(uiComponent).toBeTruthy();
    });

    it("should handle session disconnect gracefully", async () => {
      await setup();

      // Add some content first
      const thoughtsTag: GameTag = makeTag("stream");
      thoughtsTag.attrs = { id: "thoughts" };
      thoughtsTag.text = "Test content";
      
      bus.dispatchEvent("metadata/stream/thoughts", thoughtsTag);
      await container.updateComplete;

      // Simulate session disconnect
      container.session = undefined;
      await container.updateComplete;

      // Component should still render existing content
      const uiComponent = container.shadowRoot?.querySelector("illthorn-streams-ui");
      expect(uiComponent).toBeTruthy();
    });
  });

  describe("Memory and Performance", () => {
    it("should handle large numbers of stream entries efficiently", async () => {
      await setup();

      const startTime = performance.now();

      // Add many entries
      for (let i = 0; i < 1100; i++) {
        const streamTag: GameTag = makeTag("stream");
        streamTag.attrs = { id: "thoughts" };
        streamTag.text = `Performance test entry ${i}`;
        
        bus.dispatchEvent("metadata/stream/thoughts", streamTag);
        
        // Batch updates to reduce overhead
        if (i % 100 === 0) {
          await container.updateComplete;
        }
      }
      
      await container.updateComplete;
      const endTime = performance.now();

      // Should complete within reasonable time (adjust threshold as needed)
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds max

      // Component should still be functional
      const uiComponent = container.shadowRoot?.querySelector("illthorn-streams-ui");
      expect(uiComponent).toBeTruthy();
    });
  });
});