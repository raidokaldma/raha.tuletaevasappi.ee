<script lang="ts">
	import type { Theme } from '$lib/themes';
	import { appState, clampAmount, deleteRow } from '$lib/state.svelte';
	import { isRowInvalid, formatAmount } from '$lib/utils';

	let { t, total }: { t: Theme; total: number } = $props();

	let headerStuck = $state(false);
	let tableSentinel: HTMLDivElement;
	$effect(() => {
		if (!tableSentinel) return;
		const observer = new IntersectionObserver(
			([entry]) => { headerStuck = !entry.isIntersecting; },
			{ threshold: 1 }
		);
		observer.observe(tableSentinel);
		return () => observer.disconnect();
	});
</script>

<div class="hidden md:block overflow-clip rounded-lg border {t.tableWrapper} shadow-sm">
	<div bind:this={tableSentinel} class="h-0"></div>
	<table class="w-full">
		<thead class="sticky top-0 z-10 {t.thead}">
			<tr>
				<th class="w-[15%] px-2 py-3 text-left text-sm font-semibold {headerStuck ? '' : 'rounded-tl-lg'} {t.th}">Who Paid</th>
				<th class="w-[25%] px-2 py-3 text-left text-sm font-semibold {t.th}">For What</th>
				<th class="w-[15%] px-2 py-3 text-right text-sm font-semibold {t.th}">Amount</th>
				<th class="px-2 py-3 text-left text-sm font-semibold {t.th}">Split Between</th>
				<th class="w-[5%] px-2 py-3 text-center text-sm font-semibold {headerStuck ? '' : 'rounded-tr-lg'} {t.th}"></th>
			</tr>
		</thead>
		<tbody>
			{#each appState.rows as row (row.id)}
				{@const invalid = isRowInvalid(row)}
				<tr class="border-t {t.rowBorder} {invalid ? t.rowInvalid : t.row}">
					<td class="px-2 py-2">
						<div class="grid grid-cols-1">
							<select
								bind:value={row.whoPaid}
								data-row-id={row.id}
								aria-label="Who paid"
								class="col-start-1 row-start-1 w-full appearance-none rounded-md border py-1.5 pl-2 pr-8 text-sm focus:ring-2 focus:outline-none {t.focusRing} {t.input}"
							>
								<option value="">—</option>
								{#each appState.names as n}
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
							maxlength={60}
							class="w-full rounded border px-2 py-1.5 text-sm focus:ring-2 focus:outline-none {t.focusRing} {t.input}"
						/>
					</td>
					<td class="px-2 py-2">
						<div class="relative">
							<span class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm {t.euro}">&euro;</span>
							<input
								type="number"
								bind:value={row.amount}
								oninput={() => clampAmount(row)}
								step="0.01"
								min="0"
								placeholder="0.00"
								class="w-full rounded border px-2 py-1.5 pr-7 text-right text-sm focus:ring-2 focus:outline-none {t.focusRing} {t.input}"
							/>
						</div>
					</td>
					<td class="px-2 py-2">
						<div class="flex flex-wrap gap-1.5">
							{#each appState.names as n}
								<button type="button" tabindex="0" onclick={() => row.whoReceived[n] = !row.whoReceived[n]} class="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors focus:ring-2 focus:outline-none {t.focusRing} {row.whoReceived[n] ? t.pillOn : t.pillOff}">
									{n}
								</button>
							{/each}
							{#if appState.names.length === 0}
								<span class="text-xs {t.emptyText}">Add people first</span>
							{/if}
						</div>
					</td>
					<td class="px-2 py-2 text-center">
						<button
							tabindex="0"
							onclick={() => deleteRow(row.id)}
							class="rounded p-1 focus:outline-none focus:ring-2 {t.focusRing} {t.deleteBtn}"
							title="Delete row"
						>
							<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</td>
				</tr>
			{/each}
			{#if appState.rows.length === 0}
				<tr>
					<td colspan="5" class="px-2 py-8 text-center text-sm {t.emptyText}">
						No rows yet. Click "Add Row" to get started.
					</td>
				</tr>
			{/if}
		</tbody>
	</table>
	<div class="border-t-2 {t.tfoot}">
		<div class="flex px-2 py-3">
			<span class="w-[40%] text-sm font-semibold {t.tfootLabel}">Total</span>
			<span class="w-[15%] text-right text-sm font-semibold {t.tfootValue}">{formatAmount(total)} &euro;</span>
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
