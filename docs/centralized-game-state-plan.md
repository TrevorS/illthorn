# Centralized Game State Architecture Plan

## Executive Summary

### Problem Statement

Illthorn's current component-level state management causes **critical UX issues during development**:

- **HMR State Loss**: Hot Module Replacement breaks all component state, causing UI to "blink" and disconnect from game
- **Scattered State**: 20+ `@state()` properties across components make debugging and inspection difficult
- **Tight Coupling**: Components directly subscribe to bus events and manage their own data transformation
- **No Single Source of Truth**: Game state is distributed across many component instances

### Solution Overview

**Centralized Game State Architecture**: Move from component-level state management to a centralized game state store with pure presentation components.

```
Current:  Game XML → Parser → Bus Events → Component Handlers → @state() → UI
Proposed: Game XML → Parser → Game State Store → UI State Derivation → Component Props → UI
```

### Key Benefits

1. **HMR Resilience**: State reconstructed from persistent game data, eliminating UI disconnections
2. **Single Source of Truth**: All game state in one inspectable location
3. **Pure Components**: Easier testing, no side effects, better performance
4. **Better Debugging**: Complete game state tree available for inspection
5. **Architecture Clarity**: Clear separation between data management and presentation

## Current Architecture Analysis

### Component State Distribution

**Components with `@state()` management**:
- `VitalsContainer`: 7 vital state properties (health, mana, stamina, spirit, mind, stance, encumbrance)
- `InjuriesContainer`: Injuries array and processing state
- `EffectsContainer`: Active spells/effects array
- `CompassContainer`: Direction data and visibility state
- `HandsContainer`: Left/right hand state and spell preparation
- `RoomContainer`: Room description and title state
- `FeedContainer`: Message history and scroll state
- `StreamsContainer`: Stream panel visibility and content
- `SessionButton`: Connection state and activity indicators

### Current Event Flow

```typescript
// 1. XML arrives at session
session.onMessage(xml) 

// 2. Parser creates GameTags
const parsed = this.parser.parse(xml)

// 3. Metadata dispatcher creates bus events
dispatchMetadata(session, tag) // → session.bus.dispatchEvent("metadata/progressBar/health", tag)

// 4. Components subscribe and manage state
bus.subscribeEvent("metadata/progressBar/health", (event) => {
  this._health = this.processStandardVital(event.detail); // @state() update
});
```

### HMR Impact Assessment

When HMR triggers:
1. **Component Modules Replaced**: All Lit component classes are recreated
2. **State Reset**: All `@state()` properties return to their initial values
3. **Event Handlers Reset**: `updated()` re-subscribes to events but doesn't restore state
4. **UI Disconnection**: Components show default/empty state until new game events arrive

**Why Game Log/Command Bar Work**: They use vanilla DOM manipulation or session-level persistence, not component-level `@state()`.

## Proposed Architecture

### 1. Centralized Game State Store

```typescript
// src/frontend/session/game-state.ts
export interface GameState {
  // Character vitals
  vitals: {
    health: VitalData;
    mana: VitalData;
    stamina: VitalData;
    spirit: VitalData;
    mind: VitalData;
    stance: VitalData;
    encumbrance: VitalData;
  };
  
  // Character status
  injuries: Array<InjuryData>;
  effects: Array<SpellEffectData>;
  
  // Environment
  room: {
    title: string;
    description: string;
    exits: Array<DirectionData>;
  };
  
  // Equipment
  hands: {
    left: HandData | null;
    right: HandData | null;
    spell: string | null;
  };
  
  // UI state
  compass: {
    visible: boolean;
    directions: Array<DirectionData>;
  };
}

export interface VitalData {
  label: string;
  value?: string;
  percent?: number;
  text?: string;
}

export interface InjuryData {
  part: string;
  severity: number;
  description: string;
}

export interface SpellEffectData {
  id: string;
  name: string;
  duration: number;
  percent: number;
}

export class GameStateStore {
  private _state: GameState;
  private _listeners: Array<(state: GameState) => void> = [];
  
  constructor() {
    this._state = this.createDefaultState();
  }
  
  get state(): Readonly<GameState> {
    return this._state;
  }
  
  updateVital(vitalType: keyof GameState['vitals'], data: VitalData) {
    this._state.vitals[vitalType] = data;
    this.notifyListeners();
  }
  
  updateInjuries(injuries: Array<InjuryData>) {
    this._state.injuries = injuries;
    this.notifyListeners();
  }
  
  updateEffects(effects: Array<SpellEffectData>) {
    this._state.effects = effects;
    this.notifyListeners();
  }
  
  subscribe(listener: (state: GameState) => void): () => void {
    this._listeners.push(listener);
    return () => {
      const index = this._listeners.indexOf(listener);
      if (index >= 0) this._listeners.splice(index, 1);
    };
  }
  
  private notifyListeners() {
    this._listeners.forEach(listener => listener(this._state));
  }
  
  private createDefaultState(): GameState {
    return {
      vitals: {
        health: { label: "health" },
        mana: { label: "mana" },
        stamina: { label: "stamina" },
        spirit: { label: "spirit" },
        mind: { label: "mind" },
        stance: { label: "stance", value: "offensive", percent: 0 },
        encumbrance: { label: "encumbrance", value: "none", percent: 0 },
      },
      injuries: [],
      effects: [],
      room: { title: "", description: "", exits: [] },
      hands: { left: null, right: null, spell: null },
      compass: { visible: true, directions: [] },
    };
  }
}
```

### 2. UI State Derivation Layer

```typescript
// src/frontend/session/ui-state.ts
export interface VitalsProps {
  health: VitalData;
  mana: VitalData;
  stamina: VitalData;
  spirit: VitalData;
  mind: VitalData;
  stance: VitalData;
  encumbrance: VitalData;
}

export interface InjuriesProps {
  injuries: Array<ProcessedInjury>;
  hasInjuries: boolean;
}

export interface EffectsProps {
  effects: Array<ProcessedEffect>;
  hasEffects: boolean;
}

// Pure functions that derive UI-ready props from game state
export function deriveVitalsProps(gameState: GameState): VitalsProps {
  return {
    health: gameState.vitals.health,
    mana: gameState.vitals.mana,
    stamina: gameState.vitals.stamina,
    spirit: gameState.vitals.spirit,
    mind: gameState.vitals.mind,
    stance: gameState.vitals.stance,
    encumbrance: gameState.vitals.encumbrance,
  };
}

export function deriveInjuriesProps(gameState: GameState): InjuriesProps {
  // Business logic: pair left/right injuries, sort anatomically, etc.
  const processedInjuries = processInjuryPairing(gameState.injuries);
  
  return {
    injuries: processedInjuries,
    hasInjuries: processedInjuries.length > 0,
  };
}

export function deriveEffectsProps(gameState: GameState): EffectsProps {
  // Business logic: sort by duration, group by type, etc.
  const processedEffects = gameState.effects.map(effect => ({
    ...effect,
    timeRemaining: formatDuration(effect.duration),
    isExpiring: effect.percent < 10,
  }));
  
  return {
    effects: processedEffects,
    hasEffects: processedEffects.length > 0,
  };
}

// UI state derivation orchestrator
export class UIStateManager {
  constructor(private gameState: GameStateStore) {}
  
  deriveAllUIState(): {
    vitals: VitalsProps;
    injuries: InjuriesProps;
    effects: EffectsProps;
    // ... other UI state
  } {
    const state = this.gameState.state;
    
    return {
      vitals: deriveVitalsProps(state),
      injuries: deriveInjuriesProps(state),
      effects: deriveEffectsProps(state),
    };
  }
}
```

### 3. Integration with Session

```typescript
// src/frontend/session/index.ts
export class FrontendSession {
  readonly parser: XMLParser;
  readonly bus: Bus;
  readonly gameState: GameStateStore; // New
  readonly uiState: UIStateManager;   // New
  
  constructor(readonly config: Illthorn.Session.Config) {
    this.parser = ParserFactory.create();
    this.bus = new Bus();
    this.gameState = new GameStateStore(); // New
    this.uiState = new UIStateManager(this.gameState); // New
    
    // Subscribe to game state changes and emit UI state via bus
    this.gameState.subscribe((gameState) => {
      this.emitUIStateEvents(gameState);
    });
  }
  
  private emitUIStateEvents(gameState: GameState) {
    const uiState = this.uiState.deriveAllUIState();
    
    // Emit derived UI state via bus (backward compatibility)
    this.bus.dispatchEvent("ui-state/vitals", uiState.vitals);
    this.bus.dispatchEvent("ui-state/injuries", uiState.injuries);
    this.bus.dispatchEvent("ui-state/effects", uiState.effects);
  }
}
```

### 4. Updated Metadata Dispatcher

```typescript
// src/frontend/session/helpers.ts
export function dispatchMetadata(session: Session, tag: GameTag) {
  // Update centralized game state
  updateGameState(session.gameState, tag);
  
  // Keep existing bus events for backward compatibility during migration
  const namespace = tag.attrs.id ? [tag.name, tag.attrs.id] : [tag.name];
  namespace.unshift("metadata");
  const eventName = namespace.join("/");
  session.bus.dispatchEvent(eventName, tag);
}

function updateGameState(gameState: GameStateStore, tag: GameTag) {
  switch (tag.name) {
    case "progressBar":
      if (tag.attrs.id && isVitalType(tag.attrs.id)) {
        const vitalData = parseVitalData(tag);
        gameState.updateVital(tag.attrs.id as keyof GameState['vitals'], vitalData);
      }
      break;
      
    case "dialogData":
      if (tag.attrs.id === "Active Spells") {
        const effects = parseSpellEffects(tag.children);
        gameState.updateEffects(effects);
      }
      if (tag.attrs.id === "injuries") {
        const injuries = parseInjuries(tag.children);
        gameState.updateInjuries(injuries);
      }
      break;
      
    case "compass":
      const directions = parseCompassDirections(tag.children);
      gameState.updateCompass(directions);
      break;
      
    // ... other game state updates
  }
}
```

## Component Refactoring Patterns

### Before: Stateful Container Components

```typescript
// OLD: src/frontend/components/session/vitals/vitals-container.lit.ts
@customElement("illthorn-vitals-container")
export class VitalsContainer extends LitElement {
  @property({ type: Object })
  session?: Session;

  @state()
  private _health: VitalData = { label: "health" };
  
  @state()
  private _mana: VitalData = { label: "mana" };
  
  // ... 5 more @state() properties

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    if (changedProperties.has("session")) {
      this._setupEventListeners(); // Subscribes to bus events
    }
  }

  private _setupEventListeners() {
    // 7 different bus.subscribeEvent() calls
    this.session.bus.subscribeEvent("metadata/progressBar/health", (event) => {
      this._health = this.processStandardVital(event.detail);
    });
    // ... more subscriptions
  }
  
  render() {
    return html`
      <illthorn-vitals-ui
        .vitals=${{
          health: this._health,
          mana: this._mana,
          // ... more state
        }}>
      </illthorn-vitals-ui>
    `;
  }
}
```

### After: Pure Presentation Components

```typescript
// NEW: src/frontend/components/session/vitals/vitals-container.lit.ts
@customElement("illthorn-vitals-container")
export class VitalsContainer extends LitElement {
  @property({ type: Object })
  session?: Session;

  @property({ type: Object })
  vitalsData?: VitalsProps; // Received from parent or bus
  
  // No @state() properties!
  // No event listeners!
  // No data processing!
  
  render() {
    if (!this.vitalsData) {
      return html`<div>Loading vitals...</div>`;
    }
    
    return html`
      <illthorn-vitals-ui .vitals=${this.vitalsData}></illthorn-vitals-ui>
    `;
  }
}
```

### State Distribution Options

#### Option A: Enhanced Bus System (Minimal Changes)

```typescript
// Session emits derived UI state via bus
this.bus.dispatchEvent("ui-state/vitals", uiState.vitals);

// Components subscribe to UI state events
this.session.bus.subscribeEvent("ui-state/vitals", (event) => {
  this.vitalsData = event.detail; // @property() update triggers re-render
});
```

#### Option B: Root-Level Props Distribution (More React-like)

```typescript
// SessionLayout receives all UI state and passes down as props
@customElement("illthorn-session-layout")
export class SessionLayout extends LitElement {
  @property({ type: Object })
  session?: Session;
  
  @state()
  private _uiState?: UIState;
  
  connectedCallback() {
    super.connectedCallback();
    this.session?.gameState.subscribe((gameState) => {
      this._uiState = this.session.uiState.deriveAllUIState();
    });
  }
  
  render() {
    return html`
      <illthorn-vitals-container .vitalsData=${this._uiState?.vitals}></illthorn-vitals-container>
      <illthorn-injuries-container .injuriesData=${this._uiState?.injuries}></illthorn-injuries-container>
      <illthorn-effects-container .effectsData=${this._uiState?.effects}></illthorn-effects-container>
    `;
  }
}
```

## Implementation Plan

### Phase 1: Foundation Infrastructure (Days 1-2)

#### Day 1: Core State Management
**Morning (3-4 hours)**:
- [ ] Create `GameStateStore` class with interfaces
- [ ] Add to `FrontendSession` as persistent property
- [ ] Create basic state update methods (vitals, injuries, effects)
- [ ] Add HMR state reconstruction capability

**Afternoon (3-4 hours)**:
- [ ] Create UI state derivation functions
- [ ] Create `UIStateManager` class
- [ ] Update `dispatchMetadata()` to update game state
- [ ] Add backward compatibility bus events

#### Day 2: Integration Testing
**Morning (3-4 hours)**:
- [ ] Test game state updates with real XML data
- [ ] Verify HMR state persistence
- [ ] Test UI state derivation accuracy
- [ ] Debug any state synchronization issues

**Afternoon (3-4 hours)**:
- [ ] Add comprehensive logging for state changes
- [ ] Create debug tools for state inspection
- [ ] Add unit tests for state derivation functions
- [ ] Performance testing for state updates

### Phase 2: Component Migration (Days 3-4)

#### Day 3: Core HUD Components
**Morning (3-4 hours)**:
- [ ] Migrate `VitalsContainer` to pure presentation
- [ ] Test HMR behavior with vitals component
- [ ] Migrate `InjuriesContainer` to pure presentation
- [ ] Verify injury pairing logic in derivation layer

**Afternoon (3-4 hours)**:
- [ ] Migrate `EffectsContainer` to pure presentation
- [ ] Test spell effect sorting and duration formatting
- [ ] End-to-end testing of migrated components
- [ ] Performance comparison vs. old approach

#### Day 4: Environment Components
**Morning (3-4 hours)**:
- [ ] Migrate `CompassContainer` to pure presentation
- [ ] Migrate `HandsContainer` to pure presentation
- [ ] Test equipment state management
- [ ] Verify compass direction handling

**Afternoon (3-4 hours)**:
- [ ] Migrate `RoomContainer` if applicable
- [ ] Integration testing of all migrated components
- [ ] HMR testing across all component types
- [ ] Bug fixes and edge case handling

### Phase 3: Advanced Features (Days 5-6)

#### Day 5: Feed and Stream Components
**Morning (3-4 hours)**:
- [ ] Evaluate `FeedContainer` migration needs
- [ ] Evaluate `StreamsContainer` migration needs
- [ ] Handle message history state if needed
- [ ] Test scroll position preservation

**Afternoon (3-4 hours)**:
- [ ] Remove old `@state()` management code
- [ ] Clean up unused event handlers
- [ ] Optimize re-render performance
- [ ] Add prop validation and error handling

#### Day 6: Polish and Documentation
**Morning (3-4 hours)**:
- [ ] Comprehensive HMR testing across all scenarios
- [ ] Performance benchmarking vs. old architecture
- [ ] Memory usage analysis
- [ ] State debugging tool enhancements

**Afternoon (3-4 hours)**:
- [ ] Update component documentation
- [ ] Create state management guide
- [ ] Add TypeScript strict checking
- [ ] Final integration testing

## Technical Specifications

### Game State Interfaces

```typescript
interface GameState {
  vitals: VitalsState;
  character: CharacterState;
  environment: EnvironmentState;
  ui: UIState;
}

interface VitalsState {
  health: VitalData;
  mana: VitalData;
  stamina: VitalData;
  spirit: VitalData;
  mind: VitalData;
  stance: VitalData;
  encumbrance: VitalData;
}

interface CharacterState {
  injuries: Array<InjuryData>;
  effects: Array<SpellEffectData>;
  hands: {
    left: HandData | null;
    right: HandData | null;
    spell: string | null;
  };
}

interface EnvironmentState {
  room: {
    id?: string;
    title: string;
    description: string;
    climate?: string;
    terrain?: string;
  };
  compass: {
    directions: Array<DirectionData>;
    visible: boolean;
  };
}

interface UIState {
  panels: {
    vitals: boolean;
    injuries: boolean;
    effects: boolean;
    compass: boolean;
    streams: boolean;
  };
  theme: string;
  layout: string;
}
```

### State Update Patterns

```typescript
// Atomic updates with change notifications
gameState.updateVital('health', {
  label: 'health',
  value: '95',
  percent: 95,
  text: 'health 95'
});

// Batch updates for related data
gameState.batchUpdate(() => {
  gameState.updateVital('health', healthData);
  gameState.updateVital('mana', manaData);
  gameState.updateVital('stamina', staminaData);
});

// Immutable state updates
const newState = gameState.withUpdates({
  vitals: {
    ...currentState.vitals,
    health: newHealthData
  }
});
```

### HMR State Reconstruction

```typescript
// During HMR, components can reconstruct their state
export class VitalsContainer extends LitElement {
  connectedCallback() {
    super.connectedCallback();
    
    // If component is reconnecting after HMR, restore state immediately
    if (this.session?.gameState) {
      const currentState = this.session.gameState.state;
      this.vitalsData = deriveVitalsProps(currentState);
    }
  }
}

// Or via session-level HMR hooks
export class FrontendSession {
  onComponentReconnect(componentType: string) {
    // Re-emit current UI state for specific component types
    const uiState = this.uiState.deriveAllUIState();
    this.bus.dispatchEvent(`ui-state/${componentType}`, uiState[componentType]);
  }
}
```

## Migration Strategy

### Incremental Migration Approach

1. **Add Parallel Systems**: Keep existing `@state()` management while adding game state store
2. **Component-by-Component**: Migrate one component type at a time
3. **Backward Compatibility**: Maintain existing bus events during transition
4. **Validation**: Compare old vs. new component outputs for consistency
5. **Rollback Safety**: Each component migration can be individually reverted

### Testing Strategy

```typescript
// Component migration testing
describe('VitalsContainer Migration', () => {
  test('produces identical output with new architecture', () => {
    const oldComponent = createOldVitalsContainer(mockSession);
    const newComponent = createNewVitalsContainer(mockSession, derivedProps);
    
    expect(newComponent.shadowRoot).toEqualStructure(oldComponent.shadowRoot);
  });
  
  test('survives HMR without state loss', async () => {
    const component = createNewVitalsContainer(mockSession, vitalsProps);
    const initialOutput = component.shadowRoot.innerHTML;
    
    // Simulate HMR
    await simulateHMR(component);
    
    const postHMROutput = component.shadowRoot.innerHTML;
    expect(postHMROutput).toBe(initialOutput);
  });
});
```

### Rollback Plan

If issues arise during migration:

1. **Component-Level Rollback**: Revert individual components to `@state()` management
2. **Feature Flag**: Add toggle between old and new architecture
3. **State Bridge**: Temporary adapter to convert between old and new patterns
4. **Gradual Removal**: Only remove old code after 100% confidence in new approach

## Expected Benefits

### Development Experience
- **No More HMR Breaks**: UI stays connected to game during development
- **Better Debugging**: Single place to inspect all game state
- **Faster Development**: Components are pure functions, easier to test
- **State Inspection**: Can add Redux DevTools-like debugging

### Code Quality
- **Separation of Concerns**: Data management separate from presentation
- **Testability**: Pure functions are easier to unit test
- **Maintainability**: Centralized business logic
- **Type Safety**: Strongly typed interfaces for all state

### Performance
- **Fewer Re-renders**: Only components with changed props re-render
- **Batch Updates**: Multiple state changes can be batched
- **Memory Efficiency**: No duplicate state across components
- **Predictable Performance**: No hidden side effects in components

### Future Capabilities
- **State Persistence**: Save/restore game state across sessions
- **Time Travel Debugging**: Replay state changes
- **State Snapshots**: Capture specific game moments
- **Advanced Features**: Undo/redo, state comparisons, etc.

## Risk Assessment

### Low Risk
- **Incremental Migration**: Each component can be migrated and tested independently
- **Backward Compatibility**: Existing bus events maintained during transition
- **Rollback Safety**: Individual components can be reverted if issues arise

### Medium Risk
- **Performance Impact**: Need to verify no performance regression with state derivation
- **Memory Usage**: Centralized state may use more memory initially
- **Complexity**: Additional abstraction layer adds some complexity

### Mitigation Strategies
- **Thorough Testing**: Component-by-component validation against existing behavior
- **Performance Monitoring**: Benchmark render times and memory usage
- **Gradual Rollout**: Start with least critical components
- **Feature Flags**: Allow switching between old and new approaches

## Success Criteria

### HMR Behavior
- [ ] No UI "blinks" or disconnections during HMR
- [ ] All component state preserved across file changes
- [ ] Game remains playable during development

### Code Quality
- [ ] Reduced component complexity (no `@state()` management)
- [ ] Single source of truth for all game state
- [ ] Improved testability with pure components

### Performance
- [ ] No regression in render performance
- [ ] No significant memory usage increase
- [ ] Faster component updates for related state changes

### Developer Experience
- [ ] Easier debugging with centralized state
- [ ] Simpler component testing
- [ ] Better TypeScript coverage and safety

This architecture refactoring represents a significant improvement to Illthorn's state management, solving critical HMR issues while improving overall code quality and developer experience.