// ABOUTME: Test suite for Feed component covering content rendering, scrolling, and command echo integration
// ABOUTME: Tests memory management, event handling, and DOM interaction patterns

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { CommandEchoEvent } from "../../../../src/frontend/components/command-bar/command-echo";
import { Feed } from "../../../../src/frontend/components/session/feed/feed.lit";
import { createMockSession } from "../../../mocks";

describe("Feed Component", () => {
  let feed: Feed;
  let mockSession: ReturnType<typeof createMockSession>;

  beforeEach(() => {
    feed = new Feed();
    mockSession = createMockSession();
    feed.session = mockSession;
    document.body.appendChild(feed);
  });

  afterEach(() => {
    feed.remove();
  });

  describe("Content Management", () => {
    test("should append parsed content to the feed", async () => {
      const fragment = document.createDocumentFragment();
      const div = document.createElement("div");
      div.textContent = "Test content";
      fragment.appendChild(div);

      feed.appendParsed(fragment);
      await feed.updateComplete;

      const content = feed.shadowRoot?.querySelector(".content");
      expect(content?.textContent).toContain("Test content");
    });

    test("should manage memory by flushing old content", () => {
      // Add more than MAX_MEMORY_LENGTH entries
      for (let i = 0; i < Feed.MAX_MEMORY_LENGTH + 10; i++) {
        const div = document.createElement("div");
        div.textContent = `Content ${i}`;
        feed.appendParsed(div);
      }

      // Should have pruned to MAX_MEMORY_LENGTH
      expect(feed._contentHTML.length).toBe(Feed.MAX_MEMORY_LENGTH);
    });

    test("should clear all content when clear() is called", async () => {
      const div = document.createElement("div");
      div.textContent = "Test content";
      feed.appendParsed(div);

      feed.clear();
      await feed.updateComplete;

      const content = feed.shadowRoot?.querySelector(".content");
      expect(content?.textContent?.trim()).toBe("");
    });
  });

  describe("Scrolling Behavior", () => {
    test("should auto-scroll to bottom when content is added", async () => {
      const div = document.createElement("div");
      div.textContent = "Test content";

      feed.appendParsed(div);
      await feed.updateComplete;

      // Mock scrollToNow behavior
      const scrollSpy = vi.spyOn(feed, "scrollToNow");

      const anotherDiv = document.createElement("div");
      anotherDiv.textContent = "More content";
      feed.appendParsed(anotherDiv);
      await feed.updateComplete;

      expect(scrollSpy).toHaveBeenCalled();
    });

    test("should detect manual scrolling state", () => {
      // Mock the feed container
      const mockContainer = {
        scrollHeight: 1000,
        scrollTop: 500,
        clientHeight: 300,
      };
      feed._feedContainer = mockContainer as HTMLElement;

      expect(feed.isScrolling).toBe(true);

      // At bottom
      mockContainer.scrollTop = 695; // 1000 - 300 - 5 (within threshold)
      expect(feed.isScrolling).toBe(false);
    });
  });

  describe("Prompt Detection", () => {
    test("should detect when feed has a prompt", async () => {
      const promptDiv = document.createElement("div");
      promptDiv.innerHTML = '<prompt time="123">&gt;</prompt>';

      feed.appendParsed(promptDiv);
      await feed.updateComplete;

      expect(feed.has_prompt()).toBe(true);
    });

    test("should return false when no prompt is present", () => {
      expect(feed.has_prompt()).toBe(false);
    });
  });

  describe("Command Echo Integration", () => {
    test("should handle command echo events", async () => {
      const commandEchoEvent = new CustomEvent("illthorn:command-echo", {
        detail: { command: "look", isReplay: false },
      });

      feed._handleCommandEcho(commandEchoEvent as CustomEvent<CommandEchoEvent>);
      await feed.updateComplete;

      const content = feed.shadowRoot?.querySelector(".content");
      expect(content?.innerHTML).toContain("command-echo");
      expect(content?.innerHTML).toContain("look");
    });

    test("should style replay commands differently", async () => {
      const replayEvent = new CustomEvent("illthorn:command-echo", {
        detail: { command: "look", isReplay: true },
      });

      feed._handleCommandEcho(replayEvent as CustomEvent<CommandEchoEvent>);
      await feed.updateComplete;

      const content = feed.shadowRoot?.querySelector(".content");
      expect(content?.innerHTML).toContain("replay");
    });
  });

  describe("Lifecycle Management", () => {
    test("should activate and focus the feed", () => {
      feed.activate();
      expect(feed.focused).toBe(true);
    });

    test("should idle and unfocus the feed", () => {
      feed.focused = true;
      feed.idle();
      expect(feed.focused).toBe(false);
    });

    test("should clean up properly when destroyed", () => {
      const removeSpy = vi.spyOn(feed, "remove");
      feed.destroy();
      expect(removeSpy).toHaveBeenCalled();
    });
  });
});
