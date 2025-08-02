# Illthorn Debug Window - Planning Document

## Overview

A dedicated Electron debugging window for Illthorn development that provides real-time visibility into game text processing, parser behavior, and session state. This will be a separate window from the main application, focused on developer debugging needs.

## Core Requirements

### 1. Real-Time Log Streaming (Single Session Focus)
- **Live game text display** with syntax highlighting for XML tags
- **Single session debugging** - tracks the currently active session only
- **Filtering controls** by log level and debug namespace (`illthorn:*`)
- **Search functionality** with regex support and result highlighting
- **Auto-scroll controls** with pause/resume and scroll-to-bottom
- **Performance metrics** showing message rates and buffer usage

### 2. Parser State Inspection
- **Raw input viewer** showing incoming Lich data for active session
- **Parse tree visualization** showing GameTag transformation steps
- **DOM output preview** displaying final rendered HTML
- **Parse performance metrics** (timing, tag counts, error rates)
- **Error highlighting** for malformed or problematic input
- **Side-by-side comparison** of input → parsed → rendered

### 3. Debug Controls Dashboard
- **Namespace toggles** for all `illthorn:*` debug categories:
  - `illthorn:bus` - Bus event dispatching and subscriptions
  - `illthorn:metadata` - XML metadata processing and event creation
  - `illthorn:raw-input` - Raw Lich input data before parsing
  - `illthorn:effects` - Effects component event processing
  - `illthorn:session` - Session-level message processing
- **Log level controls** (error, warn, info, debug, trace)
- **Export functionality** for saving current session logs and parser state
- **Clear logs button** for fresh debugging sessions
- **Session connection status** and health monitoring

## Architecture Design

### Electron Window Integration
```typescript
// Main process - debug window management
class DebugWindowManager {
  private debugWindow?: BrowserWindow;
  
  createDebugWindow() {
    this.debugWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      title: 'Illthorn Debug Console',
      webPreferences: {
        preload: path.join(__dirname, 'debug-preload.js'),
        nodeIntegration: false,
        contextIsolation: true
      }
    });
  }
  
  // IPC handlers for debug data streaming
  setupDebugIPCHandlers() {
    ipcMain.handle('debug:get-session-data', () => this.getCurrentSessionData());
    ipcMain.handle('debug:toggle-namespace', (event, namespace, enabled) => {
      this.updateDebugNamespace(namespace, enabled);
    });
  }
}
```

### IPC Communication Pattern
- **Main App → Debug Window**: Real-time streaming of session data, parser events, debug logs
- **Debug Window → Main App**: Control commands (toggle namespaces, export data, session selection)
- **Shared State Management**: Debug settings synchronized between windows

### Data Flow Architecture
1. **Session Events**: Main app emits debug events via IPC to debug window
2. **Real-time Updates**: Debug window receives events and updates Lit components reactively
3. **Parser Integration**: Hook into existing parser to capture raw → parsed → DOM transformation
4. **Export System**: Save debugging sessions as JSON for later analysis

## Component Selection & Layout

### Three-Pane Layout Using Shoelace
```html
<sl-split-panel position="33" no-divider>
  <!-- Left Pane: Live Logs -->
  <div slot="start">
    <debug-log-viewer></debug-log-viewer>
  </div>
  
  <sl-split-panel position="50" vertical slot="end">
    <!-- Top Right: Parser Inspector -->
    <div slot="start">
      <debug-parser-inspector></debug-parser-inspector>
    </div>
    
    <!-- Bottom Right: Controls -->
    <div slot="end">
      <debug-controls-panel></debug-controls-panel>
    </div>
  </sl-split-panel>
</sl-split-panel>
```

### Selected Shoelace Components

#### Layout & Structure
- **`<sl-split-panel>`** - Main three-pane resizable layout
- **`<sl-card>`** - Organizing different debug sections
- **`<sl-tab-group>`** - Sub-navigation within panes if needed

#### Data Display  
- **`<sl-badge>`** - Log level indicators, session status, error counts
- **`<sl-progress-bar>`** - Parse performance, connection health, buffer usage
- **`<sl-tree>`** - Parser state and DOM tree visualization (if needed)

#### Controls & Input
- **`<sl-input>`** - Search field for log filtering
- **`<sl-switch>`** - Debug namespace on/off toggles
- **`<sl-button-group>`** - Action buttons (clear, export, pause/resume)
- **`<sl-select>`** - Log level filtering dropdown

#### Interactive Elements
- **`<sl-tooltip>`** - Contextual help for debug controls
- **`<sl-alert>`** - Status notifications and error messages
- **`<sl-copy-button>`** - Easy copying of logs, errors, and parser state
- **`<sl-dialog>`** - Export configuration and settings modals

## Lit Component Architecture

### Main Debug App (`src/debug-window/debug-app.lit.ts`)
```typescript
// ABOUTME: Main debug application component managing the three-pane layout
// ABOUTME: Coordinates data flow between log viewer, parser inspector, and controls
@customElement('illthorn-debug-app')
export class DebugApp extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100vh;
      --sl-panel-divider-color: var(--sl-color-neutral-200);
    }
  `;

  @state() currentSession = '';
  @state() logEntries: LogEntry[] = [];
  @state() debugNamespaces = new Set(['illthorn:bus', 'illthorn:metadata']);
  @state() paused = false;
  @state() rawInput = '';
  @state() parsedTags: GameTag[] = [];
  @state() parseMetrics = { time: 0, tagCount: 0, errors: 0 };

  connectedCallback() {
    super.connectedCallback();
    this.setupIPCListeners();
  }

  private setupIPCListeners() {
    window.debugAPI.onSessionData((data) => {
      if (!this.paused) {
        this.logEntries = [...this.logEntries, ...data.logs].slice(-1000);
        this.rawInput = data.rawInput;
        this.parsedTags = data.parsedTags;
        this.parseMetrics = data.metrics;
      }
    });
  }

  render() {
    return html`
      <sl-split-panel position="33" no-divider>
        <div slot="start">
          <debug-log-viewer 
            .entries=${this.logEntries}
            .paused=${this.paused}
            @toggle-pause=${this.handleTogglePause}>
          </debug-log-viewer>
        </div>
        
        <sl-split-panel position="50" vertical slot="end">
          <div slot="start">
            <debug-parser-inspector 
              .rawInput=${this.rawInput}
              .parsedTags=${this.parsedTags}
              .metrics=${this.parseMetrics}>
            </debug-parser-inspector>
          </div>
          
          <div slot="end">
            <debug-controls-panel 
              .namespaces=${this.debugNamespaces}
              .sessionName=${this.currentSession}
              @namespace-toggle=${this.handleNamespaceToggle}
              @export-logs=${this.handleExportLogs}>
            </debug-controls-panel>
          </div>
        </sl-split-panel>
      </sl-split-panel>
    `;
  }
}
```

### Log Viewer Component (`src/debug-window/debug-log-viewer.lit.ts`)
```typescript
// ABOUTME: Real-time log viewer with filtering, search, and auto-scroll
// ABOUTME: Displays formatted game text with syntax highlighting for XML tags
@customElement('debug-log-viewer')  
export class LogViewer extends LitElement {
  @property({ type: Array }) entries: LogEntry[] = [];
  @property({ type: Boolean }) paused = false;
  @state() filter = '';
  @state() autoScroll = true;
  @state() logLevel = 'debug';

  private logContainer?: HTMLElement;

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('entries') && this.autoScroll && !this.paused) {
      this.scrollToBottom();
    }
  }

  private scrollToBottom() {
    if (this.logContainer) {
      this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }
  }

  render() {
    const filteredEntries = this.entries.filter(entry => 
      entry.message.toLowerCase().includes(this.filter.toLowerCase()) &&
      this.shouldShowLogLevel(entry.level)
    );

    return html`
      <sl-card class="log-viewer">
        <div slot="header" class="log-controls">
          <sl-input 
            placeholder="Search logs..." 
            .value=${this.filter}
            @sl-input=${(e: CustomEvent) => this.filter = e.target.value}>
            <sl-icon name="search" slot="prefix"></sl-icon>
          </sl-input>
          
          <sl-select .value=${this.logLevel} @sl-change=${this.handleLogLevelChange}>
            <sl-option value="error">Error</sl-option>
            <sl-option value="warn">Warn</sl-option>
            <sl-option value="info">Info</sl-option>
            <sl-option value="debug">Debug</sl-option>
            <sl-option value="trace">Trace</sl-option>
          </sl-select>
          
          <sl-button-group>
            <sl-button 
              variant=${this.paused ? 'primary' : 'default'}
              @click=${this.togglePause}>
              ${this.paused ? 'Resume' : 'Pause'}
            </sl-button>
            <sl-button @click=${this.clearLogs}>Clear</sl-button>
          </sl-button-group>
        </div>
        
        <div class="log-content" ${ref(this.logContainer)}>
          ${filteredEntries.map(entry => html`
            <div class="log-entry log-${entry.level}">
              <span class="timestamp">${formatTime(entry.timestamp)}</span>
              <sl-badge variant=${this.getBadgeVariant(entry.level)}>${entry.level}</sl-badge>
              <span class="namespace">${entry.namespace}</span>
              <pre class="message">${this.highlightXML(entry.message)}</pre>
            </div>
          `)}
        </div>
      </sl-card>
    `;
  }
}
```

### Parser Inspector Component (`src/debug-window/debug-parser-inspector.lit.ts`)
```typescript
// ABOUTME: Parser state visualization showing raw → GameTag → DOM transformation
// ABOUTME: Includes performance metrics and error highlighting for debugging parser issues
@customElement('debug-parser-inspector')
export class ParserInspector extends LitElement {
  @property({ type: String }) rawInput = '';
  @property({ type: Array }) parsedTags: GameTag[] = [];
  @property({ type: Object }) metrics = { time: 0, tagCount: 0, errors: 0 };

  render() {
    return html`
      <sl-card class="parser-inspector">
        <div slot="header">
          Parser State
          <sl-badge variant="neutral">${this.metrics.tagCount} tags</sl-badge>
          <sl-badge variant=${this.metrics.time > 10 ? 'warning' : 'success'}>
            ${this.metrics.time}ms
          </sl-badge>
          ${this.metrics.errors > 0 ? html`
            <sl-badge variant="danger">${this.metrics.errors} errors</sl-badge>
          ` : ''}
        </div>
        
        <sl-tab-group>
          <sl-tab slot="nav" panel="raw">Raw Input</sl-tab>
          <sl-tab slot="nav" panel="parsed">Parsed Tags</sl-tab>
          <sl-tab slot="nav" panel="dom">DOM Output</sl-tab>
          
          <sl-tab-panel name="raw">
            <pre class="raw-input">${this.highlightXML(this.rawInput)}</pre>
          </sl-tab-panel>
          
          <sl-tab-panel name="parsed">
            <div class="parsed-tags">
              ${this.parsedTags.map((tag, index) => html`
                <div class="tag-entry">
                  <sl-badge variant="primary">${index}</sl-badge>
                  <code>${tag.name}</code>
                  ${tag.attrs ? html`<span class="attrs">${JSON.stringify(tag.attrs)}</span>` : ''}
                  ${tag.text ? html`<span class="text">"${tag.text}"</span>` : ''}
                </div>
              `)}
            </div>
          </sl-tab-panel>
          
          <sl-tab-panel name="dom">
            <div class="dom-output">
              <!-- Rendered DOM preview would go here -->
            </div>
          </sl-tab-panel>
        </sl-tab-group>
      </sl-card>
    `;
  }
}
```

### Controls Panel Component (`src/debug-window/debug-controls-panel.lit.ts`)
```typescript
// ABOUTME: Debug controls for namespace toggles, export, and session management
// ABOUTME: Provides interface for configuring debug logging and exporting session data
@customElement('debug-controls-panel')
export class ControlsPanel extends LitElement {
  @property({ type: Set }) namespaces = new Set<string>();
  @property({ type: String }) sessionName = '';

  private availableNamespaces = [
    'illthorn:bus',
    'illthorn:metadata', 
    'illthorn:raw-input',
    'illthorn:effects',
    'illthorn:session'
  ];

  render() {
    return html`
      <sl-card class="controls-panel">
        <div slot="header">Debug Controls</div>
        
        <div class="session-info">
          <h4>Active Session</h4>
          <sl-badge variant="primary">${this.sessionName || 'None'}</sl-badge>
        </div>
        
        <div class="namespace-controls">
          <h4>Debug Namespaces</h4>
          ${this.availableNamespaces.map(ns => html`
            <sl-switch 
              .checked=${this.namespaces.has(ns)}
              @sl-change=${(e: CustomEvent) => this.toggleNamespace(ns, e.target.checked)}>
              ${ns}
            </sl-switch>
          `)}
        </div>
        
        <div class="export-controls">
          <h4>Export & Utilities</h4>
          <sl-button-group>
            <sl-button @click=${this.exportLogs}>
              <sl-icon name="download" slot="prefix"></sl-icon>
              Export Logs
            </sl-button>
            <sl-button @click=${this.exportParserState}>
              <sl-icon name="code" slot="prefix"></sl-icon>
              Export Parser State
            </sl-button>
          </sl-button-group>
        </div>
      </sl-card>
    `;
  }

  private toggleNamespace(namespace: string, enabled: boolean) {
    this.dispatchEvent(new CustomEvent('namespace-toggle', {
      detail: { namespace, enabled }
    }));
  }

  private exportLogs() {
    this.dispatchEvent(new CustomEvent('export-logs'));
  }

  private exportParserState() {
    this.dispatchEvent(new CustomEvent('export-parser-state'));
  }
}
```

## Implementation Sequence & Rationale

### Why Debug Window Before Saxophone Parser Migration

1. **Risk Management**
   - Parser change is HIGH RISK - affects all game text processing
   - Debug window is LOW RISK - additive feature that won't break existing functionality
   - If parser conversion introduces bugs, debugging tools will be essential

2. **Testing Infrastructure** 
   - Debug window will be invaluable for testing saxophone integration
   - Side-by-side comparison of hand-rolled vs saxophone output
   - Real-time visibility into parsing behavior, performance, and edge cases
   - Easier regression detection during parser migration

3. **Development Efficiency**
   - Debug window provides immediate value for current development
   - Better understanding of parser behavior patterns before replacement
   - Saxophone integration bugs will be much easier to diagnose

4. **Parser-Specific Insights**
   - Current parser has game-specific preprocessing (`<pushBold/>` → `<b>`)
   - Debug window will help identify all custom logic that needs preservation
   - Test saxophone's handling of malformed/streaming XML from the game
   - Ensure GameTag conversion maintains compatibility

### Development Phases

#### Phase 1: Debug Window Foundation (2-3 days)
1. **Electron window setup** - Create debug window in main process
2. **Basic IPC communication** - Data streaming from main app
3. **Core Lit components** - Basic three-pane layout with Shoelace
4. **Real-time log display** - Working log viewer with current session

#### Phase 2: Parser Integration (1-2 days) 
1. **Parser hook integration** - Capture raw → parsed → DOM transformation
2. **Performance metrics** - Timing and error tracking
3. **Parser state visualization** - Complete inspector component
4. **Debug controls** - Namespace toggles and export functionality

#### Phase 3: Saxophone Migration (1-2 days)
1. **Parallel parser implementation** - Run both parsers simultaneously
2. **Output comparison** - Validate identical GameTag generation
3. **Performance testing** - Benchmark saxophone vs hand-rolled
4. **Final cutover** - Switch to saxophone with debug window validation

## Technical Specifications

### Data Types
```typescript
interface LogEntry {
  timestamp: Date;
  level: 'error' | 'warn' | 'info' | 'debug' | 'trace';
  namespace: string;
  message: string;
  sessionName: string;
}

interface ParseMetrics {
  time: number;        // Parse time in milliseconds
  tagCount: number;    // Number of tags parsed
  errors: number;      // Parse errors encountered
  inputLength: number; // Raw input character count
}

interface SessionDebugData {
  sessionName: string;
  logs: LogEntry[];
  rawInput: string;
  parsedTags: GameTag[];
  metrics: ParseMetrics;
  connectionStatus: 'connected' | 'disconnected' | 'error';
}
```

### IPC API
```typescript
// Main → Debug Window
interface DebugAPI {
  onSessionData(callback: (data: SessionDebugData) => void): void;
  onLogEntry(callback: (entry: LogEntry) => void): void;
}

// Debug Window → Main
interface DebugControl {
  toggleNamespace(namespace: string, enabled: boolean): Promise<void>;
  exportLogs(format: 'json' | 'txt'): Promise<string>;
  clearLogs(): Promise<void>;
  getSessionList(): Promise<string[]>;
}
```

### File Structure
```
src/
├── debug-window/
│   ├── debug-app.lit.ts           # Main debug application
│   ├── debug-log-viewer.lit.ts    # Log viewer component  
│   ├── debug-parser-inspector.lit.ts # Parser state inspector
│   ├── debug-controls-panel.lit.ts   # Controls and settings
│   ├── debug-preload.ts            # Preload script for IPC
│   ├── debug-types.ts              # Type definitions
│   └── debug-styles.css            # Shared styling
├── main/
│   └── debug-window-manager.ts     # Electron window management
└── backend/
    └── debug-ipc-handlers.ts       # IPC handlers for debug data
```

## Future Enhancements

### Advanced Features (Post-MVP)
- **Game event replay system** - Record and playback debugging sessions
- **Parser regression testing** - Automated testing interface for parser changes
- **Performance monitoring** - Real-time charts and profiling
- **MCP server integration** - Connect Claude Code for development assistance
- **Session recording** - Save complete debugging sessions for later analysis

This debug window will serve as both a standalone development tool and foundation for future MCP integration, providing comprehensive visibility into Illthorn's game text processing pipeline.