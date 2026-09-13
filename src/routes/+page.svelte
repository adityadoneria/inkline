<script lang="ts">
	import { editor } from '$lib/state/editor.svelte';
	import DataImport from '$lib/components/DataImport.svelte';
	import DataGrid from '$lib/components/DataGrid.svelte';
	import ChartTypePicker from '$lib/components/ChartTypePicker.svelte';
	import StylePanel from '$lib/components/StylePanel.svelte';
	import ChartCanvas from '$lib/components/ChartCanvas.svelte';
	import ExportPanel from '$lib/components/ExportPanel.svelte';
	import { saveProject, newProjectId, type ChartProject } from '$lib/storage/db';

	type Tab = 'data' | 'visualize' | 'style' | 'export';
	let tab = $state<Tab>('data');
	let svgEl = $state<SVGSVGElement>();
	let saveStatus = $state('');

	async function saveLocally() {
		const project: ChartProject = {
			id: editor.projectId ?? newProjectId(),
			name: editor.projectName,
			dataset: editor.dataset,
			config: editor.config,
			createdAt: Date.now(),
			updatedAt: Date.now(),
			tags: [],
			isTemplate: false
		};
		await saveProject(project);
		editor.projectId = project.id;
		saveStatus = 'Saved to local library';
		setTimeout(() => (saveStatus = ''), 2000);
	}
</script>

<svelte:head>
	<title>Inkline</title>
</svelte:head>

<div class="mx-auto flex min-h-screen max-w-7xl flex-col gap-4 p-4">
	<header class="flex flex-wrap items-center justify-between gap-2">
		<div class="flex items-center gap-2">
			<h1 class="text-lg font-semibold">Inkline</h1>
			<input
				class="rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-900"
				bind:value={editor.projectName}
			/>
		</div>
		<div class="flex items-center gap-2">
			{#if saveStatus}<span class="text-xs text-gray-500">{saveStatus}</span>{/if}
			<button
				class="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
				onclick={saveLocally}
			>
				Save
			</button>
		</div>
	</header>

	<nav class="flex gap-1 border-b border-gray-200 dark:border-gray-700">
		{#each [['data', 'Data'], ['visualize', 'Visualize'], ['style', 'Style'], ['export', 'Export']] as [id, label] (id)}
			<button
				class="border-b-2 px-3 py-2 text-sm {tab === id
					? 'border-blue-500 font-medium text-blue-600'
					: 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}"
				onclick={() => (tab = id as Tab)}
			>
				{label}
			</button>
		{/each}
	</nav>

	<div class="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
		<div class="min-w-0">
			<ChartCanvas dataset={editor.dataset} config={editor.config} bind:svgEl />
		</div>

		<div class="flex flex-col gap-4">
			{#if tab === 'data'}
				<DataImport onLoad={(d) => editor.loadDataset(d)} />
			{:else if tab === 'visualize'}
				<ChartTypePicker selected={editor.config.type} onSelect={(t) => editor.setChartType(t)} />
			{:else if tab === 'style'}
				<StylePanel dataset={editor.dataset} bind:config={editor.config} />
			{:else if tab === 'export'}
				{#if svgEl}
					<ExportPanel {svgEl} dataset={editor.dataset} chartName={editor.projectName} />
				{/if}
			{/if}
		</div>
	</div>

	{#if tab === 'data'}
		<section>
			<h2 class="mb-2 text-sm font-medium">Data grid</h2>
			<DataGrid bind:dataset={editor.dataset} />
		</section>
	{/if}
</div>
