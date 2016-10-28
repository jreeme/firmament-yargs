import {injectable} from "inversify";
import {SpawnOptions} from "child_process";
const readlineSync = require('readline-sync');
const inpathSync = require('inpath').sync;
const pidof = require('pidof');
const childProcess = require('child_process');
import JSNLogLogger = JL.JSNLogLogger;
import {Spawn} from "../interfaces/spawn";
//const log:JSNLogLogger = require('jsnlog').JL();
//noinspection JSUnusedGlobalSymbols
@injectable()
export class SpawnImpl implements Spawn {
  private static cachedPassword:string;

  spawnShellCommandAsync(cmd:string[], options:SpawnOptions, cb:(err:Error, result:string)=>void) {
    options = options || {stdio: 'pipe', cwd: '.'};
    let command = cmd.shift();
    let child = childProcess.spawn(command, cmd, options);
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

  public spawnShellCommand(cmd:string[], options:SpawnOptions, cb:(err:Error, result:any)=>void) {
    options = options || {stdio: 'inherit', cwd: '.'};
    options.stdio = options.stdio || 'inherit';
    console.log('Running `' + cmd + '` @ "' + options.cwd + '"');
    var command = cmd.shift();
    let child = childProcess.spawnSync(command, cmd, options);
    process.nextTick(()=> {
      if(cb){
        cb(child.error, child);
      }
    });
  }

  sudoSpawn(cmd:string[], cb:(err?:Error)=>void) {
    SpawnImpl._sudoSpawn(cmd, cb);
  }

  sudoSpawnSync(cmd:string[]) {
    return SpawnImpl._sudoSpawnSync(cmd);
  }

  private static _sudoSpawn(cmd:string[], cb:(err?:Error)=>void) {
    var child = SpawnImpl._sudoSpawnSync(cmd);
    child.stdout.on('data', (data)=> {
      console.log(data.toString());
    });
    child.stdout.on('end', ()=> {
      if (cb) {
        cb();
        cb = null;
      }
    });
    child.stdout.on('close', ()=> {
      if (cb) {
        cb();
        cb = null;
      }
    });
    child.stdout.on('error', ()=> {
      if (cb) {
        cb(new Error('Something went wrong with spawn'));
        cb = null;
      }
    });
  }

  private static _sudoSpawnSync(command:string[]) {
    var prompt = '#node-sudo-passwd#';
    var prompts = 0;
    var args = ['-S', '-p', prompt];
    args.push.apply(args, command);
    // The binary is the first non-dashed parameter to sudo
    var bin = command.filter(function (i) {
      return i.indexOf('-') !== 0;
    })[0];
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

