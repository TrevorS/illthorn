import { describe, expect, test } from "vitest";
import { CommandEcho } from "../../../src/frontend/components/command-bar/command-echo.lit";

describe("CommandEcho", () => {
  describe("Basic rendering", () => {
    test("should create command echo element", () => {
      const echo = new CommandEcho();
      expect(echo).toBeDefined();
      expect(echo.tagName.toLowerCase()).toBe("illthorn-command-echo-lit");
    });

    test("should render empty when no command provided", () => {
      const echo = new CommandEcho();
      document.body.appendChild(echo);

      const echoDiv = echo.shadowRoot?.querySelector(".command-echo");
      expect(echoDiv).toBeNull();

      document.body.removeChild(echo);
    });

    test("should have proper CSS styling defined", () => {
      expect(CommandEcho.styles).toBeDefined();
      expect(CommandEcho.styles.toString()).toContain(":host");
      expect(CommandEcho.styles.toString()).toContain("MonoLisa");
    });
  });

  describe("Command property", () => {
    test("should accept command property", () => {
      const echo = new CommandEcho();
      echo.command = "look";
      expect(echo.command).toBe("look");
    });

    test("should render command text when command is provided", async () => {
      const echo = new CommandEcho();
      echo.command = "look around";
      document.body.appendChild(echo);

      await echo.updateComplete;

      const commandText = echo.shadowRoot?.querySelector(".command-text");
      expect(commandText?.textContent).toBe("look around");

      document.body.removeChild(echo);
    });

    test("should render prefix for regular commands", async () => {
      const echo = new CommandEcho();
      echo.command = "inventory";
      echo.isReplay = false;
      document.body.appendChild(echo);

      await echo.updateComplete;

      const prefix = echo.shadowRoot?.querySelector(".prefix");
      expect(prefix?.textContent).toBe(">");

      document.body.removeChild(echo);
    });
  });

  describe("Replay property", () => {
    test("should accept isReplay property", () => {
      const echo = new CommandEcho();
      echo.isReplay = true;
      expect(echo.isReplay).toBe(true);
    });

    test("should render replay prefix for replay commands", async () => {
      const echo = new CommandEcho();
      echo.command = "cast 501";
      echo.isReplay = true;
      document.body.appendChild(echo);

      await echo.updateComplete;

      const prefix = echo.shadowRoot?.querySelector(".prefix");
      expect(prefix?.textContent).toBe("[Replay]");

      document.body.removeChild(echo);
    });

    test("should apply replay CSS class for replay commands", async () => {
      const echo = new CommandEcho();
      echo.command = "cast 501";
      echo.isReplay = true;
      document.body.appendChild(echo);

      await echo.updateComplete;

      const echoDiv = echo.shadowRoot?.querySelector(".command-echo");
      expect(echoDiv?.classList.contains("replay")).toBe(true);

      document.body.removeChild(echo);
    });

    test("should not apply replay CSS class for regular commands", async () => {
      const echo = new CommandEcho();
      echo.command = "look";
      echo.isReplay = false;
      document.body.appendChild(echo);

      await echo.updateComplete;

      const echoDiv = echo.shadowRoot?.querySelector(".command-echo");
      expect(echoDiv?.classList.contains("replay")).toBe(false);

      document.body.removeChild(echo);
    });
  });

  describe("DOM structure", () => {
    test("should render proper DOM structure", async () => {
      const echo = new CommandEcho();
      echo.command = "get sword";
      document.body.appendChild(echo);

      await echo.updateComplete;

      const echoDiv = echo.shadowRoot?.querySelector(".command-echo");
      const prefix = echo.shadowRoot?.querySelector(".prefix");
      const commandText = echo.shadowRoot?.querySelector(".command-text");

      expect(echoDiv).toBeDefined();
      expect(prefix).toBeDefined();
      expect(commandText).toBeDefined();

      document.body.removeChild(echo);
    });

    test("should maintain proper element hierarchy", async () => {
      const echo = new CommandEcho();
      echo.command = "health";
      document.body.appendChild(echo);

      await echo.updateComplete;

      const echoDiv = echo.shadowRoot?.querySelector(".command-echo");
      const prefix = echoDiv?.querySelector(".prefix");
      const commandText = echoDiv?.querySelector(".command-text");

      expect(prefix?.parentElement).toBe(echoDiv);
      expect(commandText?.parentElement).toBe(echoDiv);

      document.body.removeChild(echo);
    });
  });

  describe("CSS Custom Properties and Theming", () => {
    test("should use CSS custom properties for theming", () => {
      const styles = CommandEcho.styles.toString();

      expect(styles).toContain("--color-command-echo");
      expect(styles).toContain("--color-command-echo-border");
      expect(styles).toContain("--color-command-echo-bg");
      expect(styles).toContain("--color-command-replay");
      expect(styles).toContain("--color-command-replay-border");
      expect(styles).toContain("--color-command-replay-bg");
    });

    test("should define MonoLisa font family in styles", () => {
      const styles = CommandEcho.styles.toString();

      expect(styles).toContain("MonoLisa");
      expect(styles).toContain("monospace");
    });

    test("should have proper visual styling structure", () => {
      const styles = CommandEcho.styles.toString();

      expect(styles).toContain("border-left");
      expect(styles).toContain("background-color");
      expect(styles).toContain("padding");
    });
  });

  describe("Property updates", () => {
    test("should update display when command property changes", async () => {
      const echo = new CommandEcho();
      document.body.appendChild(echo);

      echo.command = "first command";
      await echo.updateComplete;
      const commandText1 = echo.shadowRoot?.querySelector(".command-text");
      expect(commandText1?.textContent).toBe("first command");

      echo.command = "second command";
      await echo.updateComplete;
      const commandText2 = echo.shadowRoot?.querySelector(".command-text");
      expect(commandText2?.textContent).toBe("second command");

      document.body.removeChild(echo);
    });

    test("should update styling when isReplay property changes", async () => {
      const echo = new CommandEcho();
      echo.command = "test command";
      document.body.appendChild(echo);

      echo.isReplay = false;
      await echo.updateComplete;
      let echoDiv = echo.shadowRoot?.querySelector(".command-echo");
      let prefix = echo.shadowRoot?.querySelector(".prefix");
      expect(echoDiv?.classList.contains("replay")).toBe(false);
      expect(prefix?.textContent).toBe(">");

      echo.isReplay = true;
      await echo.updateComplete;
      echoDiv = echo.shadowRoot?.querySelector(".command-echo");
      prefix = echo.shadowRoot?.querySelector(".prefix");
      expect(echoDiv?.classList.contains("replay")).toBe(true);
      expect(prefix?.textContent).toBe("[Replay]");

      document.body.removeChild(echo);
    });
  });

  describe("Component lifecycle", () => {
    test("should handle property changes reactively", async () => {
      const echo = new CommandEcho();
      document.body.appendChild(echo);

      // Initially empty
      await echo.updateComplete;
      expect(echo.shadowRoot?.querySelector(".command-echo")).toBeNull();

      // Add command
      echo.command = "look";
      await echo.updateComplete;
      expect(echo.shadowRoot?.querySelector(".command-text")?.textContent).toBe("look");

      // Clear command
      echo.command = "";
      await echo.updateComplete;
      expect(echo.shadowRoot?.querySelector(".command-echo")).toBeNull();

      document.body.removeChild(echo);
    });

    test("should cleanup properly on disconnect", () => {
      const echo = new CommandEcho();
      echo.command = "test";
      document.body.appendChild(echo);

      expect(echo.isConnected).toBe(true);
      document.body.removeChild(echo);
      expect(echo.isConnected).toBe(false);
    });
  });

  describe("TypeScript integration", () => {
    test("should have proper TypeScript types", () => {
      const echo = new CommandEcho();

      // Test property types
      echo.command = "string command";
      echo.isReplay = true;

      expect(typeof echo.command).toBe("string");
      expect(typeof echo.isReplay).toBe("boolean");
    });

    test("should be properly registered in HTMLElementTagNameMap", () => {
      const echo = document.createElement("illthorn-command-echo-lit") as CommandEcho;
      expect(echo instanceof CommandEcho).toBe(true);
    });
  });
});
