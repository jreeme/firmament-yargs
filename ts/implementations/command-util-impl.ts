import {injectable} from "inversify";
import {CommandUtil} from "../interfaces/command-util";

interface LogConsole {
  log(msg: string): void;
  error(msg: string): void;
}
@injectable()
export class CommandUtilImpl implements CommandUtil {
  private _console: LogConsole = {
    log: console.log,
    error: console.error
  };

  constructor() {
    this.quiet = false;
  }

  //noinspection JSUnusedLocalSymbols
  private dummyLog(msg: string) {
  }

  set quiet(beQuiet: boolean) {
    this._console.log = (beQuiet) ? this.dummyLog : console.log;
    this._console.error = (beQuiet) ? this.dummyLog : console.error;
  }

  returnErrorStringOrMessage(err: Error, message: string) {
    let errorMessage = this.logError(err, false);
    return errorMessage.length ? errorMessage : message;
  }

  error(msg: string) {
    this._console.error(msg);
  }

  log(msg: string) {
    this._console.log(msg);
  }

  logErrors(errs: Error[], writeErrorToConsole: boolean = true): string[] {
    let retVal: string[] = [];
    errs.forEach(err => {
      retVal.push(this.logError(err, writeErrorToConsole));
    });
    return retVal;
  }

  logError(err: Error, writeErrorToConsole: boolean = true): string {
    if (err) {
      if (writeErrorToConsole) {
        this._console.error(err.message);
      }
      return err.message;
    }
    return '';
  }

  processExitWithError(err: Error, nonErrorMessage: string = null) {
    this.processExit(!!err ? 1 : 0, !!err ? err.message : !!nonErrorMessage ? nonErrorMessage : '');
  }

  processExit(exitCode: number = 0, msg: string = null) {
    this._console.log(!!msg ? msg : '');
    process.exit(exitCode);
  }

  callbackIfError(cb: (err: Error, result: any)=>void,
                  err: Error = null,
                  result: any = null): boolean {
    if (this.logError(err)) {
      if (cb && (typeof cb === 'function')) {
        cb(err, result);
      }
      //return 'true' if (err !== null)
      return true;
    }
    return false;
  }

  logAndCallback(msg: string,
                 cb: (err: Error, result: any)=>void,
                 err: Error = null,
                 result: any = null): boolean {
    this._console.log(err ? err.message : msg);
    if (cb && (typeof cb === 'function')) {
      cb(err, result);
    }
    return !!err;
  }
}

