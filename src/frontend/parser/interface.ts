// ABOUTME: Parser abstraction interface for XML parsing implementations
// ABOUTME: Ensures API compatibility between custom and saxophone parsers

import type { GameTag } from "./tag";

/**
 * Common interface for XML parsers that convert game XML to GameTag objects
 */
export interface XMLParser {
  /**
   * Parse game XML text into structured GameTag objects
   */
  parse(text: string): GameTag[];

  /**
   * Reset parser state between sessions or after errors
   */
  reset(): void;

  /**
   * Whether all tags are closed and parser is in clean state
   */
  readonly isClosed: boolean;
}

/**
 * Parser types for factory pattern and feature flags
 */
export enum ParserType {
  CUSTOM = "custom",
  SAXOPHONE = "saxophone",
}
