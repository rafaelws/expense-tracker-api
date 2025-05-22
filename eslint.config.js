// @ts-check

import eslint from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import importX from "eslint-plugin-import-x";
import prettierPlugin from "eslint-plugin-prettier";
import importSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.strict,
  {
    plugins: {
      "import-x": importX,
      "simple-import-sort": importSort,
      prettier: prettierPlugin,
      // "unused-imports": importUnused,
    },
    rules: {
      "no-console": "warn",

      "prettier/prettier": "error",
      indent: [
        "error",
        2,
        {
          SwitchCase: 1,
        },
      ],
      "max-len": [
        "error",
        {
          code: 80,
        },
      ],
      "linebreak-style": ["error", "unix"],
      quotes: ["error", "double"],
      semi: ["error", "always"],
      "arrow-body-style": "off",
      "prefer-arrow-callback": "off",
      "no-unused-vars": "off",

      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      "import-x/first": "error",
      "import-x/no-duplicates": "error",
      "import-x/newline-after-import": "error",

      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      // "unused-imports/no-unused-imports": "error",
      // "unused-imports/no-unused-vars": ["warn", {
      //   vars: "all",
      //   varsIgnorePattern: "^_",
      //   args: "after-used",
      //   argsIgnorePattern: "^_",
      // }],
    },
  },
  prettierConfig,
);
