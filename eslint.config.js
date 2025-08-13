import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist",
      "backend-php/**",
      "coverage/**",
      "node_modules/**",
      "build/**",
      ".nyc_output/**",
      "src/tests/**",
      "tests-examples/**",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx"
    ]
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "warn", // Change from error to warning
      "@typescript-eslint/no-empty-object-type": "warn", // Change from error to warning
      "@typescript-eslint/ban-ts-comment": "warn", // Change from error to warning
      "@typescript-eslint/no-require-imports": "warn", // Change from error to warning
      "react-hooks/exhaustive-deps": "warn", // Keep as warning
      "prefer-const": "warn", // Change from error to warning
      "no-var": "error", // Keep this as error since it's easy to fix
    },
  }
);
