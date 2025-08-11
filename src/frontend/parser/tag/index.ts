import type { GemstoneTagAttrs } from "./attributes";
import type { TagName } from "./names";

export type { TagName };
export enum TagKind {
  TEXT,
  METADATA,
  INLINE,
}

export enum TagState {
  OPEN,
  CLOSED,
}

export type GameTag = { kind: TagKind; name: string; gameName: string; attrs: GemstoneTagAttrs; children: GameTag[]; state: TagState; text: string };

export const makeTag = (name: TagName, gameName: string = ""): GameTag => ({ name, kind: kindFrom(name), gameName, attrs: {}, children: [], text: "", state: TagState.OPEN });

export const kindFrom = (name: TagName) => {
  switch (name) {
    case ":text":
      return TagKind.TEXT;
    case "a":
    case "b":
    case "d":
    case "preset":
    case "style":
    case "output":
    case "stream":
      return TagKind.INLINE;
    default:
      return TagKind.METADATA;
  }
};

export const normalizeTagName = (name: string) => {
  switch (name) {
    case "pushStream":
    case "popStream":
      return "stream";
    case "pushBold":
    case "popBold":
      return "b";
    default:
      return name as TagName;
  }
};
