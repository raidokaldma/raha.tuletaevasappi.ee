<script lang="ts">
	import type { Theme } from '$lib/themes';
	import { formatAmount, type Settlement } from '$lib/utils';

	let {
		t,
		settlements
	}: {
		t: Theme;
		settlements: Settlement[];
	} = $props();
</script>

<h2 class="mt-10 mb-4 text-xl font-bold {t.title}">Who Pays Who</h2>
{#if settlements.length === 0}
	<div class="rounded-lg border {t.card} p-8 text-center text-sm {t.emptyText}">All settled up — no payments needed.</div>
{:else}
	<div class="grid grid-cols-1 gap-2 md:grid-cols-2">
		{#each settlements as s}
			<div class="flex items-center gap-3 rounded-lg border px-3 py-2 shadow-sm {t.settlementCard}">
				<span class="text-sm font-semibold {t.settlementFrom}">{s.from}</span>
				<svg class="h-3.5 w-3.5 shrink-0 {t.settlementArrow}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
					<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
				</svg>
				<span class="text-sm font-semibold {t.settlementTo}">{s.to}</span>
				<span class="ml-auto rounded-full px-2.5 py-0.5 text-sm font-semibold {t.settlementAmount}">
					{formatAmount(s.amount)} &euro;
				</span>
			</div>
		{/each}
	</div>
{/if}
