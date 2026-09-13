<script lang="ts">
	import { chartTypes, type ChartTypeId } from '../charts/types';

	let { selected, onSelect }: { selected: ChartTypeId; onSelect: (id: ChartTypeId) => void } =
		$props();
</script>

<div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
	{#each chartTypes as t (t.id)}
		<button
			class="rounded border p-2 text-left text-xs transition
				{selected === t.id
				? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
				: 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'}
				{!t.implemented ? 'opacity-50' : ''}"
			disabled={!t.implemented}
			onclick={() => onSelect(t.id)}
			title={t.description}
		>
			<div class="font-medium">{t.label}</div>
			{#if !t.implemented}
				<div class="text-[10px] text-gray-400">coming soon</div>
			{/if}
		</button>
	{/each}
</div>
