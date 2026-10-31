import { defineConfig } from "astro/config";
import { normalizeBasePath } from "./scripts/paths.mjs";

// The default "/" serves local previews. The production project path must be
// supplied, tested, and explicitly approved before any public deployment.
const base = normalizeBasePath(process.env.DEMO_BASE_PATH ?? "/");
export default defineConfig({ output: "static", base });
