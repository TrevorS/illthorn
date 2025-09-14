// ABOUTME: Method names for dev window IPC communication
// ABOUTME: Centralized constants for type-safe IPC method names

export enum DevWindowMethods {
  Open = "DevWindow.Open",
  Close = "DevWindow.Close",
  IsOpen = "DevWindow.IsOpen",
  SendRawData = "DevWindow.SendRawData",
  Clear = "DevWindow.Clear",
  TogglePin = "DevWindow.TogglePin",
}
