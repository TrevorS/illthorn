import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./feed.lit";

const meta: Meta = {
  title: "Session/Feed",
  component: "illthorn-feed-lit",
  parameters: {
    docs: {
      description: {
        component: "Main game text display component with auto-scrolling, memory management, command echo integration, and extensive styling for different game text types. Handles parsed HTML content from game server.",
      },
    },
  },
  argTypes: {
    session: {
      control: false,
      description: "Frontend session object for event subscriptions",
    },
    focused: {
      control: "boolean",
      description: "Whether the feed has focus (shows focus border)",
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    focused: false,
  },
  render: (args) => html`
    <div style="width: 600px; height: 400px; padding: 1rem; background: var(--color-surface);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Empty Feed</h3>
      <illthorn-feed-lit .focused=${args.focused}></illthorn-feed-lit>
    </div>
  `,
};

export const WithGameText: Story = {
  args: {
    focused: false,
  },
  render: (args) => {
    // Simulate game text content
    const sampleContent = `
      <div class="content">
        <pre><span class="roomName">Town Square Central</span></pre>
        <pre><span class="roomDesc">This is the heart of the main square of Wehnimer's Landing. The town square is bustling with people. A massive granite archway leads north into the town proper.</span></pre>
        <pre>Obvious exits: <a exist="n">north</a>, <a exist="s">south</a>, <a exist="e">east</a>, <a exist="w">west</a></pre>
        
        <pre>You see <a exist="sword">a steel longsword</a> and <a exist="shield">a wooden shield</a> here.</pre>
        
        <pre class="speech">Player says, "Hello everyone!"</pre>
        <pre class="whisper">Player whispers, "Meet me at the bank."</pre>
        <pre class="thoughts">You think to yourself, "What should I do next?"</pre>
        
        <pre>A <b>massive orc warrior</b> charges in!</pre>
        <pre>The orc warrior swings a war hammer at you!</pre>
        <pre>You dodge the attack!</pre>
        
        <pre>You pick up <a exist="sword">a steel longsword</a>.</pre>
        <pre>You wield the longsword with both hands.</pre>
      </div>
    `;

    return html`
      <div style="width: 600px; height: 400px; padding: 1rem; background: var(--color-surface);">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Game Text Sample</h3>
        <div style="height: 350px; background: var(--color-background); border: 1px solid var(--color-border); ${args.focused ? 'border-color: var(--color-focus);' : ''}">
          <div style="
            height: 100%;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 0.5em;
            font-family: 'Monaco', 'Menlo', monospace;
            line-height: 1.4;
            color: var(--color-text);
          ">
            <!-- Room text -->
            <div style="color: var(--color-room-name, #ffff80); font-weight: bold;">Town Square Central</div>
            <div style="color: var(--color-room-description, #c0c0c0); margin-bottom: 0.5rem;">This is the heart of the main square of Wehnimer's Landing. The town square is bustling with people.</div>
            <div style="margin-bottom: 1rem;">Obvious exits: <span style="color: var(--color-link, #80c0ff); text-decoration: underline; cursor: pointer;">north</span>, <span style="color: var(--color-link, #80c0ff); text-decoration: underline; cursor: pointer;">south</span></div>
            
            <!-- Items -->
            <div style="margin-bottom: 0.5rem;">You see <span style="color: var(--hilite-color, #a0a0a0); text-decoration: underline; cursor: pointer;">a steel longsword</span> here.</div>
            
            <!-- Communication -->
            <div style="color: var(--color-speech, #00ff00); margin-bottom: 0.25rem;">Player says, "Hello everyone!"</div>
            <div style="color: var(--color-whisper, #ffff00); margin-bottom: 0.25rem;">Player whispers, "Meet me at the bank."</div>
            <div style="color: var(--color-text); margin-bottom: 1rem; font-style: italic;">You think to yourself, "What should I do next?"</div>
            
            <!-- Combat -->
            <div style="margin-bottom: 0.25rem;">A <strong style="color: var(--color-monster, #ff6060);">massive orc warrior</strong> charges in!</div>
            <div style="margin-bottom: 0.25rem;">The orc warrior swings a war hammer at you!</div>
            <div style="color: var(--color-success, #00ff00); margin-bottom: 1rem;">You dodge the attack!</div>
            
            <!-- Actions -->
            <div style="margin-bottom: 0.25rem;">You pick up <span style="color: var(--hilite-color, #a0a0a0); text-decoration: underline; cursor: pointer;">a steel longsword</span>.</div>
            <div>You wield the longsword with both hands.</div>
          </div>
        </div>
      </div>
    `;
  },
};

export const WithCommandEcho: Story = {
  render: () => html`
    <div style="width: 600px; height: 400px; padding: 1rem; background: var(--color-surface);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Command Echo Display</h3>
      <div style="height: 350px; background: var(--color-background); border: 1px solid var(--color-border);">
        <div style="
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 0.5em;
          font-family: 'Monaco', 'Menlo', monospace;
          line-height: 1.4;
          color: var(--color-text);
        ">
          <!-- Regular command echo -->
          <div style="
            display: block;
            font-size: 0.9em;
            line-height: 2.2;
            margin: 2px 0;
            color: var(--color-text-secondary, #ccc);
            padding: 1px 0;
            border-left: 1px solid var(--color-border, #666);
            background-color: rgba(255, 255, 255, 0.05);
          ">
            <span style="opacity: 0.8; margin-left: 5px; margin-right: 5px;">&gt;</span>
            <span style="font-style: italic;">look around</span>
          </div>
          
          <div style="color: var(--color-room-name, #ffff80); font-weight: bold; margin: 0.5rem 0;">Town Square Central</div>
          <div style="color: var(--color-room-description, #c0c0c0);">You are standing in the town square...</div>
          
          <!-- Replay command echo -->
          <div style="
            display: block;
            font-size: 0.9em;
            line-height: 2.2;
            margin: 2px 0;
            color: var(--color-warning, #ffcc00);
            padding: 1px 0;
            border-left: 1px solid var(--color-warning, #ff9900);
            background-color: rgba(255, 204, 0, 0.1);
            font-style: italic;
          ">
            <span style="opacity: 0.8; margin-left: 5px; margin-right: 5px;">⟲</span>
            <span style="font-style: italic;">swing sword at orc</span>
          </div>
          
          <div style="color: var(--color-success, #00ff00);">You swing a steel longsword at an orc!</div>
          <div style="color: var(--color-success, #00ff00);">You hit the orc for 45 damage!</div>
          
          <!-- Another regular command -->
          <div style="
            display: block;
            font-size: 0.9em;
            line-height: 2.2;
            margin: 2px 0;
            color: var(--color-text-secondary, #ccc);
            padding: 1px 0;
            border-left: 1px solid var(--color-border, #666);
            background-color: rgba(255, 255, 255, 0.05);
          ">
            <span style="opacity: 0.8; margin-left: 5px; margin-right: 5px;">&gt;</span>
            <span style="font-style: italic;">get all</span>
          </div>
          
          <div>You pick up some silver coins.</div>
          <div>You pick up a small gem.</div>
        </div>
      </div>
    </div>
  `,
};

export const Focused: Story = {
  args: {
    focused: true,
  },
  render: (args) => html`
    <div style="width: 600px; height: 400px; padding: 1rem; background: var(--color-surface);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Focused Feed</h3>
      <div style="height: 350px; background: var(--color-background); border: 1px solid ${args.focused ? 'var(--color-focus, #0080ff)' : 'var(--color-border)'};">
        <div style="
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 0.5em;
          font-family: 'Monaco', 'Menlo', monospace;
          line-height: 1.4;
          color: var(--color-text);
        ">
          <div style="color: var(--color-room-name, #ffff80); font-weight: bold;">Training Grounds</div>
          <div style="color: var(--color-room-description, #c0c0c0); margin-bottom: 1rem;">This area is set up for combat training.</div>
          <div style="margin-bottom: 0.5rem;">A <strong style="color: var(--color-monster, #ff6060);">training dummy</strong> stands here.</div>
          <div style="color: var(--color-success, #00ff00);">You practice your sword technique on the dummy.</div>
        </div>
      </div>
      <p style="margin: 1rem 0 0 0; font-size: 0.9rem; color: var(--color-text-secondary);">
        Focused state shows blue border around the feed container.
      </p>
    </div>
  `,
};

export const InteractiveElements: Story = {
  render: () => html`
    <div style="width: 600px; height: 400px; padding: 1rem; background: var(--color-surface);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Interactive Elements</h3>
      <div style="height: 350px; background: var(--color-background); border: 1px solid var(--color-border);">
        <div style="
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 0.5em;
          font-family: 'Monaco', 'Menlo', monospace;
          line-height: 1.4;
          color: var(--color-text);
        ">
          <div style="margin-bottom: 1rem;">
            <div style="color: var(--color-room-name, #ffff80); font-weight: bold; margin-bottom: 0.5rem;">Weaponsmith Shop</div>
            <div style="color: var(--color-room-description, #c0c0c0); margin-bottom: 0.5rem;">The shop is filled with weapons and armor.</div>
          </div>
          
          <div style="margin-bottom: 0.5rem;">
            Items for sale:
          </div>
          
          <!-- Clickable items -->
          <div style="margin-bottom: 0.25rem;">
            • <span style="color: var(--hilite-color, #a0a0a0); text-decoration: underline; cursor: pointer;" title="Click to examine">a sharp dagger</span>
          </div>
          <div style="margin-bottom: 0.25rem;">
            • <span style="color: var(--hilite-color, #a0a0a0); text-decoration: underline; cursor: pointer;" title="Click to examine">a sturdy shield</span>
          </div>
          <div style="margin-bottom: 1rem;">
            • <span style="color: var(--hilite-color, #a0a0a0); text-decoration: underline; cursor: pointer;" title="Click to examine">a magic sword</span>
          </div>
          
          <!-- Clickable exits -->
          <div style="margin-bottom: 0.5rem;">
            Obvious exits: 
          </div>
          <div style="margin-bottom: 1rem;">
            <span style="color: var(--color-link, #80c0ff); text-decoration: underline; cursor: pointer;" title="Click to go north">north</span> (to Main Street), 
            <span style="color: var(--color-link, #80c0ff); text-decoration: underline; cursor: pointer;" title="Click to go out">out</span>
          </div>
          
          <!-- Clickable commands -->
          <div style="margin-bottom: 0.25rem;">
            The weaponsmith says, "Would you like to 
            <span style="border-bottom: 2px solid var(--color-link, #80c0ff); cursor: pointer; padding: 0 2px;" title="Click to buy items">buy</span> 
            something or 
            <span style="border-bottom: 2px solid var(--color-link, #80c0ff); cursor: pointer; padding: 0 2px;" title="Click to sell items">sell</span> 
            your old gear?"
          </div>
        </div>
      </div>
      <p style="margin: 1rem 0 0 0; font-size: 0.9rem; color: var(--color-text-secondary);">
        Hover over underlined elements to see they're clickable. In actual game, these would execute commands or show descriptions.
      </p>
    </div>
  `,
};

export const ScrollingBehavior: Story = {
  render: () => html`
    <div style="width: 600px; height: 500px; padding: 1rem; background: var(--color-surface);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Scrolling Behavior Demo</h3>
      <div style="height: 300px; background: var(--color-background); border: 1px solid var(--color-border); position: relative;">
        <div style="
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 0.5em;
          font-family: 'Monaco', 'Menlo', monospace;
          line-height: 1.4;
          color: var(--color-text);
          scrollbar-width: thin;
          scrollbar-color: var(--color-border) transparent;
        ">
          <div style="margin-bottom: 0.5rem;">--- Beginning of session ---</div>
          <div style="margin-bottom: 0.5rem;">Welcome to Gemstone IV!</div>
          <div style="margin-bottom: 0.5rem;">You are in the town square.</div>
          <div style="margin-bottom: 0.5rem;">There are many people here.</div>
          <div style="margin-bottom: 0.5rem;">A bard is playing music nearby.</div>
          <div style="margin-bottom: 0.5rem;">You see a merchant selling goods.</div>
          <div style="margin-bottom: 0.5rem;">Someone shouts, "Fresh bread for sale!"</div>
          <div style="margin-bottom: 0.5rem;">You look around carefully.</div>
          <div style="margin-bottom: 0.5rem;">The sun is shining brightly.</div>
          <div style="margin-bottom: 0.5rem;">A guard patrols the area.</div>
          <div style="margin-bottom: 0.5rem;">You check your inventory.</div>
          <div style="margin-bottom: 0.5rem;">You have 500 silver coins.</div>
          <div style="margin-bottom: 0.5rem;">You have a leather backpack.</div>
          <div style="margin-bottom: 0.5rem;">You have some travel rations.</div>
          <div style="margin-bottom: 0.5rem;">A cat runs across the square.</div>
          <div style="margin-bottom: 0.5rem;">Children are playing nearby.</div>
          <div style="margin-bottom: 0.5rem;">The town crier announces the time.</div>
          <div style="margin-bottom: 0.5rem;">You decide to explore the town.</div>
          <div style="margin-bottom: 0.5rem;">You head toward the marketplace.</div>
          <div style="margin-bottom: 0.5rem;">The marketplace is bustling with activity.</div>
          <div style="margin-bottom: 0.5rem;">You see many interesting items for sale.</div>
          <div style="margin-bottom: 0.5rem;">A vendor calls out their wares.</div>
          <div style="margin-bottom: 0.5rem;">You browse the various stalls.</div>
          <div style="margin-bottom: 0.5rem;">The aroma of fresh food fills the air.</div>
          <div style="margin-bottom: 0.5rem;">You purchase a hot meat pie.</div>
          <div style="margin-bottom: 0.5rem;">It tastes delicious!</div>
          <div style="margin-bottom: 0.5rem; color: var(--color-success, #00ff00);">--- Most recent content (auto-scroll target) ---</div>
        </div>
      </div>
      <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
        <p style="margin: 0 0 0.5rem 0;"><strong>Feed Scrolling Features:</strong></p>
        <ul style="margin: 0; padding-left: 1.5rem;">
          <li>Auto-scrolls to bottom when new content arrives</li>
          <li>Detects manual scrolling and pauses auto-scroll</li>
          <li>Resumes auto-scroll when user scrolls back to bottom</li>
          <li>Custom scrollbar styling with hover effects</li>
          <li>Memory management - old content is automatically removed</li>
        </ul>
      </div>
    </div>
  `,
};

export const TextStylingVariations: Story = {
  render: () => html`
    <div style="width: 700px; height: 500px; padding: 1rem; background: var(--color-surface);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Text Styling Variations</h3>
      <div style="height: 400px; background: var(--color-background); border: 1px solid var(--color-border);">
        <div style="
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 0.5em;
          font-family: 'Monaco', 'Menlo', monospace;
          line-height: 1.4;
          color: var(--color-text);
        ">
          <!-- Room styling -->
          <div style="margin-bottom: 1rem;">
            <div style="color: var(--color-room-name, #ffff80); font-weight: bold;">Room Names (yellow, bold)</div>
            <div style="color: var(--color-room-description, #c0c0c0);">Room descriptions use lighter gray text for readability.</div>
          </div>
          
          <!-- Communication styling -->
          <div style="margin-bottom: 1rem;">
            <div style="color: var(--color-speech, #00ff00);">Speech text appears in bright green</div>
            <div style="color: var(--color-whisper, #ffff00);">Whispers are shown in yellow</div>
            <div style="color: var(--color-text); font-style: italic;">Thoughts appear in regular text with italic styling</div>
          </div>
          
          <!-- Combat and monsters -->
          <div style="margin-bottom: 1rem;">
            <div><strong style="color: var(--color-monster, #ff6060);">Monster names</strong> are bold and red</div>
            <div style="color: var(--color-success, #00ff00);">Successful actions appear in green</div>
            <div style="color: var(--color-danger, #ff4444);">Damage or negative effects in red</div>
          </div>
          
          <!-- Items and links -->
          <div style="margin-bottom: 1rem;">
            <div><span style="color: var(--hilite-color, #a0a0a0); text-decoration: underline; cursor: pointer;">Interactable items</span> are underlined and clickable</div>
            <div><span style="color: var(--color-link, #80c0ff); text-decoration: underline; cursor: pointer;">Links and exits</span> appear in blue with underlines</div>
            <div><span style="border-bottom: 2px solid var(--color-link, #80c0ff); cursor: pointer; padding: 0 2px;">Clickable commands</span> have bottom borders</div>
          </div>
          
          <!-- Special formatting -->
          <div style="margin-bottom: 1rem;">
            <div style="background: var(--color-macro, rgba(255,255,0,0.2)); padding: 0 2px;">Macro highlights</div>
            <div><span style="color: var(--color-text-secondary, #999); font-size: 0.9em;">[System messages in smaller, dimmed text]</span></div>
          </div>
          
          <!-- Formatted text elements -->
          <div style="margin-bottom: 1rem;">
            <div><strong>Bold text</strong> for emphasis</div>
            <div><em>Italic text</em> for thoughts or descriptions</div>
            <div style="text-decoration: underline;">Underlined text</div> for special emphasis
          </div>
        </div>
      </div>
    </div>
  `,
};

export const MemoryManagement: Story = {
  render: () => html`
    <div style="width: 600px; height: 400px; padding: 1rem; background: var(--color-surface);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Memory Management</h3>
      <div style="height: 250px; background: var(--color-background); border: 1px solid var(--color-border);">
        <div style="
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 0.5em;
          font-family: 'Monaco', 'Menlo', monospace;
          line-height: 1.4;
          color: var(--color-text);
        ">
          <div style="color: var(--color-text-secondary); margin-bottom: 1rem;">[Simulated content after memory cleanup]</div>
          <div style="margin-bottom: 0.5rem;">Message 496 of 500 (older messages removed)</div>
          <div style="margin-bottom: 0.5rem;">Message 497 of 500</div>
          <div style="margin-bottom: 0.5rem;">Message 498 of 500</div>
          <div style="margin-bottom: 0.5rem;">Message 499 of 500</div>
          <div style="color: var(--color-success, #00ff00);">Message 500 of 500 (most recent)</div>
        </div>
      </div>
      
      <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
        <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem;">Memory Management Features:</h4>
        <ul style="margin: 0; padding-left: 1.5rem;">
          <li><strong>MAX_MEMORY_LENGTH</strong>: 500 messages maximum</li>
          <li><strong>Automatic cleanup</strong>: Old messages removed when limit reached</li>
          <li><strong>Performance optimization</strong>: Prevents memory leaks in long sessions</li>
          <li><strong>Scroll preservation</strong>: User scroll position maintained during cleanup</li>
          <li><strong>Flush mechanism</strong>: Removes oldest entries first (FIFO)</li>
        </ul>
        
        <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem; font-size: 0.8rem;">
          <strong>Note:</strong> In a real game session with high message volume, this prevents the browser 
          from consuming excessive memory while maintaining a reasonable history buffer.
        </div>
      </div>
    </div>
  `,
};

export const AccessibilityDemo: Story = {
  render: () => html`
    <div style="width: 600px; height: 400px; padding: 1rem; background: var(--color-surface);">
      <h3 style="margin: 0 0 1rem 0; color: var(--color-text);">Accessibility Features</h3>
      <div style="height: 250px; background: var(--color-background); border: 1px solid var(--color-border);">
        <div style="
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 0.5em;
          font-family: 'Monaco', 'Menlo', monospace;
          line-height: 1.4;
          color: var(--color-text);
        ">
          <div style="margin-bottom: 0.5rem;">Screen reader accessible content with semantic markup</div>
          <div style="margin-bottom: 0.5rem;">High contrast text colors for readability</div>
          <div style="margin-bottom: 0.5rem;">Keyboard navigation support for interactive elements</div>
          <div style="margin-bottom: 0.5rem;">Text selection preservation during updates</div>
          <div style="color: var(--color-success, #00ff00);">Monospace font improves text alignment for screen readers</div>
        </div>
      </div>
      
      <div style="margin-top: 1rem; color: var(--color-text); font-size: 0.9rem;">
        <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem;">Accessibility Features:</h4>
        <ul style="margin: 0; padding-left: 1.5rem;">
          <li>Semantic HTML structure with proper elements</li>
          <li>High contrast color scheme with customizable CSS properties</li>
          <li>Keyboard navigation for all interactive elements</li>
          <li>Screen reader compatible with preserved text selection</li>
          <li>Focus management with visible focus indicators</li>
          <li>Monospace font for consistent character spacing</li>
          <li>Proper scroll behavior that doesn't interfere with assistive technology</li>
        </ul>
      </div>
    </div>
  `,
};