# Illthorn Input System Redesign Plan
## Storybook-Driven Component Development Strategy

## Executive Summary

This plan outlines a complete redesign of the Illthorn input system using a Storybook-first development approach. By building components in isolation with comprehensive stories, we ensure robust, well-tested components before system integration.

## Development Philosophy

### Storybook-First Approach
1. **Story Before Code**: Define component API through stories first
2. **Visual Testing**: Test all states and edge cases visually
3. **Documentation as Code**: Stories serve as living documentation
4. **Mock-Driven**: Build with realistic mock data before connecting to real events
5. **Composition Testing**: Test component interactions in story compositions

## Component Architecture

### Component Tree Structure

```
illthorn-input-system-lit (Container)
├── illthorn-input-status-bar-lit (Status & Room Info Bar)
│   ├── illthorn-mini-compass-lit (3x3 Compact Compass)
│   ├── illthorn-room-badge-lit (Room ID & Name Display)
│   └── illthorn-status-indicators-lit (RT/CT/Status Icons)
├── illthorn-command-line-lit (Main Input Line)
│   ├── illthorn-prompt-indicator-lit (Dynamic Prompt Symbol)
│   ├── illthorn-smart-input-lit (Enhanced Input Field)
│   └── illthorn-input-hints-lit (Context-Sensitive Hints)
└── illthorn-timer-rail-lit (Unified Timer Display)
    ├── RoundtimeTimer (Existing)
    └── CasttimeTimer (Existing)
```

## Storybook Development Plan

### Phase 1: Atomic Components (Bottom-Up)

#### 1.1 illthorn-mini-compass-lit

**Story File**: `mini-compass.stories.ts`

**Stories to Create**:
```typescript
export default {
  title: 'Input System/Mini Compass',
  component: 'illthorn-mini-compass-lit',
  argTypes: {
    activeDirections: {
      control: { type: 'check' },
      options: ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw', 'up', 'down', 'out'],
    },
    size: {
      control: { type: 'radio' },
      options: ['small', 'medium', 'large'],
    },
    interactive: {
      control: 'boolean',
    }
  }
};

// Stories:
export const Default = {};
export const AllDirectionsActive = { args: { activeDirections: ['n','ne','e','se','s','sw','w','nw'] }};
export const CardinalOnly = { args: { activeDirections: ['n','e','s','w'] }};
export const WithVertical = { args: { activeDirections: ['up', 'down', 'out'] }};
export const Interactive = { args: { interactive: true }};
export const Sizes = {
  render: () => html`
    <div style="display: flex; gap: 20px; align-items: center;">
      <illthorn-mini-compass-lit size="small"></illthorn-mini-compass-lit>
      <illthorn-mini-compass-lit size="medium"></illthorn-mini-compass-lit>
      <illthorn-mini-compass-lit size="large"></illthorn-mini-compass-lit>
    </div>
  `
};
```

**Mock Data Structure**:
```typescript
interface CompassMockData {
  activeDirections: string[];
  specialExits?: string[]; // 'gate', 'path', 'door'
  blockedDirections?: string[]; // web, ice, etc
}
```

**Visual States to Test**:
- Empty (no exits)
- Full (all directions)
- Partial (realistic room)
- Hover states
- Click feedback
- Disabled state
- Loading state

#### 1.2 illthorn-room-badge-lit

**Story File**: `room-badge.stories.ts`

**Stories to Create**:
```typescript
export default {
  title: 'Input System/Room Badge',
  component: 'illthorn-room-badge-lit',
  argTypes: {
    roomId: { control: 'text' },
    roomTitle: { control: 'text' },
    roomZone: {
      control: { type: 'select' },
      options: ['town', 'wilderness', 'dungeon', 'special'],
    },
    maxWidth: {
      control: { type: 'range', min: 50, max: 500, step: 10 }
    },
    showTooltip: { control: 'boolean' }
  }
};

// Stories:
export const Default = { args: { roomId: '7120', roomTitle: 'Town Square Central' }};
export const LongName = { args: {
  roomId: '12345',
  roomTitle: 'The Grand Hall of the Ancient Dwarven Kings of the Eastern Mountain Range'
}};
export const TruncationTest = {
  render: (args) => html`
    <div style="width: 200px; border: 1px dashed #666;">
      <illthorn-room-badge-lit
        room-id="7120"
        room-title="The Grand Hall of the Ancient Dwarven Kings"
        max-width="200">
      </illthorn-room-badge-lit>
    </div>
  `
};
export const ZoneColors = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 10px;">
      <illthorn-room-badge-lit room-zone="town" room-title="Town Square"></illthorn-room-badge-lit>
      <illthorn-room-badge-lit room-zone="wilderness" room-title="Forest Path"></illthorn-room-badge-lit>
      <illthorn-room-badge-lit room-zone="dungeon" room-title="Dark Cavern"></illthorn-room-badge-lit>
      <illthorn-room-badge-lit room-zone="special" room-title="The Rift"></illthorn-room-badge-lit>
    </div>
  `
};
```

**Truncation Algorithm Testing**:
```typescript
export const TruncationAlgorithm = {
  render: () => {
    const testCases = [
      "Town Square Central",
      "The Grand Hall of Kings",
      "A Very Long Room Name That Should Be Truncated Intelligently",
      "[Warden's Office, Hallway]",
      "Room with (Special Characters) and [Brackets]"
    ];

    return html`
      ${testCases.map(name => html`
        <div style="display: grid; grid-template-columns: 150px 200px 300px; gap: 10px; margin: 10px 0;">
          ${[150, 200, 300].map(width => html`
            <div style="width: ${width}px; border: 1px solid #333;">
              <illthorn-room-badge-lit
                room-title="${name}"
                max-width="${width}">
              </illthorn-room-badge-lit>
            </div>
          `)}
        </div>
      `)}
    `;
  }
};
```

#### 1.3 illthorn-prompt-indicator-lit

**Story File**: `prompt-indicator.stories.ts`

**Stories to Create**:
```typescript
export default {
  title: 'Input System/Prompt Indicator',
  component: 'illthorn-prompt-indicator-lit',
  argTypes: {
    state: {
      control: { type: 'select' },
      options: ['normal', 'roundtime', 'casting', 'stunned', 'dead', 'sleeping'],
    },
    animated: { control: 'boolean' },
    customSymbol: { control: 'text' }
  }
};

// Stories with animations and state transitions
export const StateTransitions = {
  render: () => {
    let currentState = 'normal';
    const states = ['normal', 'roundtime', 'casting', 'stunned'];

    return html`
      <illthorn-prompt-indicator-lit
        id="indicator"
        state="${currentState}"
        animated>
      </illthorn-prompt-indicator-lit>
      <button @click=${() => {/* cycle states */}}>Next State</button>
    `;
  }
};

export const AllStates = {
  render: () => html`
    <style>
      .prompt-grid {
        display: grid;
        grid-template-columns: 100px 50px 1fr;
        gap: 10px;
        align-items: center;
      }
    </style>
    <div class="prompt-grid">
      <span>Normal:</span>
      <illthorn-prompt-indicator-lit state="normal"></illthorn-prompt-indicator-lit>
      <code>Ready for input</code>

      <span>Roundtime:</span>
      <illthorn-prompt-indicator-lit state="roundtime" animated></illthorn-prompt-indicator-lit>
      <code>RT active (3s remaining)</code>

      <span>Casting:</span>
      <illthorn-prompt-indicator-lit state="casting" animated></illthorn-prompt-indicator-lit>
      <code>Spell in progress</code>

      <span>Stunned:</span>
      <illthorn-prompt-indicator-lit state="stunned"></illthorn-prompt-indicator-lit>
      <code>Character stunned</code>

      <span>Dead:</span>
      <illthorn-prompt-indicator-lit state="dead"></illthorn-prompt-indicator-lit>
      <code>Character dead</code>
    </div>
  `
};
```

### Phase 2: Composite Components

#### 2.1 illthorn-input-status-bar-lit

**Story File**: `input-status-bar.stories.ts`

**Composition Story**:
```typescript
export default {
  title: 'Input System/Status Bar',
  component: 'illthorn-input-status-bar-lit',
};

// Mock session data for testing
const mockSessionData = {
  room: {
    id: '7120',
    title: 'Town Square Central',
    zone: 'town',
  },
  navigation: {
    exits: ['n', 'e', 's', 'w', 'ne', 'nw'],
    special: ['gate', 'shop'],
  },
  status: {
    roundtime: 0,
    casttime: 0,
    mindState: 'clear',
    stance: 'defensive'
  }
};

export const Default = {
  args: {
    sessionData: mockSessionData
  }
};

export const ResponsiveWidths = {
  render: () => html`
    <style>
      .width-test {
        border: 1px solid #666;
        margin: 10px 0;
        padding: 5px;
      }
    </style>
    ${[400, 600, 800, 1200, 1600].map(width => html`
      <div class="width-test" style="width: ${width}px;">
        <div style="font-size: 12px; color: #666;">Width: ${width}px</div>
        <illthorn-input-status-bar-lit
          .sessionData=${mockSessionData}>
        </illthorn-input-status-bar-lit>
      </div>
    `)}
  `
};

export const DifferentStates = {
  render: () => {
    const states = [
      { title: "Combat", room: "Arena", exits: ['out'], roundtime: 5, stance: 'offensive' },
      { title: "Town", room: "Town Square", exits: ['n','e','s','w','ne','nw','se','sw'], mindState: 'clear' },
      { title: "Dungeon", room: "Dark Cavern", exits: ['n','s','up'], zone: 'dungeon' },
      { title: "No Exits", room: "Prison Cell", exits: [], mindState: 'confused' }
    ];

    return html`
      ${states.map(state => html`
        <div style="margin: 20px 0;">
          <h4>${state.title}</h4>
          <illthorn-input-status-bar-lit .sessionData=${state}></illthorn-input-status-bar-lit>
        </div>
      `)}
    `;
  }
};
```

#### 2.2 illthorn-command-line-lit

**Story File**: `command-line.stories.ts`

**Interactive Testing Story**:
```typescript
export default {
  title: 'Input System/Command Line',
  component: 'illthorn-command-line-lit',
  parameters: {
    docs: {
      description: {
        component: 'Enhanced command input with prompt indicator, smart suggestions, and history'
      }
    }
  }
};

// Test command history
const mockCommandHistory = [
  'look',
  'go north',
  'attack goblin',
  'cast 401',
  'search',
  'get all',
  'put sword in backpack'
];

export const Interactive = {
  render: () => {
    // Create mock event handlers
    const handleCommand = (e) => {
      console.log('Command submitted:', e.detail);
      // Add visual feedback
    };

    return html`
      <illthorn-command-line-lit
        @command-submit=${handleCommand}
        .commandHistory=${mockCommandHistory}
        .promptState=${'normal'}>
      </illthorn-command-line-lit>

      <div style="margin-top: 20px; padding: 10px; background: #222;">
        <h4>Keyboard Shortcuts to Test:</h4>
        <ul>
          <li>↑/↓ - Navigate history</li>
          <li>Ctrl+A - Select all</li>
          <li>Ctrl+K - Clear</li>
          <li>Tab - Autocomplete</li>
          <li>Ctrl+R - Repeat last</li>
        </ul>
      </div>
    `;
  }
};

export const WithSuggestions = {
  render: () => {
    const suggestions = [
      { command: 'look', description: 'Examine your surroundings' },
      { command: 'look in', description: 'Look inside container' },
      { command: 'look at', description: 'Examine specific item' },
      { command: 'look behind', description: 'Look behind object' }
    ];

    return html`
      <illthorn-command-line-lit
        .suggestions=${suggestions}
        .value=${'lo'}>
      </illthorn-command-line-lit>
    `;
  }
};

export const DifferentPromptStates = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 15px;">
      ${['normal', 'roundtime', 'casting', 'stunned', 'dead'].map(state => html`
        <div>
          <label style="display: block; margin-bottom: 5px; font-size: 12px; color: #999;">
            State: ${state}
          </label>
          <illthorn-command-line-lit .promptState=${state}></illthorn-command-line-lit>
        </div>
      `)}
    </div>
  `
};
```

### Phase 3: Container Integration

#### 3.1 illthorn-input-system-lit

**Story File**: `input-system.stories.ts`

**Complete System Story**:
```typescript
export default {
  title: 'Input System/Complete System',
  component: 'illthorn-input-system-lit',
  parameters: {
    layout: 'fullscreen',
  }
};

// Create comprehensive mock session
class MockSession {
  constructor() {
    this.bus = new MockEventBus();
    this.commandHistory = [];
    this.state = {
      room: { id: '7120', title: 'Town Square Central' },
      exits: ['n', 'e', 's', 'w'],
      roundtime: 0,
      casttime: 0
    };
  }

  send(command) {
    console.log('Command sent:', command);
    this.commandHistory.push(command);

    // Simulate responses
    if (command === 'look') {
      setTimeout(() => {
        this.bus.emit('room-description', { text: 'You are in Town Square...' });
      }, 100);
    }
  }
}

export const FullIntegration = {
  render: () => {
    const mockSession = new MockSession();

    return html`
      <div style="height: 100vh; display: flex; flex-direction: column;">
        <div style="flex: 1; overflow: auto; padding: 20px; background: #1a1a1a;">
          <!-- Simulated game output area -->
          <div id="game-output" style="font-family: monospace; color: #0f0;">
            <p>Welcome to GemStone IV!</p>
            <p>You are in Town Square Central.</p>
            <p>Obvious exits: north, east, south, west</p>
          </div>
        </div>

        <illthorn-input-system-lit
          .session=${mockSession}>
        </illthorn-input-system-lit>
      </div>
    `;
  }
};

export const ResponsiveTest = {
  parameters: {
    viewport: {
      defaultViewport: 'responsive'
    }
  },
  render: () => html`
    <style>
      .device-frame {
        border: 2px solid #333;
        border-radius: 8px;
        padding: 10px;
        margin: 20px;
        background: #000;
      }
      .device-label {
        text-align: center;
        color: #666;
        font-size: 12px;
        margin-bottom: 10px;
      }
    </style>

    ${[
      { name: 'Mobile', width: 375 },
      { name: 'Tablet', width: 768 },
      { name: 'Laptop', width: 1366 },
      { name: 'Desktop', width: 1920 }
    ].map(device => html`
      <div class="device-frame" style="width: ${device.width}px;">
        <div class="device-label">${device.name} (${device.width}px)</div>
        <illthorn-input-system-lit></illthorn-input-system-lit>
      </div>
    `)}
  `
};

export const StateSimulation = {
  render: () => {
    // Create interactive state controls
    return html`
      <div style="display: grid; grid-template-columns: 200px 1fr; height: 100vh;">
        <div style="background: #2a2a2a; padding: 20px;">
          <h3>State Controls</h3>

          <label>
            <input type="checkbox" id="roundtime-toggle">
            Roundtime Active
          </label>

          <label>
            <input type="checkbox" id="casting-toggle">
            Casting Active
          </label>

          <label>
            Room:
            <select id="room-select">
              <option>Town Square</option>
              <option>Dark Forest</option>
              <option>Dungeon</option>
            </select>
          </label>

          <button @click=${() => {/* simulate combat */}}>
            Simulate Combat
          </button>
        </div>

        <div style="display: flex; flex-direction: column;">
          <div style="flex: 1; background: #1a1a1a; padding: 20px;">
            <!-- Game output -->
          </div>
          <illthorn-input-system-lit id="input-system"></illthorn-input-system-lit>
        </div>
      </div>
    `;
  }
};
```

### Phase 4: Testing Stories

#### 4.1 Edge Cases & Error States

**Story File**: `input-system-edge-cases.stories.ts`

```typescript
export const EdgeCases = {
  title: 'Input System/Edge Cases',
};

export const NoExits = {
  name: 'Trapped Room (No Exits)',
  render: () => html`
    <illthorn-input-system-lit
      .sessionData=${{ exits: [], room: { title: "Prison Cell" }}}>
    </illthorn-input-system-lit>
  `
};

export const VeryLongInput = {
  name: 'Maximum Length Input',
  render: () => {
    const longCommand = 'say ' + 'This is a very long message that might exceed the normal limits of what someone would type in the game but we need to test it anyway to ensure the UI doesn\'t break. '.repeat(5);

    return html`
      <illthorn-command-line-lit .value=${longCommand}></illthorn-command-line-lit>
    `;
  }
};

export const RapidStateChanges = {
  name: 'Rapid State Changes (Performance Test)',
  render: () => {
    // Test rapid updates
    let component;

    const startRapidUpdates = () => {
      setInterval(() => {
        if (component) {
          component.sessionData = {
            ...component.sessionData,
            exits: generateRandomExits(),
            room: { id: Math.random() * 10000, title: generateRandomRoom() }
          };
        }
      }, 100);
    };

    return html`
      <illthorn-input-system-lit
        ${ref(el => component = el)}>
      </illthorn-input-system-lit>
      <button @click=${startRapidUpdates}>Start Rapid Updates</button>
    `;
  }
};
```

## Development Workflow

### Step-by-Step Implementation

#### Step 1: Story-First Development
1. Create story file with all planned stories
2. Define args and controls
3. Write stories with mock data
4. Run Storybook to visualize desired behavior

#### Step 2: Component Implementation
1. Create component file
2. Implement render method to match story expectations
3. Add reactive properties matching story args
4. Implement visual states

#### Step 3: Styling and Theme Integration
1. Add CSS with theme variables
2. Test with different themes in Storybook
3. Add responsive styles
4. Test accessibility

#### Step 4: Event Handling
1. Add event listeners
2. Implement keyboard shortcuts
3. Add ARIA attributes
4. Test with screen reader

#### Step 5: Integration
1. Connect to session events
2. Replace mock data with real data
3. Test with live game connection
4. Performance profiling

### Mock Data Generators

```typescript
// utils/mock-data.ts
export class MockDataGenerator {
  static generateRoom() {
    const rooms = [
      { id: '7120', title: 'Town Square Central', zone: 'town' },
      { id: '1234', title: 'Dark Forest Path', zone: 'wilderness' },
      { id: '5678', title: 'Cavern Entrance', zone: 'dungeon' }
    ];
    return rooms[Math.floor(Math.random() * rooms.length)];
  }

  static generateExits() {
    const allExits = ['n','ne','e','se','s','sw','w','nw','up','down','out'];
    const count = Math.floor(Math.random() * 6) + 1;
    return allExits.slice(0, count);
  }

  static generatePromptState() {
    const states = ['normal', 'roundtime', 'casting', 'stunned'];
    return states[Math.floor(Math.random() * states.length)];
  }

  static generateSessionData() {
    return {
      room: this.generateRoom(),
      exits: this.generateExits(),
      promptState: this.generatePromptState(),
      roundtime: Math.random() > 0.7 ? Math.floor(Math.random() * 10) : 0,
      casttime: Math.random() > 0.8 ? Math.floor(Math.random() * 5) : 0
    };
  }
}
```

### Storybook Configuration

```typescript
// .storybook/preview.ts
export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  themes: {
    default: 'dark',
    list: [
      { name: 'dark', class: 'theme-dark', color: '#1a1a1a' },
      { name: 'light', class: 'theme-light', color: '#ffffff' },
      { name: 'kobold', class: 'theme-kobold', color: '#2a1a4a' }
    ]
  }
};

// Custom decorators for input system stories
export const decorators = [
  (Story) => html`
    <div style="
      min-height: 200px;
      padding: 20px;
      background: var(--color-background);
      color: var(--color-text-primary);
    ">
      ${Story()}
    </div>
  `
];
```

## Testing Strategy

### Visual Regression Testing
1. Capture screenshots of all stories
2. Test with different themes
3. Test responsive breakpoints
4. Test interaction states

### Unit Testing
```typescript
// test/components/input-system/mini-compass.spec.ts
describe('MiniCompass', () => {
  it('should render with no active directions', () => {
    const compass = new MiniCompass();
    expect(compass.activeDirections).toEqual([]);
  });

  it('should highlight active directions', () => {
    const compass = new MiniCompass();
    compass.activeDirections = ['n', 'e'];
    // Assert visual state
  });

  it('should emit click events when interactive', () => {
    const compass = new MiniCompass();
    compass.interactive = true;
    // Test click handling
  });
});
```

### Integration Testing
```typescript
// test/components/input-system/integration.spec.ts
describe('Input System Integration', () => {
  it('should update compass on room change', () => {
    const system = new InputSystem();
    const mockSession = createMockSession();
    system.session = mockSession;

    mockSession.bus.emit('metadata/compass', { exits: ['n', 's'] });

    // Assert compass updated
  });
});
```

## Performance Metrics

### Target Metrics
- First render: < 50ms
- Re-render on state change: < 16ms
- Keyboard input latency: < 10ms
- Memory usage: < 10MB
- Bundle size contribution: < 50KB

### Performance Stories
```typescript
export const PerformanceTest = {
  render: () => {
    const metrics = {
      renders: 0,
      avgRenderTime: 0,
      maxRenderTime: 0
    };

    // Performance monitoring code

    return html`
      <illthorn-input-system-lit></illthorn-input-system-lit>
      <div style="position: fixed; top: 10px; right: 10px; background: rgba(0,0,0,0.8); padding: 10px;">
        <div>Renders: ${metrics.renders}</div>
        <div>Avg: ${metrics.avgRenderTime}ms</div>
        <div>Max: ${metrics.maxRenderTime}ms</div>
      </div>
    `;
  }
};
```

## Documentation Stories

### Interactive Documentation
```typescript
export const Documentation = {
  render: () => html`
    <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1>Input System Components</h1>

      <section>
        <h2>Mini Compass</h2>
        <p>Displays available movement directions in a compact 3x3 grid.</p>
        <illthorn-mini-compass-lit
          .activeDirections=${['n', 'e', 's', 'w']}>
        </illthorn-mini-compass-lit>
      </section>

      <section>
        <h2>Room Badge</h2>
        <p>Shows current room ID and title with smart truncation.</p>
        <illthorn-room-badge-lit
          room-id="7120"
          room-title="Town Square Central">
        </illthorn-room-badge-lit>
      </section>

      <section>
        <h2>Complete System</h2>
        <p>Full input system with all components integrated.</p>
        <illthorn-input-system-lit></illthorn-input-system-lit>
      </section>
    </div>
  `
};
```

## Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Set up Storybook configuration for input system
- [ ] Create story files for all components
- [ ] Implement mock data generators
- [ ] Create basic story templates

### Phase 2: Atomic Components (Week 2)
- [ ] Build mini-compass with stories
- [ ] Build room-badge with stories
- [ ] Build prompt-indicator with stories
- [ ] Build status-indicators with stories
- [ ] Create visual regression tests

### Phase 3: Composite Components (Week 3)
- [ ] Build input-status-bar
- [ ] Build command-line component
- [ ] Build timer-rail component
- [ ] Create interaction stories
- [ ] Add keyboard navigation

### Phase 4: Integration (Week 4)
- [ ] Build input-system container
- [ ] Connect to session events
- [ ] Add responsive behaviors
- [ ] Performance optimization
- [ ] Accessibility testing

### Phase 5: Polish & Deploy (Week 5)
- [ ] Theme integration testing
- [ ] Documentation stories
- [ ] Performance profiling
- [ ] Migration from old system
- [ ] Production deployment

## Success Metrics

### Development Metrics
- All components have 100% story coverage
- Each component has at least 5 visual states tested
- All interactive features demonstrated in stories
- Documentation stories for onboarding

### Quality Metrics
- Zero console errors in all stories
- All stories pass visual regression tests
- Keyboard navigation fully functional
- Screen reader compatibility verified

### Performance Metrics
- Stories load in < 1 second
- Hot reload in < 500ms
- Story switching < 200ms
- No memory leaks in long-running stories

## Conclusion

This Storybook-driven approach ensures we build robust, well-tested components in isolation before integration. By developing stories first, we define clear component APIs and test all edge cases visually. The comprehensive story suite serves as both documentation and a testing ground for the new input system.

The modular architecture allows for incremental development and easy maintenance. Each component can be developed, tested, and refined independently, ensuring a high-quality user experience when integrated into the full Illthorn application.