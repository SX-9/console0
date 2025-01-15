import { produce } from "sveltekit-sse";
import { NodeSSH } from "node-ssh";
import { run } from "$lib";

export async function POST(e) {
	const ssh = new NodeSSH();
	let interval: NodeJS.Timeout;
	let body = await e.request.json();
	
	function stop() {
		clearInterval(interval);
		ssh.dispose();
	}

	if (!body.pass) return new Response("body missing passwd", { status: 400 });
	return produce(async ({ emit, lock }) => {
		const exec = run.bind({
			ssh, error: (e) => emit("error", e),
		});
		await ssh.connect({
			host: body.host || "localhost",
			port: body.port || 22,
			username: body.user || "root",
			password: body.pass,
		}).then(async () => {
			while (!ssh.isConnected()) await new Promise(r => setTimeout(r, 500));
			
			const { error } = emit("specs", JSON.stringify({
				cpu: (await exec("cat", ["/proc/cpuinfo"]))?.split('\n')?.filter(l => l?.startsWith("model name"))?.[0]?.replace("model name\t: ", ""),
				os: (await exec("cat", ["/etc/os-release"]))?.split('\n')?.find(l => l?.startsWith("NAME="))?.replace('NAME="', '')?.replace('"', ''),
				kernel: await exec("uname", ["-srm"]),
				hostname: await exec("hostname"),
				interfaces: (await exec("ip", ["-o", "-f", "inet", "a", "show"]))?.split('\n')?.map(l => l?.split(/\s+/))?.map(e => ({ iface: e[1], ip: e[3] })),
				bootedAt: new Date(await exec("uptime", ["-s"])).getTime(),
			}));
			if (error) console.error(error);

			interval = setInterval(async () => {
				const { error } = emit("dynamic", JSON.stringify({
				cpu: (await exec("mpstat", ["-P", "ALL", "1", "1"]))
					?.split('\n\n')?.[2]?.split('\n')?.map(l => l?.split(/\s+/)?.slice(1))?.slice(1)
					?.map((e) => ({ core: e[0], user: parseFloat(e[1]), nice: parseFloat(e[2]), sys: parseFloat(e[3]), iowait: parseFloat(e[4]), irq: parseFloat(e[5]), soft: parseFloat(e[6]), steal: parseFloat(e[7]), guest: parseFloat(e[8]), gnice: parseFloat(e[9]), idle: parseFloat(e[10]) })),
				mem: (await exec("free", ["-m"]))
					?.split('\n')?.map(l => l?.split(/\s+/))?.filter(d => ["Mem:", "Swap:"]?.includes(d[0]))
					?.map((e) => ({ type: e[0].slice(0,-1).toLocaleLowerCase(), total: parseInt(e[1]), used: parseInt(e[2]), free: parseInt(e[3]) })),
				disk: (await exec("df"))
					?.split('\n')?.map(l => l?.split(/\s+/))?.filter(d => d[0]?.startsWith("/"))
					?.map((e) => ({ disk: e[0], size: parseInt(e[1]), used: parseInt(e[2]), avail: parseInt(e[3]), usedP: e[4], mount: e[5] })),
				}));
				if (error) console.error(error);
			}, 1000);
		}).catch((e) => {
			emit("error", `Failed to connect to ${body.user}@${body.host}: ${e.message}`);
			console.error(e.message);
			lock.set(false);
		});

		return stop;
  	}, {
		stop, ping: 5000,
	});
}
