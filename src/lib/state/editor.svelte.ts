import type { Dataset } from '../data/types';
import { defaultChartConfig, type ChartConfig } from '../charts/config';
import { suggestChartType } from '../charts/types';
import { sampleDatasets } from '../data/sample';

function inferInitialConfig(dataset: Dataset): ChartConfig {
	const dateCols = dataset.columns.filter((c) => c.type === 'date');
	const numericCols = dataset.columns.filter((c) => c.type === 'number' || c.type === 'percent');
	const categoryCols = dataset.columns.filter((c) => c.type === 'string');

	const xCol = dateCols[0] ?? categoryCols[0] ?? dataset.columns[0];
	const seriesCols = numericCols.filter((c) => c.id !== xCol?.id);

	const type = suggestChartType(numericCols.length, dateCols.length, categoryCols.length);
	const config = defaultChartConfig(type);
	config.xColumnId = xCol?.id ?? null;
	config.seriesColumnIds = seriesCols.map((c) => c.id).slice(0, 4);
	return config;
}

class EditorStore {
	dataset = $state<Dataset>(sampleDatasets[0].dataset);
	config = $state<ChartConfig>(inferInitialConfig(sampleDatasets[0].dataset));
	projectId = $state<string | null>(null);
	projectName = $state('Untitled chart');

	loadDataset(dataset: Dataset) {
		this.dataset = dataset;
		this.config = inferInitialConfig(dataset);
		this.projectId = null;
	}

	setChartType(type: ChartConfig['type']) {
		this.config = {
			...this.config,
			type,
			lineOptions: { ...this.config.lineOptions, areaFill: type === 'area' }
		};
	}
}

export const editor = new EditorStore();
