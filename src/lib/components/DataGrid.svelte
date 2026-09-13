<script lang="ts">
	import type { Dataset, ColumnType } from '../data/types';

	let { dataset = $bindable() }: { dataset: Dataset } = $props();

	const typeOptions: ColumnType[] = ['string', 'number', 'percent', 'date'];

	function updateCell(rowIndex: number, columnId: string, value: string) {
		dataset.rows[rowIndex] = { ...dataset.rows[rowIndex], [columnId]: value };
	}

	function addRow() {
		const empty: Record<string, string | number | null> = {};
		dataset.columns.forEach((c) => (empty[c.id] = null));
		dataset.rows = [...dataset.rows, empty];
	}

	function removeRow(rowIndex: number) {
		dataset.rows = dataset.rows.filter((_, i) => i !== rowIndex);
	}

	function renameColumn(columnId: string, name: string) {
		dataset.columns = dataset.columns.map((c) => (c.id === columnId ? { ...c, name } : c));
	}

	function setColumnType(columnId: string, type: ColumnType) {
		dataset.columns = dataset.columns.map((c) => (c.id === columnId ? { ...c, type } : c));
	}
</script>

<div class="overflow-auto rounded border border-gray-200 dark:border-gray-700">
	<table class="w-full border-collapse text-sm">
		<thead>
			<tr class="bg-gray-50 dark:bg-gray-800">
				{#each dataset.columns as col (col.id)}
					<th class="border-b border-gray-200 p-2 text-left dark:border-gray-700">
						<input
							class="w-full bg-transparent font-semibold outline-none"
							value={col.name}
							oninput={(e) => renameColumn(col.id, e.currentTarget.value)}
						/>
						<select
							class="mt-1 w-full rounded border border-gray-300 bg-white text-xs dark:border-gray-600 dark:bg-gray-900"
							value={col.type}
							onchange={(e) => setColumnType(col.id, e.currentTarget.value as ColumnType)}
						>
							{#each typeOptions as t (t)}
								<option value={t}>{t}</option>
							{/each}
						</select>
					</th>
				{/each}
				<th class="w-8 border-b border-gray-200 dark:border-gray-700"></th>
			</tr>
		</thead>
		<tbody>
			{#each dataset.rows as row, rowIndex (rowIndex)}
				<tr class="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900 dark:even:bg-gray-800/50">
					{#each dataset.columns as col (col.id)}
						<td class="border-b border-gray-100 p-1 dark:border-gray-800">
							<input
								class="w-full bg-transparent p-1 outline-none"
								value={row[col.id] ?? ''}
								oninput={(e) => updateCell(rowIndex, col.id, e.currentTarget.value)}
							/>
						</td>
					{/each}
					<td class="border-b border-gray-100 text-center dark:border-gray-800">
						<button
							class="text-gray-400 hover:text-red-500"
							onclick={() => removeRow(rowIndex)}
							aria-label="Remove row">&times;</button
						>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
<button
	class="mt-2 rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
	onclick={addRow}
>
	+ Add row
</button>
