#!/usr/bin/env node
/**
 * Pack Alpine's builds of EmDash for GitHub Packages.
 *
 *   node scripts/alpine-release.mjs <version> <out-dir>
 *
 * Renames the packages Alpine changes into the @alpineio scope, sets them all
 * to <version> and runs `pnpm pack`, which turns workspace: and catalog:
 * ranges into the versions in this checkout. Build first: the tarballs take
 * dist/ as it is. The package.json edits are undone afterwards.
 *
 * Sites install these under their original names with npm aliases
 * ("emdash": "npm:@alpineio/emdash@<version>"), because EmDash imports itself
 * as `emdash/...` and the Cloudflare adapter imports `emdash`.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const REGISTRY = "https://npm.pkg.github.com";
const REPO = "git+https://github.com/alpineio/emdash.git";

const [version, outArg] = process.argv.slice(2);
if (!version || !outArg) {
	console.error("usage: node scripts/alpine-release.mjs <version> <out-dir>");
	process.exit(1);
}
const out = resolve(outArg);
mkdirSync(out, { recursive: true });

/** dir, published name, and edits beyond name/version. */
const PACKAGES = [
	{ dir: "packages/core", name: "@alpineio/emdash" },
	{
		dir: "packages/cloudflare",
		name: "@alpineio/emdash-cloudflare",
		edit: (pkg) => {
			pkg.dependencies.emdash = `npm:@alpineio/emdash@${version}`;
		},
	},
	{
		dir: "packages/alpine-basics",
		name: "@alpineio/emdash-basics",
		edit: (pkg) => {
			// The site's `emdash` is the aliased Alpine build; any version will do.
			pkg.peerDependencies.emdash = "*";
		},
	},
];

const originals = new Map();
try {
	for (const { dir, name, edit } of PACKAGES) {
		const file = resolve(dir, "package.json");
		const text = readFileSync(file, "utf8");
		originals.set(file, text);
		const pkg = JSON.parse(text);
		pkg.name = name;
		pkg.version = version;
		pkg.repository = { type: "git", url: REPO, directory: dir };
		pkg.publishConfig = { registry: REGISTRY };
		// Consumers never install devDependencies, and their workspace: ranges
		// can point at packages renamed above.
		delete pkg.devDependencies;
		edit?.(pkg);
		writeFileSync(file, `${JSON.stringify(pkg, null, "\t")}\n`);
	}
	for (const { dir } of PACKAGES) {
		execFileSync("pnpm", ["pack", "--pack-destination", out], {
			cwd: resolve(dir),
			stdio: "inherit",
		});
	}
} finally {
	for (const [file, text] of originals) writeFileSync(file, text);
}
