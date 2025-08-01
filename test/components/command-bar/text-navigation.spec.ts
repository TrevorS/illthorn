import { describe, expect, test } from "vitest";
import { getPreviousWord, getTextToEndOfWord, getWordBoundaryBackward, getWordBoundaryForward } from "../../../src/frontend/components/command-bar/text-navigation";

describe("Text Navigation Functions", () => {
  describe("getWordBoundaryForward", () => {
    test("should find start of next word", () => {
      const text = "hello world test";
      expect(getWordBoundaryForward(text, 0)).toBe(6); // Start of "world"
      expect(getWordBoundaryForward(text, 5)).toBe(6); // Start of "world" (from space)
      expect(getWordBoundaryForward(text, 6)).toBe(12); // Start of "test"
    });

    test("should handle text at end of string", () => {
      const text = "hello world";
      expect(getWordBoundaryForward(text, 6)).toBe(11); // End of string
      expect(getWordBoundaryForward(text, 11)).toBe(11); // Already at end
    });

    test("should handle multiple whitespace", () => {
      const text = "hello   world";
      expect(getWordBoundaryForward(text, 0)).toBe(8); // Start of "world"
      expect(getWordBoundaryForward(text, 5)).toBe(8); // Start of "world"
    });

    test("should handle single character words", () => {
      const text = "a b c";
      expect(getWordBoundaryForward(text, 0)).toBe(2); // Start of "b"
      expect(getWordBoundaryForward(text, 2)).toBe(4); // Start of "c"
    });
  });

  describe("getWordBoundaryBackward", () => {
    test("should find start of current or previous word", () => {
      const text = "hello world test";
      expect(getWordBoundaryBackward(text, 16)).toBe(12); // Start of "test"
      expect(getWordBoundaryBackward(text, 12)).toBe(6); // Start of "world"
      expect(getWordBoundaryBackward(text, 6)).toBe(0); // Start of "hello"
    });

    test("should handle text at beginning", () => {
      const text = "hello world";
      expect(getWordBoundaryBackward(text, 0)).toBe(0); // Already at start
      expect(getWordBoundaryBackward(text, 1)).toBe(0); // Start of "hello"
    });

    test("should handle multiple whitespace", () => {
      const text = "hello   world";
      expect(getWordBoundaryBackward(text, 13)).toBe(8); // Start of "world"
      expect(getWordBoundaryBackward(text, 8)).toBe(0); // Start of "hello"
    });

    test("should handle whitespace at cursor position", () => {
      const text = "hello world";
      expect(getWordBoundaryBackward(text, 5)).toBe(0); // Start of "hello" (cursor on space)
    });
  });

  describe("getTextToEndOfWord", () => {
    test("should extract text from position to start of next word", () => {
      const text = "hello world";
      expect(getTextToEndOfWord(text, 0)).toBe("hello "); // Includes space
      expect(getTextToEndOfWord(text, 2)).toBe("llo "); // From 'l' to space after 'o'
      expect(getTextToEndOfWord(text, 6)).toBe("world"); // 'world' to end
    });

    test("should handle position at whitespace", () => {
      const text = "hello world";
      expect(getTextToEndOfWord(text, 5)).toBe(" "); // Just the space, then jumps to next word
    });

    test("should handle position at end of string", () => {
      const text = "hello world";
      expect(getTextToEndOfWord(text, 11)).toBe("");
    });
  });

  describe("getPreviousWord", () => {
    test("should extract previous word from position", () => {
      const text = "hello world test";
      expect(getPreviousWord(text, 11)).toBe("world");
      expect(getPreviousWord(text, 5)).toBe("hello");
      expect(getPreviousWord(text, 16)).toBe("test");
    });

    test("should handle position at beginning", () => {
      const text = "hello world";
      expect(getPreviousWord(text, 0)).toBe("");
      expect(getPreviousWord(text, 1)).toBe("h");
    });

    test("should handle whitespace", () => {
      const text = "hello world";
      expect(getPreviousWord(text, 6)).toBe("hello "); // From start of line to current position
    });
  });

  describe("Edge cases", () => {
    test("should handle empty string", () => {
      expect(getWordBoundaryForward("", 0)).toBe(0);
      expect(getWordBoundaryBackward("", 0)).toBe(0);
      expect(getTextToEndOfWord("", 0)).toBe("");
      expect(getPreviousWord("", 0)).toBe("");
    });

    test("should handle single word", () => {
      const text = "hello";
      expect(getWordBoundaryForward(text, 0)).toBe(5);
      expect(getWordBoundaryBackward(text, 5)).toBe(0);
      expect(getTextToEndOfWord(text, 0)).toBe("hello");
      expect(getPreviousWord(text, 5)).toBe("hello");
    });

    test("should handle only whitespace", () => {
      const text = "   ";
      expect(getWordBoundaryForward(text, 0)).toBe(3);
      expect(getWordBoundaryBackward(text, 3)).toBe(0);
      expect(getTextToEndOfWord(text, 0)).toBe("   ");
      expect(getPreviousWord(text, 3)).toBe("   ");
    });
  });
});
