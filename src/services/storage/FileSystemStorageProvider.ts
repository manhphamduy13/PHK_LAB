import fs from "fs/promises";
import path from "path";
import type { StorageMetadata, StorageProvider } from "./StorageProvider";

export class FileSystemStorageProvider implements StorageProvider {
  constructor(private readonly root: string) {}

  private resolve(key: string): string {
    const root = path.resolve(this.root);
    const resolved = path.resolve(root, key);
    if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
      throw new Error("Invalid storage key");
    }
    return resolved;
  }

  async upload(
    key: string,
    data: Buffer,
    metadata: Omit<StorageMetadata, "key">,
  ): Promise<StorageMetadata> {
    const filePath = this.resolve(key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, data);
    await fs.writeFile(
      `${filePath}.metadata.json`,
      JSON.stringify(metadata),
      "utf8",
    );
    return { key, ...metadata };
  }

  download(key: string): Promise<Buffer> {
    return fs.readFile(this.resolve(key));
  }

  async delete(key: string): Promise<void> {
    await fs.rm(this.resolve(key), { force: true });
    await fs.rm(`${this.resolve(key)}.metadata.json`, { force: true });
  }

  async exists(key: string): Promise<boolean> {
    try {
      await fs.access(this.resolve(key));
      return true;
    } catch {
      return false;
    }
  }

  getUrl(key: string): string {
    return `/storage/${encodeURIComponent(key)}`;
  }

  async getMetadata(key: string): Promise<StorageMetadata | null> {
    try {
      const metadata = JSON.parse(
        await fs.readFile(`${this.resolve(key)}.metadata.json`, "utf8"),
      );
      return { key, ...metadata };
    } catch {
      return null;
    }
  }
}
