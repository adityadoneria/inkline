import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { Dataset } from '../data/types';
import { triggerDownload } from './svg';

function toRowsOfArrays(dataset: Dataset): { header: string[]; rows: (string | number)[][] } {
	const header = dataset.columns.map((c) => c.name);
	const rows = dataset.rows.map((row) => dataset.columns.map((c) => row[c.id] ?? ''));
	return { header, rows: rows as (string | number)[][] };
}

export function downloadCsv(dataset: Dataset, filename: string) {
	const { header, rows } = toRowsOfArrays(dataset);
	const csv = Papa.unparse([header, ...rows]);
	triggerDownload(new Blob([csv], { type: 'text/csv' }), filename);
}

export function downloadJson(dataset: Dataset, filename: string) {
	const records = dataset.rows.map((row) => {
		const record: Record<string, unknown> = {};
		dataset.columns.forEach((c) => (record[c.name] = row[c.id]));
		return record;
	});
	triggerDownload(
		new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' }),
		filename
	);
}

export function downloadXlsx(dataset: Dataset, filename: string) {
	const { header, rows } = toRowsOfArrays(dataset);
	const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
	XLSX.writeFile(workbook, filename);
}
