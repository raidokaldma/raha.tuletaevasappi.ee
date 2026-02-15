<script lang="ts">
	const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];

	type Row = {
		id: number;
		whoPaid: string;
		description: string;
		amount: number | null;
		whoReceived: Record<string, boolean>;
	};

	function allNamesOff(): Record<string, boolean> {
		return Object.fromEntries(names.map((n) => [n, false]));
	}

	let nextId = $state(6);

	let rows: Row[] = $state([
		{ id: 1, whoPaid: 'Alice', description: 'Groceries', amount: 84.50, whoReceived: { ...allNamesOff(), Alice: true, Bob: true, Charlie: true } },
		{ id: 2, whoPaid: 'Bob', description: 'Electricity bill', amount: 120.00, whoReceived: { ...allNamesOff(), Alice: true, Bob: true, Charlie: true, Diana: true, Eve: true } },
		{ id: 3, whoPaid: 'Charlie', description: 'Pizza night', amount: 45.00, whoReceived: { ...allNamesOff(), Alice: true, Charlie: true, Eve: true } },
		{ id: 4, whoPaid: 'Diana', description: 'Taxi ride', amount: 32.00, whoReceived: { ...allNamesOff(), Diana: true, Eve: true } },
		{ id: 5, whoPaid: 'Eve', description: 'Movie tickets', amount: 60.00, whoReceived: { ...allNamesOff(), Alice: true, Bob: true, Diana: true, Eve: true } }
	]);

	function addRow() {
		rows.push({ id: nextId++, whoPaid: names[0], description: '', amount: null, whoReceived: allNamesOff() });
	}

	function deleteRow(id: number) {
		rows = rows.filter((r) => r.id !== id);
	}

	function isRowInvalid(row: Row): boolean {
		return !!row.amount && !Object.values(row.whoReceived).some(Boolean);
	}

	function formatEur(value: number | null): string {
		if (value === null) return '';
		return value.toFixed(2);
	}

	let total = $derived(rows.reduce((sum, r) => sum + (r.amount ?? 0), 0));

	let summary = $derived(
		names.map((name) => {
			const paid = rows
				.filter((r) => r.whoPaid === name && Object.values(r.whoReceived).some(Boolean))
				.reduce((sum, r) => sum + (r.amount ?? 0), 0);

			const received = rows.reduce((sum, r) => {
				if (!r.whoReceived[name] || !r.amount) return sum;
				const receiverCount = Object.values(r.whoReceived).filter(Boolean).length;
				return sum + (receiverCount > 0 ? r.amount / receiverCount : 0);
			}, 0);

			return { name, paid, received, balance: paid - received };
		})
	);

	type Settlement = { from: string; to: string; amount: number };

	let settlements: Settlement[] = $derived.by(() => {
		const balances = summary.map((s) => ({ name: s.name, balance: s.balance }));
		const result: Settlement[] = [];

		// Greedy algorithm: repeatedly match largest debtor with largest creditor
		while (true) {
			balances.sort((a, b) => a.balance - b.balance);
			const debtor = balances[0];
			const creditor = balances[balances.length - 1];

			if (!debtor || !creditor || debtor.balance >= -0.01 || creditor.balance <= 0.01) break;

			const amount = Math.min(-debtor.balance, creditor.balance);
			result.push({ from: debtor.name, to: creditor.name, amount });
			debtor.balance += amount;
			creditor.balance -= amount;
		}

		return result;
	});

	// Themes
	type Theme = {
		name: string;
		page: string;
		title: string;
		tableWrapper: string;
		thead: string;
		th: string;
		row: string;
		rowBorder: string;
		input: string;
		select: string;
		euro: string;
		pillOn: string;
		pillOff: string;
		deleteBtn: string;
		emptyText: string;
		tfoot: string;
		tfootLabel: string;
		tfootValue: string;
		card: string;
		cardLabel: string;
		cardFieldLabel: string;
		totalBar: string;
		totalLabel: string;
		totalValue: string;
		addBtn: string;
		summaryCard: string;
		summaryName: string;
		summaryLabel: string;
		summaryValue: string;
		summaryPositive: string;
		summaryNegative: string;
		settlementCard: string;
		settlementFrom: string;
		settlementArrow: string;
		settlementTo: string;
		settlementAmount: string;
		rowInvalid: string;
		themeBtn: string;
		themeBtnActive: string;
	};

	const themes: Theme[] = [
		{
			name: 'Light',
			page: 'bg-gray-50',
			title: 'text-gray-900',
			tableWrapper: 'border-gray-200 bg-white',
			thead: 'bg-gray-100/50 backdrop-blur-sm shadow-[0_1px_0_0_rgb(229,231,235)]',
			th: 'text-gray-700',
			row: 'hover:bg-gray-50',
			rowBorder: 'border-gray-100',
			input: 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500',
			select: 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500',
			euro: 'text-gray-500',
			pillOn: 'border border-blue-500 bg-blue-100 text-blue-800 ring-1 ring-blue-500',
			pillOff: 'border border-gray-300 bg-gray-100 text-gray-500',
			deleteBtn: 'text-red-600 hover:bg-red-50 hover:text-red-700 focus:ring-red-500',
			emptyText: 'text-gray-500',
			tfoot: 'border-gray-200 bg-gray-50',
			tfootLabel: 'text-gray-700',
			tfootValue: 'text-gray-900',
			card: 'border-gray-200 bg-white',
			cardLabel: 'text-gray-500',
			cardFieldLabel: 'text-gray-600',
			totalBar: 'border-gray-200 bg-gray-50',
			totalLabel: 'text-gray-700',
			totalValue: 'text-gray-900',
			addBtn: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
			summaryCard: 'border-gray-200 bg-white',
			summaryName: 'text-gray-900',
			summaryLabel: 'text-gray-500',
			summaryValue: 'text-gray-700',
			summaryPositive: 'text-green-600',
			summaryNegative: 'text-red-600',
			settlementCard: 'border-gray-200 bg-white',
			settlementFrom: 'text-gray-900',
			settlementArrow: 'text-gray-400',
			settlementTo: 'text-gray-900',
			settlementAmount: 'text-blue-600 bg-blue-50',
			rowInvalid: 'bg-red-50',
			themeBtn: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100',
			themeBtnActive: 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500'
		},
		{
			name: 'Midnight',
			page: 'bg-slate-900',
			title: 'text-slate-100',
			tableWrapper: 'border-slate-700 bg-slate-800',
			thead: 'bg-slate-700/50 backdrop-blur-sm shadow-[0_1px_0_0_rgb(51,65,85)]',
			th: 'text-slate-300',
			row: 'hover:bg-slate-750 hover:bg-slate-700/50',
			rowBorder: 'border-slate-700',
			input: 'border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-blue-400 focus:ring-blue-400',
			select: 'border-slate-600 bg-slate-700 text-slate-100 focus:border-blue-400 focus:ring-blue-400',
			euro: 'text-slate-400',
			pillOn: 'border border-blue-400 bg-blue-900 text-blue-300 ring-1 ring-blue-400',
			pillOff: 'border border-slate-600 bg-slate-700 text-slate-400',
			deleteBtn: 'text-red-400 hover:bg-red-900/30 hover:text-red-300 focus:ring-red-400',
			emptyText: 'text-slate-500',
			tfoot: 'border-slate-600 bg-slate-800',
			tfootLabel: 'text-slate-300',
			tfootValue: 'text-slate-100',
			card: 'border-slate-700 bg-slate-800',
			cardLabel: 'text-slate-400',
			cardFieldLabel: 'text-slate-400',
			totalBar: 'border-slate-700 bg-slate-800',
			totalLabel: 'text-slate-300',
			totalValue: 'text-slate-100',
			addBtn: 'bg-blue-500 text-white hover:bg-blue-400 focus:ring-blue-400',
			summaryCard: 'border-slate-700 bg-slate-800',
			summaryName: 'text-slate-100',
			summaryLabel: 'text-slate-400',
			summaryValue: 'text-slate-300',
			summaryPositive: 'text-green-400',
			summaryNegative: 'text-red-400',
			settlementCard: 'border-slate-700 bg-slate-800',
			settlementFrom: 'text-slate-100',
			settlementArrow: 'text-slate-500',
			settlementTo: 'text-slate-100',
			settlementAmount: 'text-blue-300 bg-blue-900/40',
			rowInvalid: 'bg-red-900/20',
			themeBtn: 'border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700',
			themeBtnActive: 'border-blue-400 bg-blue-900/40 text-blue-300 ring-1 ring-blue-400'
		},
		{
			name: 'Pink Pastel',
			page: 'bg-pink-50',
			title: 'text-pink-900',
			tableWrapper: 'border-pink-200 bg-white',
			thead: 'bg-pink-100/50 backdrop-blur-sm shadow-[0_1px_0_0_rgb(251,207,232)]',
			th: 'text-pink-800',
			row: 'hover:bg-pink-50',
			rowBorder: 'border-pink-100',
			input: 'border-pink-300 bg-white text-pink-900 focus:border-pink-500 focus:ring-pink-500',
			select: 'border-pink-300 bg-white text-pink-900 focus:border-pink-500 focus:ring-pink-500',
			euro: 'text-pink-400',
			pillOn: 'border border-pink-500 bg-pink-200 text-pink-800 ring-1 ring-pink-500',
			pillOff: 'border border-pink-300 bg-pink-50 text-pink-400',
			deleteBtn: 'text-rose-500 hover:bg-rose-50 hover:text-rose-600 focus:ring-rose-400',
			emptyText: 'text-pink-400',
			tfoot: 'border-pink-200 bg-pink-50',
			tfootLabel: 'text-pink-700',
			tfootValue: 'text-pink-900',
			card: 'border-pink-200 bg-white',
			cardLabel: 'text-pink-400',
			cardFieldLabel: 'text-pink-600',
			totalBar: 'border-pink-200 bg-pink-50',
			totalLabel: 'text-pink-700',
			totalValue: 'text-pink-900',
			addBtn: 'bg-pink-500 text-white hover:bg-pink-600 focus:ring-pink-400',
			summaryCard: 'border-pink-200 bg-white',
			summaryName: 'text-pink-900',
			summaryLabel: 'text-pink-400',
			summaryValue: 'text-pink-700',
			summaryPositive: 'text-green-600',
			summaryNegative: 'text-rose-500',
			settlementCard: 'border-pink-200 bg-white',
			settlementFrom: 'text-pink-900',
			settlementArrow: 'text-pink-300',
			settlementTo: 'text-pink-900',
			settlementAmount: 'text-pink-700 bg-pink-100',
			rowInvalid: 'bg-rose-50',
			themeBtn: 'border-pink-300 bg-white text-pink-700 hover:bg-pink-100',
			themeBtnActive: 'border-pink-500 bg-pink-100 text-pink-800 ring-1 ring-pink-500'
		}
	];

	const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
	let themeIndex = $state(prefersDark ? 1 : 0);
	let t = $derived(themes[themeIndex]);
</script>

<div class="min-h-screen {t.page} p-4 md:p-8 transition-colors duration-300">
	<div class="mx-auto max-w-4xl">
		<h1 class="mb-6 text-2xl font-bold {t.title}">Data Table</h1>

		<!-- Desktop table -->
		<div class="hidden md:block rounded-lg border {t.tableWrapper} shadow-sm">
			<table class="w-full">
				<thead class="sticky top-0 z-10 {t.thead}">
					<tr>
						<th class="w-[15%] px-2 py-3 text-left text-sm font-semibold {t.th}">Who Paid</th>
						<th class="w-[25%] px-2 py-3 text-left text-sm font-semibold {t.th}">Description</th>
						<th class="w-[15%] px-2 py-3 text-right text-sm font-semibold {t.th}">Amount (EUR)</th>
						<th class="px-2 py-3 text-left text-sm font-semibold {t.th}">Who Received</th>
						<th class="w-[5%] px-2 py-3 text-center text-sm font-semibold {t.th}"></th>
					</tr>
				</thead>
				<tbody>
					{#each rows as row (row.id)}
						<tr class="border-t {t.rowBorder} {isRowInvalid(row) ? t.rowInvalid : t.row}">
							<td class="px-2 py-2">
								<div class="grid grid-cols-1">
									<select
										bind:value={row.whoPaid}
										class="col-start-1 row-start-1 w-full appearance-none rounded-md border py-1.5 pl-2 pr-8 text-sm focus:ring-1 focus:outline-none {t.select}"
									>
										{#each names as n}
											<option value={n}>{n}</option>
										{/each}
									</select>
									<svg class="pointer-events-none col-start-1 row-start-1 mr-2 size-4 self-center justify-self-end {t.euro}" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
										<path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
									</svg>
								</div>
							</td>
							<td class="px-2 py-2">
								<input
									type="text"
									bind:value={row.description}
									placeholder="Enter description"
									class="w-full rounded border px-2 py-1.5 text-sm focus:ring-1 focus:outline-none {t.input}"
								/>
							</td>
							<td class="px-2 py-2">
								<div class="relative">
									<span class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm {t.euro}">&euro;</span>
									<input
										type="number"
										bind:value={row.amount}
										step="0.01"
										min="0"
										placeholder="0.00"
										class="w-full rounded border px-2 py-1.5 pr-7 text-right text-sm focus:ring-1 focus:outline-none {t.input}"
									/>
								</div>
							</td>
							<td class="px-2 py-2">
								<div class="flex flex-wrap gap-1.5">
									{#each names as n}
										<label class="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors {row.whoReceived[n] ? t.pillOn : t.pillOff}">
											<input type="checkbox" bind:checked={row.whoReceived[n]} class="sr-only" />
											{n}
										</label>
									{/each}
								</div>
							</td>
							<td class="px-2 py-2 text-center">
								<button
									onclick={() => deleteRow(row.id)}
									class="rounded p-1 focus:outline-none focus:ring-1 {t.deleteBtn}"
									title="Delete row"
								>
									<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</td>
						</tr>
					{/each}
					{#if rows.length === 0}
						<tr>
							<td colspan="5" class="px-2 py-8 text-center text-sm {t.emptyText}">
								No rows yet. Click "Add Row" to get started.
							</td>
						</tr>
					{/if}
				</tbody>
				<tfoot class="border-t-2 {t.tfoot}">
					<tr>
						<td colspan="2" class="px-2 py-3 text-sm font-semibold {t.tfootLabel}">Total</td>
						<td class="px-2 py-3 text-right text-sm font-semibold {t.tfootValue}">{formatEur(total)} &euro;</td>
						<td></td>
						<td></td>
					</tr>
				</tfoot>
			</table>
		</div>

		<!-- Mobile cards -->
		<div class="md:hidden space-y-3">
			{#each rows as row (row.id)}
				<div class="rounded-lg border {isRowInvalid(row) ? t.rowInvalid : t.card} p-4 shadow-sm">
					<div class="mb-3 flex items-center justify-between">
						<span class="text-xs font-semibold uppercase tracking-wide {t.cardLabel}">Entry</span>
						<button
							onclick={() => deleteRow(row.id)}
							class="rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 {t.deleteBtn}"
						>
							Delete
						</button>
					</div>

					<div class="space-y-3">
						<div class="block">
							<span class="mb-1 block text-xs font-medium {t.cardFieldLabel}">Who Paid</span>
							<div class="grid grid-cols-1">
								<select
									bind:value={row.whoPaid}
									class="col-start-1 row-start-1 w-full appearance-none rounded-md border py-2 pl-3 pr-8 text-sm focus:ring-1 focus:outline-none {t.select}"
								>
									{#each names as n}
										<option value={n}>{n}</option>
									{/each}
								</select>
								<svg class="pointer-events-none col-start-1 row-start-1 mr-2.5 size-4 self-center justify-self-end {t.euro}" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
									<path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
								</svg>
							</div>
						</div>

						<label class="block">
							<span class="mb-1 block text-xs font-medium {t.cardFieldLabel}">Description</span>
							<input
								type="text"
								bind:value={row.description}
								placeholder="Enter description"
								class="w-full rounded border px-3 py-2 text-sm focus:ring-1 focus:outline-none {t.input}"
							/>
						</label>

						<label class="block">
							<span class="mb-1 block text-xs font-medium {t.cardFieldLabel}">Amount (EUR)</span>
							<div class="relative">
								<span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm {t.euro}">&euro;</span>
								<input
									type="number"
									bind:value={row.amount}
									step="0.01"
									min="0"
									placeholder="0.00"
									class="w-full rounded border px-3 py-2 pr-8 text-right text-sm focus:ring-1 focus:outline-none {t.input}"
								/>
							</div>
						</label>

						<div>
							<span class="mb-1 block text-xs font-medium {t.cardFieldLabel}">Who Received</span>
							<div class="flex flex-wrap gap-1.5">
								{#each names as n}
									<label class="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors {row.whoReceived[n] ? t.pillOn : t.pillOff}">
										<input type="checkbox" bind:checked={row.whoReceived[n]} class="sr-only" />
										{n}
									</label>
								{/each}
							</div>
						</div>
					</div>
				</div>
			{/each}

			{#if rows.length === 0}
				<div class="rounded-lg border {t.card} p-8 text-center text-sm {t.emptyText}">
					No rows yet. Click "Add Row" to get started.
				</div>
			{/if}

			{#if rows.length > 0}
				<div class="rounded-lg border {t.totalBar} px-4 py-3">
					<div class="flex items-center justify-between">
						<span class="text-sm font-semibold {t.totalLabel}">Total</span>
						<span class="text-sm font-semibold {t.totalValue}">{formatEur(total)} &euro;</span>
					</div>
				</div>
			{/if}
		</div>

		<!-- Add row button -->
		<div class="mt-4">
			<button
				onclick={addRow}
				class="rounded-lg px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 {t.addBtn}"
			>
				+ Add Row
			</button>
		</div>

		<!-- Summary -->
		<h2 class="mt-10 mb-4 text-xl font-bold {t.title}">Summary per Person</h2>
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
			{#each summary as person}
				<div class="rounded-lg border p-4 shadow-sm {t.summaryCard}">
					<div class="mb-3 text-base font-semibold {t.summaryName}">{person.name}</div>
					<div class="space-y-1.5 text-sm">
						<div class="flex justify-between">
							<span class={t.summaryLabel}>Paid</span>
							<span class={t.summaryValue}>{formatEur(person.paid)} &euro;</span>
						</div>
						<div class="flex justify-between">
							<span class={t.summaryLabel}>Received</span>
							<span class={t.summaryValue}>{formatEur(person.received)} &euro;</span>
						</div>
						<div class="flex justify-between border-t pt-1.5 {t.summaryCard.includes('slate') ? 'border-slate-700' : t.summaryCard.includes('pink') ? 'border-pink-200' : 'border-gray-200'}">
							<span class="{t.summaryLabel} font-medium">Balance</span>
							<span class="font-semibold {person.balance >= 0 ? t.summaryPositive : t.summaryNegative}">
								{person.balance >= 0 ? '+' : ''}{formatEur(person.balance)} &euro;
							</span>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Settlements -->
		<h2 class="mt-10 mb-4 text-xl font-bold {t.title}">Settle Up</h2>
		{#if settlements.length === 0}
			<p class="text-sm {t.emptyText}">All settled up — no payments needed.</p>
		{:else}
			<div class="space-y-2">
				{#each settlements as s}
					<div class="flex items-center gap-3 rounded-lg border p-3 shadow-sm {t.settlementCard}">
						<span class="text-sm font-semibold {t.settlementFrom}">{s.from}</span>
						<svg class="h-4 w-4 shrink-0 {t.settlementArrow}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
						</svg>
						<span class="text-sm font-semibold {t.settlementTo}">{s.to}</span>
						<span class="ml-auto rounded-full px-2.5 py-0.5 text-sm font-semibold {t.settlementAmount}">
							{formatEur(s.amount)} &euro;
						</span>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Theme switcher -->
		<div class="mt-8 flex items-center gap-2">
			<span class="text-sm font-medium {t.title}">Theme:</span>
			{#each themes as theme, i}
				<button
					onclick={() => (themeIndex = i)}
					class="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors {themeIndex === i ? t.themeBtnActive : t.themeBtn}"
				>
					{theme.name}
				</button>
			{/each}
		</div>
	</div>
</div>

<style>
	input[type='number']::-webkit-inner-spin-button,
	input[type='number']::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	input[type='number'] {
		-moz-appearance: textfield;
	}
</style>
