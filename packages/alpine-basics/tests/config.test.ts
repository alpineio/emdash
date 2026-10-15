import { formsPlugin } from "@emdash-cms/plugin-forms";
import { describe, expect, it, vi } from "vitest";

import {
	ADMIN_REDIRECTS,
	ALPINE_LOGO,
	alpineAdminRedirects,
	alpineEmdash,
	resolveAlpineConfig,
} from "../src/index.js";

describe("resolveAlpineConfig", () => {
	it("adds forms, embeds and color", () => {
		const ids = resolveAlpineConfig().plugins?.map((plugin) => plugin.id);
		expect(ids).toEqual(["emdash-forms", "embeds", "color"]);
	});

	it("keeps a site's own copy of a default plugin instead of adding a second", () => {
		const siteForms = formsPlugin({ defaultSpamProtection: "honeypot" });
		const plugins = resolveAlpineConfig({ plugins: [siteForms] }).plugins ?? [];
		expect(plugins.filter((plugin) => plugin.id === "emdash-forms")).toEqual([siteForms]);
		expect(plugins.map((plugin) => plugin.id)).toEqual(["embeds", "color", "emdash-forms"]);
	});

	it("falls back to the Alpine logo without overriding a site's own admin.logo", () => {
		expect(resolveAlpineConfig().admin?.defaultLogo).toBe(ALPINE_LOGO);
		const admin = resolveAlpineConfig({ admin: { logo: "/mine.svg" } }).admin;
		expect(admin?.logo).toBe("/mine.svg");
		expect(admin?.defaultLogo).toBe(ALPINE_LOGO);
	});

	it("hides the EmDash footer label unless the site sets one", () => {
		expect(resolveAlpineConfig().admin?.footerLabel).toBe(false);
		expect(resolveAlpineConfig({ admin: { footerLabel: "Alpine" } }).admin?.footerLabel).toBe(
			"Alpine",
		);
	});

	it("themes the admin with the brand color in light and dark mode", () => {
		const css = resolveAlpineConfig({ brandColor: "#e63946" }).admin?.css ?? "";
		expect(css.match(/--color-kumo-brand: #e63946;/g)).toHaveLength(2);
	});

	it("appends a site's own admin css after the theme", () => {
		const css = resolveAlpineConfig({ admin: { css: ".x{color:red}" } }).admin?.css ?? "";
		expect(css.endsWith(".x{color:red}")).toBe(true);
		expect(css).toContain("--color-kumo-brand: #4a8fe1;");
	});

	it("leaves the admin css unset when the theme is off and the site adds none", () => {
		expect(resolveAlpineConfig({ theme: false }).admin?.css).toBeUndefined();
	});

	it("rejects a brand color that could break out of the CSS value", () => {
		expect(() => resolveAlpineConfig({ brandColor: "red;}</style><script>" })).toThrow(
			/single CSS color/,
		);
	});

	it("passes database and storage through untouched", () => {
		const database = { entrypoint: "x", config: {} } as never;
		expect(resolveAlpineConfig({ database }).database).toBe(database);
	});
});

describe("alpineAdminRedirects", () => {
	it("redirects /__admin and its subpaths to the EmDash admin", async () => {
		const updateConfig = vi.fn();
		const hook = alpineAdminRedirects().hooks["astro:config:setup"];
		await hook?.({ updateConfig } as never);
		expect(updateConfig).toHaveBeenCalledWith({ redirects: ADMIN_REDIRECTS });
		expect(ADMIN_REDIRECTS["/__admin"]).toBe("/_emdash/admin/");
	});
});

describe("alpineEmdash", () => {
	it("returns the EmDash integration followed by the redirects", () => {
		const names = alpineEmdash().map((integration) => integration.name);
		expect(names).toEqual(["emdash", "@alpineio/emdash-basics/redirects"]);
	});
});
