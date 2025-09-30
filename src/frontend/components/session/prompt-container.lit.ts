// ABOUTME: Smart container component that manages prompt state via session events
// ABOUTME: Subscribes to prompt events and passes processed text to UI component using BaseContainerComponent
import { html } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { GameTag } from "../../parser/tag";
import type { FrontendSession as Session } from "../../session/index";
import { BaseContainerComponent } from "../mixins/base-container.lit";
import "./prompt.lit";

@customElement("illthorn-prompt-container")
export class PromptContainer extends BaseContainerComponent {
  @state()
  private _promptText = "";

  protected getStateToStore(): Record<string, unknown> {
    return {
      promptText: this._promptText,
    };
  }

  protected restoreState(state: Record<string, unknown>): void {
    this._promptText = (state.promptText as string) || "";
  }

  protected getStorageKeyPrefix(): string {
    return "prompt";
  }

  constructor(session?: Session) {
    super();
    if (session) {
      this.session = session;
    }
  }

  protected getSessionEventSubscriptions() {
    return [
      {
        eventName: "prompt",
        handler: this.createStatePersistingHandler((tag: GameTag) => {
          this.processPromptData(tag);
        }),
      },
    ];
  }

  private processPromptData(prompt: GameTag) {
    // Extract text from GameTag
    let promptText = prompt.text || "";

    // Extract text from prompt children if main text is empty
    if (!promptText && prompt.children.length > 0) {
      // Find first text child and use its text content
      const textChild = prompt.children.find((child) => child.name === ":text");
      promptText = textChild?.text || "";
    }

    // Decode HTML entities (e.g., &gt; -> >)
    if (promptText) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = promptText;
      promptText = tempDiv.textContent || tempDiv.innerText || promptText;
    }

    this._promptText = promptText;
  }

  render() {
    return html`<illthorn-prompt .promptText=${this._promptText}></illthorn-prompt>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "illthorn-prompt-container": PromptContainer;
  }
}
