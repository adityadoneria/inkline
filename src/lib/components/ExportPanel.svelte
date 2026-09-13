<script lang="ts">
	import type { Dataset } from '../data/types';
	import { exportRaster, copyChartToClipboard } from '../export/png';
	import { downloadSvg } from '../export/svg';
	import { downloadStandaloneHtml, buildIframeEmbedSnippet } from '../export/html';
	import { exportChartPdf } from '../export/pdf';
	import { downloadCsv, downloadJson, downloadXlsx } from '../export/data';

	let { svgEl, dataset, chartName }: { svgEl: SVGSVGElement; dataset: Dataset; chartName: string } =
		$props();

	let status = $state('');
	let embedSnippet = $state('');

	async function withStatus(label: string, fn: () => Promise<void> | void) {
		status = `${label}...`;
		try {
			await fn();
			status = `${label} done`;
		} catch (err) {
			status = `${label} failed: ${(err as Error).message}`;
		}
		setTimeout(() => (status = ''), 2500);
	}

	function slug() {
		return (chartName || 'chart').toLowerCase().replace(/[^a-z0-9]+/g, '-');
	}
</script>

<div class="flex flex-col gap-4 text-sm">
	<div>
		<span class="mb-1 block font-medium">Image</span>
		<div class="flex flex-wrap gap-2">
			<button class="btn" onclick={() => withStatus('PNG (1x)', () => exportRaster(svgEl, `${slug()}.png`, { scale: 1, transparent: false }))}>PNG 1x</button>
			<button class="btn" onclick={() => withStatus('PNG (2x)', () => exportRaster(svgEl, `${slug()}@2x.png`, { scale: 2, transparent: false }))}>PNG 2x</button>
			<button class="btn" onclick={() => withStatus('PNG transparent', () => exportRaster(svgEl, `${slug()}.png`, { scale: 2, transparent: true }))}>PNG transparent</button>
			<button class="btn" onclick={() => withStatus('JPEG', () => exportRaster(svgEl, `${slug()}.jpg`, { scale: 2, transparent: false, format: 'jpeg' }))}>JPEG</button>
			<button class="btn" onclick={() => withStatus('SVG', () => downloadSvg(svgEl, `${slug()}.svg`))}>SVG</button>
			<button class="btn" onclick={() => withStatus('Copy image', () => copyChartToClipboard(svgEl))}>Copy to clipboard</button>
		</div>
	</div>

	<div>
		<span class="mb-1 block font-medium">Document</span>
		<div class="flex flex-wrap gap-2">
			<button class="btn" onclick={() => withStatus('PDF', () => exportChartPdf(svgEl, `${slug()}.pdf`))}>PDF</button>
			<button class="btn" onclick={() => withStatus('Interactive HTML', () => downloadStandaloneHtml(svgEl, chartName, `${slug()}.html`))}>Interactive HTML</button>
		</div>
	</div>

	<div>
		<span class="mb-1 block font-medium">Embed</span>
		<button class="btn" onclick={() => (embedSnippet = buildIframeEmbedSnippet(svgEl, chartName))}>Generate embed snippet</button>
		{#if embedSnippet}
			<textarea
				class="mt-2 h-24 w-full rounded border border-gray-300 p-2 font-mono text-xs dark:border-gray-600 dark:bg-gray-900"
				readonly
				value={embedSnippet}
			></textarea>
		{/if}
	</div>

	<div>
		<span class="mb-1 block font-medium">Data</span>
		<div class="flex flex-wrap gap-2">
			<button class="btn" onclick={() => withStatus('CSV', () => downloadCsv(dataset, `${slug()}.csv`))}>CSV</button>
			<button class="btn" onclick={() => withStatus('XLSX', () => downloadXlsx(dataset, `${slug()}.xlsx`))}>XLSX</button>
			<button class="btn" onclick={() => withStatus('JSON', () => downloadJson(dataset, `${slug()}.json`))}>JSON</button>
		</div>
	</div>

	{#if status}
		<p class="text-xs text-gray-500">{status}</p>
	{/if}
</div>

<style>
	.btn {
		border-radius: 0.375rem;
		border: 1px solid var(--btn-border, #d1d5db);
		padding: 0.25rem 0.6rem;
		font-size: 0.75rem;
	}
	.btn:hover {
		background: rgba(0, 0, 0, 0.04);
	}
</style>
