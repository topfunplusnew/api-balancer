module.exports = {
  testEnvironment: "node",
  testMatch: ["**/src/test/**/*.test.js"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/test/**",
    "!src/models/index.js",
  ],
  coverageDirectory: "coverage",
  verbose: true,
};
