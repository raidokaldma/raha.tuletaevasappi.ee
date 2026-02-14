<script lang="ts">
	const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];

	type Row = {
		id: number;
		name: string;
		description: string;
		amount: number | null;
	};

	let nextId = $state(5);

	let rows: Row[] = $state([
		{ id: 1, name: 'Alice', description: 'Office supplies', amount: 125.5 },
		{ id: 2, name: 'Bob', description: 'Software license', amount: 499.99 },
		{ id: 3, name: 'Charlie', description: 'Travel expenses', amount: 230.0 },
		{ id: 4, name: 'Diana', description: 'Marketing materials', amount: 75.0 }
	]);

	function addRow() {
		rows.push({ id: nextId++, name: names[0], description: '', amount: null });
	}

	function deleteRow(id: number) {
		rows = rows.filter((r) => r.id !== id);
	}

	function formatEur(value: number | null): string {
		if (value === null) return '';
		return value.toFixed(2);
	}

	let total = $derived(rows.reduce((sum, r) => sum + (r.amount ?? 0), 0));
</script>

<div class="min-h-screen bg-gray-50 p-4 md:p-8">
	<div class="mx-auto max-w-4xl">
		<h1 class="mb-6 text-2xl font-bold text-gray-900">Data Table</h1>

		<!-- Desktop table -->
		<div class="hidden md:block overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
			<table class="w-full">
				<thead class="sticky top-0 bg-gray-100">
					<tr>
						<th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
						<th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
						<th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount (EUR)</th>
						<th class="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-20"></th>
					</tr>
				</thead>
				<tbody>
					{#each rows as row (row.id)}
						<tr class="border-t border-gray-100 hover:bg-gray-50">
							<td class="px-4 py-2">
								<select
									bind:value={row.name}
									class="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
								>
									{#each names as n}
										<option value={n}>{n}</option>
									{/each}
								</select>
							</td>
							<td class="px-4 py-2">
								<input
									type="text"
									bind:value={row.description}
									placeholder="Enter description"
									class="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
								/>
							</td>
							<td class="px-4 py-2">
								<div class="relative">
									<span class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500">&euro;</span>
									<input
										type="number"
										bind:value={row.amount}
										step="0.01"
										min="0"
										placeholder="0.00"
										class="w-full rounded border border-gray-300 px-2 py-1.5 pr-7 text-right text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
									/>
								</div>
							</td>
							<td class="px-4 py-2 text-center">
								<button
									onclick={() => deleteRow(row.id)}
									class="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-1 focus:ring-red-500"
									title="Delete row"
								>
									Delete
								</button>
							</td>
						</tr>
					{/each}
					{#if rows.length === 0}
						<tr>
							<td colspan="4" class="px-4 py-8 text-center text-sm text-gray-500">
								No rows yet. Click "Add Row" to get started.
							</td>
						</tr>
					{/if}
				</tbody>
				<tfoot class="border-t-2 border-gray-200 bg-gray-50">
					<tr>
						<td colspan="2" class="px-4 py-3 text-sm font-semibold text-gray-700">Total</td>
						<td class="px-4 py-3 text-right text-sm font-semibold text-gray-900">{formatEur(total)} &euro;</td>
						<td></td>
					</tr>
				</tfoot>
			</table>
		</div>

		<!-- Mobile cards -->
		<div class="md:hidden space-y-3">
			{#each rows as row (row.id)}
				<div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
					<div class="mb-3 flex items-center justify-between">
						<span class="text-xs font-semibold uppercase tracking-wide text-gray-500">Entry</span>
						<button
							onclick={() => deleteRow(row.id)}
							class="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-1 focus:ring-red-500"
						>
							Delete
						</button>
					</div>

					<div class="space-y-3">
						<label class="block">
							<span class="mb-1 block text-xs font-medium text-gray-600">Name</span>
							<select
								bind:value={row.name}
								class="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
							>
								{#each names as n}
									<option value={n}>{n}</option>
								{/each}
							</select>
						</label>

						<label class="block">
							<span class="mb-1 block text-xs font-medium text-gray-600">Description</span>
							<input
								type="text"
								bind:value={row.description}
								placeholder="Enter description"
								class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
							/>
						</label>

						<label class="block">
							<span class="mb-1 block text-xs font-medium text-gray-600">Amount (EUR)</span>
							<div class="relative">
								<span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">&euro;</span>
								<input
									type="number"
									bind:value={row.amount}
									step="0.01"
									min="0"
									placeholder="0.00"
									class="w-full rounded border border-gray-300 px-3 py-2 pr-8 text-right text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
								/>
							</div>
						</label>
					</div>
				</div>
			{/each}

			{#if rows.length === 0}
				<div class="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
					No rows yet. Click "Add Row" to get started.
				</div>
			{/if}

			{#if rows.length > 0}
				<div class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
					<div class="flex items-center justify-between">
						<span class="text-sm font-semibold text-gray-700">Total</span>
						<span class="text-sm font-semibold text-gray-900">{formatEur(total)} &euro;</span>
					</div>
				</div>
			{/if}
		</div>

		<!-- Add row button -->
		<div class="mt-4">
			<button
				onclick={addRow}
				class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
			>
				+ Add Row
			</button>
		</div>
	</div>
</div>
