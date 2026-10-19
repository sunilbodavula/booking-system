const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

const base = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
};

/** @type {import("jest").Config} **/
module.exports = {
  projects: [
    {
      ...base,
      displayName: "unit",
      testMatch: ["**/*.test.ts"],
      testPathIgnorePatterns: ["/node_modules/", "\.e2e\.test\.ts$"],
    },
    {
      ...base,
      displayName: "e2e",
      testMatch: ["**/*.e2e.test.ts"],
      setupFiles: ["<rootDir>/src/__tests__/env.ts"],
      globalSetup: "<rootDir>/src/__tests__/setup.ts",
    },
  ],
};
