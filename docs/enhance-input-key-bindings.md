# Enhanced Input Key Bindings System

## Overview

This document outlines a comprehensive key binding enhancement system for Illthorn, building upon the existing sophisticated macro infrastructure. The enhancement adds vim-inspired command replay, advanced readline features, and user-configurable key bindings while integrating seamlessly with the current keyboardjs-based macro system.

## Current State Analysis

### Existing Macro System (`src/frontend/macros/index.ts`)

Illthorn already has a sophisticated key binding system using keyboardjs:

**Meta Macros (Global Shortcuts)**:
- **Alt+1-9**: Session switching (implemented)
- **PageUp/PageDown**: Feed scrolling with 80% viewport steps
- **Ctrl+PageDown**: Scroll to bottom of feed
- **Tab**: Reserved for tab completion (placeholder)
- **Right Arrow**: Autocomplete trigger

**User-Configurable Macros**:
- Stored in settings as `MacroProfile` (key combo → command mapping)
- Support for multi-line commands split by `\r`
- Dynamic binding/unbinding system
- Integration with `IllthornEvent.MACRO` bus system

### CLI Component (`src/frontend/components/session/cli.lit.ts`)

Current keyboard handling in CLI:
- **Enter**: Command submission with multi-line support (`\r` splitting)
- **ArrowUp/Down**: Command history navigation
- **Escape**: Clear input and reset history position
- Focus management and cursor positioning
- Integration with CommandHistory class

### Command History System (`src/frontend/session/command-history.ts`)

Robust history management:
- Circular navigation with `wrap_index` logic
- Position tracking and reset functionality
- Command matching and filtering capability
- Array-based storage with configurable max size (500)

## Enhanced Feature Set

### 1. Command Replay System (Vim-Inspired)

**Ctrl+.**: Replay Last Command
- Execute the most recently submitted command directly
- **Vim Behavior**: Don't load into input bar, execute immediately
- **History Convention**: Don't add replays to command history (vim-style)
- Track last executed command separately from navigation history

```typescript
// New state in CLI component
@state()
private _lastExecutedCommand = "";

// Enhanced _submitCommand method
private _submitCommand() {
  const command = this._inputValue.trim();
  if (command.length === 0) return;
  
  // Store for replay system
  this._lastExecutedCommand = command;
  
  // Existing submission logic...
}

// New replay handler
private _replayLastCommand() {
  if (this._lastExecutedCommand.length === 0) return;
  
  // Execute directly without adding to history
  this._executeCommand(this._lastExecutedCommand);
}
```

### 2. Advanced Readline Features

**Text Navigation**:
- **Ctrl+A**: Move cursor to beginning of line
- **Ctrl+E**: Move cursor to end of line  
- **Alt+F**: Move cursor forward by word
- **Alt+B**: Move cursor backward by word

**Text Editing**:
- **Ctrl+K**: Kill (delete) from cursor to end of line
- **Ctrl+U**: Kill entire line
- **Ctrl+W**: Delete previous word
- **Alt+D**: Delete word forward from cursor
- **Ctrl+T**: Transpose characters (swap char before/after cursor)
- **Ctrl+Y**: Yank (paste) last killed text

**History and Search**:
- **Ctrl+R**: Reverse incremental search through command history
- **Ctrl+P/N**: History navigation (equivalent to ArrowUp/Down)
- **Ctrl+Shift+P/N**: Jump to first/last command in history
- **Ctrl+Alt+R**: Clear command history with confirmation

### 3. User-Configurable Key Binding Categories

**Combat and Stance Management**:
```typescript
// Suggested key bindings for user configuration
"ctrl+shift+1": "stance defensive",
"ctrl+shift+2": "stance forward", 
"ctrl+shift+3": "stance offensive",
"ctrl+shift+4": "stance guarded",
"ctrl+shift+5": "stance cautious"
```

**Spell Casting Shortcuts**:
```typescript
"ctrl+alt+1": "prep 101\\rcast",  // Spirit Warding I
"ctrl+alt+2": "prep 103\\rcast",  // Spirit Defense  
"ctrl+alt+3": "prep 107\\rcast",  // Spirit Warding II
"ctrl+alt+4": "prep 202\\rcast",  // Spirit Shield
"ctrl+alt+5": "prep 211\\rcast"   // Bravery
```

**Movement and Navigation**:
```typescript
// Numpad-based directional movement
"ctrl+numpad8": "north",
"ctrl+numpad2": "south", 
"ctrl+numpad4": "west",
"ctrl+numpad6": "east",
"ctrl+numpad7": "northwest",
"ctrl+numpad9": "northeast",
"ctrl+numpad1": "southwest", 
"ctrl+numpad3": "southeast"
```

**Quick Actions (F-Keys)**:
```typescript
"f1": "look",
"f2": "inventory", 
"f3": "time",
"f4": "who",
"f5": "withdraw 1000 silver",
"f6": "deposit all",
"f7": "health",
"f8": "spell",
"f9": "peer n\\rpeer s\\rpeer e\\rpeer w", // Scout all directions
"f10": "get all from corpse",
"f11": "search",
"f12": "rest"
```

### 4. Enhanced Feed Management

**Extended Feed Controls**:
- **Ctrl+L**: Clear feed (existing functionality)
- **Ctrl+Shift+L**: Clear feed with confirmation prompt
- **Ctrl+Alt+S**: Save current feed content to file
- **Ctrl+D**: Jump to specific line number (with input prompt)
- **Ctrl+Home**: Scroll to top of feed
- **Ctrl+End**: Scroll to bottom of feed

### 5. History Search Mode

**Ctrl+R Implementation**:
```typescript
@state()
private _searchMode = false;

@state() 
private _searchQuery = "";

@state()
private _searchResults: string[] = [];

private _enterSearchMode() {
  this._searchMode = true;
  this._searchQuery = "";
  this._updateSearchResults();
}

private _updateSearchResults() {
  if (!this.session) return;
  this._searchResults = this.session.history
    .filter(cmd => cmd.includes(this._searchQuery))
    .slice(0, 10); // Limit to 10 results
}
```

## Implementation Architecture

### 1. Event System Extensions

**New Events in `IllthornEvent` enum**:
```typescript
export enum IllthornEvent {
  // Existing events...
  
  // Command replay
  COMMAND_REPLAY = "command/replay",
  
  // Enhanced feed management  
  FEED_CLEAR_CONFIRM = "feed/clear-confirm",
  FEED_SAVE = "feed/save",
  FEED_JUMP_TO_LINE = "feed/jump-to-line",
  
  // History management
  HISTORY_SEARCH = "history/search", 
  HISTORY_CLEAR = "history/clear",
  
  // Text editing operations
  TEXT_KILL_LINE = "text/kill-line",
  TEXT_KILL_WORD = "text/kill-word", 
  TEXT_YANK = "text/yank"
}
```

### 2. CLI Component Enhancements

**Enhanced `_handleKeyDown` Method**:
```typescript
private _handleKeyDown(e: KeyboardEvent) {
  if (!this.session) return;

  // Command replay (vim-style)
  if (e.ctrlKey && e.key === ".") {
    e.preventDefault();
    this._replayLastCommand();
    return;
  }

  // Reverse history search
  if (e.ctrlKey && e.key === "r") {
    e.preventDefault();
    this._enterSearchMode();
    return;
  }

  // Text navigation and editing
  if (e.ctrlKey) {
    switch (e.key.toLowerCase()) {
      case "a": // Beginning of line
        e.preventDefault();
        this._moveCursorToStart();
        return;
        
      case "e": // End of line
        e.preventDefault(); 
        this._moveCursorToEnd();
        return;
        
      case "k": // Kill to end of line
        e.preventDefault();
        this._killToEndOfLine();
        return;
        
      case "u": // Kill entire line
        e.preventDefault();
        this._killEntireLine();
        return;
        
      case "w": // Delete previous word
        e.preventDefault();
        this._deletePreviousWord();
        return;
        
      case "y": // Yank (paste)
        e.preventDefault();
        this._yankText();
        return;
    }
  }

  // Alt key combinations
  if (e.altKey) {
    switch (e.key.toLowerCase()) {
      case "f": // Forward word
        e.preventDefault();
        this._moveWordForward();
        return;
        
      case "b": // Backward word  
        e.preventDefault();
        this._moveWordBackward();
        return;
        
      case "d": // Delete word forward
        e.preventDefault();
        this._deleteWordForward();
        return;
    }
  }

  // Existing key handling...
}
```

### 3. Integration with Existing Macro System

**Enhanced `bindMetaMacros` Function**:
```typescript
export async function bindMetaMacros() {
  // Existing bindings...
  
  // Command replay
  keyboardjs.on("ctrl+.", (e) => {
    e?.preventDefault();
    const sess = currentSession();
    sess?.ui.cli.replayLastCommand();
  });
  
  // History search
  keyboardjs.on("ctrl+r", (e) => {
    e?.preventDefault(); 
    const sess = currentSession();
    sess?.ui.cli.enterSearchMode();
  });
  
  // Enhanced feed management
  keyboardjs.on("ctrl+shift+l", (e) => {
    e?.preventDefault();
    if (confirm("Clear all feed content?")) {
      const sess = currentSession();
      sess?.ui.feed.clearContent();
    }
  });
}
```

### 4. Kill Ring Implementation

**Text Editing State Management**:
```typescript
// Add to CLI component
@state()
private _killRing: string[] = [];

@state() 
private _killRingPosition = 0;

private _addToKillRing(text: string) {
  this._killRing.unshift(text);
  if (this._killRing.length > 20) {
    this._killRing = this._killRing.slice(0, 20);
  }
  this._killRingPosition = 0;
}

private _yankText() {
  if (this._killRing.length === 0) return;
  
  const text = this._killRing[this._killRingPosition];
  const input = this._input;
  const start = input.selectionStart || 0;
  
  const newValue = 
    this._inputValue.slice(0, start) + 
    text + 
    this._inputValue.slice(start);
    
  this._inputValue = newValue;
  
  // Position cursor after yanked text
  this.updateComplete.then(() => {
    const newPos = start + text.length;
    input.setSelectionRange(newPos, newPos);
  });
}
```

## Configuration and Customization

### 1. Macro Configuration Files

**User Macro Storage Pattern**:
```typescript
// Example user configuration
const userMacros: MacroProfile = {
  // Combat shortcuts
  "ctrl+shift+1": "stance defensive",
  "ctrl+shift+2": "stance forward",
  "ctrl+shift+3": "stance offensive",
  
  // Spell shortcuts  
  "ctrl+alt+1": "prep 101\\rcast",
  "ctrl+alt+2": "prep 103\\rcast",
  
  // Movement shortcuts
  "ctrl+numpad8": "north",
  "ctrl+numpad2": "south",
  
  // Quick actions
  "f1": "look",
  "f2": "inventory",
  "f5": "withdraw 1000 silver"
};
```

### 2. Settings Integration

**Persistent Configuration**:
```typescript
// Enhanced macro loading with defaults
export async function loadMacrosWithDefaults(): Promise<MacroProfile> {
  const userMacros = await window.Settings.get<MacroProfile>("macros") || {};
  const defaultMacros = await loadDefaultMacros();
  
  return { ...defaultMacros, ...userMacros };
}

// Save user customizations
export async function saveMacros(macros: MacroProfile) {
  await window.Settings.set("macros", macros);
  await unbindUserMacros();
  await bindUserMacros();
}
```

### 3. Runtime Configuration Commands

**CLI Commands for Macro Management**:
```typescript
// Enhanced CLI command processing
if (command.startsWith(":bind ")) {
  const [, keyCombo, ...commandParts] = command.split(" ");
  const macro = commandParts.join(" ");
  await addMacro(keyCombo, macro);
  return;
}

if (command.startsWith(":unbind ")) {
  const [, keyCombo] = command.split(" ");
  await removeMacro(keyCombo);
  return;
}

if (command === ":macros") {
  const macros = await loadMacros();
  displayMacroList(macros);
  return;
}
```

## Testing and Validation

### Manual Testing Protocol

1. **Command Replay Testing**:
   - Execute various commands (game commands, CLI commands)
   - Verify Ctrl+. replays the last command
   - Confirm replays don't appear in history navigation
   - Test with multi-line commands (`\r` separated)

2. **Text Editing Testing**:
   - Test all cursor movement shortcuts (Ctrl+A/E, Alt+F/B)
   - Verify text deletion operations (Ctrl+K/U/W, Alt+D)
   - Test kill ring functionality with Ctrl+Y
   - Confirm transpose operation (Ctrl+T)

3. **History Search Testing**:
   - Build command history with varied commands
   - Test Ctrl+R reverse search functionality
   - Verify search filtering and result selection
   - Test escape from search mode

4. **Macro Integration Testing**:
   - Test user-defined macros with new key combinations
   - Verify existing macro functionality remains intact
   - Test macro binding/unbinding commands
   - Confirm settings persistence

### Automated Testing

**Unit Test Coverage**:
```typescript
describe("Enhanced CLI Key Bindings", () => {
  test("command replay executes last command", () => {
    // Test implementation
  });
  
  test("kill ring maintains text deletion history", () => {
    // Test implementation  
  });
  
  test("history search filters commands correctly", () => {
    // Test implementation
  });
  
  test("text editing operations maintain cursor position", () => {
    // Test implementation
  });
});
```

## Migration and Compatibility

### Backward Compatibility

- All existing key bindings remain functional
- Current macro system continues to work unchanged
- No breaking changes to CLI component API
- Existing command history behavior preserved

### Progressive Enhancement

- New features activate only when explicitly used
- Default behavior matches current implementation
- User can opt into advanced features gradually
- Configuration remains optional

## Performance Considerations

### Optimization Strategies

1. **Event Handler Efficiency**:
   - Single keydown handler with efficient switch statements
   - Early returns to minimize processing overhead
   - Debounced search operations for history filtering

2. **Memory Management**:
   - Limited kill ring size (20 entries)
   - Bounded search results (10 entries)
   - Efficient string operations for text editing

3. **Rendering Performance**:
   - Minimal re-renders during text editing
   - Efficient cursor positioning updates
   - Optimized search result display

## Future Enhancements

### Advanced Features

1. **Macro Recording**:
   - Ctrl+X+( to start recording
   - Ctrl+X+) to stop recording
   - Ctrl+X+E to execute recorded macro

2. **Command Abbreviation**:
   - Intelligent command expansion
   - User-defined abbreviations
   - Context-aware suggestions

3. **Multi-Session Key Bindings**:
   - Session-specific macro profiles
   - Context switching for different characters
   - Profile inheritance and overrides

4. **Visual Enhancements**:
   - Key binding hint display
   - Interactive macro editor
   - Command palette (Ctrl+Shift+P)

## Conclusion

This enhanced key binding system transforms Illthorn's command interface into a powerful, vim and readline-inspired environment while maintaining full compatibility with existing functionality. The implementation leverages the robust keyboardjs infrastructure already in place, extending it with sophisticated text editing, command replay, and user customization capabilities.

The system provides immediate value to power users familiar with terminal environments while remaining accessible to casual users through its progressive enhancement approach. All features integrate seamlessly with Illthorn's existing architecture and can be incrementally implemented without disrupting current workflows.