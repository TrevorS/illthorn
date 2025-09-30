// ABOUTME: Comprehensive error handling system for Illthorn application
// ABOUTME: Provides structured error types, context capture, and recovery patterns

/**
 * Base error class for all Illthorn-specific errors
 * Provides structured error information and debugging context
 */
export class IlthornError extends Error {
  readonly timestamp: number;
  readonly context: Record<string, unknown>;
  readonly userMessage: string;
  readonly recoverySuggestions: Array<string>;

  constructor(
    message: string,
    options: {
      cause?: Error;
      context?: Record<string, unknown>;
      userMessage?: string;
      recoverySuggestions?: Array<string>;
    } = {},
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = Date.now();
    this.context = options.context || {};
    this.userMessage = options.userMessage || "An unexpected error occurred.";
    this.recoverySuggestions = options.recoverySuggestions || [];

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // Set cause if provided (for error chaining)
    if (options.cause) {
      this.cause = options.cause;
    }
  }

  /**
   * Convert error to a structured object for logging
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      userMessage: this.userMessage,
      timestamp: this.timestamp,
      context: this.context,
      recoverySuggestions: this.recoverySuggestions,
      stack: this.stack,
      cause: this.cause ? String(this.cause) : undefined,
    };
  }

  /**
   * Create a user-friendly error summary for display
   */
  getUserSummary(): string {
    let summary = this.userMessage;
    if (this.recoverySuggestions.length > 0) {
      summary += `\n\nSuggestions:\n${this.recoverySuggestions.map((s) => `• ${s}`).join("\n")}`;
    }
    return summary;
  }
}

/**
 * Session-related errors (connection, communication, lifecycle)
 */
export class SessionError extends IlthornError {
  readonly sessionName?: string;
  readonly sessionPort?: number;

  constructor(
    message: string,
    options: {
      cause?: Error;
      context?: Record<string, unknown>;
      userMessage?: string;
      recoverySuggestions?: Array<string>;
      sessionName?: string;
      sessionPort?: number;
    } = {},
  ) {
    super(message, {
      ...options,
      userMessage: options.userMessage || "There was a problem with your game session.",
      recoverySuggestions: options.recoverySuggestions || ["Check if Lich is running", "Verify session connection settings", "Try reconnecting to the session"],
    });

    this.sessionName = options.sessionName;
    this.sessionPort = options.sessionPort;
  }
}

/**
 * XML parsing and content processing errors
 */
export class ParserError extends IlthornError {
  readonly xmlContent?: string;
  readonly parsePosition?: number;

  constructor(
    message: string,
    options: {
      cause?: Error;
      context?: Record<string, unknown>;
      userMessage?: string;
      recoverySuggestions?: Array<string>;
      xmlContent?: string;
      parsePosition?: number;
    } = {},
  ) {
    super(message, {
      ...options,
      userMessage: options.userMessage || "There was a problem processing game content.",
      recoverySuggestions: options.recoverySuggestions || ["This may be a temporary issue with game data", "Try refreshing the session", "Report this if it continues to happen"],
    });

    this.xmlContent = options.xmlContent;
    this.parsePosition = options.parsePosition;
  }
}

/**
 * Configuration and settings errors
 */
export class ConfigError extends IlthornError {
  readonly configKey?: string;
  readonly configValue?: unknown;

  constructor(
    message: string,
    options: {
      cause?: Error;
      context?: Record<string, unknown>;
      userMessage?: string;
      recoverySuggestions?: Array<string>;
      configKey?: string;
      configValue?: unknown;
    } = {},
  ) {
    super(message, {
      ...options,
      userMessage: options.userMessage || "There was a problem with application settings.",
      recoverySuggestions: options.recoverySuggestions || ["Check your configuration files", "Try resetting to default settings", "Verify file permissions"],
    });

    this.configKey = options.configKey;
    this.configValue = options.configValue;
  }
}

/**
 * Component initialization and lifecycle errors
 */
export class ComponentError extends IlthornError {
  readonly componentName?: string;
  readonly componentType?: string;

  constructor(
    message: string,
    options: {
      cause?: Error;
      context?: Record<string, unknown>;
      userMessage?: string;
      recoverySuggestions?: Array<string>;
      componentName?: string;
      componentType?: string;
    } = {},
  ) {
    super(message, {
      ...options,
      userMessage: options.userMessage || "A component failed to initialize properly.",
      recoverySuggestions: options.recoverySuggestions || ["Try refreshing the page", "Check browser console for details", "Verify component dependencies"],
    });

    this.componentName = options.componentName;
    this.componentType = options.componentType;
  }
}

/**
 * Network and communication errors
 */
export class NetworkError extends IlthornError {
  readonly url?: string;
  readonly statusCode?: number;
  readonly timeout?: number;

  constructor(
    message: string,
    options: {
      cause?: Error;
      context?: Record<string, unknown>;
      userMessage?: string;
      recoverySuggestions?: Array<string>;
      url?: string;
      statusCode?: number;
      timeout?: number;
    } = {},
  ) {
    super(message, {
      ...options,
      userMessage: options.userMessage || "There was a network connectivity problem.",
      recoverySuggestions: options.recoverySuggestions || ["Check your internet connection", "Verify server is accessible", "Try again in a few moments"],
    });

    this.url = options.url;
    this.statusCode = options.statusCode;
    this.timeout = options.timeout;
  }
}

/**
 * Create a safe wrapper that catches errors and provides fallbacks
 */
export function withFallback<T>(operation: () => T, fallback: T, onError?: (error: Error) => void): T {
  try {
    return operation();
  } catch (error) {
    if (onError) {
      onError(error instanceof Error ? error : new Error(String(error)));
    }
    return fallback;
  }
}

/**
 * Create an async wrapper with error handling and retries
 */
export async function withRetry<T>(operation: () => Promise<T>, maxRetries = 3, delayMs = 1000, onError?: (error: Error, attempt: number) => void): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      if (onError) {
        onError(err, attempt);
      }

      if (attempt === maxRetries) {
        throw err;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }

  // This should never be reached, but TypeScript needs it
  throw new Error("Maximum retries exceeded");
}

/**
 * Log error with structured context
 */
export function logError(error: unknown, additionalContext?: Record<string, unknown>): void {
  const errorData = {
    timestamp: Date.now(),
    error:
      error instanceof IlthornError
        ? error.toJSON()
        : {
            name: error instanceof Error ? error.name : "UnknownError",
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          },
    context: additionalContext || {},
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  console.error("Illthorn Error:", errorData);

  // Could send to error reporting service here
  // Example: errorReportingService.report(errorData);
}

/**
 * Display user-friendly error message in the feed
 */
export function displayError(error: IlthornError, feedElement?: HTMLElement): void {
  const message = error.getUserSummary();

  if (feedElement) {
    // Create error display element
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.style.cssText = `
      color: var(--color-error, #ff6b6b);
      background: var(--color-error-background, rgba(255, 107, 107, 0.1));
      border: 1px solid var(--color-error, #ff6b6b);
      border-radius: 4px;
      padding: 0.5em;
      margin: 0.5em 0;
      font-family: monospace;
      white-space: pre-wrap;
    `;
    errorDiv.textContent = `Error: ${message}`;
    feedElement.appendChild(errorDiv);
  } else {
    // Fallback to console
    console.error("Error:", message);
  }
}

/**
 * Helper functions for common error scenarios
 */
export const createSessionError = (message: string, sessionName?: string, sessionPort?: number, cause?: Error) =>
  new SessionError(message, {
    cause,
    sessionName,
    sessionPort,
    context: { sessionName, sessionPort },
  });

export const createParserError = (message: string, xmlContent?: string, position?: number, cause?: Error) =>
  new ParserError(message, {
    cause,
    xmlContent: xmlContent?.slice(0, 500), // Limit content size
    parsePosition: position,
    context: { xmlLength: xmlContent?.length, parsePosition: position },
  });

export const createConfigError = (message: string, key?: string, value?: unknown, cause?: Error) =>
  new ConfigError(message, {
    cause,
    configKey: key,
    configValue: value,
    context: { configKey: key, configValue: value },
  });

export const createComponentError = (message: string, componentName?: string, componentType?: string, cause?: Error) =>
  new ComponentError(message, {
    cause,
    componentName,
    componentType,
    context: { componentName, componentType },
  });

export const createNetworkError = (message: string, url?: string, statusCode?: number, cause?: Error) =>
  new NetworkError(message, {
    cause,
    url,
    statusCode,
    context: { url, statusCode },
  });
