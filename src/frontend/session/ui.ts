import { Context } from "../components/context";
import { CLI } from "../components/session/cli";
import { Feed } from "../components/session/feed";
import { Prompt } from "../components/session/prompt";
import "../components/session/compass.lit";
import type { Compass } from "../components/session/compass.lit";
import "../components/session/effects.lit";
import type { EffectsLit } from "../components/session/effects.lit";
import { type Hand, makeHand } from "../components/session/hand";
import "../components/session/panel.lit";
import type { Panel } from "../components/session/panel.lit";
import { Room } from "../components/session/room";
import { Streams } from "../components/session/streams";
import "../components/session/vitals/vitals.lit";
import type { Vitals } from "../components/session/vitals/vitals.lit";
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
  const vitals = document.createElement("illthorn-vitals-lit") as Vitals;
  vitals.session = session;
  const activeSpells = document.createElement("illthorn-effects-lit") as EffectsLit;
  activeSpells.session = session;
  activeSpells.name = "Active Spells";
  const buffs = document.createElement("illthorn-effects-lit") as EffectsLit;
  buffs.session = session;
  buffs.name = "Buffs";
  const cooldowns = document.createElement("illthorn-effects-lit") as EffectsLit;
  cooldowns.session = session;
  cooldowns.name = "Cooldowns";
  const debuffs = document.createElement("illthorn-effects-lit") as EffectsLit;
  debuffs.session = session;
  debuffs.name = "Debuffs";

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
