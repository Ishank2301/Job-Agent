import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Tech debt marker: legacy components (Kanban, JobsBoard,
      // RecruiterConsole, ResumeStudio) still use `any` at their data
      // edges. Downgraded to a warning until they get real types.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Build artifacts from dev servers run in the wrong cwd:
    "**/.next/**",
    "**/node_modules/**",
  ]),
]);

export default eslintConfig;
