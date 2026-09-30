import path from "node:path";
import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	// The repo root has its own lockfile; this app is self-contained.
	turbopack: { root: path.resolve(".") },
	// Every docs page has a Markdown twin: /docs/quick-start.mdx.
	async rewrites() {
		return [{ source: "/docs/:path*.mdx", destination: "/llms.mdx/:path*" }];
	},
};

const withMDX = createMDX();

export default withMDX(nextConfig);

// Enable calling `getCloudflareContext()` in `next dev`.
// See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings.
initOpenNextCloudflareForDev();
