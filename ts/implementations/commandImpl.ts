import {Command} from "../interfaces/command";
const log:JSNLog.JSNLogLogger = require('jsnlog').JL();
export class CommandImpl implements Command {
  static generalUsage = '\nUsage: $0 <command> <sub-command> [options]';
  static epilog = '** "Let there be light"';

  constructor() {
    this.aliases = [];
    this.subCommands = [];
    this.command = '';
    this.commandDesc = '';
    this.options = {};
    this.handler = function (argv:any) {
      log.debug(argv);
    }
  }

  aliases:string[];
  command:string;
  commandDesc:string;
  options:any;
  handler:(argv:any)=>void;
  subCommands:Command[];

  protected returnErrorStringOrMessage(err:Error, message:string) {
    let errorMessage = this.logError(err, false);
    return errorMessage.length ? errorMessage : message;
  }

  protected logErrors(errs:Error[], writeErrorToConsole:boolean = true):string[] {
    let retVal:string[] = [];
    errs.forEach(err=> {
      retVal.push(this.logError(err, writeErrorToConsole));
    })
    return retVal;
  }

  protected logError(err:Error, writeErrorToConsole:boolean = true):string {
    if (err) {
      if (writeErrorToConsole) {
        log.error(err.message);
      }
      return err.message;
    }
    return '';
  }

  protected processExit(exitCode:number = 0, msg:string = '') {
    console.log(msg);
    process.exit(exitCode);
  }

  protected callbackIfError(cb:(err:Error, result:any)=>void,
                            err:Error = null,
                            result:any = null):boolean {
    if (this.logError(err)) {
      if (cb && (typeof cb === 'function')) {
        cb(err, result);
      }
      //return 'true' if (err !== null)
      return true;
    }
    return false;
  }

  protected logAndCallback(msg:string,
                           cb:(err:Error, result:any)=>void,
                           err:Error = null,
                           result:any = null):boolean {
    console.log(err ? err.message : msg);
    if (cb && (typeof cb === 'function')) {
      cb(err, result);
    }
    return !!err;
  }
}

