import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { MockDataGenerator } from "../../../utils/mock-data";
import "./room-badge.lit";

const meta: Meta = {
  title: "Input System/Room Badge",
  component: "illthorn-room-badge-lit",
  parameters: {
    docs: {
      description: {
        component: "Displays room ID and title with intelligent text truncation for space-constrained layouts.",
      },
    },
  },
  argTypes: {
    roomId: {
      control: "text",
      description: "Room ID number",
    },
    roomTitle: {
      control: "text",
      description: "Full room title/name",
    },
    roomZone: {
      control: { type: "select" },
      options: ["town", "wilderness", "dungeon", "special"],
      description: "Zone type for color coding",
    },
    maxWidth: {
      control: { type: "range", min: 50, max: 500, step: 10 },
      description: "Maximum width in pixels before truncation",
    },
    showTooltip: {
      control: "boolean",
      description: "Show full title in tooltip on hover",
    },
    compact: {
      control: "boolean",
      description: "Use compact display mode",
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    roomId: "7120",
    roomTitle: "Town Square Central",
    roomZone: "town",
    maxWidth: 200,
    showTooltip: true,
    compact: false,
  },
  render: (args) => html`
    <illthorn-room-badge-lit
      .roomId=${args.roomId}
      .roomTitle=${args.roomTitle}
      .roomZone=${args.roomZone}
      .maxWidth=${args.maxWidth}
      .showTooltip=${args.showTooltip}
      .compact=${args.compact}
    ></illthorn-room-badge-lit>
  `,
};

export const LongName: Story = {
  args: {
    roomId: "12345",
    roomTitle: "The Grand Hall of the Ancient Dwarven Kings of the Eastern Mountain Range",
    roomZone: "special",
    maxWidth: 250,
    showTooltip: true,
  },
  render: (args) => html`
    <div style="padding: 20px;">
      <h4>Long Room Title Truncation</h4>
      <illthorn-room-badge-lit
        .roomId=${args.roomId}
        .roomTitle=${args.roomTitle}
        .roomZone=${args.roomZone}
        .maxWidth=${args.maxWidth}
        .showTooltip=${args.showTooltip}
      ></illthorn-room-badge-lit>
    </div>
  `,
};

export const TruncationTest: Story = {
  render: () => {
    const testCases = [
      "Town Square Central",
      "The Grand Hall of Kings",
      "A Very Long Room Name That Should Be Truncated Intelligently",
      "[Warden's Office, Hallway]",
      "Room with (Special Characters) and [Brackets]",
      "[Wehnimer's Landing, North Ring Rd.]",
    ];

    return html`
      <div style="padding: 20px;">
        <h4>Truncation Algorithm Testing</h4>
        ${testCases.map(
          (title) => html`
            <div style="margin: 15px 0;">
              <div style="font-size: 0.9em; color: var(--color-text-secondary); margin-bottom: 5px;">
                Original: "${title}"
              </div>
              <div style="display: grid; grid-template-columns: 150px 200px 300px; gap: 10px;">
                ${[150, 200, 300].map(
                  (width) => html`
                    <div style="border: 1px dashed var(--color-border); padding: 5px;">
                      <div style="font-size: 0.8em; color: var(--color-text-secondary);">${width}px</div>
                      <illthorn-room-badge-lit
                        .roomTitle=${title}
                        .roomId="1234"
                        .maxWidth=${width}
                        .showTooltip=${true}
                      ></illthorn-room-badge-lit>
                    </div>
                  `
                )}
              </div>
            </div>
          `
        )}
      </div>
    `;
  },
};

export const ZoneColors: Story = {
  render: () => {
    const zones = [
      { zone: "town", title: "Town Square Central", id: "7120" },
      { zone: "wilderness", title: "Dark Forest Path", id: "1234" },
      { zone: "dungeon", title: "Ancient Cavern", id: "5678" },
      { zone: "special", title: "The Rift", id: "9999" },
    ];

    return html`
      <div style="display: flex; flex-direction: column; gap: 15px; padding: 20px;">
        <h4>Zone-based Color Coding</h4>
        ${zones.map(
          ({ zone, title, id }) => html`
            <div style="display: flex; align-items: center; gap: 15px;">
              <span style="width: 80px; font-size: 0.9em; color: var(--color-text-secondary);">
                ${zone}:
              </span>
              <illthorn-room-badge-lit
                .roomZone=${zone}
                .roomTitle=${title}
                .roomId=${id}
                .maxWidth=${250}
                .showTooltip=${true}
              ></illthorn-room-badge-lit>
            </div>
          `
        )}
      </div>
    `;
  },
};

export const CompactMode: Story = {
  render: () => html`
    <div style="padding: 20px;">
      <h4>Compact vs Normal Display</h4>
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div>
          <div style="font-weight: bold; margin-bottom: 10px;">Normal Mode:</div>
          <illthorn-room-badge-lit
            .roomId="7120"
            .roomTitle="Town Square Central"
            .roomZone="town"
            .compact=${false}
          ></illthorn-room-badge-lit>
        </div>
        <div>
          <div style="font-weight: bold; margin-bottom: 10px;">Compact Mode:</div>
          <illthorn-room-badge-lit
            .roomId="7120"
            .roomTitle="Town Square Central"
            .roomZone="town"
            .compact=${true}
          ></illthorn-room-badge-lit>
        </div>
      </div>
    </div>
  `,
};

export const ResponsiveWidths: Story = {
  render: () => {
    const testRoom = {
      id: "12345",
      title: "[Wehnimer's Landing, Town Square Central]",
      zone: "town",
    };

    return html`
      <div style="padding: 20px;">
        <h4>Responsive Width Testing</h4>
        ${[100, 150, 200, 250, 300, 400].map(
          (width) => html`
            <div style="margin: 15px 0; border: 1px solid var(--color-border); padding: 10px; width: ${width}px;">
              <div style="font-size: 0.8em; color: var(--color-text-secondary); margin-bottom: 5px;">
                Container: ${width}px
              </div>
              <illthorn-room-badge-lit
                .roomId=${testRoom.id}
                .roomTitle=${testRoom.title}
                .roomZone=${testRoom.zone}
                .maxWidth=${width - 20}
                .showTooltip=${true}
              ></illthorn-room-badge-lit>
            </div>
          `
        )}
      </div>
    `;
  },
};

export const InteractiveTooltips: Story = {
  args: {
    roomId: "9999",
    roomTitle: "The Grand Hall of the Ancient Dwarven Kings Where Legends Were Born and Heroes Were Made",
    roomZone: "special",
    maxWidth: 200,
    showTooltip: true,
  },
  render: (args) => html`
    <div style="padding: 40px;">
      <h4>Hover for Full Title (Tooltip)</h4>
      <p style="color: var(--color-text-secondary); font-size: 0.9em;">
        The room title is truncated below. Hover over it to see the full title in a tooltip.
      </p>
      <illthorn-room-badge-lit
        .roomId=${args.roomId}
        .roomTitle=${args.roomTitle}
        .roomZone=${args.roomZone}
        .maxWidth=${args.maxWidth}
        .showTooltip=${args.showTooltip}
      ></illthorn-room-badge-lit>
    </div>
  `,
};

export const DynamicScenarios: Story = {
  render: () => {
    const scenarios = [
      MockDataGenerator.scenarios.newPlayer(),
      MockDataGenerator.scenarios.combat(),
      MockDataGenerator.scenarios.casting(),
      MockDataGenerator.scenarios.noExits(),
    ];

    return html`
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; padding: 20px;">
        <h4 style="grid-column: 1 / -1;">Dynamic Room Badge Scenarios</h4>
        ${scenarios.map(
          (scenario, index) => html`
            <div style="border: 1px solid var(--color-border); padding: 15px; border-radius: 4px;">
              <div style="font-size: 0.9em; color: var(--color-text-secondary); margin-bottom: 10px;">
                Scenario ${index + 1}
              </div>
              <illthorn-room-badge-lit
                .roomId=${scenario.room.id}
                .roomTitle=${scenario.room.title}
                .roomZone=${scenario.room.zone}
                .maxWidth=${250}
                .showTooltip=${true}
              ></illthorn-room-badge-lit>
            </div>
          `
        )}
      </div>
    `;
  },
};

export const EdgeCases: Story = {
  render: () => {
    const edgeCases = [
      { id: "", title: "", description: "Empty room data" },
      { id: "0", title: "A", description: "Minimal content" },
      { id: "999999", title: "X".repeat(200), description: "Very long ID and title" },
      { id: "7120", title: "[Room, With, Many, Commas, And, Brackets]", description: "Special characters" },
      { id: "null", title: undefined, description: "Undefined title" },
    ];

    return html`
      <div style="padding: 20px;">
        <h4>Edge Cases and Error Handling</h4>
        ${edgeCases.map(
          ({ id, title, description }) => html`
            <div style="margin: 15px 0; padding: 10px; border: 1px dashed var(--color-border);">
              <div style="font-size: 0.9em; color: var(--color-text-secondary); margin-bottom: 5px;">
                ${description}
              </div>
              <illthorn-room-badge-lit
                .roomId=${id}
                .roomTitle=${title}
                .roomZone="town"
                .maxWidth=${200}
                .showTooltip=${true}
              ></illthorn-room-badge-lit>
            </div>
          `
        )}
      </div>
    `;
  },
};