"use strict";
var readlineSync = require('readline-sync');
var inpathSync = require('inpath').sync;
var pidof = require('pidof');
var childProcess = require('child_process');
var log = require('jsnlog').JL();
var CommandImpl = (function () {
    function CommandImpl() {
        this.aliases = [];
        this.subCommands = [];
        this.command = '';
        this.commandDesc = '';
        this.options = {};
        this.handler = function (argv) {
            log.debug(argv);
        };
    }
    CommandImpl.prototype.returnErrorStringOrMessage = function (err, message) {
        var errorMessage = this.logError(err, false);
        return errorMessage.length ? errorMessage : message;
    };
    CommandImpl.prototype.logErrors = function (errs, writeErrorToConsole) {
        var _this = this;
        if (writeErrorToConsole === void 0) { writeErrorToConsole = true; }
        var retVal = [];
        errs.forEach(function (err) {
            retVal.push(_this.logError(err, writeErrorToConsole));
        });
        return retVal;
    };
    CommandImpl.prototype.logError = function (err, writeErrorToConsole) {
        if (writeErrorToConsole === void 0) { writeErrorToConsole = true; }
        if (err) {
            if (writeErrorToConsole) {
                log.error(err.message);
            }
            return err.message;
        }
        return '';
    };
    CommandImpl.prototype.processExitWithError = function (err, nonErrorMessage) {
        if (nonErrorMessage === void 0) { nonErrorMessage = ''; }
        this.processExit(!!err ? 0 : 1, !!err ? err.message : nonErrorMessage);
    };
    CommandImpl.prototype.processExit = function (exitCode, msg) {
        if (exitCode === void 0) { exitCode = 0; }
        if (msg === void 0) { msg = ''; }
        console.log(msg);
        process.exit(exitCode);
    };
    CommandImpl.prototype.callbackIfError = function (cb, err, result) {
        if (err === void 0) { err = null; }
        if (result === void 0) { result = null; }
        if (this.logError(err)) {
            if (cb && (typeof cb === 'function')) {
                cb(err, result);
            }
            return true;
        }
        return false;
    };
    CommandImpl.prototype.logAndCallback = function (msg, cb, err, result) {
        if (err === void 0) { err = null; }
        if (result === void 0) { result = null; }
        console.log(err ? err.message : msg);
        if (cb && (typeof cb === 'function')) {
            cb(err, result);
        }
        return !!err;
    };
    CommandImpl.prototype.spawnShellCommandAsync = function (cmd, options, cb) {
        var command = cmd.shift();
        var child = childProcess.spawn(command, cmd, options);
        var result = '';
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
    };
    CommandImpl.prototype.spawnShellCommand = function (cmd, options, cb) {
        options = options || { stdio: 'inherit', cwd: null };
        options.stdio = options.stdio || 'inherit';
        console.log('Running `' + cmd + '` @ "' + options.cwd + '"');
        var command = cmd.shift();
        var child = childProcess.spawnSync(command, cmd, options);
        process.nextTick(function () {
            if (cb) {
                cb(child.error, child);
            }
        });
    };
    CommandImpl.prototype.sudoSpawn = function (cmd, cb) {
        CommandImpl._sudoSpawn(cmd, cb);
    };
    CommandImpl.prototype.sudoSpawnSync = function (cmd) {
        return CommandImpl._sudoSpawnSync(cmd);
    };
    CommandImpl._sudoSpawn = function (cmd, cb) {
        var child = CommandImpl._sudoSpawnSync(cmd);
        child.stdout.on('data', function (data) {
            console.log(data.toString());
        });
        child.stdout.on('end', function () {
            if (cb) {
                cb();
                cb = null;
            }
        });
        child.stdout.on('close', function () {
            if (cb) {
                cb();
                cb = null;
            }
        });
        child.stdout.on('error', function () {
            if (cb) {
                cb(new Error('Something went wrong with spawn'));
                cb = null;
            }
        });
    };
    CommandImpl._sudoSpawnSync = function (command) {
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
                        CommandImpl.cachedPassword = null;
                    }
                    if (CommandImpl.cachedPassword) {
                        child.stdin.write(CommandImpl.cachedPassword + '\n');
                    }
                    else {
                        CommandImpl.cachedPassword = CommandImpl.cachedPassword
                            || readlineSync.question('sudo requires your password: ', { hideEchoBack: true });
                        child.stdin.write(CommandImpl.cachedPassword + '\n');
                    }
                }
            });
        });
        return child;
    };
    CommandImpl.generalUsage = '\nUsage: $0 <command> <sub-command> [options]';
    CommandImpl.epilog = '** "Let there be light"';
    return CommandImpl;
}());
exports.CommandImpl = CommandImpl;
//# sourceMappingURL=command-impl.js.map