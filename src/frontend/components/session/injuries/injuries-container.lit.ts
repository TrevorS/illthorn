// ABOUTME: Smart container component for injuries that handles session integration and business logic
// ABOUTME: Manages injury data state and coordinates with InjuriesUI for presentation
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { GameTag } from "../../../parser/tag";
import type { FrontendSession as Session } from "../../../session/index";
import type { Bus } from "../../../util/bus";
import "./injuries-ui.lit";
import type { InjuriesUI } from "./injuries-ui.lit";

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

@customElement("illthorn-injuries-container")
export class InjuriesContainer extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: Object })
  session?: Session;

  @state()
  private _injuries: Array<ProcessedInjury> = [];

  private _eventHandlers: Array<{ event: string; handler: (event: CustomEvent<GameTag>) => void; bus: Bus }> = [];

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has("session")) {
      this._setupEventListeners();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._cleanupEventListeners();
  }

  private _setupEventListeners() {
    this._cleanupEventListeners();

    if (!this.session?.bus) {
      return;
    }

    const bus = this.session.bus;

    // Debug: Listen for potential injury events with targeted logging
    const debugHandler = ({ detail: tag }: CustomEvent<GameTag>) => {
      // Log specific injury-related events without spamming console
      if (
        tag.name?.toLowerCase().includes("injur") ||
        (typeof tag.attrs?.id === "string" && tag.attrs.id.toLowerCase().includes("injur")) ||
        tag.attrs?.part ||
        tag.name === "dialogData" ||
        tag.name === "skin" ||
        tag.name === "radio" ||
        tag.name === "wound" ||
        tag.name === "health"
      ) {
        console.log("[INJURY DEBUG] 🎯 Found potential injury event:", {
          eventType: tag.name,
          id: tag.attrs?.id,
          part: tag.attrs?.part,
          severity: tag.attrs?.severity,
          attrs: tag.attrs,
          children: tag.children?.length || 0,
          hasChildren: tag.children && tag.children.length > 0,
        });

        // If it has children, log them too
        if (tag.children && tag.children.length > 0) {
          tag.children.forEach((child, index) => {
            console.log(`[INJURY DEBUG] 📋 Child ${index}:`, {
              name: child.name,
              attrs: child.attrs,
              text: child.text,
            });
          });
        }
      }
    };
    bus.subscribeEvent<GameTag>("metadata/*", debugHandler);
    this._eventHandlers.push({ event: "metadata/*", handler: debugHandler, bus });

    // Subscribe to injury updates
    const injuryHandler = ({ detail: injuryTag }: CustomEvent<GameTag>) => {
      console.log("[INJURY DEBUG] 🔥 Processing direct injury event:", injuryTag);
      this.processInjuryData(injuryTag);
    };
    bus.subscribeEvent<GameTag>("metadata/injury", injuryHandler);
    this._eventHandlers.push({ event: "metadata/injury", handler: injuryHandler, bus });

    // Alternative: if injuries come as dialogData
    const dialogHandler = ({ detail: dialogTag }: CustomEvent<GameTag>) => {
      console.log("[INJURY DEBUG] 💬 Processing dialogData injury event:", dialogTag);
      this.processDialogData(dialogTag);
    };
    bus.subscribeEvent<GameTag>("metadata/dialogData/injuries", dialogHandler);
    this._eventHandlers.push({ event: "metadata/dialogData/injuries", handler: dialogHandler, bus });
  }

  private _cleanupEventListeners() {
    this._eventHandlers.forEach(({ event, handler, bus }) => {
      if (bus?._ele) {
        bus._ele.removeEventListener(event, handler as EventListener);
      }
    });
    this._eventHandlers = [];
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
    const rawInjuries: Array<RawInjury> = [];
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

    const rawInjuries: Array<RawInjury> = injuryChildren.map((child) => ({
      part: (child.attrs.part as string) || "",
      severity: parseInt((child.attrs.severity as string) || "0") as 0 | 1 | 2 | 3,
      description: (child.attrs.description as string) || "",
    }));

    this._injuries = this.processInjuries(rawInjuries);
  }

  private processInjuries(injuries: Array<RawInjury>): Array<ProcessedInjury> {
    const sorted = this.sortAnatomically(injuries);
    const processed: Array<ProcessedInjury> = [];
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

  private sortAnatomically(injuries: Array<RawInjury>): Array<RawInjury> {
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

  private findPair(injury: RawInjury, allInjuries: Array<RawInjury>): RawInjury | null {
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

  getInjuries() {
    const injuriesUI = this.shadowRoot?.querySelector("illthorn-injuries-ui") as InjuriesUI;
    return injuriesUI?.getInjuries() || [];
  }

  render() {
    return html`
      <illthorn-injuries-ui
        .injuries=${this._injuries}>
      </illthorn-injuries-ui>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-injuries-container": InjuriesContainer;
  }
}

export type { ProcessedInjury, RawInjury };
