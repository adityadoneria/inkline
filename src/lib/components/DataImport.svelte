<script lang="ts">
	import { parseCsv, parseXlsx, parsePastedText } from '../data/parse';
	import { sampleDatasets } from '../data/sample';
	import type { Dataset } from '../data/types';

	let { onLoad }: { onLoad: (dataset: Dataset) => void } = $props();

	let pasteText = $state('');
	let error = $state('');

	async function handleFile(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		error = '';
		try {
			if (file.name.endsWith('.csv')) {
				onLoad(parseCsv(await file.text()));
			} else {
				onLoad(await parseXlsx(file));
			}
		} catch (err) {
			error = `Could not parse file: ${(err as Error).message}`;
		}
		input.value = '';
	}

	function handlePaste() {
		if (!pasteText.trim()) return;
		try {
			onLoad(parsePastedText(pasteText));
			pasteText = '';
			error = '';
		} catch (err) {
			error = `Could not parse pasted data: ${(err as Error).message}`;
		}
	}
</script>

<div class="flex flex-col gap-3 text-sm">
	<div>
		<label class="mb-1 block font-medium" for="file-upload">Upload CSV or XLSX</label>
		<input id="file-upload" type="file" accept=".csv,.xlsx,.xls" onchange={handleFile} class="text-xs" />
	</div>

	<div>
		<label class="mb-1 block font-medium" for="paste-area">Or paste data (from Excel/Sheets/CSV)</label>
		<textarea
			id="paste-area"
			class="h-24 w-full rounded border border-gray-300 p-2 font-mono text-xs dark:border-gray-600 dark:bg-gray-900"
			bind:value={pasteText}
			placeholder={'Month\\tRevenue\\nJan\\t4200'}
		></textarea>
		<button class="mt-1 rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800" onclick={handlePaste}>
			Load pasted data
		</button>
	</div>

	<div>
		<span class="mb-1 block font-medium">Or try a sample dataset</span>
		<div class="flex flex-wrap gap-2">
			{#each sampleDatasets as sample (sample.id)}
				<button
					class="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
					onclick={() => onLoad(sample.dataset)}
				>
					{sample.name}
				</button>
			{/each}
		</div>
	</div>

	{#if error}
		<p class="text-xs text-red-600">{error}</p>
	{/if}
</div>
