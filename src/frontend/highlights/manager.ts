// ABOUTME: Clean highlight manager using TOML-based config system
// ABOUTME: Replaces UserHighlightManager with proper Config API integration

import type { HighlightConfig, HighlightPattern } from "../../shared/types/config.types";
import { IllthornEvent } from "../events";

export interface CompiledPattern {
  regex: RegExp;
  className: string;
  priority: number;
  color?: string;
  background?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

/**
 * Manager for user-defined highlight patterns using TOML config
 */
export class HighlightManager {
  private patterns: Array<CompiledPattern> = [];
  private styleSheet?: CSSStyleSheet;
  private config: HighlightConfig | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeStyleSheet();
  }

  /**
   * Initialize the dynamic stylesheet for highlight patterns
   */
  private initializeStyleSheet() {
    try {
      if (document.adoptedStyleSheets && "CSSStyleSheet" in window) {
        this.styleSheet = new CSSStyleSheet();
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, this.styleSheet];
      } else {
        // Fallback for older browsers
        const style = document.createElement("style");
        style.id = "highlight-manager-styles";
        document.head.appendChild(style);
      }
    } catch (error) {
      console.warn("Failed to initialize highlight stylesheet:", error);
    }
  }

  /**
   * Initialize manager by loading config from TOML
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.config = await window.Config.loadHighlights();
      this.compilePatterns();
      this.rebuildStyleSheet();
      this.notifyComponentsUpdate();
      this.isInitialized = true;
      console.debug("HighlightManager initialized with", this.patterns.length, "patterns");
    } catch (error) {
      console.warn("Failed to initialize HighlightManager:", error);
      // Continue with empty patterns - app should still work
      this.config = {
        settings: { enabled: true, case_sensitive: false },
        patterns: [],
      };
      this.isInitialized = true;
    }
  }

  /**
   * Reload patterns from TOML config
   */
  async reload(): Promise<void> {
    try {
      this.config = await window.Config.loadHighlights();
      this.compilePatterns();
      this.rebuildStyleSheet();
      this.notifyComponentsUpdate();
      console.debug("HighlightManager reloaded with", this.patterns.length, "patterns");
    } catch (error) {
      console.warn("Failed to reload highlights:", error);
      throw error;
    }
  }

  /**
   * Compile regex patterns from TOML config with error handling
   */
  private compilePatterns() {
    this.patterns = [];

    if (!this.config?.settings.enabled) {
      return;
    }

    const errors: Array<string> = [];

    this.config.patterns.forEach((pattern: HighlightPattern, index: number) => {
      try {
        // Validate pattern config
        if (!pattern.name || !pattern.pattern) {
          errors.push(`Pattern at index ${index}: Missing required 'name' or 'pattern' field`);
          return;
        }

        // Test regex compilation
        const flags = this.config?.settings.case_sensitive ? "g" : "gi";
        const regex = new RegExp(pattern.pattern, flags);

        // Test the regex with a simple string to catch runtime errors
        try {
          regex.test("test");
        } catch (runtimeError) {
          errors.push(`Pattern "${pattern.name}": Regex runtime error - ${runtimeError instanceof Error ? runtimeError.message : String(runtimeError)}`);
          return;
        }

        this.patterns.push({
          regex,
          className: `highlight-${this.sanitizeClassName(pattern.name)}`,
          priority: index,
          color: pattern.color,
          background: pattern.background,
          bold: pattern.bold,
          italic: pattern.italic,
          underline: pattern.underline,
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push(`Pattern "${pattern.name}": ${errorMsg}`);
      }
    });

    // Report errors to user if any occurred
    if (errors.length > 0) {
      console.warn(`Highlight pattern compilation errors:\n${errors.join("\n")}`);

      // Show errors in the UI
      if (typeof window !== "undefined" && window.Illthorn?.bus) {
        window.Illthorn.bus.dispatchEvent(IllthornEvent.CLIENT_MESSAGE, {
          message: `⚠️ Highlight errors (${errors.length}):\n${errors.slice(0, 3).join("\n")}${errors.length > 3 ? `\n... and ${errors.length - 3} more` : ""}`,
          timestamp: Date.now(),
        });
      }
    }

    console.debug(`Compiled ${this.patterns.length} highlight patterns (${errors.length} errors)`);
  }

  /**
   * Sanitize class name for CSS
   */
  private sanitizeClassName(name: string): string {
    return name.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase();
  }

  /**
   * Rebuild the dynamic stylesheet with current pattern styles
   */
  private rebuildStyleSheet() {
    const rules: Array<string> = [];

    this.patterns.forEach((pattern) => {
      const styles: Array<string> = [];

      if (pattern.color) {
        styles.push(`color: ${pattern.color}`);
      }
      if (pattern.background) {
        styles.push(`background-color: ${pattern.background}`);
      }
      if (pattern.bold) {
        styles.push("font-weight: bold");
      }
      if (pattern.italic) {
        styles.push("font-style: italic");
      }
      if (pattern.underline) {
        styles.push("text-decoration: underline");
      }

      if (styles.length > 0) {
        const cssProps = styles.join("; ");
        rules.push(`.${pattern.className} { ${cssProps} }`);
        // Also add selector for highlighted attribute
        rules.push(`[highlighted].${pattern.className} { ${cssProps} }`);
      }
    });

    const cssText = rules.join("\n");

    try {
      if (this.styleSheet?.replaceSync) {
        this.styleSheet.replaceSync(cssText);
      } else {
        // Fallback method
        const styleEl = document.getElementById("highlight-manager-styles") as HTMLStyleElement;
        if (styleEl) {
          styleEl.textContent = cssText;
        }
      }
    } catch (error) {
      console.warn("Failed to update highlight styles:", error);
    }
  }

  /**
   * Get compiled patterns for components to use
   */
  getPatterns(): Array<{ regex: RegExp; className: string; priority: number }> {
    if (!this.config?.settings.enabled) {
      return [];
    }

    return this.patterns.map((pattern) => ({
      regex: pattern.regex,
      className: pattern.className,
      priority: pattern.priority,
    }));
  }

  /**
   * Validate config before saving to prevent overwriting user data with defaults
   */
  private isValidConfigForSave(config: HighlightConfig): boolean {
    // Don't save if it's just the default example pattern
    if (config.patterns.length === 1) {
      const pattern = config.patterns[0];
      if (pattern.name === "example" && pattern.pattern === "\\\\bexample\\\\b") {
        return false;
      }
    }

    // Don't save empty configs unless explicitly allowed
    if (config.patterns.length === 0 && !this.isInitialized) {
      return false;
    }

    return true;
  }

  /**
   * Add a new pattern to config and save
   */
  async addPattern(name: string, pattern: string, styles: Partial<HighlightPattern> = {}): Promise<void> {
    if (!this.config) {
      await this.initialize();
    }

    const newPattern: HighlightPattern = {
      name,
      pattern,
      color: styles.color || "#ff0000",
      bold: styles.bold || false,
      ...styles,
    };

    if (this.config) {
      this.config.patterns.push(newPattern);
      if (this.isValidConfigForSave(this.config)) {
        await window.Config.saveHighlights(this.config);
      }
    }
    await this.reload();
  }

  /**
   * Remove a pattern by name
   */
  async removePattern(name: string): Promise<void> {
    if (!this.config) {
      return;
    }

    this.config.patterns = this.config.patterns.filter((p) => p.name !== name);
    if (this.isValidConfigForSave(this.config)) {
      await window.Config.saveHighlights(this.config);
    }
    await this.reload();
  }

  /**
   * Update pattern properties
   */
  async updatePattern(name: string, updates: Partial<HighlightPattern>): Promise<void> {
    if (!this.config) {
      return;
    }

    const pattern = this.config.patterns.find((p) => p.name === name);
    if (pattern) {
      Object.assign(pattern, updates);
      if (this.isValidConfigForSave(this.config)) {
        await window.Config.saveHighlights(this.config);
      }
      await this.reload();
    }
  }

  /**
   * Enable or disable highlighting globally
   */
  async setEnabled(enabled: boolean): Promise<void> {
    if (!this.config) {
      await this.initialize();
    }

    if (this.config) {
      this.config.settings.enabled = enabled;
      // Only save if this is a user-initiated change with existing patterns
      // Don't save during initialization or with default configs
      if (this.isInitialized && this.config.patterns.length > 0 && this.isValidConfigForSave(this.config)) {
        await window.Config.saveHighlights(this.config);
      }
    }
    this.compilePatterns();
    this.notifyComponentsUpdate();
  }

  /**
   * Set case sensitivity
   */
  async setCaseSensitive(caseSensitive: boolean): Promise<void> {
    if (!this.config) {
      await this.initialize();
    }

    if (this.config) {
      this.config.settings.case_sensitive = caseSensitive;
      // Only save if this is a user-initiated change with existing patterns
      // Don't save during initialization or with default configs
      if (this.isInitialized && this.config.patterns.length > 0 && this.isValidConfigForSave(this.config)) {
        await window.Config.saveHighlights(this.config);
      }
    }
    await this.reload();
  }

  /**
   * Test a pattern against text
   */
  testPattern(pattern: string, text: string): Array<RegExpMatchArray> {
    try {
      // Default to case insensitive if no config is loaded
      const caseSensitive = this.config?.settings.case_sensitive ?? false;
      const flags = caseSensitive ? "g" : "gi";

      console.debug(`Testing pattern: "${pattern}" against text: "${text}" with flags: "${flags}"`);

      const regex = new RegExp(pattern, flags);

      // Use matchAll for cleaner implementation
      const matches = Array.from(text.matchAll(regex));

      console.debug(`Pattern test result: ${matches.length} matches found`);

      return matches;
    } catch (error) {
      console.warn("Invalid test pattern:", pattern, error);
      return [];
    }
  }

  /**
   * Get current settings
   */
  getSettings() {
    return this.config?.settings || { enabled: false, case_sensitive: false };
  }

  /**
   * Get all patterns
   */
  getAllPatterns(): Array<HighlightPattern> {
    return this.config?.patterns || [];
  }

  /**
   * Get statistics about loaded patterns
   */
  getStats() {
    return {
      totalPatterns: this.patterns.length,
      enabled: this.config?.settings.enabled || false,
      caseSensitive: this.config?.settings.case_sensitive || false,
      configLoaded: this.config !== null,
    };
  }

  /**
   * Notify all components to update their highlighting
   */
  private notifyComponentsUpdate() {
    // Use the centralized event bus
    if (typeof window !== "undefined" && window.Illthorn?.bus) {
      window.Illthorn.bus.dispatchEvent(IllthornEvent.HIGHLIGHTS_RELOADED, {
        patterns: this.getPatterns(),
        settings: this.getSettings(),
      });
    }
  }

  /**
   * Apply highlights to an HTML element
   */
  applyHighlights(element: HTMLElement): void {
    if (!this.config?.settings.enabled || this.patterns.length === 0) {
      return;
    }

    // Find all text nodes in the element
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);

    const textNodes: Array<Text> = [];
    let node: Node | null;

    // Collect text nodes first to avoid live collection issues
    node = walker.nextNode();
    while (node) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent && node.textContent.trim()) {
        textNodes.push(node as Text);
      }
      node = walker.nextNode();
    }

    // Apply highlights to each text node
    textNodes.forEach((textNode) => {
      this.highlightTextNode(textNode);
    });
  }

  /**
   * Apply highlights to a specific text node
   */
  private highlightTextNode(textNode: Text): void {
    if (!textNode.textContent || !textNode.parentElement) {
      return;
    }

    const originalText = textNode.textContent;
    let resultHTML = originalText;
    let hasMatches = false;

    // Apply all patterns, with higher priority patterns overriding lower ones
    this.patterns
      .sort((a, b) => b.priority - a.priority)
      .forEach((pattern) => {
        const matches = originalText.matchAll(pattern.regex);
        for (const match of matches) {
          if (match[0]) {
            const highlightedText = `<span class="${pattern.className}">${match[0]}</span>`;
            resultHTML = resultHTML.replace(match[0], highlightedText);
            hasMatches = true;
          }
        }
      });

    // Replace the text node with highlighted content if there are matches
    if (hasMatches) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = resultHTML;

      // Replace the text node with the highlighted content
      const fragment = document.createDocumentFragment();
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild);
      }

      textNode.parentElement.replaceChild(fragment, textNode);
    }
  }

  /**
   * Open config file in editor
   */
  async openInEditor(): Promise<void> {
    await window.Config.openInEditor("highlights.toml");
  }
}

// Export singleton instance
export const highlightManager = new HighlightManager();
