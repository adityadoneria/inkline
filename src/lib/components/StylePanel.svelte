<script lang="ts">
	import type { Dataset } from '../data/types';
	import type { ChartConfig } from '../charts/config';

	let { dataset, config = $bindable() }: { dataset: Dataset; config: ChartConfig } = $props();

	const numericAndDateCols = $derived(dataset.columns);
	const isLineFamily = $derived(config.type === 'line' || config.type === 'area');

	function toggleSeries(colId: string) {
		if (config.seriesColumnIds.includes(colId)) {
			config.seriesColumnIds = config.seriesColumnIds.filter((id) => id !== colId);
		} else {
			config.seriesColumnIds = [...config.seriesColumnIds, colId];
		}
	}
</script>

<div class="flex flex-col gap-4 text-sm">
	<div>
		<label class="mb-1 block font-medium" for="x-col">X axis / category column</label>
		<select
			id="x-col"
			class="w-full rounded border border-gray-300 p-1.5 dark:border-gray-600 dark:bg-gray-900"
			bind:value={config.xColumnId}
		>
			{#each numericAndDateCols as col (col.id)}
				<option value={col.id}>{col.name}</option>
			{/each}
		</select>
	</div>

	<div>
		<span class="mb-1 block font-medium">Series (numeric columns)</span>
		<div class="flex flex-wrap gap-2">
			{#each dataset.columns.filter((c) => c.type === 'number' || c.type === 'percent') as col (col.id)}
				<label class="flex items-center gap-1 rounded border border-gray-300 px-2 py-1 dark:border-gray-600">
					<input
						type="checkbox"
						checked={config.seriesColumnIds.includes(col.id)}
						onchange={() => toggleSeries(col.id)}
					/>
					{col.name}
				</label>
			{/each}
		</div>
	</div>

	<hr class="border-gray-200 dark:border-gray-700" />

	<div class="grid grid-cols-1 gap-2">
		<label class="block">
			<span class="mb-1 block font-medium">Title</span>
			<input class="w-full rounded border border-gray-300 p-1.5 dark:border-gray-600 dark:bg-gray-900" bind:value={config.style.title} />
		</label>
		<label class="block">
			<span class="mb-1 block font-medium">Subtitle</span>
			<input class="w-full rounded border border-gray-300 p-1.5 dark:border-gray-600 dark:bg-gray-900" bind:value={config.style.subtitle} />
		</label>
		<label class="block">
			<span class="mb-1 block font-medium">Source / attribution</span>
			<input class="w-full rounded border border-gray-300 p-1.5 dark:border-gray-600 dark:bg-gray-900" bind:value={config.style.source} />
		</label>
		<label class="block">
			<span class="mb-1 block font-medium">Footer note</span>
			<input class="w-full rounded border border-gray-300 p-1.5 dark:border-gray-600 dark:bg-gray-900" bind:value={config.style.footerNote} />
		</label>
	</div>

	<hr class="border-gray-200 dark:border-gray-700" />

	<div class="flex flex-wrap gap-4">
		<label class="flex items-center gap-2">
			<input type="checkbox" bind:checked={config.style.showLegend} />
			Show legend
		</label>
		<label class="flex items-center gap-2">
			<input type="checkbox" bind:checked={config.style.darkMode} />
			Dark mode
		</label>
		<label class="flex items-center gap-2">
			<input type="checkbox" bind:checked={config.style.responsive} />
			Responsive width
		</label>
	</div>

	{#if !config.style.responsive}
		<div class="flex gap-2">
			<label class="block">
				<span class="mb-1 block font-medium">Width (px)</span>
				<input type="number" class="w-24 rounded border border-gray-300 p-1.5 dark:border-gray-600 dark:bg-gray-900" bind:value={config.style.fixedWidth} />
			</label>
			<label class="block">
				<span class="mb-1 block font-medium">Height (px)</span>
				<input type="number" class="w-24 rounded border border-gray-300 p-1.5 dark:border-gray-600 dark:bg-gray-900" bind:value={config.style.fixedHeight} />
			</label>
		</div>
	{/if}

	{#if isLineFamily}
		<hr class="border-gray-200 dark:border-gray-700" />
		<div class="flex flex-col gap-2">
			<span class="font-medium">Line & area options</span>
			<label class="flex items-center gap-2">
				<input
					type="checkbox"
					checked={config.lineOptions.interpolation === 'smooth'}
					onchange={(e) =>
						(config.lineOptions.interpolation = e.currentTarget.checked ? 'smooth' : 'linear')}
				/>
				Smooth interpolation
			</label>
			<label class="flex items-center gap-2">
				<input type="checkbox" bind:checked={config.lineOptions.areaFill} />
				Area fill
			</label>
			<label class="flex items-center gap-2">
				<input type="checkbox" bind:checked={config.lineOptions.showDots} />
				Show point dots
			</label>
			<label class="flex items-center gap-2">
				<input type="checkbox" bind:checked={config.lineOptions.logScale} />
				Logarithmic y-axis
			</label>
		</div>
	{/if}

	<div>
		<span class="mb-1 block font-medium">Palette</span>
		<div class="flex flex-wrap gap-1">
			{#each config.style.palette as color, i (i)}
				<input type="color" bind:value={config.style.palette[i]} class="h-7 w-7 cursor-pointer rounded border-0" />
			{/each}
		</div>
	</div>
</div>
