/** Serialize a live chart SVG element to a standalone SVG string with inlined namespace/styles. */
export function serializeSvg(svg: SVGSVGElement): string {
	const clone = svg.cloneNode(true) as SVGSVGElement;
	clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
	clone.setAttribute('color', getComputedStyle(svg).color || '#111827');
	clone.style.color = getComputedStyle(svg).color || '#111827';
	clone.style.background = 'white';
	return new XMLSerializer().serializeToString(clone);
}

export function downloadSvg(svg: SVGSVGElement, filename: string) {
	const text = serializeSvg(svg);
	const blob = new Blob([text], { type: 'image/svg+xml' });
	triggerDownload(blob, filename);
}

export function triggerDownload(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}
