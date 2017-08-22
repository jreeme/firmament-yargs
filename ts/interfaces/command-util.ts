export interface CommandUtil {
  returnErrorStringOrMessage(err: Error, message: string);

  logErrors(errs: Error[], writeErrorToConsole?: boolean): string[];

  logError(err: Error, writeErrorToConsole?: boolean): string;

  processExitIfError(err: Error);

  processExitWithError(err: Error, nonErrorMessage?: string);

  processExit(exitCode?: number, msg?: string);

  callbackIfError(cb: (err: Error, anything: any, anything2?: any) => void,
                  err?: Error,
                  result?: any): boolean;

  logAndCallback(msg: string,
                 cb: (err: Error, anything: any, anything2?: any) => void,
                 err?: Error,
                 result?: any): boolean;

  log(msg: string);

  error(msg: string);

  stdoutWrite(msg: string);

  getConfigFilePath(inputPath: string, extension?: string);
}

