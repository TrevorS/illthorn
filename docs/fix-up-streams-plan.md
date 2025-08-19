# Streams Component Fix Plan

## Current Issues

The streams panel is not displaying any content despite being rendered in the UI. Investigation revealed several fundamental issues:

1. **No Session Integration**: The `streams.lit.ts` component lacks a session property and cannot subscribe to game events
2. **No Event Subscriptions**: Component isn't listening for stream data from the parser/session
3. **Inconsistent Architecture**: Streams doesn't follow the established container/UI pattern used by other components
4. **Data Flow Gap**: Stream tags are parsed but not properly routed to the component
5. **CSS Visibility Conflicts**: Multiple classes managing visibility state

## Proposed Architecture

Follow the established container/UI pattern used throughout the codebase:

```
┌─────────────────────────┐
│   session-layout.lit    │
│  (passes session prop)  │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  streams-container.lit  │ ◄── New Component
│  - Accepts session      │
│  - Subscribes to bus    │
│  - Processes GameTags   │
│  - Manages state        │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│    streams-ui.lit       │ ◄── Refactored from streams.lit
│  - Pure presentation    │
│  - Displays entries     │
│  - Handles scrolling    │
│  - No bus interaction   │
└─────────────────────────┘
```

## Implementation Details

### 1. Create `streams-container.lit.ts`

```typescript
// Key structure following vitals-container pattern:
@customElement("illthorn-streams-container")
export class StreamsContainer extends LitElement {
  @property({ type: Object })
  session?: Session;

  @state()
  private _entries: StreamEntry[] = [];

  // Subscribe to stream events
  private _setupEventListeners() {
    if (!this.session?.bus) return;
    
    const bus = this.session.bus;
    
    // Subscribe to stream tags
    bus.subscribeEvent<GameTag>("metadata/stream/thoughts", this._handleThoughts);
    bus.subscribeEvent<GameTag>("metadata/stream/speech", this._handleSpeech);
    bus.subscribeEvent<GameTag>("metadata/stream/logon", this._handleLogon);
    bus.subscribeEvent<GameTag>("metadata/stream/logoff", this._handleLogoff);
    bus.subscribeEvent<GameTag>("metadata/stream/death", this._handleDeath);
  }

  render() {
    return html`
      <illthorn-streams-ui 
        .entries=${this._entries}
        @clear=${this._handleClear}>
      </illthorn-streams-ui>
    `;
  }
}
```

### 2. Refactor `streams.lit.ts` → `streams-ui.lit.ts`

- Remove any session-related code
- Accept entries as a property instead of managing state
- Focus purely on presentation and scrolling behavior
- Keep existing CSS and rendering logic

### 3. Update Parser Integration

Verify the parser correctly identifies and emits stream tags:

- Stream tags should have structure: `<stream id="thoughts">content</stream>`
- Parser should emit events like `metadata/stream/thoughts`
- Check `pushStream`/`popStream` tag handling

### 4. Update Session Integration

In `src/frontend/session/index.ts`:
- Remove temporary DOM element creation for streams
- Let the container handle GameTag processing
- Ensure stream tags are properly routed through the bus

### 5. Update `session-layout.lit.ts`

Change from:
```html
<illthorn-streams-lit .session=${this.session}></illthorn-streams-lit>
```

To:
```html
<illthorn-streams-container .session=${this.session}></illthorn-streams-container>
```

## Stream Types to Support

Based on game protocol analysis:

| Stream ID | Description | CSS Class | Display Location |
|-----------|-------------|-----------|------------------|
| thoughts | ESP/thought messages | `stream thoughts` | Streams panel |
| speech | General speech | `stream speech` | Streams panel |
| logon | Player login messages | `stream logon` | Streams panel |
| logoff | Player logout messages | `stream logoff` | Streams panel |
| death | Death messages | `stream death` | Streams panel |

Note: Some streams (room, inv, bounty) are filtered as they duplicate main feed content.

## Testing Plan

1. **Unit Tests**
   - Test container event subscriptions
   - Test UI component rendering with mock data
   - Test scroll behavior

2. **Integration Tests**
   - Verify stream tags flow from parser → session → container → UI
   - Test `:ui streams on/off` commands
   - Test auto-scrolling with new content

3. **Manual Testing**
   - Connect to game session
   - Verify thoughts appear in streams panel
   - Test all stream types (speech, logon, logoff, death)
   - Verify scroll behavior (auto-scroll when at bottom)
   - Test UI toggle commands

## Migration Steps

1. **Phase 1: Create Container**
   - Create new `streams-container.lit.ts`
   - Implement session integration and bus subscriptions
   - Add stream processing logic

2. **Phase 2: Refactor UI**
   - Copy `streams.lit.ts` to `streams-ui.lit.ts`
   - Remove session/bus code
   - Convert to property-driven component

3. **Phase 3: Wire Together**
   - Update `session-layout.lit.ts` to use container
   - Test data flow end-to-end
   - Fix any integration issues

4. **Phase 4: Cleanup**
   - Remove old `streams.lit.ts`
   - Remove temporary code in `session/index.ts`
   - Update imports and references

## Success Criteria

- [ ] Streams panel displays game stream content
- [ ] All stream types are properly rendered
- [ ] Auto-scrolling works when user is at bottom
- [ ] Manual scrolling prevents auto-scroll
- [ ] `:ui streams on/off` commands work
- [ ] Component follows established patterns
- [ ] Tests pass for both container and UI components

## Notes

- The container/UI pattern provides better separation of concerns
- This approach is consistent with vitals, injuries, and hands components
- Stream content should be accumulated (not replaced) until cleared
- Consider adding a max entry limit to prevent memory issues
- May need to handle stream persistence across session reconnects