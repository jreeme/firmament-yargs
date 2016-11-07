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
const log = require('jsnlog').JL();
let CommandUtilImpl = class CommandUtilImpl {
    returnErrorStringOrMessage(err, message) {
        let errorMessage = this.logError(err, false);
        return errorMessage.length ? errorMessage : message;
    }
    logErrors(errs, writeErrorToConsole = true) {
        let retVal = [];
        errs.forEach(err => {
            retVal.push(this.logError(err, writeErrorToConsole));
        });
        return retVal;
    }
    logError(err, writeErrorToConsole = true) {
        if (err) {
            if (writeErrorToConsole) {
                log.error(err.message);
            }
            return err.message;
        }
        return '';
    }
    processExitWithError(err, nonErrorMessage = null) {
        this.processExit(!!err ? 1 : 0, !!err ? err.message : !!nonErrorMessage ? nonErrorMessage : '');
    }
    processExit(exitCode = 0, msg = null) {
        console.log(!!msg ? msg : '');
        process.exit(exitCode);
    }
    callbackIfError(cb, err = null, result = null) {
        if (this.logError(err)) {
            if (cb && (typeof cb === 'function')) {
                cb(err, result);
            }
            return true;
        }
        return false;
    }
    logAndCallback(msg, cb, err = null, result = null) {
        console.log(err ? err.message : msg);
        if (cb && (typeof cb === 'function')) {
            cb(err, result);
        }
        return !!err;
    }
};
CommandUtilImpl = __decorate([
    inversify_1.injectable(), 
    __metadata('design:paramtypes', [])
], CommandUtilImpl);
exports.CommandUtilImpl = CommandUtilImpl;
//# sourceMappingURL=command-util-impl.js.map