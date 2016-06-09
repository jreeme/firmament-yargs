import { Command } from "../interfaces/command";
import { SpawnOptions } from "child_process";
export declare class CommandImpl implements Command {
    static generalUsage: string;
    static epilog: string;
    private static cachedPassword;
    constructor();
    aliases: string[];
    command: string;
    commandDesc: string;
    options: any;
    handler: (argv: any) => void;
    subCommands: Command[];
    protected returnErrorStringOrMessage(err: Error, message: string): string;
    protected logErrors(errs: Error[], writeErrorToConsole?: boolean): string[];
    protected logError(err: Error, writeErrorToConsole?: boolean): string;
    protected processExitWithError(err: Error, nonErrorMessage?: string): void;
    protected processExit(exitCode?: number, msg?: string): void;
    protected callbackIfError(cb: (err: Error, result: any) => void, err?: Error, result?: any): boolean;
    protected logAndCallback(msg: string, cb: (err: Error, result: any) => void, err?: Error, result?: any): boolean;
    spawnShellCommandAsync(cmd: string[], options: SpawnOptions, cb: (err: Error, result: string) => void): void;
    spawnShellCommand(cmd: string[], options: SpawnOptions, cb: (err: Error, result: any) => void): void;
    sudoSpawn(cmd: string[], cb: (err?: Error) => void): void;
    sudoSpawnSync(cmd: string[]): any;
    private static _sudoSpawn(cmd, cb);
    private static _sudoSpawnSync(command);
}
