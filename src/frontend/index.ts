import "./styles/index.scss";
import "./illthorn";
import "./components/app.lit";
import "./components/timers/roundtime-timer.lit";
import "./components/timers/casttime-timer.lit";
import "./components/session/feed/command-echo.lit";

// Shoelace Web Components integration
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path.js";
import { ItemHighlighter } from "./components/game-elements/item-highlighting";
import { autoReloader } from "./config/auto-reload";
import { highlightManager } from "./highlights";
import { bindMacros } from "./macros";
import { renderAllSessions } from "./session/connect-all";
import "@shoelace-style/shoelace/dist/themes/dark.css";
import "@shoelace-style/shoelace/dist/components/progress-bar/progress-bar.js";
import "@shoelace-style/shoelace/dist/components/input/input.js";
import "@shoelace-style/shoelace/dist/components/badge/badge.js";
import "@shoelace-style/shoelace/dist/components/tooltip/tooltip.js";

(async function __illthorn_main() {
  // Configure Shoelace base path for assets
  setBasePath("/node_modules/@shoelace-style/shoelace/dist/");

  // Preload highlighting data for immediate categorization
  await ItemHighlighter.preload();

  // Replace imperative layout with Lit app component
  const app = document.querySelector("#app") as HTMLDivElement;
  const appRoot = document.createElement("illthorn-app-lit");
  app.appendChild(appRoot);

  // Initialize new config-based managers
  try {
    await highlightManager.initialize();
    console.debug("HighlightManager initialized successfully");
  } catch (error) {
    console.warn("Failed to initialize HighlightManager:", error);
  }

  await bindMacros(); // This now initializes MacroManager internally

  // Start auto-reloader for config file watching
  try {
    await autoReloader.start();
    console.debug("Config auto-reloader started successfully");
  } catch (error) {
    console.warn("Failed to start config auto-reloader:", error);
  }

  await renderAllSessions();
})();
