import { defineConfig } from "eslint/config";
// @ts-ignore - Next.js ESLint config is CommonJS
import nextConfig from "eslint-config-next/core-web-vitals.js";

const configs = nextConfig?.configs || (Array.isArray(nextConfig) ? nextConfig : [nextConfig]);

export default defineConfig([
  ...(Array.isArray(configs) ? configs : [configs]),
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "node_modules/**",
    ],
  },
]);
