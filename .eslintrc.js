const { resolve } = require("path");
module.exports = {
  root: true,
  parserOptions: {
    parser: "@typescript-eslint/parser",
    project: resolve(__dirname, "./tsconfig.json"),
    tsconfigRootDir: __dirname,
    ecmaVersion: 2018,
    sourceType: "module",
  },

  env: {
    es6: true,
  },

  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier",
  ],

  plugins: ["@typescript-eslint"],

  globals: {},

  rules: {
    "prefer-promise-reject-errors": "off",

    quotes: ["warn", "single", { avoidEscape: true }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",

    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",

    "@typescript-eslint/no-explicit-any": ["off"],
    "@typescript-eslint/no-unsafe-assignment": ["off"],
    "@typescript-eslint/no-implied-eval":["off"],
    // '@typescript-eslint/no-unsafe-return': ['off'],
    // '@typescript-eslint/no-unsafe-call': ['off'],
    // '@typescript-eslint/no-empty-function': ['off'],
  },
};
