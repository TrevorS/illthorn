// ABOUTME: Factory for creating XML parser instances with feature flag support
// ABOUTME: Enables safe rollout and rollback of saxophone parser implementation

import { ParserType, type XMLParser } from "./interface";
import { Parser } from "./parser";
import { SaxophoneParser } from "./saxophone-parser";

/**
 * Configuration for parser factory behavior
 */
interface ParserFactoryConfig {
  /** Default parser type to use when no override is specified */
  defaultType?: ParserType;
  /** Environment variable name to check for parser type override */
  envVarName?: string;
  /** Force a specific parser type (bypasses all other settings) */
  forceType?: ParserType;
}

/**
 * Current parser factory configuration
 */
let config: ParserFactoryConfig = {
  defaultType: ParserType.CUSTOM,
  envVarName: "ILLTHORN_PARSER_TYPE",
};

/**
 * Configure the parser factory behavior
 */
export function configure(newConfig: Partial<ParserFactoryConfig>): void {
  config = { ...config, ...newConfig };
}

/**
 * Create a new XML parser instance based on configuration and feature flags
 */
export function create(overrideType?: ParserType): XMLParser {
  const parserType = determineParserType(overrideType);

  switch (parserType) {
    case ParserType.SAXOPHONE:
      return new SaxophoneParser();
    default:
      return Parser.of();
  }
}

/**
 * Determine which parser type to use based on configuration hierarchy
 */
function determineParserType(overrideType?: ParserType): ParserType {
  // 1. Force type override (highest priority)
  if (config.forceType) {
    return config.forceType;
  }

  // 2. Direct override parameter
  if (overrideType) {
    return overrideType;
  }

  // 3. Environment variable
  if (config.envVarName) {
    const envValue = getEnvironmentVariable(config.envVarName);
    if (envValue === "saxophone" || envValue === "custom") {
      return envValue as ParserType;
    }
  }

  // 4. Default fallback
  return config.defaultType || ParserType.CUSTOM;
}

/**
 * Get environment variable value safely (works in both Node.js and browser)
 */
function getEnvironmentVariable(name: string): string | undefined {
  // In Node.js (main process)
  if (typeof process !== "undefined" && process.env) {
    return process.env[name];
  }

  // In browser/renderer (check for environment variables passed via preload)
  if (typeof window !== "undefined" && (window as typeof window & { process?: { env: Record<string, string> } }).process?.env) {
    return (window as typeof window & { process: { env: Record<string, string> } }).process.env[name];
  }

  return undefined;
}

/**
 * Get the current parser type that would be created
 */
export function getCurrentParserType(overrideType?: ParserType): ParserType {
  return determineParserType(overrideType);
}

/**
 * Check if saxophone parser is currently enabled
 */
export function isSaxophoneEnabled(overrideType?: ParserType): boolean {
  return determineParserType(overrideType) === ParserType.SAXOPHONE;
}

/**
 * Create both parser types for comparison testing
 */
export function createBoth(): { custom: XMLParser; saxophone: XMLParser } {
  return {
    custom: Parser.of(),
    saxophone: new SaxophoneParser(),
  };
}

/**
 * Reset factory configuration to defaults
 */
export function reset(): void {
  config = {
    defaultType: ParserType.CUSTOM,
    envVarName: "ILLTHORN_PARSER_TYPE",
  };
}

// Legacy class-based API for backwards compatibility
// biome-ignore lint/complexity/noStaticOnlyClass: Legacy compatibility wrapper for existing code
export class ParserFactory {
  static configure = configure;
  static create = create;
  static getCurrentParserType = getCurrentParserType;
  static isSaxophoneEnabled = isSaxophoneEnabled;
  static createBoth = createBoth;
  static reset = reset;
}
