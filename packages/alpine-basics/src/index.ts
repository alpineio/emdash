import { createRequire } from "node:module";

import { colorPlugin } from "@emdash-cms/plugin-color";
import { embedsPlugin } from "@emdash-cms/plugin-embeds";
import { formsPlugin } from "@emdash-cms/plugin-forms";
import type { AstroIntegration } from "astro";
import { fontProviders } from "astro/config";
import emdash, { type EmDashConfig } from "emdash/astro";

import { ALPINE_LOGO } from "./logo.js";
import { ALPINE_BLUE, alpineAdminCss } from "./theme.js";

export { ALPINE_LOGO } from "./logo.js";
export { adminShortcutTarget } from "./middleware.js";
export { ALPINE_BLUE, alpineAdminCss } from "./theme.js";

export interface AlpineEmdashConfig extends EmDashConfig {
	/** Admin accent color. Defaults to Alpine's Tufts Blue. */
	brandColor?: string;
	/** Set to false to keep EmDash's own admin colors. */
	theme?: boolean;
	/** Set to false to keep EmDash's own admin font (Noto Sans) instead of Inter Tight and JetBrains Mono. */
	brandFonts?: boolean;
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

const CSS_VALUE_BREAKOUT = /[;{}<>]/;

/** The admin's fonts, self-hosted by Astro: the admin's CSP allows no font CDN. */
export const ADMIN_FONTS = [
	{
		name: "Inter Tight",
		cssVariable: "--font-emdash",
		weights: [400, 500, 600, 700],
		fallbacks: ["Inter", "system-ui", "sans-serif"],
	},
	{
		name: "JetBrains Mono",
		cssVariable: "--font-emdash-mono",
		weights: [400, 500],
		fallbacks: ["ui-monospace", "monospace"],
	},
] as const;

/**
 * Adds Inter Tight and JetBrains Mono for the admin, skipping any font
 * variable the site or EmDash already defines. Goes after emdash() in the
 * integrations, so EmDash's own font entry is already in the config.
 */
export function alpineAdminFonts(): AstroIntegration {
	return {
		name: "@alpineio/emdash-basics/fonts",
		hooks: {
			"astro:config:setup": ({ config, updateConfig }) => {
				const taken = new Set(
					((config as { fonts?: Array<{ cssVariable: string }> }).fonts ?? []).map(
						(font) => font.cssVariable,
					),
				);
				const fonts = ADMIN_FONTS.filter((font) => !taken.has(font.cssVariable)).map((font) => ({
					...font,
					weights: [...font.weights],
					fallbacks: [...font.fallbacks],
					provider: fontProviders.google(),
				}));
				if (fonts.length > 0) updateConfig({ fonts });
			},
		},
	};
}

/** Redirects /__admin and anything under it to the EmDash admin. */
export function alpineAdminRedirects(): AstroIntegration {
	return {
		name: "@alpineio/emdash-basics/redirects",
		hooks: {
			"astro:config:setup": ({ addMiddleware }) => {
				addMiddleware({ entrypoint: new URL("./middleware.ts", import.meta.url), order: "pre" });
			},
		},
	};
}

/** The EmDash config an Alpine site ends up with, before it reaches `emdash()`. */
export function resolveAlpineConfig(config: AlpineEmdashConfig = {}): EmDashConfig {
	const { brandColor = ALPINE_BLUE, theme = true, brandFonts = true, ...emdashConfig } = config;
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
		// EmDash's Noto Sans would claim --font-emdash before alpineAdminFonts() could.
		...(brandFonts ? { fonts: false as const } : {}),
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
	const integrations = [alpineAdminRedirects(), emdash(resolveAlpineConfig(config))];
	return config.brandFonts === false ? integrations : [...integrations, alpineAdminFonts()];
}

export default alpineEmdash;
