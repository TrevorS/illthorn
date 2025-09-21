import keyboardjs from "keyboardjs";
import type { SessionButton } from "../components/session/session-button.lit";
import { IllthornEvent } from "../events";
import { Illthorn } from "../illthorn";
import { currentSession, focusSession } from "../session/helpers";
import { debugMacros } from "../util/logger";

type MacroProfile = Record<string, string>;

// TEMP: Stub function for transition period - will be replaced with config-based loading in Phase 3
export async function loadMacros(): Promise<MacroProfile> {
  debugMacros("loadMacros: returning empty object (legacy Settings removed)");
  return {};
}

// TEMP: Stub function for transition period - will be replaced with config-based binding in Phase 3
export async function bindUserMacros() {
  debugMacros("bindUserMacros: no-op (legacy Settings removed)");
  // No user macros loaded during transition
}

// TEMP: Stub function for transition period - will be replaced with config-based unbinding in Phase 3
export async function unbindUserMacros() {
  debugMacros("unbindUserMacros: no-op (legacy Settings removed)");
  // No user macros to unbind during transition
}

export async function bindMetaMacros() {
  keyboardjs.on("tab", (e) => {
    e?.preventDefault();
    // todo: tab completion
  });

  keyboardjs.on("right", (_) => {
    document.dispatchEvent(new Event("autocomplete/right"));
  });

  "1 2 3 4 5 6 7 8 9".split(" ").forEach((sess_idx) => {
    const idx = parseInt(sess_idx, 10) - 1;
    keyboardjs.on(`alt+${sess_idx}`, (e) => {
      e?.preventDefault();
      const buttons = document.querySelectorAll<SessionButton>("illthorn-session-button");
      const button = buttons[idx];
      if (button) focusSession(button.session);
    });
  });

  keyboardjs.on("ctrl+pagedown", (_) => {
    const sess = currentSession();
    sess?.ui.feed.scrollToNow();
  });

  // Add Ctrl+Shift+L for clear game log
  keyboardjs.on("ctrl+shift+l", (e) => {
    e?.preventDefault();
    Illthorn.bus.dispatchEvent(IllthornEvent.SUBMIT_ILLTHORN_COMMAND, ":clear");
  });

  // Add Ctrl+Shift+D for toggle dev window
  keyboardjs.on("ctrl+shift+d", (e) => {
    e?.preventDefault();
    Illthorn.bus.dispatchEvent(IllthornEvent.SUBMIT_ILLTHORN_COMMAND, ":dev");
  });
  // todo: handle scrolling from any focused state
  keyboardjs.on("pageup", (e) => {
    e?.preventDefault();
    const sess = currentSession();
    if (!sess) return;
    const ele = sess.ui.feed;
    if (!ele) return;
    ele.scrollBy(0, ele.clientHeight * -0.8);
    ele.dispatchEvent(new Event("mousewheel"));
  });

  keyboardjs.on("pagedown", (e) => {
    e?.preventDefault();
    const sess = currentSession();
    if (!sess) return;
    const ele = sess.ui.feed;
    if (!ele) return;
    ele.scrollBy(0, ele.clientHeight * 0.8);
    ele.dispatchEvent(new Event("mousewheel"));
  });
}

export async function bindMacros() {
  await bindUserMacros();
  await bindMetaMacros();
}
