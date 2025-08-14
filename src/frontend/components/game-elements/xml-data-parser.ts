// ABOUTME: XML data parser for gameobj-data.xml to extract item categorization patterns
// ABOUTME: Processes XML data into structured regex patterns for automatic item highlighting

interface ItemTypeData {
  name: string;
  nounPatterns: Array<RegExp>;
  namePatterns: Array<RegExp>;
  excludePatterns: Array<RegExp>;
}

export interface ParsedXMLData {
  types: Map<string, ItemTypeData>;
  categories: Map<string, string>; // noun -> category mapping for quick lookup
}

/**
 * Parses gameobj-data.xml content to extract item categorization patterns
 */
// biome-ignore lint/complexity/noStaticOnlyClass: Provides stateless XML parsing utilities with complex interdependent methods
export class XMLDataParser {
  /**
   * Parse XML content and extract structured item data
   */
  static async parseGameObjectData(xmlContent: string): Promise<ParsedXMLData> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlContent, "text/xml");

    const types = new Map<string, ItemTypeData>();
    const categories = new Map<string, string>();

    // Extract all <type> elements
    const typeElements = doc.querySelectorAll("type[name]");

    for (const typeElement of typeElements) {
      const typeName = typeElement.getAttribute("name");
      if (!typeName) continue;

      const typeData = XMLDataParser.parseTypeElement(typeElement, typeName);
      types.set(typeName, typeData);

      // Build quick lookup map from noun patterns
      XMLDataParser.buildCategoryLookup(typeData, categories);
    }

    return { types, categories };
  }

  /**
   * Parse a single <type> element and extract its patterns
   */
  private static parseTypeElement(element: Element, typeName: string): ItemTypeData {
    const typeData: ItemTypeData = {
      name: typeName,
      nounPatterns: [],
      namePatterns: [],
      excludePatterns: [],
    };

    // Extract <noun> patterns
    const nounElements = element.querySelectorAll("noun");
    for (const nounElement of nounElements) {
      const pattern = nounElement.textContent?.trim();
      if (pattern) {
        try {
          // Convert the existing regex pattern (remove ^ and $ if present)
          const cleanPattern = pattern.replace(/^\^|\$$/g, "");
          const regex = new RegExp(cleanPattern, "i");
          typeData.nounPatterns.push(regex);
        } catch (e) {
          console.warn(`Invalid noun regex in ${typeName}:`, pattern, e);
        }
      }
    }

    // Extract <name> patterns
    const nameElements = element.querySelectorAll("name");
    for (const nameElement of nameElements) {
      const pattern = nameElement.textContent?.trim();
      if (pattern) {
        try {
          const cleanPattern = pattern.replace(/^\^|\$$/g, "");
          const regex = new RegExp(cleanPattern, "i");
          typeData.namePatterns.push(regex);
        } catch (e) {
          console.warn(`Invalid name regex in ${typeName}:`, pattern, e);
        }
      }
    }

    // Extract <exclude> patterns
    const excludeElements = element.querySelectorAll("exclude");
    for (const excludeElement of excludeElements) {
      const pattern = excludeElement.textContent?.trim();
      if (pattern) {
        try {
          const cleanPattern = pattern.replace(/^\^|\$$/g, "");
          const regex = new RegExp(cleanPattern, "i");
          typeData.excludePatterns.push(regex);
        } catch (e) {
          console.warn(`Invalid exclude regex in ${typeName}:`, pattern, e);
        }
      }
    }

    return typeData;
  }

  /**
   * Build quick lookup map for common nouns
   */
  private static buildCategoryLookup(typeData: ItemTypeData, categories: Map<string, string>) {
    // Extract simple noun matches from patterns for quick lookup
    for (const pattern of typeData.nounPatterns) {
      const matches = XMLDataParser.extractSimpleMatches(pattern.source);
      for (const match of matches) {
        categories.set(match.toLowerCase(), typeData.name);
      }
    }
  }

  /**
   * Extract simple string matches from regex patterns
   * This handles patterns like (sword|dagger|blade) to extract individual items
   */
  private static extractSimpleMatches(regexSource: string): Array<string> {
    const matches: Array<string> = [];

    // Handle simple alternation patterns: (word1|word2|word3)
    const alternationMatch = regexSource.match(/^\(([^)]+)\)$/);
    if (alternationMatch) {
      const alternatives = alternationMatch[1].split("|");
      for (const alt of alternatives) {
        // Clean up the alternative (remove escape characters, etc.)
        const cleaned = alt.replace(/\\-/g, "-").replace(/\\\./g, ".").trim();
        if (cleaned && /^[\w\s-]+$/.test(cleaned)) {
          matches.push(cleaned);
        }
      }
    }
    // Handle simple word patterns
    else if (/^[\w\s-]+$/.test(regexSource)) {
      matches.push(regexSource);
    }

    return matches;
  }

  /**
   * Check if a noun matches any exclude patterns for a category
   */
  static isExcluded(noun: string, categoryData: ItemTypeData): boolean {
    return categoryData.excludePatterns.some((pattern) => pattern.test(noun));
  }

  /**
   * Find the best category match for a given noun and full name
   */
  static findBestCategory(noun: string, fullName: string, parsedData: ParsedXMLData): string | null {
    // Quick lookup first
    const quickMatch = parsedData.categories.get(noun.toLowerCase());
    if (quickMatch) {
      const categoryData = parsedData.types.get(quickMatch);
      if (categoryData && !XMLDataParser.isExcluded(fullName, categoryData)) {
        return quickMatch;
      }
    }

    // Full pattern matching
    for (const [categoryName, categoryData] of parsedData.types) {
      // Check exclude patterns first
      if (XMLDataParser.isExcluded(fullName, categoryData)) {
        continue;
      }

      // Check noun patterns
      if (categoryData.nounPatterns.some((pattern) => pattern.test(noun))) {
        return categoryName;
      }

      // Check name patterns
      if (categoryData.namePatterns.some((pattern) => pattern.test(fullName))) {
        return categoryName;
      }
    }

    return null;
  }

  /**
   * Get user-friendly category names
   */
  static getCategoryDisplayName(category: string): string {
    const displayNames: Record<string, string> = {
      gem: "Gems & Stones",
      jewelry: "Jewelry",
      weapon: "Weapons",
      armor: "Armor & Shields",
      clothing: "Clothing",
      food: "Food & Consumables",
      reagent: "Reagents & Components",
      valuable: "Valuables",
      box: "Boxes & Containers",
      junk: "Junk Items",
    };

    return displayNames[category] || category;
  }
}

/**
 * Singleton instance for loaded XML data
 */
let cachedXMLData: ParsedXMLData | null = null;

/**
 * Load and cache the XML data using Vite raw import
 * Works in all contexts: Electron, Storybook, and browser environments
 */
export async function loadGameObjectData(): Promise<ParsedXMLData> {
  if (cachedXMLData) {
    console.log("[XML] Using cached XML data");
    return cachedXMLData;
  }

  console.log("[XML] Loading game object data via Vite raw import");

  try {
    // Use Vite's raw import to load XML content as string
    const xmlModule = await import("../../../../data/gameobj-data.xml?raw");
    const xmlContent = xmlModule.default;

    console.log(`[XML] Loaded XML content (${xmlContent.length} characters)`);

    cachedXMLData = await XMLDataParser.parseGameObjectData(xmlContent);

    console.log(`[XML] Successfully parsed ${cachedXMLData.types.size} item categories with ${cachedXMLData.categories.size} quick lookups`);

    // Log some sample categories for debugging
    const sampleCategories = Array.from(cachedXMLData.types.keys()).slice(0, 5);
    console.log(`[XML] Sample categories: ${sampleCategories.join(", ")}`);

    return cachedXMLData;
  } catch (error) {
    console.error("[XML] Failed to load game object data:", error);
    console.error("[XML] This will cause item highlighting to fail");
    // Return empty data as fallback
    return { types: new Map(), categories: new Map() };
  }
}

/**
 * Clear cached XML data (useful for testing)
 */
export function clearXMLCache(): void {
  cachedXMLData = null;
}
