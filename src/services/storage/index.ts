import { appConfig, isProduction } from "../../config";
import { LocalStorageProvider } from "./LocalStorageProvider";
import { ProductionStorageProvider } from "./ProductionStorageProvider";
import type { StorageProvider } from "./StorageProvider";

// Use a Render persistent disk by setting STORAGE_ROOT, or replace this provider with object storage.
export const storageProvider: StorageProvider = isProduction
  ? new ProductionStorageProvider(appConfig.storageRoot)
  : new LocalStorageProvider(appConfig.storageRoot);

export type { StorageMetadata, StorageProvider } from "./StorageProvider";
