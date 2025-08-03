# Data Flow Architecture

This document describes how data flows through the Illthorn application, from external game connections to user interface rendering and back.

## Overview

Illthorn operates as a bridge between Lich (Ruby scripting framework) and a modern Electron-based UI. The architecture follows a clear separation of concerns with secure IPC communication between the main process (backend) and renderer process (frontend).

## Inbound Flow (Game → UI)

### 1. External Connection

- **Lich processes** run with `--detachable-client=PORT --without-frontend` flags
- Session descriptors are created in `/tmp/simutronics/sessions/` for auto-detection
- Located in: `src/backend/session/detect-lich-sessions.ts:6`

### 2. Backend Session Management

- `BackendSession.connect()` establishes TCP socket connections to Lich processes
- Socket `data` events trigger `onLichMessage()` handlers
- Raw game text is forwarded via IPC: `webContents.send(sessionName + "/lich/message", msg)`
- Located in: `src/backend/session/index.ts`

### 3. Frontend Message Processing

The frontend receives game text and processes it through a multi-stage pipeline:

#### Parser Stage
- `FrontendSession.onMessage()` receives raw game text
- **Parser** converts game XML tags to structured `GameTag` objects
- Handles nested tags, attributes, and text content
- **Stream State Management**: Maintains stream context across multiple XML messages
- Located in: `src/frontend/parser/parser.ts` (legacy) or `src/frontend/parser/saxophone-parser.ts` (new)

#### DOM Conversion Stage  
- **DOM Converter** transforms `GameTag[]` arrays to HTML `DocumentFragment`
- Maps game tags to appropriate HTML elements (links, styles, commands)
- Separates renderable content from metadata
- Located in: `src/frontend/parser/dom.ts`

### 4. UI Rendering

#### Feed Component
- Appends parsed content to scrolling game window
- Auto-scrolls unless user is manually scrolling
- Memory management: auto-prunes to 500 entries max
- Located in: `src/frontend/components/session/feed.ts`

#### Streams Panel
- Extracts special content (thoughts, deaths, etc.) to side panels
- Filters duplicate stream types (speech, bounty, inv, room)
- **Multi-message Stream Handling**: Game sends streams across multiple XML messages
- Content between `<pushStream id="type"/>` and `<popStream/>` is collected into stream tags
- Located in: `src/frontend/session/index.ts:63-67`

#### Highlighting System
- Applies user-defined regex patterns for names/monsters
- Uses mark.js library for DOM highlighting
- Located in: `src/frontend/hilites/`

## Outbound Flow (User → Game)

### 1. Command Input

- **CLI component** captures keyboard input with event listeners
- **Command History** provides arrow key navigation through previous commands
- Supports command completion and editing
- Located in: `src/frontend/components/session/cli.ts`

### 2. Command Routing

Commands are processed differently based on their prefix:

- **`:` prefix** → Illthorn internal commands (themes, UI controls, session management)
- **`;` prefix** → Direct passthrough to Lich without processing  
- **All other commands** → Game commands via `session.sendCommand()`

### 3. Backend Transmission

- `FrontendSession.sendCommand()` makes IPC call to backend
- Backend IPC handler receives command and writes to TCP socket
- Format: `session.sock.write(command + "\r\n")`
- Located in: `src/backend/session/ipc-handlers.ts:31`

## Key Architectural Patterns

### Event-Driven Architecture
- **Backend**: Uses Node.js socket events for TCP communication
- **Frontend**: Custom Bus system for component communication

### Parser Pipeline
The parsing system follows a clear pipeline:
```
Game XML → GameTag objects → HTML DOM → Styled rendering
```

**Critical Stream Handling**: The Wrayth protocol sends stream content across multiple separate XML messages:
1. `<pushStream id="inv"/>` - Stream control message
2. Content messages (without stream tags)
3. `<popStream/>` - Stream end message

Parser must maintain stream state across multiple `parse()` calls to prevent duplicate content.

### Secure IPC Communication
- Uses Electron's contextBridge for secure main/renderer communication
- Typed method enums prevent invalid IPC calls
- All APIs exposed through preload script

### Session Management
- Both backend and frontend maintain session maps
- Supports multiple simultaneous character connections
- Session focus switching with keyboard shortcuts

### Memory Management
- Feed component auto-prunes old messages to prevent memory bloat
- Streams panel maintains separate message history
- Parser resets tag parsing state but maintains stream context across messages

## File References

### Backend Files
- `src/backend/session/index.ts` - Core session management and TCP handling
- `src/backend/session/detect-lich-sessions.ts` - Auto-detection of Lich processes
- `src/backend/session/ipc-handlers.ts` - IPC method handlers
- `src/backend/session/mainworld-api.ts` - Renderer-safe API exposure

### Frontend Files  
- `src/frontend/session/index.ts` - Frontend session lifecycle and message processing
- `src/frontend/parser/parser.ts` - Legacy game text parsing engine
- `src/frontend/parser/saxophone-parser.ts` - Modern streaming parser with multi-message support
- `src/frontend/parser/parser-factory.ts` - Parser abstraction and feature flags
- `src/frontend/parser/dom.ts` - HTML conversion and rendering
- `src/frontend/components/session/feed.ts` - Main game text display
- `src/frontend/components/session/cli.ts` - Command input handling
- `src/frontend/session/command-history.ts` - Command history management

### IPC Communication
- `src/preload.ts` - Context bridge setup
- `src/backend/session/methods.ts` - IPC method enumeration