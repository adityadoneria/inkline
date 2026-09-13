import type { ColumnFormat, DataColumn } from '../data/types';

export function formatNumber(value: number, format?: ColumnFormat): string {
	const decimals = format?.decimals ?? (Number.isInteger(value) ? 0 : 2);
	let text = value.toLocaleString(undefined, {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
		useGrouping: format?.thousandsSeparator ?? true
	});
	if (format?.unit) text = `${text}${format.unit}`;
	return text;
}

export function formatValueForColumn(value: number, column: DataColumn | undefined): string {
	if (!column) return String(value);
	if (column.type === 'date') return formatDate(value, 'day');
	if (column.type === 'percent') return `${formatNumber(value, column.format)}%`;
	return formatNumber(value, column.format);
}

const dateTickFormatters = {
	year: new Intl.DateTimeFormat(undefined, { year: 'numeric' }),
	month: new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }),
	day: new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' })
};

export function formatDate(ms: number, granularity: 'year' | 'month' | 'day' = 'month'): string {
	return dateTickFormatters[granularity].format(new Date(ms));
}

/** Choose a sensible date tick granularity from the span of a date axis, mirroring Datawrapper's auto tick behavior. */
export function pickDateGranularity(spanMs: number): 'year' | 'month' | 'day' {
	const day = 86_400_000;
	if (spanMs > 3 * 365 * day) return 'year';
	if (spanMs > 60 * day) return 'month';
	return 'day';
}
