import {injectable, inject} from "inversify";
import {Spawn} from '../interfaces/spawn';
import {SpawnOptions, ChildProcess, SpawnSyncReturns, spawn, spawnSync} from 'child_process';
import {CommandUtil} from '../interfaces/command-util';
import {ForceErrorImpl} from "./force-error-impl";
const readlineSync = require('readline-sync');
const inpathSync = require('inpath').sync;
const pidof = require('pidof');
const psTree = require('ps-tree');
//noinspection JSUnusedGlobalSymbols
@injectable()
export class SpawnImpl extends ForceErrorImpl implements Spawn {
  cachedPassword: string = '][nform0';

  commandUtil: CommandUtil;

  constructor(@inject('CommandUtil')_commandUtil: CommandUtil) {
    super();
    this.commandUtil = _commandUtil;
  }

  public spawnShellCommandSync(cmd: string[],
                               options: SpawnOptions = null,
                               cb: (err: Error,
                                    spawnSyncReturns: SpawnSyncReturns<Buffer>)=>void = null): SpawnSyncReturns<Buffer> {
    cb = this.checkCallback(cb);
    let child: SpawnSyncReturns<Buffer>;
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
      child = spawnSync(command, cmd, options);
      cb(child.error, child);
    } catch (err) {
      cb(err, null);
    }
    return child;
  }

  spawnShellCommandAsync(cmd: string[],
                         options: SpawnOptions = null,
                         cbStatusOrFinal: (err: Error, result: string)=>void = null,
                         cbFinal: (err: Error, result: string)=>void = null) {
    let childProcess: ChildProcess;
    //Do some callback juggling. If they don't specify cbFinal the cbStatus will be the
    //presumptive cbFinal. If neither callback is specified the user will need to deal
    //with the returned child process object to get results from the process.
    if (typeof cbFinal !== 'function') {
      if (typeof cbStatusOrFinal !== 'function') {
        cbFinal = cbStatusOrFinal = null;
      } else {
        cbFinal = cbStatusOrFinal;
        cbStatusOrFinal = null;
      }
    } else {
      if (typeof cbStatusOrFinal !== 'function') {
        cbStatusOrFinal = null;
      }
    }
    if (this.checkForceError('spawnShellCommandAsync', cbFinal)) {
      return;
    }
    try {
      cmd = cmd || [];
      options = options || {};
      options.stdio = options.stdio || 'pipe';
      options.cwd = options.cwd || __dirname;
      this.commandUtil.log(`Running '${cmd}' @ '${options.cwd}'`);
      let command = cmd.shift();
      let result = '';
      childProcess = spawn(command, cmd, options);
      //Don't attach events if there is no final callback
      if (cbFinal) {
        childProcess.stdout.on('data', function (data) {
          result += data.toString();
          if (cbStatusOrFinal) {
            cbStatusOrFinal(null, data.toString());
          }
        });
        childProcess.on('exit', function (code: number, signal: string) {
          if (cbFinal) {
            if (code !== null) {
              if (code !== 0) {
                cbFinal(new Error(`spawn error: exit code ${code}`), result);
              }
              else {
                cbFinal(null, result);
              }
            } else {
              cbFinal(new Error(`child process received signal: ${signal}`), result);
            }
            cbFinal = null;
          }
        });
        childProcess.on('error', function (code: any) {
          if (cbFinal) {
            cbFinal(new Error(`spawn error: exit code ${code.code}`), null);
            cbFinal = null;
          }
        });
      }
    } catch (err) {
      cbFinal(err, null);
    }
    return childProcess;
  }

  sudoSpawnAsync(cmd: string[],
                 options: SpawnOptions = null,
                 cbStatusOrFinal: (err: Error, result: string)=>void = null,
                 cbFinal: (err: Error, result: string)=>void = null) {
    let me = this;
    let prompt = '#node-sudo-passwd#';
    let prompts = 0;
    let args = ['-S', '-p', prompt];
    [].push.apply(args, cmd);
    // The binary is the first non-dashed parameter to sudo
    let bin = cmd.filter(function (i) {
      return i.indexOf('-') !== 0;
    })[0];
    let spawnOptions = {
      stdio: 'pipe'
    };
    let path = process.env['PATH'].split(':');
    let sudoBin = inpathSync('sudo', path);
    let child: ChildProcess = spawn(sudoBin, args, spawnOptions);
    function waitForStartup2(err, children:any[]) {
      if (err) {
        throw new Error(`Couldn't start ` + bin);
      }
      if (children && children.length) {
        child.emit('started');
      } else {
        setTimeout(function () {
          psTree(child.pid, waitForStartup2);
        }, 100);
      }
    }
    psTree(child.pid, waitForStartup2);
    // Wait for the sudo:d binary to start up
/*    function waitForStartup(err, pid) {
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
    */
    // FIXME: Remove this handler when the child has successfully started
    child.stderr.on('data', function (data) {
      let lines = data.toString().trim().split('\n');
      lines.forEach(function (line) {
        if (line === prompt) {
          if (++prompts > 1) {
            // The previous entry must have been incorrect, since sudo asks again.
            me.cachedPassword = null;
          }
          if (me.cachedPassword) {
            child.stdin.write(me.cachedPassword + '\n');
          } else {
            me.cachedPassword = me.cachedPassword
              || readlineSync.question('sudo requires your password: ', {hideEchoBack: true});
            child.stdin.write(me.cachedPassword + '\n');
          }
        }
      });
    });
    return child;
  }
}

