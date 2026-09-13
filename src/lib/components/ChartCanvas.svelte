<script lang="ts">
	import { renderChart } from '../charts/render';
	import type { Dataset } from '../data/types';
	import type { ChartConfig } from '../charts/config';

	let {
		dataset,
		config,
		svgEl = $bindable()
	}: { dataset: Dataset; config: ChartConfig; svgEl?: SVGSVGElement } = $props();

	let container: HTMLDivElement;
	let width = $state(640);
	const height = $derived(config.style.fixedHeight);

	$effect(() => {
		if (!svgEl) return;
		renderChart({
			svg: svgEl,
			dataset,
			config,
			width: config.style.responsive ? width : config.style.fixedWidth,
			height
		});
	});

	$effect(() => {
		if (!container) return;
		const observer = new ResizeObserver((entries) => {
			width = entries[0].contentRect.width;
		});
		observer.observe(container);
		return () => observer.disconnect();
	});
</script>

<div
	bind:this={container}
	class="inkline-chart-container relative w-full overflow-hidden rounded border border-gray-200 bg-white text-gray-900 dark:border-gray-700"
	class:dark={config.style.darkMode}
	style:font-family={config.style.fontFamily}
	style:background={config.style.darkMode ? '#111827' : 'white'}
	style:color={config.style.darkMode ? '#f9fafb' : '#111827'}
>
	<svg bind:this={svgEl} class="block w-full"></svg>
</div>
