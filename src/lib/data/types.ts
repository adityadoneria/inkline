export type ColumnType = 'number' | 'date' | 'string' | 'percent';

export interface ColumnFormat {
	/** Currency symbol, unit suffix, etc. Applied after number formatting. */
	unit?: string;
	decimals?: number;
	thousandsSeparator?: boolean;
	dateFormat?: string;
}

export interface DataColumn {
	id: string;
	name: string;
	type: ColumnType;
	format?: ColumnFormat;
}

export type CellValue = string | number | null;

export interface Dataset {
	columns: DataColumn[];
	/** Row-major: rows[rowIndex][columnId] */
	rows: Record<string, CellValue>[];
}

export interface ValidationWarning {
	rowIndex: number;
	columnId: string;
	kind: 'missing' | 'mixed-type' | 'non-numeric';
	message: string;
}
