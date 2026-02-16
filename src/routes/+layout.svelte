<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="description" content="Split expenses with friends. Track who paid, who owes, and settle up easily." />
	<meta property="og:title" content="Split Expenses" />
	<meta property="og:description" content="Split expenses with friends. Track who paid, who owes, and settle up easily." />
	<meta property="og:type" content="website" />
	<meta property="og:image" content={favicon} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Split Expenses" />
	<meta name="twitter:description" content="Split expenses with friends. Track who paid, who owes, and settle up easily." />
</svelte:head>

{@render children()}
