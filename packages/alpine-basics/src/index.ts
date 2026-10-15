import { colorPlugin } from "@emdash-cms/plugin-color";
import { embedsPlugin } from "@emdash-cms/plugin-embeds";
import { formsPlugin } from "@emdash-cms/plugin-forms";
import { createRequire } from "node:module";
import type { AstroIntegration } from "astro";
import emdash, { type EmDashConfig } from "emdash/astro";

import { ALPINE_LOGO } from "./logo.js";
import { ALPINE_BLUE, alpineAdminCss } from "./theme.js";

export { ALPINE_LOGO } from "./logo.js";
export { ALPINE_BLUE, alpineAdminCss } from "./theme.js";

export interface AlpineEmdashConfig extends EmDashConfig {
	/** Admin accent color. Defaults to Alpine's Tufts Blue. */
	brandColor?: string;
	/** Set to false to keep EmDash's own admin colors. */
	theme?: boolean;
}

type PluginEntry = NonNullable<EmDashConfig["plugins"]>[number];

const require = createRequire(import.meta.url);

/**
 * EmDash imports a plugin's modules by specifier from the site's root, where a
 * plugin that is only a dependency of this package isn't installed. Absolute
 * paths resolved from here load the copy this package depends on.
 */
function resolvedFromHere(plugin: PluginEntry): PluginEntry {
	const resolve = (specifier: string | undefined) =>
		specifier === undefined ? undefined : require.resolve(specifier);
	return {
		...plugin,
		entrypoint: require.resolve(plugin.entrypoint),
		...(plugin.adminEntry ? { adminEntry: resolve(plugin.adminEntry) } : {}),
		...(plugin.componentsEntry ? { componentsEntry: resolve(plugin.componentsEntry) } : {}),
	};
}

/** Plugins every Alpine site gets. A site that lists one itself keeps its own options. */
export function alpineDefaultPlugins(): PluginEntry[] {
	return [formsPlugin(), embedsPlugin(), colorPlugin()].map(resolvedFromHere);
}

/** /__admin and anything under it goes to the EmDash admin. */
export const ADMIN_REDIRECTS: Record<string, string> = {
	"/__admin": "/_emdash/admin/",
	"/__admin/[...path]": "/_emdash/admin/[...path]",
};

const CSS_VALUE_BREAKOUT = /[;{}<>]/;

export function alpineAdminRedirects(): AstroIntegration {
	return {
		name: "@alpineio/emdash-basics/redirects",
		hooks: {
			"astro:config:setup": ({ updateConfig }) => {
				updateConfig({ redirects: ADMIN_REDIRECTS });
			},
		},
	};
}

/** The EmDash config an Alpine site ends up with, before it reaches `emdash()`. */
export function resolveAlpineConfig(config: AlpineEmdashConfig = {}): EmDashConfig {
	const { brandColor = ALPINE_BLUE, theme = true, ...emdashConfig } = config;
	if (CSS_VALUE_BREAKOUT.test(brandColor)) {
		throw new Error(`alpineEmdash: brandColor must be a single CSS color, got "${brandColor}"`);
	}

	const sitePlugins = emdashConfig.plugins ?? [];
	const siteIds = new Set(sitePlugins.map((plugin) => plugin.id));
	const plugins = [
		...alpineDefaultPlugins().filter((plugin) => !siteIds.has(plugin.id)),
		...sitePlugins,
	];

	const css = [theme ? alpineAdminCss(brandColor) : "", emdashConfig.admin?.css ?? ""]
		.filter(Boolean)
		.join("\n");

	return {
		...emdashConfig,
		plugins,
		admin: {
			defaultLogo: ALPINE_LOGO,
			footerLabel: false,
			...emdashConfig.admin,
			...(css ? { css } : {}),
		},
	};
}

/**
 * Use in place of `emdash()` in astro.config:
 * `integrations: [react(), alpineEmdash({ database, storage })]`
 */
export function alpineEmdash(config: AlpineEmdashConfig = {}): AstroIntegration[] {
	return [emdash(resolveAlpineConfig(config)), alpineAdminRedirects()];
}

export default alpineEmdash;
