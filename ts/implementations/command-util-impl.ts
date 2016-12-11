import {injectable} from "inversify";
import {CommandUtil} from "../interfaces/command-util";
import path = require('path');

interface LogConsole {
  log(msg: string): void;
  error(msg: string): void;
}
@injectable()
export class CommandUtilImpl implements CommandUtil {
  private _console: LogConsole = {
    log: this.stdoutLog,
    error: this.stdoutLog
  };

  constructor() {
    this.quiet = false;
  }

  //noinspection JSUnusedLocalSymbols
  private dummyLog(msg: string) {
  }

  stdoutWrite(msg: string) {
    process.stdout.write(msg);
  }

  private stdoutLog(msg: string) {
    process.stdout.write(`${msg}\n`);
  }

  set quiet(beQuiet: boolean) {
    this._console.log = (beQuiet) ? this.dummyLog : this.stdoutLog;
    this._console.error = (beQuiet) ? this.dummyLog : this.stdoutLog;
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

  getConfigFilePath(filename: string, extension: string = '.json') {
    let regex = new RegExp('(.*)\\' + extension + '$', 'i');
    let cwd = process.cwd();
    if (regex.test(filename)) {
      filename = filename.replace(regex, '$1' + extension);
    } else {
      filename = filename + extension;
    }
    return path.resolve(cwd, filename);
  }
}

