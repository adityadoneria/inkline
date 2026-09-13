import { renderBarColumn, type RenderContext } from './renderers/barColumn';
import { renderLineArea } from './renderers/lineArea';

export function renderChart(ctx: RenderContext) {
	switch (ctx.config.type) {
		case 'bar':
		case 'column':
			return renderBarColumn(ctx);
		case 'line':
		case 'area':
			return renderLineArea(ctx);
		default:
			// Chart family not yet implemented (see spec §4/§16 phase plan).
			return;
	}
}

export type { RenderContext };
