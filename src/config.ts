import "dotenv/config";

export const isProduction = process.env.NODE_ENV === "production";
export const aiProvider =
  process.env.AI_PROVIDER?.trim().toLowerCase() || "gemini";

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret) return secret;
  if (isProduction) {
    throw new Error("JWT_SECRET is required in production");
  }
  return "local-development-secret-change-me";
}

export const appConfig = {
  port: 3000,
  frontendUrl: process.env.FRONTEND_URL?.trim() || "",
  maxPdfSize: Number.parseInt(
    process.env.MAX_PDF_SIZE || String(50 * 1024 * 1024),
    10,
  ),
  maxAiInputSize: Number.parseInt(
    process.env.MAX_AI_INPUT_SIZE || String(45 * 1024 * 1024),
    10,
  ),
  storageRoot: process.env.STORAGE_ROOT?.trim() || "uploads",
};
