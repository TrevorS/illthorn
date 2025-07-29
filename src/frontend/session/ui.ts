import { Context } from "../components/context";
import "../components/session/prompt.lit";
import type { Prompt } from "../components/session/prompt.lit";
import "../components/session/compass.lit";
import type { Compass } from "../components/session/compass.lit";
import "../components/session/effects/effects.lit";
import type { Effects } from "../components/session/effects/effects.lit";
import { type HandLit as Hand, makeHandLit as makeHand } from "../components/session/hand.lit";
import "../components/session/hand.lit";
import "../components/session/panel.lit";
import type { Panel } from "../components/session/panel.lit";
import type { RoomLit as Room } from "../components/session/room.lit";
import "../components/session/room.lit";
import "../components/session/vitals/vitals.lit";
import type { Vitals } from "../components/session/vitals/vitals.lit";
import "../components/session/cli.lit";
import type { CLILit as CLI } from "../components/session/cli.lit";
import "../components/session/feed.lit";
import type { FeedLit as Feed } from "../components/session/feed.lit";
import "../components/session/streams.lit";
import type { StreamsLit as Streams } from "../components/session/streams.lit";
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
  const room = document.createElement("illthorn-room-lit") as Room;
  room.session = session;
  const vitals = document.createElement("illthorn-vitals-lit") as Vitals;
  vitals.session = session;
  const activeSpells = document.createElement("illthorn-effects-lit") as Effects;
  activeSpells.session = session;
  activeSpells.name = "Active Spells";

  hud.append(createPanel("room", room, compass), createPanel("vitals", vitals), createPanel("active spells", activeSpells));

  /** main  **/

  // hands related ui components
  const handsContainer = div({ classes: "hands" });
  const left = makeHand(session, "left");
  const right = makeHand(session, "right");
  const spell = makeHand(session, "spell");
  const hands = { left, right, spell };
  handsContainer.append(left, right, spell);

  // feeds and streams
  const streams = document.createElement("illthorn-streams-lit") as Streams;
  const feed = document.createElement("illthorn-feed-lit") as Feed;
  feed.session = session;

  // cli related ui components
  const commandBar = div({ classes: "cli-wrapper" });
  const cli = document.createElement("illthorn-cli-lit") as CLI;
  cli.session = session;
  const prompt = document.createElement("illthorn-prompt") as Prompt;
  prompt.session = session;
  commandBar.append(prompt, cli);

  main.append(handsContainer, streams, feed, commandBar);
  return { context, vitals, cli, feed, prompt, streams, hands };
}
