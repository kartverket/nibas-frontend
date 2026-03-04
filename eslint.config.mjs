import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import react from "eslint-plugin-react";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import _import from "eslint-plugin-import";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import reactCompiler from "eslint-plugin-react-compiler";
import reactHooks from "eslint-plugin-react-hooks";

const { configs } = js;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: configs.recommended,
  allConfig: configs.all,
});

export default [
  {
    ignores: ["src/types/api-gen.ts", "src/types/api-gen-arbeidsliste.ts"],
  },
  ...fixupConfigRules(
    compat.extends(
      "eslint:recommended",
      "plugin:react/recommended",
      "plugin:react/jsx-runtime",
      "plugin:@typescript-eslint/recommended",
      "plugin:import/recommended",
      "plugin:import/typescript",
      "plugin:prettier/recommended",
    ),
  ),
  {
    plugins: {
      react: fixupPluginRules(react),
      "@typescript-eslint": fixupPluginRules(typescriptEslint),
      import: fixupPluginRules(_import),
      "react-compiler": reactCompiler,
      "react-hooks": fixupPluginRules(reactHooks),
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: tsParser,
      ecmaVersion: 12,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: ["./tsconfig.json", "./tsconfig.node.json", "./tsconfig.eslint.json"],
        tsconfigRootDir: __dirname,
      },
    },

    settings: {
      react: {
        version: "detect",
      },
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },

    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react/prop-types": "off",
      "react/function-component-definition": [
        2,
        {
          namedComponents: "arrow-function",
          unnamedComponents: "arrow-function",
        },
      ],
      "react-compiler/react-compiler": "error",
      "@typescript-eslint/array-type": "warn",
      "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/prefer-optional-chain": "off",
      "@typescript-eslint/strict-boolean-expressions": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/no-unused-expressions": "error",
      "no-unused-vars": "off",
      curly: "warn",
      "no-shadow": "off",
      "no-restricted-imports": [
        "warn",
        {
          patterns: ["@chakra-ui/*"],
        },
      ],
      // ESLint 10 added these to eslint:recommended; disable until addressed incrementally
      "preserve-caught-error": "off",
      "no-useless-assignment": "off",
      "no-unassigned-vars": "off",
      "no-console": "warn",
      "import/no-unresolved": "error",
      "import/no-named-as-default-member": "off",
      "prettier/prettier": [
        "warn",
        {
          endOfLine: "auto",
        },
      ],
      eqeqeq: ["error", "smart"],
      // TS-2431: Vi bruker react compiler.
      // Dermed vil denne klage på funksjoner som ikke er memoisert hvis de er brukt i en useEffect.
      // Dette er ikke et problem, så vi slår den av.
      // Vi må fremdeles legge avhengigheter i dependency-arrayet for å unngå feil.
      "react-hooks/exhaustive-deps": "off",
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },
];
