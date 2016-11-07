/// <reference types="node" />
import { SpawnOptions } from "child_process";
import { Spawn } from "../interfaces/spawn";
export declare class SpawnImpl implements Spawn {
    private static cachedPassword;
    spawnShellCommandAsync(cmd: string[], options: SpawnOptions, cb: (err: Error, result: string) => void): void;
    spawnShellCommand(cmd: string[], options: SpawnOptions, cb: (err: Error, result: any) => void): void;
    sudoSpawn(cmd: string[], cb: (err?: Error) => void): void;
    sudoSpawnSync(cmd: string[]): any;
    private static _sudoSpawn(cmd, cb);
    private static _sudoSpawnSync(command);
}
