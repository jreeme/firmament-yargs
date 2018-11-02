import {injectable, inject} from 'inversify';
import {Spawn} from '..';
import {ChildProcess} from 'child_process';
import {SpawnOptions2} from '../custom-typings';
import {ForceErrorImpl} from './force-error-impl';
import {CommandUtil} from '..';
import {ChildProcessSpawn} from '../interfaces/child-process-spawn';
import * as async from 'async';
import * as fs from 'fs';

const readlineSync = require('readline-sync');
const inpathSync = require('inpath').sync;
const psTree = require('ps-tree');

//noinspection JSUnusedGlobalSymbols
@injectable()
export class SpawnImpl extends ForceErrorImpl implements Spawn {
  private cachedPassword:string;

  constructor(@inject('CommandUtil') public commandUtil:CommandUtil,
              @inject('ChildProcessSpawn') public childProcessSpawn:ChildProcessSpawn) {
    super();
  }

  private validate_spawnShellCommandAsync_args(cmd:string[],
                                               options:SpawnOptions2,
                                               cbStatus:(err:Error, result:string) => void,
                                               cbFinal:(err:Error, result:string) => void,
                                               cbDiagnostic:(message:string) => void = null) {
    const me = this;
    cmd = cmd || [];
    cmd = cmd.slice(0);
    options = options || {};
    options.preSpawnMessage = options.preSpawnMessage || '';
    options.postSpawnMessage = options.postSpawnMessage || '';
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

  spawnShellCommandAsync(_cmd:string[],
                         _options:SpawnOptions2,
                         _cbStatus:(err:Error, result:string) => void,
                         _cbFinal:(err:Error, result:string) => void,
                         _cbDiagnostic:(message:string) => void = null) {

    const me = this;
    let {cmd, options, cbStatus, cbFinal, cbDiagnostic}
      = me.validate_spawnShellCommandAsync_args(_cmd, _options, _cbStatus, _cbFinal, _cbDiagnostic);
    if(me.checkForceError('spawnShellCommandAsync', cbFinal)) {
      return;
    }

    if(!options.remoteHost && !options.remoteUser && !options.remotePassword) {
      return me._spawnShellCommandAsync(cmd, options, cbStatus, cbFinal, cbDiagnostic);
    }
    if(!options.remoteHost || !options.remoteUser || !options.remotePassword) {
      throw new Error('If any of options.(remoteHost|remoteUser|remotePassword) are specified all must be specified');
    }
    //Construct calls to remote host
    const tmp = require('tmp');
    tmp.file({discardDescriptor: true}, (err:Error, path, fd, cleanupCallback) => {
      if(err) {
        cleanupCallback();
        return cbFinal(err, 'Failed to create temporary file');
      }
      async.waterfall([
        (cb) => {
          //Construct file to be executed on remote host
          const writeStream = fs.createWriteStream(path);
          writeStream.on('close', () => {
            cb();
          });
          writeStream.write('how now brown cow', () => {
            writeStream.close();
          });
        }
      ], (err:Error, result:any) => {
        cleanupCallback();
        cbFinal(null, 'OK');
      });
    });
  }

  private _spawnShellCommandAsync(cmd:string[],
                                  options:SpawnOptions2,
                                  cbStatus:(err:Error, result:string) => void,
                                  cbFinal:(err:Error, result:string) => void,
                                  cbDiagnostic:(message:string) => void = null) {
    const me = this;
    let childProcess:ChildProcess;
    try {
      if(options.forceNullChildProcess) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error('error: forceNullChildProcess');
      }
      let command = cmd[0];
      let args = cmd.slice(1);
      let stdoutText = '';
      let stderrText = '';
      if(!options.suppressDiagnostics) {
        cbDiagnostic(`Running '${cmd}' @ '${options.cwd}'`);
        options.preSpawnMessage && cbDiagnostic(options.preSpawnMessage);
      }
      try {
        childProcess = me.childProcessSpawn.spawn(command, args, options);
      } catch(err) {
        if(err.message === 'Path must be a string. Received undefined') {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error('Bad argument');
        }
        // noinspection ExceptionCaughtLocallyJS
        throw err;
      }
      childProcess.stderr.on('data', (dataChunk:Uint8Array) => {
        if(options.suppressStdErr && !options.cacheStdErr) {
          return;
        }
        const text = dataChunk.toString();
        !options.suppressStdErr && cbStatus(new Error(text), text);
        options.cacheStdErr && (stderrText += text);
      });
      childProcess.stdout.on('data', (dataChunk:Uint8Array) => {
        if(options.suppressStdOut && !options.cacheStdOut) {
          return;
        }
        const text = dataChunk.toString();
        !options.suppressStdOut && cbStatus(null, text);
        options.cacheStdOut && (stdoutText += text);
      });
      childProcess.on('error', (code:number, signal:string) => {
        cbFinal = SpawnImpl.childCloseOrExit(code || 10, signal || '', stdoutText, stderrText, options, cbFinal, cbDiagnostic);
      });
      childProcess.on('exit', (code:number, signal:string) => {
        cbFinal = SpawnImpl.childCloseOrExit(code, signal || '', stdoutText, stderrText, options, cbFinal, cbDiagnostic);
      });
      childProcess.on('close', (code:number, signal:string) => {
        cbFinal = SpawnImpl.childCloseOrExit(code, signal || '', stdoutText, stderrText, options, cbFinal, cbDiagnostic);
      });
    } catch(err) {
      cbFinal && cbFinal(err, null);
    }
    return childProcess;
  }

  private static childCloseOrExit(code:number,
                                  signal:string,
                                  stdoutText:string,
                                  stderrText:string,
                                  options:SpawnOptions2,
                                  cbFinal:(err:Error, result:string) => void,
                                  cbDiagnostic:(message:string) => void):(err:Error, result:string) => void {
    if(cbFinal) {
      !options.suppressDiagnostics && options.postSpawnMessage && cbDiagnostic(options.postSpawnMessage);
      const returnString = JSON.stringify({code, signal, stdoutText, stderrText}, undefined, 2);
      const error = (code !== null && code !== 0)
        ? new Error(returnString)
        : null;
      cbFinal(options.suppressFinalError ? null : error, options.suppressResult ? '' : returnString);
    }
    return null;
  }

  sudoSpawnAsync(_cmd:string[],
                 _options:SpawnOptions2,
                 _cbStatus:(err:Error, result:string) => void,
                 _cbFinal:(err:Error, result:string) => void,
                 _cbDiagnostic:(message:string) => void = null) {
    const me = this;
    let {cmd, options, cbStatus, cbFinal, cbDiagnostic}
      = me.validate_spawnShellCommandAsync_args(_cmd, _options, _cbStatus, _cbFinal, _cbDiagnostic);
    if(me.checkForceError('sudoSpawnAsync', cbFinal)) {
      return;
    }
    const prompt = '#login-prompt#';
    const args = ['-S', '-p', prompt];
    if(options.sudoUser) {
      args.unshift(`--user=${options.sudoUser}`);
    }
    [].push.apply(args, cmd);
    const path = process.env['PATH'].split(':');
    const sudoBin = inpathSync('sudo', path);
    args.unshift(sudoBin);

    const childProcess:ChildProcess = me.spawnShellCommandAsync(
      args,
      options,
      (err, result) => {
        //sudo asks for password on stderr so if the prompt is on one of the lines don't call cbStatus
        //(caller doesn't care about feedback from sudo, only the program being run under sudo)
        if(err) {
          try {
            const lines = result.toString().trim().split('\n');
            for(let i = 0; i < lines.length; ++i) {
              if(lines[i] === prompt) {
                return;
              }
            }
          } catch(err) {
          }
        }
        cbStatus(err, result);
      },
      (err, result) => {
        if(result) {
          const regex = new RegExp(prompt, 'g');
          result = result.replace(regex, '');
        }
        cbFinal(err, result);
      },
      cbDiagnostic);

    if(!childProcess) {
      //In this case spawnShellCommandAsync should handle the error callbacks
      return;
    }

    function waitForStartup(err, children:any[]) {
      if(err) {
        throw new Error(`Error spawning process`);
      }
      if(children && children.length) {
        childProcess.stderr.removeAllListeners();
      } else {
        setTimeout(function() {
          psTree(childProcess.pid, waitForStartup);
        }, 100);
      }
    }

    psTree(childProcess.pid, waitForStartup);

    let prompts = 0;
    childProcess.stderr.on('data', function(data) {
      const lines = data.toString().trim().split('\n');
      lines.forEach(function(line) {
        if(line === prompt) {
          if(++prompts > 1) {
            // The previous entry must have been incorrect, since sudo asks again.
            me.cachedPassword = null;
          }
          const username = require('username').sync();
          if(!me.cachedPassword) {
            if(options.sudoPassword) {
              me.cachedPassword = options.sudoPassword;
            } else {
              try {
                //Try block needed for inappropriate ioctl (usually unit testing or other non-tty invocation)
                const loginMessage = (prompts > 1)
                  ? `Sorry, try again.\n[sudo] password for ${username}: `
                  : `[sudo] password for ${username}: `;
                me.cachedPassword = readlineSync.question(loginMessage, {hideEchoBack: true});
              } catch(err) {
                childProcess.kill();
                return;
              }
            }
          }
          childProcess.stdin.write(me.cachedPassword + '\n');
        }
      });
    });
    return childProcess;
  }
}

