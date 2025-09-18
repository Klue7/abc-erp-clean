import type { Config } from "tailwindcss";

// Re-export the JavaScript config so tools consuming the TypeScript file stay in sync.
import config from "./tailwind.config.js";

export default config satisfies Config;
