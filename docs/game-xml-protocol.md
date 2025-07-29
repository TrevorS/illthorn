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

## Data Flow

1. **Game** → Sends XML via Lich
2. **Parser** → Converts XML to GameTag objects
3. **dispatchMetadata()** → Creates bus events from tags
4. **Components** → Subscribe to specific events and update UI

## Debugging

Enable debug logging to see the XML structure:
```javascript
localStorage.setItem('debug', 'illthorn:metadata,illthorn:effects');
```

This will show:
- Raw XML structure being processed
- Event names being generated
- Child element filtering and processing