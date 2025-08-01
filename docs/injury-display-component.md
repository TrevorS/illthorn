# Injury Display Component Design Specification

## Overview

The injury display component shows character wounds and injuries in a minimal, terminal-aesthetic panel that integrates seamlessly with the existing Illthorn MUD client interface. This component follows the "refined minimal" design approach, prioritizing clean presentation of essential information using only data available from the GemStone IV XML stream.

## Game System Context

### GemStone IV Injury System
- **14 Body Parts**: head, neck, r.eye, l.eye, chest, abdomen, back, r.arm, l.arm, r.hand, l.hand, r.leg, l.leg, nerves
- **Severity Levels**: 0 (healthy), 1 (minor), 2 (moderate), 3 (severe)
- **Injury Mechanics**: Higher severity impacts gameplay, some injuries may bleed or disable body parts

### Data Constraints (Wrayth XML)
The component must work with limited XML data:

```xml
<injury part="rightArm" severity="2">deep gashes and serious bleeding</injury>
```

**Available Data:**
- `part`: Body part name (e.g., "rightArm", "head", "leftLeg")
- `severity`: Integer 0-3 indicating injury severity
- `description`: Text description from the game

**NOT Available:**
- Bleeding damage amounts
- Whether injury is currently bleeding
- Tendable status (treatable with first aid)
- Distinction between scars and active injuries (known XML limitation)

## Component Architecture

### Main Component: `<illthorn-injuries-lit>`

```typescript
@customElement('illthorn-injuries-lit')
export class InjuriesLit extends LitElement {
  @property({ type: Object }) session: Session | null = null;
  @state() private _injuries: ProcessedInjury[] = [];
}
```

### Data Structures

```typescript
interface RawInjury {
  part: string;        // "rightArm", "head", etc.
  severity: 0 | 1 | 2 | 3;
  description: string; // Full game text
}

interface ProcessedInjury {
  displayName: string;     // "head", "arms", "r.eye"
  severity: 0 | 1 | 2 | 3;
  paired: boolean;         // True if left/right parts combined
  leftSeverity?: 0 | 1 | 2 | 3;  // For paired limbs
  rightSeverity?: 0 | 1 | 2 | 3; // For paired limbs
}
```

### Body Part Mapping

```typescript
const BODY_ORDER = [
  'head', 'neck', 'righteye', 'lefteye',           // Head area
  'chest', 'abdomen', 'back',                      // Torso
  'rightarm', 'leftarm', 'righthand', 'lefthand', // Arms
  'rightleg', 'leftleg',                           // Legs
  'nerves'                                         // Nervous system
];

const DISPLAY_NAMES = new Map([
  ['righteye', 'r.eye'],
  ['lefteye', 'l.eye'],
  ['rightarm', 'r.arm'],
  ['leftarm', 'l.arm'],
  ['righthand', 'r.hand'],
  ['lefthand', 'l.hand'],
  ['rightleg', 'r.leg'],
  ['leftleg', 'l.leg'],
  ['nerves', 'nerves']
]);

const PAIRABLE_PARTS = new Set([
  'eye', 'arm', 'hand', 'leg'
]);
```

## Visual Design Specification

### Panel Structure
The component matches the existing VITALS panel design exactly:

```
┌─────────────────┐
│    INJURIES     │ ← Header (centered, gray text)
├─────────────────┤
│ head         #  │ ← Body part (left) + severity (right)
│ arms      L* R# │ ← Smart pairing when both sides injured
│ l.leg        @  │ ← Individual limb when only one injured
└─────────────────┘
```

### Styling Properties

```css
:host {
  --injury-width: 180px;
  --injury-bg: var(--color-background-secondary);
  --injury-border: var(--color-border);
  --injury-header-bg: var(--color-surface);
  --injury-text-primary: var(--color-text-primary);
  --injury-text-secondary: var(--color-text-secondary);
  --injury-severity-minor: var(--color-warning);     /* Yellow */
  --injury-severity-moderate: #ff9800;               /* Orange */
  --injury-severity-severe: var(--color-danger);     /* Red */
  --injury-font: monospace;
  --injury-font-size: 11px;
  --injury-line-height: 14px;
}
```

### Severity Indicators
- `*` = Minor injury (severity 1) - Yellow color
- `#` = Moderate injury (severity 2) - Orange color  
- `@` = Severe injury (severity 3) - Red color

### Display States

#### Healthy State
```
┌─────────────────┐
│    INJURIES     │
├─────────────────┤
│    healthy      │
└─────────────────┘
```

#### Single Injuries
```
┌─────────────────┐
│    INJURIES     │
├─────────────────┤
│ head         #  │
│ chest        *  │
│ r.arm        @  │
└─────────────────┘
```

#### Paired Limbs (Smart Pairing)
Only when BOTH sides are injured:
```
┌─────────────────┐
│    INJURIES     │
├─────────────────┤
│ arms      L* R# │  ← Both arms injured
│ legs      L@ R@ │  ← Both legs injured
│ eyes      L# R* │  ← Both eyes injured
└─────────────────┘
```

When only one side is injured:
```
┌─────────────────┐
│    INJURIES     │
├─────────────────┤
│ l.arm        #  │  ← Only left arm injured
│ r.leg        @  │  ← Only right leg injured
└─────────────────┘
```

## Processing Logic

### Anatomical Sorting
Always sort injuries head-to-toe, left-to-right, regardless of severity:

```typescript
private sortAnatomically(injuries: RawInjury[]): RawInjury[] {
  return injuries.sort((a, b) => {
    const indexA = BODY_ORDER.indexOf(a.part);
    const indexB = BODY_ORDER.indexOf(b.part);
    return indexA - indexB;
  });
}
```

### Smart Pairing Algorithm
```typescript
private processInjuries(injuries: RawInjury[]): ProcessedInjury[] {
  const sorted = this.sortAnatomically(injuries);
  const processed: ProcessedInjury[] = [];
  const handled = new Set<string>();

  for (const injury of sorted) {
    if (handled.has(injury.part)) continue;

    const pair = this.findPair(injury, injuries);
    if (pair) {
      // Both sides injured - create paired display
      processed.push({
        displayName: this.getPairName(injury.part),
        severity: Math.max(injury.severity, pair.severity),
        paired: true,
        leftSeverity: injury.part.startsWith('left') ? injury.severity : pair.severity,
        rightSeverity: injury.part.startsWith('right') ? injury.severity : pair.severity
      });
      handled.add(injury.part);
      handled.add(pair.part);
    } else {
      // Single injury - display normally  
      processed.push({
        displayName: DISPLAY_NAMES.get(injury.part) || injury.part,
        severity: injury.severity,
        paired: false
      });
      handled.add(injury.part);
    }
  }

  return processed;
}
```

## Technical Implementation

### Lit Component Template
```typescript
render() {
  if (!this.session) {
    return html``;
  }

  return html`
    <div class="injury-panel">
      <div class="injury-header">INJURIES</div>
      <div class="injury-content">
        ${this._injuries.length === 0 
          ? html`<div class="healthy">healthy</div>`
          : this._injuries.map(injury => this.renderInjury(injury))
        }
      </div>
    </div>
  `;
}

private renderInjury(injury: ProcessedInjury) {
  if (injury.paired) {
    const leftSymbol = this.getSeveritySymbol(injury.leftSeverity || 0);
    const rightSymbol = this.getSeveritySymbol(injury.rightSeverity || 0);
    
    return html`
      <div class="injury-item">
        <span class="injury-part">${injury.displayName}</span>
        <span class="injury-severity paired">
          <span class="left" style="color: ${this.getSeverityColor(injury.leftSeverity || 0)}">
            L${leftSymbol}
          </span>
          <span class="right" style="color: ${this.getSeverityColor(injury.rightSeverity || 0)}">
            R${rightSymbol}
          </span>
        </span>
      </div>
    `;
  } else {
    return html`
      <div class="injury-item">
        <span class="injury-part">${injury.displayName}</span>
        <span class="injury-severity single" 
              style="color: ${this.getSeverityColor(injury.severity)}">
          ${this.getSeveritySymbol(injury.severity)}
        </span>
      </div>
    `;
  }
}
```

### Event Integration
Following established Illthorn patterns:

```typescript
connectedCallback() {
  super.connectedCallback();
  this.attachListeners();
}

private attachListeners() {
  if (!this.session?.bus) return;

  // Subscribe to injury updates
  this.session.bus.subscribeEvent<GameTag>('metadata/injury', ({ detail }) => {
    this.processInjuryData(detail);
  });
  
  // Alternative: if injuries come as dialogData
  this.session.bus.subscribeEvent<GameTag>('metadata/dialogData/injuries', ({ detail }) => {
    this.processDialogData(detail);
  });
}
```

### CSS Styling
```css
.injury-panel {
  width: var(--injury-width);
  background: var(--injury-bg);
  border: 1px solid var(--injury-border);
  font-family: var(--injury-font);
  font-size: var(--injury-font-size);
}

.injury-header {
  background: var(--injury-header-bg);
  color: var(--injury-text-secondary);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 4px 8px;
  border-bottom: 1px solid var(--injury-border);
}

.injury-content {
  padding: 4px 8px;
}

.injury-item {
  display: flex;
  justify-content: space-between;
  line-height: var(--injury-line-height);
  color: var(--injury-text-primary);
}

.injury-part {
  text-align: left;
}

.injury-severity {
  text-align: right;
  font-weight: bold;
}

.injury-severity.paired .left {
  margin-right: 2px;
}

.healthy {
  color: var(--color-success);
  text-align: left;
  font-style: italic;
}
```

## Integration Guide

### Adding to Session Layout
```typescript
// In session-layout.lit.ts
render() {
  return html`
    <div class="left-panel">
      <illthorn-vitals-lit .session=${this.session}></illthorn-vitals-lit>
      <illthorn-injuries-lit .session=${this.session}></illthorn-injuries-lit>
      <!-- Other panels -->
    </div>
  `;
}
```

### Component Registration
```typescript
// In components/session/injuries/injuries.lit.ts
declare global {
  interface HTMLElementTagNameMap {
    "illthorn-injuries-lit": InjuriesLit;
  }
}
```

### Import and Usage
```typescript
import './components/session/injuries/injuries.lit';

// Component automatically available via custom element registration
```

## Testing Strategy

### Unit Tests
```typescript
describe('InjuriesLit', () => {
  it('shows healthy state when no injuries', async () => {
    const el = await fixture<InjuriesLit>(html`
      <illthorn-injuries-lit></illthorn-injuries-lit>
    `);
    
    expect(el.shadowRoot?.textContent).to.include('healthy');
  });

  it('pairs left/right injuries correctly', async () => {
    const injuries = [
      { part: 'leftarm', severity: 1, description: 'minor cuts' },
      { part: 'rightarm', severity: 2, description: 'deep gashes' }
    ];
    
    const el = await fixture<InjuriesLit>(html`
      <illthorn-injuries-lit .injuries=${injuries}></illthorn-injuries-lit>
    `);
    
    expect(el.shadowRoot?.textContent).to.include('arms');
    expect(el.shadowRoot?.textContent).to.include('L*');
    expect(el.shadowRoot?.textContent).to.include('R#');
  });

  it('sorts injuries anatomically', () => {
    const component = new InjuriesLit();
    const injuries = [
      { part: 'rightleg', severity: 2, description: 'test' },
      { part: 'head', severity: 1, description: 'test' },
      { part: 'chest', severity: 3, description: 'test' }
    ];
    
    const sorted = component['sortAnatomically'](injuries);
    expect(sorted[0].part).to.equal('head');
    expect(sorted[1].part).to.equal('chest');
    expect(sorted[2].part).to.equal('rightleg');
  });
});
```

## Future Enhancements

### Possible Additions (when data becomes available)
- **Bleeding Indicators**: If XML provides bleeding status
- **Tendable Status**: Visual indicator for treatable injuries
- **Hover Tooltips**: Show full injury descriptions on hover
- **Click Actions**: Highlight injured body parts in room description
- **Animation**: Subtle pulse for severe/bleeding injuries

### Theme Variants
- Support for different color schemes in themes
- High contrast mode compatibility
- Accessibility improvements (screen readers, keyboard navigation)

### Advanced Features
- **Filtering**: Show only bleeding/severe injuries
- **Grouping**: Alternative display modes (by severity, by body area)
- **History**: Track injury changes over time
- **Export**: Copy injury status to clipboard

## Implementation Notes

### Performance Considerations
- **Efficient Updates**: Only re-render when injury array changes
- **Minimal DOM**: Simple structure for fast rendering  
- **Memory Management**: Proper cleanup of event listeners

### Accessibility
- **Semantic HTML**: Proper heading structure and labels
- **ARIA Labels**: Screen reader friendly descriptions
- **Color Independence**: Information not solely conveyed through color
- **Keyboard Navigation**: Focusable elements where appropriate

### Browser Compatibility
- **Modern Browsers**: Chrome 90+, Firefox 89+, Safari 14+
- **Web Components**: Native support, no polyfills needed
- **CSS Grid/Flexbox**: Modern layout features

## Conclusion

This specification provides a complete blueprint for implementing the injury display component in the refined minimal style shown in the mockups. The component follows established Illthorn patterns, integrates seamlessly with the existing UI, and works within the constraints of the available XML data.

The design prioritizes clarity, consistency, and maintainability while providing an authentic MUD client experience that matches the terminal aesthetic of the Illthorn application.