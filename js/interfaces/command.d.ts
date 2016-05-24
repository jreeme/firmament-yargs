import { SpawnOptions } from "child_process";
export interface Command {
    aliases: string[];
    command: string;
    commandDesc: string;
    handler: (argv: any) => void;
    options: any;
    subCommands: Command[];
    spawnShellCommand(cmd: string[], options: SpawnOptions, cb: (err: Error, result: any) => void): any;
    sudoSpawnSync(cmd: string[]): any;
    sudoSpawn(cmd: string[], cb: (err?: Error) => void): any;
}
