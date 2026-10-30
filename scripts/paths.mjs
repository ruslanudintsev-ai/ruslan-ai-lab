/** Normalize a trusted deployment prefix for the local/static build. */
export function normalizeBasePath(input) {
  if (typeof input !== "string" || !/^\/[A-Za-z0-9/_-]*$/.test(input) || input.includes("//")) {
    throw new Error("Invalid static base path");
  }
  const normalized = input.endsWith("/") ? input : input + "/";
  return normalized;
}
