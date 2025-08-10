// ABOUTME: User-configurable pattern highlighting system for component-based rendering
// ABOUTME: Replaces Mark.js with native component highlighting capabilities

export interface UserHighlightSettings {
  patterns: Record<string, string>; // pattern -> className
  groups: Record<string, Record<string, string>>; // className -> CSS properties
  enabled: boolean;
  caseSensitive: boolean;
}

export interface HighlightGroup {
  name: string;
  className: string;
  styles: Record<string, string>;
  patterns: Array<string>;
}

/**
 * Manager for user-defined highlight patterns and styling
 */
export class UserHighlightManager {
  private static instance: UserHighlightManager;
  private patterns: Map<RegExp, string> = new Map();
  private groups: Map<string, Record<string, string>> = new Map();
  private styleSheet?: CSSStyleSheet;
  private settings: UserHighlightSettings = {
    patterns: {},
    groups: {},
    enabled: true,
    caseSensitive: false,
  };

  static getInstance(): UserHighlightManager {
    if (!UserHighlightManager.instance) {
      UserHighlightManager.instance = new UserHighlightManager();
    }
    return UserHighlightManager.instance;
  }

  private constructor() {
    this.initializeStyleSheet();
    this.loadSettings();
  }

  /**
   * Initialize the dynamic stylesheet for highlight groups
   */
  private initializeStyleSheet() {
    try {
      if (document.adoptedStyleSheets && "CSSStyleSheet" in window) {
        this.styleSheet = new CSSStyleSheet();
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, this.styleSheet];
      } else {
        // Fallback for older browsers
        const style = document.createElement("style");
        style.id = "user-highlights";
        document.head.appendChild(style);
      }
    } catch (error) {
      console.warn("Failed to initialize highlight stylesheet:", error);
    }
  }

  /**
   * Load highlight settings from storage
   */
  async loadSettings() {
    try {
      const savedSettings = await this._getSettings();
      if (savedSettings) {
        this.settings = { ...this.settings, ...savedSettings };
        this.updatePatterns(this.settings.patterns);
        this.updateGroups(this.settings.groups);
      }
    } catch (e) {
      console.warn("Failed to load highlight settings:", e);
    }
  }

  /**
   * Get settings from storage
   */
  private async _getSettings(): Promise<UserHighlightSettings | null> {
    try {
      if (typeof window !== "undefined" && window.Settings) {
        return await window.Settings.get<UserHighlightSettings>("hilites");
      }
    } catch (e) {
      console.warn("Settings API not available:", e);
    }
    return null;
  }

  /**
   * Save settings to storage
   */
  private async _saveSettings(): Promise<void> {
    try {
      if (typeof window !== "undefined" && window.Settings) {
        await window.Settings.set("hilites", this.settings);
      }
    } catch (e) {
      console.warn("Failed to save highlight settings:", e);
    }
  }

  /**
   * Update highlight patterns
   */
  updatePatterns(patterns: Record<string, string>) {
    this.patterns.clear();
    this.settings.patterns = patterns;

    Object.entries(patterns).forEach(([pattern, className]) => {
      try {
        const regex = this.parsePattern(pattern);
        this.patterns.set(regex, className);
      } catch (e) {
        console.warn(`Invalid highlight pattern: ${pattern}`, e);
      }
    });

    // Notify all components to update their highlighting
    this.notifyComponentsUpdate();
  }

  /**
   * Update highlight group styles
   */
  updateGroups(groups: Record<string, Record<string, string>>) {
    this.groups.clear();
    this.settings.groups = groups;

    Object.entries(groups).forEach(([className, styles]) => {
      this.groups.set(className, styles);
    });

    this.rebuildStyleSheet();
  }

  /**
   * Parse highlight pattern (supports regex format /pattern/flags)
   */
  private parsePattern(pattern: string): RegExp {
    if (pattern.startsWith("/") && pattern.lastIndexOf("/") > 0) {
      const lastSlash = pattern.lastIndexOf("/");
      const regex = pattern.slice(1, lastSlash);
      const flags = pattern.slice(lastSlash + 1) || (this.settings.caseSensitive ? "g" : "gi");
      return new RegExp(regex, flags);
    } else {
      const flags = this.settings.caseSensitive ? "g" : "gi";
      return new RegExp(pattern, flags);
    }
  }

  /**
   * Rebuild the dynamic stylesheet with current group styles
   */
  private rebuildStyleSheet() {
    const rules: Array<string> = [];

    this.groups.forEach((styles, className) => {
      const cssProps = Object.entries(styles)
        .map(([prop, value]) => `${this.kebabCase(prop)}: ${value}`)
        .join("; ");

      if (cssProps) {
        rules.push(`.${className} { ${cssProps} }`);
        // Also add selector for highlighted attribute
        rules.push(`[highlighted].${className} { ${cssProps} }`);
      }
    });

    const cssText = rules.join("\n");

    try {
      if (this.styleSheet?.replaceSync) {
        this.styleSheet.replaceSync(cssText);
      } else {
        // Fallback method
        const styleEl = document.getElementById("user-highlights") as HTMLStyleElement;
        if (styleEl) {
          styleEl.textContent = cssText;
        }
      }
    } catch (error) {
      console.warn("Failed to update highlight styles:", error);
    }
  }

  /**
   * Convert camelCase to kebab-case for CSS properties
   */
  private kebabCase(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
  }

  /**
   * Get compiled patterns for components to use
   */
  getPatterns(): Array<{ regex: RegExp; className: string; priority: number }> {
    if (!this.settings.enabled) {
      return [];
    }

    return Array.from(this.patterns.entries()).map(([regex, className], index) => ({
      regex,
      className,
      priority: index,
    }));
  }

  /**
   * Add a new pattern
   */
  async addPattern(group: string, pattern: string): Promise<void> {
    this.settings.patterns[pattern] = group;
    await this._saveSettings();
    this.updatePatterns(this.settings.patterns);
  }

  /**
   * Add or update a highlight group
   */
  async addGroup(group: string, styles: Record<string, string>): Promise<void> {
    this.settings.groups[group] = styles;
    await this._saveSettings();
    this.updateGroups(this.settings.groups);
  }

  /**
   * Remove a pattern
   */
  async removePattern(pattern: string): Promise<void> {
    delete this.settings.patterns[pattern];
    await this._saveSettings();
    this.updatePatterns(this.settings.patterns);
  }

  /**
   * Remove a group and its associated patterns
   */
  async removeGroup(group: string): Promise<void> {
    // Remove group styles
    delete this.settings.groups[group];

    // Remove patterns that use this group
    Object.keys(this.settings.patterns).forEach((pattern) => {
      if (this.settings.patterns[pattern] === group) {
        delete this.settings.patterns[pattern];
      }
    });

    await this._saveSettings();
    this.updatePatterns(this.settings.patterns);
    this.updateGroups(this.settings.groups);
  }

  /**
   * Get all highlight groups
   */
  getGroups(): Array<HighlightGroup> {
    const groups: Array<HighlightGroup> = [];

    this.groups.forEach((styles, className) => {
      const patterns = Object.keys(this.settings.patterns).filter((pattern) => this.settings.patterns[pattern] === className);

      groups.push({
        name: className,
        className,
        styles,
        patterns,
      });
    });

    return groups;
  }

  /**
   * Get current settings
   */
  getSettings(): UserHighlightSettings {
    return { ...this.settings };
  }

  /**
   * Update settings
   */
  async updateSettings(newSettings: Partial<UserHighlightSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    await this._saveSettings();

    if (newSettings.patterns) {
      this.updatePatterns(newSettings.patterns);
    }
    if (newSettings.groups) {
      this.updateGroups(newSettings.groups);
    }
  }

  /**
   * Enable or disable highlighting
   */
  async setEnabled(enabled: boolean): Promise<void> {
    this.settings.enabled = enabled;
    await this._saveSettings();
    this.notifyComponentsUpdate();
  }

  /**
   * Set case sensitivity
   */
  async setCaseSensitive(caseSensitive: boolean): Promise<void> {
    this.settings.caseSensitive = caseSensitive;
    await this._saveSettings();
    // Recompile patterns with new case sensitivity
    this.updatePatterns(this.settings.patterns);
  }

  /**
   * Test a pattern against text
   */
  testPattern(pattern: string, text: string): Array<RegExpMatchArray> {
    try {
      const regex = this.parsePattern(pattern);
      const matches: Array<RegExpMatchArray> = [];
      let match;

      while ((match = regex.exec(text)) !== null) {
        matches.push(match);
        if (!regex.global) break;
      }

      return matches;
    } catch (error) {
      console.warn("Invalid test pattern:", pattern, error);
      return [];
    }
  }

  /**
   * Import patterns from legacy format
   */
  async importLegacyPatterns(legacyPatterns: Record<string, any>): Promise<void> {
    const newPatterns: Record<string, string> = {};
    const newGroups: Record<string, Record<string, string>> = {};

    // Convert legacy format to new format
    Object.entries(legacyPatterns).forEach(([group, data]) => {
      if (typeof data === "object" && data.patterns && data.styles) {
        // New format already
        data.patterns.forEach((pattern: string) => {
          newPatterns[pattern] = group;
        });
        newGroups[group] = data.styles;
      } else if (Array.isArray(data)) {
        // Legacy format: array of patterns
        data.forEach((pattern) => {
          newPatterns[pattern] = group;
        });
        // Use default styling
        newGroups[group] = {
          backgroundColor: "#ffff00",
          color: "#000000",
        };
      }
    });

    this.settings.patterns = { ...this.settings.patterns, ...newPatterns };
    this.settings.groups = { ...this.settings.groups, ...newGroups };

    await this._saveSettings();
    this.updatePatterns(this.settings.patterns);
    this.updateGroups(this.settings.groups);
  }

  /**
   * Export patterns for backup/sharing
   */
  exportPatterns(): UserHighlightSettings {
    return { ...this.settings };
  }

  /**
   * Clear all patterns and groups
   */
  async clearAll(): Promise<void> {
    this.settings.patterns = {};
    this.settings.groups = {};
    await this._saveSettings();
    this.updatePatterns(this.settings.patterns);
    this.updateGroups(this.settings.groups);
  }

  /**
   * Get statistics about loaded patterns
   */
  getStats(): {
    totalPatterns: number;
    totalGroups: number;
    enabled: boolean;
    caseSensitive: boolean;
  } {
    return {
      totalPatterns: Object.keys(this.settings.patterns).length,
      totalGroups: Object.keys(this.settings.groups).length,
      enabled: this.settings.enabled,
      caseSensitive: this.settings.caseSensitive,
    };
  }

  /**
   * Notify all game element components to update their highlighting
   */
  private notifyComponentsUpdate() {
    document.dispatchEvent(
      new CustomEvent("illthorn:highlights-updated", {
        detail: { patterns: this.getPatterns(), settings: this.settings },
      }),
    );
  }
}

// Initialize the singleton on module load
const highlightManager = UserHighlightManager.getInstance();

// Export convenience functions
export const getHighlightManager = () => highlightManager;

// Auto-initialize patterns when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => highlightManager.loadSettings());
} else {
  // DOM already loaded
  highlightManager.loadSettings();
}
