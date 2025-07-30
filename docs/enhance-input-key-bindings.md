# Readline-Style Keybindings Enhancement

## Overview

This document outlines the implementation plan for adding readline-style keybindings to the Illthorn CLI component. The enhancement will add familiar keyboard shortcuts that improve command-line navigation and interaction efficiency.

## Current State Analysis

### CLI Component (`src/frontend/components/session/cli.lit.ts`)

The CLI component is already implemented as a Lit component with:
- Existing keyboard handling via `_handleKeyDown` method
- ArrowUp/ArrowDown for command history navigation
- Enter for command submission
- Integration with CommandHistory class for history management
- Input focus management and value binding

Key existing structure:
```typescript
private _handleKeyDown(e: KeyboardEvent) {
  if (!this.session) return;
  const history = this.session.history;

  switch (e.key) {
    case "Enter": // Command submission
    case "ArrowUp": // History back
    case "ArrowDown": // History forward
  }
}
```

### Feed Component (`src/frontend/components/session/feed.lit.ts`)

The Feed component displays game output with:
- Content stored in `_contentHTML: Array<string>` state
- Memory management via `flush()` method
- Auto-scrolling behavior
- Click event handling for interactive elements

### Event System (`src/frontend/events.ts`)

The project uses a bus-based event system with predefined events:
- `IllthornEvent` enum defines available events
- Components communicate via `session.bus.dispatchEvent()`
- Event listeners are managed in component lifecycle methods

### Command History (`src/frontend/session/command-history.ts`)

The CommandHistory class provides:
- `.back()` - navigate to previous command
- `.forward()` - navigate to next command
- Position tracking and wrapping logic
- Command storage and retrieval

## Requirements

Add the following readline-style keybindings to the CLI input:

1. **Ctrl+P**: Navigate backwards in command history (equivalent to ArrowUp)
2. **Ctrl+N**: Navigate forwards in command history (equivalent to ArrowDown)
3. **Ctrl+L**: Clear the game output feed
4. **Escape**: Clear the current input prompt

### Behavior Specifications

- **Focus Requirement**: Keybindings should only trigger when the CLI input element has focus
- **Existing Compatibility**: All existing keyboard shortcuts must continue to work unchanged
- **Event Prevention**: Prevent default browser behaviors for these key combinations
- **Visual Feedback**: Clearing operations should provide immediate visual feedback

## Architecture Approach

### Inter-Component Communication

Use the existing bus event system to enable CLI component to communicate with Feed component:

1. **Event Definition**: Add new `FEED_CLEAR` event to `IllthornEvent` enum
2. **Event Dispatch**: CLI component dispatches event when Ctrl+L is pressed
3. **Event Handling**: Feed component listens for event and clears content
4. **Lifecycle Management**: Proper setup/teardown of event listeners

### Benefits of Bus Communication

- **Decoupling**: CLI and Feed components remain independent
- **Consistency**: Follows existing architectural patterns
- **Extensibility**: Easy to add more feed-related commands in the future
- **Testing**: Each component can be tested in isolation

## Implementation Details

### 1. Event System Enhancement

**File**: `src/frontend/events.ts`

Add new event type:
```typescript
export enum IllthornEvent {
  // ... existing events
  /**
   * Clear the main game feed content
   */
  FEED_CLEAR = "feed/clear",
}
```

### 2. CLI Component Enhancement

**File**: `src/frontend/components/session/cli.lit.ts`

Enhance the `_handleKeyDown` method:

```typescript
private _handleKeyDown(e: KeyboardEvent) {
  if (!this.session) return;

  const history = this.session.history;

  // Handle Ctrl key combinations
  if (e.ctrlKey) {
    switch (e.key.toLowerCase()) {
      case "p": // Ctrl+P - History back
        e.preventDefault();
        if (history.position === 0) {
          history.add(this._inputValue);
        }
        this._setInput(history.back());
        return;

      case "n": // Ctrl+N - History forward
        e.preventDefault();
        this._setInput(history.forward());
        return;

      case "l": // Ctrl+L - Clear feed
        e.preventDefault();
        this.session.bus.dispatchEvent(
          new CustomEvent(IllthornEvent.FEED_CLEAR)
        );
        return;
    }
  }

  // Handle regular keys
  switch (e.key) {
    case "Escape": // Clear input
      e.preventDefault();
      this._inputValue = "";
      return;

    case "Enter":
      this._submitCommand();
      break;

    case "ArrowUp":
      e.preventDefault();
      if (history.position === 0) {
        history.add(this._inputValue);
      }
      this._setInput(history.back());
      break;

    case "ArrowDown":
      e.preventDefault();
      this._setInput(history.forward());
      break;
  }
}
```

Key implementation details:
- **Ctrl Detection**: Use `e.ctrlKey` to detect control key combinations
- **Case Insensitive**: Use `e.key.toLowerCase()` for consistent key matching
- **Event Prevention**: Call `e.preventDefault()` to prevent browser defaults
- **Early Return**: Use `return` to prevent fall-through to regular key handling
- **Bus Communication**: Dispatch `FEED_CLEAR` event through session bus

### 3. Feed Component Enhancement

**File**: `src/frontend/components/session/feed.lit.ts`

Add feed clearing capability:

```typescript
// Add import for IllthornEvent if not already present
import { IllthornEvent } from "../../events";

export class FeedLit extends LitElement {
  // ... existing code

  private _feedClearListener?: (event: Event) => void;

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("feed", "scroll");
    
    // Set up feed clear listener
    this._setupFeedClearListener();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeFeedClearListener();
    this.destroy();
  }

  private _setupFeedClearListener() {
    if (!this.session) return;

    this._feedClearListener = () => {
      this.clearContent();
    };

    this.session.bus.addEventListener(
      IllthornEvent.FEED_CLEAR,
      this._feedClearListener
    );
  }

  private _removeFeedClearListener() {
    if (this._feedClearListener && this.session) {
      this.session.bus.removeEventListener(
        IllthornEvent.FEED_CLEAR,
        this._feedClearListener
      );
      this._feedClearListener = undefined;
    }
  }

  /**
   * Clear all feed content
   */
  clearContent() {
    this._contentHTML = [];
    this.requestUpdate();
    // Optionally scroll to top after clearing
    this.updateComplete.then(() => {
      this.scrollTop = 0;
    });
  }

  // ... rest of existing methods
}
```

Key implementation details:
- **Listener Storage**: Store listener reference for proper cleanup
- **Session Check**: Verify session exists before setting up listener
- **Memory Management**: Clear content array and request update
- **Scroll Behavior**: Reset scroll position after clearing
- **Lifecycle Management**: Proper setup/teardown in connected/disconnected callbacks

## Testing Strategy

### Manual Testing

1. **Focus Verification**: 
   - Click in CLI input field
   - Verify keybindings only work when input is focused
   - Click elsewhere and verify keybindings don't interfere

2. **History Navigation**:
   - Enter several commands to build history
   - Test Ctrl+P navigates backwards through history
   - Test Ctrl+N navigates forwards through history
   - Verify ArrowUp/ArrowDown still work identically

3. **Feed Clearing**:
   - Generate some game output in the feed
   - Press Ctrl+L with input focused
   - Verify feed content is immediately cleared
   - Verify new content still appears after clearing

4. **Input Clearing**:
   - Type text in input field
   - Press Escape
   - Verify input is immediately cleared

### Automated Testing

Consider adding unit tests for:
- Keyboard event handling in CLI component
- Event dispatch verification
- Feed clearing functionality
- Integration between CLI and Feed components

### Browser Compatibility

Test across different browsers to ensure:
- Ctrl key combinations work consistently
- No conflicts with browser shortcuts
- Event prevention works as expected

## Edge Cases and Considerations

### Focus Management

- **Auto-focus**: CLI input should maintain focus for optimal UX
- **Focus Loss**: Consider re-focusing input after certain operations
- **Multi-session**: Verify keybindings work correctly when switching between sessions

### Event Handling

- **Event Bubbling**: Ensure events don't bubble inappropriately
- **Session Lifecycle**: Handle cases where session is destroyed/recreated
- **Memory Leaks**: Verify proper cleanup of event listeners

### User Experience

- **Visual Feedback**: Consider adding brief visual indicators for clearing operations
- **Undo Capability**: Consider if feed clearing should be reversible
- **Keyboard Shortcuts**: Document new shortcuts for users

### Performance

- **Large Feeds**: Ensure clearing large feeds is performant
- **Frequent Clearing**: Verify no memory leaks with repeated clearing
- **Event Overhead**: Minimize overhead of event listener management

## Future Enhancements

Potential additional readline-style features:
- **Ctrl+A**: Move cursor to beginning of line
- **Ctrl+E**: Move cursor to end of line
- **Ctrl+F/Ctrl+B**: Character-wise cursor movement
- **Ctrl+K**: Delete from cursor to end of line
- **Ctrl+U**: Delete entire line
- **Ctrl+W**: Delete previous word

## Conclusion

This enhancement adds familiar readline-style keybindings while maintaining the existing architecture and functionality. The implementation follows Lit component patterns and uses the established bus communication system for inter-component coordination.

The changes are minimal, focused, and preserve backward compatibility while significantly improving the command-line user experience for users familiar with readline conventions.