import type { ChartTypeId } from './types';

export interface ChartStyle {
	palette: string[];
	fontFamily: string;
	title: string;
	subtitle: string;
	source: string;
	footerNote: string;
	responsive: boolean;
	fixedWidth: number;
	fixedHeight: number;
	darkMode: boolean;
	showLegend: boolean;
}

export interface ChartConfig {
	type: ChartTypeId;
	/** Column id used for the category/x axis. */
	xColumnId: string | null;
	/** Column ids used as numeric series (y values). */
	seriesColumnIds: string[];
	style: ChartStyle;
	lineOptions: {
		interpolation: 'linear' | 'smooth';
		areaFill: boolean;
		areaOpacity: number;
		showDots: boolean;
		logScale: boolean;
	};
}

export const defaultPalette = [
	'#2563eb',
	'#dc2626',
	'#16a34a',
	'#d97706',
	'#7c3aed',
	'#0891b2',
	'#db2777',
	'#65a30d'
];

export function defaultChartConfig(type: ChartTypeId = 'column'): ChartConfig {
	return {
		type,
		xColumnId: null,
		seriesColumnIds: [],
		style: {
			palette: defaultPalette,
			fontFamily: 'system-ui, sans-serif',
			title: '',
			subtitle: '',
			source: '',
			footerNote: '',
			responsive: true,
			fixedWidth: 640,
			fixedHeight: 420,
			darkMode: false,
			showLegend: true
		},
		lineOptions: {
			interpolation: 'linear',
			areaFill: type === 'area',
			areaOpacity: 0.25,
			showDots: false,
			logScale: false
		}
	};
}
