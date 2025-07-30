enum AttrState {
  IN_ATTRIBUTE_NAME,
  IN_ATTRIBUTE_VALUE,
  HAS_EQUALS,
  IDLE,
}
type Key = string;

type Value = string | true;

export type GemstoneTagAttrs = Record<Key, Value>;

export function parseAttrs(contents: string): GemstoneTagAttrs {
  const attrs: Array<[Key, Value]> = [];
  let pendingValue = "";
  let pendingKey = "";
  let escapeChar = "";
  let state = AttrState.IDLE;
  Array.from(contents).forEach((char) => {
    switch (char) {
      case " ":
        switch (state) {
          case AttrState.IN_ATTRIBUTE_VALUE:
            pendingValue += char;
            return;
          case AttrState.IN_ATTRIBUTE_NAME:
            attrs.push([pendingKey, true]);
            pendingKey = "";
            pendingValue = "";
            return;
          default:
            return;
        }
      case `=`:
        switch (state) {
          case AttrState.IN_ATTRIBUTE_NAME:
            state = AttrState.HAS_EQUALS;
            return;
          case AttrState.IN_ATTRIBUTE_VALUE:
            pendingValue += char;
            return;
          default:
            return;
        }
      case `"`:
      case `'`:
        switch (state) {
          case AttrState.HAS_EQUALS:
            escapeChar = char;
            state = AttrState.IN_ATTRIBUTE_VALUE;
            return;
          case AttrState.IN_ATTRIBUTE_VALUE:
            if (escapeChar !== char) {
              pendingValue += char;
              return;
            }

            attrs.push([pendingKey, pendingValue]);
            state = AttrState.IDLE;
            pendingKey = "";
            pendingValue = "";
            escapeChar = "";
            return;

          default:
            return;
        }
      default:
        switch (state) {
          case AttrState.IN_ATTRIBUTE_VALUE:
            pendingValue += char;
            return;
          case AttrState.IN_ATTRIBUTE_NAME:
            pendingKey += char;
            return;
          case AttrState.IDLE:
            pendingKey += char;
            state = AttrState.IN_ATTRIBUTE_NAME;
            return;
        }
    }
  });
  return Object.fromEntries(attrs);
}
