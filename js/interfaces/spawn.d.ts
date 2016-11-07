/// <reference types="node" />
import { SpawnOptions } from "child_process";
export interface Spawn {
    spawnShellCommandAsync(cmd: string[], options: SpawnOptions, cb: (err: Error, result: string) => void): any;
    spawnShellCommand(cmd: string[], options: SpawnOptions, cb: (err: Error, result: any) => void): any;
    sudoSpawnSync(cmd: string[]): any;
    sudoSpawn(cmd: string[], cb: (err?: Error) => void): any;
}
