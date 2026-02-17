import { tick } from 'svelte';

export type MenuState = {
	open: boolean;
};

export function createMenuController(
	getState: () => MenuState,
	setState: (open: boolean) => void,
	getTrigger: () => HTMLButtonElement | undefined,
	itemSelector: string
) {
	async function openMenu() {
		setState(true);
		await tick();
		const firstItem = document.querySelector<HTMLButtonElement>(itemSelector);
		firstItem?.focus();
	}

	function closeMenu() {
		setState(false);
		getTrigger()?.focus();
	}

	function triggerClick(e: MouseEvent) {
		e.stopPropagation();
		if (getState().open) {
			closeMenu();
		} else {
			openMenu();
		}
	}

	function triggerKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown' && !getState().open) {
			openMenu();
		}
		if (e.key === 'Escape' && getState().open) {
			e.stopPropagation();
			closeMenu();
		}
	}

	function menuKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			closeMenu();
		}
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
			const container = e.currentTarget as HTMLElement;
			const items = [...container.querySelectorAll<HTMLButtonElement>(itemSelector)];
			const idx = items.indexOf(document.activeElement as HTMLButtonElement);
			const next = e.key === 'ArrowDown'
				? (idx + 1) % items.length
				: (idx - 1 + items.length) % items.length;
			items[next]?.focus();
		}
	}

	return { openMenu, closeMenu, triggerClick, triggerKeydown, menuKeydown };
}
