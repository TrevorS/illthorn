// ABOUTME: Comprehensive test suite for FeedModernized component with real game components integration
// ABOUTME: Tests modern component-based rendering architecture, game elements, and performance improvements
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { CommandEchoEvent } from "../../../../src/frontend/components/command-bar/command-echo";
import { FeedModernized } from "../../../../src/frontend/components/session/feed/feed-modernized.lit";
import { makeTag } from "../../../../src/frontend/parser/tag";
import {
  createCombatScenario,
  createCommunicationScenario,
  createGameCommandTag,
  createGameLinkTag,
  createGameMonsterTag,
  createMixedContentScenario,
  createMockSession,
  createPresetTag,
  createRoomScenario,
  createShopScenario,
  createTextTag,
  type MockSession,
} from "../../../mocks";

// Type for game element components in tests
type GameElementForTest = HTMLElement & {
  exist?: string;
  noun?: string;
  cmd?: string;
};

// Mock the item highlighting system to avoid XML loading issues in tests
vi.mock("../../../../src/frontend/components/game-elements/item-highlighting", () => ({
  ItemHighlighter: {
    categorizeGameElement: vi.fn().mockReturnValue("unknown"),
    getItemCategory: vi.fn().mockReturnValue("unknown"),
    initialize: vi.fn().mockResolvedValue(void 0),
  },
}));

// Import game element components to ensure they're registered for testing
import "../../../../src/frontend/components/game-elements/game-link.lit";
import "../../../../src/frontend/components/game-elements/game-command.lit";
import "../../../../src/frontend/components/game-elements/game-monster.lit";

describe("FeedModernized Component", () => {
  let feed: FeedModernized;
  let mockSession: MockSession;

  const setup = () => {
    feed = document.createElement("illthorn-feed-modernized-lit") as FeedModernized;
    document.body.appendChild(feed);
    return feed;
  };

  const teardown = () => {
    if (feed?.parentNode) {
      feed.parentNode.removeChild(feed);
    }
  };

  beforeEach(() => {
    mockSession = createMockSession();
    feed = setup();
  });

  afterEach(() => {
    teardown();
  });

  describe("Basic rendering", () => {
    test("should create feed modernized element", () => {
      expect(feed).toBeInstanceOf(FeedModernized);
      expect(feed.tagName.toLowerCase()).toBe("illthorn-feed-modernized-lit");
    });

    test("should initialize with default properties", async () => {
      await feed.updateComplete;

      expect(feed.focused).toBe(false);
      expect(feed.getRenderStats().totalTagGroups).toBe(0);
    });

    test("should apply CSS classes on connection", async () => {
      await feed.updateComplete;

      expect(feed.classList.contains("feed")).toBe(true);
      expect(feed.classList.contains("scroll")).toBe(true);
    });
  });

  describe("GameTag rendering", () => {
    test("should append GameTag arrays to content", async () => {
      const textTag = makeTag(":text");
      textTag.text = "Hello, world!";

      const linkTag = makeTag("a");
      linkTag.attrs = { exist: "123", noun: "sword" };
      linkTag.text = "a shimmering sword";

      feed.appendGameTags([textTag, linkTag]);
      await feed.updateComplete;

      const stats = feed.getRenderStats();
      expect(stats.totalTagGroups).toBe(1);
      expect(stats.totalTags).toBe(1); // One tag group becomes one message block
    });

    test("should handle empty GameTag arrays", async () => {
      feed.appendGameTags([]);
      await feed.updateComplete;

      expect(feed.getRenderStats().totalTagGroups).toBe(0);
    });

    test("should render multiple GameTag groups separately", async () => {
      const group1 = [makeTag(":text")];
      group1[0].text = "First message";

      const group2 = [makeTag(":text")];
      group2[0].text = "Second message";

      feed.appendGameTags(group1);
      feed.appendGameTags(group2);
      await feed.updateComplete;

      const stats = feed.getRenderStats();
      expect(stats.totalTagGroups).toBe(2);
      expect(stats.totalTags).toBe(2);
    });

    test("should handle mixed content and metadata tags", async () => {
      const textTag = makeTag(":text");
      textTag.text = "Regular content";

      const promptTag = makeTag("prompt");
      promptTag.attrs = { time: "123456" };
      promptTag.text = ">";

      feed.appendGameTags([textTag, promptTag]);
      await feed.updateComplete;

      const stats = feed.getRenderStats();
      expect(stats.totalTags).toBe(1); // One tag group becomes one message block
    });
  });

  describe("Component-based rendering", () => {
    test("should render GameLink components from a tags", async () => {
      const linkTag = makeTag("a");
      linkTag.attrs = { exist: "sword123", noun: "sword" };
      linkTag.text = "a shimmering sword";

      feed.appendGameTags([linkTag]);
      await feed.updateComplete;

      // Check that container is rendered in shadow DOM
      const container = feed.shadowRoot?.querySelector(".feed-container");
      expect(container).toBeTruthy();
    });

    test("should render GameCommand components from d tags", async () => {
      const commandTag = makeTag("d");
      commandTag.attrs = { cmd: "look sword" };
      commandTag.text = "look";

      feed.appendGameTags([commandTag]);
      await feed.updateComplete;

      const container = feed.shadowRoot?.querySelector(".feed-container");
      expect(container).toBeTruthy();
    });

    test("should render GameMonster components from b tags", async () => {
      const monsterTag = makeTag("b");
      const linkChild = makeTag("a");
      linkChild.attrs = { exist: "orc123", noun: "orc" };
      linkChild.text = "a fierce orc";
      monsterTag.children = [linkChild];

      feed.appendGameTags([monsterTag]);
      await feed.updateComplete;

      const container = feed.shadowRoot?.querySelector(".feed-container");
      expect(container).toBeTruthy();
    });

    test("should render preset styled spans", async () => {
      const presetTag = makeTag("preset");
      presetTag.attrs = { id: "roomName" };
      presetTag.text = "The Abandoned Mine";

      feed.appendGameTags([presetTag]);
      await feed.updateComplete;

      const container = feed.shadowRoot?.querySelector(".feed-container");
      expect(container).toBeTruthy();
    });
  });

  describe("Memory management", () => {
    test("should handle large amounts of content with virtualizer", async () => {
      // With virtualizer, we can handle unlimited content efficiently
      const testLimit = 100; // Use smaller test size for speed

      // Add many groups to test virtualizer efficiency
      for (let i = 0; i < testLimit; i++) {
        const tag = makeTag(":text");
        tag.text = `Message ${i}`;
        feed.appendGameTags([tag]);
      }

      await feed.updateComplete;

      const stats = feed.getRenderStats();
      // Virtualizer keeps all content in memory since it only renders visible items
      expect(stats.totalTagGroups).toBe(testLimit);
    });

    test("should maintain all content with virtualizer efficiency", async () => {
      // Add initial content
      const initialTag = makeTag(":text");
      initialTag.text = "Initial message";
      feed.appendGameTags([initialTag]);

      // Add some test content
      const testSize = 50; // Smaller for test speed
      for (let i = 0; i < testSize; i++) {
        const tag = makeTag(":text");
        tag.text = `Filler ${i}`;
        feed.appendGameTags([tag]);
      }

      // Add final content
      const finalTag = makeTag(":text");
      finalTag.text = "Final message";
      feed.appendGameTags([finalTag]);

      await feed.updateComplete;

      const stats = feed.getRenderStats();
      // With virtualizer, all content is maintained in memory
      expect(stats.totalTagGroups).toBe(testSize + 2); // initial + testSize + final

      // Both initial and final content should be preserved
      expect(feed.getRenderStats().totalTagGroups).toBeGreaterThan(testSize);
    });
  });

  describe("Prompt handling", () => {
    test("should detect prompts in content", async () => {
      const promptTag = makeTag("prompt");
      promptTag.attrs = { time: "123456789" };
      promptTag.text = ">";

      feed.appendGameTags([promptTag]);
      await feed.updateComplete;

      expect(feed.has_prompt()).toBe(true);
    });

    test("should return false when no prompt present", async () => {
      const textTag = makeTag(":text");
      textTag.text = "Regular content";

      feed.appendGameTags([textTag]);
      await feed.updateComplete;

      expect(feed.has_prompt()).toBe(false);
    });

    test("should handle appendPrompt method", async () => {
      const promptTag = makeTag("prompt");
      promptTag.text = ">";

      feed.appendPrompt(promptTag);
      await feed.updateComplete;

      expect(feed.has_prompt()).toBe(true);
      expect(feed.getRenderStats().totalTagGroups).toBe(1);
    });
  });

  describe("Scrolling behavior", () => {
    test("should start with auto-scroll enabled", () => {
      expect(feed.isScrolling).toBe(false); // Not scrolling means at bottom
    });

    test("should have scrollToNow method", () => {
      expect(typeof feed.scrollToNow).toBe("function");

      // Should return the feed for chaining
      const result = feed.scrollToNow();
      expect(result).toBe(feed);
    });

    test("should scroll to bottom after adding content when not manually scrolling", async () => {
      const scrollSpy = vi.spyOn(feed, "scrollToNow");

      const textTag = makeTag(":text");
      textTag.text = "New content";

      feed.appendGameTags([textTag]);
      await feed.updateComplete;

      // Allow for async scroll scheduling with double requestAnimationFrame
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      expect(scrollSpy).toHaveBeenCalled();
      scrollSpy.mockRestore();
    });
  });

  describe("Component lifecycle", () => {
    test("should handle activation", () => {
      const result = feed.activate();

      expect(feed.focused).toBe(true);
      expect(result).toBe(feed); // Should return self for chaining
    });

    test("should handle idle state", () => {
      feed.focused = true;
      const result = feed.idle();

      expect(feed.focused).toBe(false);
      expect(result).toBe(feed); // Should return self for chaining
    });

    test("should clear content", () => {
      const textTag = makeTag(":text");
      textTag.text = "Content to clear";

      feed.appendGameTags([textTag]);
      expect(feed.getRenderStats().totalTagGroups).toBe(1);

      const result = feed.clear();
      expect(feed.getRenderStats().totalTagGroups).toBe(0);
      expect(result).toBe(feed); // Should return self for chaining
    });
  });

  describe("Session integration", () => {
    test("should accept session property", async () => {
      feed.session = mockSession;
      await feed.updateComplete;

      expect(feed.session).toBe(mockSession);
    });

    test("should handle command echo events when session is available", async () => {
      feed.session = mockSession;
      await feed.updateComplete;

      // The component should have subscribed to command echo events
      // Let's simulate what would happen if a command echo event was dispatched

      // Manually trigger the command echo handler that should be private
      const echoDetail: CommandEchoEvent = { command: "look", isReplay: false };
      const echoEvent = new CustomEvent("illthorn:command-echo", { detail: echoDetail });

      // Access the private handler method for testing
      (feed as unknown as { _handleCommandEcho: (event: CustomEvent<CommandEchoEvent>) => void })._handleCommandEcho(echoEvent);
      await feed.updateComplete;

      // Command echo should be added to render stats
      const stats = feed.getRenderStats();
      expect(stats.commandEchoes).toBe(1);
    });
  });

  describe("Modern API only", () => {
    test("should only use appendGameTags for content", () => {
      // Verify legacy appendParsed method has been removed
      // biome-ignore lint/suspicious/noExplicitAny: Checking legacy method removal
      expect((feed as any).appendParsed).toBeUndefined();

      // Modern API should be available
      expect(feed.appendGameTags).toBeDefined();
      expect(typeof feed.appendGameTags).toBe("function");
    });
  });

  describe("Performance monitoring", () => {
    test("should provide render statistics", async () => {
      const textTag = makeTag(":text");
      textTag.text = "Test content";

      const linkTag = makeTag("a");
      linkTag.attrs = { exist: "123", noun: "sword" };

      const promptTag = makeTag("prompt");
      promptTag.text = ">";

      feed.appendGameTags([textTag, linkTag, promptTag]);
      await feed.updateComplete;

      const stats = feed.getRenderStats();
      expect(stats.totalTagGroups).toBe(1);
      expect(stats.totalTags).toBe(1); // One tag group becomes one message block
      expect(stats.componentTags).toBeGreaterThan(0);
    });

    test("should track empty state correctly", () => {
      const stats = feed.getRenderStats();
      expect(stats.totalTagGroups).toBe(0);
      expect(stats.totalTags).toBe(0);
      expect(stats.componentTags).toBe(0);
      expect(stats.commandEchoes).toBe(0);
    });
  });

  describe("Error handling", () => {
    test("should handle malformed GameTags gracefully", async () => {
      const malformedTag = makeTag("a");
      // Don't set required attributes
      malformedTag.text = "malformed link";

      // Should not throw
      expect(() => feed.appendGameTags([malformedTag])).not.toThrow();
      await feed.updateComplete;

      const stats = feed.getRenderStats();
      expect(stats.totalTagGroups).toBe(1);
    });

    test("should handle null/undefined content safely", async () => {
      const textTag = makeTag(":text");
      // Don't set text property

      expect(() => feed.appendGameTags([textTag])).not.toThrow();
      await feed.updateComplete;

      const stats = feed.getRenderStats();
      expect(stats.totalTagGroups).toBe(1);
    });
  });

  // Comprehensive integration tests with real game components
  describe("Real Game Components Integration", () => {
    describe("GameLink component rendering", () => {
      test("should render GameLink components with proper attributes", async () => {
        const linkTag = createGameLinkTag("sword123", "sword", "a shimmering sword");

        feed.appendGameTags([linkTag]);
        await feed.updateComplete;

        // Check that message block was rendered in shadow DOM
        const shadowRoot = feed.shadowRoot;
        expect(shadowRoot).toBeTruthy();

        const messageBlock = shadowRoot?.querySelector("illthorn-message-block-lit");
        expect(messageBlock).toBeTruthy();

        // Check that game element is rendered inside the message block
        const gameLink = messageBlock?.shadowRoot?.querySelector("illthorn-game-link");
        expect(gameLink).toBeTruthy();

        // Check properties instead of attributes (Lit components use properties)
        expect((gameLink as GameElementForTest)?.exist).toBe("sword123");
        expect((gameLink as GameElementForTest)?.noun).toBe("sword");
      });

      test("should render multiple GameLink components correctly", async () => {
        const links = [
          createGameLinkTag("sword123", "sword", "a sword"),
          createGameLinkTag("shield456", "shield", "a shield"),
          createGameLinkTag("potion789", "potion", "a potion"),
        ];

        feed.appendGameTags(links);
        await feed.updateComplete;

        // Game links are now inside message block components
        const messageBlock = feed.shadowRoot?.querySelector("illthorn-message-block-lit");
        const gameLinks = messageBlock?.shadowRoot?.querySelectorAll("illthorn-game-link");
        expect(gameLinks?.length).toBe(3);
      });

      test("should handle GameLink components with exits", async () => {
        const exitTag = createGameLinkTag("exit_north", "exit", "north");

        feed.appendGameTags([exitTag]);
        await feed.updateComplete;

        // Game link is now inside message block component
        const messageBlock = feed.shadowRoot?.querySelector("illthorn-message-block-lit");
        const gameLink = messageBlock?.shadowRoot?.querySelector("illthorn-game-link");
        expect(gameLink).toBeTruthy();
        expect((gameLink as GameElementForTest)?.exist).toBe("exit_north");
        expect((gameLink as GameElementForTest)?.noun).toBe("exit");
      });
    });

    describe("GameCommand component rendering", () => {
      test("should render GameCommand components with cmd attributes", async () => {
        const commandTag = createGameCommandTag("look around", "look");

        feed.appendGameTags([commandTag]);
        await feed.updateComplete;

        const messageBlock = feed.shadowRoot?.querySelector("illthorn-message-block-lit");
        const gameCommand = messageBlock?.shadowRoot?.querySelector("illthorn-game-command");
        expect(gameCommand).toBeTruthy();
        expect((gameCommand as GameElementForTest)?.cmd).toBe("look around");
      });

      test("should render multiple GameCommand components", async () => {
        const commands = [createGameCommandTag("dodge", "dodge"), createGameCommandTag("block", "block"), createGameCommandTag("attack", "attack")];

        feed.appendGameTags(commands);
        await feed.updateComplete;

        // Game commands are now inside message block component
        const messageBlock = feed.shadowRoot?.querySelector("illthorn-message-block-lit");
        const gameCommands = messageBlock?.shadowRoot?.querySelectorAll("illthorn-game-command");
        expect(gameCommands?.length).toBe(3);
      });
    });

    describe("GameMonster component rendering", () => {
      test("should render GameMonster components with nested links", async () => {
        const monsterTag = createGameMonsterTag("orc123", "orc", "a fierce orc");

        feed.appendGameTags([monsterTag]);
        await feed.updateComplete;

        const messageBlock = feed.shadowRoot?.querySelector("illthorn-message-block-lit");
        const gameMonster = messageBlock?.shadowRoot?.querySelector("illthorn-game-monster");
        expect(gameMonster).toBeTruthy();
        expect((gameMonster as GameElementForTest)?.exist).toBe("orc123");
        expect((gameMonster as GameElementForTest)?.noun).toBe("orc");
      });

      test("should render multiple GameMonster components", async () => {
        const monsters = [createGameMonsterTag("orc123", "orc", "a fierce orc"), createGameMonsterTag("goblin456", "goblin", "a sneaky goblin")];

        feed.appendGameTags(monsters);
        await feed.updateComplete;

        // Game monsters are now inside message block component
        const messageBlock = feed.shadowRoot?.querySelector("illthorn-message-block-lit");
        const gameMonsters = messageBlock?.shadowRoot?.querySelectorAll("illthorn-game-monster");
        expect(gameMonsters?.length).toBe(2);
      });
    });

    describe("Preset styling components", () => {
      test("should render preset styled spans with correct classes", async () => {
        const presetTags = [createPresetTag("roomName", "The Town Square"), createPresetTag("roomDesc", "A bustling area."), createPresetTag("speech", "Player says hello")];

        feed.appendGameTags(presetTags);
        await feed.updateComplete;

        // Check that message block was rendered
        const messageBlock = feed.shadowRoot?.querySelector("illthorn-message-block-lit");
        expect(messageBlock).toBeTruthy();

        // Check that preset spans were rendered with proper classes inside message block
        const presetSpans = messageBlock?.shadowRoot?.querySelectorAll("span[class]");
        expect(presetSpans?.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Realistic Game Scenarios", () => {
    test("should render room description scenario correctly", async () => {
      feed.appendGameTags(createRoomScenario());
      await feed.updateComplete;

      const stats = feed.getRenderStats();
      expect(stats.totalTagGroups).toBeGreaterThan(0); // Room has content
      expect(stats.componentTags).toBeGreaterThan(0); // Should have interactive components

      // Check for specific components inside message blocks
      const messageBlocks = feed.shadowRoot?.querySelectorAll("illthorn-message-block-lit");
      expect(messageBlocks?.length).toBeGreaterThan(0); // Should have message blocks

      // Check for spans inside message blocks
      const hasSpansInBlocks = Array.from(messageBlocks || []).some((block) => block.shadowRoot?.querySelectorAll("span").length > 0);
      expect(hasSpansInBlocks).toBe(true); // Should have room name/description spans
    });

    test("should render combat scenario correctly", async () => {
      feed.appendGameTags(createCombatScenario());
      await feed.updateComplete;

      const stats = feed.getRenderStats();
      expect(stats.totalTags).toBeGreaterThan(0);
      expect(stats.componentTags).toBeGreaterThan(0);

      // Check for monster and command components inside message blocks
      const messageBlocks = feed.shadowRoot?.querySelectorAll("illthorn-message-block-lit");
      const hasMonsters = Array.from(messageBlocks || []).some((block) => block.shadowRoot?.querySelectorAll("illthorn-game-monster").length > 0);
      expect(hasMonsters).toBe(true);

      const hasCommands = Array.from(messageBlocks || []).some((block) => block.shadowRoot?.querySelectorAll("illthorn-game-command").length > 0);
      expect(hasCommands).toBe(true);
    });

    test("should render shop scenario correctly", async () => {
      feed.appendGameTags(createShopScenario());
      await feed.updateComplete;

      const stats = feed.getRenderStats();
      expect(stats.componentTags).toBeGreaterThan(0);

      // Check for items and command components inside message blocks
      const messageBlocks = feed.shadowRoot?.querySelectorAll("illthorn-message-block-lit");
      const hasLinks = Array.from(messageBlocks || []).some((block) => block.shadowRoot?.querySelectorAll("illthorn-game-link").length > 0);
      expect(hasLinks).toBe(true); // Items for sale

      const hasCommands = Array.from(messageBlocks || []).some((block) => block.shadowRoot?.querySelectorAll("illthorn-game-command").length > 0);
      expect(hasCommands).toBe(true); // Buy/sell commands
    });

    test("should render communication scenario with proper styling", async () => {
      feed.appendGameTags(createCommunicationScenario());
      await feed.updateComplete;

      const stats = feed.getRenderStats();
      expect(stats.totalTags).toBeGreaterThan(0);

      // Check for preset styled communication elements inside message blocks
      const messageBlocks = feed.shadowRoot?.querySelectorAll("illthorn-message-block-lit");
      const hasSpans = Array.from(messageBlocks || []).some((block) => block.shadowRoot?.querySelectorAll("span").length > 0);
      expect(hasSpans).toBe(true);
    });

    test("should render mixed content scenario with all component types", async () => {
      feed.appendGameTags(createMixedContentScenario());
      await feed.updateComplete;

      const stats = feed.getRenderStats();
      expect(stats.totalTags).toBeGreaterThan(0);
      expect(stats.componentTags).toBeGreaterThan(0);

      // Should have all types of components inside message blocks
      const messageBlocks = feed.shadowRoot?.querySelectorAll("illthorn-message-block-lit");

      const hasLinks = Array.from(messageBlocks || []).some((block) => block.shadowRoot?.querySelectorAll("illthorn-game-link").length > 0);
      const hasCommands = Array.from(messageBlocks || []).some((block) => block.shadowRoot?.querySelectorAll("illthorn-game-command").length > 0);
      const hasMonsters = Array.from(messageBlocks || []).some((block) => block.shadowRoot?.querySelectorAll("illthorn-game-monster").length > 0);

      expect(hasLinks).toBe(true);
      expect(hasCommands).toBe(true);
      expect(hasMonsters).toBe(true);

      // Should have prompt
      expect(feed.has_prompt()).toBe(true);
    });
  });

  describe("ComponentRenderer Integration", () => {
    test("should use ComponentRenderer for all game elements", async () => {
      const mixedTags = [
        createTextTag("Combat begins: "),
        createGameMonsterTag("dragon999", "dragon", "ancient dragon"),
        createTextTag(" attacks! Use "),
        createGameCommandTag("defend", "defend"),
        createTextTag(" or grab the "),
        createGameLinkTag("sword888", "sword", "magic sword"),
        createTextTag(" nearby."),
      ];

      feed.appendGameTags(mixedTags);
      await feed.updateComplete;

      // Verify ComponentRenderer statistics
      const stats = feed.getRenderStats();
      // With new modular architecture, each tag group becomes one item
      expect(stats.totalTags).toBe(1); // One tag group becomes one message block
      expect(stats.componentTags).toBe(1); // One tag group with components
      // The feed's getRenderStats doesn't have textNodes, only totalTags, componentTags, metadataTags, commandEchoes
      expect(stats.metadataTags).toBe(0); // no metadata tags in this scenario
    });

    test("should handle ComponentRenderer error recovery", async () => {
      // Create a scenario that might cause rendering issues
      const problematicTag = makeTag("a");
      problematicTag.attrs = { exist: null, noun: undefined }; // Malformed attributes
      problematicTag.text = "problematic link";

      const goodTag = createTextTag("This should still render");

      feed.appendGameTags([problematicTag, goodTag]);
      await feed.updateComplete;

      // Feed should still render successfully
      const stats = feed.getRenderStats();
      expect(stats.totalTagGroups).toBe(1);
      expect(stats.totalTags).toBe(1); // One tag group becomes one message block
    });
  });

  describe("Component Event Handling", () => {
    test("should handle component clicks without interfering with text selection", async () => {
      const linkTag = createGameLinkTag("item123", "item", "test item");
      feed.appendGameTags([linkTag]);
      await feed.updateComplete;

      // Simulate text selection
      window.getSelection = vi.fn().mockReturnValue({ toString: () => "selected text" });

      const feedContainer = feed.shadowRoot?.querySelector(".feed-container");
      expect(feedContainer).toBeTruthy();

      // Simulate click event
      const clickEvent = new MouseEvent("click", { bubbles: true });
      feedContainer?.dispatchEvent(clickEvent);

      // Should not interfere with selection
      expect(window.getSelection).toHaveBeenCalled();
    });

    test("should maintain component functionality during memory flush", async () => {
      // Add content beyond memory limit to trigger flush
      for (let i = 0; i < FeedModernized.MAX_MEMORY_LENGTH + 5; i++) {
        const tag = createGameLinkTag(`item${i}`, "item", `item ${i}`);
        feed.appendGameTags([tag]);
      }

      await feed.updateComplete;

      // Memory management is disabled in current implementation, so all content is preserved
      const stats = feed.getRenderStats();
      expect(stats.totalTagGroups).toBe(FeedModernized.MAX_MEMORY_LENGTH + 5);

      // Latest components should still be functional inside message blocks
      const messageBlocks = feed.shadowRoot?.querySelectorAll("illthorn-message-block-lit");
      const linkCount = Array.from(messageBlocks || []).reduce((count, block) => count + (block.shadowRoot?.querySelectorAll("illthorn-game-link").length || 0), 0);
      expect(linkCount).toBeGreaterThan(0);
    });
  });

  describe("Advanced Integration Scenarios", () => {
    test("should handle rapid GameTag updates without losing components", async () => {
      // Simulate rapid updates like in actual gameplay
      const scenarios = [createRoomScenario(), createCombatScenario(), createShopScenario()];

      for (const scenario of scenarios) {
        feed.appendGameTags(scenario);
        await feed.updateComplete;
      }

      const stats = feed.getRenderStats();
      expect(stats.totalTagGroups).toBe(3);
      expect(stats.componentTags).toBeGreaterThan(0);

      // All component types should be present inside message blocks
      const messageBlocks = feed.shadowRoot?.querySelectorAll("illthorn-message-block-lit");

      const hasLinks = Array.from(messageBlocks || []).some((block) => block.shadowRoot?.querySelectorAll("illthorn-game-link").length > 0);
      const hasCommands = Array.from(messageBlocks || []).some((block) => block.shadowRoot?.querySelectorAll("illthorn-game-command").length > 0);
      const hasMonsters = Array.from(messageBlocks || []).some((block) => block.shadowRoot?.querySelectorAll("illthorn-game-monster").length > 0);

      expect(hasLinks).toBe(true);
      expect(hasCommands).toBe(true);
      expect(hasMonsters).toBe(true);
    });

    test("should maintain component state across feed operations", async () => {
      // Add initial content
      feed.appendGameTags(createRoomScenario());
      await feed.updateComplete;

      const messageBlocks1 = feed.shadowRoot?.querySelectorAll("illthorn-message-block-lit");
      const initialLinks = Array.from(messageBlocks1 || []).reduce((count, block) => count + (block.shadowRoot?.querySelectorAll("illthorn-game-link").length || 0), 0);

      // Add more content
      feed.appendGameTags(createShopScenario());
      await feed.updateComplete;

      const messageBlocks2 = feed.shadowRoot?.querySelectorAll("illthorn-message-block-lit");
      const finalLinks = Array.from(messageBlocks2 || []).reduce((count, block) => count + (block.shadowRoot?.querySelectorAll("illthorn-game-link").length || 0), 0);

      // Should have more links now
      expect(finalLinks).toBeGreaterThan(initialLinks);
    });

    test("should handle mixed text and component content correctly", async () => {
      const complexScenario = [
        createTextTag("You enter "),
        createPresetTag("roomName", "The Dragon's Lair"),
        createTextTag(".\n"),
        createPresetTag("roomDesc", "A dark cavern filled with treasure and danger."),
        createTextTag("\nA "),
        createGameMonsterTag("dragon123", "dragon", "massive red dragon"),
        createTextTag(" guards a pile of "),
        createGameLinkTag("gold456", "gold", "glittering gold"),
        createTextTag(".\nYou can "),
        createGameCommandTag("sneak", "sneak"),
        createTextTag(" past or "),
        createGameCommandTag("fight dragon", "fight"),
        createTextTag(" it directly."),
      ];

      feed.appendGameTags(complexScenario);
      await feed.updateComplete;

      const stats = feed.getRenderStats();
      // With new modular architecture, each tag group becomes one item
      expect(stats.totalTags).toBe(1); // One tag group becomes one message block

      // Verify all components rendered inside message blocks
      const messageBlocks = feed.shadowRoot?.querySelectorAll("illthorn-message-block-lit");

      const monsterCount = Array.from(messageBlocks || []).reduce((count, block) => count + (block.shadowRoot?.querySelectorAll("illthorn-game-monster").length || 0), 0);
      const linkCount = Array.from(messageBlocks || []).reduce((count, block) => count + (block.shadowRoot?.querySelectorAll("illthorn-game-link").length || 0), 0);
      const commandCount = Array.from(messageBlocks || []).reduce((count, block) => count + (block.shadowRoot?.querySelectorAll("illthorn-game-command").length || 0), 0);
      const spanCount = Array.from(messageBlocks || []).reduce((count, block) => count + (block.shadowRoot?.querySelectorAll("span[class]").length || 0), 0);

      expect(monsterCount).toBe(1);
      expect(linkCount).toBe(1); // only standalone gold link, monster text is extracted
      expect(commandCount).toBe(2);
      expect(spanCount).toBe(2); // preset spans
    });
  });
});
