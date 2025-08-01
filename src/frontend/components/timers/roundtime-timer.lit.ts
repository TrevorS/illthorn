// ABOUTME: Roundtime countdown timer component with Shoelace progress bar integration
// ABOUTME: Subscribes to metadata/roundTime events and provides smooth countdown animation with proper cleanup

import { customElement } from "lit/decorators.js";
import { BaseTimerComponent } from "./base-timer.lit";

@customElement("illthorn-roundtime-timer-lit")
export class RoundtimeTimer extends BaseTimerComponent {
  get eventName(): string {
    return "metadata/roundTime";
  }

  get indicatorColor(): string {
    return "var(--color-danger, red)";
  }

  get ariaLabel(): string {
    return "Roundtime remaining";
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-roundtime-timer-lit": RoundtimeTimer;
  }
}
