/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["dist/*", "node_modules"],
  globalSetup: "./tests/globalSetup.ts",
  globalTeardown: "./tests/globalTeardown.ts",
  setupFilesAfterEnv: ["./tests/setup.ts"],
};
