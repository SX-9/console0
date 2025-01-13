<script lang="ts">
    import { goto } from "$app/navigation";
    let [ host, port, user, pass ] = ['localhost', 22, 'root', ''];
    function connect(e: Event) {
        e.preventDefault();
        localStorage.setItem('ssh-info', JSON.stringify({ host, port, user, pass }));
        goto('/');
    }
</script>

<div class="h-full w-full flex justify-center items-center">
    <form onsubmit={connect} class="flex flex-col w-min">
        <div class="whitespace-nowrap">
            <input type="text" placeholder="hostname" bind:value={host} required class="w-32"> <span>:</span>
            <input type="number" placeholder="port" bind:value={port} required class="w-10">
        </div>
        <input type="text" placeholder="username" bind:value={user} required class="w-full">
        <input type="password" placeholder="password" bind:value={pass} required class="w-full">
        <button type="submit" class="bg-gray-600">Connect</button>
    </form>
</div>