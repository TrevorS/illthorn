// ABOUTME: Individual injury item component that handles single and paired injury display
// ABOUTME: Manages severity symbols, colors, and left/right pairing logic for injury visualization
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("illthorn-injury-item")
export class InjuryItem extends LitElement {
  static styles = css`
    :host {
      display: block;
      --injury-text-primary: var(--color-text-primary);
      --injury-text-secondary: var(--color-text-secondary);
      --injury-severity-minor: var(--color-injury-minor);      /* Yellow */
      --injury-severity-moderate: var(--color-injury-moderate); /* Orange */
      --injury-severity-severe: var(--color-injury-severe);     /* Red */
      --injury-line-height: 14px;
    }

    .injury-item {
      display: flex;
      justify-content: space-between;
      line-height: var(--injury-line-height);
      color: var(--injury-text-primary);
    }

    .injury-part {
      text-align: left;
    }

    .injury-severity {
      text-align: right;
      font-weight: bold;
    }

    .injury-severity.paired .left {
      margin-right: 2px;
    }

    /* Severity colors */
    .severity-minor {
      color: var(--injury-severity-minor);
    }

    .severity-moderate {
      color: var(--injury-severity-moderate);
    }

    .severity-severe {
      color: var(--injury-severity-severe);
    }
  `;

  @property({ type: String })
  displayName = "";

  @property({ type: Number })
  severity: 0 | 1 | 2 | 3 = 0;

  @property({ type: Boolean })
  paired = false;

  @property({ type: Number })
  leftSeverity?: 0 | 1 | 2 | 3;

  @property({ type: Number })
  rightSeverity?: 0 | 1 | 2 | 3;

  private getSeveritySymbol(severity: 0 | 1 | 2 | 3): string {
    switch (severity) {
      case 1:
        return "*"; // Minor
      case 2:
        return "#"; // Moderate
      case 3:
        return "@"; // Severe
      default:
        return ""; // Healthy
    }
  }

  private getSeverityColor(severity: 0 | 1 | 2 | 3): string {
    switch (severity) {
      case 1:
        return "var(--injury-severity-minor)"; // Yellow
      case 2:
        return "var(--injury-severity-moderate)"; // Orange
      case 3:
        return "var(--injury-severity-severe)"; // Red
      default:
        return "var(--injury-text-primary)"; // Default
    }
  }

  render() {
    if (this.paired) {
      const leftSymbol = this.getSeveritySymbol(this.leftSeverity || 0);
      const rightSymbol = this.getSeveritySymbol(this.rightSeverity || 0);

      return html`
        <div class="injury-item">
          <span class="injury-part">${this.displayName}</span>
          <span class="injury-severity paired">
            <span class="left" style="color: ${this.getSeverityColor(this.leftSeverity || 0)}">
              L${leftSymbol}
            </span>
            <span class="right" style="color: ${this.getSeverityColor(this.rightSeverity || 0)}">
              R${rightSymbol}
            </span>
          </span>
        </div>
      `;
    } else {
      return html`
        <div class="injury-item">
          <span class="injury-part">${this.displayName}</span>
          <span class="injury-severity single" 
                style="color: ${this.getSeverityColor(this.severity)}">
            ${this.getSeveritySymbol(this.severity)}
          </span>
        </div>
      `;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-injury-item": InjuryItem;
  }
}
