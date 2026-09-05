export interface StorageMetadata {
  key: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface StorageProvider {
  upload(
    key: string,
    data: Buffer,
    metadata: Omit<StorageMetadata, "key">,
  ): Promise<StorageMetadata>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  getUrl(key: string): string;
  getMetadata(key: string): Promise<StorageMetadata | null>;
}
