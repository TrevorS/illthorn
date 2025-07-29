# Spell Auto-Countdown Implementation

## Overview

This document outlines the technical implementation for adding automatic countdown functionality to spell effects in Illthorn. The system will provide real-time countdown of spell durations while maintaining server sync for accuracy.

## Current Architecture

### Effects System Components

The spell effects system consists of two Lit-based components:

- **Effects Component** (`src/frontend/components/session/effects/effects.lit.ts`) - Subscribes to `metadata/dialogData/Active Spells` events and renders spell lists
- **SpellEffect Component** (`src/frontend/components/session/effects/spell-effect.lit.ts`) - Individual spell display with name, time, and styling

### Data Flow

```
Game Server → Lich → XML → Parser → GameTag → Bus Event → Effects Component → SpellEffect Components
```

Server sends spell data via XML:
```xml
<dialogData id="Active Spells">
  <progressBar id="spell1" text="Bless" time="120" value="80" />
  <progressBar id="spell2" text="Spirit Defense" time="45" value="90" />
</dialogData>
```

Events are dispatched as `metadata/dialogData/Active Spells` containing the parsed dialog data.

## Implementation Strategy

### 1. Enhanced SpellEffect Component

The countdown functionality will be implemented entirely within the `SpellEffect` component to maintain separation of concerns.

#### State Management
```typescript
@customElement("illthorn-spell-effect")
export class SpellEffect extends LitElement {
  // Existing properties
  @property({ type: String }) spellName = "";
  @property({ type: String }) timeRemaining = "";
  @property({ type: String }) spellId = "";
  @property({ type: Number }) percent = 0;

  // New countdown state
  @state() private _localTimeRemaining: number = 0;
  @state() private _lastServerSync: number = 0;
  private _countdownTimer: number | null = null;
}
```

#### Timer Lifecycle
```typescript
connectedCallback() {
  super.connectedCallback();
  this.updatePercentClasses();
  this._startCountdown();
}

disconnectedCallback() {
  super.disconnectedCallback();
  this._stopCountdown();
}

private _startCountdown() {
  this._stopCountdown(); // Prevent multiple timers
  this._countdownTimer = window.setInterval(() => {
    if (this._localTimeRemaining > 0) {
      this._localTimeRemaining--;
      this.requestUpdate(); // Trigger re-render
    } else {
      this._stopCountdown();
    }
  }, 1000);
}

private _stopCountdown() {
  if (this._countdownTimer !== null) {
    clearInterval(this._countdownTimer);
    this._countdownTimer = null;
  }
}
```

#### Server Sync Logic
```typescript
updated(changedProperties: Map<string | number | symbol, unknown>) {
  super.updated(changedProperties);

  if (changedProperties.has("timeRemaining")) {
    const serverTime = this._parseTimeToSeconds(this.timeRemaining);
    this._syncWithServer(serverTime);
  }

  if (changedProperties.has("percent")) {
    this.updatePercentClasses();
  }
}

private _syncWithServer(serverTime: number) {
  const now = Date.now();
  
  // Log sync event for debugging
  logEffectsEvent("SpellEffect", `Server sync for ${this.spellName}`, {
    serverTime,
    localTime: this._localTimeRemaining,
    timeDiff: Math.abs(serverTime - this._localTimeRemaining),
    spellId: this.spellId
  });

  // Always trust server time as authoritative
  this._localTimeRemaining = serverTime;
  this._lastServerSync = now;
  
  // Restart countdown with new time
  if (serverTime > 0) {
    this._startCountdown();
  } else {
    this._stopCountdown();
  }
}

private _parseTimeToSeconds(timeStr: string): number {
  if (!timeStr || timeStr === "0") return 0;
  
  // Handle MM:SS format
  if (timeStr.includes(":")) {
    const [minutes, seconds] = timeStr.split(":").map(Number);
    return (minutes * 60) + seconds;
  }
  
  // Handle seconds-only format
  return parseInt(timeStr, 10) || 0;
}

private _formatTimeDisplay(seconds: number): string {
  if (seconds <= 0) return "0";
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  return secs.toString();
}
```

#### Updated Render Method
```typescript
render() {
  const displayTime = this._localTimeRemaining > 0 
    ? this._formatTimeDisplay(this._localTimeRemaining)
    : this.timeRemaining; // Fallback to server time

  return html`
    <div class="spell-item">
      <span class="spell-name">${this.spellName}</span>
      <span class="spell-time">${displayTime}</span>
    </div>
  `;
}
```

### 2. Debug Integration

Leverage the existing `illthorn:effects` debug namespace for countdown troubleshooting:

```typescript
// Enable countdown debugging
localStorage.setItem('debug', 'illthorn:effects');

// Debug output examples:
// [SpellEffect] Server sync for Bless { serverTime: 120, localTime: 118, timeDiff: 2, spellId: "spell1" }
// [SpellEffect] Countdown started for Spirit Defense { initialTime: 45, spellId: "spell2" }
// [SpellEffect] Countdown expired for Heroism { spellId: "spell3" }
```

### 3. Performance Considerations

#### Memory Management
- **Single Timer**: One `setInterval` per component, not per spell
- **Cleanup**: Proper timer cleanup in `disconnectedCallback`
- **Efficient Updates**: Use `requestUpdate()` only when display changes

#### Accuracy Maintenance
- **Server Authority**: Always accept server updates as authoritative
- **Drift Correction**: Log time differences for monitoring accuracy
- **Graceful Degradation**: Fall back to static display if countdown fails

## User Experience Benefits

### Real-Time Feedback
- **Immediate Updates**: Users see countdown in real-time without waiting for server updates
- **Better Planning**: Real-time countdown helps with spell timing and preparation
- **Engagement**: Dynamic UI feels more responsive and modern

### Visual Indicators
- **Color Coding**: Existing CSS classes (high/medium/low) work with countdown values
- **Expiration Handling**: Spells automatically update when they expire
- **Consistency**: Maintains existing visual design and theme compatibility

## Testing Strategy

### Unit Tests
```typescript
describe('SpellEffect Auto-Countdown', () => {
  it('should start countdown when timeRemaining is set', async () => {
    const el = await fixture<SpellEffect>(html`
      <illthorn-spell-effect 
        .spellName=${"Test Spell"}
        .timeRemaining=${"30"}>
      </illthorn-spell-effect>
    `);

    expect(el._localTimeRemaining).to.equal(30);
    // Verify timer is running
  });

  it('should sync with server updates', async () => {
    const el = await fixture<SpellEffect>(html`
      <illthorn-spell-effect .timeRemaining=${"60"}></illthorn-spell-effect>
    `);

    // Simulate server update
    el.timeRemaining = "45";
    await el.updateComplete;

    expect(el._localTimeRemaining).to.equal(45);
  });

  it('should handle time format conversions', () => {
    const el = new SpellEffect();
    expect(el._parseTimeToSeconds("120")).to.equal(120);
    expect(el._parseTimeToSeconds("2:30")).to.equal(150);
    expect(el._formatTimeDisplay(90)).to.equal("1:30");
  });
});
```

### Integration Tests
- **Server Sync Accuracy**: Test countdown vs server update timing
- **Component Lifecycle**: Verify proper cleanup on disconnect
- **Event Bus Integration**: Ensure Effects component updates propagate correctly

## Implementation Timeline

### Phase 1: Core Countdown (Week 1)
- [ ] Add countdown state management to SpellEffect
- [ ] Implement timer lifecycle and sync logic
- [ ] Add time parsing and formatting utilities
- [ ] Basic unit tests for countdown functionality

### Phase 2: Integration & Polish (Week 2)
- [ ] Debug logging integration
- [ ] Performance optimization and cleanup
- [ ] Comprehensive testing suite
- [ ] Edge case handling (disconnection, errors)

### Phase 3: Monitoring & Refinement (Week 3)
- [ ] Accuracy monitoring and drift correction
- [ ] User feedback integration
- [ ] Performance metrics collection
- [ ] Documentation and code review

## Debug Commands

### Enable Countdown Debugging
```javascript
// Enable effects debugging to see countdown events
localStorage.setItem('debug', 'illthorn:effects');

// Enable all debugging for full event flow
localStorage.setItem('debug', 'illthorn:*');
```

### Common Debug Patterns
- **Countdown Issues**: `DEBUG=illthorn:effects` - Shows timer start/stop and sync events
- **Server Sync Problems**: `DEBUG=illthorn:effects,illthorn:metadata` - Shows both countdown and server updates
- **Full Event Flow**: `DEBUG=illthorn:*` - Complete visibility into spell event processing

## Rollback Strategy

The implementation is designed for safe rollback:

1. **Feature Flag**: Can be disabled via component property
2. **Graceful Degradation**: Falls back to static display if countdown fails
3. **Server Authority**: Always respects server timing as source of truth
4. **Minimal Changes**: Only affects SpellEffect component rendering

## Security Considerations

- **No Data Modification**: Countdown is purely visual, doesn't affect game state
- **Client-Side Only**: All countdown logic runs in renderer process
- **Server Validation**: Server updates always override local countdown
- **Memory Safety**: Proper timer cleanup prevents memory leaks

---

This implementation provides real-time spell countdown functionality while maintaining the existing architecture's reliability and security principles. The countdown enhances user experience without compromising the authoritative nature of server timing.