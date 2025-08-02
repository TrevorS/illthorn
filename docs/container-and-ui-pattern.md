# Container/UI Pattern - Illthorn Component Architecture

## Overview

This document defines the container/presentational pattern used for migrating Illthorn components to a cleaner, more testable, and more maintainable architecture. This pattern separates business logic from presentation concerns, enabling better testing, reliable Storybook integration, and improved component reusability.

## Pattern Architecture

### Container Components (Smart Components)
**Purpose**: Handle business logic, session events, and state management
**Characteristics**:
- Subscribe to session bus events
- Manage internal state with `@state()` decorator
- Transform raw game data into UI-friendly formats
- Pass processed data to UI components via reactive properties
- Handle complex lifecycle and event cleanup

### UI Components (Dumb Components)  
**Purpose**: Pure presentation with reactive properties
**Characteristics**:
- Take data via `@property()` decorators only
- No session dependencies or event subscriptions
- Focus solely on rendering and visual behavior
- Highly testable with predictable inputs/outputs
- Enable reliable Storybook stories with direct prop control

### Index Files
**Purpose**: Centralized component exports and registration
**Characteristics**:
- Import both container and UI components for registration
- Export both classes for different use cases
- Provide clean external API for component consumers

## File Structure Template

```
src/frontend/components/session/[component-name]/
├── [component-name]-container.lit.ts  # Smart container component
├── [component-name]-ui.lit.ts         # Pure UI component  
├── [component-name]-ui.spec.ts        # Tests (co-located)
├── [component-name]-ui.stories.ts     # Storybook stories
└── index.ts                           # Centralized exports
```

### Naming Conventions
- **Container**: `[ComponentName]Container` class, `illthorn-[component-name]-container` element
- **UI**: `[ComponentName]UI` class, `illthorn-[component-name]-ui` element
- **Files**: Kebab-case with `-container` and `-ui` suffixes

## Implementation Patterns

### Container Component Template

```typescript
// ABOUTME: Smart container component that manages [component] state via session events
// ABOUTME: Subscribes to [relevant events] and passes processed data to UI component
import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { GameTag } from "../../../parser/tag";
import type { FrontendSession as Session } from "../../../session/index";
import "./[component-name]-ui.lit";

// Define data interface for type safety
interface ComponentData {
  // Define the shape of data passed to UI component
}

@customElement("illthorn-[component-name]-container")
export class ComponentNameContainer extends LitElement {
  @property({ type: Object })
  session?: Session;

  @state()
  private _componentData: Array<ComponentData> = [];

  private _eventListenerSetup = false;

  connectedCallback() {
    super.connectedCallback();
    if (this.session && !this._eventListenerSetup) {
      this.setupEventListeners();
      this._eventListenerSetup = true;
    }
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);
    if (changedProperties.has("session")) {
      if (this.session && !this._eventListenerSetup) {
        this.setupEventListeners();
        this._eventListenerSetup = true;
      }
    }
  }

  private setupEventListeners() {
    if (!this.session || !this.session.bus) return;

    this.session.bus.subscribeEvent<GameTag>("metadata/[event-name]", ({ detail: data }) => {
      // Transform raw game data into UI-friendly format
      this._componentData = this.processGameData(data);
      this.requestUpdate();
    });
  }

  private processGameData(data: GameTag): Array<ComponentData> {
    // Business logic: transform game data for UI consumption
    return [];
  }

  render() {
    return html`<illthorn-[component-name]-ui .data=${this._componentData}></illthorn-[component-name]-ui>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-[component-name]-container": ComponentNameContainer;
  }
}
```

### UI Component Template

```typescript
// ABOUTME: Pure UI component for [component] display with no event handling dependencies
// ABOUTME: Takes data as reactive property and renders [description of UI behavior]
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

// Import the interface defined in container
interface ComponentData {
  // Same interface as container
}

@customElement("illthorn-[component-name]-ui")
export class ComponentNameUI extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    /* Component-specific styling with CSS custom properties for theming */
  `;

  @property({ type: Array })
  data: Array<ComponentData> = [];

  // Helper methods for computed properties
  private processForDisplay(item: ComponentData): string {
    // Pure functions for data transformation/formatting
    return "";
  }

  render() {
    return html`
      ${this.data.map(
        (item) => html`
        <div class="item">
          ${this.processForDisplay(item)}
        </div>
      `)}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-[component-name]-ui": ComponentNameUI;
  }
}
```

### Index File Template

```typescript
// ABOUTME: Centralized exports for [component] components using container/presentational pattern
// ABOUTME: Provides both pure UI component and smart container for different use cases

// Import to register components
import "./[component-name]-ui.lit";
import "./[component-name]-container.lit";

export { ComponentNameContainer } from "./[component-name]-container.lit";
export { ComponentNameUI } from "./[component-name]-ui.lit";
```

## TypeScript Best Practices

### Shared Interface Patterns

Create shared interfaces for common data structures:

```typescript
// In component directory or shared types file
export interface SpellEffectData {
  text: string;
  id: string;
  time: string;
  value: string;
}

export interface VitalData {
  current: number;
  max: number;
  percentage: number;
  status: 'healthy' | 'wounded' | 'critical';
}

export interface CompassData {
  activeDirs: Array<string>;
}
```

### Proper Property Decorators

```typescript
// For complex objects, specify type for better IDE support
@property({ type: Object })
session?: Session;

// For arrays, always specify Array type
@property({ type: Array })
activeDirs: Array<string> = [];

// For primitive types, be explicit
@property({ type: String })
title = "";

@property({ type: Number })
count = 0;

@property({ type: Boolean })
isVisible = false;
```

### Event Handling Types

```typescript
// Use generics for type-safe event handling
this.session.bus.subscribeEvent<GameTag>("metadata/compass", ({ detail: compass }) => {
  // compass is properly typed as GameTag
});

// For custom data interfaces
this.session.bus.subscribeEvent<CustomDataInterface>("custom/event", ({ detail: data }) => {
  // data is properly typed as CustomDataInterface
});
```

## Testing Strategy

### UI Component Testing (Primary Focus)

```typescript
import { describe, expect, it } from "vitest";
import { ComponentNameUI } from "./[component-name]-ui.lit";

describe("ComponentNameUI", () => {
  const setup = () => {
    const component = document.createElement("illthorn-[component-name]-ui") as ComponentNameUI;
    document.body.appendChild(component);
    return { component };
  };

  const teardown = (component: ComponentNameUI) => {
    if (component.parentNode) {
      component.parentNode.removeChild(component);
    }
  };

  describe("Reactive properties", () => {
    it("should accept data property", async () => {
      const { component } = setup();
      const testData = [/* test data */];

      component.data = testData;
      await component.updateComplete;

      expect(component.data).toEqual(testData);
      teardown(component);
    });
  });

  describe("Rendering", () => {
    it("should render data items", async () => {
      const { component } = setup();
      component.data = [/* test data */];
      
      await component.updateComplete;
      
      const items = component.shadowRoot?.querySelectorAll(".item");
      expect(items?.length).toBe(/* expected count */);
      
      teardown(component);
    });
  });
});
```

### Container Component Testing (Secondary)

Focus on data transformation and event handling logic:

```typescript
describe("ComponentNameContainer", () => {
  it("should process game data correctly", async () => {
    const container = new ComponentNameContainer();
    const mockGameData = /* create mock GameTag */;
    
    // Test the private method via public interface
    container.session = createMockSession();
    // Trigger event and verify state changes
  });
});
```

## Storybook Integration

### UI Component Stories (Primary Pattern)

```typescript
import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./[component-name]-ui.lit";

const meta: Meta = {
  title: "Session/[ComponentName]/UI",
  component: "illthorn-[component-name]-ui",
  parameters: {
    docs: {
      description: {
        component: "Pure UI component for [description].",
      },
    },
  },
  argTypes: {
    data: { 
      control: "object",
      description: "Array of data items to display"
    },
  },
};

export default meta;
type Story = StoryObj;

// Default story with empty state
export const Default: Story = {
  args: {
    data: [],
  },
  render: (args) => html`<illthorn-[component-name]-ui .data=${args.data}></illthorn-[component-name]-ui>`,
};

// Interactive story with controls
export const Interactive: Story = {
  args: {
    data: [/* sample data */],
  },
  argTypes: {
    // Add specific controls for easy testing
    itemCount: { 
      control: { type: 'range', min: 0, max: 10, step: 1 },
      description: "Number of items to display"
    },
  },
  render: (args) => {
    // Generate data based on controls
    const data = Array.from({ length: args.itemCount }, (_, index) => ({
      // Generate test data
    }));
    
    return html`<illthorn-[component-name]-ui .data=${data}></illthorn-[component-name]-ui>`;
  },
};
```

### Container Component Stories (Secondary)

```typescript
// Separate story file for container component
import { StorybookSessionMock } from "../../../../stories/mocks/index";

export const WithSession: Story = {
  render: () => {
    const session = StorybookSessionMock.create();
    
    // Simulate events for container testing
    setTimeout(() => {
      StorybookSessionMock.emitEvent("metadata/[event-name]", {
        /* mock game data */
      });
    }, 100);

    return html`<illthorn-[component-name]-container .session=${session}></illthorn-[component-name]-container>`;
  },
};
```

## DRY Opportunities (Without Over-Engineering)

### 1. Shared Data Interfaces

```typescript
// src/frontend/types/game-data.ts
export interface BaseGameData {
  id: string;
  timestamp?: number;
}

export interface SpellEffectData extends BaseGameData {
  text: string;
  time: string;
  value: string;
}

export interface VitalData extends BaseGameData {
  current: number;
  max: number;
  type: 'health' | 'mana' | 'stamina' | 'spirit' | 'mind';
}
```

### 2. Common Session Event Patterns

```typescript
// src/frontend/mixins/session-event-mixin.ts
export const withSessionEvents = <T extends Constructor<LitElement>>(superClass: T) => {
  class SessionEventsMixin extends superClass {
    @property({ type: Object })
    session?: Session;

    private _eventListenerSetup = false;

    connectedCallback() {
      super.connectedCallback();
      if (this.session && !this._eventListenerSetup) {
        this.setupEventListeners();
        this._eventListenerSetup = true;
      }
    }

    updated(changedProperties: Map<string | number | symbol, unknown>) {
      super.updated(changedProperties);
      if (changedProperties.has("session")) {
        if (this.session && !this._eventListenerSetup) {
          this.setupEventListeners();
          this._eventListenerSetup = true;
        }
      }
    }

    // Override in subclasses
    protected setupEventListeners(): void {
      // Implemented by subclasses
    }
  }

  return SessionEventsMixin;
};
```

### 3. Reusable CSS Custom Properties

```css
/* Theme-aware properties used across components */
:host {
  --component-background: var(--color-surface);
  --component-text: var(--color-text);
  --component-border: var(--color-border);
  --component-success: var(--color-success);
  --component-warning: var(--color-warning);
  --component-danger: var(--color-danger);
}
```

### 4. Common Template Helpers

```typescript
// src/frontend/utils/template-helpers.ts
export const renderProgressBar = (value: number, max: number, label?: string) => html`
  <div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${value}">
    ${label ? html`<span class="progress-label">${label}</span>` : ''}
    <div class="progress-track">
      <div class="progress-fill" style="width: ${(value / max) * 100}%"></div>
    </div>
  </div>
`;

export const renderEmpty = (message = "No items to display") => html`
  <div class="empty-state">
    <p class="empty-message">${message}</p>
  </div>
`;
```

## Migration Checklist

### Pre-Migration Analysis
- [ ] Identify current component responsibilities
- [ ] Determine what data flows through the component
- [ ] Map session event subscriptions
- [ ] Identify pure vs. impure functions
- [ ] Review existing tests and stories

### Container Component Creation
- [ ] Create `[component-name]-container.lit.ts`
- [ ] Move session event handling logic to container
- [ ] Define data interface for UI component
- [ ] Implement data transformation methods
- [ ] Add proper TypeScript typing
- [ ] Handle component lifecycle properly

### UI Component Creation  
- [ ] Create `[component-name]-ui.lit.ts`
- [ ] Move rendering logic to UI component
- [ ] Replace session dependencies with reactive properties
- [ ] Add CSS styles with custom properties
- [ ] Implement computed properties for display logic
- [ ] Add proper TypeScript typing

### Integration & Testing
- [ ] Create `index.ts` with proper exports
- [ ] Update parent components to use new container
- [ ] Move tests alongside components
- [ ] Update tests for new architecture
- [ ] Create/update Storybook stories
- [ ] Run validation tools (lint, typecheck)
- [ ] Test functionality in main application

## Benefits of This Pattern

### Development Benefits
- **Faster Development**: UI components can be developed in isolation
- **Better Testing**: Pure components are easier to test
- **Reliable Stories**: Direct prop control eliminates timing issues
- **Type Safety**: Clear interfaces prevent runtime errors

### Architectural Benefits  
- **Separation of Concerns**: Business logic separated from presentation
- **Reusability**: UI components can be reused in different contexts
- **Maintainability**: Changes to business logic don't affect UI and vice versa
- **Testability**: Both layers can be tested independently

### Long-term Benefits
- **Consistency**: Standardized pattern across all components
- **Scalability**: Pattern scales well as components grow in complexity
- **Documentation**: Living documentation through Storybook stories
- **Quality**: Reduced coupling leads to more reliable code

## Anti-Patterns to Avoid

### ❌ Don't: Mix Concerns
```typescript
// Bad: UI component directly subscribing to session events
@customElement("illthorn-bad-ui")
export class BadUI extends LitElement {
  @property({ type: Object })
  session?: Session;

  connectedCallback() {
    super.connectedCallback();
    // DON'T: UI component should not handle session events
    this.session?.bus.subscribeEvent("metadata/data", this.handleData);
  }
}
```

### ❌ Don't: Over-Abstract Too Early
```typescript
// Bad: Premature abstraction with complex generics
abstract class BaseContainer<T, U, V> extends LitElement {
  // DON'T: Over-engineer with complex abstractions
  abstract processData<K extends keyof T>(data: T[K]): U;
}
```

### ❌ Don't: Ignore TypeScript
```typescript
// Bad: Using 'any' instead of proper typing
@property({ type: Object })
data: any = []; // DON'T: Always provide proper types
```

### ✅ Do: Keep It Simple
```typescript
// Good: Clear, simple, and well-typed
@property({ type: Array })
spellEffects: Array<SpellEffectData> = [];
```

This pattern provides a solid foundation for component architecture while remaining practical and maintainable. Focus on clarity and type safety over cleverness, and always prioritize developer experience and component reliability.