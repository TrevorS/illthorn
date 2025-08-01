// ABOUTME: Lit-based Panel component for collapsible content containers using HTML details element
// ABOUTME: Provides reactive properties for title and open state with slot-based content
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("illthorn-panel")
export class Panel extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-size: 13px;
      position: relative;
      resize: vertical;
    }

    details {
      margin: 0;
      padding: 0;
      border: none;
    }

    summary {
      margin: 0;
      background: var(--color-surface);
      color: var(--color-text-secondary);
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 4px 8px;
      border-bottom: 1px solid var(--color-border);
      cursor: pointer;
      user-select: none;
      list-style: none;
    }

    summary::-webkit-details-marker {
      display: none;
    }

    summary:focus {
      outline: 0;
    }

  `;

  @property({ type: String })
  title = "";

  @property({ type: Boolean, reflect: true })
  open = true;

  render() {
    return html`
      <details ?open=${this.open}>
        <summary>${this.title}</summary>
        <slot></slot>
      </details>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-panel": Panel;
  }
}
