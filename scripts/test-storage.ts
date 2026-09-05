import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { FileSystemStorageProvider } from "../src/services/storage/FileSystemStorageProvider";

const root = await fs.mkdtemp(path.join(os.tmpdir(), "phk-storage-"));
const provider = new FileSystemStorageProvider(root);
const key = "pdf/smoke-test.pdf";
const metadata = {
  filename: "smoke-test.pdf",
  mimeType: "application/pdf",
  size: 5,
};
const data = Buffer.from("%PDF-");

try {
  await provider.upload(key, data, metadata);
  if (!(await provider.exists(key))) throw new Error("exists() failed");
  if ((await provider.download(key)).toString() !== data.toString())
    throw new Error("download() failed");
  if ((await provider.getMetadata(key))?.size !== metadata.size)
    throw new Error("getMetadata() failed");
  if (!provider.getUrl(key).includes(encodeURIComponent(key)))
    throw new Error("getUrl() failed");
  await provider.delete(key);
  if (await provider.exists(key)) throw new Error("delete() failed");
  console.log("Storage provider smoke test passed.");
} finally {
  await fs.rm(root, { recursive: true, force: true });
}
