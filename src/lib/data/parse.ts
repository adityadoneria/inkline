import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { detectColumnType, parseCellForType } from './typeDetection';
import type { Dataset, DataColumn } from './types';

function columnsFromHeader(header: string[]): DataColumn[] {
	return header.map((name, i) => ({
		id: `col_${i}`,
		name: name?.trim() || `Column ${i + 1}`,
		type: 'string'
	}));
}

/** Build a typed Dataset from a raw grid of strings, with per-column type inference. */
export function datasetFromGrid(header: string[], body: string[][]): Dataset {
	const columns = columnsFromHeader(header);

	columns.forEach((col, i) => {
		const sample = body.slice(0, 200).map((row) => row[i] ?? '');
		col.type = detectColumnType(sample);
	});

	const rows = body.map((rawRow) => {
		const row: Record<string, string | number | null> = {};
		columns.forEach((col, i) => {
			row[col.id] = parseCellForType(rawRow[i] ?? '', col.type);
		});
		return row;
	});

	return { columns, rows };
}

export function parseCsv(text: string): Dataset {
	const result = Papa.parse<string[]>(text.trim(), { skipEmptyLines: true });
	const [header, ...body] = result.data;
	return datasetFromGrid(header ?? [], body);
}

export async function parseXlsx(file: File): Promise<Dataset> {
	const buffer = await file.arrayBuffer();
	const workbook = XLSX.read(buffer, { type: 'array' });
	const sheet = workbook.Sheets[workbook.SheetNames[0]];
	const grid: string[][] = XLSX.utils.sheet_to_json(sheet, {
		header: 1,
		raw: false,
		defval: ''
	});
	const [header, ...body] = grid;
	return datasetFromGrid(header ?? [], body);
}

/** Parse pasted clipboard text (tab-separated from Excel/Sheets, or comma-separated). */
export function parsePastedText(text: string): Dataset {
	const delimiter = text.includes('\t') ? '\t' : ',';
	const result = Papa.parse<string[]>(text.trim(), { delimiter, skipEmptyLines: true });
	const [header, ...body] = result.data;
	return datasetFromGrid(header ?? [], body);
}
