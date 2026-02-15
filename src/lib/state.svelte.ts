export type Row = {
	id: number;
	whoPaid: string;
	description: string;
	amount: number | null;
	whoReceived: Record<string, boolean>;
};

function allNamesOff(names: string[] = appState.names): Record<string, boolean> {
	return Object.fromEntries(names.map((n) => [n, false]));
}

function loadState(): { title: string; names: string[]; newName: string; nextId: number; rows: Row[] } {
	const defaults = { title: 'Data Table', names: [] as string[], newName: '', nextId: 1, rows: [] as Row[] };
	if (typeof window === 'undefined') return defaults;
	try {
		const raw = localStorage.getItem('appState');
		if (raw) return { ...defaults, ...JSON.parse(raw) };
	} catch {
		// ignore corrupt data
	}
	return defaults;
}

export const appState: { title: string; names: string[]; newName: string; nextId: number; rows: Row[] } = $state(loadState());

if (typeof window !== 'undefined') {
	$effect.root(() => {
		$effect(() => {
			localStorage.setItem('appState', JSON.stringify(appState));
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
			row.whoPaid = appState.names[0] ?? '';
		}
	}
}

export function addRow() {
	appState.rows.push({ id: appState.nextId++, whoPaid: appState.names[0], description: '', amount: null, whoReceived: allNamesOff() });
}

export function deleteRow(id: number) {
	appState.rows = appState.rows.filter((r) => r.id !== id);
}

export function clampAmount(row: Row) {
	if (row.amount === null) return;
	if (row.amount < 0) row.amount = 0;
	if (row.amount > 9999.99) row.amount = 9999.99;
}

export function resetAll() {
	appState.title = 'Data Table';
	appState.names = [];
	appState.newName = '';
	appState.nextId = 1;
	appState.rows = [];
}
