# Anti-Disconnect AFK Feature

## Overview

The AFK (Away From Keyboard) feature prevents automatic disconnection from Gemstone IV by sending periodic keep-alive commands during periods of user inactivity. This is implemented as a frontend-only feature that leverages Illthorn's existing infrastructure.

## Design Philosophy

### Frontend-Only Approach
- **Zero Backend Changes**: Uses existing command pipeline and session management
- **Minimal Complexity**: Builds on proven timer and settings infrastructure
- **Per-Session Tracking**: Each character connection manages idle time independently
- **User Control**: Easily configurable via internal commands

### Integration Points
- **CLI Component**: Activity detection on user command execution
- **Session Management**: Per-session idle state tracking
- **Timer System**: Reuses existing timer infrastructure for countdown management
- **Settings System**: Persistent configuration via electron-store
- **Command Pipeline**: Keep-alive commands sent through normal game command flow

## Architecture

### Core Components

#### IdleManager Class
**Location**: `src/frontend/session/idle-manager.ts`

```typescript
export class IdleManager {
  private lastActivity: number = Date.now();
  private keepAliveTimer?: NodeJS.Timeout;
  private settings: AfkSettings;
  
  // Reset activity timestamp when user sends commands
  resetActivity(): void
  
  // Start/stop idle monitoring based on settings
  startMonitoring(): void
  stopMonitoring(): void
  
  // Send keep-alive command via session.sendCommand()
  private sendKeepAlive(): void
}
```

**Responsibilities**:
- Track last user activity timestamp
- Manage keep-alive timer using `setInterval`
- Send configurable keep-alive commands (`time`, `look`, `health`, etc.)
- Integrate with session lifecycle (start/stop on connect/disconnect)

#### Settings Integration
**Location**: Existing settings system (`src/backend/settings/`)

```typescript
interface AfkSettings {
  enabled: boolean;           // Global AFK feature toggle
  timeoutMinutes: number;     // Minutes of inactivity before keep-alive
  keepAliveCommand: string;   // Command to send ("time", "look", etc.)
  perSession: boolean;        // Per-character settings override
}
```

**Default Configuration**:
- `enabled: false` (opt-in feature)
- `timeoutMinutes: 10` (reasonable default)
- `keepAliveCommand: "time"` (harmless, fast response)
- `perSession: false` (global settings by default)

#### CLI Integration
**Location**: `src/frontend/components/command-bar/cli.lit.ts`

**Integration Point**: `_executeCommand()` method

```typescript
private _executeCommand(command: string) {
  // Reset idle timer on actual game commands (not internal :commands)
  if (command[0] !== ':' && this.session?.idleManager) {
    this.session.idleManager.resetActivity();
  }
  
  // Existing command execution logic...
}
```

**Activity Detection Logic**:
- **Track**: Regular game commands, `;` passthrough commands
- **Ignore**: Internal `:` commands (themes, UI controls, etc.)
- **Reset**: Idle timer on any tracked activity

#### Session Integration
**Location**: `src/frontend/session/index.ts`

```typescript
export class FrontendSession {
  readonly idleManager: IdleManager;
  
  constructor(config: Illthorn.Session.Config) {
    // Existing initialization...
    this.idleManager = new IdleManager(this);
  }
  
  async onMessage(incoming: string) {
    // Existing message processing...
    
    // Reset activity on game responses (optional enhancement)
    this.idleManager.resetActivity();
  }
}
```

### Command Interface

#### Internal Commands
Extend existing `:` command system with AFK controls:

```bash
# Enable/disable AFK for current session
:afk on
:afk off

# Set idle timeout (in minutes)
:afk timeout 15

# Set keep-alive command
:afk command "look"
:afk command "time"

# Show current AFK status
:afk status
```

#### Command Handler Integration
**Location**: `src/frontend/events/illthorn-commands.ts` (existing internal command system)

```typescript
// Add to existing command handlers
case 'afk':
  return this.handleAfkCommand(args);

private handleAfkCommand(args: string[]): void {
  const [action, ...params] = args;
  const session = SessionMap.getCurrentSession();
  
  switch (action) {
    case 'on':
      session?.idleManager.enable();
      break;
    case 'off':
      session?.idleManager.disable();
      break;
    case 'timeout':
      const minutes = parseInt(params[0]);
      session?.idleManager.setTimeout(minutes);
      break;
    // ... etc
  }
}
```

## Implementation Roadmap

### Phase 1: Core Infrastructure
1. **Create IdleManager class** with basic timer functionality
2. **Extend settings system** with AFK configuration schema
3. **Add CLI integration** for activity detection
4. **Wire up session lifecycle** for manager initialization

### Phase 2: User Interface
1. **Implement internal commands** (`:afk on/off/timeout/command`)
2. **Add status reporting** (current idle time, next keep-alive)
3. **Add user feedback** (notifications when keep-alive sent)

### Phase 3: Enhancement & Polish
1. **Per-session settings** override capability
2. **Smart keep-alive commands** based on game state
3. **Debug logging** integration with existing debug system
4. **Reconnection handling** (restart idle tracking after disconnect)

## Technical Details

### Timer Management Strategy

**Single Timer Per Session**:
```typescript
private startTimer(): void {
  this.stopTimer(); // Ensure no duplicate timers
  
  const timeoutMs = this.settings.timeoutMinutes * 60 * 1000;
  this.keepAliveTimer = setInterval(() => {
    const idleTime = Date.now() - this.lastActivity;
    if (idleTime >= timeoutMs) {
      this.sendKeepAlive();
    }
  }, 30000); // Check every 30 seconds
}
```

**Benefits**:
- Single timer prevents resource leaks
- 30-second check interval balances responsiveness vs. performance
- Uses existing JavaScript timer infrastructure (no custom timer manager needed)

### Keep-Alive Command Strategy

**Harmless Commands**:
- `time` - Shows game time, minimal server processing
- `look` - Shows room description, cached on server
- `health` - Shows character status, very fast response

**Command Selection Logic**:
```typescript
private getKeepAliveCommand(): string {
  // Use configured command, fall back to safe default
  return this.settings.keepAliveCommand || 'time';
}

private sendKeepAlive(): void {
  const command = this.getKeepAliveCommand();
  this.session.sendCommand(command);
  
  // Optional: Log keep-alive activity
  debugSession(`[${this.session.name}] AFK keep-alive sent: ${command}`);
}
```

### Integration with Existing Systems

**Event Bus Integration**:
```typescript
// Optional: Broadcast AFK events for UI feedback
this.session.bus.dispatchEvent('afk:keep-alive-sent', { command });
this.session.bus.dispatchEvent('afk:status-changed', { enabled: true, idleTime });
```

**Settings Persistence**:
```typescript
// Leverage existing settings IPC system
private async saveSettings(): Promise<void> {
  await window.Settings.set('afk.enabled', this.settings.enabled);
  await window.Settings.set('afk.timeoutMinutes', this.settings.timeoutMinutes);
  await window.Settings.set('afk.keepAliveCommand', this.settings.keepAliveCommand);
}

private async loadSettings(): Promise<AfkSettings> {
  return {
    enabled: await window.Settings.get('afk.enabled') || false,
    timeoutMinutes: await window.Settings.get('afk.timeoutMinutes') || 10,
    keepAliveCommand: await window.Settings.get('afk.keepAliveCommand') || 'time',
  };
}
```

## User Experience

### Typical Usage Flow

1. **Enable AFK**: `:afk on`
2. **Set Timeout**: `:afk timeout 15` (15 minutes)
3. **Verify Status**: `:afk status` → Shows "AFK enabled, 15min timeout, next check in 14:32"
4. **Go AFK**: User stops sending commands
5. **Keep-Alive**: After 15 minutes, `time` command sent automatically
6. **Continue**: User returns, sends command, idle timer resets

### Status Feedback

```typescript
// Example status output
:afk status
// → AFK: enabled
// → Timeout: 15 minutes  
// → Command: time
// → Idle time: 12:34
// → Next keep-alive: 2:26
```

### Error Handling

**Network Issues**:
- Keep-alive commands use normal command pipeline
- If session disconnects, idle manager stops automatically
- Reconnection restarts idle tracking

**Invalid Settings**:
- Timeout clamped to reasonable range (1-60 minutes)
- Invalid commands fall back to `time`
- Settings validation on load/save

## Debug Integration

### Debug Namespaces
Add to existing debug system:
```javascript
// Browser console
localStorage.setItem('debug', 'illthorn:afk');

// Environment variable  
DEBUG=illthorn:afk yarn start
```

### Debug Output Examples
```
illthorn:afk [Warrior] AFK enabled, timeout=10min
illthorn:afk [Warrior] Activity reset, idle=0ms
illthorn:afk [Warrior] Keep-alive sent: time (idle=10:00)
illthorn:afk [Warrior] AFK disabled by user
```

## Security & Performance Considerations

### Network Impact
- **Minimal**: Keep-alive commands identical to normal user commands
- **Rate Limited**: Maximum one command per timeout period
- **Configurable**: Users can adjust timeout to balance convenience vs. server load

### Server Compatibility
- **Standard Protocol**: Uses normal game command interface
- **Harmless Commands**: `time`, `look`, `health` are non-disruptive
- **Indistinguishable**: Server sees normal command activity

### Resource Usage
- **Memory**: Minimal per-session overhead (timestamp + timer reference)
- **CPU**: 30-second timer checks, negligible impact
- **Cleanup**: Automatic timer cleanup on session disconnect

## Future Enhancements

### Smart Keep-Alive
- **Context Aware**: Different commands based on location (town vs. hunting)
- **Status Dependent**: Skip keep-alive if already active (combat, spells, etc.)
- **Response Analysis**: Verify keep-alive command succeeded

### Advanced Configuration
- **Per-Character Settings**: Different timeouts for different characters
- **Time-Based Rules**: Shorter timeouts during peak hours
- **Integration with Game Calendar**: Adjust behavior for special events

### UI Enhancements
- **Visual Indicator**: Show AFK status in session UI
- **Notification System**: Alert when keep-alive sent
- **Activity Timeline**: Log of recent keep-alive activity

## Testing Strategy

### Unit Tests
- IdleManager timer logic
- Settings persistence/loading
- Command validation and fallbacks

### Integration Tests  
- CLI activity detection
- Session lifecycle integration
- Settings system integration

### Manual Testing
- Multi-session scenarios
- Network disconnect/reconnect
- Various timeout configurations
- Different keep-alive commands