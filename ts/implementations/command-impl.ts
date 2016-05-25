import {Command} from "../interfaces/command";
import {SpawnOptions} from "child_process";
const readlineSync = require('readline-sync');
const inpathSync = require('inpath').sync;
const pidof = require('pidof');
const childProcess = require('child_process');
const log:JSNLog.JSNLogLogger = require('jsnlog').JL();
export class CommandImpl implements Command {
  static generalUsage = '\nUsage: $0 <command> <sub-command> [options]';
  static epilog = '** "Let there be light"';
  private static cachedPassword:string;

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

  protected processExitWithError(err:Error, nonErrorMessage:string = '') {
    this.processExit(!!err ? 0 : 1, !!err ? err.message : nonErrorMessage);
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

  spawnShellCommandAsync(cmd:string[], cb:(err:Error, result:string)=>void) {
  }
  
  public spawnShellCommand(cmd:string[], options?:SpawnOptions, cb?:(err:Error, result:any)=>void) {
    options = options || {stdio: 'inherit', cwd: null};
    options.stdio = options.stdio || 'inherit';
    var command = cmd.shift();
    let child = childProcess.spawnSync(command, cmd, options);
    process.nextTick(()=> {
      cb(child.error, child);
    });
  }
  
  sudoSpawn(cmd:string[], cb:(err?:Error)=>void) {
    CommandImpl._sudoSpawn(cmd,cb);
  }
  sudoSpawnSync(cmd:string[]) {
    return CommandImpl._sudoSpawnSync(cmd);
  }

  private static _sudoSpawn(cmd:string[], cb:(err?:Error)=>void) {
    var child = CommandImpl._sudoSpawnSync(cmd);
    child.stdout.on('data', (data)=> {
      console.log(data.toString());
    });
    child.stdout.on('end', ()=> {
      if(cb){
        cb();
        cb = null;
      }
    });
    child.stdout.on('close', ()=> {
      if(cb){
        cb();
        cb = null;
      }
    });
    child.stdout.on('error', ()=> {
      if(cb){
        cb(new Error('Something went wrong with spawn'));
        cb = null;
      }
    });
  }

  private static _sudoSpawnSync(command:string[]) {
    var prompt = '#node-sudo-passwd#';
    var prompts = 0;

    var args = [ '-S', '-p', prompt ];
    args.push.apply(args, command);

    // The binary is the first non-dashed parameter to sudo
    var bin = command.filter(function (i) { return i.indexOf('-') !== 0; })[0];

    var options = options || {};
    var spawnOptions = options.spawnOptions || {};
    spawnOptions.stdio = 'pipe';

    var path = process.env['PATH'].split(':');
    var sudoBin = inpathSync('sudo', path);
    var child = childProcess.spawn(sudoBin, args, spawnOptions);

    // Wait for the sudo:d binary to start up
    function waitForStartup(err, pid) {
      if (err) {
        throw new Error('Couldn\'t start ' + bin);
      }

      if (pid || child.exitCode !== null) {
        child.emit('started');
      } else {
        setTimeout(function () {
          pidof(bin, waitForStartup);
        }, 100);
      }
    }
    pidof(bin, waitForStartup);

    // FIXME: Remove this handler when the child has successfully started
    child.stderr.on('data', function (data) {
      var lines = data.toString().trim().split('\n');
      lines.forEach(function (line) {
        if (line === prompt) {
          if (++prompts > 1) {
            // The previous entry must have been incorrect, since sudo asks again.
            CommandImpl.cachedPassword = null;
          }

          if (CommandImpl.cachedPassword) {
            child.stdin.write(CommandImpl.cachedPassword + '\n');
          } else {
            CommandImpl.cachedPassword = CommandImpl.cachedPassword
              || readlineSync.question('sudo requires your password: ', {hideEchoBack: true});
            child.stdin.write(CommandImpl.cachedPassword + '\n');
          }
        }
      });
    });

    return child;
  }
}

