import {injectable, inject} from "inversify";
import {Spawn} from '../interfaces/spawn';
import {ChildProcess, SpawnSyncReturns, spawn, spawnSync} from 'child_process';
import {CommandUtil} from '../interfaces/command-util';
import {ForceErrorImpl} from "./force-error-impl";
import {SpawnOptions2} from "../custom-typings";
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

  spawnShellCommandPipelineAsync(cmdArray: string[][],
                                 optionsArray?: SpawnOptions2[],
                                 cbStatusOrFinal?: (err: Error, result: string)=>void,
                                 cbFinal?: (err: Error, result: string)=>void): ChildProcess {
    let lclCmdArray = cmdArray.slice(0);
    let lclOptionsArray = optionsArray.slice(0);
    let cmd = lclCmdArray.pop().slice(0);
    let childProcess = this.spawnShellCommandAsync(cmd, lclOptionsArray.pop(), cbStatusOrFinal, cbFinal);
    let proc = childProcess;
    while (cmd = lclCmdArray.pop()) {
      cmd = cmd.slice(0);
      let prevStdin = proc.stdin;
      proc = this.spawnShellCommandAsync(cmd,
        lclOptionsArray.pop(),
        cbStatusOrFinal,
        (err, results) => {
          process.stderr.write(results);
        }
      );
      proc.stdout.pipe(prevStdin);
    }
    return childProcess;
  }

  sudoSpawnPipelineAsync(cmdArray: string[][],
                         optionsArray?: SpawnOptions2[],
                         cbStatusOrFinal?: (err: Error, result: string)=>void,
                         cbFinal?: (err: Error, result: string)=>void): ChildProcess {
    return undefined;
  }

  private validate_spawnShellCommandAsync_args(cmd: string[],
                                               options: SpawnOptions2 = null,
                                               cbStatus: (err: Error, result: string)=>void = null,
                                               cbFinal: (err: Error, result: string)=>void = null) {
    cmd = cmd || [];
    //Make a copy of cmd
    cmd = cmd.slice(0);
    if (typeof cbFinal !== 'function') {
      if (typeof cbStatus !== 'function') {
        cbFinal = cbStatus = (err: Error, result: string) => {
        };
      } else {
        cbFinal = cbStatus;
        cbStatus = (err: Error, result: string) => {
        };
      }
    } else {
      if (typeof cbStatus !== 'function') {
        cbStatus = (err: Error, result: string) => {
        };
      }
    }
    options = options || {};
    options.preSpawnMessage = options.preSpawnMessage || '';
    options.postSpawnMessage = options.postSpawnMessage || '';
    options.showDiagnostics = options.showDiagnostics || false;
    options.suppressStdErr = options.suppressStdErr || false;
    options.suppressStdOut = options.suppressStdOut || false;
    options.cacheStdErr = options.cacheStdErr || false;
    options.cacheStdOut = options.cacheStdOut || false;
    options.suppressFinalStats = options.suppressFinalStats || false;
    options.stdio = options.stdio || 'pipe';
    options.cwd = options.cwd || process.cwd();
    return {cmd, options, cbStatus, cbFinal};
  }

  spawnShellCommandAsync(_cmd: string[],
                         _options: SpawnOptions2 = null,
                         _cbStatus: (err: Error, result: string)=>void = null,
                         _cbFinal: (err: Error, result: string)=>void = null) {
    let me = this;
    let {cmd, options, cbStatus, cbFinal} =
      me.validate_spawnShellCommandAsync_args(_cmd, _options, _cbStatus, _cbFinal);
    if (me.checkForceError('spawnShellCommandAsync', cbFinal)) {
      return;
    }
    let childProcess: ChildProcess;
    try {
      let command = cmd[0];
      let args = cmd.slice(1);
      let stdoutText = '';
      let stderrText = '';
      me.diagnosticTrace(`Running '${cmd}' @ '${options.cwd}'`, options);
      SpawnImpl.reportStatus(cbStatus, options.preSpawnMessage);
      childProcess = spawn(command, args, options);
      childProcess.stderr.on('data', (dataChunk: Uint8Array) => {
        if (options.suppressStdErr && !options.cacheStdErr) {
          return;
        }
        let text = dataChunk.toString();
        if (!options.suppressStdErr) {
          cbStatus(new Error(text), text);
        }
        if (options.cacheStdErr) {
          stderrText += text;
        }
      });
      childProcess.stdout.on('data', (dataChunk: Uint8Array) => {
        if (options.suppressStdOut && !options.cacheStdOut) {
          return;
        }
        let text = dataChunk.toString();
        if (!options.suppressStdOut) {
          cbStatus(null, text);
        }
        if (options.cacheStdOut) {
          stdoutText += text;
        }
      });
      childProcess.on('error', (code: number) => {
        cbFinal = SpawnImpl.childCloseOrExit(code, '', stdoutText, stderrText, options, cbStatus, cbFinal);
      });
      childProcess.on('exit', (code: number, signal: string) => {
        cbFinal = SpawnImpl.childCloseOrExit(code, signal, stdoutText, stderrText, options, cbStatus, cbFinal);
      });
      childProcess.on('close', (code: number, signal: string) => {
        cbFinal = SpawnImpl.childCloseOrExit(code, signal, stdoutText, stderrText, options, cbStatus, cbFinal);
      });
    } catch (err) {
      cbFinal(err, null);
    }
    return childProcess;
  }

  private static reportStatus(cbStatus: (err: Error, status: string)=>void, status: string) {
    if (!cbStatus || !status) {
      return;
    }
    cbStatus(null, status);
  }

  private diagnosticTrace(msg: string, options: SpawnOptions2) {
    if (!options.showDiagnostics) {
      return;
    }
    this.commandUtil.log(msg);
  }

  private static childCloseOrExit(code: number,
                                  signal: string,
                                  stdoutText: string,
                                  stderrText: string,
                                  options: SpawnOptions2,
                                  cbStatus: (err: Error, result: string)=>void,
                                  cbFinal: (err: Error, result: string)=>void): (err: Error, result: string)=>void {
    if (cbFinal) {
      SpawnImpl.reportStatus(cbStatus, options.postSpawnMessage);
      let returnString = !options.suppressFinalStats
        ? JSON.stringify({code, signal, stdoutText, stderrText}, undefined, 2)
        : '';
      let error = (code !== null && code !== 0)
        ? new Error(returnString)
        : null;
      cbFinal(error, returnString);
    }
    return null;
  }

  sudoSpawnAsync(cmd: string[],
                 options: SpawnOptions2 = null,
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

    //TODO: Set default options
    let child: ChildProcess = me.spawnShellCommandAsync(args, options, cbStatusOrFinal, cbFinal);

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
          let username = require('username').sync();
          let loginMessage = (prompts > 1)
            ? `Sorry, try again.\n[sudo] password for ${username}: `
            : `[sudo] password for ${username}: `;

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

}

/*
 public spawnShellCommandSync(cmd: string[],
 options: SpawnOptions2 = null,
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
 options = options || {preSpawnMessage: '', postSpawnMessage: '', showDiagnostics: false};
 options.stdio = options.stdio || 'inherit';
 options.cwd = process.cwd() || __dirname;
 this.commandUtil.log(`Running '${cmd}' @ '${options.cwd}'`);
 let command = cmd.shift();
 child = spawnSync(command, cmd, options);
 cb(child.error, child);
 } catch (err) {
 cb(err, null);
 }
 return child;
 }
 */

