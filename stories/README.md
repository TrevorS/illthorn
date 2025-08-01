# Illthorn Storybook

This directory contains Storybook configuration and utilities for developing Illthorn components in isolation.

## Getting Started

```bash
# Start Storybook development server
yarn storybook

# Build static Storybook
yarn build-storybook

# Serve built Storybook
yarn storybook:serve
```

## Directory Structure

```
stories/
├── mocks/                  # Mock utilities for stories
│   ├── storybook-session.ts  # Enhanced session mocking
│   ├── game-data.ts          # Game data generators
│   └── index.ts              # Centralized exports
└── README.md               # This file

.storybook/
├── main.ts                 # Storybook configuration
└── preview.ts              # Global decorators and setup
```

## Mock System

The mock system provides realistic game data for component testing:

### StorybookSessionMock

Enhanced session mocking with event simulation:

```typescript
import { StorybookSessionMock } from '../stories/mocks';

// Create a mock session
const session = StorybookSessionMock.create();

// Emit game events
StorybookSessionMock.emitEvent('metadata/progressBar/health', {
  attrs: { value: '85', text: '85/100' }
});

// Simulate delayed events
StorybookSessionMock.simulateGameEvent('progressBar/mana', data, 200);
```

### StorybookGameData

Game data generators for common scenarios:

```typescript
import { StorybookGameData } from '../stories/mocks';

// Create vital updates
const healthUpdate = StorybookGameData.createVitalUpdate('health', 85, 100);

// Create spell effects
const spellEffect = StorybookGameData.createSpellEffect('Bless', 900);

// Use presets
const fullHealthData = StorybookGameData.presets.fullHealth.health();
```

## Writing Stories

Stories follow the Storybook 7.0+ format:

```typescript
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './my-component.lit';
import { StorybookSessionMock, StorybookGameData } from '../../../stories/mocks';

const meta: Meta = {
  title: 'Category/MyComponent',
  component: 'illthorn-my-component',
  parameters: {
    docs: {
      description: {
        component: 'Description of what this component does.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const session = StorybookSessionMock.create();
    return html`<illthorn-my-component .session=${session}></illthorn-my-component>`;
  },
};
```

## Component Categories

Stories are organized by category:

- **Session/Vitals/** - Health, mana, stamina display components
- **Session/Effects/** - Spell effect display components  
- **Session/Hands/** - Equipment and hand display components
- **Session/** - Other session-related components
- **Layout/** - Layout and container components

## Best Practices

1. **Use realistic data** - Leverage the mock system for authentic game scenarios
2. **Test edge cases** - Create stories for empty states, long text, critical values
3. **Interactive demos** - Use timers and intervals to show dynamic behavior
4. **Panel demos** - Show components in realistic container contexts
5. **Document component APIs** - Use argTypes to describe component properties

## Theme Integration

Storybook includes theme support through CSS custom properties. The preview uses dark theme by default to match the game client aesthetic.

## Development Workflow

1. Start Storybook: `yarn storybook`
2. Develop component in isolation
3. Create comprehensive stories covering all states
4. Test across different scenarios
5. Build and verify: `yarn build-storybook`