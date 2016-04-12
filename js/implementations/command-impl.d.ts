import { Command } from "../interfaces/command";
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
}
