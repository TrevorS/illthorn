// ABOUTME: Integration test for command echo flow from CLI to Feed component
// ABOUTME: Tests the complete bus-based echo system end-to-end

import { beforeEach, describe, expect, test } from "vitest";
import { CLI } from "../../src/frontend/components/command-bar/cli.lit";
import { CommandHistory } from "../../src/frontend/components/command-bar/command-history";
import { Feed } from "../../src/frontend/components/session/feed/feed.lit";
import { SaxophoneParser } from "../../src/frontend/parser/saxophone-parser";
import type { FrontendSession } from "../../src/frontend/session";
import { Bus } from "../../src/frontend/util/bus";

// No need to import echo component anymore - using HTML generation

// Mock session for testing
const createMockSession = (): FrontendSession => {
  const bus = new Bus();
  const history = new CommandHistory();
  const parser = new SaxophoneParser();

  return {
    bus,
    history,
    parser,
    name: "test-session",
    port: 12345,
    hasFocus: true,
    sendCommand: () => {},
    connect: () => Promise.resolve(),
    disconnect: () => {},
    focusSession: () => {},
    startListening: () => {},
    stopListening: () => {},
    waitForInitialization: () => Promise.resolve(),
  } as FrontendSession;
};

describe("Command Echo Integration", () => {
  let cli: CLI;
  let feed: Feed;
  let session: FrontendSession;

  beforeEach(() => {
    // Create components
    cli = new CLI();
    feed = new Feed();
    session = createMockSession();

    // Set up the session on both components
    cli.session = session;
    feed.session = session;

    // Add to DOM
    document.body.appendChild(cli);
    document.body.appendChild(feed);
  });

  afterEach(() => {
    // Clean up
    if (document.body.contains(cli)) {
      document.body.removeChild(cli);
    }
    if (document.body.contains(feed)) {
      document.body.removeChild(feed);
    }
  });

  test("should echo commands from CLI to Feed via bus system", async () => {
    // Wait for components to initialize
    await cli.updateComplete;
    await feed.updateComplete;

    // Simulate typing a command
    cli._inputValue = "look";
    await cli.updateComplete;

    // Get initial feed content HTML
    const feedContent = feed.shadowRoot?.querySelector(".content");
    const initialHTML = feedContent?.innerHTML || "";

    // Simulate pressing Enter to submit the command
    cli._submitCommand();

    // Wait for the bus event to propagate and feed to update
    await new Promise((resolve) => setTimeout(resolve, 10)); // Small delay for bus propagation
    await feed.updateComplete;

    // Check that command echo HTML was added to the feed
    const finalFeedContent = feed.shadowRoot?.querySelector(".content");
    const finalHTML = finalFeedContent?.innerHTML || "";

    // Should contain the command echo with proper formatting
    expect(finalHTML).toContain("look");
    expect(finalHTML).toContain(">");
    expect(finalHTML).toContain("command-echo");
    expect(finalHTML).not.toContain("replay"); // Should not be marked as replay

    // Should be different from initial HTML (new content added)
    expect(finalHTML).not.toBe(initialHTML);
  });

  test("should echo replay commands with proper marking", async () => {
    // Wait for components to initialize
    await cli.updateComplete;
    await feed.updateComplete;

    // First, submit a command to have something to replay
    cli._inputValue = "inventory";
    cli._submitCommand();
    await new Promise((resolve) => setTimeout(resolve, 10));
    await feed.updateComplete;

    // Get feed content HTML after first command
    const afterFirstCommandHTML = feed.shadowRoot?.querySelector(".content")?.innerHTML || "";

    // Now replay the last command
    cli._replayLastCommand();

    // Wait for the replay echo to propagate
    await new Promise((resolve) => setTimeout(resolve, 10));
    await feed.updateComplete;

    // Check that replay command echo HTML was added
    const finalHTML = feed.shadowRoot?.querySelector(".content")?.innerHTML || "";

    // Should contain the replay echo with proper formatting
    expect(finalHTML).toContain("inventory");
    expect(finalHTML).toContain("[Replay]");
    expect(finalHTML).toContain("command-echo replay");

    // Should be different from HTML after first command (new content added)
    expect(finalHTML).not.toBe(afterFirstCommandHTML);
  });

  test("should not echo empty commands", async () => {
    // Wait for components to initialize
    await cli.updateComplete;
    await feed.updateComplete;

    // Get initial feed content HTML
    const initialHTML = feed.shadowRoot?.querySelector(".content")?.innerHTML || "";

    // Try to submit an empty command
    cli._inputValue = "";
    cli._submitCommand();

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 10));
    await feed.updateComplete;

    // Check that no echo was added (HTML should be unchanged)
    const finalHTML = feed.shadowRoot?.querySelector(".content")?.innerHTML || "";
    expect(finalHTML).toBe(initialHTML);
  });
});
