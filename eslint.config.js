import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["**/dist/**", "**/node_modules/**", "**/*.d.ts", "scripts/**", "netlify/functions/**"],
  },
  // Domain: must not import any other @livingsites package or @netlify/database
  {
    files: ["packages/domain/src/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@livingsites/*"], message: "Domain must not import any @livingsites package. Domain depends on nothing." },
            { group: ["@netlify/*"], message: "Domain must not import @netlify packages." },
          ],
        },
      ],
    },
  },
  // Application: must not import Composition, Infrastructure, test-support, or @netlify/database
  {
    files: ["packages/application/src/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "@livingsites/composition", message: "Application must not import Composition." },
            { name: "@livingsites/infrastructure", message: "Application must not import Infrastructure." },
            { name: "@livingsites/test-support", message: "Application must not import test-support." },
            { name: "@netlify/database", message: "Application must not import @netlify/database." },
          ],
          patterns: [
            { group: ["@livingsites/infrastructure", "@livingsites/infrastructure/*"], message: "Application must not import Infrastructure." },
            { group: ["@livingsites/test-support", "@livingsites/test-support/*"], message: "Application must not import test-support." },
            { group: ["@netlify/*"], message: "Application must not import @netlify packages." },
          ],
        },
      ],
    },
  },
  // Policies: must not import repositories, services, platform, or infrastructure
  {
    files: ["packages/application/src/policies/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["../repositories/*", "../repositories", "../../repositories/*", "../../repositories"], message: "Policies must not import repositories." },
            { group: ["../services/*", "../services", "../../services/*", "../../services"], message: "Policies must not import services." },
            { group: ["@livingsites/infrastructure", "@livingsites/infrastructure/*"], message: "Policies must not import Infrastructure." },
            { group: ["@livingsites/platform", "@livingsites/platform/*"], message: "Policies must not import Platform." },
          ],
        },
      ],
    },
  },
  // Platform: must not import any other @livingsites package or @netlify/database
  {
    files: ["packages/platform/src/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@livingsites/*"], message: "Platform must not import any other @livingsites package." },
            { group: ["@netlify/*"], message: "Platform must not import @netlify packages." },
          ],
        },
      ],
    },
  },
  // Infrastructure production code (non-test): must not import Composition or test-support
  // @netlify/database is ALLOWED here — Infrastructure owns the provider
  {
    files: ["packages/infrastructure/src/**/*.ts"],
    ignores: ["**/*.test.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "@livingsites/composition", message: "Infrastructure must not import Composition." },
            { name: "@livingsites/test-support", message: "Infrastructure must not import test-support." },
          ],
        },
      ],
    },
  },
  // test-support: must not import Composition, Infrastructure, or @netlify/database
  {
    files: ["packages/test-support/src/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "@livingsites/composition", message: "test-support must not import Composition." },
            { name: "@livingsites/infrastructure", message: "test-support must not import Infrastructure." },
            { name: "@netlify/database", message: "test-support must not import @netlify/database." },
          ],
        },
      ],
    },
  },
  // Test files: allow any for branded type construction
  {
    files: ["**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);
