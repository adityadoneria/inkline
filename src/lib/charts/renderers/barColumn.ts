import * as d3 from 'd3';
import type { Dataset } from '../../data/types';
import type { ChartConfig } from '../config';
import { formatValueForColumn } from '../format';

export interface RenderContext {
	svg: SVGSVGElement;
	dataset: Dataset;
	config: ChartConfig;
	width: number;
	height: number;
}

const MARGIN = { top: 32, right: 24, bottom: 48, left: 64 };

export function renderBarColumn(ctx: RenderContext) {
	const { svg, dataset, config, width, height } = ctx;
	const root = d3.select(svg);
	root.selectAll('*').remove();

	const xCol = dataset.columns.find((c) => c.id === config.xColumnId);
	const seriesCols = dataset.columns.filter((c) => config.seriesColumnIds.includes(c.id));
	if (!xCol || seriesCols.length === 0) return;

	const horizontal = config.type === 'bar';
	const innerWidth = width - MARGIN.left - MARGIN.right;
	const innerHeight = height - MARGIN.top - MARGIN.bottom;

	const categories = dataset.rows.map((r) => String(r[xCol.id] ?? ''));
	const color = d3.scaleOrdinal<string>().domain(seriesCols.map((c) => c.id)).range(config.style.palette);

	const maxValue =
		d3.max(dataset.rows, (r) => d3.max(seriesCols, (c) => Number(r[c.id] ?? 0))) ?? 0;
	const valueScale = d3
		.scaleLinear()
		.domain([Math.min(0, maxValue), maxValue])
		.nice()
		.range(horizontal ? [0, innerWidth] : [innerHeight, 0]);

	const categoryScale = d3
		.scaleBand()
		.domain(categories)
		.range(horizontal ? [0, innerHeight] : [0, innerWidth])
		.padding(0.25);

	const seriesScale = d3
		.scaleBand()
		.domain(seriesCols.map((c) => c.id))
		.range([0, categoryScale.bandwidth()])
		.padding(0.08);

	const g = root
		.attr('width', width)
		.attr('height', height)
		.attr('viewBox', `0 0 ${width} ${height}`)
		.append('g')
		.attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

	// Axes
	const categoryAxis = horizontal ? d3.axisLeft(categoryScale) : d3.axisBottom(categoryScale);
	const valueAxis = horizontal ? d3.axisBottom(valueScale) : d3.axisLeft(valueScale);

	g.append('g')
		.attr('class', 'category-axis')
		.attr('transform', horizontal ? '' : `translate(0,${innerHeight})`)
		.call(categoryAxis as never)
		.selectAll('text')
		.attr('font-size', 12)
		.attr('fill', 'currentColor');

	g.append('g')
		.attr('class', 'value-axis')
		.attr('transform', horizontal ? `translate(0,${innerHeight})` : '')
		.call(valueAxis as never)
		.selectAll('text')
		.attr('font-size', 12)
		.attr('fill', 'currentColor');

	g.selectAll('.domain, .tick line').attr('stroke', 'currentColor').attr('stroke-opacity', 0.25);

	// Zero baseline
	if (maxValue > 0) {
		const zero = horizontal ? valueScale(0) : valueScale(0);
		if (horizontal) {
			g.append('line').attr('x1', zero).attr('x2', zero).attr('y1', 0).attr('y2', innerHeight).attr('stroke', 'currentColor').attr('stroke-opacity', 0.4);
		}
	}

	const tooltip = createTooltip(svg.parentElement!);

	// Bars
	const rowGroups = g
		.selectAll('.row')
		.data(dataset.rows)
		.join('g')
		.attr('class', 'row')
		.attr('transform', (_d, i) =>
			horizontal ? `translate(0,${categoryScale(categories[i])})` : `translate(${categoryScale(categories[i])},0)`
		);

	rowGroups
		.selectAll('rect')
		.data((row) => seriesCols.map((c) => ({ col: c, value: Number(row[c.id] ?? 0), row })))
		.join('rect')
		.attr('fill', (d) => color(d.col.id))
		.attr('rx', 2)
		.attr('x', (d) => (horizontal ? 0 : (seriesScale(d.col.id) as number)))
		.attr('y', (d) => (horizontal ? (seriesScale(d.col.id) as number) : valueScale(Math.max(0, d.value))))
		.attr('width', (d) => (horizontal ? Math.abs(valueScale(d.value) - valueScale(0)) : seriesScale.bandwidth()))
		.attr('height', (d) =>
			horizontal ? seriesScale.bandwidth() : Math.abs(valueScale(d.value) - valueScale(0))
		)
		.on('mousemove', (event, d) => {
			tooltip.show(event, `${d.col.name}: ${formatValueForColumn(d.value, d.col)}`);
		})
		.on('mouseleave', () => tooltip.hide());

	if (config.style.showLegend && seriesCols.length > 1) {
		renderLegend(root, seriesCols, color, width);
	}

	renderTitleBlock(root, config, width);
}

export function createTooltip(container: HTMLElement) {
	let el = container.querySelector<HTMLDivElement>('.inkline-tooltip');
	if (!el) {
		el = document.createElement('div');
		el.className = 'inkline-tooltip';
		Object.assign(el.style, {
			position: 'absolute',
			pointerEvents: 'none',
			background: 'rgba(17,24,39,0.92)',
			color: 'white',
			padding: '4px 8px',
			borderRadius: '4px',
			fontSize: '12px',
			fontFamily: 'system-ui, sans-serif',
			opacity: '0',
			transition: 'opacity 0.1s',
			zIndex: '10',
			whiteSpace: 'nowrap'
		} satisfies Partial<CSSStyleDeclaration>);
		container.style.position = 'relative';
		container.appendChild(el);
	}
	return {
		show(event: MouseEvent, text: string) {
			el!.textContent = text;
			el!.style.opacity = '1';
			const rect = container.getBoundingClientRect();
			el!.style.left = `${event.clientX - rect.left + 12}px`;
			el!.style.top = `${event.clientY - rect.top - 24}px`;
		},
		hide() {
			el!.style.opacity = '0';
		}
	};
}

export function renderLegend(
	root: d3.Selection<SVGSVGElement, unknown, null, undefined>,
	seriesCols: { id: string; name: string }[],
	color: d3.ScaleOrdinal<string, string>,
	width: number
) {
	const legend = root.append('g').attr('class', 'legend').attr('font-size', 12);
	let xOffset = 0;
	seriesCols.forEach((col) => {
		const item = legend.append('g').attr('transform', `translate(${xOffset},12)`);
		item.append('rect').attr('width', 10).attr('height', 10).attr('rx', 2).attr('fill', color(col.id));
		item
			.append('text')
			.attr('x', 16)
			.attr('y', 9)
			.attr('fill', 'currentColor')
			.text(col.name);
		xOffset += 16 + col.name.length * 7 + 16;
	});
	legend.attr('transform', `translate(${width - xOffset - 8}, 0)`);
}

export function renderTitleBlock(
	root: d3.Selection<SVGSVGElement, unknown, null, undefined>,
	config: ChartConfig,
	width: number
) {
	const { title, subtitle, source, footerNote } = config.style;
	if (title) {
		root
			.append('text')
			.attr('x', 8)
			.attr('y', 18)
			.attr('font-size', 16)
			.attr('font-weight', 600)
			.attr('fill', 'currentColor')
			.text(title);
	}
	if (subtitle) {
		root
			.append('text')
			.attr('x', 8)
			.attr('y', title ? 34 : 18)
			.attr('font-size', 12)
			.attr('fill', 'currentColor')
			.attr('opacity', 0.7)
			.text(subtitle);
	}
	const footerParts = [source, footerNote].filter(Boolean).join(' • ');
	if (footerParts) {
		root
			.append('text')
			.attr('x', 8)
			.attr('y', '100%')
			.attr('dy', -6)
			.attr('font-size', 10)
			.attr('fill', 'currentColor')
			.attr('opacity', 0.6)
			.text(footerParts);
	}
}
