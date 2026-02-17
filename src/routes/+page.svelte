<script lang="ts">
	import { themes, type Theme } from '$lib/themes';
	import { appState, addRow, savedStates } from '$lib/state.svelte';
	import { isRowInvalid, formatTime, calculateSettlements } from '$lib/utils';
	import ThemeMenu from '$lib/components/ThemeMenu.svelte';
	import SavedStatesMenu from '$lib/components/SavedStatesMenu.svelte';
	import PeopleSection from '$lib/components/PeopleSection.svelte';
	import ExpenseTable from '$lib/components/ExpenseTable.svelte';
	import ExpenseCards from '$lib/components/ExpenseCards.svelte';
	import SummarySection from '$lib/components/SummarySection.svelte';
	import SettlementsSection from '$lib/components/SettlementsSection.svelte';

	let total = $derived(appState.rows.reduce((sum, r) => sum + (r.amount ?? 0), 0));
	let currentSavedAt = $derived(savedStates.find((s) => s.id === appState.currentStateId)?.savedAt);

	let validRows = $derived(appState.rows.filter((r) => !isRowInvalid(r)));

	let summary = $derived(
		appState.names.map((name) => {
			const paid = validRows
				.filter((r) => r.whoPaid === name)
				.reduce((sum, r) => sum + (r.amount ?? 0), 0);

			const received = validRows.reduce((sum, r) => {
				if (!r.whoReceived[name] || !r.amount) return sum;
				const receiverCount = Object.values(r.whoReceived).filter(Boolean).length;
				return sum + (receiverCount > 0 ? r.amount / receiverCount : 0);
			}, 0);

			return { name, paid, received, balance: paid - received };
		})
	);

	let settlements = $derived(calculateSettlements(summary));

	// Theme management
	const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
	function loadThemeName(): string {
		if (typeof window === 'undefined') return themes[0].name;
		const saved = localStorage.getItem('theme');
		if (saved !== null && themes.some((th) => th.name === saved)) return saved;
		return prefersDark ? 'Midnight' : themes[0].name;
	}
	let themeName = $state(loadThemeName());
	$effect(() => { localStorage.setItem('theme', themeName); });
	let t: Theme = $derived(themes.find((th) => th.name === themeName) ?? themes[0]);
	$effect(() => { document.documentElement.style.backgroundColor = t.pageColor; });

	let expenseCards: ExpenseCards;
	let themeMenu: ThemeMenu;
	let savedStatesMenu: SavedStatesMenu;
</script>

<svelte:head>
	<title>{appState.title || 'Untitled'}</title>
</svelte:head>

<div class="min-h-screen {t.page} p-4 md:p-8 transition-colors duration-300">
	<div class="mx-auto max-w-4xl">
		<div class="mb-6 flex items-center justify-between gap-4">
			<div class="group flex min-w-0 flex-1 items-center gap-2 rounded-lg px-3 py-1 -mx-3 -my-1 transition-colors {themeName === 'Midnight' ? 'hover:bg-white/10' : 'hover:bg-black/10'}">
				<input
					type="text"
					bind:value={appState.title}
					class="block w-full border-none bg-transparent text-3xl font-extrabold tracking-tight focus:outline-none {t.title} placeholder:opacity-30"
					placeholder="Untitled"
					maxlength={30}
				/>
				<svg class="h-5 w-5 shrink-0 opacity-20 transition-opacity group-hover:opacity-40 {t.title}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
				</svg>
			</div>

			<div class="flex shrink-0 items-center gap-1">
				<ThemeMenu bind:this={themeMenu} bind:themeName {t} onopen={() => savedStatesMenu?.close()} />
				<SavedStatesMenu bind:this={savedStatesMenu} {t} onopen={() => themeMenu?.close()} />
			</div>
		</div>

		<PeopleSection {t} />

		<h2 class="mt-6 mb-4 text-xl font-bold {t.title}">Expenses</h2>

		<ExpenseTable {t} {total} />
		<ExpenseCards bind:this={expenseCards} {t} {total} />

		<!-- Add row button -->
		<div class="mt-4">
			<button
				tabindex="0"
				onclick={() => {
					const id = appState.nextId;
					addRow();
					expenseCards?.expandCard(id);
				}}
				class="rounded-lg px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 {t.focusRing} {t.addBtn}"
			>
				+ Add Row
			</button>
		</div>

		<SummarySection {t} {summary} />
		<SettlementsSection {t} {settlements} />

		{#if currentSavedAt}
			<div class="mt-10 text-center text-xs {t.emptyText}">Last edited {formatTime(currentSavedAt)}</div>
		{/if}
	</div>
</div>
