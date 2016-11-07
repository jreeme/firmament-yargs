/// <reference types="node" />
export interface CommandUtil {
    returnErrorStringOrMessage(err: Error, message: string): any;
    logErrors(errs: Error[], writeErrorToConsole?: boolean): string[];
    logError(err: Error, writeErrorToConsole?: boolean): string;
    processExitWithError(err: Error, nonErrorMessage?: string): any;
    processExit(exitCode?: number, msg?: string): any;
    callbackIfError(cb: (err: Error, result: any) => void, err?: Error, result?: any): boolean;
    logAndCallback(msg: string, cb: (err: Error, result: any) => void, err?: Error, result?: any): boolean;
}
