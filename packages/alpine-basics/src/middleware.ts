import type { MiddlewareHandler } from "astro";

const SHORTCUT = "/__admin";
const LEADING_SLASHES = /^\/+/;

/** Where a /__admin path goes in the EmDash admin, or undefined for any other path. */
export function adminShortcutTarget(pathname: string, search = ""): string | undefined {
	if (pathname !== SHORTCUT && !pathname.startsWith(`${SHORTCUT}/`)) return undefined;
	const rest = pathname.slice(SHORTCUT.length).replace(LEADING_SLASHES, "");
	return `/_emdash/admin/${rest}${search}`;
}

// A middleware rather than Astro `redirects`: the Cloudflare adapter writes
// those to _redirects, which Workers rejects for a catch-all like this one.
export const onRequest: MiddlewareHandler = (context, next) => {
	const target = adminShortcutTarget(context.url.pathname, context.url.search);
	return target ? context.redirect(target, 301) : next();
};
