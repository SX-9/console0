<script lang="ts">
	import type { Readable } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { source } from 'sveltekit-sse';
	import { onMount } from 'svelte';
	
	let dynamic: Readable<any>;
	let specs: Readable<any>;
	
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

<pre>dynamic: { JSON.stringify($dynamic, null, 2) }</pre>
<pre>specs: { JSON.stringify($specs, null, 2) }</pre>