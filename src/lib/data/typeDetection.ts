import type { CellValue, ColumnType } from './types';

const DATE_PATTERNS = [
	/^\d{4}-\d{2}-\d{2}/, // 2024-01-31
	/^\d{1,2}\/\d{1,2}\/\d{2,4}$/, // 1/31/2024
	/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}$/i // "Jan 2024"
];

// A bare 4-digit number is only treated as a year if it falls in a plausible calendar
// range — otherwise any numeric column whose values happen to be 4 digits (population
// counts, prices, IDs, ...) gets misclassified as a date column.
const BARE_YEAR_RANGE: [number, number] = [1500, 2100];

export function looksLikeDate(value: string): boolean {
	const trimmed = value.trim();
	if (!trimmed) return false;

	if (/^\d{4}$/.test(trimmed)) {
		const year = Number(trimmed);
		return year >= BARE_YEAR_RANGE[0] && year <= BARE_YEAR_RANGE[1];
	}

	if (DATE_PATTERNS.some((p) => p.test(trimmed))) {
		return !Number.isNaN(Date.parse(trimmed));
	}
	return false;
}

export function looksLikePercent(value: string): boolean {
	return /^-?[\d.,]+\s*%$/.test(value.trim());
}

export function looksLikeNumber(value: string): boolean {
	const cleaned = value.trim().replace(/,/g, '');
	if (cleaned === '') return false;
	return !Number.isNaN(Number(cleaned));
}

/** Infer a column's type from a sample of raw string values. */
export function detectColumnType(values: string[]): ColumnType {
	const nonEmpty = values.map((v) => v.trim()).filter((v) => v !== '');
	if (nonEmpty.length === 0) return 'string';

	const dateCount = nonEmpty.filter(looksLikeDate).length;
	if (dateCount / nonEmpty.length > 0.8) return 'date';

	const percentCount = nonEmpty.filter(looksLikePercent).length;
	if (percentCount / nonEmpty.length > 0.8) return 'percent';

	const numberCount = nonEmpty.filter(looksLikeNumber).length;
	if (numberCount / nonEmpty.length > 0.8) return 'number';

	return 'string';
}

export function parseCellForType(raw: string, type: ColumnType): CellValue {
	const trimmed = raw.trim();
	if (trimmed === '') return null;

	switch (type) {
		case 'number':
			return Number(trimmed.replace(/,/g, ''));
		case 'percent':
			return Number(trimmed.replace(/%/g, '').replace(/,/g, '').trim());
		case 'date': {
			const ms = Date.parse(trimmed);
			return Number.isNaN(ms) ? trimmed : ms;
		}
		default:
			return trimmed;
	}
}
