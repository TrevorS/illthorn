// ABOUTME: Dev panel window renderer for displaying raw game logs
// ABOUTME: Handles IPC communication and UI updates for the developer debugging panel

interface LogEntry {
  data: string;
  sessionName: string;
  timestamp: string;
}

class DevPanel {
  private logBuffer: Array<LogEntry> = [];
  private filteredBuffer: Array<LogEntry> = [];
  private readonly maxEntries = 1000;
  private readonly logsContainer: HTMLElement;
  private readonly emptyState: HTMLElement;
  private readonly clearButton: HTMLButtonElement;
  private readonly copyButton: HTMLButtonElement;
  private readonly pinButton: HTMLButtonElement;
  private readonly filterInput: HTMLInputElement;
  private autoScroll = true;
  private currentFilter = "";
  private isPinned = false;

  constructor() {
    console.log("Dev panel: Constructor called");
    this.logsContainer = document.getElementById("logs-container") as HTMLElement;
    this.emptyState = document.getElementById("empty-state") as HTMLElement;
    this.clearButton = document.getElementById("clear-button") as HTMLButtonElement;
    this.copyButton = document.getElementById("copy-button") as HTMLButtonElement;
    this.pinButton = document.getElementById("pin-button") as HTMLButtonElement;
    this.filterInput = document.getElementById("filter-input") as HTMLInputElement;

    this.setupEventListeners();
    this.setupIPC();
    console.log("Dev panel: Initialization complete");
  }

  private setupEventListeners(): void {
    // Clear button
    this.clearButton.addEventListener("click", () => {
      this.clearLogs();
    });

    // Copy button
    this.copyButton.addEventListener("click", () => {
      this.copyToClipboard();
    });

    // Pin button
    this.pinButton.addEventListener("click", () => {
      this.togglePin();
    });

    // Filter input
    this.filterInput.addEventListener("input", () => {
      this.applyFilter();
    });

    // Auto-scroll detection
    this.logsContainer.addEventListener("scroll", () => {
      const { scrollTop, scrollHeight, clientHeight } = this.logsContainer;
      this.autoScroll = scrollHeight - scrollTop - clientHeight < 10;
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      // Ctrl+Shift+D to close dev window
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        e.preventDefault();
        this.closeDevWindow();
      }
    });
  }

  private setupIPC(): void {
    console.log("Dev panel: Setting up IPC listeners");

    // Listen for raw data from main process
    window.ipcRenderer.on("dev-window:raw-data", (_event, logEntry: LogEntry) => {
      console.log("Dev panel: Received raw data", logEntry);
      this.addLogEntry(logEntry);
    });

    // Listen for clear command from main process
    window.ipcRenderer.on("dev-window:clear", () => {
      console.log("Dev panel: Received clear command");
      this.clearLogs();
    });
  }

  private addLogEntry(entry: LogEntry): void {
    // Add to main buffer with size limit
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxEntries) {
      this.logBuffer.shift(); // Remove oldest entry
    }

    // Re-apply filter to update filtered buffer
    this.applyFilter();
  }

  private createLogElement(entry: LogEntry): HTMLElement {
    const logElement = document.createElement("div");
    logElement.className = "log-entry";

    const timestamp = new Date(entry.timestamp).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });

    // Apply XML highlighting to the data
    const highlightedData = this.highlightXML(this.escapeHtml(entry.data));

    logElement.innerHTML = `
      <div class="log-header">[${timestamp}] ${this.escapeHtml(entry.sessionName)} (${entry.data.length} chars)</div>
      <pre class="log-data">${highlightedData}</pre>
    `;

    return logElement;
  }

  private clearLogs(): void {
    this.logBuffer = [];
    this.filteredBuffer = [];

    // Remove all log entries
    const entries = this.logsContainer.querySelectorAll(".log-entry");
    entries.forEach((entry) => {
      entry.remove();
    });

    // Reset empty state
    this.emptyState.innerHTML = `
      <div class="empty-state-icon">📄</div>
      <div>No game data received yet</div>
      <div style="margin-top: 4px; font-size: 11px; color: #666;">Raw XML data will appear here when you interact with the game</div>
    `;
    this.emptyState.style.display = "flex";
  }

  private scrollToBottom(): void {
    requestAnimationFrame(() => {
      this.logsContainer.scrollTop = this.logsContainer.scrollHeight;
    });
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  private copyToClipboard(): void {
    const buffer = this.currentFilter ? this.filteredBuffer : this.logBuffer;
    if (buffer.length === 0) return;

    const text = buffer
      .map((entry) => {
        const timestamp = new Date(entry.timestamp).toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          fractionalSecondDigits: 3,
        });
        return `[${timestamp}] ${entry.sessionName} (${entry.data.length} chars)\n${entry.data}`;
      })
      .join("\n---\n");

    navigator.clipboard
      .writeText(text)
      .then(() => {
        // Brief visual feedback
        const originalText = this.copyButton.textContent;
        this.copyButton.textContent = "✓";
        setTimeout(() => {
          this.copyButton.textContent = originalText;
        }, 1000);
      })
      .catch((err) => {
        console.error("Failed to copy to clipboard:", err);
      });
  }

  private async togglePin(): Promise<void> {
    try {
      const result = await window.ipcRenderer.invoke("DevWindow.TogglePin");
      if (result.success) {
        this.isPinned = result.isPinned;
        this.updatePinButtonState();
        console.log(`Pin toggled: ${this.isPinned ? "pinned" : "unpinned"}`);
      } else {
        console.error("Failed to toggle pin:", result.error);
      }
    } catch (error) {
      console.error("Error toggling pin:", error);
    }
  }

  private updatePinButtonState(): void {
    if (this.isPinned) {
      this.pinButton.classList.add("pinned");
      this.pinButton.textContent = "📌";
    } else {
      this.pinButton.classList.remove("pinned");
      this.pinButton.textContent = "📌";
    }
  }

  private async closeDevWindow(): Promise<void> {
    try {
      // Send message to main window to trigger the :dev command
      // This ensures the same UI feedback is shown as when toggling from main window
      const result = await window.ipcRenderer.invoke("DevWindow.SendToMainWindow", ":dev");
      if (!result.success) {
        console.error("Failed to send command to main window:", result.error);
        // Fallback to direct close if sending to main window fails
        await this.directClose();
      }
    } catch (error) {
      console.error("Error sending close command to main window:", error);
      // Fallback to direct close if sending to main window fails
      await this.directClose();
    }
  }

  private async directClose(): Promise<void> {
    try {
      const result = await window.ipcRenderer.invoke("DevWindow.Close");
      if (!result.success) {
        console.error("Failed to close dev window:", result.error);
      }
    } catch (closeError) {
      console.error("Error closing dev window directly:", closeError);
    }
  }

  private applyFilter(): void {
    const filterText = this.filterInput.value.trim();
    this.currentFilter = filterText;

    if (!filterText) {
      // No filter, show all entries
      this.filteredBuffer = [...this.logBuffer];
    } else {
      try {
        const regex = new RegExp(filterText, "i");
        this.filteredBuffer = this.logBuffer.filter((entry) => regex.test(entry.data) || regex.test(entry.sessionName));
      } catch (error) {
        // Invalid regex, show no results
        console.warn("Invalid regex filter:", error);
        this.filteredBuffer = [];
      }
    }

    this.renderFilteredEntries();
  }

  private renderFilteredEntries(): void {
    // Clear current entries (but keep empty state)
    const entries = this.logsContainer.querySelectorAll(".log-entry");
    entries.forEach((entry) => {
      entry.remove();
    });

    const buffer = this.currentFilter ? this.filteredBuffer : this.logBuffer;

    if (buffer.length === 0) {
      this.emptyState.style.display = "flex";
      if (this.currentFilter && this.logBuffer.length > 0) {
        this.emptyState.innerHTML = `
          <div class="empty-state-icon">🔍</div>
          <div>No entries match filter "${this.escapeHtml(this.currentFilter)}"</div>
          <div style="margin-top: 4px; font-size: 11px; color: #666;">Try a different filter pattern</div>
        `;
      }
    } else {
      this.emptyState.style.display = "none";
      buffer.forEach((entry) => {
        const logElement = this.createLogElement(entry);
        this.logsContainer.appendChild(logElement);
      });
    }

    // Auto-scroll to bottom if enabled
    if (this.autoScroll) {
      this.scrollToBottom();
    }
  }

  private highlightXML(text: string): string {
    // Simple XML syntax highlighting while preserving whitespace
    return (
      text
        // XML comments
        .replace(/(<!--[\s\S]*?-->)/g, '<span class="xml-comment">$1</span>')
        // XML tags with attributes
        .replace(/(&lt;\/?)([^&\s>]+)(\s[^&>]*)?(&gt;)/g, (_match, open, tagName, attrs, close) => {
          let result = `<span class="xml-tag">${open}${tagName}</span>`;
          if (attrs) {
            // Highlight attributes: name="value" or name='value'
            const highlightedAttrs = attrs.replace(/(\w+)(=)(["'])(.*?)\3/g, '<span class="xml-attr">$1</span>$2<span class="xml-value">$3$4$3</span>');
            result += highlightedAttrs;
          }
          result += `<span class="xml-tag">${close}</span>`;
          return result;
        })
        // Self-closing tags
        .replace(/(&lt;)([^&\s/>]+)([^&>]*?)(\/&gt;)/g, '<span class="xml-tag">$1$2</span>$3<span class="xml-tag">$4</span>')
    );
  }
}

// Initialize the dev panel when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new DevPanel();
});
