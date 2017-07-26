import {injectable, inject} from "inversify";
import {CommandUtil} from "../interfaces/command-util";
import path = require('path');
import {IPostal} from "../interfaces/postal";
import {LogConsole} from "../interfaces/log-console";
import {ForceErrorImpl} from "./force-error-impl";

const blackHoleStream = new (require('black-hole-stream'))();
const fs = require('fs');

@injectable()
export class CommandUtilImpl extends ForceErrorImpl implements CommandUtil {
  private _console: LogConsole = {
    log: this.stdoutLog.bind(this),
    info: this.stdoutLog.bind(this),
    warn: this.stdoutLog.bind(this),
    error: this.stderrLog.bind(this)
  };

  private exitHandler(options, err: Error) {
    if (options.cleanup) {
    }
    if (err) {
      if (err && err.message) {
        this.stderrLog(err.message)
      }
    }
    if (options.exit) {
      process.exit();
    }
  }

  private registerProcessManagementEvents() {
    process.stdin.resume();
    process.on('exit', this.exitHandler.bind(this, {cleanup: true}));
    process.on('SIGINT', this.exitHandler.bind(this, {exit: true}));
    process.on('uncaughtException', this.exitHandler.bind(this, {exit: true}));
  }

  constructor(@inject('IPostal') private postal: IPostal) {
    super();
    this.registerProcessManagementEvents();
    const cacheStdoutWrite = process.stdout.write;
    const cacheStderrWrite = process.stderr.write;
    this.postal.subscribe({
      channel: 'CommandUtil',
      topic: 'SuppressConsoleOutput',
      callback: (data) => {
        if (data.suppressConsoleOutput) {
          process.stdout.write = process.stderr.write = blackHoleStream.write.bind(blackHoleStream);
        } else {
          process.stdout.write = cacheStdoutWrite;
          process.stderr.write = cacheStderrWrite;
        }
      }
    });
    this.postal.subscribe({
      channel: 'CommandUtil',
      topic: 'ProgressBarStarted',
      callback: (data) => {
        let dataConsole: LogConsole = data.console;
        this._console.log = dataConsole.log;
        this._console.info = dataConsole.info;
        this._console.warn = dataConsole.warn;
        this._console.error = dataConsole.error;
      }
    });
  }

  stderrWrite(msg: string) {
    process.stderr.write(msg);
  }

  stdoutWrite(msg: string) {
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

  processExitIfError(err: Error, nonErrorMessage: string = null) {
    if (err) {
      this.processExitWithError(err, nonErrorMessage);
    }
  }

  processExitWithError(err: Error, nonErrorMessage: string = null) {
    this.processExit(!!err ? 1 : 0, !!err ? err.message : !!nonErrorMessage ? nonErrorMessage : '');
  }

  processExit(exitCode: number = 0, msg: string = null) {
    this._console.log(!!msg ? msg : '');
    process.exit(exitCode);
  }

  callbackIfError(cb: (err: Error, result: any) => void,
                  err: Error = null,
                  result: any = null): boolean {
    if (this.logError(err)) {
      cb = this.checkCallback(cb);
      cb(err, result);
    }
    return !!err;
  }

  logAndCallback(msg: string,
                 cb: (err: Error, result: any) => void,
                 err: Error = null,
                 result: any = null): boolean {
    this._console.log(err ? err.message : msg);
    cb = this.checkCallback(cb);
    cb(err, result);
    return !!err;
  }

  getConfigFilePath(filename: string, extension: string = '.json') {
    let regex = new RegExp('(.*)\\' + extension + '$', 'i');
    let cwd = process.cwd();
    filename = regex.test(filename)
      ? filename.replace(regex, '$1' + extension)
      : filename + extension;
    return path.resolve(cwd, filename);
  }
}

