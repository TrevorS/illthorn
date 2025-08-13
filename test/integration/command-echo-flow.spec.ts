// ABOUTME: Integration test for command echo flow from CLI to Feed component
// ABOUTME: Tests the complete bus-based echo system end-to-end

import { beforeEach, describe, expect, test } from "vitest";
import { CLI } from "../../src/frontend/components/command-bar/cli.lit";
import { CommandHistory } from "../../src/frontend/components/command-bar/command-history";
import type { FeedModernized } from "../../src/frontend/components/session/feed/feed-modernized.lit";
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
  let feed: FeedModernized;
  let session: FrontendSession;

  beforeEach(() => {
    // Create components
    cli = new CLI();
    feed = document.createElement("illthorn-feed-modernized-lit") as FeedModernized;
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

    // Should contain the command echo component with proper formatting
    expect(finalHTML).toContain("illthorn-command-echo-lit");
    expect(finalHTML).toContain("command-echo");

    // Check that the command echo component was created with correct properties
    const commandEchoComponent = feed.shadowRoot?.querySelector("illthorn-command-echo-lit");
    expect(commandEchoComponent).toBeDefined();
    expect(commandEchoComponent?.getAttribute("command") || commandEchoComponent?.command).toBe("look");
    expect(commandEchoComponent?.hasAttribute("is-replay")).toBe(false);

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

    // Should contain the replay echo component with proper formatting
    expect(finalHTML).toContain("illthorn-command-echo-lit");
    expect(finalHTML).toContain("is-replay");

    // Check that replay command echo components were created
    const replayComponents = feed.shadowRoot?.querySelectorAll("illthorn-command-echo-lit[is-replay]");
    expect(replayComponents?.length).toBeGreaterThan(0);

    // Check the last replay component has correct properties
    const lastReplayComponent = replayComponents?.[replayComponents.length - 1];
    expect(lastReplayComponent?.getAttribute("command") || lastReplayComponent?.command).toBe("inventory");
    expect(lastReplayComponent?.hasAttribute("is-replay")).toBe(true);

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
