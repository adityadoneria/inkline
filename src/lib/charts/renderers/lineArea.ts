import * as d3 from 'd3';
import type { ChartConfig } from '../config';
import { formatValueForColumn, pickDateGranularity, formatDate } from '../format';
import { createTooltip, renderLegend, renderTitleBlock, type RenderContext } from './barColumn';

const MARGIN = { top: 32, right: 132, bottom: 40, left: 56 };
/** Below this width, end-of-line direct labels collapse into a traditional legend (Datawrapper's signature mobile behavior). */
const MOBILE_BREAKPOINT = 480;

export function renderLineArea(ctx: RenderContext) {
	const { svg, dataset, config, width, height } = ctx;
	const root = d3.select(svg);
	root.selectAll('*').remove();

	const xCol = dataset.columns.find((c) => c.id === config.xColumnId);
	const seriesCols = dataset.columns.filter((c) => config.seriesColumnIds.includes(c.id));
	if (!xCol || seriesCols.length === 0) return;

	const isDateAxis = xCol.type === 'date';
	const isMobile = width < MOBILE_BREAKPOINT;
	const rightMargin = isMobile || !config.style.showLegend ? 24 : MARGIN.right;
	const innerWidth = width - MARGIN.left - rightMargin;
	const innerHeight = height - MARGIN.top - MARGIN.bottom;

	const color = d3
		.scaleOrdinal<string>()
		.domain(seriesCols.map((c) => c.id))
		.range(config.style.palette);

	const xValues = dataset.rows.map((r) => r[xCol.id]);
	const xScale = isDateAxis
		? d3.scaleTime(
				d3.extent(xValues as number[]) as [number, number],
				[0, innerWidth]
			)
		: d3.scalePoint(
				xValues.map(String),
				[0, innerWidth]
			);

	const allValues = dataset.rows.flatMap((r) => seriesCols.map((c) => Number(r[c.id] ?? 0)));
	const maxValue = d3.max(allValues) ?? 0;
	const minValue = config.lineOptions.logScale ? Math.max(1, d3.min(allValues) ?? 1) : Math.min(0, d3.min(allValues) ?? 0);
	const yScale = (config.lineOptions.logScale ? d3.scaleLog() : d3.scaleLinear())
		.domain([minValue, maxValue])
		.nice()
		.range([innerHeight, 0]);

	const g = root
		.attr('width', width)
		.attr('height', height)
		.attr('viewBox', `0 0 ${width} ${height}`)
		.append('g')
		.attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

	// Axes
	let xAxis;
	if (isDateAxis) {
		const span = (d3.extent(xValues as number[])[1] ?? 0) - (d3.extent(xValues as number[])[0] ?? 0);
		const granularity = pickDateGranularity(span);
		xAxis = d3.axisBottom(xScale as d3.ScaleTime<number, number>).tickFormat((d) => formatDate(+d, granularity));
	} else {
		xAxis = d3.axisBottom(xScale as d3.ScalePoint<string>);
	}

	g.append('g')
		.attr('transform', `translate(0,${innerHeight})`)
		.call(xAxis as never)
		.selectAll('text')
		.attr('font-size', 11)
		.attr('fill', 'currentColor');

	g.append('g')
		.call(d3.axisLeft(yScale).ticks(6) as never)
		.selectAll('text')
		.attr('font-size', 11)
		.attr('fill', 'currentColor');

	g.selectAll('.domain, .tick line').attr('stroke', 'currentColor').attr('stroke-opacity', 0.25);

	const xAccessor = (row: Record<string, unknown>) =>
		isDateAxis ? (xScale as d3.ScaleTime<number, number>)(row[xCol.id] as number) : (xScale as d3.ScalePoint<string>)(String(row[xCol.id]))!;

	const curve = config.lineOptions.interpolation === 'smooth' ? d3.curveMonotoneX : d3.curveLinear;

	const tooltip = createTooltip(svg.parentElement!);

	seriesCols.forEach((col) => {
		const line = d3
			.line<Record<string, unknown>>()
			.defined((row) => row[col.id] !== null && row[col.id] !== undefined)
			.x(xAccessor)
			.y((row) => yScale(Number(row[col.id])))
			.curve(curve);

		if (config.lineOptions.areaFill) {
			const area = d3
				.area<Record<string, unknown>>()
				.defined((row) => row[col.id] !== null && row[col.id] !== undefined)
				.x(xAccessor)
				.y0(innerHeight)
				.y1((row) => yScale(Number(row[col.id])))
				.curve(curve);

			g.append('path')
				.datum(dataset.rows)
				.attr('d', area)
				.attr('fill', color(col.id))
				.attr('fill-opacity', config.lineOptions.areaOpacity);
		}

		g.append('path')
			.datum(dataset.rows)
			.attr('d', line)
			.attr('fill', 'none')
			.attr('stroke', color(col.id))
			.attr('stroke-width', 2);

		if (config.lineOptions.showDots) {
			g.selectAll(`.dot-${col.id}`)
				.data(dataset.rows.filter((r) => r[col.id] !== null))
				.join('circle')
				.attr('cx', xAccessor)
				.attr('cy', (row) => yScale(Number(row[col.id])))
				.attr('r', 3)
				.attr('fill', color(col.id))
				.on('mousemove', (event, row) =>
					tooltip.show(event, `${col.name}: ${formatValueForColumn(Number(row[col.id]), col)}`)
				)
				.on('mouseleave', () => tooltip.hide());
		}

		// Invisible wider hit-area for tooltips even without dots
		g.selectAll(`.hit-${col.id}`)
			.data(dataset.rows.filter((r) => r[col.id] !== null))
			.join('circle')
			.attr('cx', xAccessor)
			.attr('cy', (row) => yScale(Number(row[col.id])))
			.attr('r', 8)
			.attr('fill', 'transparent')
			.on('mousemove', (event, row) =>
				tooltip.show(event, `${col.name}: ${formatValueForColumn(Number(row[col.id]), col)}`)
			)
			.on('mouseleave', () => tooltip.hide());

		// Direct end-of-line label (signature Datawrapper behavior) unless collapsed to legend on mobile
		if (!isMobile && config.style.showLegend) {
			const lastRow = [...dataset.rows].reverse().find((r) => r[col.id] !== null);
			if (lastRow) {
				g.append('text')
					.attr('x', xAccessor(lastRow) + 6)
					.attr('y', yScale(Number(lastRow[col.id])))
					.attr('dy', '0.32em')
					.attr('font-size', 11)
					.attr('fill', color(col.id))
					.text(`${col.name} ${formatValueForColumn(Number(lastRow[col.id]), col)}`);
			}
		}
	});

	if (isMobile && config.style.showLegend && seriesCols.length > 1) {
		renderLegend(root, seriesCols, color, width);
	}

	renderTitleBlock(root, config, width);
}
