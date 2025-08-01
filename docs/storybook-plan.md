# Storybook Integration Plan for Illthorn

## Executive Summary

Illthorn is exceptionally well-positioned for Storybook integration. The current architecture with Electron + Vite 6 + Lit 3 + Shoelace 2.20 + TypeScript represents a modern, Storybook-friendly tech stack. With 20+ Lit components already developed and a robust mock system in place, integration will enhance development velocity and component reusability.

## Current Architecture Analysis

### ✅ Strengths for Storybook Integration
- **Modern Lit 3 Components**: Native Storybook 8.0+ support with 2-4x faster builds
- **Vite 6 Configuration**: Direct integration with Storybook's Vite builder
- **Shoelace 2.20**: Web component library perfect for Storybook showcases
- **Existing Mock System**: `createMockSession()` and test infrastructure ready for extension
- **Clean Component Architecture**: Bus system enables proper component isolation
- **TypeScript + Experimental Decorators**: Already configured correctly for Lit

### 🔧 Integration Challenges
- **Electron API Dependencies**: Components rely on `window.Session`, `window.App`, `window.Settings`
- **Bus System Integration**: Custom event system needs Storybook compatibility
- **Session State Management**: Components expect `FrontendSession` instances
- **CSS Custom Properties**: Theme system integration required

## Phase 1: Core Storybook Setup

### 1. Installation & Configuration

```bash
# Install Storybook with web-components framework
yarn add -D @storybook/web-components-vite @storybook/web-components
yarn add -D storybook

# Initialize Storybook
yarn storybook init --type web-components
```

### 2. Storybook Configuration

#### `.storybook/main.ts`
```typescript
import type { StorybookConfig } from '@storybook/web-components-vite';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../src/frontend/components/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-controls',
    '@storybook/addon-docs',
    '@storybook/addon-viewport',
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {}
  },
  
  async viteFinal(config) {
    const { mergeConfig } = await import('vite');
    
    // Reuse your existing Vite renderer configuration
    return mergeConfig(config, {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '../src'),
        },
      },
      define: {
        'process.env.SHOELACE_BASE_PATH': JSON.stringify('/node_modules/@shoelace-style/shoelace/dist/'),
      },
      css: {
        preprocessorOptions: {
          scss: {
            additionalData: ``, // Match your existing SCSS setup
          },
        },
      },
      esbuild: {
        target: 'ESNext',
        tsconfigRaw: {
          compilerOptions: {
            experimentalDecorators: true,
            useDefineForClassFields: false,
          },
        },
      },
    });
  },
};

export default config;
```

#### `.storybook/preview.ts`
```typescript
import type { Preview } from '@storybook/web-components';
import { html } from 'lit';

// Import Shoelace theme and components
import '@shoelace-style/shoelace/dist/themes/light.css';
import '@shoelace-style/shoelace/dist/themes/dark.css';

// Import your app styles
import '../src/frontend/styles/main.scss';
import '../src/frontend/styles/shoelace-theme.scss';

// Mock Electron APIs
const mockElectronAPI = {
  send: (channel: string, data: any) => console.log('Mock send:', channel, data),
  receive: (channel: string, func: Function) => console.log('Mock receive:', channel),
  invoke: (channel: string, ...args: any[]) => Promise.resolve('mock-response')
};

// Expose mocked APIs globally
(window as any).Session = {
  create: () => Promise.resolve('mock-session-id'),
  list: () => Promise.resolve([]),
  focus: () => Promise.resolve(),
};

(window as any).App = {
  getVersion: () => Promise.resolve('0.0.3-storybook'),
  quit: () => console.log('Mock quit'),
};

(window as any).Settings = {
  get: (key: string) => Promise.resolve(null),
  set: (key: string, value: any) => Promise.resolve(),
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      extractComponentDescription: (component, { notes }) => {
        if (notes) {
          return typeof notes === 'string' ? notes : notes.markdown || notes.text;
        }
        return null;
      },
    },
  },
  
  decorators: [
    (story) => html`
      <div class="storybook-wrapper" style="padding: 1rem;">
        ${story()}
      </div>
    `,
  ],
};

export default preview;
```

### 3. Package.json Scripts

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "storybook:serve": "npx http-server storybook-static"
  }
}
```

## Phase 2: Mock System Extension

### 1. Enhanced Session Mocking

#### `stories/mocks/storybook-session.ts`
```typescript
import type { FrontendSession } from '../../src/frontend/session/index';
import { createMockSession } from '../../test/mocks/index';

export class StorybookSessionMock {
  private static instance: any;
  
  static create(sessionId: string = 'storybook-session'): FrontendSession {
    if (!this.instance) {
      this.instance = createMockSession(sessionId);
      
      // Enhance with Storybook-specific features
      this.instance.bus.subscribeEvent = (eventName: string, callback: Function) => {
        console.log(`Storybook: Subscribed to ${eventName}`);
        return () => console.log(`Storybook: Unsubscribed from ${eventName}`);
      };
      
      this.instance.ui = {
        vitals: null,
        effects: null,
        compass: null,
        injuries: null,
      };
    }
    
    return this.instance;
  }
  
  static emitEvent(eventName: string, data: any) {
    console.log(`Storybook: Emitting ${eventName}`, data);
    // Trigger component updates in Storybook
    document.dispatchEvent(new CustomEvent(eventName, { detail: data }));
  }
}
```

### 2. Game Data Generators

#### `stories/mocks/game-data.ts`
```typescript
import type { GameTag } from '../../src/frontend/parser/tag';
import { makeTag } from '../../src/frontend/parser/tag';

export const StorybookGameData = {
  // Vital data generators
  createVitalUpdate(type: 'health' | 'mana' | 'stamina' | 'spirit' | 'mind', value: number, max: number): GameTag {
    return makeTag('progressBar', {
      id: type,
      value: value.toString(),
      text: `${value}/${max}`,
    });
  },
  
  // Spell effect generators
  createSpellEffect(name: string, duration: number): GameTag {
    return makeTag('spell', {
      value: name,
      duration: duration.toString(),
    });
  },
  
  // Injury data generators
  createInjury(location: string, severity: 'minor' | 'moderate' | 'major'): GameTag {
    return makeTag('injury', {
      location,
      severity,
    });
  },
  
  // Room description generator
  createRoom(title: string, description: string): GameTag {
    return makeTag('room', {
      title,
      description,
    });
  },
};
```

## Phase 3: Component Story Development

### 1. Isolated Component Stories

#### Example: `src/frontend/components/session/vitals/vitals.stories.ts`
```typescript
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './vitals.lit';
import { StorybookSessionMock, StorybookGameData } from '../../../../stories/mocks/index';

const meta: Meta = {
  title: 'Session/Vitals',
  component: 'illthorn-vitals-lit',
  parameters: {
    docs: {
      description: {
        component: 'Main vitals container that handles all session communication and coordinates vital display using VitalStat and VitalText components.',
      },
    },
  },
  argTypes: {
    session: { control: false },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const session = StorybookSessionMock.create();
    return html`<illthorn-vitals-lit .session=${session}></illthorn-vitals-lit>`;
  },
};

export const FullHealth: Story = {
  render: () => {
    const session = StorybookSessionMock.create();
    
    // Simulate full health data
    setTimeout(() => {
      StorybookSessionMock.emitEvent('metadata/progressBar/health', 
        StorybookGameData.createVitalUpdate('health', 100, 100)
      );
      StorybookSessionMock.emitEvent('metadata/progressBar/mana',
        StorybookGameData.createVitalUpdate('mana', 50, 80)
      );
    }, 100);
    
    return html`<illthorn-vitals-lit .session=${session}></illthorn-vitals-lit>`;
  },
};

export const CriticalHealth: Story = {
  render: () => {
    const session = StorybookSessionMock.create();
    
    setTimeout(() => {
      StorybookSessionMock.emitEvent('metadata/progressBar/health',
        StorybookGameData.createVitalUpdate('health', 15, 100)
      );
      StorybookSessionMock.emitEvent('metadata/progressBar/stamina',
        StorybookGameData.createVitalUpdate('stamina', 5, 90)
      );
    }, 100);
    
    return html`<illthorn-vitals-lit .session=${session}></illthorn-vitals-lit>`;
  },
};
```

### 2. Shoelace Component Showcases

#### `stories/shoelace/shoelace-showcase.stories.ts`
```typescript
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/progress-bar/progress-bar.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';

const meta: Meta = {
  title: 'Design System/Shoelace Components',
  parameters: {
    docs: {
      description: {
        component: 'Showcase of Shoelace components used throughout Illthorn.',
      },
    },
  },
};

export default meta;

export const ProgressBars: StoryObj = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <sl-progress-bar value="100" label="Full Health"></sl-progress-bar>
      <sl-progress-bar value="75" label="Good Mana"></sl-progress-bar>
      <sl-progress-bar value="25" label="Low Stamina"></sl-progress-bar>
      <sl-progress-bar value="0" label="No Spirit"></sl-progress-bar>
    </div>
  `,
};

export const ThemedButtons: StoryObj = {
  render: () => html`
    <div style="display: flex; gap: 1rem; align-items: center;">
      <sl-button variant="primary">Primary Action</sl-button>
      <sl-button variant="success">Connect</sl-button>
      <sl-button variant="warning">Disconnect</sl-button>
      <sl-button variant="danger">Quit</sl-button>
    </div>
  `,
};
```

### 3. Composite Component Stories

#### `src/frontend/components/session-layout.stories.ts`
```typescript
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './session-layout.lit';
import { StorybookSessionMock } from '../../../stories/mocks/index';

const meta: Meta = {
  title: 'Layout/SessionLayout',
  component: 'illthorn-session-layout-lit',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Main session layout component that orchestrates the entire game interface.',
      },
    },
  },
};

export default meta;

export const DefaultLayout: StoryObj = {
  render: () => {
    const session = StorybookSessionMock.create();
    return html`
      <div style="height: 100vh; width: 100vw;">
        <illthorn-session-layout-lit .session=${session}></illthorn-session-layout-lit>
      </div>
    `;
  },
};

export const WithMockData: StoryObj = {
  render: () => {
    const session = StorybookSessionMock.create();
    
    // Simulate rich game state
    setTimeout(() => {
      StorybookSessionMock.emitEvent('metadata/room', {
        title: 'Wehnimer\'s Landing, Town Square',
        description: 'The bustling town square of Wehnimer\'s Landing...',
      });
      
      StorybookSessionMock.emitEvent('metadata/progressBar/health',
        StorybookGameData.createVitalUpdate('health', 85, 100)
      );
    }, 100);
    
    return html`
      <div style="height: 100vh; width: 100vw;">
        <illthorn-session-layout-lit .session=${session}></illthorn-session-layout-lit>
      </div>
    `;
  },
};
```

## Phase 4: Advanced Integration Features

### 1. Theme System Integration

#### `.storybook/themes.ts`
```typescript
export const illthornThemes = [
  { name: 'Original', value: 'original' },
  { name: 'Dark King', value: 'dark-king' },
  { name: 'Rogue', value: 'rogue' },
  { name: 'Icemule', value: 'icemule' },
  { name: 'Kobold', value: 'kobold' },
  { name: 'Raging Thrak', value: 'raging-thrak' },
];

export const withTheme = (Story: any, context: any) => {
  const theme = context.globals.theme || 'original';
  
  // Apply theme CSS class to Storybook root
  document.documentElement.className = `theme-${theme}`;
  
  return Story();
};
```

Update `.storybook/preview.ts`:
```typescript
import { withTheme, illthornThemes } from './themes';

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Illthorn visual theme',
      defaultValue: 'original',
      toolbar: {
        icon: 'paintbrush',
        items: illthornThemes,
        showName: true,
      },
    },
  },
  
  decorators: [withTheme, ...existing decorators],
};
```

### 2. Interactive Controls Configuration

#### Enhanced story controls:
```typescript
export const InteractiveVitals: Story = {
  args: {
    health: 75,
    mana: 50,
    stamina: 90,
    spirit: 100,
    mind: 85,
  },
  argTypes: {
    health: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    mana: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    stamina: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    spirit: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    mind: { control: { type: 'range', min: 0, max: 100, step: 1 } },
  },
  render: (args) => {
    const session = StorybookSessionMock.create();
    
    // Update vitals based on controls
    setTimeout(() => {
      Object.entries(args).forEach(([vital, value]) => {
        if (typeof value === 'number') {
          StorybookSessionMock.emitEvent(`metadata/progressBar/${vital}`,
            StorybookGameData.createVitalUpdate(vital as any, value, 100)
          );
        }
      });
    }, 100);
    
    return html`<illthorn-vitals-lit .session=${session}></illthorn-vitals-lit>`;
  },
};
```

## Phase 5: Development Workflow Integration

### 1. Component Development Workflow

```bash
# Start Storybook for component development
yarn storybook

# Run component tests alongside Storybook
yarn test:watch

# Build and verify stories
yarn build-storybook
```

### 2. Automated Story Generation

#### `scripts/generate-story.js`
```javascript
// Script to generate boilerplate stories for new components
const fs = require('fs');
const path = require('path');

function generateStory(componentPath, componentName) {
  const storyTemplate = `
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './${componentName}.lit';
import { StorybookSessionMock } from '../../../stories/mocks/index';

const meta: Meta = {
  title: 'Components/${componentName}',
  component: 'illthorn-${componentName.toLowerCase()}-lit',
};

export default meta;

export const Default: StoryObj = {
  render: () => {
    const session = StorybookSessionMock.create();
    return html\`<illthorn-${componentName.toLowerCase()}-lit .session=\${session}></illthorn-${componentName.toLowerCase()}-lit>\`;
  },
};
`;

  fs.writeFileSync(
    path.join(componentPath, `${componentName}.stories.ts`),
    storyTemplate
  );
}
```

## Success Metrics & Benefits

### Immediate Benefits
- **Faster Component Development**: No Electron startup overhead
- **Visual Regression Testing**: Automated screenshot comparison
- **Component Documentation**: Self-documenting design system
- **Cross-team Collaboration**: Shareable component library

### Long-term Benefits
- **Design System Evolution**: Systematic component library growth
- **Quality Assurance**: Visual testing prevents UI regressions
- **Onboarding Acceleration**: New developers understand components quickly
- **Architecture Validation**: Component isolation reveals coupling issues

## Migration Strategy

### Week 1: Foundation
- Install and configure Storybook
- Create basic mock system
- Develop 3-5 isolated component stories

### Week 2: Core Components  
- Vitals, Effects, and Timer component stories
- Theme system integration
- Interactive controls implementation

### Week 3: Complex Components
- SessionLayout and composite component stories  
- Bus system mocking refinement
- Shoelace component showcases

### Week 4: Polish & Documentation
- Story documentation and examples
- Developer workflow documentation
- Performance optimization and CI integration

## Technical Considerations

### Performance
- **Vite Builder**: 2-4x faster than Webpack for Lit components
- **Lazy Loading**: Stories load components on-demand
- **Hot Module Replacement**: Instant story updates during development

### Maintenance
- **Aligned Dependencies**: Reuse existing Vite configuration
- **Mock Maintenance**: Extend existing test mock patterns
- **Component Parity**: Stories track component API changes automatically

### Integration Points
- **CI/CD**: Automated story builds and visual regression testing
- **Design Handoff**: Stories serve as living design specifications
- **Testing Strategy**: Complement existing Vitest test suite

## Component Priority List

Based on your existing components, recommended development order:

### Phase 1 (Isolated Components)
1. `VitalStat` and `VitalText` - Simple, self-contained
2. `SpellEffect` - Good for demonstrating data binding
3. `BaseTimer`, `CasttimeTimer`, `RoundtimeTimer` - Timer variations
4. `Hand` - Simple Shoelace integration example

### Phase 2 (Container Components)
5. `Vitals` - Coordinates multiple VitalStat components
6. `Hands` - Container for Hand components
7. `Effects` - Container for SpellEffect components
8. `Compass` - Room navigation component

### Phase 3 (Complex Components)
9. `Room` - Text content display
10. `Injuries` - Complex data visualization
11. `Feed` - Stream content handling
12. `Panel` - Collapsible container pattern

### Phase 4 (Layout Components)
13. `SessionLayout` - Full layout orchestration
14. `SessionsMenu` - Navigation component
15. `AppLit` - Root application component

This comprehensive plan leverages your excellent existing architecture while adding powerful component development and documentation capabilities through Storybook integration.