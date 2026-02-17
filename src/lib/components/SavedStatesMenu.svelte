<script lang="ts">
	import type { Theme } from '$lib/themes';
	import { createMenuController } from '$lib/menu';
	import { appState, savedStates, resetAll, restoreState, deleteSavedState } from '$lib/state.svelte';
	import { formatTime } from '$lib/utils';

	let {
		t,
		onopen
	}: {
		t: Theme;
		onopen?: () => void;
	} = $props();

	let menuOpen = $state(false);
	let resetBtn: HTMLButtonElement;

	const menu = createMenuController(
		() => ({ open: menuOpen }),
		(open) => {
			menuOpen = open;
			if (open) onopen?.();
		},
		() => resetBtn,
		'.reset-menu-item'
	);

	function handleDelete(e: MouseEvent, savedId: string) {
		e.stopPropagation();
		const isCurrent = savedId === appState.currentStateId;
		deleteSavedState(savedId);
		if (isCurrent) {
			resetAll(true);
			menuOpen = false;
			resetBtn?.focus();
		}
	}

	export function close() {
		menuOpen = false;
	}
</script>

<div class="relative flex">
	<button
		tabindex="0"
		onclick={() => resetAll()}
		class="rounded-l-lg border border-r-0 px-2.5 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 {t.focusRing} {t.themeBtn}"
		title="Start from scratch"
	>+ New</button>
	<button
		bind:this={resetBtn}
		tabindex="0"
		onclick={menu.triggerClick}
		onkeydown={menu.triggerKeydown}
		class="rounded-r-lg border px-1.5 py-2 transition-colors focus:outline-none focus:ring-2 {t.focusRing} {menuOpen ? t.themeBtnActive : t.themeBtn}"
		title="Saved events"
	>
		<svg class="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
			<path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
		</svg>
	</button>

	{#if menuOpen}
		<ul
			role="menu"
			class="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-md py-1 {t.menuDropdown}"
			style="top: 100%"
			onclick={(e) => e.stopPropagation()}
			onkeydown={menu.menuKeydown}
		>
			{#if savedStates.length > 0}
				{#each savedStates as saved}
					<li role="none" class="relative">
						<button
							role="menuitem"
							tabindex="0"
							onclick={() => { if (saved.id !== appState.currentStateId) { restoreState(saved.id); } menuOpen = false; resetBtn?.focus(); }}
							class="reset-menu-item flex w-full items-center px-4 py-2 pr-10 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-inset {t.focusRing} {saved.id === appState.currentStateId ? t.menuItemActive : t.menuItem}"
						>
							<span class="min-w-0 flex-1">
								<span class="block truncate">{saved.title || 'Untitled'}</span>
								<span class="block text-xs {t.emptyText}">{formatTime(saved.savedAt)}</span>
							</span>
						</button>
						<button
							tabindex="0"
							onclick={(e) => handleDelete(e, saved.id)}
							class="absolute right-2 top-1/2 -translate-y-1/2 shrink-0 rounded p-0.5 {t.deleteBtn} focus:outline-none focus:ring-2 {t.focusRing}"
							title="Delete saved state"
						>
							<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</li>
				{/each}
			{:else}
				<li class="px-4 py-2 text-sm {t.emptyText}">Nothing saved yet</li>
			{/if}
		</ul>
	{/if}
</div>
