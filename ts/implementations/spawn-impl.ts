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
  cachedPassword: string;

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
      cmd = cmd.slice(0);
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
    let me = this;
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
    if (me.checkForceError('spawnShellCommandAsync', cbFinal)) {
      return;
    }
    try {
      cmd = cmd || [];
      cmd = cmd.slice(0);
      options = options || {};
      options.stdio = options.stdio || 'pipe';
      options.cwd = options.cwd || __dirname;
      me.commandUtil.log(`Running '${cmd}' @ '${options.cwd}'`);
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
          cbFinal = me.childCloseOrExit(code, signal, result, cbFinal);
        });
        childProcess.on('close', function (code: number, signal: string) {
          cbFinal = me.childCloseOrExit(code, signal, result, cbFinal);
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

  private childCloseOrExit(code: number,
                           signal: string,
                           result: string,
                           cbFinal: (err: Error, result: string)=>void): (err: Error, result: string)=>void {
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
    return cbFinal;
  }

  sudoSpawnAsync(cmd: string[],
                 options: SpawnOptions = null,
                 cbStatusOrFinal: (err: Error, result: string)=>void = null,
                 cbFinal: (err: Error, result: string)=>void = null) {
    let me = this;
    let prompt = '#node-sudo-passwd#';
    let prompts = 0;
    let args = ['-S', '-p', prompt];
    cmd = cmd || [];
    cmd = cmd.slice(0);
    [].push.apply(args, cmd);
    let path = process.env['PATH'].split(':');
    let sudoBin = inpathSync('sudo', path);
    args.unshift(sudoBin);

    let child: ChildProcess = me.spawnShellCommandAsync(args, {}, cbStatusOrFinal, cbFinal);

    if (!child) {
      //In this case spawnShellCommandAsync should handle the error callbacks
      return;
    }

    function waitForStartup(err, children: any[]) {
      if (err) {
        throw new Error(`Error spawning process`);
      }
      if (children && children.length) {
        child.stderr.removeAllListeners();
      } else {
        setTimeout(function () {
          psTree(child.pid, waitForStartup);
        }, 100);
      }
    }

    psTree(child.pid, waitForStartup);

    child.stderr.on('data', function (data) {
      let lines = data.toString().trim().split('\n');
      lines.forEach(function (line) {
        if (line === prompt) {
          if (++prompts > 1) {
            // The previous entry must have been incorrect, since sudo asks again.
            me.cachedPassword = null;
          }
          let loginMessage = 'sudo requires your password: '
          switch (prompts) {
            case 2:
              loginMessage = `hmmm, could you try that again: `;
              break;
            case 3:
              loginMessage = `still not too good ... third time's a charm: `;
              break;
          }
          if (me.cachedPassword) {
            child.stdin.write(me.cachedPassword + '\n');
          } else {
            me.cachedPassword = readlineSync.question(loginMessage, {hideEchoBack: true});
            child.stdin.write(me.cachedPassword + '\n');
          }
        }
      });
    });
    return child;
  }

  private copyStringArray(cmd: string[]) {
    return cmd.slice(0);
  }
}

