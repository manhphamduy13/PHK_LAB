import { FileSystemStorageProvider } from "./FileSystemStorageProvider";

// Uses a Render persistent disk mounted at STORAGE_ROOT until object storage is configured.
export class ProductionStorageProvider extends FileSystemStorageProvider {}
