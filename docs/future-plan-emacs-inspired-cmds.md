# Future Plan: Emacs-Inspired Command System

This document outlines a future architectural transformation to implement a command-centric system inspired by Emacs (M-x) and VS Code's command palette, where everything in Illthorn becomes a discoverable, executable command.

## Current Architecture Problems

**Current: Direct Binding**
```
Key Press (F1) → Execute Game Command ("stance offensive")
Command Bar (:ui) → Hardcoded handler
```

**Issues:**
- Actions are not discoverable
- Key bindings are hardcoded to specific actions
- No unified system for all interactions
- Limited composability
- Poor documentation of available actions

## Proposed: Command System

```
Key Press (F1) → Invoke Command ("macro:attack") → Execute Action
Command Bar → Invoke Any Command → Execute Action
```

## Phase 1: Command Registry Infrastructure

### 1.1 Create Core Command System (`src/frontend/commands/`)

**`registry.ts` - Central command registry singleton**
- Register commands with ID, name, description, category
- Execute commands by ID with parameters
- Command discovery/search capabilities
- Command history tracking

**`types.ts` - Command type definitions**
```typescript
interface Command {
  id: string;           // "macro:attack", "ui:toggle-hud", "theme:dark"
  name: string;          // Human-readable name
  description?: string;  // For discovery/help
  category: string;      // "macro", "ui", "system", "game"
  aliases?: string[];    // Alternative IDs
  execute: (args?: any) => Promise<void> | void;
  keybinding?: string;   // Associated key binding
}

interface CommandCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
}
```

**`executor.ts` - Command execution engine**
- Parse command strings from command bar
- Route to appropriate handlers
- Handle command chaining/composition
- Error handling and user feedback

## Phase 2: Macro Integration

### 2.1 Transform Macros into Commands
- Modify `MacroManager` to register each macro as a command
  - ID format: `macro:<category>:<name>` or `macro:<name>`
  - Make macros callable from command bar: `:macro attack` or `:m attack`
  - Keep backward compatibility with direct key bindings

### 2.2 Update Key Binding System
- Change key bindings to invoke commands instead of direct execution
- Example: F1 → executes command "macro:attack" → runs attack macro
- Allows rebinding keys to any command, not just macros

## Phase 3: Command Bar Enhancement

### 3.1 Update CLI Component
- Add command discovery/autocomplete
- Support command palette mode (like VS Code's Ctrl+Shift+P)
- Show available commands with fuzzy search
- Display command descriptions and keybindings

### 3.2 Command Syntax
```
:command [args]          # Execute command
:m attack               # Execute macro (shorthand)
:ui toggle hud          # UI commands with arguments
:help [command]         # Show command help
:commands               # List all available commands
:commands macro         # List commands in category
```

## Phase 4: Migrate Existing Commands

### 4.1 Register Existing Commands
- UI commands (`:ui hud on/off`, `:clear`, etc.)
- System commands (`:dev`, `:connect`, `:focus`)
- Theme commands (`:theme <name>`)
- Stream commands (`:stream clear`)

### 4.2 Create Command Categories
- `system` - Core app commands (connect, focus, config)
- `ui` - Interface manipulation (hud, streams, themes)
- `macro` - User macros
- `game` - Game interaction (clear log, send commands)
- `session` - Session management
- `dev` - Developer tools
- `highlight` - Text highlighting system

## Phase 5: Advanced Features

### 5.1 Command Composition
- Chain commands: `:chain "ui hud off" "theme dark" "macro:prepare"`
- Conditional execution based on game state
- Command aliases and shortcuts
- Command history and recent commands

### 5.2 Command Discovery UI
- Floating command palette (Ctrl+Shift+P style)
- Categorized command browser
- Recent/frequent commands
- Search with fuzzy matching
- Show keybindings alongside commands

## Implementation Benefits

1. **Discoverability**: Users can explore all available commands
2. **Flexibility**: Any action can be bound to any key or called from command bar
3. **Consistency**: One unified system for all interactions
4. **Extensibility**: Easy to add new command types
5. **Power User Features**: Command chaining, aliases, history
6. **Better Documentation**: Commands self-document with descriptions
7. **Vim/Emacs Familiarity**: Appeals to power users from those ecosystems

## Example Usage After Implementation

### Registering Commands
```typescript
// Register a macro as a command
commandRegistry.register({
  id: 'macro:combat:attack',
  name: 'Attack',
  description: 'Execute attack macro',
  category: 'macro',
  aliases: ['m:attack', 'attack'],
  execute: () => session.sendCommand('kill target'),
  keybinding: 'f1'
});

// Register UI command
commandRegistry.register({
  id: 'ui:toggle-hud',
  name: 'Toggle HUD',
  description: 'Show/hide the HUD panel',
  category: 'ui',
  aliases: ['hud'],
  execute: () => illthorn.hud(!getCurrentHudState())
});
```

### Using Commands
```typescript
// Bind key to command
keyboardjs.on('f1', () => commandRegistry.execute('macro:combat:attack'));

// Execute from command bar
:macro attack
:m attack
:attack  // via alias

// Chain commands
:chain "ui hud off" "theme dark"

// Discover commands
:commands macro     # List all macro commands
:commands ui        # List all UI commands
:help attack        # Show attack command help
:recent            # Show recently used commands
```

### Command Palette UI
```
Ctrl+Shift+P → Opens floating command palette
Type: "att" → Shows:
  ► macro:combat:attack (F1)
  ► macro:defensive:attune
  ► ui:stream:attach
  ...
```

## Migration Strategy

1. **Phase 1**: Implement core command registry alongside existing system
2. **Phase 2**: Register macros as commands while maintaining current macro system
3. **Phase 3**: Enhance command bar with discovery features
4. **Phase 4**: Migrate existing `:` commands to the registry
5. **Phase 5**: Add advanced features and command palette UI
6. **Phase 6**: Deprecate old direct-binding system (optional, maintain for compatibility)

## Technical Considerations

### Performance
- Command registry should be lightweight and fast for lookups
- Lazy loading of command descriptions for large numbers of commands
- Efficient fuzzy search implementation

### Configuration
- Allow users to customize keybindings for any command
- Export/import command configurations
- Command aliases can be user-defined

### Backwards Compatibility
- Keep existing macro system working during transition
- Maintain current `:` command syntax
- Gradual migration path for users

This architecture would make Illthorn much more powerful, discoverable, and flexible while maintaining the familiar interface that users already know and love.