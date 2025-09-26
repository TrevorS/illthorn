# Illthorn Configuration Guide

This guide covers the new TOML-based configuration system for highlights and macros in Illthorn.

## Quick Start

1. **Access your config**: Type `:config` to see your config directory path
2. **Edit highlights**: Use `:hilite edit` to open your highlights file
3. **Edit macros**: Use `:macro edit` to open your macros file
4. **Reload configs**: Changes auto-reload, or use `:config reload` manually

## CLI Commands

### Highlight Commands (`:hilite`)

- `:hilite` - Show available highlight commands
- `:hilite reload` - Reload highlights from config file
- `:hilite list` - Show all loaded highlight patterns
- `:hilite test <pattern> <text>` - Test a regex pattern against text
- `:hilite edit` - Open highlights.toml in your default editor
- `:hilite on` - Enable highlighting
- `:hilite off` - Disable highlighting

### Macro Commands (`:macro`)

- `:macro` - Show available macro commands
- `:macro reload` - Reload macros from config file
- `:macro list` - Show all bound macros by category
- `:macro edit` - Open macros.toml in your default editor
- `:macro on` - Enable macros
- `:macro off` - Disable macros
- `:macro test <key>` - Show what command a key binding executes

### Config Commands (`:config`)

- `:config` - Show config directory path and available commands
- `:config open` - Open config directory in file explorer
- `:config reload` - Reload all configurations
- `:config edit <file>` - Open specific config file (highlights.toml, macros.toml)

## Configuration Files

Your config files are stored in:
- **Linux/Mac**: `~/.config/illthorn/`
- **Windows**: `%APPDATA%/illthorn/`

### highlights.toml

```toml
[settings]
enabled = true
case_sensitive = false

[[patterns]]
name = "example"
pattern = "\\btest\\b"
color = "#ff0000"
bold = true
italic = false
underline = false
background = "#000000"
```

#### Pattern Properties:
- `name` (required) - Unique identifier for the pattern
- `pattern` (required) - Regex pattern to match
- `color` - Text color (CSS hex format: #rrggbb)
- `background` - Background color (CSS hex format: #rrggbb)
- `bold` - Make text bold (true/false)
- `italic` - Make text italic (true/false)
- `underline` - Underline text (true/false)

### macros.toml

```toml
[settings]
enabled = true

[combat]
"ctrl+1" = "stance offensive"
"f1" = "look"
"alt+shift+1" = "prep heal\\ncast self"

[movement]
"ctrl+numpad8" = "north"
"ctrl+numpad2" = "south"
```

#### Macro Format:
- Categories are defined in [brackets]
- Key combinations use modifiers: `ctrl+`, `alt+`, `shift+`
- Special keys: `f1`-`f12`, `numpad1`-`numpad9`, `enter`, `space`, `tab`
- Multi-line commands: Use `\\n` to separate commands

#### Supported Keys:
- **Function keys**: `f1`, `f2`, ... `f12`
- **Number keys**: `1`, `2`, ... `9`, `0`
- **Numpad**: `numpad1`, `numpad2`, ... `numpad9`, `numpad0`
- **Letters**: `a`, `b`, ... `z`
- **Modifiers**: `ctrl+`, `alt+`, `shift+` (can be combined)
- **Special**: `enter`, `space`, `tab`, `escape`, `backspace`

## Regular Expressions (Regex)

Patterns use JavaScript regex syntax:

### Common Patterns:
- `\\bword\\b` - Match whole word only
- `.*` - Match any characters
- `\\d+` - Match one or more digits
- `[Aa]ction` - Match "Action" or "action"
- `(word1|word2)` - Match either word1 or word2
- `^start` - Match at beginning of line
- `end$` - Match at end of line

### Escaping Special Characters:
In TOML files, backslashes need to be doubled:
- Use `\\b` instead of `\b`
- Use `\\d` instead of `\d`
- Use `\\\\` for a literal backslash

## Troubleshooting

### Common Issues:

#### Highlights Not Working:
1. Check if highlighting is enabled: `:hilite on`
2. Test your pattern: `:hilite test "your pattern" "test text"`
3. Check pattern syntax - backslashes must be doubled in TOML
4. Reload config: `:hilite reload`

#### Macros Not Working:
1. Check if macros are enabled: `:macro on`
2. List active bindings: `:macro list`
3. Test specific key: `:macro test ctrl+1`
4. Check for key conflicts with system shortcuts
5. Reload config: `:macro reload`

#### Config Files Not Loading:
1. Check file syntax with `:config edit highlights.toml`
2. Look for TOML syntax errors (missing quotes, brackets)
3. Check the console for error messages
4. Try `:config reload` to see specific errors

### Error Messages:

#### "Invalid regex pattern":
- Check your regex syntax
- Remember to double backslashes in TOML: `\\b` not `\b`
- Test patterns with `:hilite test <pattern> <text>`

#### "Failed to bind key":
- Key combination might conflict with system shortcuts
- Check if key format is correct (e.g., `ctrl+f1` not `Ctrl+F1`)
- Some keys may not be available in web contexts

#### "Config file not found":
- Files are created automatically on first use
- Check config directory with `:config`
- Try `:config edit highlights.toml` to create the file

## File Watching

The system automatically watches your config files for changes:
- External edits are detected and reload automatically
- You'll see a message when files are reloaded
- If auto-reload fails, use `:config reload` manually

## Tips and Best Practices

### Organizing Patterns:
- Use descriptive names for patterns
- Group related patterns together
- Comment your patterns with `# comments`

### Performance:
- Avoid overly complex regex patterns
- Test patterns before adding them
- Disable highlighting temporarily with `:hilite off` for better performance

### Key Bindings:
- Avoid system shortcuts (Ctrl+C, Ctrl+V, etc.)
- Use consistent modifier keys within categories
- Document your custom bindings

### Backup:
- Copy your config directory before major changes
- Export important configurations to share
- Keep presets for different characters/situations

## Getting Help

- Use `:hilite`, `:macro`, or `:config` without arguments to see available commands
- Check this documentation in your config directory
- Test patterns and bindings before saving complex configurations
- Look at the preset files for examples