// @ts-check
import { tanstackConfig } from "@tanstack/eslint-config"

export default [
  ...tanstackConfig,
  {
    rules: {
      "sort-imports": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "react-refresh/only-export-components": "off",
    }
  }
]