// ABOUTME: Casttime countdown timer component with Shoelace progress bar integration
// ABOUTME: Subscribes to metadata/castTime events and provides smooth countdown animation with proper cleanup

import { customElement } from "lit/decorators.js";
import { BaseTimerComponent } from "./base-timer.lit";

@customElement("illthorn-casttime-timer-lit")
export class CasttimeTimer extends BaseTimerComponent {
  get eventName(): string {
    return "metadata/castTime";
  }

  get indicatorColor(): string {
    return "var(--color-warning, orange)";
  }

  get ariaLabel(): string {
    return "Casttime remaining";
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-casttime-timer-lit": CasttimeTimer;
  }
}
