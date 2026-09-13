import * as d3 from 'd3';
import type { Dataset } from '../../data/types';
import type { ChartConfig } from '../config';
import { formatValueForColumn } from '../format';
import { computeLayout, renderHorizontalGridlines, styleBareAxis, renderLegend, renderTitleBlock } from './layout';

export interface RenderContext {
	svg: SVGSVGElement;
	dataset: Dataset;
	config: ChartConfig;
	width: number;
	height: number;
}

export function renderBarColumn(ctx: RenderContext) {
	const { svg, dataset, config, width, height } = ctx;
	const root = d3.select(svg);
	root.selectAll('*').remove();

	const xCol = dataset.columns.find((c) => c.id === config.xColumnId);
	const seriesCols = dataset.columns.filter((c) => config.seriesColumnIds.includes(c.id));
	if (!xCol || seriesCols.length === 0) return;

	const horizontal = config.type === 'bar';
	const showLegend = config.style.showLegend && seriesCols.length > 1;
	const layout = computeLayout(config, showLegend, { right: 16, left: horizontal ? 96 : 48 });
	const innerWidth = width - layout.left - layout.right;
	const innerHeight = height - layout.top - layout.bottom;

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

	root.attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`);

	renderTitleBlock(root, config, height);
	if (showLegend) renderLegend(root, seriesCols, color, 0, layout.legendY);

	const g = root.append('g').attr('transform', `translate(${layout.left},${layout.top})`);

	// Gridlines sit behind the marks; only along the value axis (horizontal-only, Datawrapper-style).
	renderHorizontalGridlines(g, valueScale as d3.ScaleLinear<number, number>, horizontal ? innerWidth : innerWidth, 6);

	// Axes — bare (no domain/tick lines), muted label color.
	const categoryAxis = horizontal ? d3.axisLeft(categoryScale) : d3.axisBottom(categoryScale);
	const valueAxis = horizontal ? d3.axisBottom(valueScale) : d3.axisLeft(valueScale);

	const categoryAxisG = g
		.append('g')
		.attr('class', 'category-axis')
		.attr('transform', horizontal ? '' : `translate(0,${innerHeight})`)
		.call(categoryAxis as never);
	styleBareAxis(categoryAxisG);

	const valueAxisG = g
		.append('g')
		.attr('class', 'value-axis')
		.attr('transform', horizontal ? `translate(0,${innerHeight})` : '')
		.call(valueAxis as never);
	styleBareAxis(valueAxisG);

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
		.attr('rx', 1.5)
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
