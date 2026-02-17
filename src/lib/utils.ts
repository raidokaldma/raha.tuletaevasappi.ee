import type { Row } from './state.svelte';

export function isRowInvalid(row: Row): boolean {
	return !row.whoPaid || (row.amount !== null && row.amount !== 0 && !Object.values(row.whoReceived).some(Boolean));
}

export function formatAmount(value: number | null): string {
	if (value === null) return '';
	return value.toFixed(2);
}

export function formatTime(ts: number): string {
	const d = new Date(ts);
	const now = new Date();
	const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	if (d.toDateString() === now.toDateString()) return `today ${time}`;
	const yesterday = new Date(now);
	yesterday.setDate(yesterday.getDate() - 1);
	if (d.toDateString() === yesterday.toDateString()) return `yesterday ${time}`;
	return `${d.toLocaleDateString([], { day: 'numeric', month: 'short' })} ${time}`;
}

export type Settlement = { from: string; to: string; amount: number };

const BALANCE_EPSILON = 0.01;

export function calculateSettlements(summary: { name: string; balance: number }[]): Settlement[] {
	const balances = summary.map((s) => ({ name: s.name, balance: s.balance }));
	const result: Settlement[] = [];

	while (true) {
		balances.sort((a, b) => a.balance - b.balance);
		const debtor = balances[0];
		const creditor = balances[balances.length - 1];

		if (!debtor || !creditor || debtor.balance >= -BALANCE_EPSILON || creditor.balance <= BALANCE_EPSILON) break;

		const amount = Math.min(-debtor.balance, creditor.balance);
		result.push({ from: debtor.name, to: creditor.name, amount });
		debtor.balance += amount;
		creditor.balance -= amount;
	}

	return result;
}
