# Hide Sidebar Implementation Plan

## Overview
Add ability to toggle the left session bar on/off for users who always have just one session and want maximum screen real estate.

## Current Architecture Analysis

### Main Layout Structure
```typescript
// app.lit.ts
:host {
  grid-template-columns: var(--actions-width, 5em) 1fr;
}
```

### Existing Toggle Pattern
```typescript
// illthorn.ts - already has HUD toggle
hud(on: boolean) {
  const sess = currentSession();
  sess.ui.context.classList.toggle("no-hud", !on);
}
```

### Settings Infrastructure
- Backend: `electron-store` for persistence
- Frontend: Settings API available via IPC
- Pattern: Key-value storage with async get/set methods

## Implementation Plan

### Phase 1: CSS Infrastructure
**File: `src/frontend/components/app.lit.ts`**

Add CSS class for hidden sessions:
```css
:host(.no-sessions) {
  grid-template-columns: 0 1fr;
}

:host(.no-sessions) #app-left-pane {
  visibility: hidden;
  overflow: hidden;
}

/* Optional: smooth transition */
:host {
  transition: grid-template-columns 0.2s ease-in-out;
}
```

### Phase 2: State Management
**File: `src/frontend/components/app.lit.ts`**

Add reactive property:
```typescript
@state()
private _sessionsVisible = true;

// Add method to toggle sessions
toggleSessions(visible: boolean) {
  this._sessionsVisible = visible;
  this.classList.toggle("no-sessions", !visible);
  
  // Save to settings
  window.Settings.set("ui.sessions.visible", visible);
}
```

### Phase 3: Command Handler Extension
**File: `src/frontend/illthorn.ts`**

Extend `handleCommand()` method:
```typescript
async handleCommand(command: string) {
  switch (command) {
    // ... existing cases
    case ":ui sessions on":
      return this.sessions(true);
    case ":ui sessions off":
      return this.sessions(false);
  }
}

sessions(on: boolean) {
  const appRoot = document.querySelector("illthorn-app-lit") as HTMLElement & { toggleSessions?: (visible: boolean) => void };
  appRoot?.toggleSessions?.(on);
}
```

### Phase 4: Settings Integration
**File: `src/frontend/components/app.lit.ts`**

Load saved state on startup:
```typescript
async connectedCallback() {
  super.connectedCallback();
  
  // Load saved sessions visibility state
  const savedVisible = await window.Settings.get("ui.sessions.visible");
  if (savedVisible !== undefined) {
    this._sessionsVisible = savedVisible;
    this.classList.toggle("no-sessions", !savedVisible);
  }
  
  this.setupEventListeners();
}
```

### Phase 5: Documentation Update
**Files: `CLAUDE.md`, `README.md`**

Add to CLI commands section:
```markdown
- `:ui sessions on/off` - Toggle session bar visibility (useful for single-session users)
```

## Testing Strategy

### Manual Testing
1. Verify `:ui sessions off` hides session bar
2. Verify `:ui sessions on` shows session bar  
3. Verify setting persists across app restarts
4. Test with single session and multiple sessions

### Edge Cases
- App startup with no saved setting (should default to visible)
- Command execution when no current session exists
- CSS layout with different theme combinations

## Alternative Approaches Considered

1. **Full removal vs visibility hidden:** Chose `grid-template-columns: 0 1fr` + `visibility: hidden` for smoother layout transitions
2. **Keyboard shortcut:** Could add `Ctrl+Shift+S` binding in future
3. **Auto-hide for single session:** Could implement auto-detection logic, but explicit control is better UX

## Files Modified

1. `src/frontend/components/app.lit.ts` - CSS + state management
2. `src/frontend/illthorn.ts` - Command handler extension  
3. `CLAUDE.md` - Documentation update
4. `README.md` - User documentation

## Benefits

- **Single-session users** get maximum screen real estate
- **Consistent with existing patterns** (follows `:hud on/off` and `:ui` command structure)
- **Persistent state** across app restarts
- **Smooth animation** for better UX
- **No breaking changes** to existing functionality

This plan provides a clean, maintainable solution that fits perfectly with the existing architecture and user expectations.