# Config-Based CLI Macros and Highlights Implementation Plan

## Overview

Complete implementation plan for TOML-based configuration system with CLI commands for highlights and macros. No legacy preservation needed - clean slate implementation with human-readable config files.

## Architecture Summary

```
TOML Config Files → Config Manager → Highlights/Macro Managers → CLI Commands → UI Integration
```

**Key Decisions:**
- TOML files in `~/.config/illthorn/` (human-readable)
- All features accessible via `:` CLI commands
- No settings UI initially (config files are the interface)
- File watching for hot reload
- Lich integration for advanced scripting

---

## Phase 1: Infrastructure Setup

### TODO 1.1: Add TOML Dependencies
**File:** `package.json`
```bash
yarn add @iarna/toml
yarn add @types/node  # if not already present
```
**Verification:** TOML import works in TypeScript

### TODO 1.2: Create Config Directory Structure
**Files:**
- `src/backend/config/` (new directory)
- `src/backend/config/methods.ts`
- `src/backend/config/ipc-handlers.ts`
- `src/backend/config/mainworld-api.ts`

**Config Methods Needed:**
- `getConfigPath()` - Returns config directory path
- `loadHighlights()` - Load highlights.toml
- `loadMacros()` - Load macros.toml
- `saveHighlights(config)` - Save highlights.toml
- `saveMacros(config)` - Save macros.toml
- `openInEditor(filename)` - Open config file in default editor
- `openConfigDir()` - Open config directory in file explorer

**Implementation Details:**
```typescript
// Config directory: ~/.config/illthorn/ (Linux/Mac) or %APPDATA%/illthorn (Windows)
const configDir = path.join(
  process.platform === 'win32'
    ? process.env.APPDATA || ''
    : os.homedir() + '/.config',
  'illthorn'
);
```

**Verification:** Can read/write TOML files to config directory

### TODO 1.3: Create Default Config Files
**Files:** Create defaults for:
- `highlights.toml` - Empty but valid structure
- `macros.toml` - Empty but valid structure
- `presets/combat-highlights.toml` - Example patterns
- `presets/default-macros.toml` - Basic macro examples

**highlights.toml Template:**
```toml
[settings]
enabled = true
case_sensitive = false

# Example pattern (delete this section)
[[patterns]]
name = "example"
pattern = "\\btest\\b"
color = "#ff0000"
bold = true
```

**macros.toml Template:**
```toml
[settings]
enabled = true

# Example macros (delete this section)
[examples]
"f1" = "look"
"ctrl+1" = "stance offensive"
```

**Verification:** Config files created on first run if missing

### TODO 1.4: Frontend Config API
**File:** `src/frontend/config/api.ts`

```typescript
export interface HighlightPattern {
  name: string;
  pattern: string;
  color?: string;
  background?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export interface HighlightConfig {
  settings: { enabled: boolean; case_sensitive: boolean };
  patterns: HighlightPattern[];
}

export interface MacroConfig {
  settings: { enabled: boolean };
  [category: string]: Record<string, string> | { enabled: boolean };
}

// Window API extensions
declare global {
  interface Window {
    Config: {
      getConfigPath(): Promise<string>;
      loadHighlights(): Promise<HighlightConfig>;
      loadMacros(): Promise<MacroConfig>;
      saveHighlights(config: HighlightConfig): Promise<void>;
      saveMacros(config: MacroConfig): Promise<void>;
      openInEditor(filename: string): Promise<void>;
      openConfigDir(): Promise<void>;
    };
  }
}
```

**Verification:** `window.Config` API available in renderer

---

## Phase 2: Legacy Code Removal

### TODO 2.1: Remove Legacy Highlight System
**Files to Remove:**
- `src/frontend/hilites/index.ts` (entire file)
- Any Mark.js imports/usage

**Files to Update:**
- Remove imports of old hilites system
- Remove any references to `loadHilites()`, `reloadHilites()`, etc.

**Verification:** No build errors, no references to old system

### TODO 2.2: Remove Legacy Macro Storage
**Files to Update:**
- Remove electron-store usage for macros in `src/frontend/macros/index.ts`
- Keep keyboardjs integration but remove settings persistence

**Verification:** Macros still work but don't persist (temporarily)

---

## Phase 3: Core Managers Implementation

### TODO 3.1: Create Clean Highlight Manager
**File:** `src/frontend/highlights/manager.ts`

**Core Requirements:**
- Load patterns from TOML config
- Compile regex patterns with error handling
- Apply highlights to HTML elements
- Enable/disable functionality
- Pattern testing capability

**Key Methods:**
```typescript
class HighlightManager {
  async loadFromConfig(): Promise<void>
  setEnabled(enabled: boolean): void
  applyHighlights(element: HTMLElement): void
  testPattern(pattern: string, text: string): boolean
  getPatterns(): HighlightPattern[]
}
```

**Pattern Compilation:**
- Catch regex errors gracefully
- Support case sensitivity toggle
- Cache compiled patterns for performance

**HTML Application:**
- Find matches in text content
- Wrap matches with `<span style="...">`
- Don't break existing DOM structure
- Handle overlapping patterns (last wins)

**Verification:** Can load config, compile patterns, apply to test HTML

### TODO 3.2: Create Clean Macro Manager
**File:** `src/frontend/macros/manager.ts`

**Core Requirements:**
- Load macro bindings from TOML config
- Integrate with keyboardjs for key binding
- Execute commands (single and multi-line)
- Category support
- Conflict detection

**Key Methods:**
```typescript
class MacroManager {
  async loadFromConfig(): Promise<void>
  setEnabled(enabled: boolean): void
  getBindings(): MacroBinding[]
  hasConflict(key: string): boolean
  private executeMacro(command: string): void
}
```

**Key Binding:**
- Clear existing bindings before reload
- Bind new keys from config
- Handle key combination formats (ctrl+f1, alt+numpad8, etc.)
- Detect conflicts with system keys

**Command Execution:**
- Split multi-line commands on `\n`
- Send each command to current session
- Handle empty/whitespace-only lines
- Provide execution feedback

**Verification:** Can load config, bind keys, execute commands

### TODO 3.3: Manager Singleton Setup
**Files:**
- `src/frontend/highlights/index.ts` (export singleton)
- `src/frontend/macros/index.ts` (export singleton)

```typescript
// highlights/index.ts
export const highlightManager = new HighlightManager();

// macros/index.ts
export const macroManager = new MacroManager();
```

**Integration with App Startup:**
- Load configs on app initialization
- Handle config loading errors gracefully
- Provide fallback defaults if configs missing

**Verification:** Managers available globally, configs loaded on startup

---

## Phase 4: CLI Command Implementation

### TODO 4.1: Highlight CLI Commands
**File:** `src/frontend/illthorn.ts` (update `handleCommand` method)

**Commands to Implement:**
- `:hilite reload` - Reload highlights.toml
- `:hilite list` - Show loaded patterns
- `:hilite test <pattern> <text>` - Test pattern against text
- `:hilite edit` - Open highlights.toml in editor
- `:hilite on` - Enable highlights
- `:hilite off` - Disable highlights

**Implementation Pattern:**
```typescript
// In handleCommand method
if (command.startsWith(':hilite ')) {
  return this.handleHighlightCommand(command);
}

private async handleHighlightCommand(command: string): Promise<void> {
  const [, subCommand, ...args] = command.split(' ');

  switch (subCommand) {
    case 'reload':
      await highlightManager.loadFromConfig();
      this.showMessage('Highlights reloaded from config');
      break;
    // ... other cases
  }
}
```

**Message Display:**
- Use existing `IllthornEvent.CLIENT_MESSAGE` for feedback
- Format output nicely (especially for `:hilite list`)
- Handle errors gracefully with helpful messages

**Verification:** All highlight commands work and provide feedback

### TODO 4.2: Macro CLI Commands
**File:** `src/frontend/illthorn.ts` (update `handleCommand` method)

**Commands to Implement:**
- `:macro reload` - Reload macros.toml
- `:macro list` - Show bound macros by category
- `:macro edit` - Open macros.toml in editor
- `:macro on` - Enable macros
- `:macro off` - Disable macros
- `:macro test <key>` - Show what a key binding would execute

**List Output Format:**
```
Loaded macros:
  [combat]
    ctrl+1 → stance offensive
    f1 → attack
  [movement]
    ctrl+numpad8 → north
    ctrl+numpad2 → south
```

**Verification:** All macro commands work and provide feedback

### TODO 4.3: Config CLI Commands
**File:** `src/frontend/illthorn.ts` (update `handleCommand` method)

**Commands to Implement:**
- `:config` - Show config directory path
- `:config open` - Open config directory in file explorer
- `:config reload` - Reload all configurations
- `:config edit <file>` - Open specific config file

**Path Display:**
- Show full path to config directory
- Indicate if configs are loaded successfully
- Show last modified times

**Verification:** All config commands work

---

## Phase 5: Component Integration

### TODO 5.1: Feed Component Highlight Integration
**File:** `src/frontend/components/session/feed/feed-modernized.lit.ts`

**Integration Points:**
- Apply highlights after appending new game tags
- Re-apply highlights when highlight config changes
- Don't highlight content that's already highlighted

**Implementation:**
```typescript
private applyHighlights(): void {
  // Find new content that needs highlighting
  const newContent = this.shadowRoot?.querySelectorAll('.content .new');

  newContent?.forEach(element => {
    highlightManager.applyHighlights(element as HTMLElement);
    element.classList.remove('new');
  });
}

protected updated(changedProperties: Map<string, any>): void {
  super.updated(changedProperties);

  if (changedProperties.has('_messages')) {
    // Mark new content for highlighting
    this.markNewContent();
    this.applyHighlights();
  }
}
```

**Performance Considerations:**
- Only highlight new content, not entire feed
- Debounce highlight application for rapid updates
- Cache compiled patterns

**Verification:** Highlights appear in game text, update when config changes

### TODO 5.2: Macro Keyboard Integration
**File:** `src/frontend/macros/index.ts` (update existing bindMacros)

**Integration:**
- Replace current macro loading with config-based loading
- Keep existing meta-macros (Alt+1-9, PageUp/Down, etc.)
- Ensure macro execution integrates with current session

**Load Order:**
1. Load user macros from config
2. Bind meta-macros (session switching, etc.)
3. Handle conflicts (user macros override meta-macros)

**Session Integration:**
- Use existing `currentSession()` helper
- Send commands via `session.sendCommand()`
- Handle multi-line commands properly

**Verification:** Macros execute commands in current session

### TODO 5.3: Event Bus Integration
**Files:** Various (add event listeners)

**Events to Add:**
- `config:highlights-reloaded` - When highlights config changes
- `config:macros-reloaded` - When macros config changes
- `config:error` - When config loading fails

**Event Handling:**
- Feed component listens for highlight reload events
- CLI provides user feedback for all config events
- Error events show helpful messages

**Verification:** Components react to config changes automatically

---

## Phase 6: File Watching and Hot Reload

### TODO 6.1: Backend File Watcher
**File:** `src/backend/config/watcher.ts`

**Requirements:**
- Watch config directory for changes
- Detect .toml file modifications
- Send IPC events to frontend when files change
- Handle rapid successive changes (debounce)

**Implementation:**
```typescript
import { watch } from 'fs';

export class ConfigWatcher {
  private watchers: Map<string, FSWatcher> = new Map();

  start(configPath: string): void {
    const watcher = watch(configPath, { recursive: true });

    watcher.on('change', debounce((filename) => {
      if (filename?.endsWith('.toml')) {
        this.notifyConfigChange(filename);
      }
    }, 500));
  }

  private notifyConfigChange(filename: string): void {
    // Send IPC event to frontend
  }
}
```

**IPC Integration:**
- Add watcher methods to config IPC handlers
- Send events to all renderer windows
- Include filename in change notifications

**Verification:** File changes detected and communicated to frontend

### TODO 6.2: Frontend Auto-reload
**File:** `src/frontend/config/auto-reload.ts`

**Requirements:**
- Listen for file change IPC events
- Automatically reload appropriate manager
- Show user feedback for auto-reloads
- Handle reload errors gracefully

**Implementation:**
```typescript
export class AutoReloader {
  start(): void {
    window.Config.onFileChange((filename: string) => {
      this.handleFileChange(filename);
    });
  }

  private async handleFileChange(filename: string): Promise<void> {
    try {
      if (filename === 'highlights.toml') {
        await highlightManager.loadFromConfig();
        this.showMessage('Highlights reloaded (file changed)');
      } else if (filename === 'macros.toml') {
        await macroManager.loadFromConfig();
        this.showMessage('Macros reloaded (file changed)');
      }
    } catch (error) {
      this.showError(`Config reload failed: ${error.message}`);
    }
  }
}
```

**User Feedback:**
- Show subtle notification for successful reloads
- Show prominent error for failed reloads
- Don't spam user with too many notifications

**Verification:** External config edits automatically take effect

---

## Phase 7: Error Handling and Polish

### TODO 7.1: Robust Error Handling
**Files:** All manager and command files

**Error Scenarios to Handle:**
- Invalid TOML syntax
- Invalid regex patterns
- Missing config files
- Permission errors
- Invalid key combinations
- Config file corruption

**Error Handling Strategy:**
```typescript
// Graceful degradation - continue with defaults
try {
  await this.loadFromConfig();
} catch (error) {
  console.warn('Config load failed, using defaults:', error);
  this.loadDefaults();
  this.showError(`Config error: ${error.message}. Using defaults.`);
}
```

**User-Friendly Messages:**
- Explain what went wrong
- Suggest how to fix it
- Provide fallback behavior
- Include line numbers for syntax errors

**Verification:** App remains functional even with broken configs

### TODO 7.2: Create Preset Configurations
**Files:** `presets/` directory

**Combat Highlights Preset:**
- Hit/miss/critical patterns
- Death/stun/wound patterns
- Damage type patterns
- Common combat verbs

**Item Highlights Preset:**
- Weapon patterns
- Armor patterns
- Gem patterns
- Currency patterns
- Container patterns

**Communication Highlights Preset:**
- OOC channel patterns
- Say/whisper patterns
- Guild/group chat patterns
- System message patterns

**Basic Macros Preset:**
- Combat stances (Ctrl+1-5)
- Movement (Ctrl+Numpad)
- Quick actions (F1-F12)
- Common commands

**Verification:** Presets load without errors and provide useful highlighting

### TODO 7.3: Documentation and Help
**Files:**
- `docs/configuration.md` - Config file format documentation
- Add help text to CLI commands

**CLI Help:**
- `:hilite` (no args) - Show available hilite commands
- `:macro` (no args) - Show available macro commands
- `:config help` - Show config system overview

**Documentation Topics:**
- TOML syntax basics
- Regex pattern examples
- Key combination formats
- Troubleshooting common issues
- Preset usage

**Verification:** Users can understand and use the system without external help

---

## Testing Checklist

### Manual Testing
- [ ] Can create/edit config files manually
- [ ] CLI commands provide appropriate feedback
- [ ] Highlights appear in game text
- [ ] Macros execute correct commands
- [ ] File watching works for external edits
- [ ] Error handling works for broken configs
- [ ] Presets load and work correctly

### Integration Testing
- [ ] Config loading works on app startup
- [ ] Managers integrate properly with existing systems
- [ ] No conflicts with existing keyboard shortcuts
- [ ] Performance acceptable with many patterns/macros
- [ ] Memory usage reasonable

### Edge Case Testing
- [ ] Empty config files
- [ ] Invalid regex patterns
- [ ] Conflicting macro keys
- [ ] Very long patterns/commands
- [ ] Special characters in patterns
- [ ] File permission issues

---

## Implementation Timeline

| Phase | Duration | Dependencies |
|-------|----------|-------------|
| 1. Infrastructure | 1 day | TOML library |
| 2. Legacy Cleanup | 0.5 day | Phase 1 |
| 3. Core Managers | 1.5 days | Phase 2 |
| 4. CLI Commands | 1 day | Phase 3 |
| 5. Integration | 1 day | Phase 4 |
| 6. File Watching | 0.5 day | Phase 5 |
| 7. Polish | 1 day | Phase 6 |

**Total: 6.5 days**

---

## Success Criteria

✅ **Functional:**
- All CLI commands work as documented
- Highlights apply to game text correctly
- Macros execute commands in current session
- Config files are human-readable and editable
- External edits take effect automatically

✅ **Non-Functional:**
- No performance degradation with 50+ patterns
- No performance degradation with 20+ macros
- Config loading takes < 100ms
- Error messages are helpful and actionable
- System remains usable with broken configs

✅ **User Experience:**
- Can configure everything via files (no UI needed)
- Changes take effect immediately
- Clear feedback for all operations
- Easy to share configurations
- Simple to backup/restore settings

This incremental approach ensures each step builds on the previous ones while maintaining a working system throughout development.