// Type definitions for saxophone
declare module "saxophone" {
  interface SaxophoneTag {
    name: string;
    attrs: string;
    isSelfClosing?: boolean;
  }

  interface SaxophoneTextNode {
    contents: string;
  }

  class Saxophone {
    constructor();

    on(event: "tagopen", handler: (tag: SaxophoneTag) => void): void;
    on(event: "tagclose", handler: (tag: { name: string }) => void): void;
    on(event: "text", handler: (text: SaxophoneTextNode | string) => void): void;
    on(event: "error", handler: (error: Error) => void): void;
    on(event: "finish", handler: () => void): void;

    parse(xml: string): void;
    write(chunk: string): void;
    end(): void;
  }

  export = Saxophone;
}
