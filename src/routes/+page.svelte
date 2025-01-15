<script lang="ts">
	import type { Readable } from 'svelte/store';
    import type { Specs, Dynamic } from '$lib';
	import { goto } from '$app/navigation';
	import { source } from 'sveltekit-sse';
	import { onMount } from 'svelte';
	
	let dynamic: Readable<Dynamic | null>;
	let specs: Readable<Specs | null>;
	
	onMount(() => {
		const sshInfo = localStorage.getItem('ssh-info');
		if (!sshInfo) return goto('/setup');

		const sse = source('/api/monitor', { options: {
			body: sshInfo,
		}});
		dynamic = sse.select('dynamic').json();
		specs = sse.select('specs').json();
	});
</script>



<nav>
    <a href="/debug">debug</a>
    <a href="/setup">setup</a>
</nav>