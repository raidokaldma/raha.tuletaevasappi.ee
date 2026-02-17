<script lang="ts">
	import { type Theme, themes } from '$lib/themes';
	import { createMenuController } from '$lib/menu';

	let {
		themeName = $bindable(),
		t,
		onopen
	}: {
		themeName: string;
		t: Theme;
		onopen?: () => void;
	} = $props();

	let menuOpen = $state(false);
	let themeBtn: HTMLButtonElement;

	const menu = createMenuController(
		() => ({ open: menuOpen }),
		(open) => {
			menuOpen = open;
			if (open) onopen?.();
		},
		() => themeBtn,
		'.theme-menu-item'
	);

	export function close() {
		menuOpen = false;
	}
</script>

<div class="relative">
	<button
		bind:this={themeBtn}
		tabindex="0"
		onclick={menu.triggerClick}
		onkeydown={menu.triggerKeydown}
		class="rounded-lg border p-2 transition-colors focus:outline-none focus:ring-2 {t.focusRing} {menuOpen ? t.themeBtnActive : t.themeBtn}"
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
		<ul
			role="menu"
			class="absolute right-0 z-20 mt-2 w-40 origin-top-right rounded-md py-1 {t.menuDropdown}"
			onclick={(e) => e.stopPropagation()}
			onkeydown={menu.menuKeydown}
		>
			{#each themes as theme}
				<li role="none">
					<button
						role="menuitem"
						tabindex="0"
						onclick={() => { themeName = theme.name; menuOpen = false; themeBtn?.focus(); }}
						class="theme-menu-item block w-full px-4 py-2 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-inset {t.focusRing} {themeName === theme.name ? t.menuItemActive : t.menuItem}"
					>
						{theme.name}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
