import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Serwist generates this bundled service worker at build time.
    "public/sw.js",
    "public/sw.js.map",
    "public/workbox-*.js",
  ]),
  {
    rules: {
      // Avatars and post photos use short-lived Supabase signed URLs whose
      // path rotates on every refresh. next/image can't usefully optimize
      // those, and adding width/height to every <img> would be busywork.
      "@next/next/no-img-element": "off",
      // Allow intentionally-unused identifiers when they're prefixed with `_`
      // (matches the TS-style convention for placeholder/discarded arguments).
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
]);

export default eslintConfig;
