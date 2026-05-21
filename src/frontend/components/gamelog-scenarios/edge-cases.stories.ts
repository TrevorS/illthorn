// ABOUTME: Storybook stories for edge cases and debugging scenarios from the icemule gamelog
// ABOUTME: Tests highlighting system failure modes, categorization edge cases, and debug scenarios

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../session/feed/feed-modernized.lit";
import type { GameTag } from "../../parser/tag";
import { makeTag } from "../../parser/tag";

// Import the item highlighter for edge case testing
import { ItemHighlighter } from "../game-elements/item-highlighting";

// Edge case mock that simulates debug output and categorization failures
const edgeCaseMockHighlighter = {
  _categoryMappings: {
    // Items that successfully categorize
    sword: "weapon",
    ring: "magic",
    leaf: "herb",

    // Items that are explicitly excluded from highlighting
    statue: null, // Environmental objects
    snow: null, // Weather/environmental
    bench: null,
    board: null,

    // Player items that should not categorize
    // (Player names will be handled by name detection)
  } as Record<string, string | null>,

  _debugLog: [] as Array<{
    noun?: string;
    exist?: string;
    name?: string;
    result: string | null;
    confidence: string;
    source: string;
    timestamp: number;
  }>,

  categorizeGameElement(attributes: { noun?: string; exist?: string; name?: string }) {
    const { noun, exist, name } = attributes;
    console.log("[EDGE CASE MOCK] categorizeGameElement called with:", { noun, exist, name });

    let result: { category: string | null; confidence: "high" | "medium" | "low"; source: "noun" | "exist" | "name" | "fallback" };

    // Handle player names specifically (should not categorize)
    if (name) {
      const lowerName = name.toLowerCase();
      const playerNames = ["parwyn", "rollandio", "aescall", "sunzun", "scribs"];
      if (playerNames.some((playerName) => lowerName.includes(playerName))) {
        result = {
          category: null,
          confidence: "high",
          source: "name",
        };
        this._debugLog.push({
          noun,
          exist,
          name,
          result: result.category,
          confidence: result.confidence,
          source: result.source,
          timestamp: Date.now(),
        });
        return result;
      }
    }

    // Handle items with weird IDs that fail exist-based categorization
    if (exist) {
      const weirdIds = ["-11231958", "-480436", "-464992"]; // From icemule log
      if (weirdIds.includes(exist)) {
        result = {
          category: null,
          confidence: "low",
          source: "exist",
        };
        this._debugLog.push({
          noun,
          exist,
          name,
          result: result.category,
          confidence: result.confidence,
          source: result.source,
          timestamp: Date.now(),
        });
        return result;
      }
    }

    // Try noun-based categorization
    if (noun) {
      const category = this._categoryMappings[noun.toLowerCase()];
      if (category !== undefined) {
        result = {
          category,
          confidence: "high",
          source: "noun",
        };
        this._debugLog.push({
          noun,
          exist,
          name,
          result: result.category,
          confidence: result.confidence,
          source: result.source,
          timestamp: Date.now(),
        });
        return result;
      }
    }

    // Fallback - no categorization found
    result = {
      category: null,
      confidence: "low",
      source: "fallback",
    };

    this._debugLog.push({
      noun,
      exist,
      name,
      result: result.category,
      confidence: result.confidence,
      source: result.source,
      timestamp: Date.now(),
    });

    return result;
  },

  getItemCategory(noun: string, fullName?: string) {
    const result = this.categorizeGameElement({ noun, name: fullName });
    return result.category;
  },

  getDebugLog() {
    return this._debugLog;
  },

  clearDebugLog() {
    this._debugLog = [];
  },

  async initialize() {},
  isCategoryEnabled(_category: string) {
    return true;
  },
  get isReady() {
    return true;
  },
};

// Store original methods for restoration
const originalMethods = {
  categorizeGameElement: ItemHighlighter.categorizeGameElement,
  getItemCategory: ItemHighlighter.getItemCategory,
  initialize: ItemHighlighter.initialize,
  isCategoryEnabled: ItemHighlighter.isCategoryEnabled,
  isReady: Object.getOwnPropertyDescriptor(ItemHighlighter, "isReady") || { get: () => ItemHighlighter.isReady },
};

// Helper to apply mock temporarily (only for this story)
const applyEdgeCaseMock = () => {
  ItemHighlighter.categorizeGameElement = edgeCaseMockHighlighter.categorizeGameElement.bind(edgeCaseMockHighlighter);
  ItemHighlighter.getItemCategory = edgeCaseMockHighlighter.getItemCategory.bind(edgeCaseMockHighlighter);
  ItemHighlighter.initialize = edgeCaseMockHighlighter.initialize.bind(edgeCaseMockHighlighter);
  ItemHighlighter.isCategoryEnabled = edgeCaseMockHighlighter.isCategoryEnabled.bind(edgeCaseMockHighlighter);
  Object.defineProperty(ItemHighlighter, "isReady", {
    get: () => true,
    configurable: true,
  });
};

// Helper to restore original methods
const restoreOriginalMethods = () => {
  ItemHighlighter.categorizeGameElement = originalMethods.categorizeGameElement;
  ItemHighlighter.getItemCategory = originalMethods.getItemCategory;
  ItemHighlighter.initialize = originalMethods.initialize;
  ItemHighlighter.isCategoryEnabled = originalMethods.isCategoryEnabled;
  Object.defineProperty(ItemHighlighter, "isReady", originalMethods.isReady);
};

// Import game element components
import "../game-elements/game-link.lit";
import "../game-elements/game-command.lit";

// Type for feed component
type FeedElement = HTMLElement & {
  appendGameTags: (tags: Array<GameTag>) => void;
};

// Utility functions for creating game tags
const createTextTag = (text: string) => {
  const tag = makeTag(":text");
  tag.text = text;
  return tag;
};

const createPresetTag = (id: string, text: string) => {
  const tag = makeTag("preset");
  tag.attrs = { id };
  tag.text = text;
  return tag;
};

const createGameLinkTag = (exist: string, noun: string, text: string) => {
  const tag = makeTag("a");
  tag.attrs = { exist, noun };
  tag.text = text;
  return tag;
};

// Edge case scenarios based on debug output from icemule log
const createFailedCategorizationScenario = () => [
  createPresetTag("roomDesc", "=== CATEGORIZATION FAILURES ==="),
  createTextTag("\n"),
  createTextTag("Items that failed exist-based categorization:"),
  createTextTag("\n"),
  createGameLinkTag("-11231958", "south", "south"), // Direction that failed to categorize
  createTextTag(", "),
  createGameLinkTag("-11231958", "west", "west"), // Another direction
  createTextTag("\n"),
  createTextTag("Environmental objects with weird IDs:"),
  createTextTag("\n"),
  createGameLinkTag("-480436", "snow", "snow"), // Failed to categorize in log
  createTextTag(", "),
  createGameLinkTag("-464992", "statue", "statue"), // Exists but shouldn't highlight
  createTextTag("\n"),
  createTextTag("Player names (should not categorize):"),
  createTextTag("\n"),
  createGameLinkTag("-10240033", "Parwyn", "Parwyn"),
  createTextTag(", "),
  createGameLinkTag("-10470747", "Rollandio", "Rollandio"),
];

const createUndefinedNameScenario = () => [
  createPresetTag("roomDesc", "=== UNDEFINED NAME HANDLING ==="),
  createTextTag("\n"),
  createTextTag("Items with undefined or empty names:"),
  createTextTag("\n"),
  createGameLinkTag("-10240033", "Parwyn", ""), // Empty name from log
  createTextTag("(empty name), "),
  createGameLinkTag("134750440", "ayr", ""), // Another empty name
  createTextTag("(undefined name)"),
  createTextTag("\n"),
  createTextTag("These should not crash the highlighting system."),
];

const createMalformedDataScenario = () => [
  createPresetTag("roomDesc", "=== MALFORMED DATA TEST ==="),
  createTextTag("\n"),
  createTextTag("Items with unusual attributes:"),
  createTextTag("\n"),
  createGameLinkTag("", "sword", "a nameless sword"), // Empty exist ID
  createTextTag(", "),
  createGameLinkTag("12345", "", "mysterious object"), // Empty noun
  createTextTag(", "),
  createGameLinkTag("", "", "phantom item"), // Both empty
  createTextTag("\n"),
  createTextTag("Very long item names:"),
  createTextTag("\n"),
  createGameLinkTag("long1", "sword", "an extraordinarily magnificent jewel-encrusted mithril longsword of incredible power and legendary status"),
  createTextTag("\n"),
  createTextTag("Special characters in names:"),
  createTextTag("\n"),
  createGameLinkTag("special1", "ring", "a ring with 'quotes' and \"double quotes\""),
  createTextTag(", "),
  createGameLinkTag("special2", "potion", "a potion (very rare)"),
];

const createPerformanceStressScenario = () => [
  createPresetTag("roomDesc", "=== PERFORMANCE STRESS TEST ==="),
  createTextTag("\n"),
  createTextTag("Many items with rapid highlighting:"),
  createTextTag("\n"),
  // Create many items to test performance
  ...Array.from({ length: 20 }, (_, i) => [createGameLinkTag(`item${i}`, i % 2 === 0 ? "sword" : "ring", `item ${i}`), createTextTag(i < 19 ? ", " : "")]).flat(),
  createTextTag("\n"),
  createTextTag("Mixed success and failure cases:"),
  createTextTag("\n"),
  createGameLinkTag("success1", "sword", "successful sword"),
  createTextTag(", "),
  createGameLinkTag("-999999", "unknown", "failed item"),
  createTextTag(", "),
  createGameLinkTag("success2", "ring", "successful ring"),
  createTextTag(", "),
  createGameLinkTag("-888888", "weird", "another failure"),
];

const createDebugOutputSimulation = () => [
  createPresetTag("roomDesc", "=== DEBUG OUTPUT SIMULATION ==="),
  createTextTag("\n"),
  createPresetTag("roomDesc", '[ItemHighlighter] categorizeGameElement called with: noun="sword", exist="12345", name="steel sword"'),
  createTextTag("\n"),
  createPresetTag("roomDesc", '[ItemHighlighter] Found noun-based category "weapon" for "sword"'),
  createTextTag("\n"),
  createPresetTag("roomDesc", '[ItemHighlighting] Categorization result for "sword": weapon'),
  createTextTag("\n"),
  createGameLinkTag("debug1", "sword", "steel sword"),
  createTextTag(" (successfully categorized)"),
  createTextTag("\n"),
  createPresetTag("roomDesc", '[ItemHighlighter] categorizeGameElement called with: noun="Parwyn", exist="-10240033", name="Parwyn"'),
  createTextTag("\n"),
  createPresetTag("roomDesc", '[ItemHighlighter] No noun-based category found for "Parwyn"'),
  createTextTag("\n"),
  createPresetTag("roomDesc", '[ItemHighlighter] No exist-based category found for "-10240033"'),
  createTextTag("\n"),
  createPresetTag("roomDesc", "[ItemHighlighter] No category found for item"),
  createTextTag("\n"),
  createGameLinkTag("-10240033", "Parwyn", "Parwyn"),
  createTextTag(" (failed to categorize - expected)"),
];

const createConcurrentCategorizationScenario = () => [
  createPresetTag("roomDesc", "=== CONCURRENT CATEGORIZATION ==="),
  createTextTag("\n"),
  createTextTag("Multiple items appearing simultaneously:"),
  createTextTag("\n"),
  createGameLinkTag("conc1", "sword", "sword 1"),
  createTextTag(" "),
  createGameLinkTag("conc2", "ring", "ring 1"),
  createTextTag(" "),
  createGameLinkTag("conc3", "leaf", "herb 1"),
  createTextTag(" "),
  createGameLinkTag("conc4", "tart", "food 1"),
  createTextTag(" "),
  createGameLinkTag("conc5", "unknown", "unknown 1"),
  createTextTag(" "),
  createGameLinkTag("conc6", "sword", "sword 2"),
  createTextTag(" "),
  createGameLinkTag("conc7", "ring", "ring 2"),
  createTextTag(" all appear at once!"),
];

const meta: Meta = {
  title: "Session/Feed/Edge Cases & Debugging",
  component: "illthorn-feed-modernized-lit",
  parameters: {
    docs: {
      description: {
        component:
          "Edge cases and debugging scenarios from the icemule gamelog. Tests highlighting system failure modes, categorization edge cases, malformed data handling, and debug output scenarios that help identify highlighting issues.",
      },
    },
  },
  argTypes: {
    focused: {
      control: "boolean",
      description: "Whether the feed has focus",
    },
  },
};

export default meta;
type Story = StoryObj;

export const FailedCategorization: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    // Apply edge case mock for this story only
    applyEdgeCaseMock();

    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="failed-categorization"]') as FeedElement;
      if (feed?.appendGameTags) {
        feed.appendGameTags(createFailedCategorizationScenario());
      }
      // Restore original methods after feed is populated
      setTimeout(() => restoreOriginalMethods(), 500);
    }, 100);

    return html`
      <div style="width: 800px; height: 500px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Failed Categorization Scenarios</h3>
        <illthorn-feed-modernized-lit 
          data-story="failed-categorization"
          .focused=${args.focused}
          style="height: 350px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0 0 0.5rem 0;"><strong>Expected Behavior:</strong></p>
          <ul style="margin: 0; padding-left: 1.5rem; font-size: 0.85rem;">
            <li>Directions and environmental objects should not be highlighted</li>
            <li>Player names should appear as normal links</li>
            <li>No console errors or crashes</li>
            <li>Graceful fallback for items that can't be categorized</li>
          </ul>
        </div>
      </div>
    `;
  },
};

export const UndefinedNameHandling: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    // Apply edge case mock for this story only
    applyEdgeCaseMock();

    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="undefined-names"]') as FeedElement;
      if (feed?.appendGameTags) {
        feed.appendGameTags(createUndefinedNameScenario());
      }
      // Restore original methods after feed is populated
      setTimeout(() => restoreOriginalMethods(), 500);
    }, 100);

    return html`
      <div style="width: 800px; height: 400px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Undefined Name Handling</h3>
        <illthorn-feed-modernized-lit 
          data-story="undefined-names"
          .focused=${args.focused}
          style="height: 250px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0; font-size: 0.85rem;"><strong>Robustness Test:</strong> Items with empty or undefined names should not crash the highlighting system. They should appear as normal clickable links.</p>
        </div>
      </div>
    `;
  },
};

export const MalformedDataHandling: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    // Apply edge case mock for this story only
    applyEdgeCaseMock();

    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="malformed-data"]') as FeedElement;
      if (feed?.appendGameTags) {
        feed.appendGameTags(createMalformedDataScenario());
      }
      // Restore original methods after feed is populated
      setTimeout(() => restoreOriginalMethods(), 500);
    }, 100);

    return html`
      <div style="width: 900px; height: 550px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Malformed Data Handling</h3>
        <illthorn-feed-modernized-lit 
          data-story="malformed-data"
          .focused=${args.focused}
          style="height: 400px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0 0 0.5rem 0;"><strong>Data Resilience Test:</strong></p>
          <ul style="margin: 0; padding-left: 1.5rem; font-size: 0.85rem;">
            <li>Empty exist IDs and nouns should not break highlighting</li>
            <li>Very long item names should display properly</li>
            <li>Special characters should be handled correctly</li>
            <li>No JavaScript errors in console</li>
          </ul>
        </div>
      </div>
    `;
  },
};

export const PerformanceStressTest: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    // Apply edge case mock for this story only
    applyEdgeCaseMock();

    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="performance-stress"]') as FeedElement;
      if (feed?.appendGameTags) {
        feed.appendGameTags(createPerformanceStressScenario());
      }
      // Restore original methods after feed is populated
      setTimeout(() => restoreOriginalMethods(), 500);
    }, 100);

    return html`
      <div style="width: 900px; height: 500px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Performance Stress Test</h3>
        <illthorn-feed-modernized-lit 
          data-story="performance-stress"
          .focused=${args.focused}
          style="height: 350px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0 0 0.5rem 0;"><strong>Performance Test:</strong></p>
          <ul style="margin: 0; padding-left: 1.5rem; font-size: 0.85rem;">
            <li>Many items should highlight quickly</li>
            <li>Mixed success/failure cases should not slow down rendering</li>
            <li>No performance degradation with complex highlighting</li>
            <li>Smooth scrolling and interaction</li>
          </ul>
        </div>
      </div>
    `;
  },
};

export const DebugOutputSimulation: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    // Apply edge case mock for this story only
    applyEdgeCaseMock();

    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="debug-output"]') as FeedElement;
      if (feed?.appendGameTags) {
        feed.appendGameTags(createDebugOutputSimulation());
      }
      // Restore original methods after feed is populated
      setTimeout(() => restoreOriginalMethods(), 500);
    }, 100);

    return html`
      <div style="width: 1000px; height: 600px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Debug Output Simulation</h3>
        <illthorn-feed-modernized-lit 
          data-story="debug-output"
          .focused=${args.focused}
          style="height: 450px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0; font-size: 0.85rem;"><strong>Debug Visualization:</strong> Shows what the debug output from the icemule log would look like in the actual UI. Helps developers understand the categorization process when debugging highlighting issues.</p>
        </div>
      </div>
    `;
  },
};

export const ConcurrentCategorization: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    // Apply edge case mock for this story only
    applyEdgeCaseMock();

    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="concurrent"]') as FeedElement;
      if (feed?.appendGameTags) {
        feed.appendGameTags(createConcurrentCategorizationScenario());
      }
      // Restore original methods after feed is populated
      setTimeout(() => restoreOriginalMethods(), 500);
    }, 100);

    return html`
      <div style="width: 800px; height: 400px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Concurrent Categorization Test</h3>
        <illthorn-feed-modernized-lit 
          data-story="concurrent"
          .focused=${args.focused}
          style="height: 250px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0; font-size: 0.85rem;"><strong>Concurrency Test:</strong> Multiple items appearing simultaneously should all be categorized correctly without race conditions or highlighting conflicts.</p>
        </div>
      </div>
    `;
  },
};

export const ProgressiveFailureRecovery: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    // Apply edge case mock for this story only
    applyEdgeCaseMock();

    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="failure-recovery"]') as FeedElement;
      if (feed?.appendGameTags) {
        // Show how the system recovers from failures
        feed.appendGameTags([createPresetTag("roomDesc", "=== FAILURE RECOVERY TEST ===")]);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("Starting with a failure: "), createGameLinkTag("-999", "unknown", "unknown item")]);
        }, 200);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("Then a success: "), createGameLinkTag("good1", "sword", "working sword")]);
        }, 500);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("Another failure: "), createGameLinkTag("", "", "empty item")]);
        }, 800);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("Recovery with success: "), createGameLinkTag("good2", "ring", "magic ring")]);
        }, 1100);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("Player name (expected failure): "), createGameLinkTag("-10240033", "Parwyn", "Parwyn")]);
        }, 1400);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("Final success: "), createGameLinkTag("good3", "leaf", "healing herbs")]);
        }, 1700);

        // Restore original methods after all content is populated
        setTimeout(() => restoreOriginalMethods(), 2000);
      }
    }, 100);

    return html`
      <div style="width: 800px; height: 500px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Progressive Failure Recovery</h3>
        <illthorn-feed-modernized-lit 
          data-story="failure-recovery"
          .focused=${args.focused}
          style="height: 350px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0; font-size: 0.85rem;"><strong>Recovery Test:</strong> System should gracefully handle failures and continue working normally for subsequent items. No permanent damage from failed categorizations.</p>
        </div>
      </div>
    `;
  },
};

export const ErrorBoundaryTest: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    // Apply edge case mock for this story only
    applyEdgeCaseMock();

    setTimeout(() => {
      const feed = document.querySelector('illthorn-feed-modernized-lit[data-story="error-boundary"]') as FeedElement;
      if (feed?.appendGameTags) {
        // Test extreme edge cases that might cause errors
        feed.appendGameTags([createPresetTag("roomDesc", "=== ERROR BOUNDARY TEST ===")]);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("Null noun with exist: "), createGameLinkTag("123", "", "item with null noun")]);
        }, 200);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("Unicode characters: "), createGameLinkTag("unicode1", "sword", "⚔️ unicode sword 剣")]);
        }, 500);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("Very large exist ID: "), createGameLinkTag("999999999999999999999", "ring", "huge ID ring")]);
        }, 800);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("HTML in name: "), createGameLinkTag("html1", "potion", "<script>alert('test')</script>potion")]);
        }, 1100);

        setTimeout(() => {
          feed.appendGameTags([createTextTag("Normal item after chaos: "), createGameLinkTag("normal1", "sword", "normal sword")]);
        }, 1400);

        // Restore original methods after all content is populated
        setTimeout(() => restoreOriginalMethods(), 1700);
      }
    }, 100);

    return html`
      <div style="width: 900px; height: 500px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Error Boundary Test</h3>
        <illthorn-feed-modernized-lit 
          data-story="error-boundary"
          .focused=${args.focused}
          style="height: 350px; overflow-y: auto;"
        ></illthorn-feed-modernized-lit>
        <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
          <p style="margin: 0 0 0.5rem 0;"><strong>Security & Stability Test:</strong></p>
          <ul style="margin: 0; padding-left: 1.5rem; font-size: 0.85rem;">
            <li>Unicode characters should display correctly</li>
            <li>HTML should be escaped and not executed</li>
            <li>Large IDs should not cause overflow issues</li>
            <li>System should remain stable after unusual inputs</li>
          </ul>
        </div>
      </div>
    `;
  },
};
