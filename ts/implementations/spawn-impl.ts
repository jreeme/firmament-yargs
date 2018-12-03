import {injectable, inject} from 'inversify';
import {FailureRetVal, Positive, SafeJson, Spawn} from '..';
import {ChildProcess} from 'child_process';
import {SpawnOptions2} from '../custom-typings';
import {ForceErrorImpl} from './force-error-impl';
import {CommandUtil} from '..';
import {ChildProcessSpawn} from '../interfaces/child-process-spawn';
import * as async from 'async';
import * as fs from 'fs';
//import * as path from 'path';

const readlineSync = require('readline-sync');
const inpathSync = require('inpath').sync;
const psTree = require('ps-tree');

//noinspection JSUnusedGlobalSymbols
@injectable()
export class SpawnImpl extends ForceErrorImpl implements Spawn {
  private cachedPassword: string;

  constructor(@inject('CommandUtil') public commandUtil: CommandUtil,
              @inject('SafeJson') private safeJson: SafeJson,
              @inject('Positive') private positive: Positive,
              @inject('ChildProcessSpawn') public childProcessSpawn: ChildProcessSpawn) {
    super();
  }

  installAptitudePackages(packageNames: string[], cb: (err: Error, result: string) => void): void;
  installAptitudePackages(packageNames: string[], withInteractiveConfirm: ((err: Error, result: string) => void)|boolean, cb?: (err: Error, result: string) => void): void {
    const me = this;
    if(me.positive.areYouSure(
      `Looks like 'sshpass' is not installed. Want me to try to install it (using apt-get)? [Y/n]`,
      'Operation canceled.',
      true,
      FailureRetVal.TRUE)) {
    }
    me.sudoSpawnAsync(
      [
        'apt-get',
        'install',
        '-y',
        'sshpass'
      ],
      {
        suppressDiagnostics: true,
        suppressStdOut: false,
        suppressStdErr: false,
        cacheStdOut: false,
        cacheStdErr: false,
        sudoPassword: 'password',
        suppressResult: true,
      },
      () => {
      },
      (err: Error, result: string) => {
        cb(err, err ? err.message : `'sshpass' installed. Try operation again.`);
      });
  }

  removeAptitudePackages(packageNames: string[], cb: (err: Error, result: string) => void): void;
  removeAptitudePackages(packageNames: string[], withInteractiveConfirm: ((err: Error, result: string) => void)|boolean, cb?: (err: Error, result: string) => void): void {
  }

  private validate_spawnShellCommandAsync_args(cmd: string[],
                                               options: SpawnOptions2,
                                               cbStatus: (err: Error, result: string) => void,
                                               cbFinal: (err: Error, result: string) => void,
                                               cbDiagnostic: (message: string) => void = null) {
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

  spawnShellCommandAsync(_cmd: string[],
                         _options: SpawnOptions2,
                         _cbStatus: (err: Error, result: string) => void,
                         _cbFinal: (err: Error, result: string) => void,
                         _cbDiagnostic: (message: string) => void = null) {
    const me = this;
    let {cmd, options, cbStatus, cbFinal, cbDiagnostic}
      = me.validate_spawnShellCommandAsync_args(_cmd, _options, _cbStatus, _cbFinal, _cbDiagnostic);

    if(me.checkForceError('spawnShellCommandAsync', cbFinal)) {
      return null;
    }
    if(!options.remoteHost && !options.remoteUser && !(options.remotePassword || options.remoteSshKeyPath)) {
      //Execute cmd locally
      return me._spawnShellCommandAsync(cmd, options, cbStatus, cbFinal, cbDiagnostic);
    }
    const msgBase = 'Not enough params for remote call:\n\n';
    let msg = msgBase;
    if(!options.remoteHost) {
      msg += `* 'remoteHost' must be set to the remote server hostname\n`;
    }
    if(!options.remoteUser) {
      msg += `* 'remoteUser' must be set to the user on the remote host to execute the call as\n`;
    }
    if(!(options.remotePassword || options.remoteSshKeyPath)) {
      msg += `* either 'remotePassword' or 'remoteSshKeyPath' (or both, SshKey wins) must be specified`;
    }
    if(msg.length != msgBase.length) {
      cbFinal(new Error(msg), msg);
      return null;
    }
    options.remotePassword = options.remoteSshKeyPath ? undefined : options.remotePassword;
    //Construct calls to remote host
    const tmp = require('tmp');
    tmp.file({discardDescriptor: true}, (err: Error, tmpPath) => {
      if(err) {
        return cbFinal(err, 'Failed to create temporary file');
      }
      const {remoteHost, remoteUser, remotePassword, remoteSshKeyPath, remoteSshPort} = options;
      const subShellOptions = {
        suppressDiagnostics: true,
        suppressStdOut: true,
        suppressStdErr: true,
        cacheStdOut: true,
        cacheStdErr: true,
        suppressResult: false,
      };
      const envBashCmd = [
        '/usr/bin/env',
        'bash',
        '-c'
      ];
      const sshpassCmd = [
        'sshpass',
        '-p',
        remotePassword
      ];
      const sshKeyPathOptions = [
        '-i',
        `${remoteSshKeyPath}`
      ];
      const sshOptions = [
        '-q',
        '-o',
        'StrictHostKeyChecking=no'
      ];
      const scpCmd = [
        'scp',
        ...sshOptions
      ];
      const sshCmd = [
        'ssh',
        ...sshOptions
      ];
      if(remoteSshPort) {
        scpCmd.push('-P', `${remoteSshPort}`);
        sshCmd.push('-p', `${remoteSshPort}`);
      }
      const finalScpCmd = remoteSshKeyPath ? scpCmd.concat(sshKeyPathOptions) : sshpassCmd.concat(scpCmd);
      const finalSshCmd = remoteSshKeyPath ? sshCmd.concat(sshKeyPathOptions) : sshpassCmd.concat(sshCmd);
      async.waterfall([
        (cb) => {
          //Construct file to be executed on remote host
          const writeStream = fs.createWriteStream(tmpPath);
          writeStream.on('close', () => {
            cb();
          });
          const cmdString = cmd.join(' ') + `\nrm ${tmpPath}`;
          writeStream.write(cmdString, () => {
            writeStream.close();
          });
        },
        (cb) => {
          //Copy file to be executed to remote host using 'scp'
          const cmd = finalScpCmd.concat([
            tmpPath,
            `${remoteUser}@${remoteHost}:/tmp`
          ]);
          me._spawnShellCommandAsync(
            cmd,
            subShellOptions,
            () => {
            }, cb);
        },
        (result: string, cb) => {
          //If 'scp' (above) succeeded we feel pretty good about doing a remote 'ssh' call
          //const cmd = finalSshCmd.concat(`${remoteUser}@${remoteHost} "echo ${remotePassword} | sudo -S /usr/bin/env bash ${tmpPath}"`);
          const remoteScriptCmd = `/usr/bin/env bash ${tmpPath}`;
          const executeRemoteScriptCmd = remoteSshKeyPath
            ? remoteScriptCmd
            : `echo ${remotePassword} | sudo -S ${remoteScriptCmd}`;

          const cmd = finalSshCmd.concat(`${remoteUser}@${remoteHost} "${executeRemoteScriptCmd}"`);
          const _cmd = envBashCmd.concat(cmd.join(' '));

          me._spawnShellCommandAsync(
            _cmd,
            subShellOptions,
            (err: Error, result: string) => {
              me.commandUtil.log(result);
            },
            cb);
        }
      ], (outerErr: Error, result: any) => {
        if(outerErr) {
          me.safeJson.safeParse(outerErr.message, (err: Error, obj: any) => {
            try {
              switch(typeof obj.code) {
                case('object'):
                  switch(obj.code.code) {
                    case('ENOENT'):
                      //TODO: Finish 'installAptitudePackages' method above to install sshpass
                      me.commandUtil.processExitWithError(new Error(`Need to install 'sshpass': sudo apt-get install -y sshpass`));
                      break;
                    default:
                      return cbFinal(outerErr, outerErr.message);
                  }
                  break;
                case('number'):
                  return cbFinal(outerErr, obj.stderrText);
                default:
                  return cbFinal(outerErr, outerErr.message);
              }
            } catch(err) {
              cbFinal(err, `Original Error: ${outerErr.message}`);
            }
          });
        } else {
          cbFinal(null, result);
        }
      });
    });
  }

  private _spawnShellCommandAsync(cmd: string[],
                                  options: SpawnOptions2,
                                  cbStatus: (err: Error, result: string) => void,
                                  cbFinal: (err: Error, result: string) => void,
                                  cbDiagnostic: (message: string) => void = null) {
    const me = this;
    let childProcess: ChildProcess;
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
      childProcess = me.childProcessSpawn.spawn(command, args, options);
      childProcess.stderr.on('data', (dataChunk: Uint8Array) => {
        if(options.suppressStdErr && !options.cacheStdErr) {
          return;
        }
        const text = dataChunk.toString();
        !options.suppressStdErr && cbStatus(new Error(text), text);
        options.cacheStdErr && (stderrText += text);
      });
      childProcess.stdout.on('data', (dataChunk: Uint8Array) => {
        if(options.suppressStdOut && !options.cacheStdOut) {
          return;
        }
        const text = dataChunk.toString();
        !options.suppressStdOut && cbStatus(null, text);
        options.cacheStdOut && (stdoutText += text);
      });
      childProcess.on('error', (code: number, signal: string) => {
        //console.error('error');
        cbFinal = SpawnImpl.childCloseOrExit(code || 10, signal || '', stdoutText, stderrText, options, cbFinal, cbDiagnostic);
      });
      //!!!
      //!!!BEWARE: Responding to the 'exit' event on a childProcess we the source of a *very* subtle bug having to do with the stdout pipe
      //!!!not being flushed when the our caller was called back. If you want the results of the call in stdout listen only to the 'close'
      //!!!to determine when the child process is finished
      //!!!
      childProcess.on('exit', (code: number, signal: string) => {
        //console.error('exit');
        //We prefer to call cbFinal() from the 'close' event but sometimes (like when spawning 'sudo') you just never get the 'close' event.
        //Here we wait a second
        setTimeout(() => {
          cbFinal = SpawnImpl.childCloseOrExit(code, signal || '', stdoutText, stderrText, options, cbFinal, cbDiagnostic);
        }, 1000);
      });
      childProcess.on('close', (code: number, signal: string) => {
        //console.error('close');
        cbFinal = SpawnImpl.childCloseOrExit(code, signal || '', stdoutText, stderrText, options, cbFinal, cbDiagnostic);
      });
    } catch(err) {
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

  sudoSpawnAsync(_cmd: string[],
                 _options: SpawnOptions2,
                 _cbStatus: (err: Error, result: string) => void,
                 _cbFinal: (err: Error, result: string) => void,
                 _cbDiagnostic: (message: string) => void = null) {
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

    const childProcess: ChildProcess = me._spawnShellCommandAsync(
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

    function waitForStartup(err, children: any[]) {
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

