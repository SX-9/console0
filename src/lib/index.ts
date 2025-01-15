import type { NodeSSH } from "node-ssh";

export type Specs = {
    cpu: string;
    os: string;
    kernel: string;
    hostname: string;
    interfaces: { iface: string, ip: string }[];
    bootedAt: number;
}

export type Dynamic = {
    cpu: { core: string, user: number, nice: number, sys: number, iowait: number, irq: number, soft: number, steal: number, guest: number, gnice: number, idle: number }[];
    mem: { type: string, total: number, used: number, free: number }[];
    disk: { disk: string, size: number, used: number, avail: number, usedP: string, mount: string }[];
}

export async function run(this: { ssh: NodeSSH, error?: (e: string) => any }, cmd: string, args: string[] = []) {
    return await this.ssh.exec(cmd, args, { stream: "stdout" }).catch((e) => {
        const ret = `Error while executing "${cmd}${args ? ' ' + args.join(' ') : ''}": ${e.message}`;
        this.error?.(ret);
        console.error(ret);
        return ret;
    });
}