import { untrack } from 'svelte';

export type Row = {
	id: number;
	whoPaid: string;
	description: string;
	amount: number | null;
	whoReceived: Record<string, boolean>;
};

export type SavedState = {
	id: string;
	title: string;
	names: string[];
	rows: Row[];
	nextId: number;
	savedAt: number;
};

function generateId(): string {
	return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function snapshotRows(rows: Row[]): Row[] {
	return rows.map((r) => ({ ...r, whoReceived: { ...r.whoReceived } }));
}

function allNamesOff(names: string[] = appState.names): Record<string, boolean> {
	return Object.fromEntries(names.map((n) => [n, false]));
}

function loadState(): { title: string; names: string[]; newName: string; nextId: number; rows: Row[]; currentStateId: string } {
	const defaults = { title: '', names: [] as string[], newName: '', nextId: 1, rows: [] as Row[], currentStateId: generateId() };
	if (typeof window === 'undefined') return defaults;
	try {
		const raw = localStorage.getItem('appState');
		if (raw) {
			const parsed = { ...defaults, ...JSON.parse(raw) };
			if (!parsed.currentStateId) parsed.currentStateId = generateId();
			return parsed;
		}
	} catch {
		// ignore corrupt data
	}
	return defaults;
}

export const appState: { title: string; names: string[]; newName: string; nextId: number; rows: Row[]; currentStateId: string } = $state(loadState());

function loadSavedStates(): SavedState[] {
	if (typeof window === 'undefined') return [];
	try {
		const raw = localStorage.getItem('savedStates');
		if (raw) return JSON.parse(raw);
	} catch {
		// ignore corrupt data
	}
	return [];
}

export const savedStates: SavedState[] = $state(loadSavedStates());

function hasContentChanged(existing: SavedState): boolean {
	if (existing.title !== appState.title) return true;
	if (JSON.stringify(existing.names) !== JSON.stringify(appState.names)) return true;
	if (JSON.stringify(existing.rows) !== JSON.stringify(appState.rows)) return true;
	return false;
}

function syncCurrentState() {
	const id = appState.currentStateId;
	const hasData = appState.title.trim() !== '' || appState.names.length > 0 || appState.rows.length > 0;
	const idx = savedStates.findIndex((s) => s.id === id);

	if (hasData) {
		if (idx !== -1) {
			if (hasContentChanged(savedStates[idx])) {
				savedStates[idx] = {
					...savedStates[idx],
					title: appState.title,
					names: [...appState.names],
					rows: snapshotRows(appState.rows),
					nextId: appState.nextId,
					savedAt: Date.now()
				};
			}
		} else {
			savedStates.push({
				id,
				title: appState.title,
				names: [...appState.names],
				rows: snapshotRows(appState.rows),
				nextId: appState.nextId,
				savedAt: Date.now()
			});
		}
	} else if (idx !== -1) {
		savedStates.splice(idx, 1);
	}
}

if (typeof window !== 'undefined') {
	$effect.root(() => {
		$effect(() => {
			localStorage.setItem('appState', JSON.stringify(appState));
		});
		$effect(() => {
			localStorage.setItem('savedStates', JSON.stringify(savedStates));
		});
		// Auto-sync current state to savedStates on every change
		$effect(() => {
			// Track all appState dependencies
			const _id = appState.currentStateId;
			const _title = appState.title;
			const _names = appState.names.length;
			const _rows = JSON.stringify(appState.rows);
			const _nextId = appState.nextId;

			// Write to savedStates without tracking it
			untrack(() => syncCurrentState());
		});
	});
}

export function addName() {
	const trimmed = appState.newName.trim();
	if (!trimmed || appState.names.includes(trimmed)) return;
	appState.names.push(trimmed);
	for (const row of appState.rows) {
		row.whoReceived[trimmed] = false;
	}
	appState.newName = '';
}

export function removeName(name: string) {
	appState.names = appState.names.filter((n) => n !== name);
	for (const row of appState.rows) {
		delete row.whoReceived[name];
		if (row.whoPaid === name) {
			row.whoPaid = '';
		}
	}
}

export function addRow() {
	appState.rows.push({ id: appState.nextId++, whoPaid: '', description: '', amount: null, whoReceived: allNamesOff() });
}

export function deleteRow(id: number) {
	appState.rows = appState.rows.filter((r) => r.id !== id);
}

export function clampAmount(row: Row) {
	if (row.amount === null) return;
	if (row.amount < 0) row.amount = 0;
	if (row.amount > 9999.99) row.amount = 9999.99;
}

export function resetAll(skipSave = false) {
	if (!skipSave) syncCurrentState();
	appState.title = '';
	appState.names = [];
	appState.newName = '';
	appState.nextId = 1;
	appState.rows = [];
	appState.currentStateId = generateId();
}

export function restoreState(id: string) {
	const saved = savedStates.find((s) => s.id === id);
	if (!saved) return;
	syncCurrentState();
	appState.title = saved.title;
	appState.names = [...saved.names];
	appState.rows = snapshotRows(saved.rows);
	appState.nextId = saved.nextId;
	appState.newName = '';
	appState.currentStateId = id;
}

export function deleteSavedState(id: string) {
	const idx = savedStates.findIndex((s) => s.id === id);
	if (idx !== -1) savedStates.splice(idx, 1);
}
