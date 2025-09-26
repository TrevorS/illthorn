# Illthorn Config Presets

This directory contains preset configuration files that provide useful defaults for highlights and macros in Gemstone IV.

## Using Presets

To use a preset, copy its contents into your main config file:

### For Highlights:
1. Open your highlights.toml file: `:config edit highlights.toml`
2. Copy patterns from any preset file in this directory
3. Paste them into your highlights.toml file
4. Save and the changes will auto-reload

### For Macros:
1. Open your macros.toml file: `:config edit macros.toml`
2. Copy sections from the default-macros.toml preset
3. Paste them into your macros.toml file
4. Save and the changes will auto-reload

## Available Presets

### combat-highlights.toml
Highlights for combat-related text including:
- Critical hits and damage
- Misses and dodges
- Death and status effects
- Weapons and spells
- Combat verbs and actions

### item-highlights.toml
Highlights for valuable items including:
- Gems and precious metals
- Containers and storage
- Weapons and armor
- Magical items
- Currency and consumables

### communication-highlights.toml
Highlights for player communication including:
- OOC chat channels
- Speech and dialogue
- Guild and group messages
- System announcements
- Player names and emotes

### default-macros.toml
Basic macro bindings including:
- Combat stances (Ctrl+1-6)
- Movement (Ctrl+Numpad)
- Quick actions (F1-F12)
- Combat commands (Alt+1-9)
- Social commands (Shift+F1-F9)
- Utility shortcuts

## Customization

Feel free to modify these patterns and commands to suit your playstyle. You can:
- Change colors and formatting
- Add new patterns or remove unwanted ones
- Customize key bindings
- Create your own categories

## Tips

- Use regex patterns for flexible matching
- Test patterns with `:hilite test <pattern> <text>`
- Check active macros with `:macro list`
- Reload configs manually with `:config reload`
- Colors use CSS hex format (#rrggbb)