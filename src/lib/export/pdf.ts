import { triggerDownload } from './svg';

// jspdf/svg2pdf.js assume a browser environment at module-init time, which breaks
// SvelteKit's SSR prerendering step — load them lazily, only when actually exporting.
async function loadPdfLibs() {
	const [{ jsPDF }, { svg2pdf }] = await Promise.all([import('jspdf'), import('svg2pdf.js')]);
	return { jsPDF, svg2pdf };
}

/** Export a single chart to PDF, client-side, via SVG->PDF conversion. */
export async function exportChartPdf(svg: SVGSVGElement, filename: string): Promise<void> {
	const { jsPDF, svg2pdf } = await loadPdfLibs();
	const width = svg.viewBox.baseVal.width || svg.clientWidth;
	const height = svg.viewBox.baseVal.height || svg.clientHeight;

	const doc = new jsPDF({
		orientation: width >= height ? 'landscape' : 'portrait',
		unit: 'pt',
		format: [width, height]
	});

	await svg2pdf(svg, doc, { x: 0, y: 0, width, height });
	triggerDownload(doc.output('blob'), filename);
}

/** Combine several charts (already-rendered SVG elements) into one multi-page PDF. */
export async function exportBatchPdf(svgs: SVGSVGElement[], filename: string): Promise<void> {
	if (svgs.length === 0) return;
	const { jsPDF, svg2pdf } = await loadPdfLibs();

	const dims = (svg: SVGSVGElement) => ({
		width: svg.viewBox.baseVal.width || svg.clientWidth,
		height: svg.viewBox.baseVal.height || svg.clientHeight
	});

	const first = dims(svgs[0]);
	const doc = new jsPDF({
		orientation: first.width >= first.height ? 'landscape' : 'portrait',
		unit: 'pt',
		format: [first.width, first.height]
	});

	for (let i = 0; i < svgs.length; i++) {
		const { width, height } = dims(svgs[i]);
		if (i > 0) doc.addPage([width, height], width >= height ? 'landscape' : 'portrait');
		await svg2pdf(svgs[i], doc, { x: 0, y: 0, width, height });
	}

	triggerDownload(doc.output('blob'), filename);
}
