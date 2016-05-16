import { Command } from "../interfaces/command";
import { SpawnOptions } from "child_process";
export declare class CommandImpl implements Command {
    static generalUsage: string;
    static epilog: string;
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
    protected processExit(exitCode?: number, msg?: string): void;
    protected callbackIfError(cb: (err: Error, result: any) => void, err?: Error, result?: any): boolean;
    protected logAndCallback(msg: string, cb: (err: Error, result: any) => void, err?: Error, result?: any): boolean;
    spawnShellCommand(command: string, args: string[], options?: SpawnOptions, cb?: (err: Error, result: any) => void): void;
}
