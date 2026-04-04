/**
 * Lazy-loaded wrapper for cli-highlight.
 *
 * cli-highlight + highlight.js load 380+ language grammars on import,
 * costing ~400ms. This module defers that cost until first use
 * (when code actually needs syntax highlighting).
 */

let _highlight: typeof import("cli-highlight").highlight | undefined;
let _supportsLanguage: typeof import("cli-highlight").supportsLanguage | undefined;
let _loaded = false;

function ensureLoaded(): void {
	if (_loaded) return;
	_loaded = true;
	try {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const mod = require("cli-highlight") as typeof import("cli-highlight");
		_highlight = mod.highlight;
		_supportsLanguage = mod.supportsLanguage;
	} catch {
		// If cli-highlight is not available, functions will return fallbacks
	}
}

export function highlight(
	code: string,
	options: { language?: string; ignoreIllegals?: boolean; theme?: unknown },
): string {
	ensureLoaded();
	if (_highlight) {
		return _highlight(code, options as Parameters<typeof _highlight>[1]);
	}
	return code;
}

export function supportsLanguage(lang: string): boolean {
	ensureLoaded();
	if (_supportsLanguage) {
		return _supportsLanguage(lang);
	}
	return false;
}
