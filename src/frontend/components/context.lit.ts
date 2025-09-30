// ABOUTME: Lit-based Context component serving as a container that holds a session reference
// ABOUTME: Simple wrapper element providing a slot for child components
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { FrontendSession } from "../session";

@customElement("illthorn-context-lit")
export class Context extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: Object })
  session!: FrontendSession;

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-context-lit": Context;
  }
}
