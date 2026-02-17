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

export const MAX_AMOUNT = 9999.99;

function generateId(): string {
	return crypto.randomUUID();
}

function snapshotRows(rows: Row[]): Row[] {
	return rows.map((r) => ({ ...r, whoReceived: { ...r.whoReceived } }));
}

function allNamesOff(names: string[] = appState.names): Record<string, boolean> {
	return Object.fromEntries(names.map((n) => [n, false]));
}

function arraysEqual(a: string[], b: string[]): boolean {
	if (a.length !== b.length) return true;
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return true;
	}
	return false;
}

function rowsChanged(a: Row[], b: Row[]): boolean {
	if (a.length !== b.length) return true;
	for (let i = 0; i < a.length; i++) {
		if (a[i].id !== b[i].id) return true;
		if (a[i].whoPaid !== b[i].whoPaid) return true;
		if (a[i].description !== b[i].description) return true;
		if (a[i].amount !== b[i].amount) return true;
		const keysA = Object.keys(a[i].whoReceived);
		const keysB = Object.keys(b[i].whoReceived);
		if (keysA.length !== keysB.length) return true;
		for (const k of keysA) {
			if (a[i].whoReceived[k] !== b[i].whoReceived[k]) return true;
		}
	}
	return false;
}

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

const initialSavedStates = loadSavedStates();

function loadState(): { title: string; names: string[]; newName: string; nextId: number; rows: Row[]; currentStateId: string } {
	const defaults = { title: '', names: [] as string[], newName: '', nextId: 1, rows: [] as Row[], currentStateId: generateId() };
	if (initialSavedStates.length === 0) return defaults;
	const savedId = typeof window !== 'undefined' ? localStorage.getItem('currentStateId') : null;
	const target = initialSavedStates.find((s) => s.id === savedId)
		?? initialSavedStates.reduce((a, b) => (a.savedAt > b.savedAt ? a : b));
	return {
		title: target.title,
		names: [...target.names],
		newName: '',
		nextId: target.nextId,
		rows: snapshotRows(target.rows),
		currentStateId: target.id
	};
}

export const appState: { title: string; names: string[]; newName: string; nextId: number; rows: Row[]; currentStateId: string } = $state(loadState());

export const savedStates: SavedState[] = $state(initialSavedStates);

function hasContentChanged(existing: SavedState): boolean {
	if (existing.title !== appState.title) return true;
	if (arraysEqual(existing.names, appState.names)) return true;
	if (rowsChanged(existing.rows, appState.rows)) return true;
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
	const cleanup = $effect.root(() => {
		$effect(() => {
			localStorage.setItem('savedStates', JSON.stringify(savedStates));
		});
		$effect(() => {
			localStorage.setItem('currentStateId', appState.currentStateId);
		});
		$effect(() => {
			// Read all appState fields to register dependencies
			appState.currentStateId;
			appState.title;
			appState.names.length;
			appState.nextId;
			for (const row of appState.rows) {
				row.id; row.whoPaid; row.description; row.amount;
				for (const k in row.whoReceived) row.whoReceived[k];
			}

			untrack(() => syncCurrentState());
		});
	});

	// cleanup is available if ever needed (e.g. HMR), but SPA never unmounts
	void cleanup;
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
	if (row.amount > MAX_AMOUNT) row.amount = MAX_AMOUNT;
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
