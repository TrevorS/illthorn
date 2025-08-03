// ABOUTME: TypeScript definitions for saxophone XML parser library
// ABOUTME: Provides type safety for event-driven SAX parsing

declare module "saxophone" {
  import { EventEmitter } from "events";

  /**
   * Tag information from saxophone parser events
   */
  interface SaxophoneTag {
    /** Tag name (e.g., 'progressBar', 'dialogData') */
    name: string;
    /** Tag attributes as raw string (e.g., ' id="health" value="100" ') */
    attrs: string;
    /** Whether tag is self-closing */
    isSelfClosing?: boolean;
  }

  /**
   * Saxophone SAX parser for streaming XML parsing
   */
  export default class Saxophone extends EventEmitter {
    /**
     * Parse complete XML document (equivalent to write + end)
     */
    parse(xml: string): void;

    /**
     * Write partial XML chunk for streaming parsing
     */
    write(chunk: string): void;

    /**
     * Signal end of XML document stream
     */
    end(): void;

    // Event handler types for better TypeScript support

    /**
     * Emitted when opening tag is encountered
     */
    on(event: "tagopen", listener: (tag: SaxophoneTag) => void): this;

    /**
     * Emitted when closing tag is encountered
     */
    on(event: "tagclose", listener: (tag: SaxophoneTag) => void): this;

    /**
     * Emitted when text content is found between tags
     */
    on(event: "text", listener: (text: string) => void): this;

    /**
     * Emitted when CDATA section is encountered
     */
    on(event: "cdata", listener: (cdata: string) => void): this;

    /**
     * Emitted when XML comment is encountered
     */
    on(event: "comment", listener: (comment: string) => void): this;

    /**
     * Emitted when processing instruction is encountered
     */
    on(event: "processinginstruction", listener: (pi: string) => void): this;

    /**
     * Emitted when parsing error occurs
     */
    on(event: "error", listener: (error: Error) => void): this;

    /**
     * Emitted when document parsing is complete
     */
    on(event: "finish", listener: () => void): this;

    // Generic event handler fallback
    on(event: string | symbol, listener: (...args: Array<unknown>) => void): this;
  }
}
