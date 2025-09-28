// ABOUTME: Smart container component for injuries that handles session integration and business logic
// ABOUTME: Manages injury data state and coordinates with InjuriesUI for presentation - now using BaseContainerComponent
import { css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { GameTag } from "../../../parser/tag";
import { BaseContainerComponent } from "../../mixins/base-container.lit";
import "./injuries-ui.lit";
import type { InjuriesUI } from "./injuries-ui.lit";

export interface ProcessedInjury {
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

// Map part IDs to our internal naming
const PART_MAP = new Map([
  ["head", "head"],
  ["neck", "neck"],
  ["rightEye", "righteye"],
  ["leftEye", "lefteye"],
  ["chest", "chest"],
  ["abdomen", "abdomen"],
  ["back", "back"],
  ["rightArm", "rightarm"],
  ["leftArm", "leftarm"],
  ["rightHand", "righthand"],
  ["leftHand", "lefthand"],
  ["rightLeg", "rightleg"],
  ["leftLeg", "leftleg"],
  ["nsys", "nerves"],
]);

@customElement("illthorn-injuries-container")
export class InjuriesContainer extends BaseContainerComponent {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @state()
  private _injuries: Array<ProcessedInjury> = [];

  protected getStateToStore(): Record<string, unknown> {
    return {
      injuries: this._injuries,
    };
  }

  protected restoreState(state: Record<string, unknown>): void {
    this._injuries = (state.injuries as Array<ProcessedInjury>) || [];
  }

  protected getStorageKeyPrefix(): string {
    return "injuries";
  }

  protected getSessionEventSubscriptions() {
    return [
      {
        eventName: "metadata/dialogData/injuries",
        handler: this.createStatePersistingHandler((tag: GameTag) => {
          this.processDialogData(tag);
        }),
      },
    ];
  }

  private processDialogData(dialogTag: GameTag) {
    // Look for image children that represent body parts with injury/scar data
    const imageChildren = dialogTag.children.filter((child) => child.name === "image");

    if (imageChildren.length === 0) {
      return;
    }

    const injuries: Array<ProcessedInjury> = [];

    // Parse each image tag for injury/scar information
    imageChildren.forEach((child) => {
      const partId = child.attrs.id as string;
      const imageName = child.attrs.name as string;

      // Skip skin/health UI elements
      if (partId === "healthSkin" || !partId || !imageName) {
        return;
      }

      const injury = this.parseInjuryFromImage(partId, imageName);
      if (injury) {
        injuries.push(injury);
      }
    });

    // Update injuries or clear if only healthy parts detected
    if (injuries.length > 0) {
      this._injuries = this.processInjuries(injuries);
    } else {
      // Check if we have multiple healthy parts (full body scan)
      const hasHealthyPartsOnly = imageChildren.some((child) => child.attrs.name === child.attrs.id && child.attrs.id !== "healthSkin");
      if (hasHealthyPartsOnly && imageChildren.length > 5) {
        this._injuries = [];
      }
    }
  }

  private parseInjuryFromImage(partId: string, imageName: string): ProcessedInjury | null {
    const internalPart = PART_MAP.get(partId) || partId.toLowerCase();

    // Parse injury severity from image name
    if (imageName.startsWith("Injury")) {
      const severityMatch = imageName.match(/Injury(\d+)/);
      const severity = Math.min(severityMatch ? parseInt(severityMatch[1]) : 1, 3) as 0 | 1 | 2 | 3;

      return {
        displayName: DISPLAY_NAMES.get(internalPart) || internalPart,
        severity,
        paired: false,
      };
    }

    if (imageName.startsWith("Scar")) {
      const severityMatch = imageName.match(/Scar(\d+)/);
      const severity = Math.min(severityMatch ? parseInt(severityMatch[1]) : 1, 3) as 0 | 1 | 2 | 3;

      return {
        displayName: DISPLAY_NAMES.get(internalPart) || internalPart,
        severity,
        paired: false,
      };
    }

    // Healthy part (imageName matches partId)
    return null;
  }

  private processInjuries(injuries: Array<ProcessedInjury>): Array<ProcessedInjury> {
    const sorted = this.sortAnatomically(injuries);
    const processed: Array<ProcessedInjury> = [];
    const handled = new Set<string>();

    for (const injury of sorted) {
      if (handled.has(injury.displayName)) continue;

      const pair = this.findPair(injury, injuries);
      if (pair) {
        // Both sides injured - create paired display
        const leftSeverity = injury.displayName.startsWith("l.") ? injury.severity : pair.severity;
        const rightSeverity = injury.displayName.startsWith("r.") ? injury.severity : pair.severity;

        processed.push({
          displayName: this.getPairName(injury.displayName),
          severity: Math.max(injury.severity, pair.severity) as 0 | 1 | 2 | 3,
          paired: true,
          leftSeverity,
          rightSeverity,
        });
        handled.add(injury.displayName);
        handled.add(pair.displayName);
      } else {
        // Single injury - display normally
        processed.push(injury);
        handled.add(injury.displayName);
      }
    }

    return processed;
  }

  private sortAnatomically(injuries: Array<ProcessedInjury>): Array<ProcessedInjury> {
    return injuries.sort((a, b) => {
      // Convert display names back to internal parts for ordering
      const partA = this.getInternalPartName(a.displayName);
      const partB = this.getInternalPartName(b.displayName);

      const indexA = BODY_ORDER.indexOf(partA);
      const indexB = BODY_ORDER.indexOf(partB);

      // If part not in BODY_ORDER, sort to end
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }

  private getInternalPartName(displayName: string): string {
    // Reverse lookup from display name to internal part name
    for (const [internal, display] of DISPLAY_NAMES.entries()) {
      if (display === displayName) return internal;
    }
    return displayName;
  }

  private findPair(injury: ProcessedInjury, allInjuries: Array<ProcessedInjury>): ProcessedInjury | null {
    const displayName = injury.displayName;
    let pairDisplayName: string;

    if (displayName.startsWith("l.")) {
      pairDisplayName = displayName.replace("l.", "r.");
    } else if (displayName.startsWith("r.")) {
      pairDisplayName = displayName.replace("r.", "l.");
    } else {
      return null; // Not a pairable part
    }

    return allInjuries.find((i) => i.displayName === pairDisplayName) || null;
  }

  private getPairName(displayName: string): string {
    if (displayName.includes("eye")) return "eyes";
    if (displayName.includes("arm")) return "arms";
    if (displayName.includes("hand")) return "hands";
    if (displayName.includes("leg")) return "legs";
    return displayName;
  }

  getInjuries(): Array<ProcessedInjury> {
    const injuriesUI = this.shadowRoot?.querySelector("illthorn-injuries-ui") as InjuriesUI;
    return injuriesUI?.getInjuries() || [];
  }

  render() {
    return html`
      <illthorn-injuries-ui .injuries=${this._injuries}></illthorn-injuries-ui>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-injuries-container": InjuriesContainer;
  }
}
