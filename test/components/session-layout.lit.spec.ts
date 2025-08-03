import { afterEach, describe, expect, it } from "vitest";
import { CommandHistory } from "../../src/frontend/components/command-bar/command-history";
import type { CLI } from "../../src/frontend/components/session/cli.lit";
import type { CompassContainer } from "../../src/frontend/components/session/compass";
import type { Feed } from "../../src/frontend/components/session/feed/feed.lit";
import type { Panel } from "../../src/frontend/components/session/panel.lit";
import type { Prompt } from "../../src/frontend/components/session/prompt.lit";
import type { Room } from "../../src/frontend/components/session/room.lit";
import type { SessionButton } from "../../src/frontend/components/session/session-button.lit";
import type { VitalsContainer } from "../../src/frontend/components/session/vitals/vitals-container.lit";
import { SessionLayout } from "../../src/frontend/components/session-layout.lit";
import { SaxophoneParser } from "../../src/frontend/parser/saxophone-parser";
import type { FrontendSession } from "../../src/frontend/session";
import { Bus } from "../../src/frontend/util/bus";

// Mock FrontendSession for testing
const createMockSession = (): FrontendSession => {
  const bus = new Bus();
  const mockActionButton = document.createElement("illthorn-session-button") as SessionButton;
  return {
    name: "test-session",
    config: { name: "test-session", port: 4000 },
    parser: new SaxophoneParser(),
    bus,
    hasFocus: false,
    history: new CommandHistory(100),
    actionButton: mockActionButton,
    streams: () => {},
    send: () => {},
    onMessage: () => {},
    disconnect: () => Promise.resolve(),
    setUI: () => {},
  } as FrontendSession;
};

describe("SessionLayout", () => {
  let sessionUI: SessionLayout;
  let mockSession: FrontendSession;

  const setup = async () => {
    sessionUI = document.createElement("illthorn-session-layout-lit") as SessionLayout;
    mockSession = createMockSession();
    sessionUI.session = mockSession;
    document.body.appendChild(sessionUI);
    await sessionUI.updateComplete;
    return sessionUI;
  };

  const teardown = () => {
    if (sessionUI?.parentNode) {
      sessionUI.parentNode.removeChild(sessionUI);
    }
  };

  afterEach(() => {
    teardown();
  });

  describe("Basic component rendering", () => {
    it("should create session-ui element", async () => {
      await setup();

      expect(sessionUI).toBeInstanceOf(SessionLayout);
      expect(sessionUI.tagName.toLowerCase()).toBe("illthorn-session-layout-lit");
    });

    it("should render with proper host styling", async () => {
      await setup();

      const styles = SessionLayout.styles;
      expect(styles).toBeTruthy();
    });

    it("should render empty state when no session provided", async () => {
      sessionUI = document.createElement("illthorn-session-layout-lit") as SessionLayout;
      document.body.appendChild(sessionUI);
      await sessionUI.updateComplete;

      // Component now uses Shadow DOM, check shadowRoot content
      expect(sessionUI.shadowRoot?.textContent).toContain("No session provided");
    });
  });

  describe("Session property handling", () => {
    it("should accept session property", async () => {
      await setup();

      expect(sessionUI.session).toBe(mockSession);
      expect(sessionUI.session.name).toBe("test-session");
    });

    it("should be reactive to session changes", async () => {
      await setup();

      const newMockSession = createMockSession();
      newMockSession.name = "updated-session";
      newMockSession.config.name = "updated-session";

      sessionUI.session = newMockSession;
      await sessionUI.updateComplete;

      expect(sessionUI.session.name).toBe("updated-session");
    });
  });

  describe("Context component integration", () => {
    it("should use host element as context with session", async () => {
      await setup();

      // The host element itself is now the context
      const sessionUIObj = sessionUI.getSessionUI();
      expect(sessionUIObj.context).toBe(sessionUI);
      expect(sessionUI.session).toBe(mockSession);
    });

    it("should set proper context classes and id on host element", async () => {
      await setup();

      // The host element should have the session class and id
      expect(sessionUI.classList.contains("session")).toBe(true);
      expect(sessionUI.id).toBe("test-session");
    });
  });

  describe("HUD components rendering", () => {
    it("should render hud container", async () => {
      await setup();

      const hud = sessionUI.shadowRoot?.querySelector(".hud");
      expect(hud).toBeTruthy();
    });

    it("should render room panel with room and compass components", async () => {
      await setup();

      const roomPanel = sessionUI.shadowRoot?.querySelector('illthorn-panel[title="room"]');
      expect(roomPanel).toBeTruthy();

      const room = roomPanel?.querySelector("illthorn-room-lit") as Room;
      expect(room).toBeTruthy();
      expect(room.session).toBe(mockSession);

      const compass = roomPanel?.querySelector("illthorn-compass-container") as CompassContainer;
      expect(compass).toBeTruthy();
      expect(compass.session).toBe(mockSession);
    });

    it("should render vitals panel with vitals component", async () => {
      await setup();

      const vitalsPanel = sessionUI.shadowRoot?.querySelector('illthorn-panel[title="vitals"]');
      expect(vitalsPanel).toBeTruthy();

      const vitals = vitalsPanel?.querySelector("illthorn-vitals-container") as VitalsContainer;
      expect(vitals).toBeTruthy();
      expect(vitals.session).toBe(mockSession);
    });

    it("should render active spells panel with effects component", async () => {
      await setup();

      const spellsPanel = sessionUI.shadowRoot?.querySelector('illthorn-panel[title="active spells"]');
      expect(spellsPanel).toBeTruthy();

      const effects = spellsPanel?.querySelector("illthorn-effects-container");
      expect(effects).toBeTruthy();
      expect(effects.session).toBe(mockSession);
      expect(effects.name).toBe("Active Spells");
    });

    it("should render all panels as open by default", async () => {
      await setup();

      const panels = sessionUI.shadowRoot?.querySelectorAll("illthorn-panel");
      expect(panels?.length).toBe(4); // room, vitals, injuries, active spells

      panels?.forEach((panel) => {
        expect((panel as Panel).open).toBe(true);
      });
    });
  });

  describe("Main area components rendering", () => {
    it("should render main container with proper structure", async () => {
      await setup();

      const main = sessionUI.shadowRoot?.querySelector(".main");
      expect(main).toBeTruthy();

      const hands = main?.querySelector("illthorn-hands-container");
      const streams = main?.querySelector("illthorn-streams-lit");
      const feed = main?.querySelector("illthorn-feed-lit");
      const cliWrapper = main?.querySelector(".cli-wrapper");

      expect(hands).toBeTruthy();
      expect(streams).toBeTruthy();
      expect(feed).toBeTruthy();
      expect(cliWrapper).toBeTruthy();
    });

    it("should render hands container", async () => {
      await setup();

      const handsContainer = sessionUI.shadowRoot?.querySelector("illthorn-hands-container");
      expect(handsContainer).toBeTruthy();
    });

    it("should render streams component", async () => {
      await setup();

      const streams = sessionUI.shadowRoot?.querySelector("illthorn-streams-lit");
      expect(streams).toBeTruthy();
    });

    it("should render feed component with session", async () => {
      await setup();

      const feed = sessionUI.shadowRoot?.querySelector("illthorn-feed-lit") as Feed;
      expect(feed).toBeTruthy();
      expect(feed.session).toBe(mockSession);
    });

    it("should render cli wrapper with prompt and cli components", async () => {
      await setup();

      const cliWrapper = sessionUI.shadowRoot?.querySelector(".cli-wrapper");
      expect(cliWrapper).toBeTruthy();

      const prompt = cliWrapper?.querySelector("illthorn-prompt") as Prompt;
      expect(prompt).toBeTruthy();
      expect(prompt.session).toBe(mockSession);

      const cli = cliWrapper?.querySelector("illthorn-cli-lit") as CLI;
      expect(cli).toBeTruthy();
      expect(cli.session).toBe(mockSession);
    });
  });

  describe("Hand components creation", () => {
    it("should create hand components via hands container", async () => {
      await setup();

      const handsContainer = sessionUI.shadowRoot?.querySelector("illthorn-hands-container");
      expect(handsContainer).toBeTruthy();

      // Wait for component initialization to complete
      await sessionUI.waitForInitialization();

      // Check that hands are accessible via the SessionUI interface
      const sessionUIObj = sessionUI.getSessionUI();
      const hands = sessionUIObj.hands;
      expect(hands.left).toBeTruthy();
      expect(hands.right).toBeTruthy();
      expect(hands.spell).toBeTruthy();
    });

    it("should create left, right, and spell hands with proper names", async () => {
      await setup();

      // Wait for component initialization to complete
      await sessionUI.waitForInitialization();

      const sessionUIObj = sessionUI.getSessionUI();
      expect(sessionUIObj.hands.left?.handType).toBe("left");
      expect(sessionUIObj.hands.right?.handType).toBe("right");
      expect(sessionUIObj.hands.spell?.handType).toBe("spell");
    });

    it("should have hand components with proper content property", async () => {
      await setup();

      // Wait for component initialization to complete
      await sessionUI.waitForInitialization();

      const sessionUIObj = sessionUI.getSessionUI();
      expect(sessionUIObj.hands.left?.content).toBe("None");
      expect(sessionUIObj.hands.right?.content).toBe("None");
      expect(sessionUIObj.hands.spell?.content).toBe("None");
    });
  });

  describe("getSessionUI method", () => {
    it("should return SessionUI interface compatible object", async () => {
      await setup();

      // Wait for component initialization to complete
      await sessionUI.waitForInitialization();

      const sessionUIObj = sessionUI.getSessionUI();

      expect(sessionUIObj.context).toBeTruthy();
      expect(sessionUIObj.cli).toBeTruthy();
      expect(sessionUIObj.feed).toBeTruthy();
      expect(sessionUIObj.prompt).toBeTruthy();
      expect(sessionUIObj.vitals).toBeTruthy();
      expect(sessionUIObj.streams).toBeTruthy();
      expect(sessionUIObj.hands).toBeTruthy();
      expect(sessionUIObj.hands.left).toBeTruthy();
      expect(sessionUIObj.hands.right).toBeTruthy();
      expect(sessionUIObj.hands.spell).toBeTruthy();
    });

    it("should return partially initialized UI if called before components are fully ready", async () => {
      sessionUI = document.createElement("illthorn-session-layout-lit") as SessionLayout;
      document.body.appendChild(sessionUI);
      await sessionUI.updateComplete;

      const ui = sessionUI.getSessionUI();
      expect(ui).toBeTruthy();
      // Some components may be null initially, but the interface should exist
      expect(ui.hands).toBeTruthy();
    });

    it("should return components with proper types", async () => {
      await setup();

      // Wait for component initialization to complete
      await sessionUI.waitForInitialization();

      const sessionUIObj = sessionUI.getSessionUI();

      expect(sessionUIObj.context.tagName.toLowerCase()).toBe("illthorn-session-layout-lit");
      expect(sessionUIObj.cli?.tagName.toLowerCase()).toBe("illthorn-cli-lit");
      expect(sessionUIObj.feed?.tagName.toLowerCase()).toBe("illthorn-feed-lit");
      expect(sessionUIObj.prompt?.tagName.toLowerCase()).toBe("illthorn-prompt");
      expect(sessionUIObj.vitals?.tagName.toLowerCase()).toBe("illthorn-vitals-container");
      expect(sessionUIObj.streams?.tagName.toLowerCase()).toBe("illthorn-streams-lit");
      expect(sessionUIObj.hands.left?.tagName.toLowerCase()).toBe("illthorn-hand-ui");
      expect(sessionUIObj.hands.right?.tagName.toLowerCase()).toBe("illthorn-hand-ui");
      expect(sessionUIObj.hands.spell?.tagName.toLowerCase()).toBe("illthorn-hand-ui");
    });
  });

  describe("CSS Layout structure", () => {
    it("should apply proper host styling", async () => {
      await setup();

      // Check that the component has the expected static styles
      const styles = SessionLayout.styles;
      expect(styles).toBeTruthy();

      // The component now uses Shadow DOM, so renderRoot should be shadowRoot
      expect(sessionUI.renderRoot).toBe(sessionUI.shadowRoot); // Shadow DOM uses shadowRoot as renderRoot
    });

    it("should have hud positioned as fixed sidebar", async () => {
      await setup();

      const hud = sessionUI.shadowRoot?.querySelector(".hud");
      expect(hud).toBeTruthy();
      expect(hud?.classList.contains("hud")).toBe(true);
    });

    it("should have main area with proper structure", async () => {
      await setup();

      const main = sessionUI.shadowRoot?.querySelector(".main");
      expect(main).toBeTruthy();
      expect(main?.classList.contains("main")).toBe(true);
    });

    it("should have hands container component", async () => {
      await setup();

      const hands = sessionUI.shadowRoot?.querySelector("illthorn-hands-container");
      expect(hands).toBeTruthy();
      expect(hands?.tagName.toLowerCase()).toBe("illthorn-hands-container");
    });
  });

  describe("API compatibility with original factory", () => {
    it("should maintain same component hierarchy as makeSessionUI", async () => {
      await setup();

      // Host element now serves as context with session class and id
      expect(sessionUI.classList.contains("session")).toBe(true);
      expect(sessionUI.id).toBe("test-session");

      // HUD structure
      const hud = sessionUI.shadowRoot?.querySelector(".hud");
      expect(hud).toBeTruthy();

      // Main structure
      const main = sessionUI.shadowRoot?.querySelector(".main");
      expect(main).toBeTruthy();

      // All required components present
      expect(sessionUI.shadowRoot?.querySelector("illthorn-compass-container")).toBeTruthy();
      expect(sessionUI.shadowRoot?.querySelector("illthorn-room-lit")).toBeTruthy();
      expect(sessionUI.shadowRoot?.querySelector("illthorn-vitals-container")).toBeTruthy();
      expect(sessionUI.shadowRoot?.querySelector("illthorn-effects-container")).toBeTruthy();
      expect(sessionUI.shadowRoot?.querySelector("illthorn-streams-lit")).toBeTruthy();
      expect(sessionUI.shadowRoot?.querySelector("illthorn-feed-lit")).toBeTruthy();
      expect(sessionUI.shadowRoot?.querySelector("illthorn-prompt")).toBeTruthy();
      expect(sessionUI.shadowRoot?.querySelector("illthorn-cli-lit")).toBeTruthy();
    });

    it("should provide same component references as original factory", async () => {
      await setup();

      await new Promise((resolve) => setTimeout(resolve, 0));

      const sessionUIObj = sessionUI.getSessionUI();

      // Should have all the same properties as original SessionUI type
      expect(sessionUIObj).toHaveProperty("context");
      expect(sessionUIObj).toHaveProperty("cli");
      expect(sessionUIObj).toHaveProperty("feed");
      expect(sessionUIObj).toHaveProperty("prompt");
      expect(sessionUIObj).toHaveProperty("vitals");
      expect(sessionUIObj).toHaveProperty("streams");
      expect(sessionUIObj).toHaveProperty("hands");
      expect(sessionUIObj.hands).toHaveProperty("left");
      expect(sessionUIObj.hands).toHaveProperty("right");
      expect(sessionUIObj.hands).toHaveProperty("spell");
    });
  });

  describe("TypeScript integration", () => {
    it("should have proper TypeScript types", async () => {
      await setup();

      // These should compile without TypeScript errors
      expect(sessionUI.session.name).toBeTypeOf("string");
      expect(sessionUI.session.config).toBeTypeOf("object");
    });

    it("should be properly registered in HTMLElementTagNameMap", () => {
      const element = document.createElement("illthorn-session-layout-lit");
      expect(element).toBeInstanceOf(HTMLElement);
      expect(element).toBeInstanceOf(SessionLayout);
    });
  });

  describe("Error handling", () => {
    it("should handle missing session gracefully", async () => {
      sessionUI = document.createElement("illthorn-session-layout-lit") as SessionLayout;
      document.body.appendChild(sessionUI);
      await sessionUI.updateComplete;

      expect(sessionUI.shadowRoot?.textContent).toContain("No session provided");
    });

    it("should handle component initialization failures gracefully", async () => {
      sessionUI = document.createElement("illthorn-session-layout-lit") as SessionLayout;
      document.body.appendChild(sessionUI);
      await sessionUI.updateComplete;

      // Without session, getSessionUI should still return an object (but may have null values)
      const ui = sessionUI.getSessionUI();
      expect(ui).toBeTruthy();
      expect(ui.hands).toBeTruthy();
    });
  });
});
