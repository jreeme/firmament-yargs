import {injectable, inject} from "inversify";
import {Spawn} from '../interfaces/spawn';
import {SpawnOptions, ChildProcess, SpawnSyncReturns, spawn, spawnSync} from 'child_process';
import {CommandUtil} from '../interfaces/command-util';
import {ForceErrorImpl} from "./force-error-impl";
const readlineSync = require('readline-sync');
const inpathSync = require('inpath').sync;
const pidof = require('pidof');
//noinspection JSUnusedGlobalSymbols
@injectable()
export class SpawnImpl extends ForceErrorImpl implements Spawn {
  private static cachedPassword: string;

  commandUtil: CommandUtil;

  constructor(@inject('CommandUtil')_commandUtil: CommandUtil) {
    super();
    this.commandUtil = _commandUtil;
  }

  public spawnShellCommandSync(cmd: string[],
                               options: SpawnOptions = {},
                               cb: (err: Error,
                                    spawnSyncReturns: SpawnSyncReturns<Buffer>)=>void = null) {
    cb = this.checkCallback(cb);
    if (this.checkForceError('spawnShellCommandSync', cb)) {
      return;
    }
    try {
      cmd = cmd || [];
      options = options || {};
      options.stdio = options.stdio || 'inherit';
      options.cwd = options.cwd || __dirname;
      this.commandUtil.log(`Running '${cmd}' @ '${options.cwd}'`);
      let command = cmd.shift();
      let child: SpawnSyncReturns<Buffer> = spawnSync(command, cmd, options);
      cb(child.error, child);
    } catch (err) {
      cb(err, null);
    }
  }

  spawnShellCommandAsync(cmd: string[],
                         options: SpawnOptions,
                         cb: (err: Error, result: string)=>void) {
    options = options || {stdio: 'pipe', cwd: '.'};
    let command = cmd.shift();
    let child: ChildProcess = spawn(command, cmd, options);
    let result = '';
    child.stdout.on('data', function (data) {
      result += data.toString();
    });
    //noinspection JSUnusedLocalSymbols
    child.on('error', function (code) {
      if (cb) {
        cb(new Error('spawn error'), null);
        cb = null;
      }
    });
    //noinspection JSUnusedLocalSymbols
    child.on('close', function (code) {
      if (cb) {
        cb(null, result);
        cb = null;
      }
    });
  }

  sudoSpawn(cmd: string[], cb: (err?: Error)=>void) {
    SpawnImpl._sudoSpawn(cmd, cb);
  }

  sudoSpawnSync(cmd: string[]) {
    return SpawnImpl._sudoSpawnSync(cmd);
  }

  private static _sudoSpawn(cmd: string[], cb: (err?: Error)=>void) {
    let child = SpawnImpl._sudoSpawnSync(cmd);
    child.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    child.stdout.on('end', () => {
      if (cb) {
        cb();
        cb = null;
      }
    });
    child.stdout.on('close', () => {
      if (cb) {
        cb();
        cb = null;
      }
    });
    child.stdout.on('error', () => {
      if (cb) {
        cb(new Error('Something went wrong with spawn'));
        cb = null;
      }
    });
  }

  private static _sudoSpawnSync(command: string[]) {
    let prompt = '#node-sudo-passwd#';
    let prompts = 0;
    let args = ['-S', '-p', prompt];
    args.push.apply(args, command);
    // The binary is the first non-dashed parameter to sudo
    let bin = command.filter(function (i) {
      return i.indexOf('-') !== 0;
    })[0];
    let spawnOptions = {
      stdio: 'pipe'
    };
    let path = process.env['PATH'].split(':');
    let sudoBin = inpathSync('sudo', path);
    let child: ChildProcess = spawn(sudoBin, args, spawnOptions);
    // Wait for the sudo:d binary to start up
    function waitForStartup(err, pid) {
      if (err) {
        throw new Error(`Couldn't start ` + bin);
      }
      if (pid) {
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
      let lines = data.toString().trim().split('\n');
      lines.forEach(function (line) {
        if (line === prompt) {
          if (++prompts > 1) {
            // The previous entry must have been incorrect, since sudo asks again.
            SpawnImpl.cachedPassword = null;
          }
          if (SpawnImpl.cachedPassword) {
            child.stdin.write(SpawnImpl.cachedPassword + '\n');
          } else {
            SpawnImpl.cachedPassword = SpawnImpl.cachedPassword
              || readlineSync.question('sudo requires your password: ', {hideEchoBack: true});
            child.stdin.write(SpawnImpl.cachedPassword + '\n');
          }
        }
      });
    });
    return child;
  }
}

