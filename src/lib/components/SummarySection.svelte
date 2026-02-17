<script lang="ts">
	import type { Theme } from '$lib/themes';
	import { appState } from '$lib/state.svelte';
	import { formatAmount } from '$lib/utils';

	let {
		t,
		summary
	}: {
		t: Theme;
		summary: { name: string; paid: number; received: number; balance: number }[];
	} = $props();
</script>

<h2 class="mt-10 mb-4 text-xl font-bold {t.title}">Summary</h2>
{#if appState.names.length === 0 || appState.rows.length === 0}
	<div class="rounded-lg border {t.card} p-8 text-center text-sm {t.emptyText}">Add people and expenses to see a summary.</div>
{:else}
	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
		{#each summary as person}
			<div class="rounded-lg border px-3 py-2 shadow-sm {t.summaryCard}">
				<div class="mb-3 text-base font-semibold {t.summaryName}">{person.name}</div>
				<div class="space-y-1.5 text-sm">
					<div class="flex justify-between">
						<span class={t.summaryLabel}>Paid</span>
						<span class={t.summaryValue}>{formatAmount(person.paid)} &euro;</span>
					</div>
					<div class="flex justify-between">
						<span class={t.summaryLabel}>Their cut</span>
						<span class={t.summaryValue}>{formatAmount(person.received)} &euro;</span>
					</div>
					<div class="flex justify-between border-t pt-1.5 {t.summaryDivider}">
						<span class="{t.summaryLabel} font-medium">Balance</span>
						<span class="font-semibold {person.balance >= 0 ? t.summaryPositive : t.summaryNegative}">
							{person.balance >= 0 ? '+' : ''}{formatAmount(person.balance)} &euro;
						</span>
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}
