// ABOUTME: Re-exports shared config types for backend use
// ABOUTME: Now uses centralized type definitions from shared directory

export {
  type ConfigApiResponse,
  type ConfigFileChangeEvent,
  ConfigMethods,
  type HighlightConfig,
  type HighlightPattern,
  type MacroConfig,
} from "../../shared/types/config.types";
