// ABOUTME: Pure UI component for displaying game prompts from Gemstone IV
// ABOUTME: Receives prompt text as a property and renders it with consistent styling
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("illthorn-prompt")
export class Prompt extends LitElement {
  static styles = css`
    :host {
      font-family: "MonoLisa", monospace;
      display: inline-block;
      text-align: right;
      font-size: 1.6em;
    }
  `;

  @property({ type: String })
  promptText = "";

  render() {
    return html`${this.promptText}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-prompt": Prompt;
  }
}
