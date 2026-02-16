<script lang="ts">
	import { tick } from 'svelte';
	import { appState, addName, removeName, addRow, deleteRow, clampAmount, resetAll, restoreState, deleteSavedState, savedStates, type Row } from '$lib/state.svelte';

	function isRowInvalid(row: Row): boolean {
		return !row.whoPaid || (!!row.amount && !Object.values(row.whoReceived).some(Boolean));
	}

	function formatEur(value: number | null): string {
		if (value === null) return '';
		return value.toFixed(2);
	}

	function formatTime(ts: number): string {
		const d = new Date(ts);
		const now = new Date();
		const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		if (d.toDateString() === now.toDateString()) return `Today ${time}`;
		const yesterday = new Date(now);
		yesterday.setDate(yesterday.getDate() - 1);
		if (d.toDateString() === yesterday.toDateString()) return `Yesterday ${time}`;
		return `${d.toLocaleDateString([], { day: 'numeric', month: 'short' })} ${time}`;
	}

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
		pageColor: string;
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
		focusRing: string;
		themeBtn: string;
		themeBtnActive: string;
		menuDropdown: string;
		menuItem: string;
		menuItemActive: string;
	};

	const themes: Theme[] = [
		{
			name: 'Light',
			page: 'bg-gray-50',
			pageColor: '#f9fafb',
			title: 'text-gray-900',
			tableWrapper: 'border-gray-200 bg-white',
			thead: 'bg-gray-100/80 backdrop-blur-md shadow-[0_1px_0_0_rgb(229,231,235)]',
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
			tfoot: 'border-gray-200 bg-gray-100',
			tfootLabel: 'text-gray-700',
			tfootValue: 'text-gray-900',
			card: 'border-gray-200 bg-white',
			cardLabel: 'text-gray-500',
			cardFieldLabel: 'text-gray-600',
			totalBar: 'border-gray-200 bg-gray-100',
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
			rowInvalid: 'bg-red-50!',
			focusRing: 'focus:ring-blue-500',
			themeBtn: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100',
			themeBtnActive: 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500',
			menuDropdown: 'bg-white ring-1 ring-black/5 shadow-lg',
			menuItem: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
			menuItemActive: 'bg-gray-100 text-gray-900'
		},
		{
			name: 'Midnight',
			page: 'bg-slate-900',
			pageColor: '#0f172a',
			title: 'text-slate-100',
			tableWrapper: 'border-slate-700 bg-slate-800',
			thead: 'bg-slate-700/80 backdrop-blur-md shadow-[0_1px_0_0_rgb(51,65,85)]',
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
			tfoot: 'border-slate-600 bg-slate-700',
			tfootLabel: 'text-slate-300',
			tfootValue: 'text-slate-100',
			card: 'border-slate-700 bg-slate-800',
			cardLabel: 'text-slate-400',
			cardFieldLabel: 'text-slate-400',
			totalBar: 'border-slate-700 bg-slate-700',
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
			rowInvalid: 'bg-red-900/20!',
			focusRing: 'focus:ring-blue-400',
			themeBtn: 'border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700',
			themeBtnActive: 'border-blue-400 bg-blue-900/40 text-blue-300 ring-1 ring-blue-400',
			menuDropdown: 'bg-slate-800 ring-1 ring-white/10 shadow-lg',
			menuItem: 'text-slate-300 hover:bg-slate-700 hover:text-slate-100',
			menuItemActive: 'bg-slate-700 text-slate-100'
		},
		{
			name: 'Pink Pastel',
			page: 'bg-pink-50',
			pageColor: '#fdf2f8',
			title: 'text-pink-900',
			tableWrapper: 'border-pink-200 bg-white',
			thead: 'bg-pink-100/80 backdrop-blur-md shadow-[0_1px_0_0_rgb(251,207,232)]',
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
			tfoot: 'border-pink-200 bg-pink-100',
			tfootLabel: 'text-pink-700',
			tfootValue: 'text-pink-900',
			card: 'border-pink-200 bg-white',
			cardLabel: 'text-pink-400',
			cardFieldLabel: 'text-pink-600',
			totalBar: 'border-pink-200 bg-pink-100',
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
			rowInvalid: 'bg-rose-50!',
			focusRing: 'focus:ring-pink-400',
			themeBtn: 'border-pink-300 bg-white text-pink-700 hover:bg-pink-100',
			themeBtnActive: 'border-pink-500 bg-pink-100 text-pink-800 ring-1 ring-pink-500',
			menuDropdown: 'bg-white ring-1 ring-black/5 shadow-lg',
			menuItem: 'text-pink-700 hover:bg-pink-100 hover:text-pink-900',
			menuItemActive: 'bg-pink-100 text-pink-900'
		}
	];

	const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
	function loadThemeName(): string {
		if (typeof window === 'undefined') return themes[0].name;
		const saved = localStorage.getItem('theme');
		if (saved !== null && themes.some((th) => th.name === saved)) return saved;
		return prefersDark ? 'Midnight' : themes[0].name;
	}
	let themeName = $state(loadThemeName());
	$effect(() => { localStorage.setItem('theme', themeName); });
	let t = $derived(themes.find((th) => th.name === themeName) ?? themes[0]);
	$effect(() => { document.documentElement.style.backgroundColor = t.pageColor; });

	let menuOpen = $state(false);
	let themeBtn: HTMLButtonElement;

	let resetMenuOpen = $state(false);
	let resetBtn: HTMLButtonElement;

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

	let expandedCards: Set<number> = $state(new Set());
	let collapsedCards: Set<number> = $state(new Set());

	// Keep invalid rows in expandedCards so they stay open after the error is fixed
	$effect(() => {
		const toAdd = appState.rows
			.filter(row => isRowInvalid(row) && !collapsedCards.has(row.id) && !expandedCards.has(row.id))
			.map(row => row.id);
		if (toAdd.length > 0) {
			expandedCards = new Set([...expandedCards, ...toAdd]);
		}
	});

	async function toggleCard(id: number) {
		if (expandedCards.has(id) || (isRowInvalid(appState.rows.find(r => r.id === id)!) && !collapsedCards.has(id))) {
			expandedCards = new Set([...expandedCards].filter(x => x !== id));
			collapsedCards = new Set([...collapsedCards, id]);
		} else {
			expandedCards = new Set([...expandedCards, id]);
			collapsedCards = new Set([...collapsedCards].filter(x => x !== id));
			await tick();
			const els = document.querySelectorAll<HTMLSelectElement>(`select[data-row-id="${id}"]`);
			for (const el of els) {
				if (el.offsetParent !== null) { el.focus(); break; }
			}
		}
	}
</script>

<svelte:head>
	<title>{appState.title || 'Untitled'}</title>
</svelte:head>

<svelte:window onclick={() => { menuOpen = false; resetMenuOpen = false; }} />

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
				<!-- Theme menu -->
				<div class="relative">
					<button
						bind:this={themeBtn}
						tabindex="0"
						onclick={async (e) => { e.stopPropagation(); menuOpen = !menuOpen; if (menuOpen) { await tick(); document.querySelector<HTMLButtonElement>('.theme-menu-item')?.focus(); } }}
						onkeydown={async (e) => { if (e.key === 'ArrowDown' && !menuOpen) { menuOpen = true; await tick(); document.querySelector<HTMLButtonElement>('.theme-menu-item')?.focus(); } if (e.key === 'Escape' && menuOpen) { e.stopPropagation(); menuOpen = false; themeBtn?.focus(); } }}
						class="rounded-lg border p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 {t.focusRing} {menuOpen ? t.themeBtnActive : t.themeBtn}"
						title="Change theme"
					>
						{#if themeName === 'Midnight'}
							<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
							</svg>
						{:else}
							<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
							</svg>
						{/if}
					</button>

					{#if menuOpen}
						<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
						<div
							class="absolute right-0 z-20 mt-2 w-40 origin-top-right rounded-md py-1 {t.menuDropdown}"
							onclick={(e) => e.stopPropagation()}
							onkeydown={(e) => {
								if (e.key === 'Escape') { menuOpen = false; themeBtn?.focus(); }
								if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
									e.preventDefault();
									const items = [...e.currentTarget.querySelectorAll('button')];
									const idx = items.indexOf(document.activeElement as HTMLButtonElement);
									const next = e.key === 'ArrowDown' ? (idx + 1) % items.length : (idx - 1 + items.length) % items.length;
									items[next]?.focus();
								}
							}}
						>
							{#each themes as theme, i}
								<button
									tabindex="0"
									onclick={() => { themeName = theme.name; menuOpen = false; themeBtn?.focus(); }}
									class="theme-menu-item block w-full px-4 py-2 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-inset {t.focusRing} {themeName === theme.name ? t.menuItemActive : t.menuItem}"
								>
									{theme.name}
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<!-- New + saved states split button -->
				<div class="relative flex">
					<button
						tabindex="0"
						onclick={() => resetAll()}
						class="rounded-l-lg border border-r-0 px-2.5 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 {t.focusRing} {t.themeBtn}"
						title="Start from scratch"
					>+ New</button>
					<button
						bind:this={resetBtn}
						tabindex="0"
						onclick={async (e) => { e.stopPropagation(); resetMenuOpen = !resetMenuOpen; if (resetMenuOpen) { await tick(); document.querySelector<HTMLButtonElement>('.reset-menu-item')?.focus(); } }}
						onkeydown={async (e) => { if (e.key === 'ArrowDown' && !resetMenuOpen) { resetMenuOpen = true; await tick(); document.querySelector<HTMLButtonElement>('.reset-menu-item')?.focus(); } if (e.key === 'Escape' && resetMenuOpen) { e.stopPropagation(); resetMenuOpen = false; resetBtn?.focus(); } }}
						class="rounded-r-lg border px-1.5 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 {t.focusRing} {resetMenuOpen ? t.themeBtnActive : t.themeBtn}"
						title="Saved events"
					>
						<svg class="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
							<path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
						</svg>
					</button>

					{#if resetMenuOpen}
						<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
						<div
							class="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-md py-1 {t.menuDropdown}"
							style="top: 100%"
							onclick={(e) => e.stopPropagation()}
							onkeydown={(e) => {
								if (e.key === 'Escape') { resetMenuOpen = false; resetBtn?.focus(); }
								if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
									e.preventDefault();
									const items = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('.reset-menu-item')];
									const idx = items.indexOf(document.activeElement as HTMLButtonElement);
									const next = e.key === 'ArrowDown' ? (idx + 1) % items.length : (idx - 1 + items.length) % items.length;
									items[next]?.focus();
								}
							}}
						>
							{#if savedStates.length > 0}
								{#each savedStates as saved}
									<button
										tabindex="0"
										onclick={() => { if (saved.id !== appState.currentStateId) { restoreState(saved.id); } resetMenuOpen = false; resetBtn?.focus(); }}
										class="reset-menu-item flex w-full items-center gap-1 px-4 py-2 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-inset {t.focusRing} {saved.id === appState.currentStateId ? t.menuItemActive : t.menuItem}"
									>
										<span class="min-w-0 flex-1">
											<span class="block truncate">{saved.title || 'Untitled'}</span>
											<span class="block text-xs {t.emptyText}">{formatTime(saved.savedAt)}</span>
										</span>
										<!-- svelte-ignore a11y_no_static_element_interactions -->
										<span
											role="button"
											tabindex="0"
											onclick={(e) => { e.stopPropagation(); const isCurrent = saved.id === appState.currentStateId; deleteSavedState(saved.id); if (isCurrent) { resetAll(true); resetMenuOpen = false; resetBtn?.focus(); } }}
											onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); const isCurrent = saved.id === appState.currentStateId; deleteSavedState(saved.id); if (isCurrent) { resetAll(true); resetMenuOpen = false; resetBtn?.focus(); } } }}
											class="shrink-0 rounded p-0.5 {t.deleteBtn}"
											title="Delete saved state"
										>
											<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
												<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
											</svg>
										</span>
									</button>
								{/each}
							{:else}
								<div class="px-4 py-2 text-sm {t.emptyText}">Nothing saved yet</div>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- People -->
		<h2 class="mt-6 mb-4 text-xl font-bold {t.title}">People</h2>
		<div class="mb-4 flex flex-wrap items-center gap-2">
			{#each appState.names as name}
				<span class="inline-flex items-center gap-1 rounded-lg border pl-2.5 pr-1.5 py-1 text-xs font-medium {t.pillOn}">
					{name}
					<button tabindex="0" onclick={() => removeName(name)} class="rounded opacity-60 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-1 {t.focusRing}" title="Remove {name}">
						<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</span>
			{/each}
			<form onsubmit={(e) => { e.preventDefault(); addName(); }} class="inline-flex items-center gap-1">
				<input
					type="text"
					bind:value={appState.newName}
					placeholder="Add person"
					maxlength={15}
					class="w-28 rounded-lg border px-2.5 py-1 text-xs focus:ring-1 focus:outline-none {t.input}"
				/>
				<button tabindex="0" type="submit" class="rounded-lg border border-transparent px-2.5 py-1 text-xs font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 {t.addBtn}">+ Add</button>
			</form>
		</div>

		<h2 class="mt-6 mb-4 text-xl font-bold {t.title}">Expenses</h2>

		<!-- Desktop table -->
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
						<tr class="border-t {t.rowBorder} {isRowInvalid(row) ? t.rowInvalid : t.row}">
							<td class="px-2 py-2">
								<div class="grid grid-cols-1">
									<select
										bind:value={row.whoPaid}
										data-row-id={row.id}
										class="col-start-1 row-start-1 w-full appearance-none rounded-md border py-1.5 pl-2 pr-8 text-sm focus:ring-1 focus:outline-none {t.select}"
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
									class="w-full rounded border px-2 py-1.5 text-sm focus:ring-1 focus:outline-none {t.input}"
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
										class="w-full rounded border px-2 py-1.5 pr-7 text-right text-sm focus:ring-1 focus:outline-none {t.input}"
									/>
								</div>
							</td>
							<td class="px-2 py-2">
								<div class="flex flex-wrap gap-1.5">
									{#each appState.names as n}
										<button type="button" tabindex="0" onclick={() => row.whoReceived[n] = !row.whoReceived[n]} class="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none {t.focusRing} {row.whoReceived[n] ? t.pillOn : t.pillOff}">
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
									class="rounded p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 {t.focusRing} {t.deleteBtn}"
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
					<span class="w-[15%] text-right text-sm font-semibold {t.tfootValue}">{formatEur(total)} &euro;</span>
				</div>
			</div>
		</div>

		<!-- Mobile cards -->
		<div class="md:hidden space-y-1.5">
			{#each appState.rows as row (row.id)}
				{#if expandedCards.has(row.id) || (isRowInvalid(row) && !collapsedCards.has(row.id))}
					<!-- Expanded card -->
					<div class="rounded-lg border {t.card} {isRowInvalid(row) ? t.rowInvalid : ''} px-3 py-2 shadow-sm">
						<div class="mb-3 flex w-full items-center justify-between">
							<button
								tabindex="0"
								onclick={() => toggleCard(row.id)}
								class="flex flex-1 cursor-pointer items-center gap-1 rounded pr-1 py-0.5 text-xs font-semibold uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-offset-2 {t.focusRing} {t.cardLabel}"
							>
								<svg class="h-4 w-4 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
								</svg>
								Entry
							</button>
							<button
								tabindex="0"
								onclick={() => deleteRow(row.id)}
								class="rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 {t.focusRing} {t.deleteBtn}"
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
										class="col-start-1 row-start-1 w-full appearance-none rounded-md border py-2 pl-3 pr-8 text-sm focus:ring-1 focus:outline-none {t.select}"
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
									class="w-full rounded border px-3 py-2 text-sm focus:ring-1 focus:outline-none {t.input}"
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
										class="w-full rounded border px-3 py-2 pr-8 text-right text-sm focus:ring-1 focus:outline-none {t.input}"
									/>
								</div>
							</label>

							<div>
								<span class="mb-1 block text-xs font-medium {t.cardFieldLabel}">Split Between</span>
								<div class="flex flex-wrap gap-1.5">
									{#each appState.names as n}
										<button type="button" tabindex="0" onclick={() => row.whoReceived[n] = !row.whoReceived[n]} class="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none {t.focusRing} {row.whoReceived[n] ? t.pillOn : t.pillOff}">
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
						class="w-full cursor-pointer rounded-lg border text-left {t.card} {isRowInvalid(row) ? t.rowInvalid : ''} px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 {t.focusRing}"
					>
						<div class="pb-1 flex items-center gap-2">
							<svg class="h-4 w-4 shrink-0 {t.cardLabel}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
							</svg>
							<span class="shrink-0 text-sm font-medium {t.title}">{row.whoPaid || '—'}</span>
							<span class="min-w-0 flex-1 truncate text-sm {t.cardLabel}">{row.description || 'No description'}</span>
							<span class="shrink-0 text-sm font-semibold {t.totalValue}">{row.amount ? formatEur(row.amount) + ' \u20AC' : '—'}</span>
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
						<span class="text-sm font-semibold {t.totalValue}">{formatEur(total)} &euro;</span>
					</div>
				</div>
			{/if}
		</div>

		<!-- Add row button -->
		<div class="mt-4">
			<button
				tabindex="0"
				onclick={async () => {
					const id = appState.nextId;
					addRow();
					expandedCards = new Set([...expandedCards, id]);
					await tick();
					const els = document.querySelectorAll<HTMLSelectElement>(`select[data-row-id="${id}"]`);
					for (const el of els) {
						if (el.offsetParent !== null) { el.focus(); break; }
					}
				}}
				class="rounded-lg px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 {t.addBtn}"
			>
				+ Add Row
			</button>
		</div>

		<!-- Summary -->
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
		{/if}

		<!-- Settlements -->
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
							{formatEur(s.amount)} &euro;
						</span>
					</div>
				{/each}
			</div>
		{/if}

		{#if currentSavedAt}
			<div class="mt-10 text-center text-xs {t.emptyText}">Last edited {formatTime(currentSavedAt)}</div>
		{/if}

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
