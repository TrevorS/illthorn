// ABOUTME: Automatic item categorization and highlighting system for game elements
// ABOUTME: Provides semantic classification of items based on XML data and noun attributes

import { loadGameObjectData, type ParsedXMLData, XMLDataParser } from "./xml-data-parser";

/**
 * Comprehensive item categorization system based on XML data
 */
// biome-ignore lint/complexity/noStaticOnlyClass: Manages shared state and async initialization for item categorization
export class ItemHighlighter {
  private static xmlData: ParsedXMLData | null = null;
  private static loading: Promise<ParsedXMLData> | null = null;
  private static settingsCache: Record<string, boolean> | null = null;

  /**
   * Initialize the highlighter with XML data
   */
  static async initialize(): Promise<void> {
    if (ItemHighlighter.xmlData) {
      return;
    }

    if (!ItemHighlighter.loading) {
      ItemHighlighter.loading = loadGameObjectData();
    }

    ItemHighlighter.xmlData = await ItemHighlighter.loading;

    // Also preload settings for synchronous access
    await ItemHighlighter._loadSettings();
  }

  /**
   * Get the category of an item based on its noun and full name
   */
  static getItemCategory(noun: string, fullName?: string): string | null {
    if (!ItemHighlighter.xmlData || !noun) {
      return null;
    }

    const searchName = fullName || noun;
    return XMLDataParser.findBestCategory(noun, searchName, ItemHighlighter.xmlData);
  }

  /**
   * Check if an item should be excluded from highlighting
   */
  static shouldExclude(_noun: string, fullName: string, category: string): boolean {
    if (!ItemHighlighter.xmlData) return false;

    const categoryData = ItemHighlighter.xmlData.types.get(category);
    if (!categoryData) return false;

    return XMLDataParser.isExcluded(fullName, categoryData);
  }

  /**
   * Get the CSS custom property name for an item category
   */
  static getCategoryColor(category: string): string {
    const colorMap: Record<string, string> = {
      // Primary game item types
      gem: "var(--color-item-gem, #ffd43b)",
      jewelry: "var(--color-item-jewelry, #e599f7)",
      weapon: "var(--color-item-weapon, #ff6b6b)",
      armor: "var(--color-item-armor, #74c0fc)",
      clothing: "var(--color-item-clothing, #69db7c)",
      food: "var(--color-item-food, #ffa94d)",
      reagent: "var(--color-item-reagent, #9775fa)",
      valuable: "var(--color-item-valuable, #f783ac)",
      box: "var(--color-item-box, #868e96)",

      // Backward compatibility with legacy names
      herbal: "var(--color-item-reagent, #9775fa)", // Map to reagent
      magic: "var(--color-item-valuable, #f783ac)", // Map to valuable
      forgeable: "var(--color-item-reagent, #9775fa)", // Map to reagent
      container: "var(--color-item-box, #868e96)", // Map to box

      // Default fallback
      junk: "var(--color-item-junk, #6c757d)",
    };

    return colorMap[category] || "var(--color-item-default, #a0a0a0)";
  }

  /**
   * Check if automatic highlighting is enabled for a category
   */
  static isCategoryEnabled(category: string): boolean {
    if (ItemHighlighter.settingsCache && typeof ItemHighlighter.settingsCache[category] === "boolean") {
      return ItemHighlighter.settingsCache[category];
    }

    // Enable all categories by default
    return true;
  }

  /**
   * Load and cache settings for synchronous access
   */
  private static async _loadSettings(): Promise<void> {
    if (ItemHighlighter.settingsCache !== null) {
      return;
    }

    try {
      // TODO: Integrate with settings system
      const settings = (await window.Settings?.get("itemHighlighting")) as Record<string, boolean> | undefined;
      ItemHighlighter.settingsCache = settings || {};
    } catch (_e) {
      ItemHighlighter.settingsCache = {};
    }
  }

  /**
   * Get all available categories for settings UI
   */
  static getAllCategories(): Array<{ key: string; name: string; color: string }> {
    const categories: Array<{ key: string; name: string; color: string }> = [];

    if (ItemHighlighter.xmlData) {
      for (const [categoryKey] of ItemHighlighter.xmlData.types) {
        const displayName = XMLDataParser.getCategoryDisplayName(categoryKey);
        const color = ItemHighlighter.getCategoryColor(categoryKey)
          .replace(/var\(--color-item-\w+,\s*/, "")
          .replace(/\)$/, "");

        categories.push({
          key: categoryKey,
          name: displayName,
          color: color,
        });
      }
    }

    // Sort by name for UI display
    categories.sort((a, b) => a.name.localeCompare(b.name));

    return categories;
  }

  /**
   * Get statistics about loaded data
   */
  static getStats(): { categories: number; patterns: number; lookups: number } {
    if (!ItemHighlighter.xmlData) {
      return { categories: 0, patterns: 0, lookups: 0 };
    }

    let patterns = 0;
    for (const typeData of ItemHighlighter.xmlData.types.values()) {
      patterns += typeData.nounPatterns.length + typeData.namePatterns.length + typeData.excludePatterns.length;
    }

    return {
      categories: ItemHighlighter.xmlData.types.size,
      patterns,
      lookups: ItemHighlighter.xmlData.categories.size,
    };
  }

  /**
   * Pre-warm the cache for better performance
   */
  static preload(): Promise<void> {
    return ItemHighlighter.initialize();
  }

  /**
   * Clear cached data (useful for testing)
   */
  static clearCache(): void {
    ItemHighlighter.xmlData = null;
    ItemHighlighter.loading = null;
    ItemHighlighter.settingsCache = null;
  }

  /**
   * Check if the highlighter is ready (data and settings loaded)
   */
  static get isReady(): boolean {
    return ItemHighlighter.xmlData !== null && ItemHighlighter.settingsCache !== null;
  }

  /**
   * Categorize a game element based on its attributes
   */
  static categorizeGameElement(attributes: { noun?: string; exist?: string; name?: string; [key: string]: unknown }): {
    category: string | null;
    confidence: "high" | "medium" | "low";
    source: "noun" | "name" | "exist" | "fallback";
  } {
    const { noun, exist, name } = attributes;

    if (!ItemHighlighter.xmlData) {
      return {
        category: null,
        confidence: "low",
        source: "fallback",
      };
    }

    // Try noun first (highest confidence)
    if (noun) {
      const nounCategory = ItemHighlighter.getItemCategory(noun, name);
      if (nounCategory) {
        return {
          category: nounCategory,
          confidence: "high",
          source: "noun",
        };
      }
    }

    // Try exist attribute (medium confidence)
    if (exist) {
      const existCategory = ItemHighlighter.getItemCategory(exist, name);
      if (existCategory) {
        return {
          category: existCategory,
          confidence: "medium",
          source: "exist",
        };
      }
    }

    // Try full name pattern matching (low confidence)
    if (name) {
      for (const [categoryName, categoryData] of ItemHighlighter.xmlData.types) {
        if (categoryData.namePatterns.some((pattern) => pattern.test(name))) {
          if (!XMLDataParser.isExcluded(name, categoryData)) {
            return {
              category: categoryName,
              confidence: "low",
              source: "name",
            };
          }
        }
      }
    }

    return {
      category: null,
      confidence: "low",
      source: "fallback",
    };
  }
}
