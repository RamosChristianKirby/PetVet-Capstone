import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import hooks from "eslint-plugin-react-hooks";
import refresh from "eslint-plugin-react-refresh";

export default tseslint.config(
  { ignores: ["dist/**", "test-results/**", "playwright-report/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { "react-hooks": hooks, "react-refresh": refresh },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  {
    // Entry points and UI primitives deliberately share helper exports.
    files: [
      "src/main.tsx",
      "src/components/ui/button.tsx",
      "src/components/ui/form.tsx",
      "src/components/ui/toggle.tsx",
    ],
    rules: { "react-refresh/only-export-components": "off" },
  },
);
