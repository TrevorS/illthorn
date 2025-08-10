// ABOUTME: Reusable highlighting mixin for game element components
// ABOUTME: Provides pattern-based highlighting without DOM manipulation overhead

import type { LitElement } from "lit";
import { property, state } from "lit/decorators.js";
import type { Constructor } from "../../types/constructor";

export interface HighlightPattern {
  regex: RegExp;
  className: string;
  priority: number;
}

export interface HighlightSettings {
  patterns: Record<string, string>; // pattern -> className mapping
  groups: Record<string, Record<string, string>>; // className -> CSS properties
}

/**
 * Mixin to add highlighting capabilities to game element components
 */
export const HighlightingMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class HighlightingElement extends superClass {
    @property({ type: Array }) highlightPatterns: Array<HighlightPattern> = [];
    @state() protected _activeHighlight?: HighlightPattern;
    @state() protected _userPatternsLoaded = false;

    connectedCallback() {
      super.connectedCallback();
      this.loadUserHighlights();
      this._setupGlobalListeners();
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this._removeGlobalListeners();
    }

    updated(changedProperties: Map<string, any>) {
      super.updated(changedProperties);

      if (changedProperties.has("highlightPatterns") || changedProperties.has("textContent")) {
        this.updateHighlighting();
      }
    }

    /**
     * Load user-defined highlight patterns from settings
     */
    private async loadUserHighlights() {
      if (this._userPatternsLoaded) return;

      try {
        const settings = await this._getHighlightSettings();
        if (settings?.patterns) {
          const patterns: Array<HighlightPattern> = [];

          Object.entries(settings.patterns).forEach(([pattern, className], index) => {
            try {
              const regex = this._parsePattern(pattern);
              patterns.push({
                regex,
                className: className as string,
                priority: index,
              });
            } catch (e) {
              console.warn(`Invalid highlight regex: ${pattern}`, e);
            }
          });

          this.highlightPatterns = [...this.highlightPatterns, ...patterns];
          this._userPatternsLoaded = true;
        }
      } catch (e) {
        console.warn("Failed to load highlight patterns", e);
      }
    }

    /**
     * Parse highlight pattern (supports regex format /pattern/flags)
     */
    private _parsePattern(pattern: string): RegExp {
      if (pattern.startsWith("/") && pattern.lastIndexOf("/") > 0) {
        const lastSlash = pattern.lastIndexOf("/");
        const regex = pattern.slice(1, lastSlash);
        const flags = pattern.slice(lastSlash + 1) || "gi";
        return new RegExp(regex, flags);
      } else {
        return new RegExp(pattern, "gi");
      }
    }

    /**
     * Get highlight settings from storage
     */
    private async _getHighlightSettings(): Promise<HighlightSettings | null> {
      try {
        // Check if we have the Settings API available
        if (typeof window !== "undefined" && window.Settings) {
          return await window.Settings.get<HighlightSettings>("hilites");
        }
      } catch (e) {
        console.warn("Failed to access settings:", e);
      }
      return null;
    }

    /**
     * Update highlighting based on current patterns and content
     */
    private updateHighlighting() {
      const textContent = this.textContent || "";

      if (!textContent.trim()) {
        this._clearHighlight();
        return;
      }

      // Find the highest priority matching pattern
      let bestMatch: HighlightPattern | undefined;
      let highestPriority = -1;

      for (const pattern of this.highlightPatterns) {
        if (pattern.regex.test(textContent) && pattern.priority > highestPriority) {
          bestMatch = pattern;
          highestPriority = pattern.priority;
          // Reset regex lastIndex to prevent state issues
          pattern.regex.lastIndex = 0;
        }
      }

      this._applyHighlight(bestMatch);
    }

    /**
     * Apply highlight styling
     */
    private _applyHighlight(pattern?: HighlightPattern) {
      // Remove old highlight
      if (this._activeHighlight) {
        this.classList.remove(this._activeHighlight.className);
        this.removeAttribute("highlighted");
      }

      // Apply new highlight
      if (pattern) {
        this.classList.add(pattern.className);
        this.setAttribute("highlighted", "");
        this._activeHighlight = pattern;
      } else {
        this._activeHighlight = undefined;
      }
    }

    /**
     * Clear all highlighting
     */
    private _clearHighlight() {
      if (this._activeHighlight) {
        this.classList.remove(this._activeHighlight.className);
        this.removeAttribute("highlighted");
        this._activeHighlight = undefined;
      }
    }

    /**
     * Set up global event listeners for pattern updates
     */
    private _setupGlobalListeners() {
      document.addEventListener("illthorn:highlights-updated", this._handleHighlightsUpdated);
    }

    /**
     * Remove global event listeners
     */
    private _removeGlobalListeners() {
      document.removeEventListener("illthorn:highlights-updated", this._handleHighlightsUpdated);
    }

    /**
     * Handle global highlights update events
     */
    private _handleHighlightsUpdated = (event: CustomEvent) => {
      if (event.detail?.patterns) {
        this.highlightPatterns = [...event.detail.patterns];
        this.updateHighlighting();
      }
    };

    /**
     * Check if element is currently highlighted
     */
    protected get isHighlighted(): boolean {
      return this._activeHighlight !== undefined;
    }

    /**
     * Get the current highlight class name
     */
    protected get highlightClassName(): string {
      return this._activeHighlight?.className || "";
    }

    /**
     * Get the current highlight pattern
     */
    protected get activePattern(): HighlightPattern | undefined {
      return this._activeHighlight;
    }

    /**
     * Manually add a highlight pattern
     */
    addHighlightPattern(pattern: string | RegExp, className: string, priority = 0) {
      const regex = pattern instanceof RegExp ? pattern : this._parsePattern(pattern.toString());

      const highlightPattern: HighlightPattern = {
        regex,
        className,
        priority,
      };

      this.highlightPatterns = [...this.highlightPatterns, highlightPattern];
      this.updateHighlighting();
    }

    /**
     * Remove a highlight pattern
     */
    removeHighlightPattern(pattern: string | RegExp) {
      const patternString = pattern instanceof RegExp ? pattern.source : pattern;

      this.highlightPatterns = this.highlightPatterns.filter((p) => p.regex.source !== patternString);

      this.updateHighlighting();
    }

    /**
     * Clear all highlight patterns
     */
    clearHighlightPatterns() {
      this.highlightPatterns = [];
      this._clearHighlight();
    }

    /**
     * Force re-evaluation of highlighting
     */
    refreshHighlighting() {
      this.updateHighlighting();
    }

    /**
     * Get highlighting statistics
     */
    getHighlightStats() {
      return {
        totalPatterns: this.highlightPatterns.length,
        activePattern: this._activeHighlight?.className || null,
        isHighlighted: this.isHighlighted,
        textLength: this.textContent?.length || 0,
      };
    }

    /**
     * Test if text would match any patterns (without applying highlighting)
     */
    testHighlighting(text: string): { matches: Array<{ pattern: HighlightPattern; match: RegExpMatchArray }> } {
      const matches: Array<{ pattern: HighlightPattern; match: RegExpMatchArray }> = [];

      for (const pattern of this.highlightPatterns) {
        const match = text.match(pattern.regex);
        if (match) {
          matches.push({ pattern, match });
        }
      }

      return { matches };
    }
  }

  return HighlightingElement as Constructor<HighlightingElement> & T;
};

/**
 * Type helper for components that use the highlighting mixin
 */
export interface HighlightCapable {
  highlightPatterns: Array<HighlightPattern>;
  isHighlighted: boolean;
  highlightClassName: string;
  activePattern?: HighlightPattern;
  addHighlightPattern(pattern: string | RegExp, className: string, priority?: number): void;
  removeHighlightPattern(pattern: string | RegExp): void;
  clearHighlightPatterns(): void;
  refreshHighlighting(): void;
  getHighlightStats(): {
    totalPatterns: number;
    activePattern: string | null;
    isHighlighted: boolean;
    textLength: number;
  };
  testHighlighting(text: string): { matches: Array<{ pattern: HighlightPattern; match: RegExpMatchArray }> };
}
