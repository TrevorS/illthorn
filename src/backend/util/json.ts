import fs from "node:fs/promises";

type FilePath = string;

export async function read<T>(f: FilePath) {
  const contents = await fs.readFile(f);
  return JSON.parse(contents.toString()) as T;
}

export async function exists(f: FilePath) {
  try {
    await fs.stat(f);
    return true;
  } catch (_err) {
    return false;
  }
}
