import "./styles/index.scss";
import "./illthorn";
import "./components/app.lit";

// Shoelace Web Components integration
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path.js";
import { reloadHilites } from "./hilites";
import { bindMacros } from "./macros";
import { renderAllSessions } from "./session/connect-all";
import "@shoelace-style/shoelace/dist/themes/dark.css";
import "@shoelace-style/shoelace/dist/components/progress-bar/progress-bar.js";
import "@shoelace-style/shoelace/dist/components/input/input.js";

(async function __illthorn_main() {
  // Configure Shoelace base path for assets
  setBasePath("/node_modules/@shoelace-style/shoelace/dist/");

  // Replace imperative layout with Lit app component
  const app = document.querySelector("#app") as HTMLDivElement;
  const appRoot = document.createElement("illthorn-app-lit");
  app.appendChild(appRoot);

  await bindMacros();
  await reloadHilites();
  await renderAllSessions();
})();
