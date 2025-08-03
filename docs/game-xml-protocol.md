# Game XML Protocol

This document explains how Gemstone IV sends data to the client via XML and how Illthorn processes it into bus events.

## Overview

Gemstone IV sends game data as XML elements through the Lich interface. Illthorn parses this XML and converts it into typed bus events that components can subscribe to.

## Event Naming Convention

Events are created using the pattern:
- `metadata/{tagName}/{id}` - When XML element has an `id` attribute
- `metadata/{tagName}` - When no `id` attribute present

Examples:
- `<progressBar id="health">` → `metadata/progressBar/health`
- `<dialogData id="Active Spells">` → `metadata/dialogData/Active Spells`
- `<notification>` → `metadata/notification`

## ProgressBar Elements

The game uses `<progressBar>` as a generic XML element for **all** progress-based data, not just UI progress bars.

### Common ProgressBar Types

#### Vitals Data
```xml
<progressBar id="health" text="health 100" value="100" />
<progressBar id="mana" text="mana 85" value="85" />
<progressBar id="stamina" text="stamina 92" value="92" />
<progressBar id="spirit" text="spirit 100" value="100" />
<progressBar id="mindState" text="clear" value="100" />
<progressBar id="pbarStance" text="offensive forward" value="80" />
<progressBar id="encumlevel" text="light" value="0" />
```

#### Spell Effects Data
```xml
<dialogData id="Active Spells">
  <progressBar id="spell1" text="Bless" time="120" value="80" />
  <progressBar id="spell2" text="Spirit Defense" time="45" value="90" />
  <progressBar id="spell3" text="Heroism" time="300" value="60" />
</dialogData>
```

#### Cooldowns/Buffs Data
```xml
<dialogData id="Cooldowns">
  <progressBar id="cooldown1" text="Warrior's Resolve" time="600" value="25" />
</dialogData>

<dialogData id="Buffs">
  <progressBar id="buff1" text="Gift of Eonak" time="180" value="90" />
</dialogData>
```

### ProgressBar Attributes

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `id` | Unique identifier for the progress item | `"health"`, `"spell1"` |
| `text` | Display name/description | `"Bless"`, `"health 100"` |
| `value` | Current percentage (0-100) | `"80"` |
| `time` | Time remaining in seconds (spells only) | `"120"` |

## Component Usage Patterns

### Vitals Component
Subscribes to individual progressBar events:
```typescript
this.session.bus.subscribeEvent<GameTag>(`metadata/progressBar/health`, ...)
this.session.bus.subscribeEvent<GameTag>(`metadata/progressBar/mana`, ...)
```

### Effects Component
Subscribes to dialogData events and processes child progressBar elements:
```typescript
this.session.bus.subscribeEvent<GameTag>(`metadata/dialogData/Active Spells`, ({ detail: dialog }) => {
  const progressBars = dialog.children.filter((child) => child.name === "progressBar");
  // Process each progressBar...
});
```

## Stream Handling (Critical)

### Multi-Message Stream Pattern

**IMPORTANT**: The Wrayth protocol sends stream content across **multiple separate XML messages**, not as a single unified message. This is a critical pattern that affects inventory, speech, thoughts, and other stream types.

#### Stream Flow Example (Inventory)

```xml
<!-- Message 1: Stream setup and control -->
<streamWindow id='inv' title='My Inventory' target='wear' ifClosed='' resident='true'/>
<clearStream id='inv' ifClosed=''/>
<pushStream id='inv'/>Your worn items are:

<!-- Message 2: Inventory content (NO stream tags) -->
  a <a exist="610601127" noun="stickpin">diamond-set platinum stickpin</a>
  a <a exist="610601128" noun="ring">faded gold ring</a>
  a <a exist="610601129" noun="jacket">wool jacket</a>

<!-- Message 3: More content (NO stream tags) -->
You are wearing a <a exist="610601127" noun="stickpin">diamond-set platinum stickpin</a>, a <a exist="610601128" noun="ring">faded gold ring</a>...

<!-- Message 4: Stream end -->
<popStream/>
```

#### Stream Types Using This Pattern

- **`inv` (inventory)** - Item lists and equipment
- **`speech`** - Player and NPC dialogue
- **`thoughts`** - ESP/telepathy messages
- **`logons`/`logoffs`** - Player login/logout notifications
- **`death`** - Death messages and combat results
- **`bounty`** - Bounty system notifications

#### Parser Requirements

**Critical**: Parser must maintain stream state across multiple `parse()` calls:

```typescript
// ❌ WRONG: This breaks streams
parse(text: string): GameTag[] {
  this.currentStream = null;  // Resets stream state!
  this.inStream = false;
}

// ✅ CORRECT: This preserves streams
parse(text: string): GameTag[] {
  // Reset tag parsing state only
  this.tagStack.length = 0;
  this.completed.length = 0;
  // Keep stream state: this.currentStream, this.inStream
}
```

### Stream Content Collection

When inside a stream context:
1. All content (text and tags) should be collected into the stream tag
2. Content should NOT appear in the main game feed
3. Stream tag should be marked with appropriate `id` attribute
4. Stream content should be available for filtering/routing

## Data Flow

1. **Game** → Sends XML via Lich (may be multiple messages for streams)
2. **Parser** → Converts XML to GameTag objects (maintains stream state)
3. **dispatchMetadata()** → Creates bus events from tags
4. **Components** → Subscribe to specific events and update UI

## Debugging

### Stream Issues

To debug stream-related problems, enable comprehensive logging:
```javascript
localStorage.setItem('debug', 'illthorn:*');
```

**Key debugging patterns:**
- **Stream state tracking**: Check if parser maintains stream context across messages
- **Content duplication**: Look for content appearing in both main feed and streams
- **Missing stream content**: Verify `pushStream`/`popStream` handling

### General XML Debugging

Enable debug logging to see the XML structure:
```javascript
localStorage.setItem('debug', 'illthorn:metadata,illthorn:effects');
```

This will show:
- Raw XML structure being processed
- Event names being generated
- Child element filtering and processing

### Stream Debugging Tips

1. **Check parser type**: Ensure saxophone parser is enabled for proper stream handling
2. **Monitor console logs**: Look for "FILTERING OUT stream:" messages
3. **Verify stream state**: Stream context should persist across multiple XML messages
4. **Test stream commands**: Try `inv`, `say hello`, ESP commands to trigger different streams