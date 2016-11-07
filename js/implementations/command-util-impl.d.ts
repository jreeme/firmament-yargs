/// <reference types="node" />
import { CommandUtil } from "../interfaces/command-util";
export declare class CommandUtilImpl implements CommandUtil {
    returnErrorStringOrMessage(err: Error, message: string): string;
    logErrors(errs: Error[], writeErrorToConsole?: boolean): string[];
    logError(err: Error, writeErrorToConsole?: boolean): string;
    processExitWithError(err: Error, nonErrorMessage?: string): void;
    processExit(exitCode?: number, msg?: string): void;
    callbackIfError(cb: (err: Error, result: any) => void, err?: Error, result?: any): boolean;
    logAndCallback(msg: string, cb: (err: Error, result: any) => void, err?: Error, result?: any): boolean;
}
