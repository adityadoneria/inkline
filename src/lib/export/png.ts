import { serializeSvg, triggerDownload } from './svg';

export interface PngExportOptions {
	scale: 1 | 2 | 3 | number;
	transparent: boolean;
	format?: 'png' | 'jpeg';
}

/** Rasterize an SVG chart to PNG/JPEG entirely client-side via canvas. */
export async function exportRaster(
	svg: SVGSVGElement,
	filename: string,
	options: PngExportOptions
): Promise<void> {
	const svgText = serializeSvg(svg);
	const width = svg.viewBox.baseVal.width || svg.clientWidth;
	const height = svg.viewBox.baseVal.height || svg.clientHeight;

	const image = await loadSvgAsImage(svgText);
	const canvas = document.createElement('canvas');
	canvas.width = width * options.scale;
	canvas.height = height * options.scale;
	const context = canvas.getContext('2d')!;

	if (!options.transparent || options.format === 'jpeg') {
		context.fillStyle = 'white';
		context.fillRect(0, 0, canvas.width, canvas.height);
	}

	context.drawImage(image, 0, 0, canvas.width, canvas.height);

	const mime = options.format === 'jpeg' ? 'image/jpeg' : 'image/png';
	const blob: Blob = await new Promise((resolve, reject) =>
		canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('canvas.toBlob failed'))), mime, 0.95)
	);
	triggerDownload(blob, filename);
}

function loadSvgAsImage(svgText: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const img = new Image();
		img.onload = () => {
			URL.revokeObjectURL(url);
			resolve(img);
		};
		img.onerror = (err) => {
			URL.revokeObjectURL(url);
			reject(err);
		};
		img.src = url;
	});
}

/** Copy the rendered chart to the clipboard as an image, for pasting into Slack/Docs/PowerPoint. */
export async function copyChartToClipboard(svg: SVGSVGElement): Promise<void> {
	const svgText = serializeSvg(svg);
	const width = svg.viewBox.baseVal.width || svg.clientWidth;
	const height = svg.viewBox.baseVal.height || svg.clientHeight;
	const image = await loadSvgAsImage(svgText);

	const canvas = document.createElement('canvas');
	canvas.width = width * 2;
	canvas.height = height * 2;
	const context = canvas.getContext('2d')!;
	context.fillStyle = 'white';
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.drawImage(image, 0, 0, canvas.width, canvas.height);

	const blob: Blob = await new Promise((resolve, reject) =>
		canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('canvas.toBlob failed'))), 'image/png')
	);

	await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
}
