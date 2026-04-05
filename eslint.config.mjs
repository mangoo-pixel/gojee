import { defineConfig, globalIgnores } from "eslint/config";
import next from "eslint-config-next";
// import nextVitals from "eslint-config-next/core-web-vitals"; // No longer needed if we use next config directly
// import nextTs from "eslint-config-next/typescript"; // No longer needed if we use next config directly
import path from "path";

const eslintConfig = defineConfig([
  next,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
