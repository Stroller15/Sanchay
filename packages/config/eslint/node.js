const baseConfig = require("./base");

/** @type {import("eslint").Linter.Config[]} */
const config = [
  ...baseConfig,
  {
    files: ["**/*.ts"],
    rules: {
      "no-console": ["warn", { allow: ["warn", "error", "info", "log"] }],
    },
  },
];

module.exports = config;
