/** Tufts Blue, the accent in Alpine's brand tokens. */
export const ALPINE_BLUE = "#4a8fe1";

interface Accent {
	/** Accent on paper (light mode). */
	light: string;
	/** Accent on the dark surfaces. */
	dark: string;
	/** Accent-colored text and links, readable on paper. */
	lightText: string;
	/** Accent-colored text and links, readable on the dark surfaces. */
	darkText: string;
}

const ALPINE_ACCENT: Accent = {
	light: ALPINE_BLUE,
	dark: "#6ba6ee",
	lightText: "#2f6fbd",
	darkText: "#8dbbf2",
};

function accentFor(color: string): Accent {
	if (color.toLowerCase() === ALPINE_BLUE) return ALPINE_ACCENT;
	return {
		light: color,
		dark: `color-mix(in oklab, ${color} 80%, white)`,
		lightText: `color-mix(in oklab, ${color} 75%, black)`,
		darkText: `color-mix(in oklab, ${color} 60%, white)`,
	};
}

/**
 * Alpine's admin theme, from the alpine.io client portal design: paper and
 * ink with one accent, square corners, hairline rules instead of shadows, and
 * small monospace caps for labels.
 *
 * Colors go through EmDash's Kumo tokens. The few component rules use Kumo's
 * data-* hooks rather than utility classes, which change more often. The
 * selectors outrank the admin's own [data-theme=classic] tokens.
 *
 * Fonts come from `alpineAdminFonts()`: Inter Tight as --font-emdash and
 * JetBrains Mono as --font-emdash-mono.
 */
export function alpineAdminCss(brandColor: string = ALPINE_BLUE): string {
	const accent = accentFor(brandColor);
	return `:root[data-theme] {
	--alpine-mono: var(--font-emdash-mono, "JetBrains Mono"), ui-monospace, SFMono-Regular, Menlo, monospace;
	--font-mono: var(--alpine-mono);
	--color-kumo-shadow-drop: transparent;
	--color-kumo-shadow-edge: transparent;
	--color-kumo-tip-shadow: transparent;
}
:root[data-theme]:not([data-mode="dark"]) {
	--alpine-paper: #fbfaf7;
	--alpine-surface: #ffffff;
	--alpine-ink: #0e1418;
	--alpine-muted: rgba(14, 20, 24, 0.56);
	--alpine-faint: rgba(14, 20, 24, 0.4);
	--alpine-rule: rgba(14, 20, 24, 0.13);
	--alpine-grid: rgba(14, 20, 24, 0.045);
	--alpine-accent: ${accent.light};
	/* Darker than the accent so white button text reads at about 5:1. */
	--alpine-button: ${accent.lightText};
	--alpine-ok: #2c6e49;
	--alpine-warn: #9a6b00;
	--alpine-bad: #b3001b;
	--color-kumo-canvas: var(--alpine-paper);
	--color-kumo-base: var(--alpine-surface);
	--color-kumo-elevated: var(--alpine-paper);
	--color-kumo-recessed: #f1efe9;
	--color-kumo-overlay: var(--alpine-surface);
	--color-kumo-control: var(--alpine-paper);
	--color-kumo-tint: var(--alpine-grid);
	--color-kumo-fill: #e8e5dd;
	--color-kumo-fill-hover: #dcd8ce;
	--color-kumo-interact: #d6d2c8;
	--color-kumo-contrast: var(--alpine-ink);
	--color-kumo-line: var(--alpine-rule);
	--color-kumo-hairline: rgba(14, 20, 24, 0.08);
	--color-kumo-brand: var(--alpine-accent);
	--color-kumo-brand-hover: var(--alpine-ink);
	--color-kumo-focus: var(--alpine-accent);
	--color-kumo-success: var(--alpine-ok);
	--color-kumo-warning: var(--alpine-warn);
	--color-kumo-danger: var(--alpine-bad);
	--text-color-kumo-default: var(--alpine-ink);
	--text-color-kumo-strong: #2a3236;
	--text-color-kumo-subtle: var(--alpine-muted);
	--text-color-kumo-inactive: var(--alpine-faint);
	--text-color-kumo-placeholder: var(--alpine-faint);
	--text-color-kumo-link: ${accent.lightText};
	--text-color-kumo-brand: ${accent.lightText};
	--text-color-kumo-success: var(--alpine-ok);
	--text-color-kumo-warning: var(--alpine-warn);
	--text-color-kumo-danger: var(--alpine-bad);
}
:root[data-theme][data-mode="dark"] {
	--alpine-paper: #0a1216;
	--alpine-surface: #0f1a20;
	--alpine-ink: #edeae2;
	--alpine-muted: rgba(237, 234, 226, 0.58);
	--alpine-faint: rgba(237, 234, 226, 0.4);
	--alpine-rule: rgba(237, 234, 226, 0.15);
	--alpine-grid: rgba(237, 234, 226, 0.05);
	--alpine-accent: ${accent.dark};
	--alpine-button: ${accent.dark};
	--alpine-ok: #4faf7a;
	--alpine-warn: #f2bb05;
	--alpine-bad: #ff5a6e;
	--color-kumo-canvas: var(--alpine-paper);
	--color-kumo-base: var(--alpine-surface);
	--color-kumo-elevated: var(--alpine-paper);
	--color-kumo-recessed: #071014;
	--color-kumo-overlay: #13212a;
	--color-kumo-control: var(--alpine-paper);
	--color-kumo-tint: var(--alpine-grid);
	--color-kumo-fill: #1a2a33;
	--color-kumo-fill-hover: #22343e;
	--color-kumo-interact: #2a3d47;
	--color-kumo-contrast: var(--alpine-ink);
	--color-kumo-line: var(--alpine-rule);
	--color-kumo-hairline: rgba(237, 234, 226, 0.08);
	--color-kumo-brand: var(--alpine-accent);
	--color-kumo-brand-hover: var(--alpine-ink);
	--color-kumo-focus: var(--alpine-accent);
	--color-kumo-success: var(--alpine-ok);
	--color-kumo-warning: var(--alpine-warn);
	--color-kumo-danger: var(--alpine-bad);
	--text-color-kumo-default: var(--alpine-ink);
	--text-color-kumo-strong: #f6f4ef;
	--text-color-kumo-subtle: var(--alpine-muted);
	--text-color-kumo-inactive: var(--alpine-faint);
	--text-color-kumo-placeholder: var(--alpine-faint);
	--text-color-kumo-link: ${accent.darkText};
	--text-color-kumo-brand: ${accent.darkText};
	--text-color-kumo-success: var(--alpine-ok);
	--text-color-kumo-warning: var(--alpine-warn);
	--text-color-kumo-danger: var(--alpine-bad);
}

/* Square corners everywhere; spinners stay round. */
body *:not(.animate-spin, .spinner),
body *:not(.animate-spin, .spinner)::before,
body *:not(.animate-spin, .spinner)::after {
	border-radius: 0 !important;
}
/* Hairline rules instead of drop shadows. */
body .shadow-xs, body .shadow-sm, body .shadow, body .shadow-md, body .shadow-lg, body .shadow-xl {
	--tw-shadow: 0 0 #0000 !important;
}

/* Labels: small monospace caps. */
[data-sidebar="group-label"],
#admin-root th,
#admin-root label[for],
#admin-root label.font-medium,
#admin-root label.font-medium *,
#admin-root .gap-1\\.5 > .justify-between > span.font-medium.text-kumo-default {
	font-family: var(--alpine-mono);
	font-size: 10px;
	font-weight: 400;
	letter-spacing: 0.12em;
	text-transform: uppercase;
	color: var(--alpine-muted);
}
[data-sidebar="group-label"] {
	letter-spacing: 0.14em;
	color: var(--alpine-faint);
}
/* Sortable headers wrap their text in a button, which resets fonts and case. */
#admin-root th * {
	font: inherit;
	letter-spacing: inherit;
	text-transform: inherit;
}
/* Card and editor-panel titles. No data hook here, so this follows their
   classes; if they change, titles fall back to the body font. */
#admin-root .ring-kumo-hairline > .bg-kumo-elevated > h2,
#admin-root .p-4 > h3.font-semibold,
#admin-root .p-4 > .mb-4 > h3.font-semibold {
	font-family: var(--alpine-mono);
	font-size: 11px;
	font-weight: 400;
	letter-spacing: 0.14em;
	text-transform: uppercase;
	color: var(--alpine-ink);
}

/* Text the admin already sets in caps (dividers such as "Or continue with"). */
#admin-root .uppercase {
	font-family: var(--alpine-mono);
	letter-spacing: 0.12em;
}

/* Sidebar: surface panel, accent bar on the active item. */
aside[data-sidebar="sidebar"] {
	background: var(--alpine-surface);
	border-inline-end: 1px solid var(--alpine-rule);
}
[data-sidebar="menu-button"] {
	border-inline-start: 2px solid transparent;
	color: var(--alpine-muted);
}
[data-sidebar="menu-button"]:hover {
	color: var(--alpine-ink);
	background: var(--alpine-grid);
}
[data-sidebar="menu-button"][data-active="true"] {
	border-inline-start-color: var(--alpine-accent);
	background: var(--alpine-grid);
	color: var(--alpine-ink);
	font-weight: 500;
}

/* Top bar: one rule, paper behind it. */
#admin-root header.sticky {
	background: color-mix(in srgb, var(--alpine-paper) 88%, transparent);
	backdrop-filter: blur(10px);
	border-color: var(--alpine-rule);
}

/* Buttons: flat accent that turns ink on hover. The emphasis variant paints a
   gradient from these variables, which Kumo sets with a more specific
   selector; equal stops make it flat. */
[data-kumo-component="Button"],
[data-kumo-component="LinkButton"] {
	--kumo-button-emphasis-bg: var(--alpine-button) !important;
	--kumo-button-emphasis-gradient-start: var(--alpine-button) !important;
	--kumo-button-emphasis-gradient-end: var(--alpine-button) !important;
}
[data-kumo-component="Button"]:hover:not(:disabled),
[data-kumo-component="LinkButton"]:hover {
	--kumo-button-emphasis-bg: var(--alpine-ink) !important;
	--kumo-button-emphasis-gradient-start: var(--alpine-ink) !important;
	--kumo-button-emphasis-gradient-end: var(--alpine-ink) !important;
}
[data-kumo-component="Button"].bg-kumo-brand,
[data-kumo-component="LinkButton"].bg-kumo-brand {
	background-image: none;
	background-color: var(--alpine-button);
}
/* White on the lighter dark-mode accent is about 2.5:1; dark paper is about
   7.5:1. Kumo forces white with a layered !important on the button, so the
   color goes on its content, which would otherwise inherit that white. */
:root[data-mode="dark"] [data-kumo-component="Button"]:is(.bg-kumo-brand, [class*="kumo-button-emphasis-bg"]) > *,
:root[data-mode="dark"] [data-kumo-component="LinkButton"]:is(.bg-kumo-brand, [class*="kumo-button-emphasis-bg"]) > * {
	color: var(--alpine-paper);
}
[data-kumo-component="Button"].bg-kumo-brand:hover:not(:disabled),
[data-kumo-component="LinkButton"].bg-kumo-brand:hover {
	background-color: var(--alpine-ink);
	color: var(--alpine-paper);
}

/* Tabs: an accent underline on the active tab. */
[data-kumo-component="Tabs"][data-kumo-part="tab"][aria-selected="true"] {
	box-shadow: inset 0 -2px 0 var(--alpine-accent);
	color: var(--alpine-ink);
}

/* Inputs: paper, rule border, accent on focus. */
#admin-root input:focus-visible,
#admin-root textarea:focus-visible,
[data-slot="input-group"]:focus-within {
	--tw-ring-color: var(--alpine-accent);
}

/* The boot loader, before the app's styles apply. */
#emdash-boot-loader .spinner {
	border-top-color: ${accent.light};
}`;
}
