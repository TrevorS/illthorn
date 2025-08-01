// ABOUTME: Injury display component that shows character wounds and injuries in a terminal-aesthetic panel
// ABOUTME: Processes raw injury XML data with smart pairing, anatomical sorting, and severity indicators
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { GameTag } from "../../../parser/tag";
import type { FrontendSession as Session } from "../../../session/index";

interface RawInjury {
  part: string; // "rightArm", "head", etc.
  severity: 0 | 1 | 2 | 3;
  description: string; // Full game text
}

interface ProcessedInjury {
  displayName: string; // "head", "arms", "r.eye"
  severity: 0 | 1 | 2 | 3;
  paired: boolean; // True if left/right parts combined
  leftSeverity?: 0 | 1 | 2 | 3; // For paired limbs
  rightSeverity?: 0 | 1 | 2 | 3; // For paired limbs
}

// Body part anatomical ordering (head-to-toe)
const BODY_ORDER = [
  "head",
  "neck",
  "righteye",
  "lefteye", // Head area
  "chest",
  "abdomen",
  "back", // Torso
  "rightarm",
  "leftarm",
  "righthand",
  "lefthand", // Arms
  "rightleg",
  "leftleg", // Legs
  "nerves", // Nervous system
];

// Display name mapping for abbreviated body parts
const DISPLAY_NAMES = new Map([
  ["righteye", "r.eye"],
  ["lefteye", "l.eye"],
  ["rightarm", "r.arm"],
  ["leftarm", "l.arm"],
  ["righthand", "r.hand"],
  ["lefthand", "l.hand"],
  ["rightleg", "r.leg"],
  ["leftleg", "l.leg"],
  ["head", "head"],
  ["neck", "neck"],
  ["chest", "chest"],
  ["abdomen", "abdomen"],
  ["back", "back"],
  ["nerves", "nerves"],
]);

// Body parts that can be paired (left/right)
const _PAIRABLE_PARTS = new Set(["eye", "arm", "hand", "leg"]);

@customElement("illthorn-injuries-lit")
export class InjuriesLit extends LitElement {
  static styles = css`
    :host {
      display: block;
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

    :host {
      width: var(--injury-width);
      font-family: var(--injury-font);
      font-size: var(--injury-font-size);
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

    /* Severity colors */
    .severity-minor {
      color: var(--injury-severity-minor);
    }

    .severity-moderate {
      color: var(--injury-severity-moderate);
    }

    .severity-severe {
      color: var(--injury-severity-severe);
    }
  `;

  @property({ type: Object })
  session: Session | null = null;

  @state()
  private _injuries: ProcessedInjury[] = [];

  constructor(session?: Session) {
    super();
    if (session) {
      this.session = session;
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.attachListeners();
  }

  private attachListeners() {
    if (!this.session || !this.session.bus) {
      return;
    }

    // Subscribe to injury updates
    this.session.bus.subscribeEvent<GameTag>("metadata/injury", ({ detail }) => {
      this.processInjuryData(detail);
    });

    // Alternative: if injuries come as dialogData
    this.session.bus.subscribeEvent<GameTag>("metadata/dialogData/injuries", ({ detail }) => {
      this.processDialogData(detail);
    });
  }

  private processInjuryData(injuryTag: GameTag) {
    const rawInjury: RawInjury = {
      part: (injuryTag.attrs.part as string) || "",
      severity: parseInt((injuryTag.attrs.severity as string) || "0") as 0 | 1 | 2 | 3,
      description: (injuryTag.attrs.description as string) || "",
    };

    // For single injury events, we need to maintain the full injury list
    // This is a simplified approach - in real implementation you'd want to manage
    // the complete injury state properly
    const existingInjuries = [...this._injuries];

    // Convert processed injuries back to raw format for processing
    const rawInjuries: RawInjury[] = [];
    existingInjuries.forEach((processed) => {
      if (processed.paired && processed.leftSeverity && processed.rightSeverity) {
        // Split paired injury back into individual parts
        const basePart = this.getBasePartFromPaired(processed.displayName);
        rawInjuries.push({
          part: `left${basePart}`,
          severity: processed.leftSeverity,
          description: "existing injury",
        });
        rawInjuries.push({
          part: `right${basePart}`,
          severity: processed.rightSeverity,
          description: "existing injury",
        });
      } else {
        // Find the original part name from display name
        const originalPart = this.getOriginalPartName(processed.displayName);
        rawInjuries.push({
          part: originalPart,
          severity: processed.severity,
          description: "existing injury",
        });
      }
    });

    // Add the new injury
    rawInjuries.push(rawInjury);

    // Reprocess all injuries
    this._injuries = this.processInjuries(rawInjuries);
  }

  private processDialogData(dialogTag: GameTag) {
    const injuryChildren = dialogTag.children.filter((child) => child.name === "injury");

    if (injuryChildren.length === 0) {
      // No injuries - show healthy state
      this._injuries = [];
      return;
    }

    const rawInjuries: RawInjury[] = injuryChildren.map((child) => ({
      part: (child.attrs.part as string) || "",
      severity: parseInt((child.attrs.severity as string) || "0") as 0 | 1 | 2 | 3,
      description: (child.attrs.description as string) || "",
    }));

    this._injuries = this.processInjuries(rawInjuries);
  }

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
          severity: Math.max(injury.severity, pair.severity) as 0 | 1 | 2 | 3,
          paired: true,
          leftSeverity: injury.part.startsWith("left") ? injury.severity : pair.severity,
          rightSeverity: injury.part.startsWith("right") ? injury.severity : pair.severity,
        });
        handled.add(injury.part);
        handled.add(pair.part);
      } else {
        // Single injury - display normally
        processed.push({
          displayName: DISPLAY_NAMES.get(injury.part) || injury.part,
          severity: injury.severity,
          paired: false,
        });
        handled.add(injury.part);
      }
    }

    return processed;
  }

  private sortAnatomically(injuries: RawInjury[]): RawInjury[] {
    return injuries.sort((a, b) => {
      const indexA = BODY_ORDER.indexOf(a.part);
      const indexB = BODY_ORDER.indexOf(b.part);
      // If part not in BODY_ORDER, sort to end
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }

  private findPair(injury: RawInjury, allInjuries: RawInjury[]): RawInjury | null {
    let pairPart: string;

    if (injury.part.startsWith("left")) {
      pairPart = injury.part.replace("left", "right");
    } else if (injury.part.startsWith("right")) {
      pairPart = injury.part.replace("right", "left");
    } else {
      return null; // Not a pairable part
    }

    return allInjuries.find((i) => i.part === pairPart) || null;
  }

  private getPairName(part: string): string {
    if (part.includes("eye")) return "eyes";
    if (part.includes("arm")) return "arms";
    if (part.includes("hand")) return "hands";
    if (part.includes("leg")) return "legs";
    return part;
  }

  private getBasePartFromPaired(pairName: string): string {
    switch (pairName) {
      case "eyes":
        return "eye";
      case "arms":
        return "arm";
      case "hands":
        return "hand";
      case "legs":
        return "leg";
      default:
        return pairName;
    }
  }

  private getOriginalPartName(displayName: string): string {
    // Reverse lookup from display name to original part name
    for (const [original, display] of DISPLAY_NAMES.entries()) {
      if (display === displayName) return original;
    }
    return displayName;
  }

  private getSeveritySymbol(severity: 0 | 1 | 2 | 3): string {
    switch (severity) {
      case 1:
        return "*"; // Minor
      case 2:
        return "#"; // Moderate
      case 3:
        return "@"; // Severe
      default:
        return ""; // Healthy
    }
  }

  private getSeverityColor(severity: 0 | 1 | 2 | 3): string {
    switch (severity) {
      case 1:
        return "var(--injury-severity-minor)"; // Yellow
      case 2:
        return "var(--injury-severity-moderate)"; // Orange
      case 3:
        return "var(--injury-severity-severe)"; // Red
      default:
        return "var(--injury-text-primary)"; // Default
    }
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

  render() {
    if (!this.session) {
      return html``;
    }

    return html`
      <div class="injury-content">
        ${this._injuries.length === 0 ? html`<div class="healthy">healthy</div>` : this._injuries.map((injury) => this.renderInjury(injury))}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-injuries-lit": InjuriesLit;
  }
}
