<script lang="ts">
	import type { Theme } from '$lib/themes';
	import { appState, addName, removeName } from '$lib/state.svelte';

	let { t }: { t: Theme } = $props();
</script>

<h2 class="mt-6 mb-4 text-xl font-bold {t.title}">People</h2>
<div class="mb-4 flex flex-wrap items-center gap-2">
	{#each appState.names as name}
		<span class="inline-flex items-center gap-1 rounded-lg border pl-2.5 pr-1.5 py-1 text-xs font-medium {t.pillOn}">
			{name}
			<button tabindex="0" onclick={() => removeName(name)} class="rounded opacity-60 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 {t.focusRing}" title="Remove {name}">
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
			class="w-28 rounded-lg border px-2.5 py-1 text-xs focus:ring-2 focus:outline-none {t.focusRing} {t.input}"
		/>
		<button tabindex="0" type="submit" class="rounded-lg border border-transparent px-2.5 py-1 text-xs font-medium shadow-sm focus:outline-none focus:ring-2 {t.focusRing} {t.addBtn}">+ Add</button>
	</form>
</div>
