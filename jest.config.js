module.exports = {
  collectCoverage: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "./src/**/*.ts",
    "!./test/**/*.ts"
  ],
  coverageReporters: [
    "lcov"
  ],
  moduleFileExtensions: [
    "ts",
    "js"
  ],
  transform: {
    "^.+\\.ts$": "ts-jest"
  },
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json"
    }
  },
  testMatch: [
    "<rootDir>/test/**/*.spec.ts"
  ]
};
