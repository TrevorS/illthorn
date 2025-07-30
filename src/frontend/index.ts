import "./styles/index.scss";
import "./illthorn";
import "./components/app.lit";
import { reloadHilites } from "./hilites";
import { bindMacros } from "./macros";
import { renderAllSessions } from "./session/connect-all";

(async function __illthorn_main() {
  // Replace imperative layout with Lit app component
  const app = document.querySelector("#app") as HTMLDivElement;
  const appRoot = document.createElement("illthorn-app-lit");
  app.appendChild(appRoot);

  await bindMacros();
  await reloadHilites();
  await renderAllSessions();
})();
