# Whitespace Preservation Plan

## Problem Statement

Lich script output and combat text should display with proper newlines but currently appear as single-line text. The game server sends correctly formatted text with `\n` characters, but these are being collapsed during the rendering process.

## Root Cause Analysis

### Text Processing Pipeline

1. **Game Server** → Sends text content with proper `\n` newline characters
2. **SaxophoneParser** → Correctly preserves whitespace in `:text` tags (saxophone-parser.ts:259-266)
3. **ComponentRenderer** → Renders `:text` as `html`${decodedText}`` (component-renderer.ts:179)
4. **Lit Template** → Renders text content as normal HTML text
5. **CSS** → `white-space: normal` collapses consecutive whitespace and newlines

### Key Finding

The issue occurs at the CSS level where `white-space: normal` is applied globally to `.content` in the feed component (feed-modernized.lit.ts:73). While `<style>` and `<output>` tags are rendered as `<pre>` elements with `white-space: pre-wrap`, their contained `:text` nodes still inherit the `normal` whitespace behavior.

### Previous Attempt Issues

Documentation shows that the original design used `white-space: pre-wrap` globally (game-log-modernization.md:898), but this was changed to `white-space: normal` to fix "spacing issues with inline game elements" (feed-modernized.lit.ts:85). This created a CSS conflict where:

- Global `pre-wrap` preserved newlines but caused component spacing problems
- Global `normal` fixed component spacing but collapsed necessary newlines
- Targeted `pre-wrap` for `<pre>` elements wasn't sufficient due to cascade issues

## Technical Deep Dive

### Where Whitespace Matters

**Script Output Tags:**
```xml
<style id="">First line of script output
Second line of script output
Third line of script output</style>
```

**Combat Text:**
```xml
<output class="combat">You swing at the orc.
The orc dodges your attack.
You prepare another strike.</output>
```

### Current Code Behavior

**SaxophoneParser (Correct):**
```typescript
// Line 263: Preserves ALL text content including newlines
textTag.text = textStr; // textStr contains "\n" characters
```

**ComponentRenderer (Problem Area):**
```typescript
// Line 179: Renders text as normal HTML content
return { template: html`${decodedText}` };
```

**Feed CSS (Conflict Source):**
```css
/* Line 73: Collapses whitespace globally */
.content {
  white-space: normal;
}

/* Line 99: Attempts to restore, but insufficient specificity */
.content pre {
  white-space: pre-wrap;
}
```

## Solution Strategy

### Principle: Respect Game Server Authority

The game server is the authoritative source for how content should be formatted. If it sends newlines, they should be preserved exactly as intended.

### Targeted Text Node Preservation

Instead of fighting CSS cascade issues, modify the ComponentRenderer to handle whitespace preservation at the text rendering level.

**Approach:**
1. Detect when `:text` content contains newlines
2. Apply whitespace preservation only to multi-line text content
3. Leave inline text flowing normally
4. Maintain existing component spacing behavior

### Implementation Details

**Option 1: CSS-based Conditional Preservation**
```typescript
private renderText(tag: GameTag): { template?: TemplateResult } {
  if (tag.text === undefined || tag.text === null) {
    return {};
  }

  const decodedText = this._decodeHTMLEntities(tag.text);
  
  // Check if text contains newlines that need preservation
  const hasNewlines = decodedText.includes('\n');
  
  if (hasNewlines) {
    return {
      template: html`<span style="white-space: pre-wrap">${decodedText}</span>`,
    };
  }
  
  return {
    template: html`${decodedText}`,
  };
}
```

**Option 2: CSS Class-based Preservation**
```typescript
private renderText(tag: GameTag): { template?: TemplateResult } {
  if (tag.text === undefined || tag.text === null) {
    return {};
  }

  const decodedText = this._decodeHTMLEntities(tag.text);
  const hasNewlines = decodedText.includes('\n');
  
  return {
    template: hasNewlines 
      ? html`<span class="preserve-whitespace">${decodedText}</span>`
      : html`${decodedText}`,
  };
}
```

With corresponding CSS:
```css
.preserve-whitespace {
  white-space: pre-wrap;
}
```

## Testing Strategy

### Verification Points

1. **Script Output**: Multi-line Lich script output displays with proper line breaks
2. **Combat Text**: Combat messages maintain intended formatting  
3. **Inline Text**: Regular text continues to flow normally
4. **Component Spacing**: Game elements maintain proper spacing
5. **Performance**: No impact on rendering performance

### Test Cases

**Multi-line Content (Should Preserve):**
```xml
<style id="">Line 1
Line 2
Line 3</style>
```

**Inline Content (Should Flow):**
```xml
You see <a exist="123" noun="sword">a steel sword</a> here.
```

**Mixed Content:**
```xml
<style id="">Script output line 1
Script output line 2</style>
Regular text with <a exist="456" noun="gem">a ruby</a> continues flowing.
```

## Risk Assessment

### Technical Risks

**Low Risk:** Changes are isolated to text rendering in ComponentRenderer
- No layout or CSS cascade changes required
- Existing component spacing behavior preserved
- Backward compatible with current content

**Minimal Performance Impact:** 
- Only adds newline detection for text nodes
- No expensive DOM operations
- Uses existing Lit template rendering

### User Experience Impact

**Positive:**
- Script output becomes readable with proper formatting
- Combat text displays as intended by game designers
- No visual changes to working content

**Neutral:**
- No breaking changes to existing functionality
- Maintains current component interaction behavior

## Implementation Plan

### Phase 1: Core Text Rendering Fix
1. Modify `renderText()` method in ComponentRenderer
2. Add newline detection and conditional preservation
3. Test with script output scenarios

### Phase 2: CSS Integration (if needed)
1. Add `.preserve-whitespace` CSS class if using class-based approach
2. Ensure no conflicts with existing styles
3. Validate component spacing remains correct

### Phase 3: Comprehensive Testing
1. Test with real Lich script output
2. Verify combat text formatting
3. Confirm no regression in inline text flow
4. Performance validation

## Long-term Benefits

### Architectural Improvements
- **Authoritative Formatting**: Respects game server's intended text layout
- **Maintainable Solution**: Clear separation between content preservation and layout
- **Extensible Approach**: Can be applied to other text formatting needs

### User Experience Enhancements
- **Readable Script Output**: Multi-line content displays properly
- **Proper Combat Formatting**: Action sequences are clear and formatted
- **Consistent Behavior**: All game text respects server formatting

## Conclusion

This approach solves the whitespace preservation problem by addressing it at the correct level (text content rendering) rather than fighting CSS cascade issues. It respects the game server's authoritative formatting while maintaining the existing component layout behavior that was carefully crafted to avoid spacing issues.

The solution is minimal, targeted, and preserves the principle that the game server knows best how its content should be displayed.