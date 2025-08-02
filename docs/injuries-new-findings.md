# Injury Component Research Findings

## Overview

This document summarizes our research into the actual GemStone IV injury data structure and XML events, based on real game data captured during development of the injury display component.

## Real Game Event Analysis

### Captured Event Structure

When taking damage in-game, we captured this actual `dialogData` event with `id: "injuries"`:

```json
{
    "name": "dialogData",
    "kind": 1,
    "gameName": "dialogData",
    "attrs": {
        "id": "injuries"
    },
    "children": [
        {
            "name": "skin",
            "kind": 1,
            "gameName": "skin",
            "attrs": {
                "id": "healthSkin",
                "name": "healthBar2",
                "controls": "health2",
                "align": "n",
                "top": "160",
                "width": "140",
                "left": "0",
                "height": "15"
            },
            "children": [],
            "text": "",
            "state": 1
        },
        {
            "name": "progressBar",
            "kind": 1,
            "gameName": "progressBar",
            "attrs": {
                "id": "health2",
                "value": "52",
                "text": "health 39/74",
                "customText": "t",
                "align": "n",
                "top": "160",
                "width": "140",
                "left": "0",
                "height": "15"
            },
            "children": [],
            "text": "",
            "state": 1
        }
    ],
    "text": "",
    "state": 1
}
```

### Key Findings

**This "injuries" dialogData contains UI layout information, NOT actual wound data:**
- `skin` element defines the visual background/mannequin positioning
- `progressBar` shows health status (`"health 39/74"`)
- No actual injury/wound information present

## Research Findings from GemStone IV Documentation

### Wrayth Protocol and Injury Display

From the GemStone IV Wiki and online sources:

1. **Injury Window Structure**:
   - "The injuries window is also a dynamic window, but it seems to be defined entirely by images"
   - "It also has `<radio>` tags and a `<skin>` tag with an ID"
   - "The skin tag defines the background image (the mannequin)"
   - "The radio tags are for displaying scars, injuries, or both"

2. **Visual Wound Representation**:
   - Wrayth shows wounds with "(1), (2), or (3) symbol over the various wounded locations"
   - Numbers correspond to wound severity levels
   - "Your own wounds are shown with a number in red, and any scars you may have are shown with a number in yellow"

3. **Interactive Elements**:
   - "Clicking on a wound symbol will transfer the wound" (for empaths)
   - "Clicking on a wound or scar symbol in the window will prepare and cast the appropriate healing spell"

### Lich and XMLData.injuries

From Lich documentation and scripting references:

1. **XMLData Structure**:
   - Lich provides `XMLData.injuries` for script access
   - Can evaluate wounds: `XMLData.injuries.any?{|key,value| value["wound"] > 1}`
   - Contains wound levels and body part information

2. **XML Stream Processing**:
   - "Lich parses incoming XML from the game and runs it through an engine"
   - "Lich can send scripts XML tags rather than stripping them"
   - Multiple front ends utilize this data for wound tracking

## Event Type Breakdown

Based on our research, GemStone IV injury data comes through multiple channels:

### 1. UI Layout Events (`dialogData` with `id: "injuries"`)
- **Purpose**: Define visual layout and health display
- **Contains**: `skin` tags for positioning, `progressBar` for health
- **Does NOT contain**: Actual wound/injury data

### 2. Interactive Wound Markers (`<radio>` tags)
- **Purpose**: Display clickable wound/scar indicators on body diagram
- **Contains**: Wound locations, severity levels, wound vs scar type
- **Event pattern**: Likely `metadata/radio` events

### 3. Script Data Access (`XMLData.injuries`)
- **Purpose**: Parsed injury data for script automation
- **Contains**: Structured wound data by body part
- **Access**: Through Lich's XMLData API

## Current Component Implementation

### What We're Currently Listening For

```typescript
// Our current event listeners
bus.subscribeEvent<GameTag>("metadata/injury", injuryHandler);
bus.subscribeEvent<GameTag>("metadata/dialogData/injuries", dialogHandler);
```

### What We're Actually Getting

- `metadata/dialogData/injuries` → UI layout (skin/progressBar)
- `metadata/injury` → No events captured yet
- `metadata/radio` → Not currently listening for these

## Technical Implementation Analysis

### Problem with Current Approach

1. **Wrong Event Target**: We're expecting injury data in `dialogData/injuries` but it contains UI layout
2. **Missing Radio Events**: Real wound markers likely come through `<radio>` tags
3. **Event Structure Mismatch**: Our processing logic expects direct injury children, not radio elements

### Expected Radio Tag Structure

Based on research, radio tags for wounds likely have this structure:

```json
{
    "name": "radio",
    "attrs": {
        "id": "wound_head_2",
        "part": "head",
        "severity": "2",
        "type": "wound",
        "x": "70",
        "y": "20"
    }
}
```

## Recommended Next Steps

### 1. Expand Event Listening
Add listener for radio events:
```typescript
bus.subscribeEvent<GameTag>("metadata/radio", radioHandler);
```

### 2. Update Event Processing
Create radio tag handler to extract wound data:
```typescript
private processRadioData(radioTag: GameTag) {
  // Extract wound info from radio tag attributes
  // Convert to ProcessedInjury format
  // Update component state
}
```

### 3. Test Different Game Actions
- **APPRAISE** other players to trigger injury window
- **Take more damage** to see wound progression
- **Heal wounds** to see scar conversion
- **Use injury-related commands** to trigger data updates

### 4. Investigate XMLData Access
If radio events don't provide enough data, explore accessing Lich's `XMLData.injuries` directly through the session connection.

## Code Examples

### Current Debug Handler
```typescript
const debugHandler = ({ detail: tag }: CustomEvent<GameTag>) => {
  if (tag.name === "dialogData" || tag.name === "radio") {
    console.log('[INJURY DEBUG] Event:', tag);
  }
};
```

### Expected Radio Handler
```typescript
private processRadioWound(radioTag: GameTag): ProcessedInjury | null {
  const attrs = radioTag.attrs;
  if (!attrs?.part || !attrs?.severity) return null;
  
  return {
    displayName: this.mapBodyPart(attrs.part as string),
    severity: parseInt(attrs.severity as string) as 0 | 1 | 2 | 3,
    paired: this.isPairedPart(attrs.part as string),
    // Additional processing...
  };
}
```

## 🎯 BREAKTHROUGH: Actual Injury Data Discovered! (2025-08-02)

### ⚡ **Major Discovery: Injuries are in `image` tags, not `radio` tags!**

From live gameplay logs with character who has injuries and scars, we found the **actual injury data structure**:

### **Injury/Scar Pattern in Image Tags**

```json
// LEFT HAND INJURY (Severity 1)
{
  "name": "image",
  "attrs": {
    "id": "leftHand", 
    "name": "Injury1",  // ← INJURY MARKER!
    "height": "0",
    "width": "0"
  }
}

// LEFT EYE SCAR (Severity 1)  
{
  "name": "image",
  "attrs": {
    "id": "leftEye",
    "name": "Scar1",    // ← SCAR MARKER!
    "height": "0",
    "width": "0"
  }
}

// BACK INJURY (Severity 1)
{
  "name": "image", 
  "attrs": {
    "id": "back",
    "name": "Injury1",  // ← ANOTHER INJURY!
    "height": "0",
    "width": "0"
  }
}

// HEALTHY PART (for comparison)
{
  "name": "image",
  "attrs": {
    "id": "head",
    "name": "head",     // ← HEALTHY (name matches id)
    "height": "0", 
    "width": "0"
  }
}
```

### **🧩 Decoding the Pattern**

The injury system works through **`image` tags within `dialogData/injuries` events**:

- **Healthy parts**: `"name": "{partName}"` (e.g., `"name": "head"` matches `"id": "head"`)
- **Injured parts**: `"name": "Injury{severity}"` (e.g., `"Injury1"`, `"Injury2"`, `"Injury3"`)  
- **Scarred parts**: `"name": "Scar{severity}"` (e.g., `"Scar1"`, `"Scar2"`, `"Scar3"`)

### **🎯 Implementation Update**

**FIXED**: Updated `processDialogData()` to parse `image` children instead of looking for non-existent `injury` or `radio` tags.

**New Logic**:
1. Filter `dialogData/injuries` children for `image` tags
2. Parse each image's `id` (body part) and `name` (injury/scar status)  
3. Extract severity from `"Injury1"` → severity 1, `"Scar2"` → severity 2, etc.
4. Map to internal body part naming (`"leftHand"` → `"lefthand"`)
5. Process through existing injury pairing and display logic

### **✅ Current Status**

✅ **Injury data source**: FOUND - it's `image` tags in `dialogData/injuries`  
✅ **Parsing logic**: IMPLEMENTED and ready for testing  
✅ **Debug logging**: Enhanced to show detected injuries/scars  
✅ **Pattern mapping**: Part IDs and severity levels decoded  
🎯 **Next**: Live testing should show injuries in UI  

### **🔍 Expected Debug Output**

With the fix, you should now see logs like:
```
[INJURY DEBUG] 🔴 INJURY DETECTED: leftHand -> Injury1 (severity 1)
[INJURY DEBUG] 🟡 SCAR DETECTED: leftEye -> Scar1 (severity 1)  
[INJURY DEBUG] 🎯 Found 2 injuries/scars: [{part: "lefthand", severity: 1, ...}, ...]
```

## 🏆 Conclusion

**The mystery is solved!** Injury data comes through `dialogData/injuries` events but as `image` children, not `injury` or `radio` children. The `radio` tag theory was incorrect - the actual data was hiding in plain sight within the dialog events we were already receiving.

**This should immediately fix injury display** - the component will now properly detect and show injuries and scars from the existing event stream.