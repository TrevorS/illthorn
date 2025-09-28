// ABOUTME: Re-export of room container component for backward compatibility
// ABOUTME: Now using the modern container/UI pattern with BaseContainerComponent
export { RoomContainer as Room } from "./room/room-container.lit";

import { customElement } from "lit/decorators.js";
// Import to register the container component with the legacy element name
import { RoomContainer } from "./room/room-container.lit";

// Register the container with the legacy element name for backward compatibility
@customElement("illthorn-room-lit")
export class RoomLegacy extends RoomContainer {}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-room-lit": RoomLegacy;
  }
}
