// ABOUTME: Centralized configuration for Illthorn application
// ABOUTME: Contains hard-coded configuration values including file paths and application constants

/**
 * Application configuration object with typed constants
 * This centralizes all configuration values for easy maintenance
 */
export const CONFIG = {
  /**
   * Data file configurations
   */
  data: {
    /**
     * XML data file paths relative to app root
     */
    xmlFiles: {
      /**
       * Game object categorization data (items, weapons, herbs, etc.)
       */
      gameObjects: "data/gameobj-data.xml",

      /**
       * Spell definitions with stats and effects
       */
      spells: "data/spell-list.xml",
    },
  },

  /**
   * Future configuration sections can be added here
   * Examples:
   * - themes: { default: "original", available: [...] }
   * - network: { timeout: 5000, retries: 3 }
   * - ui: { feedMaxMemory: 500, autoScroll: true }
   */
} as const;

/**
 * Type-safe configuration object type
 * Use this type when importing CONFIG in other modules
 */
export type AppConfig = typeof CONFIG;

/**
 * Helper function to get XML file paths with proper typing
 */
export function getXMLFilePath(type: keyof typeof CONFIG.data.xmlFiles): string {
  return CONFIG.data.xmlFiles[type];
}

/**
 * Utility to validate configuration at startup
 * Can be extended to check file existence, validate URLs, etc.
 */
export function validateConfig(): boolean {
  // Basic validation - ensure all required paths are defined
  const requiredPaths = Object.values(CONFIG.data.xmlFiles);

  for (const path of requiredPaths) {
    if (!path || typeof path !== "string" || path.trim().length === 0) {
      console.error(`Invalid configuration: empty or invalid path detected`);
      return false;
    }
  }

  return true;
}
