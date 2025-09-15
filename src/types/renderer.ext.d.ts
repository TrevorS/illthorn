import { type Illthorn } from "src/frontend/state";

type IPCEventCallback = (e: Electron.IpcRendererEvent, message: unknown) => void;

type Ok = { ok: true };

type Noop = { noop: true };

export interface ISessionAPI {
  connect(config: Illthorn.Session.Config, callback: IPCEventCallback): Promise<Illthorn.Session.Pojo>;
  registerSingletonListener(eventName: string, callback: IPCEventCallback): Promise<Noop | Ok>;
  listAvailable(): Promise<Array<Illthorn.LichSessionDescriptor>>;
  listConnected(): Promise<Array<Illthorn.Session.Pojo>>;
  sendCommand(session: Illthorn.Session.Pojo, command: string): Promise<Ok>;
}

export interface IAppAPI {
  setTitle(config: { title: string }): void;
  loadGameObjectXML(): Promise<{
    success: boolean;
    content: string | null;
    error?: string;
    path?: string | null;
  }>;
}

export interface ISettingsAPI<T = Record<string, unknown>> {
  load(): Promise<T>;
  get<A>(key: string): Promise<A | undefined>;
  set<V>(key: string, value: V): Promise<void>;
}

export interface IDevWindowAPI {
  open(): Promise<{ success: boolean; windowId?: number; error?: string }>;
  close(): Promise<{ success: boolean; error?: string }>;
  isOpen(): Promise<{ isOpen: boolean }>;
  sendRawData(data: string, sessionName: string): Promise<{ success: boolean; error?: string }>;
  clear(): Promise<{ success: boolean; error?: string }>;
}

declare global {
  interface Window {
    Session: ISessionAPI;
    App: IAppAPI;
    Settings: ISettingsAPI;
    DevWindow: IDevWindowAPI;
    Illthorn: typeof Illthorn;
    ipcRenderer: {
      // biome-ignore lint/suspicious/noExplicitAny: IPC channels require generic any types for dynamic data
      invoke: (channel: string, ...args: any[]) => Promise<any>;
      // biome-ignore lint/suspicious/noExplicitAny: IPC channels require generic any types for dynamic data
      on: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void;
      // biome-ignore lint/suspicious/noExplicitAny: IPC channels require generic any types for dynamic data
      removeListener: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void;
    };
  }
}
