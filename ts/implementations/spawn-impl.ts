import {injectable, inject} from "inversify";
import {Spawn} from '../interfaces/spawn';
import {ChildProcess, spawn} from 'child_process';
import {SpawnOptions2} from "../custom-typings";
import {ForceErrorImpl} from "./force-error-impl";
import {CommandUtil} from "../interfaces/command-util";

const readlineSync = require('readline-sync');
const inpathSync = require('inpath').sync;
const psTree = require('ps-tree');

//noinspection JSUnusedGlobalSymbols
@injectable()
export class SpawnImpl extends ForceErrorImpl implements Spawn {
  private cachedPassword: string;

  constructor(@inject('CommandUtil') public commandUtil: CommandUtil) {
    super();
  }

  private validate_spawnShellCommandAsync_args(cmd: string[],
                                               options: SpawnOptions2,
                                               cbStatus: (err: Error, result: string) => void,
                                               cbFinal: (err: Error, result: string) => void,
                                               cbDiagnostic: (message: string) => void = null) {
    const me = this;
    cmd = cmd || [];
    options = options || {};
    options.preSpawnMessage = options.preSpawnMessage || '';
    options.postSpawnMessage = options.postSpawnMessage || '';
    options.showDiagnostics = options.showDiagnostics || false;
    options.suppressStdErr = options.suppressStdErr || false;
    options.suppressStdOut = options.suppressStdOut || false;
    options.cacheStdErr = options.cacheStdErr || false;
    options.cacheStdOut = options.cacheStdOut || false;
    options.suppressFinalStats = options.suppressFinalStats || false;
    options.suppressFinalError = options.suppressFinalError || false;
    options.sudoUser = options.sudoUser || '';
    options.sudoPassword = options.sudoPassword || '';
    options.stdio = options.stdio || 'pipe';
    options.cwd = options.cwd || process.cwd();
    cbStatus = me.checkCallback(cbStatus);
    cbFinal = me.checkCallback(cbFinal);
    cbDiagnostic = cbDiagnostic || (() => {
    });
    return {cmd, options, cbStatus, cbFinal, cbDiagnostic};
  }

  spawnShellCommandAsync(_cmd: string[],
                         _options: SpawnOptions2,
                         _cbStatus: (err: Error, result: string) => void,
                         _cbFinal: (err: Error, result: string) => void,
                         _cbDiagnostic: (message: string) => void = null) {
    const me = this;
    let {cmd, options, cbStatus, cbFinal, cbDiagnostic}
      = me.validate_spawnShellCommandAsync_args(_cmd, _options, _cbStatus, _cbFinal, _cbDiagnostic);
    if (me.checkForceError('spawnShellCommandAsync', cbFinal)) {
      return;
    }
    let childProcess: ChildProcess;
    try {
      let command = cmd[0];
      let args = cmd.slice(1);
      let stdoutText = '';
      let stderrText = '';
      options.showDiagnostics && cbDiagnostic(`Running '${cmd}' @ '${options.cwd}'`);
      options.showDiagnostics && options.preSpawnMessage && cbDiagnostic(options.preSpawnMessage);
      childProcess = spawn(command, args, options);
      childProcess.stderr.on('data', (dataChunk: Uint8Array) => {
        //console.log('> data on stderr');
        if (options.suppressStdErr && !options.cacheStdErr) {
          return;
        }
        const text = dataChunk.toString();
        !options.suppressStdErr && cbStatus(new Error(text), text);
        options.cacheStdErr && (stderrText += text);
      });
      childProcess.stdout.on('data', (dataChunk: Uint8Array) => {
        //console.log('> data on stdout');
        if (options.suppressStdOut && !options.cacheStdOut) {
          return;
        }
        const text = dataChunk.toString();
        !options.suppressStdOut && cbStatus(null, text);
        options.cacheStdOut && (stdoutText += text);
      });
      childProcess.on('error', (code: number) => {
        cbFinal = SpawnImpl.childCloseOrExit(code, '', stdoutText, stderrText, options, cbFinal, cbDiagnostic);
      });
      childProcess.on('exit', (code: number, signal: string) => {
        cbFinal = SpawnImpl.childCloseOrExit(code, signal, stdoutText, stderrText, options, cbFinal, cbDiagnostic);
      });
      childProcess.on('close', (code: number, signal: string) => {
        cbFinal = SpawnImpl.childCloseOrExit(code, signal, stdoutText, stderrText, options, cbFinal, cbDiagnostic);
      });
    } catch (err) {
      cbFinal && cbFinal(err, null);
    }
    return childProcess;
  }

  private static childCloseOrExit(code: number,
                                  signal: string,
                                  stdoutText: string,
                                  stderrText: string,
                                  options: SpawnOptions2,
                                  cbFinal: (err: Error, result: string) => void,
                                  cbDiagnostic: (message: string) => void): (err: Error, result: string) => void {
    if (cbFinal) {
      options.showDiagnostics && options.postSpawnMessage && cbDiagnostic(options.postSpawnMessage);
      const returnString = JSON.stringify({code, signal, stdoutText, stderrText}, undefined, 2);
      const error = (code !== null && code !== 0)
        ? new Error(returnString)
        : null;
      cbFinal(options.suppressFinalError ? null : error, options.suppressFinalStats ? '' : returnString);
    }
    return null;
  }

  sudoSpawnAsync(cmd: string[],
                 options: SpawnOptions2,
                 cbStatus: (err: Error, result: string) => void,
                 cbFinal: (err: Error, result: string) => void,
                 cbDiagnostic: (message: string) => void = null) {
    let me = this;
    let prompt = '#node-sudo-passwd#';
    let prompts = 0;
    let args = ['-S', '-p', prompt];
    if (options.sudoUser) {
      args.unshift(`--user=${options.sudoUser}`);
    }
    cmd = cmd || [];
    cmd = cmd.slice(0);
    [].push.apply(args, cmd);
    let path = process.env['PATH'].split(':');
    let sudoBin = inpathSync('sudo', path);
    args.unshift(sudoBin);

    let child: ChildProcess = me.spawnShellCommandAsync(
      args,
      options,
      (err, result) => {
        if (err && err.message === prompt) {
          return;
        }
        cbStatus(err, result);
      },
      cbFinal);

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

          if (!me.cachedPassword) {
            me.cachedPassword = options.sudoPassword
              ? options.sudoPassword
              : readlineSync.question(loginMessage, {hideEchoBack: true});
          }
          child.stdin.write(me.cachedPassword + '\n');
        }
      });
    });
    return child;
  }
}

