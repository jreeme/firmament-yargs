import {injectable, inject} from "inversify";
import {CommandUtil} from "../interfaces/command-util";
import path = require('path');
import {IPostal} from "../interfaces/postal";

interface LogConsole {
  log(msg: string): void;
  error(msg: string): void;
}
@injectable()
export class CommandUtilImpl implements CommandUtil {
  private suppressConsoleOutput = false;
  private postal: IPostal;
  private _console: LogConsole = {
    log: this.stdoutLog.bind(this),
    error: this.stderrLog.bind(this)
  };

  constructor(@inject('IPostal')_postal: IPostal) {
    this.postal = _postal;
    this.postal.subscribe({
      channel: 'CommandUtil',
      topic: 'SuppressConsoleOutput',
      callback: (data) => {
        this.suppressConsoleOutput = data.suppressConsoleOutput;
      }
    });
  }

  stderrWrite(msg: string) {
    if (this.suppressConsoleOutput) {
      return;
    }
    process.stderr.write(msg);
  }

  stdoutWrite(msg: string) {
    if (this.suppressConsoleOutput) {
      return;
    }
    process.stdout.write(msg);
  }

  private stderrLog(msg: string) {
    this.stderrWrite(`${msg}\n`);
  }

  private stdoutLog(msg: string) {
    this.stdoutWrite(`${msg}\n`);
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

