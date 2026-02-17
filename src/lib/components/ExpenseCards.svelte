<script lang="ts">
	import { tick } from 'svelte';
	import type { Theme } from '$lib/themes';
	import { appState, clampAmount, deleteRow } from '$lib/state.svelte';
	import { isRowInvalid, formatAmount } from '$lib/utils';

	let { t, total }: { t: Theme; total: number } = $props();

	// Single set tracks cards the user has manually toggled.
	// Cards default to collapsed unless invalid.
	let manuallyToggled: Set<number> = $state(new Set());

	function isExpanded(id: number): boolean {
		const row = appState.rows.find((r) => r.id === id);
		const defaultExpanded = row ? isRowInvalid(row) : false;
		if (manuallyToggled.has(id)) return !defaultExpanded;
		return defaultExpanded;
	}

	export async function expandCard(id: number) {
		const row = appState.rows.find((r) => r.id === id);
		const defaultExpanded = row ? isRowInvalid(row) : false;
		if (defaultExpanded) {
			manuallyToggled = new Set([...manuallyToggled].filter((x) => x !== id));
		} else {
			manuallyToggled = new Set([...manuallyToggled, id]);
		}
		await tick();
		const els = document.querySelectorAll<HTMLSelectElement>(`select[data-row-id="${id}"]`);
		for (const el of els) {
			if (el.offsetParent !== null) { el.focus(); break; }
		}
	}

	async function toggleCard(id: number) {
		if (isExpanded(id)) {
			// Collapse
			const row = appState.rows.find((r) => r.id === id);
			const defaultExpanded = row ? isRowInvalid(row) : false;
			if (defaultExpanded) {
				manuallyToggled = new Set([...manuallyToggled, id]);
			} else {
				manuallyToggled = new Set([...manuallyToggled].filter((x) => x !== id));
			}
		} else {
			// Expand
			expandCard(id);
			await tick();
			const els = document.querySelectorAll<HTMLSelectElement>(`select[data-row-id="${id}"]`);
			for (const el of els) {
				if (el.offsetParent !== null) { el.focus(); break; }
			}
		}
	}
</script>

<div class="md:hidden space-y-1.5">
	{#each appState.rows as row (row.id)}
		{#if isExpanded(row.id)}
			<!-- Expanded card -->
			<div class="rounded-lg border {t.card} {isRowInvalid(row) ? t.rowInvalid : ''} px-3 py-2 shadow-sm" aria-invalid={isRowInvalid(row) || undefined}>
				<div class="mb-3 flex w-full items-center justify-between">
					<button
						tabindex="0"
						onclick={() => toggleCard(row.id)}
						class="flex flex-1 cursor-pointer items-center gap-1 rounded pr-1 py-0.5 text-xs font-semibold uppercase tracking-wide focus:outline-none focus:ring-2 {t.focusRing} {t.cardLabel}"
					>
						<svg class="h-4 w-4 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
						</svg>
						Entry
					</button>
					<button
						tabindex="0"
						onclick={() => deleteRow(row.id)}
						class="rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 {t.focusRing} {t.deleteBtn}"
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
								data-row-id={row.id}
								aria-label="Who paid"
								class="col-start-1 row-start-1 w-full appearance-none rounded-md border py-2 pl-3 pr-8 text-sm focus:ring-2 focus:outline-none {t.focusRing} {t.input}"
							>
								<option value="">—</option>
								{#each appState.names as n}
									<option value={n}>{n}</option>
								{/each}
							</select>
							<svg class="pointer-events-none col-start-1 row-start-1 mr-2.5 size-4 self-center justify-self-end {t.euro}" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
								<path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
							</svg>
						</div>
					</div>

					<label class="block">
						<span class="mb-1 block text-xs font-medium {t.cardFieldLabel}">For What</span>
						<input
							type="text"
							bind:value={row.description}
							placeholder="Enter description"
							maxlength={60}
							class="w-full rounded border px-3 py-2 text-sm focus:ring-2 focus:outline-none {t.focusRing} {t.input}"
						/>
					</label>

					<label class="block">
						<span class="mb-1 block text-xs font-medium {t.cardFieldLabel}">Amount</span>
						<div class="relative">
							<span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm {t.euro}">&euro;</span>
							<input
								type="number"
								bind:value={row.amount}
								oninput={() => clampAmount(row)}
								step="0.01"
								min="0"
								placeholder="0.00"
								class="w-full rounded border px-3 py-2 pr-8 text-right text-sm focus:ring-2 focus:outline-none {t.focusRing} {t.input}"
							/>
						</div>
					</label>

					<div>
						<span class="mb-1 block text-xs font-medium {t.cardFieldLabel}">Split Between</span>
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
					</div>
				</div>
			</div>
		{:else}
			<!-- Collapsed compact card -->
			<button
				tabindex="0"
				onclick={() => toggleCard(row.id)}
				class="w-full cursor-pointer rounded-lg border text-left {t.card} {isRowInvalid(row) ? t.rowInvalid : ''} px-3 py-2 shadow-sm focus:outline-none focus:ring-2 {t.focusRing}"
			>
				<div class="pb-1 flex items-center gap-2">
					<svg class="h-4 w-4 shrink-0 {t.cardLabel}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
					</svg>
					<span class="shrink-0 text-sm font-medium {t.title}">{row.whoPaid || '—'}</span>
					<span class="min-w-0 flex-1 truncate text-sm {t.cardLabel}">{row.description || 'No description'}</span>
					<span class="shrink-0 text-sm font-semibold {t.totalValue}">{row.amount ? formatAmount(row.amount) + ' \u20AC' : '—'}</span>
				</div>
				{#if appState.names.some(n => row.whoReceived[n])}
					<div class="mt-1 flex flex-wrap items-center gap-1 pl-0">
						{#each appState.names.filter(n => row.whoReceived[n]) as r}
							<span class="whitespace-nowrap rounded px-1.5 py-0.5 text-xs {t.pillOn}">{r}</span>
						{/each}
					</div>
				{/if}
			</button>
		{/if}
	{/each}

	{#if appState.rows.length === 0}
		<div class="rounded-lg border {t.card} p-8 text-center text-sm {t.emptyText}">
			No rows yet. Click "Add Row" to get started.
		</div>
	{/if}

	{#if appState.rows.length > 0}
		<div class="rounded-lg border {t.totalBar} px-3 py-2">
			<div class="flex items-center justify-between">
				<span class="text-sm font-semibold {t.totalLabel}">Total</span>
				<span class="text-sm font-semibold {t.totalValue}">{formatAmount(total)} &euro;</span>
			</div>
		</div>
	{/if}
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
