// ABOUTME: Text navigation utilities with precompiled regexes for performance
// ABOUTME: Provides word boundary detection and cursor movement helpers

// Precompiled regexes for performance
const NON_WHITESPACE_REGEX = /\S/;
const WHITESPACE_REGEX = /\s/;

/**
 * Find the position of the start of the next word from the given position
 */
export function getWordBoundaryForward(text: string, position: number): number {
  // Find the start of the next word
  let i = position;
  // Skip current word characters
  while (i < text.length && NON_WHITESPACE_REGEX.test(text[i])) {
    i++;
  }
  // Skip whitespace to start of next word
  while (i < text.length && WHITESPACE_REGEX.test(text[i])) {
    i++;
  }
  return i;
}

/**
 * Find the position of the start of the current word or previous word from the given position
 */
export function getWordBoundaryBackward(text: string, position: number): number {
  // Find the start of the current word or previous word
  let i = position;
  // Skip whitespace before current position
  while (i > 0 && WHITESPACE_REGEX.test(text[i - 1])) {
    i--;
  }
  // Skip word characters to find word start
  while (i > 0 && NON_WHITESPACE_REGEX.test(text[i - 1])) {
    i--;
  }
  return i;
}

/**
 * Extract text from position to the end of the current word
 */
export function getTextToEndOfWord(text: string, position: number): string {
  const endPosition = getWordBoundaryForward(text, position);
  return text.slice(position, endPosition);
}

/**
 * Extract the previous word from the given position
 */
export function getPreviousWord(text: string, position: number): string {
  const startPosition = getWordBoundaryBackward(text, position);
  return text.slice(startPosition, position);
}
