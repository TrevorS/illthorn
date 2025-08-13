import { ipcRenderer as IPC } from "electron";
import { AppMethods } from "./methods";

export async function setTitle(title: string) {
  return await IPC.send(AppMethods.SetTile, { title });
}

export async function loadGameObjectXML(): Promise<{
  success: boolean;
  content: string | null;
  error?: string;
  path?: string | null;
}> {
  return await IPC.invoke(AppMethods.LoadGameObjectXML);
}
