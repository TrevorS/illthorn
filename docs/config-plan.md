# Phase 3: Core Managers Implementation Plan

## Current State Analysis

**Completed from Phase 1-2:**
- ✅ Backend config infrastructure (`src/backend/config/`) with TOML support
- ✅ ConfigManager class with load/save methods for highlights and macros
- ✅ IPC handlers and frontend API exposed via `window.Config`
- ✅ Default config templates defined
- ✅ Legacy macro Settings removed, stubbed for Phase 3 implementation
- ✅ Existing UserHighlightManager (but using old Settings API)

**What Needs to be Done in Phase 3:**

## 3.1 Create Clean Highlight Manager
**Location:** `src/frontend/highlights/manager.ts`
1. Create new directory `src/frontend/highlights/`
2. Build HighlightManager class that:
   - Loads patterns from TOML via `window.Config.loadHighlights()`
   - Compiles regex patterns with error handling
   - Applies highlights to HTML elements (integrate with feed/message components)
   - Manages enable/disable state
   - Provides pattern testing capability
3. Migrate useful code from existing `UserHighlightManager` but use Config API instead of Settings

## 3.2 Create Clean Macro Manager
**Location:** `src/frontend/macros/manager.ts`
1. Build MacroManager class in existing `src/frontend/macros/` directory
2. Implement:
   - Load macro bindings from TOML via `window.Config.loadMacros()`
   - Integrate with existing keyboardjs setup
   - Execute commands (single and multi-line) via current session
   - Category support for organized macros
   - Conflict detection with system/meta macros
3. Update existing `src/frontend/macros/index.ts` to use new manager

## 3.3 Manager Singleton Setup
1. Export singleton instances from both managers:
   - `src/frontend/highlights/index.ts` - export highlightManager
   - Update `src/frontend/macros/index.ts` - export macroManager
2. Initialize managers on app startup
3. Handle config loading errors gracefully with fallback defaults

## Key Implementation Details

**Highlight Manager:**
- Cache compiled regex patterns for performance
- Use `<span style="...">` wrapping for highlights
- Handle overlapping patterns (last wins)
- Emit `illthorn:highlights-updated` event for components

**Macro Manager:**
- Clear existing bindings before reload
- Support key formats: `f1`, `ctrl+f1`, `alt+numpad8`
- Split multi-line commands on `\n`
- Send commands via `currentSession().sendCommand()`

**Error Handling:**
- Graceful fallback to defaults on config errors
- User-friendly error messages in CLI feedback
- Continue operation even with broken configs

## Next Steps After Manager Implementation
- Phase 4: CLI command implementation (`:hilite`, `:macro`, `:config`)
- Phase 5: Component integration (Feed highlight application)
- Phase 6: File watching and hot reload
- Phase 7: Error handling and polish

This approach ensures we build clean, maintainable managers that properly integrate with the new TOML config system while preserving existing functionality.