const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const globals = require("globals");

module.exports = defineConfig([
	eslint.configs.recommended,
	{
		files: ["**/*.js"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "commonjs",
			globals: {
				...globals.node,
			},
		},
		rules: {
			semi: "error",
			"prefer-const": "warn",
			"no-console": "warn",
			"no-constant-condition": ["error", { checkLoops: false }],
			"no-duplicate-imports": "error",
			"no-new-wrappers": "error",
			"no-return-await": "error",
			"no-unreachable-loop": "error",
			"no-unused-vars": ["warn", { argsIgnorePattern: "^_", caughtErrors: "none" }],
		},
	},
	{
		ignores: ["data/**", "logs/**", "node_modules/**"],
	},
]);
