import { describe, expect, test } from "vitest";
import type { RoomUI } from "../src/frontend/components/session/room/room-ui.lit";
import { Room } from "../src/frontend/components/session/room.lit";
import { makeTag } from "../src/frontend/parser/tag";
import { createMockSession } from "./mocks";

describe("Room", () => {
  const setup = () => {
    const element = new Room();
    const mockSession = createMockSession();
    document.body.appendChild(element);
    return { element, mockSession };
  };

  const teardown = (element: Room) => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  };

  test("should create element", () => {
    const { element } = setup();

    expect(element).toBeInstanceOf(HTMLElement);
    expect(element.tagName.toLowerCase()).toBe("illthorn-room-container");

    teardown(element);
  });

  test("should render empty room ID and title initially", async () => {
    const { element } = setup();

    // First wait for the element to be ready
    await element.updateComplete;

    // Room is now a container that renders a room-ui component
    const roomUI = element.shadowRoot?.querySelector("illthorn-room-ui");
    expect(roomUI).toBeTruthy();

    // Wait for the UI component to be ready
    await (roomUI as RoomUI)?.updateComplete;

    const roomIdSpan = roomUI?.shadowRoot?.querySelector(".room-id");
    const roomTitleSpan = roomUI?.shadowRoot?.querySelector(".room-title");

    expect(roomIdSpan).toBeTruthy();
    expect(roomTitleSpan).toBeTruthy();
    expect(roomIdSpan?.textContent || "").toBe("");
    expect(roomTitleSpan?.textContent || "").toBe("");

    teardown(element);
  });

  test("should update room ID on nav metadata event", async () => {
    const { element, mockSession } = setup();
    const testRoomId = "12345";

    element.session = mockSession;
    await element.updateComplete;

    // Create proper GameTag object for nav event
    const navTag = makeTag("nav");
    navTag.attrs = { rm: testRoomId };

    mockSession.bus.dispatchEvent("metadata/nav", navTag);
    await element.updateComplete;

    // Query through the UI component
    const roomUI = element.shadowRoot?.querySelector("illthorn-room-ui");
    await (roomUI as RoomUI)?.updateComplete;
    const roomIdSpan = roomUI?.shadowRoot?.querySelector(".room-id");
    expect(roomIdSpan?.textContent || "").toBe(testRoomId);

    teardown(element);
  });

  test("should update room title on streamWindow/room metadata event", async () => {
    const { element, mockSession } = setup();
    const testTitle = "The Great Hall";

    element.session = mockSession;
    await element.updateComplete;

    // Create proper GameTag object for streamWindow event
    const streamWindowTag = makeTag("streamWindow");
    streamWindowTag.attrs = { subtitle: testTitle };

    mockSession.bus.dispatchEvent("metadata/streamWindow/room", streamWindowTag);
    await element.updateComplete;

    // Query through the UI component
    const roomUI = element.shadowRoot?.querySelector("illthorn-room-ui");
    await (roomUI as RoomUI)?.updateComplete;
    const roomTitleSpan = roomUI?.shadowRoot?.querySelector(".room-title");
    expect(roomTitleSpan?.textContent || "").toBe(testTitle);

    teardown(element);
  });

  test("should strip leading '- ' from room title", async () => {
    const { element, mockSession } = setup();
    const rawTitle = "- The Great Hall";
    const expectedTitle = "The Great Hall";

    element.session = mockSession;
    await element.updateComplete;

    // Create proper GameTag object for streamWindow event
    const streamWindowTag = makeTag("streamWindow");
    streamWindowTag.attrs = { subtitle: rawTitle };

    mockSession.bus.dispatchEvent("metadata/streamWindow/room", streamWindowTag);
    await element.updateComplete;

    // Query through the UI component
    const roomUI = element.shadowRoot?.querySelector("illthorn-room-ui");
    await (roomUI as RoomUI)?.updateComplete;
    const roomTitleSpan = roomUI?.shadowRoot?.querySelector(".room-title");
    expect(roomTitleSpan?.textContent || "").toBe(expectedTitle);

    teardown(element);
  });

  test("should handle empty subtitle gracefully", async () => {
    const { element, mockSession } = setup();

    element.session = mockSession;
    await element.updateComplete;

    // Create proper GameTag object for streamWindow event
    const streamWindowTag = makeTag("streamWindow");
    streamWindowTag.attrs = { subtitle: "" };

    mockSession.bus.dispatchEvent("metadata/streamWindow/room", streamWindowTag);
    await element.updateComplete;

    // Query through the UI component
    const roomUI = element.shadowRoot?.querySelector("illthorn-room-ui");
    await (roomUI as RoomUI)?.updateComplete;
    const roomTitleSpan = roomUI?.shadowRoot?.querySelector(".room-title");
    expect(roomTitleSpan?.textContent || "").toBe("");

    teardown(element);
  });

  test("should handle missing subtitle attribute", async () => {
    const { element, mockSession } = setup();

    element.session = mockSession;
    await element.updateComplete;

    // Create proper GameTag object for streamWindow event
    const streamWindowTag = makeTag("streamWindow");
    streamWindowTag.attrs = {};

    mockSession.bus.dispatchEvent("metadata/streamWindow/room", streamWindowTag);
    await element.updateComplete;

    // Query through the UI component
    const roomUI = element.shadowRoot?.querySelector("illthorn-room-ui");
    await (roomUI as RoomUI)?.updateComplete;
    const roomTitleSpan = roomUI?.shadowRoot?.querySelector(".room-title");
    expect(roomTitleSpan?.textContent || "").toBe("");

    teardown(element);
  });

  test("should have correct CSS classes and structure", async () => {
    const { element, mockSession } = setup();

    element.session = mockSession;
    await element.updateComplete;

    // Query through the UI component
    const roomUI = element.shadowRoot?.querySelector("illthorn-room-ui");
    await (roomUI as RoomUI)?.updateComplete;
    const roomIdSpan = roomUI?.shadowRoot?.querySelector(".room-id");
    const roomTitleSpan = roomUI?.shadowRoot?.querySelector(".room-title");

    expect(roomIdSpan).toBeTruthy();
    expect(roomTitleSpan).toBeTruthy();
    expect(roomIdSpan?.tagName.toLowerCase()).toBe("span");
    expect(roomTitleSpan?.tagName.toLowerCase()).toBe("span");

    teardown(element);
  });

  test("should not setup event listeners without session", async () => {
    const { element } = setup();

    await element.updateComplete;

    // Query through the UI component
    const roomUI = element.shadowRoot?.querySelector("illthorn-room-ui");
    await (roomUI as RoomUI)?.updateComplete;
    const roomIdSpan = roomUI?.shadowRoot?.querySelector(".room-id");
    const roomTitleSpan = roomUI?.shadowRoot?.querySelector(".room-title");

    expect(roomIdSpan?.textContent || "").toBe("");
    expect(roomTitleSpan?.textContent || "").toBe("");

    teardown(element);
  });

  test("should handle session property changes", async () => {
    const { element } = setup();

    await element.updateComplete;

    const newMockSession = createMockSession();
    element.session = newMockSession;
    await element.updateComplete;

    const testRoomId = "67890";
    // Create proper GameTag object for nav event
    const navTag = makeTag("nav");
    navTag.attrs = { rm: testRoomId };

    newMockSession.bus.dispatchEvent("metadata/nav", navTag);
    await element.updateComplete;

    // Query through the UI component
    const roomUI = element.shadowRoot?.querySelector("illthorn-room-ui");
    await (roomUI as RoomUI)?.updateComplete;
    const roomIdSpan = roomUI?.shadowRoot?.querySelector(".room-id");
    expect(roomIdSpan?.textContent || "").toBe(testRoomId);

    teardown(element);
  });
});
