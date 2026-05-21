import { describe, expect, test } from "vitest";
import { CommandHistory } from "../../../src/frontend/components/command-bar/command-history";

describe("CommandHistory", () => {
  test("back() returns commands in reverse order with linear indexing", () => {
    const history = new CommandHistory();
    const commands = ["climb tower", "exp", "info"];
    commands.forEach((cmd) => {
      history.add(cmd);
    });

    // History is [info, exp, climb tower] (newest first)
    // Current index starts at 0 (most recent = "info")
    expect(history.back()).toBe("exp"); // Move to index -1
    expect(history.back()).toBe("climb tower"); // Move to index -2
    expect(history.back()).toBe("climb tower"); // At boundary, stays at oldest
  });

  test("forward() moves towards newer commands", () => {
    const history = new CommandHistory();
    const commands = ["climb tower", "exp", "info"];
    commands.forEach((cmd) => {
      history.add(cmd);
    });

    // Go back a few steps
    history.back(); // "exp"
    history.back(); // "climb tower"

    // Now go forward
    expect(history.forward()).toBe("exp"); // Move towards newer
    expect(history.forward()).toBe("info"); // Back to most recent
    expect(history.forward()).toBe("info"); // At boundary, stays at newest
  });

  test("canNavigateBack() and canNavigateForward() return correct boundaries", () => {
    const history = new CommandHistory();
    const commands = ["climb tower", "exp", "info"];
    commands.forEach((cmd) => {
      history.add(cmd);
    });

    // At position 0 (newest)
    expect(history.canNavigateForward()).toBe(false);
    expect(history.canNavigateBack()).toBe(true);

    // Move to oldest
    history.back(); // -1
    history.back(); // -2
    expect(history.canNavigateBack()).toBe(false);
    expect(history.canNavigateForward()).toBe(true);
  });
});
