#!/usr/bin/env node
/**
 * Release Alpine's builds of EmDash to GitHub Packages.
 *
 *   node scripts/alpine-release.mjs next-version <upstream-version> [published-json]
 *   node scripts/alpine-release.mjs set-version <version>
 *   node scripts/alpine-release.mjs pack <version> <out-dir>
 *
 * Versions are plain semver, because third-party plugins peer-depend on
 * ranges like `emdash >=0.15.0` that no prerelease satisfies. The patch is
 * 1000 × (upstream patch + 1) + build, so builds on emdash 1.3.0 are 1.3.1001,
 * 1.3.1002, … and never look like an upstream release.
 *
 * set-version runs before `pnpm install` and the build: core bakes its
 * package.json version into dist/ (VERSION, and the adapter version check),
 * and pnpm won't run scripts after package.json files change post-install.
 *
 * pack renames the packages Alpine changes into the @alpineio scope and runs
 * `pnpm pack`, which turns workspace: and catalog: ranges into the versions
 * in this checkout. Its package.json edits are undone afterwards.
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
const BUILDS_PER_UPSTREAM_PATCH = 1000;
const PLAIN_VERSION = /^(\d+)\.(\d+)\.(\d+)$/;

/** dir, published name, and edits beyond name/version when packing. */
const PACKAGES = [
	{ dir: "packages/core", name: "@alpineio/emdash" },
	{
		dir: "packages/cloudflare",
		name: "@alpineio/emdash-cloudflare",
		edit: (pkg, version) => {
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

function parse(version) {
	const match = PLAIN_VERSION.exec(version);
	if (!match) throw new Error(`Not a plain x.y.z version: ${version}`);
	return match.slice(1).map(Number);
}

/** The next Alpine version for an upstream release, given versions already published. */
export function nextVersion(upstream, published = []) {
	const [major, minor, patch] = parse(upstream);
	const floor = (patch + 1) * BUILDS_PER_UPSTREAM_PATCH;
	let build = 0;
	for (const version of published) {
		const match = PLAIN_VERSION.exec(version);
		if (!match) continue;
		const [m, n, p] = match.slice(1).map(Number);
		if (m === major && n === minor && p > floor && p < floor + BUILDS_PER_UPSTREAM_PATCH) {
			build = Math.max(build, p - floor);
		}
	}
	if (build + 1 >= BUILDS_PER_UPSTREAM_PATCH) {
		throw new Error(`No builds left for upstream ${upstream}`);
	}
	return `${major}.${minor}.${floor + build + 1}`;
}

function editPackageJson(dir, edit) {
	const file = resolve(dir, "package.json");
	const text = readFileSync(file, "utf8");
	const pkg = JSON.parse(text);
	edit(pkg);
	writeFileSync(file, `${JSON.stringify(pkg, null, "\t")}\n`);
	return [file, text];
}

function setVersion(version) {
	parse(version);
	for (const { dir } of PACKAGES) {
		editPackageJson(dir, (pkg) => {
			pkg.version = version;
		});
	}
}

function pack(version, outDir) {
	parse(version);
	const out = resolve(outDir);
	mkdirSync(out, { recursive: true });
	const originals = [];
	try {
		for (const { dir, name, edit } of PACKAGES) {
			originals.push(
				editPackageJson(dir, (pkg) => {
					pkg.name = name;
					pkg.version = version;
					pkg.repository = { type: "git", url: REPO, directory: dir };
					pkg.publishConfig = { registry: REGISTRY };
					// Consumers never install devDependencies, and their workspace:
					// ranges can point at packages renamed above.
					delete pkg.devDependencies;
					edit?.(pkg, version);
				}),
			);
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
}

/**
 * `npm view <pkg> versions --json` output: an array, a single string, or an
 * error. Unreadable output counts as nothing published; a version that does
 * exist after all is then refused by the registry at publish time.
 */
function publishedVersions(json) {
	try {
		return [JSON.parse(json ?? "[]")].flat().filter((v) => typeof v === "string");
	} catch {
		return [];
	}
}

function main([command, ...args]) {
	if (command === "next-version" && args[0]) {
		console.log(nextVersion(args[0], publishedVersions(args[1])));
	} else if (command === "set-version" && args[0]) {
		setVersion(args[0]);
	} else if (command === "pack" && args[0] && args[1]) {
		pack(args[0], args[1]);
	} else {
		console.error(
			"usage: alpine-release.mjs next-version <upstream> [published-json] | set-version <version> | pack <version> <out-dir>",
		);
		process.exit(1);
	}
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv.slice(2));
