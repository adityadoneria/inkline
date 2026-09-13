import * as d3 from 'd3';
import type { ChartConfig } from '../config';

const TITLE_HEIGHT = 22;
const SUBTITLE_HEIGHT = 18;
const LEGEND_HEIGHT = 22;
const FOOTER_HEIGHT = 18;
const GRID_COLOR = '#000000';
const GRID_OPACITY = 0.08;
const AXIS_TEXT_COLOR = '#6b7280';

export interface ChartLayout {
	top: number;
	right: number;
	bottom: number;
	left: number;
	legendY: number;
}

/** Reserve vertical space for title/subtitle/legend up top and the footer at the bottom, mirroring how Datawrapper composes a chart image as one self-contained block rather than a bordered widget. */
export function computeLayout(config: ChartConfig, showLegend: boolean, opts?: { right?: number; left?: number }): ChartLayout {
	const { title, subtitle, source, footerNote } = config.style;
	let top = 6;
	if (title) top += TITLE_HEIGHT;
	if (subtitle) top += SUBTITLE_HEIGHT;
	const legendY = top;
	if (showLegend) top += LEGEND_HEIGHT;

	let bottom = 28;
	if (source || footerNote) bottom += FOOTER_HEIGHT;

	return {
		top,
		bottom,
		right: opts?.right ?? 16,
		left: opts?.left ?? 48,
		legendY
	};
}

/** Light horizontal-only gridlines behind the marks, with no chart border and no vertical gridlines — the signature Datawrapper background treatment. */
export function renderHorizontalGridlines(
	g: d3.Selection<SVGGElement, unknown, null, undefined>,
	yScale: d3.ScaleLinear<number, number> | d3.ScaleLogarithmic<number, number>,
	innerWidth: number,
	tickCount = 6
) {
	g.append('g')
		.attr('class', 'gridlines')
		.selectAll('line')
		.data(yScale.ticks(tickCount))
		.join('line')
		.attr('x1', 0)
		.attr('x2', innerWidth)
		.attr('y1', (d) => yScale(d))
		.attr('y2', (d) => yScale(d))
		.attr('stroke', GRID_COLOR)
		.attr('stroke-opacity', GRID_OPACITY)
		.attr('shape-rendering', 'crispEdges');
}

/** Bare axis: no domain line, no tick marks — just muted labels, matching Datawrapper's borderless chart frame. */
export function styleBareAxis(selection: d3.Selection<SVGGElement, unknown, null, undefined>, fontSize = 11) {
	selection.select('.domain').remove();
	selection.selectAll('.tick line').remove();
	selection.selectAll('text').attr('font-size', fontSize).attr('fill', AXIS_TEXT_COLOR);
}

export function renderLegend(
	root: d3.Selection<SVGSVGElement, unknown, null, undefined>,
	seriesCols: { id: string; name: string }[],
	color: d3.ScaleOrdinal<string, string>,
	x: number,
	y: number
) {
	const legend = root.append('g').attr('class', 'legend').attr('font-size', 11.5).attr('transform', `translate(${x},${y})`);
	let xOffset = 0;
	seriesCols.forEach((col) => {
		const item = legend.append('g').attr('transform', `translate(${xOffset},0)`);
		item.append('rect').attr('width', 9).attr('height', 9).attr('rx', 2).attr('y', 1).attr('fill', color(col.id));
		item.append('text').attr('x', 14).attr('y', 9).attr('fill', AXIS_TEXT_COLOR).text(col.name);
		xOffset += 14 + col.name.length * 6.5 + 18;
	});
}

export function renderTitleBlock(
	root: d3.Selection<SVGSVGElement, unknown, null, undefined>,
	config: ChartConfig,
	height: number
) {
	const { title, subtitle, source, footerNote } = config.style;
	if (title) {
		root
			.append('text')
			.attr('x', 0)
			.attr('y', 16)
			.attr('font-size', 15)
			.attr('font-weight', 700)
			.attr('fill', 'currentColor')
			.text(title);
	}
	if (subtitle) {
		root
			.append('text')
			.attr('x', 0)
			.attr('y', title ? TITLE_HEIGHT + 12 : 14)
			.attr('font-size', 12)
			.attr('fill', AXIS_TEXT_COLOR)
			.text(subtitle);
	}
	const footerParts = [source, footerNote].filter(Boolean).join('  •  ');
	if (footerParts) {
		root
			.append('text')
			.attr('x', 0)
			.attr('y', height - 8)
			.attr('font-size', 10.5)
			.attr('fill', AXIS_TEXT_COLOR)
			.text(footerParts);
	}
}
