"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const inversify_1 = require("inversify");
const readlineSync = require('readline-sync');
const inpathSync = require('inpath').sync;
const pidof = require('pidof');
const childProcess = require('child_process');
let SpawnImpl_1 = class SpawnImpl {
    spawnShellCommandAsync(cmd, options, cb) {
        options = options || { stdio: 'pipe', cwd: '.' };
        let command = cmd.shift();
        let child = childProcess.spawn(command, cmd, options);
        let result = '';
        child.stdout.on('data', function (data) {
            result += data.toString();
        });
        child.on('error', function (code) {
            if (cb) {
                cb(new Error('spawn error'), null);
                cb = null;
            }
        });
        child.on('close', function (code) {
            if (cb) {
                cb(null, result);
                cb = null;
            }
        });
    }
    spawnShellCommand(cmd, options, cb) {
        options = options || { stdio: 'inherit', cwd: '.' };
        options.stdio = options.stdio || 'inherit';
        console.log('Running `' + cmd + '` @ "' + options.cwd + '"');
        var command = cmd.shift();
        let child = childProcess.spawnSync(command, cmd, options);
        process.nextTick(() => {
            if (cb) {
                cb(child.error, child);
            }
        });
    }
    sudoSpawn(cmd, cb) {
        SpawnImpl_1._sudoSpawn(cmd, cb);
    }
    sudoSpawnSync(cmd) {
        return SpawnImpl_1._sudoSpawnSync(cmd);
    }
    static _sudoSpawn(cmd, cb) {
        var child = SpawnImpl_1._sudoSpawnSync(cmd);
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
    static _sudoSpawnSync(command) {
        var prompt = '#node-sudo-passwd#';
        var prompts = 0;
        var args = ['-S', '-p', prompt];
        args.push.apply(args, command);
        var bin = command.filter(function (i) {
            return i.indexOf('-') !== 0;
        })[0];
        var options = options || {};
        var spawnOptions = options.spawnOptions || {};
        spawnOptions.stdio = 'pipe';
        var path = process.env['PATH'].split(':');
        var sudoBin = inpathSync('sudo', path);
        var child = childProcess.spawn(sudoBin, args, spawnOptions);
        function waitForStartup(err, pid) {
            if (err) {
                throw new Error('Couldn\'t start ' + bin);
            }
            if (pid || child.exitCode !== null) {
                child.emit('started');
            }
            else {
                setTimeout(function () {
                    pidof(bin, waitForStartup);
                }, 100);
            }
        }
        pidof(bin, waitForStartup);
        child.stderr.on('data', function (data) {
            var lines = data.toString().trim().split('\n');
            lines.forEach(function (line) {
                if (line === prompt) {
                    if (++prompts > 1) {
                        SpawnImpl_1.cachedPassword = null;
                    }
                    if (SpawnImpl_1.cachedPassword) {
                        child.stdin.write(SpawnImpl_1.cachedPassword + '\n');
                    }
                    else {
                        SpawnImpl_1.cachedPassword = SpawnImpl_1.cachedPassword
                            || readlineSync.question('sudo requires your password: ', { hideEchoBack: true });
                        child.stdin.write(SpawnImpl_1.cachedPassword + '\n');
                    }
                }
            });
        });
        return child;
    }
};
let SpawnImpl = SpawnImpl_1;
SpawnImpl = SpawnImpl_1 = __decorate([
    inversify_1.injectable(), 
    __metadata('design:paramtypes', [])
], SpawnImpl);
exports.SpawnImpl = SpawnImpl;
//# sourceMappingURL=spawn-impl.js.map