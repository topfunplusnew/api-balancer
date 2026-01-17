module.exports = {
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["<rootDir>/src/test/**/*.test.js"],
  collectCoverageFrom: [
    "<rootDir>/src/**/*.js",
    "!<rootDir>/src/test/**",
    "!<rootDir>/src/models/index.js",
  ],
  coverageDirectory: "<rootDir>/coverage",
  verbose: true,
};
