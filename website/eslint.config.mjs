import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
	...nextVitals,
	...nextTs,
	globalIgnores([
		".next/**",
		".open-next/**",
		".source/**",
		"out/**",
		"build/**",
		"next-env.d.ts",
		"cloudflare-env.d.ts",
		// Copied from the package's web/ by scripts/sync-engine.mjs; linted there.
		"src/lib/numeric-text/engine/**",
	]),
]);
