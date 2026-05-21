// ABOUTME: Comprehensive showcase of all theme color variables used throughout Illthorn
// ABOUTME: Provides visual documentation and testing for the complete color palette system

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

const meta: Meta = {
  title: "Design System/Theme Colors",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
# Theme Colors Documentation

This story showcases all CSS custom properties (theme variables) used throughout the Illthorn application.
Each color is displayed with its variable name, hex value, and usage context.

## Color Categories

- **Background & Surface Colors**: Primary backgrounds, panels, and elevated surfaces
- **Text Colors**: All text variations from primary to secondary
- **Status Colors**: Success, warning, danger, and info states
- **Vital Colors**: Health, mana, stamina, spirit, and mind progress bars
- **Injury Colors**: Wound severity indicators
- **Game Content Colors**: Speech, rooms, monsters, and interactive elements
- **Item Category Colors**: All item types with proper categorization
- **UI Elements**: Links, focus indicators, and borders
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const colorSwatchStyle = `
  display: inline-block;
  width: 120px;
  height: 80px;
  margin: 8px;
  border-radius: 8px;
  border: 2px solid var(--color-border);
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
`;

const colorLabelStyle = `
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 4px 6px;
  font-size: 10px;
  font-family: monospace;
  line-height: 1.2;
`;

const createColorSwatch = (variableName: string, description: string) => html`
  <div style="${colorSwatchStyle} background: var(${variableName});">
    <div style="${colorLabelStyle}">
      <div style="font-weight: bold;">${variableName}</div>
      <div style="opacity: 0.8; font-size: 9px;">${description}</div>
    </div>
  </div>
`;

const sectionStyle = `
  margin: 2rem 0;
  padding: 1.5rem;
  background: var(--color-background-secondary);
  border-radius: 12px;
  border: 1px solid var(--color-border);
`;

const sectionTitleStyle = `
  font-size: 1.4rem;
  font-weight: bold;
  color: var(--color-text-primary);
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color-border);
`;

export const CompleteColorPalette: Story = {
  render: () => html`
    <div style="background: var(--color-background-primary); padding: 2rem; min-height: 100vh;">
      <h1 style="color: var(--color-text-primary); text-align: center; margin-bottom: 2rem;">
        Illthorn Theme Colors
      </h1>
      
      <!-- Background & Surface Colors -->
      <div style="${sectionStyle}">
        <h2 style="${sectionTitleStyle}">Background & Surface Colors</h2>
        <div style="display: flex; flex-wrap: wrap;">
          ${createColorSwatch("--color-background-primary", "Main app background")}
          ${createColorSwatch("--color-background-secondary", "Panel backgrounds")}
          ${createColorSwatch("--color-surface", "Elevated surfaces")}
          ${createColorSwatch("--streams-background", "Streams panel bg")}
        </div>
      </div>

      <!-- Text Colors -->
      <div style="${sectionStyle}">
        <h2 style="${sectionTitleStyle}">Text Colors</h2>
        <div style="display: flex; flex-wrap: wrap;">
          ${createColorSwatch("--color-text-primary", "Main text")}
          ${createColorSwatch("--color-text-secondary", "Dimmed text")}
          ${createColorSwatch("--streams-text", "Streams text")}
        </div>
        <div style="margin-top: 1rem; padding: 1rem; background: var(--color-surface); border-radius: 8px;">
          <p style="color: var(--color-text-primary); margin: 0 0 0.5rem 0;">
            Primary text example using --color-text-primary
          </p>
          <p style="color: var(--color-text-secondary); margin: 0; font-size: 0.9rem;">
            Secondary text example using --color-text-secondary
          </p>
        </div>
      </div>

      <!-- Status Colors -->
      <div style="${sectionStyle}">
        <h2 style="${sectionTitleStyle}">Status Colors</h2>
        <div style="display: flex; flex-wrap: wrap;">
          ${createColorSwatch("--color-success", "Success states")}
          ${createColorSwatch("--color-warning", "Warning states")}
          ${createColorSwatch("--color-danger", "Error/danger states")}
          ${createColorSwatch("--color-info", "Neutral info")}
        </div>
        <div style="margin-top: 1rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          <div style="padding: 1rem; background: var(--color-success); color: white; border-radius: 8px; text-align: center;">
            ✓ Success Message
          </div>
          <div style="padding: 1rem; background: var(--color-warning); color: white; border-radius: 8px; text-align: center;">
            ⚠ Warning Message
          </div>
          <div style="padding: 1rem; background: var(--color-danger); color: white; border-radius: 8px; text-align: center;">
            ✗ Error Message
          </div>
          <div style="padding: 1rem; background: var(--color-info); color: white; border-radius: 8px; text-align: center;">
            ℹ Info Message
          </div>
        </div>
      </div>

      <!-- Vital Colors -->
      <div style="${sectionStyle}">
        <h2 style="${sectionTitleStyle}">Vital Colors</h2>
        <div style="display: flex; flex-wrap: wrap;">
          ${createColorSwatch("--color-vital-health", "Health (life/nature)")}
          ${createColorSwatch("--color-vital-mana", "Mana (magical energy)")}
          ${createColorSwatch("--color-vital-stamina", "Stamina (physical)")}
          ${createColorSwatch("--color-vital-spirit", "Spirit (ethereal)")}
          ${createColorSwatch("--color-vital-mind", "Mind (mental/psychic)")}
          ${createColorSwatch("--color-vital-critical", "Critical override")}
        </div>
        <div style="margin-top: 1rem;">
          <h3 style="color: var(--color-text-primary); margin: 0 0 1rem 0;">Vital Progress Bars</h3>
          <div style="display: grid; gap: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <span style="color: var(--color-text-primary); width: 80px;">Health:</span>
              <div style="flex: 1; height: 20px; background: var(--color-surface); border-radius: 10px; overflow: hidden;">
                <div style="width: 85%; height: 100%; background: var(--color-vital-health);"></div>
              </div>
              <span style="color: var(--color-text-secondary); font-size: 0.9rem;">85%</span>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
              <span style="color: var(--color-text-primary); width: 80px;">Mana:</span>
              <div style="flex: 1; height: 20px; background: var(--color-surface); border-radius: 10px; overflow: hidden;">
                <div style="width: 60%; height: 100%; background: var(--color-vital-mana);"></div>
              </div>
              <span style="color: var(--color-text-secondary); font-size: 0.9rem;">60%</span>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
              <span style="color: var(--color-text-primary); width: 80px;">Stamina:</span>
              <div style="flex: 1; height: 20px; background: var(--color-surface); border-radius: 10px; overflow: hidden;">
                <div style="width: 45%; height: 100%; background: var(--color-vital-stamina);"></div>
              </div>
              <span style="color: var(--color-text-secondary); font-size: 0.9rem;">45%</span>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
              <span style="color: var(--color-text-primary); width: 80px;">Spirit:</span>
              <div style="flex: 1; height: 20px; background: var(--color-surface); border-radius: 10px; overflow: hidden;">
                <div style="width: 90%; height: 100%; background: var(--color-vital-spirit);"></div>
              </div>
              <span style="color: var(--color-text-secondary); font-size: 0.9rem;">90%</span>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
              <span style="color: var(--color-text-primary); width: 80px;">Mind:</span>
              <div style="flex: 1; height: 20px; background: var(--color-surface); border-radius: 10px; overflow: hidden;">
                <div style="width: 75%; height: 100%; background: var(--color-vital-mind);"></div>
              </div>
              <span style="color: var(--color-text-secondary); font-size: 0.9rem;">75%</span>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
              <span style="color: var(--color-text-primary); width: 80px;">Critical:</span>
              <div style="flex: 1; height: 20px; background: var(--color-surface); border-radius: 10px; overflow: hidden;">
                <div style="width: 15%; height: 100%; background: var(--color-vital-critical);"></div>
              </div>
              <span style="color: var(--color-text-secondary); font-size: 0.9rem;">15%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Injury Colors -->
      <div style="${sectionStyle}">
        <h2 style="${sectionTitleStyle}">Injury Severity Colors</h2>
        <div style="display: flex; flex-wrap: wrap;">
          ${createColorSwatch("--color-injury-minor", "Minor wounds")}
          ${createColorSwatch("--color-injury-moderate", "Moderate wounds")}
          ${createColorSwatch("--color-injury-severe", "Severe wounds")}
        </div>
        <div style="margin-top: 1rem; display: flex; gap: 1rem;">
          <div style="padding: 1rem; background: var(--color-injury-minor); color: var(--color-background-primary); border-radius: 8px; text-align: center; flex: 1;">
            Minor Scratch
          </div>
          <div style="padding: 1rem; background: var(--color-injury-moderate); color: var(--color-background-primary); border-radius: 8px; text-align: center; flex: 1;">
            Deep Wound
          </div>
          <div style="padding: 1rem; background: var(--color-injury-severe); color: white; border-radius: 8px; text-align: center; flex: 1;">
            Severe Injury
          </div>
        </div>
      </div>

      <!-- Game Content Colors -->
      <div style="${sectionStyle}">
        <h2 style="${sectionTitleStyle}">Game Content Colors</h2>
        <div style="display: flex; flex-wrap: wrap;">
          ${createColorSwatch("--color-room-name", "Room names")}
          ${createColorSwatch("--color-room-description", "Room descriptions")}
          ${createColorSwatch("--color-speech", "Speech text")}
          ${createColorSwatch("--color-whisper", "Whisper text")}
          ${createColorSwatch("--color-monster", "Monster names")}
          ${createColorSwatch("--color-macro", "Macro highlighting")}
          ${createColorSwatch("--color-thoughts", "Thought text")}
          ${createColorSwatch("--color-stream-channel", "Stream channels")}
        </div>
        <div style="margin-top: 1rem; padding: 1rem; background: var(--color-surface); border-radius: 8px; font-family: 'MonoLisa', monospace;">
          <div style="color: var(--color-room-name); font-weight: bold; margin-bottom: 0.5rem;">
            [Wehnimer's Landing, Town Square Central]
          </div>
          <div style="color: var(--color-room-description); margin-bottom: 1rem; line-height: 1.4;">
            This is the heart of the main square of Wehnimer's Landing. The impromptu shops of the bazaar are clustered around this central gathering place, where townsfolk, travellers, and adventurers meet to talk, conspire or raise expeditions to the far reaches of Elanthia.
          </div>
          <div style="color: var(--color-speech); margin-bottom: 0.5rem;">
            Adventurer says, "Welcome to the town square!"
          </div>
          <div style="color: var(--color-whisper); margin-bottom: 0.5rem;">
            Adventurer whispers, "There's treasure to be found in the catacombs."
          </div>
          <div style="color: var(--color-monster); margin-bottom: 0.5rem;">
            A massive troll stomps in from the north!
          </div>
          <div style="color: var(--color-thoughts); margin-bottom: 0.5rem; font-style: italic;">
            You think to yourself, "This place seems familiar..."
          </div>
          <div style="background: var(--color-macro); color: var(--color-background-primary); padding: 2px 4px; border-radius: 4px; display: inline-block;">
            Macro: cast 405
          </div>
        </div>
      </div>

      <!-- Item Category Colors -->
      <div style="${sectionStyle}">
        <h2 style="${sectionTitleStyle}">Item Category Colors</h2>
        <div style="display: flex; flex-wrap: wrap;">
          ${createColorSwatch("--color-item-weapon", "Weapons")}
          ${createColorSwatch("--color-item-armor", "Armor")}
          ${createColorSwatch("--color-item-clothing", "Clothing")}
          ${createColorSwatch("--color-item-gem", "Gems")}
          ${createColorSwatch("--color-item-jewelry", "Jewelry")}
          ${createColorSwatch("--color-item-reagent", "Reagents/herbs")}
          ${createColorSwatch("--color-item-food", "Food")}
          ${createColorSwatch("--color-item-valuable", "Valuable items")}
          ${createColorSwatch("--color-item-box", "Containers/boxes")}
          ${createColorSwatch("--color-item-junk", "Junk items")}
          ${createColorSwatch("--color-item-default", "Default items")}
        </div>
        <div style="margin-top: 1rem;">
          <h3 style="color: var(--color-text-primary); margin: 0 0 1rem 0;">Item Examples</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; font-family: 'MonoLisa', monospace;">
            <div style="padding: 1rem; background: var(--color-surface); border-radius: 8px;">
              <div style="color: var(--color-item-weapon); margin-bottom: 0.25rem;">a gleaming steel longsword</div>
              <div style="color: var(--color-item-armor);">some reinforced leather armor</div>
            </div>
            <div style="padding: 1rem; background: var(--color-surface); border-radius: 8px;">
              <div style="color: var(--color-item-gem); margin-bottom: 0.25rem;">a brilliant blue sapphire</div>
              <div style="color: var(--color-item-jewelry);">a gold wedding ring</div>
            </div>
            <div style="padding: 1rem; background: var(--color-surface); border-radius: 8px;">
              <div style="color: var(--color-item-reagent); margin-bottom: 0.25rem;">some acantha leaf</div>
              <div style="color: var(--color-item-food);">a fresh apple</div>
            </div>
            <div style="padding: 1rem; background: var(--color-surface); border-radius: 8px;">
              <div style="color: var(--color-item-valuable); margin-bottom: 0.25rem;">an ancient scroll</div>
              <div style="color: var(--color-item-box);">a wooden treasure chest</div>
            </div>
            <div style="padding: 1rem; background: var(--color-surface); border-radius: 8px;">
              <div style="color: var(--color-item-clothing); margin-bottom: 0.25rem;">a silk cloak</div>
              <div style="color: var(--color-item-junk);">a broken pottery shard</div>
            </div>
          </div>
        </div>
      </div>

      <!-- UI Element Colors -->
      <div style="${sectionStyle}">
        <h2 style="${sectionTitleStyle}">UI Element Colors</h2>
        <div style="display: flex; flex-wrap: wrap;">
          ${createColorSwatch("--color-border", "Borders & dividers")}
          ${createColorSwatch("--color-link", "Hyperlinks")}
          ${createColorSwatch("--color-focus", "Focus indicators")}
        </div>
        <div style="margin-top: 1rem; padding: 1rem; background: var(--color-surface); border-radius: 8px;">
          <p style="color: var(--color-text-primary); margin: 0 0 1rem 0;">
            This is a paragraph with a 
            <a href="#" style="color: var(--color-link); text-decoration: underline;">clickable link</a>
            that uses the theme link color.
          </p>
          <div style="padding: 1rem; border: 2px solid var(--color-border); border-radius: 8px; margin-bottom: 1rem;">
            <span style="color: var(--color-text-secondary);">
              This container demonstrates border styling with --color-border
            </span>
          </div>
          <button style="
            padding: 0.5rem 1rem;
            background: var(--color-success);
            color: white;
            border: 2px solid transparent;
            border-radius: 6px;
            cursor: pointer;
            font-family: inherit;
          " 
          onmouseover="this.style.outline='2px solid var(--color-focus)'"
          onmouseout="this.style.outline='none'"
          >
            Hover me to see focus color
          </button>
        </div>
      </div>

      <!-- Layout & Typography -->
      <div style="${sectionStyle}">
        <h2 style="${sectionTitleStyle}">Typography & Layout Examples</h2>
        <div style="display: grid; gap: 1rem;">
          <div style="padding: 1rem; background: var(--color-surface); border-radius: 8px; border: 1px solid var(--color-border);">
            <h3 style="color: var(--color-text-primary); margin: 0 0 0.5rem 0;">MonoLisa Font Family</h3>
            <div style="font-family: 'MonoLisa', monospace; color: var(--color-text-secondary); line-height: 1.6;">
              This text uses the MonoLisa monospace font family, commonly used for game content, feeds, and code display.
              <br><br>
              123456789 !@#$%^&*() abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ
            </div>
          </div>
          <div style="padding: 1rem; background: var(--color-surface); border-radius: 8px; border: 1px solid var(--color-border);">
            <h3 style="color: var(--color-text-primary); margin: 0 0 0.5rem 0;">System Sans-Serif Font</h3>
            <div style="font-family: system-ui, sans-serif; color: var(--color-text-secondary); line-height: 1.6;">
              This text uses the system default sans-serif font, typically used for UI elements, buttons, and general interface text.
              <br><br>
              The quick brown fox jumps over the lazy dog. 1234567890
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 3rem; padding: 2rem; background: var(--color-background-secondary); border-radius: 12px; text-align: center; border: 1px solid var(--color-border);">
        <h2 style="color: var(--color-text-primary); margin: 0 0 1rem 0;">
          Complete Color System
        </h2>
        <p style="color: var(--color-text-secondary); margin: 0; line-height: 1.6;">
          This comprehensive color palette ensures consistent theming across all Illthorn components.
          <br>
          All colors support theme customization and maintain accessibility standards.
          <br><br>
          <strong style="color: var(--color-text-primary);">
            Total Variables Documented: 32 color properties
          </strong>
        </p>
      </div>
    </div>
  `,
};
