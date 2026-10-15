/** Tufts Blue, the accent in Alpine's brand tokens. */
export const ALPINE_BLUE = "#4a8fe1";

interface Accent {
	brand: string;
	lightHover: string;
	lightText: string;
	darkHover: string;
	darkText: string;
}

const ALPINE_ACCENT: Accent = {
	brand: ALPINE_BLUE,
	lightHover: "#2f6fbd",
	lightText: "#2f6fbd",
	darkHover: "#6ba6ee",
	darkText: "#8dbbf2",
};

function accentFor(color: string): Accent {
	if (color.toLowerCase() === ALPINE_BLUE) return ALPINE_ACCENT;
	return {
		brand: color,
		lightHover: `color-mix(in oklab, ${color} 75%, black)`,
		lightText: `color-mix(in oklab, ${color} 75%, black)`,
		darkHover: `color-mix(in oklab, ${color} 80%, white)`,
		darkText: `color-mix(in oklab, ${color} 60%, white)`,
	};
}

/**
 * Alpine's admin theme: paper and ink surfaces with one accent color.
 * The selectors outrank the admin's own [data-theme=classic] tokens.
 */
export function alpineAdminCss(brandColor: string = ALPINE_BLUE): string {
	const accent = accentFor(brandColor);
	return `:root[data-theme]:not([data-mode="dark"]) {
	--color-kumo-canvas: #fbfaf7;
	--color-kumo-base: #ffffff;
	--color-kumo-elevated: #fbfaf7;
	--color-kumo-recessed: #f1efe9;
	--color-kumo-overlay: #ffffff;
	--color-kumo-control: #ffffff;
	--color-kumo-tint: #f3f1eb;
	--color-kumo-fill: #e8e5dd;
	--color-kumo-fill-hover: #dcd8ce;
	--color-kumo-interact: #d6d2c8;
	--color-kumo-contrast: #0e1418;
	--color-kumo-line: rgba(14, 20, 24, 0.13);
	--color-kumo-hairline: rgba(14, 20, 24, 0.08);
	--color-kumo-brand: ${accent.brand};
	--color-kumo-brand-hover: ${accent.lightHover};
	--color-kumo-focus: ${accent.brand};
	--text-color-kumo-default: #0e1418;
	--text-color-kumo-strong: #2a3236;
	--text-color-kumo-subtle: #5c6366;
	--text-color-kumo-inactive: #a3a7a8;
	--text-color-kumo-link: ${accent.lightText};
	--text-color-kumo-brand: ${accent.lightText};
}
:root[data-theme][data-mode="dark"] {
	--color-kumo-canvas: #050b0e;
	--color-kumo-base: #0f1a20;
	--color-kumo-elevated: #0a1216;
	--color-kumo-recessed: #071014;
	--color-kumo-overlay: #13212a;
	--color-kumo-control: #0f1a20;
	--color-kumo-tint: #13212a;
	--color-kumo-fill: #1a2a33;
	--color-kumo-fill-hover: #22343e;
	--color-kumo-interact: #2a3d47;
	--color-kumo-contrast: #edeae2;
	--color-kumo-line: rgba(237, 234, 226, 0.15);
	--color-kumo-hairline: rgba(237, 234, 226, 0.08);
	--color-kumo-brand: ${accent.brand};
	--color-kumo-brand-hover: ${accent.darkHover};
	--color-kumo-focus: ${accent.darkHover};
	--text-color-kumo-default: #edeae2;
	--text-color-kumo-strong: #f6f4ef;
	--text-color-kumo-subtle: rgba(237, 234, 226, 0.62);
	--text-color-kumo-inactive: rgba(237, 234, 226, 0.38);
	--text-color-kumo-link: ${accent.darkText};
	--text-color-kumo-brand: ${accent.darkText};
}
#emdash-boot-loader .spinner {
	border-top-color: ${accent.brand};
}`;
}
