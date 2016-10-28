import {injectable} from "inversify";
import {CommandUtil} from "../interfaces/command-util";
import JSNLogLogger = JL.JSNLogLogger;
const log:JSNLogLogger = require('jsnlog').JL();
@injectable()
export class CommandUtilImpl implements CommandUtil {
/*  static generalUsage = '\nUsage: $0 <command> <sub-command> [options]';
  static epilog = '** "Let there be light"';*/
  returnErrorStringOrMessage(err:Error, message:string) {
    let errorMessage = this.logError(err, false);
    return errorMessage.length ? errorMessage : message;
  }

  logErrors(errs:Error[], writeErrorToConsole:boolean = true):string[] {
    let retVal:string[] = [];
    errs.forEach(err=> {
      retVal.push(this.logError(err, writeErrorToConsole));
    })
    return retVal;
  }

  logError(err:Error, writeErrorToConsole:boolean = true):string {
    if (err) {
      if (writeErrorToConsole) {
        log.error(err.message);
      }
      return err.message;
    }
    return '';
  }

  processExitWithError(err:Error, nonErrorMessage:string = null) {
    this.processExit(!!err ? 1 : 0, !!err ? err.message : !!nonErrorMessage ? nonErrorMessage : '');
  }

  processExit(exitCode:number = 0, msg:string = null) {
    console.log(!!msg ? msg : '');
    process.exit(exitCode);
  }

  callbackIfError(cb:(err:Error, result:any)=>void,
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

  logAndCallback(msg:string,
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

