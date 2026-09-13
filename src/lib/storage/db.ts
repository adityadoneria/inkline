import Dexie, { type EntityTable } from 'dexie';
import type { Dataset } from '../data/types';
import type { ChartConfig } from '../charts/config';

export interface ChartProject {
	id: string;
	name: string;
	dataset: Dataset;
	config: ChartConfig;
	createdAt: number;
	updatedAt: number;
	folder?: string;
	tags: string[];
	isTemplate: boolean;
}

class InklineDatabase extends Dexie {
	projects!: EntityTable<ChartProject, 'id'>;

	constructor() {
		super('inkline');
		this.version(1).stores({
			projects: 'id, name, updatedAt, folder, isTemplate'
		});
	}
}

export const db = new InklineDatabase();

export function newProjectId(): string {
	return crypto.randomUUID();
}

export async function saveProject(project: ChartProject): Promise<void> {
	await db.projects.put({ ...project, updatedAt: Date.now() });
}

export async function listRecentProjects(limit = 20): Promise<ChartProject[]> {
	return db.projects.orderBy('updatedAt').reverse().limit(limit).toArray();
}

export async function deleteProject(id: string): Promise<void> {
	await db.projects.delete(id);
}

export async function duplicateProject(id: string): Promise<ChartProject | undefined> {
	const original = await db.projects.get(id);
	if (!original) return undefined;
	const copy: ChartProject = {
		...original,
		id: newProjectId(),
		name: `${original.name} (copy)`,
		createdAt: Date.now(),
		updatedAt: Date.now()
	};
	await db.projects.put(copy);
	return copy;
}

/** Export a project as a portable JSON file (data + config) to move between devices or share manually. */
export function projectToJsonBlob(project: ChartProject): Blob {
	return new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
}

export function projectFromJsonText(text: string): ChartProject {
	const parsed = JSON.parse(text) as ChartProject;
	return { ...parsed, id: newProjectId(), createdAt: Date.now(), updatedAt: Date.now() };
}
