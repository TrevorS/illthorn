// ABOUTME: Lit-based Panel component for collapsible content containers using HTML details element
// ABOUTME: Provides reactive properties for title and open state with slot-based content
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("illthorn-panel")
export class Panel extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    details {
      border: 1px solid var(--panel-border, #ccc);
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }

    summary {
      background: var(--panel-header-bg, #f5f5f5);
      padding: 0.5rem;
      cursor: pointer;
      font-weight: bold;
      user-select: none;
    }

    summary:hover {
      background: var(--panel-header-hover-bg, #e5e5e5);
    }

    .content {
      padding: 0.5rem;
      background: var(--panel-content-bg, transparent);
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
        <div class="content">
          <slot></slot>
        </div>
      </details>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-panel": Panel;
  }
}
