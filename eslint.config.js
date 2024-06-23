// @ts-check

import eslint from "@eslint/js";
import importX from "eslint-plugin-import-x";
import prettier from "eslint-plugin-prettier/recommended";
import importSort from "eslint-plugin-simple-import-sort";
// FIXME conflicting eslint versions
// import importUnused from "eslint-plugin-unused-imports";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.strict,
  prettier,
  {
    plugins: {
      "import-x": importX,
      "simple-import-sort": importSort,
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
);
