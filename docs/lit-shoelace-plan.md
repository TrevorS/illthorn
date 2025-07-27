# Lit Migration Plan for Illthorn

## Executive Summary

This document outlines a strategic plan to modernize Illthorn's frontend components by migrating from vanilla Web Components to Lit-based components. The migration leverages the existing Web Components foundation to provide better developer experience, improved performance, and enhanced maintainability. Shoelace integration will be considered in a future phase after the Lit migration is complete.

## Current State Analysis

### Existing Architecture Strengths
- ✅ **Web Components Foundation**: Already using `customElements.define()` and `HTMLElement` base classes
- ✅ **Component Lifecycle**: Proper use of `attributeChangedCallback`, `connectedCallback`
- ✅ **Event System**: Custom bus-based communication between components
- ✅ **Theming**: SCSS-based themes with CSS custom properties
- ✅ **TypeScript**: Full TypeScript implementation

### Current Component Inventory

#### Simple Components (Phase 2 candidates)
- `ProgressBar` - Basic progress visualization with attributes
- `Panel` - Collapsible content wrapper using `<details>`
- `Pane` - Basic container element

#### Medium Complexity (Phase 4 candidates)
- `SessionButton` - Interactive session switcher with event handling
- `Vitals` - Composed health/mana/stamina display using multiple ProgressBars

#### Complex Components (Phase 5+ candidates)
- `CLI` - Command line interface with history and autocomplete
- `Feed` - Game text display with complex parsing and highlighting
- `Streams` - Multi-channel text output
- `Hand`, `Room`, `Compass` - Game state displays

## Technology Overview

### Lit Benefits
- **Tiny**: 5KB minified, efficient reactive updates
- **Standards-based**: Built on Web Components, Shadow DOM, HTML Templates
- **TypeScript-first**: Excellent type safety and IDE support
- **Reactive properties**: Automatic re-rendering on state changes
- **Declarative templates**: HTML-like syntax with JavaScript expressions
- **Performance**: Only updates changed DOM portions

### Shoelace Benefits  
- **Framework-agnostic**: Works with any framework or vanilla JS
- **Comprehensive**: 50+ components covering common UI patterns
- **Customizable**: CSS custom properties for theming
- **Accessible**: Built-in ARIA support and keyboard navigation
- **Modern**: Uses latest web standards and best practices

## Migration Strategy

### Phase 1: Foundation Setup (Week 1)

#### Dependencies
```bash
yarn add lit @shoelace-style/shoelace
yarn add -D @lit/localize-tools @custom-elements-manifest/analyzer
```

#### Directory Structure
```
src/frontend/
├── components/              # Existing vanilla components  
├── components-lit/          # New Lit-based components
│   ├── base/               # Base classes and utilities
│   ├── simple/             # Phase 2 components
│   ├── interactive/        # Phase 4 components
│   └── complex/            # Phase 5+ components
└── styles/                 # Existing SCSS (maintained)
```

#### Base Infrastructure
1. **Create base Lit component class**:
   ```typescript
   // components-lit/base/illthorn-lit-element.ts
   export abstract class IllthornLitElement extends LitElement {
     // Theme integration
     // Bus system bridge
     // Common utilities
   }
   ```

2. **Configure build system** for Lit compilation
3. **Create development toggle** for A/B testing components
4. **Establish testing patterns** with Lit testing utilities

### Phase 2: Proof of Concept - Compass (Week 2) ✅

#### Goals
- ✅ Validate migration approach  
- ✅ Establish patterns for API compatibility
- ✅ Test theme integration
- ✅ Measure performance impact

#### Implementation ✅
```typescript
// components/session/compass.lit.ts
@customElement('illthorn-compass-lit')
export class CompassLit extends LitElement {
  @property({ type: Object })
  session?: Session;

  @state()
  activeDirs: string[] = [];

  render() {
    return html`
      ${CompassLit.DIRS.map((dir, _index) => html`
        <a class=${dir && this.isDirectionActive(dir) ? "on" : ""}>
          ${this.getDisplayText(dir)}
        </a>
      `)}
    `;
  }
}
```

#### Success Criteria ✅
- ✅ Drop-in replacement for existing Compass
- ✅ All existing themes work unchanged  
- ✅ Performance equal or better than vanilla version
- ✅ Uses decorators pattern for modern development

### Phase 3: Simple Components (Week 3)

#### Panel → Lit Component  
Migrate Panel component to Lit while maintaining existing `<details>` structure:
```typescript
// components/session/panel.lit.ts
@customElement('illthorn-panel-lit')
export class PanelLit extends LitElement {
  @property() title = '';
  @property({ type: Boolean }) open = true;

  render() {
    return html`
      <details ?open=${this.open}>
        <summary>${this.title}</summary>
        <slot></slot>
      </details>
    `;
  }
}
```

#### ProgressBar → Lit Component
Migrate ProgressBar to follow the same decorator pattern.

#### Benefits
- Better reactivity with Lit properties
- Cleaner component code  
- Consistent development patterns

### Phase 4: Interactive Components (Week 4-5)

#### SessionButton Migration
```typescript
@customElement('illthorn-session-button-lit')
export class SessionButtonLit extends IllthornLitElement {
  @property({ type: Object }) session!: Session;
  @property({ type: Boolean }) active = false;

  render() {
    return html`
      <sl-button 
        variant=${this.active ? 'primary' : 'default'}
        @click=${this.handleClick}>
        <span class="session-name">${this.session.name[0]}</span>
        <span class="alt-numeric">${this.tabNum}</span>
      </sl-button>
    `;
  }
}
```

#### Vitals Refactoring
- Use reactive properties for real-time updates
- Maintain existing event bus subscriptions
- Leverage Lit's efficient rendering for smooth animations

### Phase 5: Complex Components (Week 6+)

#### CLI Component Considerations
- **Input handling**: Evaluate `sl-input` vs custom implementation
- **Command history**: Maintain existing keyboard navigation
- **Autocomplete**: Consider `sl-dropdown` for suggestions

#### Feed Component Strategy
- **Virtual scrolling**: Assess need for performance with large text output
- **Highlighting**: Maintain existing parser integration
- **Memory management**: Ensure proper cleanup of old content

## Implementation Guidelines

### Compatibility Patterns

#### 1. API Preservation
```typescript
// Maintain existing attribute API
static get observedAttributes() {
  return ['title', 'percent', 'value'];
}

// Forward to Lit properties
attributeChangedCallback(name: string, oldValue: string, newValue: string) {
  if (name === 'percent') this.percent = parseInt(newValue);
  // ...
}
```

#### 2. Event Bus Integration
```typescript
// Bridge existing bus system with Lit reactivity
connectedCallback() {
  super.connectedCallback();
  this.session.bus.subscribeEvent('metadata/progressBar/health', 
    ({detail}) => {
      this.percent = detail.attrs.value;
      this.title = detail.attrs.text;
    });
}
```

#### 3. Theme Integration
```scss
// Maintain existing SCSS variables for new components
illthorn-progress-bar-lit {
  .meter {
    background: var(--ok);
  }
  &.low .meter {
    background: var(--warn);
  }
}
```

### Testing Strategy

#### Unit Testing
```typescript
// Use Lit testing utilities
describe('ProgressBarLit', () => {
  it('updates percent attribute', async () => {
    const el = await fixture<ProgressBarLit>(html`
      <illthorn-progress-bar-lit percent="75"></illthorn-progress-bar-lit>
    `);
    expect(el.percent).to.equal(75);
  });
});
```

#### Integration Testing
- Test component interaction with existing bus system
- Verify theme compatibility across all variants
- Performance regression testing

### Performance Considerations

#### Bundle Analysis
- Monitor impact on main bundle size
- Consider lazy loading for complex components
- Evaluate tree-shaking effectiveness

#### Runtime Performance
- Measure rendering performance vs vanilla components
- Test memory usage with large datasets (Feed component)
- Validate smooth animations and interactions

## Risk Mitigation

### Development Risks
1. **Breaking changes**: Side-by-side development prevents disruption
2. **Performance regression**: Comprehensive benchmarking at each phase
3. **Theme incompatibility**: Gradual CSS migration with fallbacks
4. **Learning curve**: Start with simple components, build expertise

### Production Risks
1. **Feature flags**: Toggle between old/new components for A/B testing
2. **Rollback plan**: Keep existing components functional during migration
3. **User impact**: Ensure visual and functional parity
4. **Bundle size**: Monitor and optimize at each phase

## Success Metrics

### Developer Experience
- [ ] Reduced component development time
- [ ] Better TypeScript autocomplete and error detection
- [ ] Simplified testing and debugging
- [ ] Improved component reusability

### Performance
- [ ] Bundle size maintained or reduced
- [ ] Rendering performance equal or improved
- [ ] Memory usage optimized
- [ ] Startup time maintained

### Maintainability
- [ ] Reduced custom CSS for common patterns
- [ ] Standardized component APIs
- [ ] Better documentation and examples
- [ ] Easier onboarding for new developers

## Timeline Summary

| Phase | Duration | Components | Deliverables |
|-------|----------|------------|--------------|
| 1 | Week 1 | Foundation | Dependencies, build config, base classes |
| 2 | Week 2 | ProgressBar | Proof of concept, patterns established |
| 3 | Week 3 | Panel, Pane | Container components, Shoelace integration |
| 4 | Week 4-5 | SessionButton, Vitals | Interactive components, reactive properties |
| 5 | Week 6+ | CLI, Feed, etc. | Complex components, performance optimization |

## Next Steps

1. **Review and approve this plan** with team
2. **Set up development environment** (Phase 1)
3. **Create first proof-of-concept** (Phase 2)
4. **Establish testing and review process**
5. **Begin incremental migration**

## Resources

- [Lit Documentation](https://lit.dev/docs/)
- [Shoelace Component Library](https://shoelace.style/)
- [Web Components Best Practices](https://developers.google.com/web/fundamentals/web-components)
- [Lit Testing Utilities](https://lit.dev/docs/tools/testing/)

---

*This plan prioritizes safety, maintainability, and incremental progress to ensure a successful migration while maintaining Illthorn's stability and user experience.*