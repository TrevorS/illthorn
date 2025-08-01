# CLI Shoelace Port Migration Plan

## Overview
Port the current Lit-based CLI and Prompt components to use Shoelace UI components while preserving all existing functionality and implementing enhanced readline-style key bindings. Focus on clean, MUD-inspired styling with minimal visual changes to maintain the current aesthetic.

## Current State Analysis

Looking at the current UI, we have:
- Clean dark theme with monospace font
- Input bar at bottom with "S>" prompt and command input
- Timer bars above input (not visible in screenshot but implemented)
- Minimal, terminal-like aesthetic that should be preserved

## Component Architecture

### 1. CLI Component Migration (`cli.lit.ts`)
**Target**: Replace HTML `<input>` with `<sl-input>` and timer bars with `<sl-progress-bar>`

**Key Changes**:
- Migrate from native `<input>` to `<sl-input>` with proper event handling
- Replace CSS-animated timer bars with `<sl-progress-bar>` components  
- Implement comprehensive readline-style key bindings (Ctrl+A/E/K/U/W/Y, Alt+F/B/D)
- Add command replay system (Ctrl+. - execute last command immediately)
- Implement reverse history search (Ctrl+R) with search overlay
- Maintain all existing functionality (history navigation, multi-line commands, timer animations)

### 2. Prompt Component Migration (`prompt.lit.ts`)
**Target**: Enhance with better typography and event handling while keeping simple text display

**Key Changes**:
- Keep existing functionality but improve styling consistency with Shoelace design tokens
- Add optional validation states for error prompts
- Improve accessibility with proper ARIA attributes
- Maintain the "S>" style prompt display

## Readline Key Bindings Implementation

### Text Navigation
- **Ctrl+A**: Move cursor to beginning of line
- **Ctrl+E**: Move cursor to end of line  
- **Alt+F**: Move cursor forward by word
- **Alt+B**: Move cursor backward by word

### Text Editing
- **Ctrl+K**: Kill (delete) from cursor to end of line
- **Ctrl+U**: Kill entire line
- **Ctrl+W**: Delete previous word
- **Alt+D**: Delete word forward from cursor
- **Ctrl+T**: Transpose characters (swap char before/after cursor)
- **Ctrl+Y**: Yank (paste) last killed text

### Command Operations
- **Ctrl+.**: Replay last command (vim-style - execute immediately, don't add to history)
- **Ctrl+R**: Reverse incremental search through command history
- **Ctrl+P/N**: History navigation (equivalent to ArrowUp/Down)

### Kill Ring System
Implement a circular buffer for deleted text:
- Store up to 20 deleted text segments
- Ctrl+Y cycles through kill ring entries
- Support for both word and line deletion storage

## Implementation Strategy

### Phase 1: Branch Creation and Core Setup
1. Create feature branch: `feature/cli-shoelace-migration`
2. Install/verify Shoelace dependencies
3. Set up basic component structure

### Phase 2: Input Component Migration
1. Replace `<input>` with `<sl-input>` in CLI component
2. Migrate event handlers from native events to Shoelace events (`sl-input`, `sl-change`)
3. Preserve existing styling and theming
4. Test all existing functionality (command submission, history navigation)

### Phase 3: Enhanced Key Bindings Implementation
1. Implement text navigation utilities (cursor movement, word boundaries)
2. Add text editing operations with kill ring support
3. Build command replay system
4. Create reverse history search with live filtering overlay

### Phase 4: Timer Bar Migration
1. Replace CSS-animated timer bars with `<sl-progress-bar>`
2. Maintain existing animation triggers and duration handling
3. Preserve visual styling for roundtime (red) and casttime (green)
4. Ensure timer bars appear above input as currently designed

### Phase 5: Styling and Polish
1. Apply Shoelace design tokens while preserving MUD aesthetic
2. Ensure clean dark theme compatibility
3. Test across all existing themes
4. Optimize for accessibility and keyboard navigation

## Technical Specifications

### Shoelace Integration
- Use `<sl-input>` with minimal styling to match current appearance
- Configure `<sl-progress-bar>` for timer displays with custom CSS parts
- Preserve Light DOM pattern for theme styling compatibility
- Maintain existing CSS custom properties integration

### Key Binding Architecture
```typescript
// Enhanced key handler structure
private _handleKeyDown(e: KeyboardEvent) {
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
      case "a": this._moveCursorToStart(); break;
      case "e": this._moveCursorToEnd(); break;
      case "k": this._killToEndOfLine(); break;
      case "u": this._killEntireLine(); break;
      case "w": this._deletePreviousWord(); break;
      case "y": this._yankText(); break;
    }
  }

  // Alt key combinations for word movement
  if (e.altKey) {
    switch (e.key.toLowerCase()) {
      case "f": this._moveWordForward(); break;
      case "b": this._moveWordBackward(); break;
      case "d": this._deleteWordForward(); break;
    }
  }

  // Existing key handling...
}
```

### Kill Ring Implementation
```typescript
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
```

### History Search System
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
```

## Styling Approach

### Design Principles
- **Minimal Changes**: Preserve the clean, terminal-like aesthetic
- **Dark Theme First**: Ensure dark theme remains primary focus
- **Monospace Typography**: Maintain MonoLisa font usage
- **MUD Authenticity**: Keep the authentic text-based game feel

### CSS Strategy
- Use Shoelace CSS parts to style components minimally
- Override default Shoelace styling to match current appearance
- Preserve existing CSS custom properties for theme integration
- Maintain Light DOM styling pattern for theme compatibility

### Timer Bar Styling
```css
sl-progress-bar[data-timer="roundtime"]::part(indicator) {
  background: var(--color-danger, red);
}

sl-progress-bar[data-timer="casttime"]::part(indicator) {
  background: var(--color-warning, lightgreen);
}
```

## Testing Strategy

### Unit Tests
- Key binding functionality for all readline operations
- Kill ring operations and text manipulation
- Command replay system
- History search filtering

### Integration Tests
- Command submission with multi-line support
- History navigation compatibility
- Timer bar animation triggers
- Theme switching compatibility

### Manual Testing
- Test across all supported themes
- Verify keyboard navigation accessibility
- Performance testing for text editing operations
- Visual regression testing

## Migration Checklist

### Pre-Implementation
- [ ] Create feature branch: `feature/cli-shoelace-migration`
- [ ] Verify Shoelace dependencies and version compatibility
- [ ] Review current key binding behaviors for compatibility

### Core Migration
- [ ] Replace `<input>` with `<sl-input>` in CLI component
- [ ] Migrate event handlers to Shoelace event system
- [ ] Preserve all existing command submission logic
- [ ] Test command history navigation

### Enhanced Features
- [ ] Implement readline text navigation (Ctrl+A/E, Alt+F/B)
- [ ] Add text editing operations (Ctrl+K/U/W/Y)
- [ ] Build kill ring system with circular buffer
- [ ] Implement command replay (Ctrl+.)
- [ ] Create reverse history search (Ctrl+R)

### Timer Integration
- [ ] Replace timer bars with `<sl-progress-bar>`
- [ ] Preserve animation triggers and styling
- [ ] Test roundtime and casttime display

### Polish and Testing
- [ ] Apply consistent styling with Shoelace design tokens
- [ ] Test across all themes
- [ ] Accessibility audit
- [ ] Performance validation
- [ ] Documentation updates

## Success Criteria
- All existing CLI/Prompt functionality preserved
- Enhanced readline-style key bindings working smoothly
- Command replay and history search implemented
- Visual consistency maintained (looks identical to current UI)
- No performance regressions
- Full accessibility compliance
- Clean, maintainable code following project patterns
- Seamless theme compatibility

## Files to Create/Modify
- `src/frontend/components/session/cli.lit.ts` - Enhanced CLI component
- `src/frontend/components/session/prompt.lit.ts` - Improved Prompt component
- `test/components/cli-keybindings.spec.ts` - Key binding tests
- `test/components/cli-integration.spec.ts` - Integration tests
- Theme CSS updates if needed for Shoelace integration

## Future Enhancements
After successful migration, consider:
- Macro recording system (Ctrl+X+( to start, Ctrl+X+) to stop)
- Command abbreviation and expansion
- Visual key binding hints
- Command palette (Ctrl+Shift+P)
- Session-specific macro profiles