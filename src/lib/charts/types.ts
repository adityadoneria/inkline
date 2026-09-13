export type ChartTypeId =
	| 'bar'
	| 'column'
	| 'line'
	| 'area'
	| 'pie'
	| 'donut'
	| 'scatter'
	| 'table';

export interface ChartTypeDef {
	id: ChartTypeId;
	label: string;
	family: 'bar-column' | 'line-area' | 'pie-donut' | 'point' | 'table' | 'map';
	/** Whether this type has shipped a renderer yet (spec §4 lists many more than Phase 1 implements). */
	implemented: boolean;
	minSeries: number;
	description: string;
}

export const chartTypes: ChartTypeDef[] = [
	{
		id: 'bar',
		label: 'Bar Chart',
		family: 'bar-column',
		implemented: true,
		minSeries: 1,
		description: 'Horizontal bars — best for ranking categories.'
	},
	{
		id: 'column',
		label: 'Column Chart',
		family: 'bar-column',
		implemented: true,
		minSeries: 1,
		description: 'Vertical bars — best for comparing a few categories.'
	},
	{
		id: 'line',
		label: 'Line Chart',
		family: 'line-area',
		implemented: true,
		minSeries: 1,
		description: 'Trends over time or an ordered axis.'
	},
	{
		id: 'area',
		label: 'Area Chart',
		family: 'line-area',
		implemented: true,
		minSeries: 1,
		description: 'A line chart with the area beneath it filled.'
	},
	{
		id: 'pie',
		label: 'Pie Chart',
		family: 'pie-donut',
		implemented: false,
		minSeries: 1,
		description: 'Part-to-whole comparison across few categories.'
	},
	{
		id: 'donut',
		label: 'Donut Chart',
		family: 'pie-donut',
		implemented: false,
		minSeries: 1,
		description: 'Pie chart with a hollow center.'
	},
	{
		id: 'scatter',
		label: 'Scatter Plot',
		family: 'point',
		implemented: false,
		minSeries: 2,
		description: 'Correlation between two numeric variables.'
	},
	{
		id: 'table',
		label: 'Table',
		family: 'table',
		implemented: false,
		minSeries: 1,
		description: 'Styled data table with inline bars/sparklines.'
	}
];

export function suggestChartType(numericCols: number, dateCols: number, categoryCols: number): ChartTypeId {
	if (dateCols >= 1 && numericCols >= 1) return 'line';
	if (numericCols === 2 && categoryCols === 0) return 'scatter';
	if (categoryCols >= 1 && numericCols >= 1) return 'column';
	return 'column';
}
