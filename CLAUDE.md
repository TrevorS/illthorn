# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Illthorn is a modern cross-platform Electron application that serves as a front-end client for Gemstone IV, a text-based MUD (Multi-User Dungeon). The app connects to Lich (a Ruby-based scripting framework) via TCP sockets and provides a rich UI with themes, highlighting, command history, and multi-session support.

## Development Commands

### Core Development
- **Start development**: `yarn start` - Launches Electron in development mode with hot reload
- **Build package**: `yarn make` - Creates distributable packages in `/out/`
- **Install dependencies**: `yarn install`

### Code Quality
- **Lint**: `yarn lint` - Runs ESLint on TypeScript files
- **Test**: `yarn test` - Runs Vitest test suite
- **Test with UI**: `yarn test:ui` - Runs Vitest with browser UI
- **Test coverage**: `yarn test:coverage` - Generates coverage report
- **Single test**: `yarn test test/command-history.spec.ts` - Run specific test file

### Versioning
- **Release candidate**: `yarn rc` - Creates prerelease version, commits, and pushes tags

## Architecture Overview

### Electron Multi-Process Structure
- **Main Process** (`src/main.ts`): Electron app initialization, window management, and backend coordination
- **Preload Script** (`src/preload.ts`): Secure context bridge exposing APIs to renderer
- **Renderer Process** (`src/frontend/index.ts`): Frontend application initialization and UI management

### Backend Architecture (`src/backend/`)
The backend uses a modular IPC (Inter-Process Communication) pattern:
- **Session Management** (`session/`): Handles TCP connections to Lich processes, session lifecycle
- **App Management** (`app/`): Core application state and operations  
- **Settings Management** (`settings/`): Configuration persistence and retrieval
- Each module has three key files:
  - `ipc-handlers.ts`: Main process IPC event handlers
  - `mainworld-api.ts`: Renderer-safe API exposure via preload
  - `methods.ts`: Core business logic implementation

### Frontend Architecture (`src/frontend/`)
- **Session Management** (`session/`): Frontend session state, command handling, UI rendering
- **Components** (`components/`): Vanilla Web Components using `customElements.define()`
- **Parser** (`parser/`): Game text parsing with tag-based content transformation
- **Themes** (`styles/themes/`): Multiple visual themes for customization
- **Bus System** (`util/bus.ts`): Custom event-driven communication between components

### Key Design Patterns
- **IPC Communication**: Structured three-layer pattern (handlers → API → methods) for secure main/renderer communication
- **Session Mapping**: Both frontend and backend maintain session maps for multi-character support
- **Event Bus**: Custom DOM-based event system using `CustomEvent` for component communication
- **Web Components**: Vanilla custom elements extending `HTMLElement` with lifecycle management
- **Parser Architecture**: Stateful parser consuming game text streams and producing structured DOM

### Game Text Processing Flow
1. **TCP Stream**: Raw game text received from Lich via WebSocket
2. **Parser** (`parser/parser.ts`): Tokenizes XML-like tags and text into structured `GameTag` objects
3. **DOM Rendering**: Components subscribe to parsed events and update their display
4. **Highlighting**: Text is processed through highlight groups with configurable CSS styling

### Session Detection & Connection
- **Auto-detection**: Scans `/tmp/simutronics/sessions/` for Lich session descriptors
- **Manual connection**: `:connect <name> <port>` command for explicit session creation
- **Multi-session**: Multiple characters supported simultaneously with alt+# switching

## Development Notes

### Package Management
- Uses Yarn 4.5.3 (specified in volta config: Node 22.11.0)
- Electron Forge with Vite plugin for build tooling and packaging
- Vite for bundling with SCSS support

### Testing Setup
- Vitest test framework with TypeScript support
- Tests located in `/test/` directory
- Path alias `@` points to `src/` for imports
- Global test environment with Node.js runtime

### Debug Logging System
The project includes a structured debug logging system using the `debug` library for troubleshooting game events and data flow:

#### Available Debug Namespaces
- `illthorn:bus` - Bus event dispatching and subscriptions
- `illthorn:metadata` - XML metadata processing and event creation  
- `illthorn:raw-input` - Raw Lich input data before parsing
- `illthorn:effects` - Effects component event processing
- `illthorn:session` - Session-level message processing

#### Enabling Debug Logging (Opt-in Only)
**Browser Console** (for frontend debugging):
```javascript
localStorage.setItem('debug', 'illthorn:*');  // Enable all loggers
localStorage.setItem('debug', 'illthorn:bus,illthorn:metadata');  // Specific loggers
// Then refresh the page to see debug output
```

**Disabling Debug Logging**:
```javascript
localStorage.removeItem('debug');  // Remove debug setting
// Then refresh the page to stop debug output
```

**Check Current Debug State**:
```javascript
localStorage.getItem('debug');  // Returns current debug setting or null
```

**Environment Variable** (for development):
```bash
DEBUG=illthorn:* yarn start  # Enable all debug logging
DEBUG=illthorn:effects,illthorn:metadata yarn start  # Specific loggers
```

**Note**: Debug logging is disabled by default and must be explicitly enabled. If you're seeing unexpected debug output, check `localStorage.getItem('debug')` and remove it if needed.

#### Common Debug Patterns
- **Spell Effects Issues**: `DEBUG=illthorn:effects,illthorn:metadata,illthorn:bus`
- **Raw Input Analysis**: `DEBUG=illthorn:raw-input,illthorn:session`
- **Event Flow Debugging**: `DEBUG=illthorn:*`

### CLI Commands (User-facing)
Frontend commands prefixed with `:` (vim-style):
- `:theme <name>` - Switch themes (original, rogue, dark-king, icemule, kobold, raging-thrak)
- `:connect <name> <port>` or `:c` - Create new session
- `:focus <session>` or `:f` - Switch session focus
- `:set <path> <value>` - Configure settings (e.g., `clickable` boolean)
- `:ui <name> <state>` - Toggle UI panels (vitals, injuries, active-spells, compass)
- `:stream <name> <state>` - Toggle stream panels (thoughts, speech, logon, logoff, death)
- `:hilite add <group> <pattern>` - Add highlight patterns with regex
- `:hilite group <group> <property>=<value>` - Style highlight groups with CSS

### Lit Component Development Patterns

#### Component Structure
- Use `@customElement('illthorn-*-lit')` decorator for component registration
- Use `@property()` for reactive public properties
- Use `@state()` for internal reactive state
- Always include `declare global` interface for TypeScript support

#### Code Style Requirements
- **NEVER use single-line if statements** - always use block format with braces
- **Prefer Array<T> over T[]** for array type declarations
- Use descriptive property types: `@property({ type: Object })`, `@property({ type: Boolean })`
- Place static styles as first class member after decorators
- Use CSS custom properties for theming integration

#### Example Pattern
```typescript
// ABOUTME: Brief description of component purpose
// ABOUTME: Additional implementation details
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement('illthorn-example-lit')
export class ExampleLit extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    /* Theme-aware styling with CSS custom properties */
  `;

  @property({ type: String })
  title = '';

  @state()
  private _internalState = false;

  render() {
    return html`
      <div class="container">
        <h2>${this.title}</h2>
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-example-lit": ExampleLit;
  }
}
```

### Legacy Component Development Patterns (being migrated)
- Extend `HTMLElement` and use `customElements.define("illthorn-*", Class)`
- Implement `observedAttributes` and `attributeChangedCallback` for reactivity
- Use constructor for DOM creation and `connectedCallback` for initialization
- Subscribe to bus events for inter-component communication
- Maintain existing API compatibility when migrating components

## Project Validation Tools

### Project Type

Node.js/TypeScript Electron project

### Package Manager

- **Node.js**: `yarn`

### Validation Commands

- **Format**: `yarn format`
- **Lint**: `yarn lint`
- **Type Check**: `yarn typecheck`
- **Test**: `yarn test`

### Last Updated

2025-08-01

## Light DOM Component Styling Pattern

**IMPORTANT**: When creating Lit components that use Light DOM (`createRenderRoot() { return this; }`), special care is needed for CSS styling.

### The Problem
Light DOM components don't automatically inject their `static styles` CSS. Using `:host` selectors doesn't work properly with Light DOM.

### The Solution
1. **Change CSS selectors**: Replace `:host` with the actual component name
   ```css
   // ❌ Wrong (doesn't work with Light DOM)
   static styles = css`:host { display: grid; }`;
   
   // ✅ Correct (works with Light DOM)  
   static styles = css`illthorn-my-component { display: grid; }`;
   ```

2. **Add manual style adoption**:
   ```typescript
   private _adoptStyles() {
     if (!document.head.querySelector('style[data-lit-component="my-component"]')) {
       const style = document.createElement("style");
       style.setAttribute("data-lit-component", "my-component");
       style.textContent = MyComponent.styles.cssText;
       document.head.appendChild(style);
     }
   }
   ```

3. **Call in lifecycle method**:
   ```typescript
   connectedCallback() {
     super.connectedCallback();
     this._adoptStyles();
   }
   ```

### CSS Conflicts
Beware of CSS specificity conflicts with old layout styles. ID selectors (`#app`) override element selectors (`illthorn-app-lit`). Use `!important` or disable conflicting old styles.

### Components Using This Pattern
- `AppRoot` (`components/app.lit.ts`)
- `SessionsMenu` (`components/sessions-menu.lit.ts`) 
- `SessionButton` (`components/session/session-button.lit.ts`)
- `SessionLayout` (`components/session-layout.lit.ts`)