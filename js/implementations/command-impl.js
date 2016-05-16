"use strict";
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
    CommandImpl.prototype.spawnShellCommand = function (command, args, options, cb) {
        options = options || { stdio: 'inherit', cwd: null };
        options.stdio = options.stdio || 'inherit';
        var child = childProcess.spawnSync(command, args, options);
        process.nextTick(function () {
            cb(child.error, child);
        });
    };
    CommandImpl.generalUsage = '\nUsage: $0 <command> <sub-command> [options]';
    CommandImpl.epilog = '** "Let there be light"';
    return CommandImpl;
}());
exports.CommandImpl = CommandImpl;
//# sourceMappingURL=command-impl.js.map