import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  coverageProvider: "v8",
  passWithNoTests: true,
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/src/**/__tests__/**/*.{test,spec}.{ts,tsx}"],
  setupFilesAfterEnv: ["<rootDir>/src/setup.test.ts"],
};

export default createJestConfig(config);
