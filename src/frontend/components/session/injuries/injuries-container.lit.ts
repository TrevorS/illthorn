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

  constructor() {
    super();
    console.log("[INJURY DEBUG] 🎭 InjuriesContainer created");
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has("session")) {
      console.log("[INJURY DEBUG] 🏗️ SESSION CHANGED - Setting up listeners, session:", !!this.session);
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
      console.log("[INJURY DEBUG] ❌ No session or bus available");
      return;
    }

    console.log("[INJURY DEBUG] ✅ Session and bus available, setting up listeners");
    const bus = this.session.bus;

    // Debug: Listen for ALL metadata events to see what's coming through
    const allEventsHandler = ({ detail: tag }: CustomEvent<GameTag>) => {
      // Log injury-related events
      if (
        tag.name?.toLowerCase().includes("injur") ||
        (typeof tag.attrs?.id === "string" && tag.attrs.id.toLowerCase().includes("injur")) ||
        tag.name === "dialogData" ||
        tag.name === "image" ||
        tag.name === "radio"
      ) {
        console.log("[INJURY DEBUG] 🎯 Injury-related event:", {
          eventType: tag.name,
          id: tag.attrs?.id,
          attrs: tag.attrs,
          children: tag.children?.length || 0,
        });
      }
      
      // Also log a sample of ALL events to see what's happening
      if (Math.random() < 0.05) { // Log ~5% of all events
        console.log("[INJURY DEBUG] 📊 Sample event:", {
          eventType: tag.name,
          id: tag.attrs?.id,
          hasChildren: tag.children && tag.children.length > 0,
        });
      }
    };
    bus.subscribeEvent<GameTag>("metadata/*", allEventsHandler);
    this._eventHandlers.push({ event: "metadata/*", handler: allEventsHandler, bus });

    // Subscribe to injury updates
    const injuryHandler = ({ detail: injuryTag }: CustomEvent<GameTag>) => {
      console.log("[INJURY DEBUG] 🔥 Processing direct injury event:", injuryTag);
      this.processInjuryData(injuryTag);
    };
    bus.subscribeEvent<GameTag>("metadata/injury", injuryHandler);
    this._eventHandlers.push({ event: "metadata/injury", handler: injuryHandler, bus });

    // Alternative: if injuries come as dialogData
    const dialogHandler = ({ detail: dialogTag }: CustomEvent<GameTag>) => {
      console.log("[INJURY DEBUG] 💬 Processing dialogData injury event:");
      console.log(JSON.stringify(dialogTag, null, 2));
      this.processDialogData(dialogTag);
    };
    
    console.log("[INJURY DEBUG] 🎯 SETTING UP EVENT LISTENERS");
    bus.subscribeEvent<GameTag>("metadata/dialogData/injuries", dialogHandler);
    this._eventHandlers.push({ event: "metadata/dialogData/injuries", handler: dialogHandler, bus });

    // Radio tags: the actual wound data comes through radio events
    const radioHandler = ({ detail: radioTag }: CustomEvent<GameTag>) => {
      console.log("[INJURY DEBUG] 📻 Processing radio tag event:");
      console.log(JSON.stringify(radioTag, null, 2));
      this.processRadioData(radioTag);
    };
    bus.subscribeEvent<GameTag>("metadata/radio", radioHandler);
    this._eventHandlers.push({ event: "metadata/radio", handler: radioHandler, bus });
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
    console.log("[INJURY DEBUG] 🔍 Processing dialogData with children:", dialogTag.children.length);
    
    // Look for image children that represent body parts with injury/scar data
    const imageChildren = dialogTag.children.filter((child) => child.name === "image");

    console.log("[INJURY DEBUG] 📸 Found image children:", imageChildren.length);

    if (imageChildren.length === 0) {
      // No image data - skip processing
      console.log("[INJURY DEBUG] ⏭️ No image children, skipping");
      return;
    }

    const rawInjuries: Array<RawInjury> = [];

    imageChildren.forEach((child) => {
      const partId = child.attrs.id as string;
      const imageName = child.attrs.name as string;

      console.log(`[INJURY DEBUG] 🔎 Examining image: id="${partId}" name="${imageName}"`);

      // Skip skin/health UI elements
      if (partId === "healthSkin" || !partId || !imageName) {
        console.log(`[INJURY DEBUG] ⏭️ Skipping: healthSkin or missing data`);
        return;
      }

      // Parse injury/scar information from image name
      const injury = this.parseInjuryFromImageName(partId, imageName);
      if (injury) {
        console.log(`[INJURY DEBUG] ➕ Adding injury:`, injury);
        rawInjuries.push(injury);
      }
    });

    // Only update injuries if we found some, otherwise preserve existing state
    if (rawInjuries.length > 0) {
      console.log(`[INJURY DEBUG] 🎯 Found ${rawInjuries.length} injuries/scars:`, rawInjuries);
      this._injuries = this.processInjuries(rawInjuries);
    } else {
      // If we only see healthy parts, clear injuries
      const hasHealthyPartsOnly = imageChildren.some((child) => child.attrs.name === child.attrs.id && child.attrs.id !== "healthSkin");
      if (hasHealthyPartsOnly && imageChildren.length > 5) {
        // Only clear if we see multiple healthy parts (full body scan)
        console.log("[INJURY DEBUG] 🟢 All parts healthy - clearing injuries");
        this._injuries = [];
      }
    }
  }

  private parseInjuryFromImageName(partId: string, imageName: string): RawInjury | null {
    // Map part IDs to our internal naming
    const partMap = new Map([
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

    const internalPart = partMap.get(partId) || partId.toLowerCase();

    // Parse injury severity from image name
    if (imageName.startsWith("Injury")) {
      const severityMatch = imageName.match(/Injury(\d+)/);
      const severity = severityMatch ? parseInt(severityMatch[1]) : 1;

      console.log(`[INJURY DEBUG] 🔴 INJURY DETECTED: ${partId} -> ${imageName} (severity ${severity})`);

      return {
        part: internalPart,
        severity: Math.min(severity, 3) as 0 | 1 | 2 | 3, // Cap at 3
        description: `${partId} injury (severity ${severity})`,
      };
    }

    if (imageName.startsWith("Scar")) {
      const severityMatch = imageName.match(/Scar(\d+)/);
      const severity = severityMatch ? parseInt(severityMatch[1]) : 1;

      console.log(`[INJURY DEBUG] 🟡 SCAR DETECTED: ${partId} -> ${imageName} (severity ${severity})`);

      return {
        part: internalPart,
        severity: Math.min(severity, 3) as 0 | 1 | 2 | 3, // Cap at 3
        description: `${partId} scar (severity ${severity})`,
      };
    }

    // Healthy part (imageName matches partId) - only log occasionally to avoid spam
    if (Math.random() < 0.1) {
      console.log(`[INJURY DEBUG] ✅ Healthy part: ${partId} -> ${imageName}`);
    }
    return null;
  }

  private processRadioData(radioTag: GameTag) {
    // Extract wound data from radio tag attributes
    const radioWound = this.processRadioWound(radioTag);

    if (!radioWound) {
      console.log("[INJURY DEBUG] 🚫 Radio tag does not contain valid wound data:", radioTag);
      return;
    }

    console.log("[INJURY DEBUG] ✅ Extracted wound from radio tag:", radioWound);

    // Convert to RawInjury and add to existing injuries
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

    // Add the new wound
    rawInjuries.push(radioWound);

    // Reprocess all injuries
    this._injuries = this.processInjuries(rawInjuries);
  }

  private processRadioWound(radioTag: GameTag): RawInjury | null {
    const attrs = radioTag.attrs;

    // Check if this radio tag represents a wound/injury
    if (!attrs?.part || !attrs?.severity) {
      return null;
    }

    // Extract wound information from radio tag attributes
    const part = attrs.part as string;
    const severity = parseInt(attrs.severity as string) as 0 | 1 | 2 | 3;

    // Check if severity is valid (1-3 for wounds, 0 for no wound)
    if (severity < 0 || severity > 3) {
      console.log("[INJURY DEBUG] ⚠️ Invalid severity level:", severity);
      return null;
    }

    // If severity is 0, this indicates no wound (healthy part)
    if (severity === 0) {
      return null;
    }

    // Map radio part names to our internal naming convention
    const mappedPart = this.mapRadioPartName(part);

    return {
      part: mappedPart,
      severity: severity,
      description: `${part} injury (severity ${severity})`,
    };
  }

  private mapRadioPartName(radioPart: string): string {
    // Map radio tag part names to our internal body part names
    // This may need adjustment based on actual radio tag part naming
    const partMap = new Map([
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
      ["nerves", "nerves"],
    ]);

    return partMap.get(radioPart) || radioPart.toLowerCase();
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
