import { Context } from "../components/context";
import { CLI } from "../components/session/cli";
import { Feed } from "../components/session/feed";
import { Prompt } from "../components/session/prompt";
import "../components/session/compass.lit";
import type { Compass } from "../components/session/compass.lit";
import { Effects } from "../components/session/effects";
import { type Hand, makeHand } from "../components/session/hand";
import "../components/session/panel.lit";
import type { Panel } from "../components/session/panel.lit";
import { Room } from "../components/session/room";
import { Streams } from "../components/session/streams";
import { Vitals } from "../components/session/vitals";
import type { FrontendSession as Session } from "../session";
import { div } from "../util/dom";

export type SessionUI = { context: Context; cli: CLI; feed: Feed; prompt: Prompt; vitals: Vitals; streams: Streams; hands: { left: Hand; right: Hand; spell: Hand } };

function createPanel(title: string, ...content: HTMLElement[]): Panel {
  const panel = document.createElement("illthorn-panel") as Panel;
  panel.title = title;
  panel.append(...content);
  return panel;
}

export function makeSessionUI(session: Session): SessionUI {
  // wrapper for an app context
  const context = new Context(session);
  context.classList.add("session");
  context.id = session.name;

  const hud = div({ classes: "hud" });
  const main = div({ classes: "main" });

  context.append(hud, main);
  /** left / hud */
  const compass = document.createElement("illthorn-compass") as Compass;
  compass.session = session;
  const room = new Room(session);
  const vitals = new Vitals(session);
  const activeSpells = new Effects(session, "Active Spells");
  const buffs = new Effects(session, "Buffs");
  const cooldowns = new Effects(session, "Cooldowns");
  const debuffs = new Effects(session, "Debuffs");

  hud.append(
    createPanel("room", room, compass),
    createPanel("vitals", vitals),
    createPanel("active spells", activeSpells),
    createPanel("buffs", buffs),
    createPanel("cooldowns", cooldowns),
    createPanel("debuffs", debuffs),
  );

  /** main  **/

  // hands related ui components
  const handsContainer = div({ classes: "hands" });
  const left = makeHand(session, "left");
  const right = makeHand(session, "right");
  const spell = makeHand(session, "spell");
  const hands = { left, right, spell };
  handsContainer.append(left, right, spell);

  // feeds and streams
  const streams = new Streams();
  const feed = new Feed(session);

  // cli related ui components
  const commandBar = div({ classes: "cli-wrapper" });
  const cli = new CLI(session);
  const prompt = new Prompt(session);
  commandBar.append(prompt, cli);

  main.append(handsContainer, streams, feed, commandBar);
  return { context, vitals, cli, feed, prompt, streams, hands };
}
