import type { NodeSSH } from "node-ssh";

export async function run(this: NodeSSH, cmd: string, args: string[] = []) {
    return await this.exec(cmd, args, { stream: "stdout" }).catch((e) => {
        const ret = `Error while executing "${cmd}${args ? ' ' + args.join(' ') : ''}": ${e}`;
        console.error(ret);
        return ret;
    });
}