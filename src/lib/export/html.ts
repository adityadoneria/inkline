import { serializeSvg, triggerDownload } from './svg';

/**
 * Self-contained interactive HTML export: inlines the rendered SVG plus a small
 * postMessage-based auto-resize script, so the file works offline and can be
 * embedded via <iframe srcdoc="..."> with no external dependency (spec §9).
 */
export function buildStandaloneHtml(svg: SVGSVGElement, title: string): string {
	const svgMarkup = serializeSvg(svg);
	const width = svg.viewBox.baseVal.width || svg.clientWidth;
	const height = svg.viewBox.baseVal.height || svg.clientHeight;

	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title || 'Inkline chart')}</title>
<style>
	html, body { margin: 0; padding: 0; }
	svg { width: 100%; height: auto; display: block; font-family: system-ui, sans-serif; }
</style>
</head>
<body>
${svgMarkup}
<script>
	// Notify a parent frame of this chart's natural height so it can auto-resize the iframe.
	function reportSize() {
		var height = document.documentElement.scrollHeight;
		if (window.parent !== window) {
			window.parent.postMessage({ type: 'inkline-resize', height: height }, '*');
		}
	}
	window.addEventListener('load', reportSize);
	window.addEventListener('resize', reportSize);
</script>
</body>
</html>`;
}

export function downloadStandaloneHtml(svg: SVGSVGElement, title: string, filename: string) {
	const html = buildStandaloneHtml(svg, title);
	const blob = new Blob([html], { type: 'text/html' });
	triggerDownload(blob, filename);
}

export function buildIframeEmbedSnippet(svg: SVGSVGElement, title: string): string {
	const html = buildStandaloneHtml(svg, title);
	const width = svg.viewBox.baseVal.width || svg.clientWidth;
	const height = svg.viewBox.baseVal.height || svg.clientHeight;
	return `<iframe title="${escapeHtml(title || 'Inkline chart')}" srcdoc="${escapeHtml(html)}" width="${width}" height="${height}" style="border:0;width:100%;" loading="lazy"></iframe>`;
}

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}
