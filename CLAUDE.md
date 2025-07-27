# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Illthorn is a modern cross-platform Electron application that serves as a front-end client for Gemstone IV, a text-based MUD (Multi-User Dungeon). The app connects to Lich (a Ruby-based scripting framework) via TCP sockets and provides a rich UI with themes, highlighting, command history, and multi-session support.

## Development Commands

### Core Development
- **Start development**: `yarn start` - Launches Electron in development mode with hot reload
- **Build package**: `yarn make` - Creates distributable packages in `/out/`
- **Install dependencies**: `yarn install`

### Code Quality
- **Lint**: `yarn lint` - Runs ESLint on TypeScript files
- **Test**: `yarn test` - Runs AVA test suite (alias for `yarn ava`)

### Versioning
- **Release candidate**: `yarn rc` - Creates prerelease version, commits, and pushes tags

## Architecture Overview

### Electron Multi-Process Structure
- **Main Process** (`src/main.ts`): Electron app initialization, window management, and backend coordination
- **Preload Script** (`src/preload.ts`): Secure context bridge exposing APIs to renderer
- **Renderer Process** (`src/frontend/index.ts`): Frontend application initialization and UI management

### Backend Architecture (`src/backend/`)
The backend uses a modular IPC (Inter-Process Communication) pattern:
- **Session Management** (`session/`): Handles TCP connections to Lich processes, session lifecycle
- **App Management** (`app/`): Core application state and operations  
- **Settings Management** (`settings/`): Configuration persistence and retrieval
- Each module has three key files:
  - `ipc-handlers.ts`: Main process IPC event handlers
  - `mainworld-api.ts`: Renderer-safe API exposure via preload
  - `methods.ts`: Core business logic implementation

### Frontend Architecture (`src/frontend/`)
- **Session Management** (`session/`): Frontend session state, command handling, UI rendering
- **Components** (`components/`): Reusable UI components organized by feature
- **Parser** (`parser/`): Game text parsing and DOM manipulation for content display
- **Themes** (`styles/themes/`): Multiple visual themes for customization
- **Bus System** (`util/bus.ts`): Event-driven communication between frontend modules

### Key Design Patterns
- **IPC Communication**: Structured three-layer pattern (handlers → API → methods) for secure main/renderer communication
- **Session Mapping**: Both frontend and backend maintain session maps for multi-character support
- **Event Bus**: Custom event system for decoupled frontend component communication
- **Parser Architecture**: Modular text parsing with tag-based content transformation

## Development Notes

### Package Management
- Uses Yarn (specified in volta config: Node 18.17.0, Yarn 3.6.1)
- Electron Forge for build tooling and packaging
- Webpack for bundling with custom configurations

### Testing Setup
- AVA test framework with TypeScript support
- Tests located in `/test/` directory
- ESM module support configured via ts-node

### Game Integration
Connects to Lich processes via TCP sockets on configurable ports (default 8003+). Sessions are auto-detected when Lich runs with `--without-frontend --detachable-client=PORT` flags.

### Theme System
Multiple built-in themes stored in `src/frontend/styles/themes/` with runtime switching via `:theme <name>` commands.