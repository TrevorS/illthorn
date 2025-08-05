# Game Text Highlighting Restoration Plan

## Problem Analysis

In commit `6183089` ("refactor: remove all theme styling and implement semantic color system"), the entire theme system was deleted, removing **1,600+ lines** of sophisticated game text highlighting. This eliminated automatic highlighting for hundreds of game items that players previously relied on for quick visual identification.

### What Was Lost

1. **Automatic Item Highlighting** (using SASS loops):
   - **100+ weapons** - `@each $weapon in $weapons { a[noun="#{$weapon}"] { color: red-ish; } }`
   - **23+ herbals** - `@each $herbal in $herbals { a[noun="#{$herbal}"] { color: green-ish; } }`
   - **16+ magic items** - `@each $magic in $magics { a[noun="#{$magic}"] { color: purple-ish; } }`
   - **80+ gems** - Theme-specific gem coloring
   - **Forageables, foods, boxes** - Additional item categories

2. **Enhanced Game Text Styling**:
   - Rich speech bubbles with gradients and backgrounds
   - Styled room descriptions with better typography
   - Monster highlighting with themed colors
   - Directional and action text improvements

3. **Context-Aware Highlighting**:
   - Items colored based on their game significance
   - Thematic color coordination (icemule theme used nordic colors)
   - Visual hierarchy for different content types

### What Still Works ✅

- **XML Parser**: SaxophoneParser correctly processes all game data
- **Basic highlighting**: Speech, whisper, monster colors via CSS custom properties
- **Infrastructure**: Complete `src/frontend/hilites/` system with Mark.js
- **Item data**: All SASS variables ($weapons, $herbals, etc.) preserved in `_vars.scss`
- **Manual highlighting**: User pattern-based highlighting fully functional
- **Semantic colors**: New CSS custom property system works well

## Solution: Modern Automatic Item Highlighting

### Architecture Overview

Instead of recreating themes, we'll build a **theme-agnostic automatic highlighting system** that:
1. Uses existing SASS variables to generate item selectors
2. Integrates with the current semantic color system
3. Works within Lit component Shadow DOM
4. Remains compatible with manual highlighting
5. Is configurable through user settings

### Implementation Strategy

#### Phase 1: SCSS Generation System

**File**: `src/frontend/styles/_item-highlights.scss`

```scss
// Import existing item lists
@import "vars";

// Semantic item colors using CSS custom properties
:root {
  --color-item-weapon: #ff6b6b;      // Red-ish for weapons
  --color-item-herbal: #51cf66;      // Green-ish for herbs/potions  
  --color-item-magic: #9775fa;       // Purple-ish for magic items
  --color-item-gem: #ffd43b;         // Gold-ish for gems
  --color-item-forgeable: #74c0fc;   // Blue-ish for foraged items
  --color-item-food: #ffa94d;        // Orange-ish for food
  --color-item-container: #868e96;   // Gray-ish for boxes/chests
}

// Generate weapon highlighting automatically
@each $weapon in $weapons {
  a[noun="#{$weapon}"] {
    color: var(--color-item-weapon) !important;
    font-weight: 500;
  }
}

// Generate herbal highlighting automatically  
@each $herbal in $herbals {
  a[noun="#{$herbal}"] {
    color: var(--color-item-herbal) !important;
    font-weight: 500;
  }
}

// Continue for all item categories...
```

#### Phase 2: Feed Component Integration

**File**: `src/frontend/components/session/feed/feed.lit.ts`

Add the new highlighting styles to the Feed component's CSS:

```typescript
static styles = css`
  // ... existing styles ...
  
  // Import automatic item highlighting
  ${unsafeCSS(itemHighlightingCSS)}
  
  // Enhanced game text styling
  .content pre.speech {
    color: var(--color-speech);
    font-weight: bold;
    display: inline-block;
    padding: 4px 8px;
    margin: 4px 0;
    background: var(--color-surface);
    border-left: 3px solid var(--color-speech);
  }
  
  .content pre.whisper {
    color: var(--color-whisper);
    font-weight: bold;
    display: block;
    padding: 4px 8px;
    margin: 4px 0;
    background: var(--color-background-secondary);
    border-left: 3px solid var(--color-whisper);
  }
  
  .content pre.roomName {
    color: var(--color-room-name);
    font-weight: bold;
    font-size: 1.1em;
    margin-bottom: 0.5em;
  }
`;
```

#### Phase 3: Settings Integration

**File**: `src/frontend/settings/highlighting.ts`

```typescript
export interface HighlightingSettings {
  automaticItems: boolean;          // Enable/disable automatic item highlighting
  enhancedGameText: boolean;        // Enable/disable enhanced styling
  itemCategories: {                 // Per-category toggles
    weapons: boolean;
    herbals: boolean;
    magic: boolean;
    gems: boolean;
    forageables: boolean;
    foods: boolean;
    containers: boolean;
  };
  customColors: {                   // User color overrides
    weapons?: string;
    herbals?: string;
    // etc...
  };
}
```

#### Phase 4: Enhanced Game Text

Restore sophisticated game text presentation:

1. **Speech Styling**: Bubble-like appearance with backgrounds
2. **Room Descriptions**: Better typography and spacing  
3. **Monster Highlighting**: Enhanced visibility
4. **Action Text**: Improved readability for game events

#### Phase 5: Compatibility & Testing

1. **Manual Highlighting**: Ensure user patterns override automatic highlighting
2. **Performance**: Verify no impact on text rendering performance
3. **Accessibility**: Maintain good contrast ratios
4. **Theme Support**: Prepare foundation for future theme system

## Technical Details

### CSS Specificity Strategy

```css
/* Automatic highlighting (lower specificity) */
a[noun="sword"] { color: var(--color-item-weapon); }

/* Manual highlighting (higher specificity) */
.user-pattern-class { color: var(--user-color) !important; }
```

### Shadow DOM Integration

Since Feed uses Shadow DOM, styles must be included in the component:

```typescript
// Option 1: Import generated CSS
import itemHighlightCSS from '../../../styles/_item-highlights.scss?inline';

// Option 2: Generate CSS strings in TypeScript
const weaponStyles = WEAPONS.map(weapon => 
  `a[noun="${weapon}"] { color: var(--color-item-weapon); }`
).join('\n');
```

### Performance Considerations

- **Build-time generation**: SCSS compilation handles loops
- **CSS bundling**: No runtime performance impact
- **Selective loading**: Only include enabled categories
- **Caching**: Leverage existing browser CSS caching

## Migration Strategy

### Step 1: Create Foundation
1. Create `_item-highlights.scss` with basic weapon highlighting
2. Add to Feed component styles
3. Test with a few weapon examples

### Step 2: Expand Coverage  
1. Add all item categories (herbals, magic, gems, etc.)
2. Implement enhanced game text styling
3. Add settings integration

### Step 3: Polish & Configure
1. Add user configuration options
2. Test compatibility with existing manual highlighting
3. Performance testing and optimization

### Step 4: Documentation & Deployment
1. Update CLAUDE.md with new highlighting system
2. Create user documentation for configuration
3. Migration guide for users with custom highlighting

## Expected Outcomes

### Immediate Benefits
- **200+ items** automatically highlighted again
- **Enhanced readability** of game text
- **Visual hierarchy** restored for different content types
- **Theme-agnostic** system that works with any color scheme

### Long-term Benefits  
- **Maintainable architecture** without theme coupling
- **User configurability** for personal preferences
- **Extensible system** for future item categories
- **Performance optimized** with build-time generation

### User Experience
- **Familiar highlighting** patterns restored
- **Improved game navigation** through visual cues
- **Customizable appearance** through settings
- **Backwards compatible** with existing manual patterns

## Risk Mitigation

1. **Gradual rollout**: Start with weapons only, expand incrementally
2. **Fallback support**: Manual highlighting continues to work  
3. **Performance monitoring**: Watch for any rendering impacts
4. **User feedback**: Easy to disable/configure if issues arise

This plan restores the lost highlighting functionality while building a more maintainable, user-configurable system that integrates well with the current Lit-based architecture.