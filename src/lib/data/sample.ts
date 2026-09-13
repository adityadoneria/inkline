import { datasetFromGrid } from './parse';
import type { Dataset } from './types';

export interface SampleDataset {
	id: string;
	name: string;
	dataset: Dataset;
}

function fromCsv(header: string, rows: string): Dataset {
	const headerCols = header.split(',');
	const body = rows
		.trim()
		.split('\n')
		.map((line) => line.split(','));
	return datasetFromGrid(headerCols, body);
}

export const sampleDatasets: SampleDataset[] = [
	{
		id: 'monthly-revenue',
		name: 'Monthly Revenue',
		dataset: fromCsv(
			'Month,Revenue,Costs',
			`2024-01,42000,31000
2024-02,45500,32000
2024-03,47200,33500
2024-04,51000,34000
2024-05,49800,35200
2024-06,53400,36000
2024-07,56100,37500
2024-08,58900,38200
2024-09,61200,39000
2024-10,64500,40100
2024-11,68200,41500
2024-12,72300,43000`
		)
	},
	{
		id: 'market-share',
		name: 'Market Share by Company',
		dataset: fromCsv(
			'Company,Share',
			`Acme Corp,32.5
Globex,24.1
Initech,18.7
Umbrella,14.2
Others,10.5`
		)
	},
	{
		id: 'population-growth',
		name: 'Population Growth by Country',
		dataset: fromCsv(
			'Year,India,China,USA',
			`2000,1059,1290,282
2005,1147,1308,296
2010,1234,1338,309
2015,1310,1379,321
2020,1380,1412,331
2024,1441,1410,341`
		)
	}
];
