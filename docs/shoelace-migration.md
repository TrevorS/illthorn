# Shoelace Migration Plan for Illthorn

## Executive Summary

This document outlines a strategic plan to integrate Shoelace Web Components into Illthorn's Lit-based frontend architecture. After comprehensive analysis of Illthorn's 16 modernized Lit components and Shoelace's capabilities, we recommend a **bottom-up integration approach** that preserves game-specific functionality while enhancing UI components where Shoelace provides clear value.

## Background & Context

### Current State (January 2025)
- ✅ **Lit Migration Complete**: All 16 components modernized with idiomatic Lit patterns
- ✅ **Modern Architecture**: Components use @customElement, @property, @state decorators
- ✅ **Theme System**: CSS custom properties with semantic color variables
- ✅ **Shadow DOM**: Proper encapsulation with Light DOM only where necessary
- ✅ **TypeScript**: Full type safety throughout component hierarchy

### Shoelace Overview
Shoelace is a framework-agnostic Web Components library with 50+ professionally designed components. Key benefits:
- **Framework Agnostic**: Works with any framework or vanilla JS
- **Modern Standards**: Built on Web Components, fully accessible
- **Customizable**: CSS custom properties for comprehensive theming
- **Future-Proof**: Web Awesome (Shoelace 3.0) in development with enhanced SSR support
- **Performance**: Lightweight, standards-based implementation

## Strategic Approach: Comprehensive Shoelace Integration

### Why Maximize Shoelace Usage?
1. **Consistency**: Unified design language across the entire application
2. **Accessibility**: Professional-grade accessibility implementation out of the box
3. **Maintenance**: Reduce custom CSS and component maintenance burden
4. **Future-Proof**: Leverage a well-maintained, evolving component system
5. **Polish**: Professional animations, interactions, and visual feedback

### Integration Philosophy
- **Shoelace-First**: Use Shoelace components wherever possible, even minimally
- **Creative Integration**: Find innovative ways to use components beyond obvious mappings
- **Wrap, Don't Replace**: Preserve game logic while gaining Shoelace benefits
- **Layered Enhancement**: Stack multiple Shoelace components for complex UIs
- **Progressive Enhancement**: Start basic, enhance with additional Shoelace features over time

## Component Analysis & Classification

### Tier 1: High-Value Migrations (Perfect Matches)

#### 1. VitalStat → sl-progress-bar
**Current**: `components/session/vitals/components.lit.ts` - VitalStat component
**Shoelace Target**: `sl-progress-bar`

**Benefits**:
- Enhanced accessibility with screen reader support
- Consistent progress bar styling across the app
- Better animation and visual feedback
- Reduced custom CSS for progress visualization

**Implementation**:
```typescript
// Before (custom progress meter)
<div class="vital-meter" style="width: ${percent}%"></div>

// After (Shoelace enhanced)
<sl-progress-bar 
  value=${this.percent} 
  class=${this._thresholdCategory}
  label="${this.label}: ${this.value}">
</sl-progress-bar>
```

**Preservation**:
- Keep existing threshold logic (low/medium/high)
- Preserve color theming with CSS custom properties
- Maintain all reactive properties and event handling

#### 2. Panel → sl-details
**Current**: `components/session/panel.lit.ts` - Basic details/summary wrapper
**Shoelace Target**: `sl-details`

**Benefits**:
- Better expand/collapse animations
- Customizable expand/collapse icons
- Enhanced keyboard navigation
- Additional event hooks (sl-show, sl-after-show)

**Implementation**:
```typescript
// Enhanced with Shoelace
<sl-details ?open=${this.open} summary=${this.title}>
  <slot></slot>
</sl-details>
```

**Preservation**:
- Keep existing `title` and `open` properties
- Maintain slot-based content distribution
- Preserve all styling and theme integration

#### 3. SessionButton → sl-button (Enhanced)
**Current**: `components/session/session-button.lit.ts` - Complex session switcher
**Shoelace Target**: `sl-button` wrapper

**Benefits**:
- Improved hover states and focus management
- Better accessibility with built-in ARIA support
- Consistent button styling across variants
- Enhanced keyboard navigation

**Implementation**:
```typescript
<sl-button 
  variant=${this.active ? 'primary' : 'default'}
  size="large"
  @click=${this._handleClick}
  class="session-button">
  <span class="session-initial">${this._sessionInitial}</span>
  <span class="session-number" slot="suffix">${this._tabNumber}</span>
</sl-button>
```

**Preservation**:
- Keep all session logic (focus management, event bus integration)
- Preserve tab numbering and parent observation
- Maintain existing visual design with custom styling

### Tier 2: Strategic Enhancements

#### 4. CLI Input → sl-input
**Current**: `components/session/cli.lit.ts` - Native input element
**Shoelace Target**: `sl-input`

**Benefits**:
- Enhanced accessibility and validation
- Better focus management and styling
- Consistent input styling across the app
- Built-in clear button and help text support

**Preservation**:
- Keep all keyboard event handling (history navigation, command routing)
- Preserve timer bar functionality
- Maintain command autocomplete integration

#### 5. Effects → sl-card Integration
**Current**: `components/session/effects/effects-container.lit.ts` - Custom effect containers
**Shoelace Target**: `sl-card` wrappers

**Benefits**:
- Consistent card styling and spacing
- Better visual hierarchy
- Enhanced shadow and border management
- Optional header/footer slots

**Preservation**:
- Keep all game-specific effect logic
- Preserve spell duration tracking
- Maintain effect removal and interaction

#### 6. Sessions Menu → sl-menu/sl-dropdown
**Current**: `components/sessions-menu.lit.ts` - Custom menu implementation
**Shoelace Target**: `sl-dropdown` with `sl-menu`

**Benefits**:
- Better keyboard navigation (arrow keys, home/end)
- Enhanced accessibility with role management
- Consistent menu styling and behavior
- Support for menu dividers and groups

**Preservation**:
- Keep session switching logic
- Preserve session creation and management
- Maintain existing keyboard shortcuts

#### 7. Compass → sl-button-group
**Current**: `components/session/compass.lit.ts` - Individual direction buttons
**Shoelace Target**: `sl-button-group` container

**Benefits**:
- Visual grouping of related buttons
- Better keyboard navigation between directions
- Consistent button spacing and alignment
- Support for single/multiple selection modes

**Preservation**:
- Keep all game direction logic
- Preserve active state management
- Maintain directional movement commands

### Tier 3: Creative Shoelace Integration (Game-Specific Enhanced)

#### Even Game-Specific Components Can Benefit

#### 8. Feed → sl-card + sl-badge + sl-tooltip Enhancement
**Current**: `feed.lit.ts` - Specialized text display with memory management
**Shoelace Integration**: Wrap message blocks in `sl-card`, use `sl-badge` for timestamps, `sl-tooltip` for hover details

**Benefits**:
- Better visual separation of message blocks
- Professional timestamp and metadata display
- Enhanced hover interactions for clickable elements
- Consistent spacing and visual hierarchy

**Implementation**:
```typescript
// Wrap individual message groups in cards
<sl-card class="message-group">
  <sl-badge slot="header" variant="neutral" size="small">${timestamp}</sl-badge>
  <div class="message-content">${unsafeHTML(content)}</div>
  <sl-tooltip content="Click to copy" slot="footer">
    <sl-icon-button name="copy" size="small"></sl-icon-button>
  </sl-tooltip>
</sl-card>
```

#### 9. Room → sl-card + sl-divider + sl-icon Enhancement
**Current**: `room.lit.ts` - Game-specific room information display
**Shoelace Integration**: Structure with `sl-card`, separate sections with `sl-divider`, add `sl-icon` for visual elements

**Benefits**:
- Professional card-based layout
- Clear visual separation of room data sections
- Icons for exits, items, players
- Consistent spacing and typography

#### 10. Hand/Hands → sl-card + sl-badge + sl-dropdown Enhancement
**Current**: `hand.lit.ts, hands.lit.ts` - Inventory management
**Shoelace Integration**: Item cards with `sl-card`, quantity badges with `sl-badge`, actions with `sl-dropdown`

**Benefits**:
- Professional inventory item display
- Consistent badge styling for quantities/enchantments
- Dropdown menus for item actions (examine, get, drop)
- Better visual hierarchy for inventory management

#### 11. Streams → sl-alert + sl-icon + sl-badge Enhancement
**Current**: `streams.lit.ts` - Game-specific message streams
**Shoelace Integration**: Message types as `sl-alert` variants, icons for stream types, badges for counts

**Benefits**:
- Semantic styling for different message types (death=danger, thoughts=info)
- Professional alert styling and animations
- Icon identification for stream types
- Badge counters for new message counts

#### 12. Prompt → sl-input + sl-icon Enhancement
**Current**: `prompt.lit.ts` - Simple command prompt display
**Shoelace Integration**: Enhanced with `sl-input` for consistency, `sl-icon` for status indicators

**Benefits**:
- Consistent input styling with CLI
- Status icons (connected, waiting, error states)
- Better accessibility and focus management

#### 13. Context → sl-card + sl-divider + sl-badge Enhancement
**Current**: `context.lit.ts` - Game context display
**Shoelace Integration**: Structured context with cards, dividers, and status badges

**Benefits**:
- Professional context information layout
- Status badges for different context states
- Clear visual separation of context sections

### Tier 4: Layout Enhancement with Shoelace

#### 14. App Root → sl-split-panel + sl-drawer Enhancement
**Current**: `app.lit.ts` - Root application layout
**Shoelace Integration**: Main layout with `sl-split-panel`, side panels with `sl-drawer`

**Benefits**:
- Professional responsive layout management
- Smooth panel resizing and animations
- Better mobile/desktop adaptation
- Consistent drawer behavior

#### 15. Session Layout → sl-tab-group + sl-split-panel Enhancement
**Current**: `session-layout.lit.ts` - Main session layout
**Shoelace Integration**: Session tabs with `sl-tab-group`, panels with `sl-split-panel`

**Benefits**:
- Professional tab interface for multiple sessions
- Smooth tab switching animations
- Better keyboard navigation
- Consistent panel management

### Tier 5: Utility Component Integration

#### Additional Shoelace Components to Integrate

#### 16. Global Notifications → sl-alert + sl-icon
**New Feature**: System-wide notifications for connections, errors, achievements
**Implementation**: Toast-style alerts with appropriate variants and icons

#### 17. Loading States → sl-spinner + sl-skeleton
**Enhancement**: Professional loading indicators throughout the app
**Usage**: Connection states, data loading, command processing

#### 18. Tooltips → sl-tooltip
**Enhancement**: Comprehensive tooltip system for UI elements
**Usage**: Button explanations, stat tooltips, help text

#### 19. Icons → sl-icon
**Enhancement**: Consistent icon system throughout the app
**Usage**: Replace custom icons with Shoelace's Lucide icon set

#### 20. Badges → sl-badge
**Enhancement**: Status indicators, counts, and labels
**Usage**: Notification counts, status indicators, version badges

#### 21. Dividers → sl-divider
**Enhancement**: Consistent visual separation throughout the app
**Usage**: Section separators, content dividers, layout organization

#### 22. Copy Buttons → sl-copy-button
**New Feature**: Easy copying of commands, text, or session data
**Usage**: Copy command output, share session info, export data

#### 23. QR Codes → sl-qr-code
**New Feature**: QR codes for session sharing or mobile companion features
**Usage**: Share session connections, export settings

#### 24. Color Picker → sl-color-picker
**New Feature**: Theme customization and highlight color selection
**Usage**: Custom theme creation, highlight group colors

#### 25. Format Components → sl-format-date, sl-format-number, sl-format-bytes
**Enhancement**: Consistent formatting throughout the app  
**Usage**: Timestamp formatting, file sizes, numeric displays

## Implementation Timeline (Expanded for Comprehensive Integration)

### Phase 1: Foundation & Infrastructure (Week 1)

#### Dependencies Installation
```bash
yarn add @shoelace-style/shoelace
```

#### Build Configuration
```typescript
// vite.renderer.config.ts
export default defineConfig({
  // ... existing config
  define: {
    // Shoelace base path for assets
    'process.env.SHOELACE_BASE_PATH': JSON.stringify('/node_modules/@shoelace-style/shoelace/dist/')
  }
});
```

#### Theme Integration Setup
```scss
// Create src/frontend/styles/shoelace-theme.scss
:root {
  // Map Illthorn theme to Shoelace design tokens
  --sl-color-primary-500: var(--color-primary);
  --sl-color-success-500: var(--color-success);
  --sl-color-warning-500: var(--color-warning);
  --sl-color-danger-500: var(--color-danger);
  
  // Typography
  --sl-font-mono: "MonoLisa", monospace;
  --sl-font-size-small: 0.8rem;
  --sl-font-size-medium: 1rem;
  
  // Spacing
  --sl-spacing-small: 0.5rem;
  --sl-spacing-medium: 1rem;
}
```

#### Development Toggle System
```typescript
// Create util/feature-flags.ts
export const FEATURE_FLAGS = {
  USE_SHOELACE_VITALS: true,
  USE_SHOELACE_PANELS: false,
  USE_SHOELACE_BUTTONS: false,
} as const;
```

### Phase 2: High-Value Components (Week 2-3)

#### Week 2: VitalStat & Panel Migration
1. **Day 1-2**: Migrate VitalStat to sl-progress-bar
   - Update `components/session/vitals/components.lit.ts`
   - Test with all vital types (health, mana, stamina)
   - Verify threshold coloring and reactivity

2. **Day 3-4**: Migrate Panel to sl-details
   - Update `components/session/panel.lit.ts`
   - Test expand/collapse behavior
   - Verify slot content preservation

3. **Day 5**: Integration testing and refinement
   - Visual testing across all themes
   - Accessibility validation
   - Performance baseline measurement

#### Week 3: SessionButton Enhancement
1. **Day 1-3**: Enhance SessionButton with sl-button
   - Wrap existing logic with Shoelace button
   - Preserve all session switching functionality
   - Test tab numbering and active states

2. **Day 4-5**: Polish and optimization
   - Fine-tune styling and theming
   - Accessibility improvements
   - Cross-browser testing

### Phase 3: Strategic Enhancements (Week 4-5)

#### Week 4: CLI and Effects
1. **Day 1-3**: CLI Input enhancement
   - Replace native input with sl-input
   - Preserve all keyboard event handling
   - Test command history and autocomplete

2. **Day 4-5**: Effects card integration
   - Wrap effects with sl-card components
   - Enhance visual hierarchy
   - Test effect duration and removal

#### Week 5: Navigation Components
1. **Day 1-2**: Sessions Menu enhancement
   - Implement sl-dropdown with sl-menu
   - Preserve session switching logic
   - Enhance keyboard navigation

2. **Day 3-4**: Compass button grouping
   - Group direction buttons with sl-button-group
   - Preserve directional logic
   - Test active state management

3. **Day 5**: Final integration testing
   - End-to-end functionality testing
   - Performance validation
   - User experience review

### Phase 4: Game-Specific Component Enhancement (Week 6-7)

#### Week 6: Feed, Room, and Hand Components
1. **Day 1-2**: Feed enhancement with sl-card and badges
   - Wrap message groups in cards
   - Add timestamp badges and copy buttons
   - Implement hover tooltips for interactive elements

2. **Day 3-4**: Room and Hand component enhancement
   - Structure room display with cards and dividers
   - Add inventory cards with badges and dropdowns
   - Include icons for exits, items, and actions

3. **Day 5**: Streams and Prompt enhancement
   - Convert stream messages to alert variants
   - Add status icons and message count badges
   - Enhance prompt with consistent input styling

#### Week 7: Layout and Context Enhancement
1. **Day 1-2**: Session layout with tabs and split panels
   - Implement sl-tab-group for session switching
   - Add split-panel for resizable layout management

2. **Day 3-4**: App root layout enhancement
   - Implement split-panel for main layout
   - Add drawer functionality for side panels

3. **Day 5**: Context and final game component polish
   - Structure context display with cards and badges
   - Final integration testing and refinement

### Phase 5: Utility Components Integration (Week 8-9)

#### Week 8: Core Utilities
1. **Day 1-2**: Icon and badge system implementation
   - Replace custom icons with sl-icon throughout app
   - Implement consistent badge system for counts and status

2. **Day 3-4**: Tooltip and notification system
   - Add comprehensive tooltip system
   - Implement global notification system with sl-alert

3. **Day 5**: Loading states and formatters
   - Add spinner and skeleton loading states
   - Implement consistent date/number formatting

#### Week 9: Advanced Features
1. **Day 1-2**: Copy functionality and QR codes
   - Add copy buttons throughout the interface
   - Implement QR code sharing for sessions

2. **Day 3-4**: Theme customization features
   - Add color picker for theme customization
   - Implement highlight color selection

3. **Day 5**: Final polish and optimization
   - Bundle size optimization and tree-shaking
   - Performance validation and optimization

### Phase 6: Testing, Documentation & Deployment (Week 10)

1. **Day 1-2**: Comprehensive testing
   - Regression testing across all components
   - Accessibility audit and validation
   - Cross-browser compatibility testing

2. **Day 3-4**: Documentation and guides
   - Update component documentation
   - Create developer guidelines for future integrations
   - Performance benchmarking and reporting

3. **Day 5**: Final deployment preparation
   - Production build validation
   - User acceptance testing
   - Migration completion celebration 🎉

## Technical Implementation Patterns

### Component Wrapper Pattern
```typescript
// Example: Enhanced VitalStat with Shoelace
@customElement("illthorn-vital-stat")
export class VitalStat extends LitElement {
  // ... existing properties and logic

  render() {
    return html`
      <div class="vital-container">
        <sl-progress-bar 
          value=${this.percent}
          label="${this.label}: ${this.value}"
          class="vital-progress ${this._thresholdCategory}">
        </sl-progress-bar>
        <div class="vital-text">
          <span class="vital-label">${this.label}</span>
          <span class="vital-value">${this.value}</span>
        </div>
      </div>
    `;
  }
}
```

### Theme Integration Pattern
```scss
// Component-specific Shoelace theming
illthorn-vital-stat {
  sl-progress-bar {
    --indicator-color: var(--color-success);
    
    &.low {
      --indicator-color: var(--color-danger);
    }
    
    &.medium {
      --indicator-color: var(--color-warning);
    }
  }
}
```

### Feature Flag Pattern
```typescript
render() {
  return FEATURE_FLAGS.USE_SHOELACE_VITALS 
    ? this.renderWithShoelace()
    : this.renderLegacy();
}
```

## Theme Integration Strategy

### Design Token Mapping
```scss
// Comprehensive theme mapping
:root {
  // Primary colors
  --sl-color-primary-50: var(--color-primary-light);
  --sl-color-primary-500: var(--color-primary);
  --sl-color-primary-900: var(--color-primary-dark);
  
  // Semantic colors
  --sl-color-success-500: var(--color-success);
  --sl-color-warning-500: var(--color-warning);
  --sl-color-danger-500: var(--color-danger);
  
  // Neutral colors (mapped from existing theme)
  --sl-color-neutral-0: var(--color-background-primary);
  --sl-color-neutral-50: var(--color-surface);
  --sl-color-neutral-900: var(--color-text-primary);
  
  // Border and divider colors
  --sl-color-neutral-200: var(--color-border);
  --sl-color-neutral-300: var(--color-divider);
}
```

### Dark Theme Support
```scss
[data-theme="dark"] {
  // Dark theme specific overrides
  --sl-color-neutral-0: var(--color-background-primary);
  --sl-color-neutral-1000: var(--color-text-primary);
}
```

## Risk Assessment & Mitigation

### Technical Risks

#### 1. Bundle Size Increase
**Risk**: Shoelace adds ~120KB to bundle size
**Mitigation**: 
- Tree-shaking configuration for unused components
- Lazy loading of complex Shoelace components
- Bundle analysis monitoring

#### 2. Theme Compatibility
**Risk**: Shoelace themes may conflict with existing Illthorn themes
**Mitigation**:
- Comprehensive design token mapping
- CSS custom property isolation
- Theme-specific testing matrix

#### 3. Component API Changes
**Risk**: Shoelace updates may break existing integrations
**Mitigation**:
- Pin Shoelace versions until stable
- Comprehensive wrapper components
- API compatibility testing

### Functional Risks

#### 1. Game-Specific Behavior Loss
**Risk**: Shoelace components may not support MUD-specific interactions
**Mitigation**:
- Wrapper pattern preserves existing logic
- Custom event handling preservation
- Extensive functionality testing

#### 2. Performance Degradation
**Risk**: Additional abstraction layers may impact performance
**Mitigation**:
- Performance benchmarking at each phase
- Profiling of critical user interactions
- Rollback plan for performance regressions

#### 3. Accessibility Regression
**Risk**: Custom accessibility implementations may be lost
**Mitigation**:
- Accessibility audit before and after migration
- Keyboard navigation testing
- Screen reader compatibility validation

## Success Criteria & Validation

### Functional Success Criteria
- ✅ No functionality regression in any migrated component
- ✅ All existing keyboard shortcuts and interactions preserved
- ✅ Game-specific logic (session switching, vital tracking, etc.) unchanged
- ✅ Theme switching works across all integrated components
- ✅ Performance maintains or improves from baseline

### User Experience Success Criteria
- ✅ Improved accessibility (WCAG 2.1 AA compliance)
- ✅ Better keyboard navigation and focus management
- ✅ Enhanced visual feedback (hover states, animations)
- ✅ Consistent styling and spacing across components
- ✅ Smooth theme transitions and visual polish

### Developer Experience Success Criteria
- ✅ Reduced custom CSS for common UI patterns
- ✅ Better component documentation and examples
- ✅ Improved TypeScript autocomplete and error detection
- ✅ Simplified testing with Shoelace testing utilities
- ✅ Clear migration patterns for future components

### Performance Success Criteria
- ✅ Bundle size increase < 25% after comprehensive integration and tree-shaking
- ✅ Rendering performance maintained or improved despite additional components
- ✅ Memory usage optimized through better DOM management and component lifecycle
- ✅ Startup time impact < 150ms for full Shoelace integration

## Testing Strategy

### Unit Testing
```typescript
// Example: VitalStat with Shoelace testing
describe('VitalStat with Shoelace', () => {
  it('renders progress bar with correct value', async () => {
    const el = await fixture<VitalStat>(html`
      <illthorn-vital-stat percent="75" label="Health" value="150/200">
      </illthorn-vital-stat>
    `);
    
    const progressBar = el.shadowRoot?.querySelector('sl-progress-bar');
    expect(progressBar?.value).to.equal(75);
  });
  
  it('applies correct threshold styling', async () => {
    const el = await fixture<VitalStat>(html`
      <illthorn-vital-stat percent="25" label="Health" value="50/200">
      </illthorn-vital-stat>
    `);
    
    expect(el.shadowRoot?.querySelector('.low')).to.exist;
  });
});
```

### Integration Testing
- Component interaction with existing bus system
- Theme compatibility across all variants
- Performance regression testing
- Cross-browser compatibility validation

### Accessibility Testing
- Keyboard navigation validation
- Screen reader compatibility
- Color contrast verification
- Focus management testing

## Future Considerations

### Shoelace 3.0 (Web Awesome) Migration
- **Timeline**: Expected Q2 2025
- **Benefits**: Enhanced SSR support, improved performance, new components
- **Migration Path**: Shoelace 2.x components are forward-compatible
- **Planning**: Monitor release schedule and breaking changes

### Additional Component Opportunities
Beyond the comprehensive integration plan, future opportunities include:
- **Animation**: Enhanced transitions with `sl-animation` for page changes
- **Carousel**: Image galleries or feature showcases with `sl-carousel`
- **Rating**: User feedback systems with `sl-rating` 
- **Range**: Volume controls or preference sliders with `sl-range`
- **Switch**: Enhanced toggle controls with `sl-switch`
- **Tree**: Hierarchical data display with `sl-tree` for complex game data

### Performance Optimizations
- **Virtual Scrolling**: For components with large datasets
- **Component Lazy Loading**: Load Shoelace components on demand
- **Bundle Splitting**: Separate Shoelace components into async chunks

## Conclusion

This comprehensive migration plan maximizes Shoelace integration throughout Illthorn, transforming it into a showcase of modern web component architecture. By creatively integrating **25+ Shoelace components** across all aspects of the application - from core UI elements to game-specific displays to utility functions - we achieve:

**Maximum Value Extraction**: Every component benefits from Shoelace's professional design, accessibility features, and consistent behavior patterns.

**Future-Proof Architecture**: A unified component system that scales with Shoelace's evolution and reduces long-term maintenance burden.

**Professional Polish**: Consistent animations, interactions, and visual feedback throughout the entire MUD client experience.

**Accessibility Excellence**: Professional-grade accessibility implementation across every user interaction.

The aggressive integration approach ensures Illthorn becomes a modern, polished, and highly accessible MUD client while preserving all the game-specific functionality that makes it unique. This plan demonstrates how creative component usage can transform even specialized applications into exemplars of modern web development practices.

---

**Document Version**: 1.0  
**Last Updated**: January 31, 2025  
**Review Schedule**: After each implementation phase