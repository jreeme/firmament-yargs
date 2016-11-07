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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
const inversify_1 = require('inversify');
let CommandLineImpl = class CommandLineImpl {
    constructor(_nestedYargs) {
        this.nestedYargs = _nestedYargs;
        this.addEasyTableToConsole();
    }
    init(options = {}) {
        this.nestedYargsApp = this.nestedYargs.createApp(options);
    }
    addCommand(cmd) {
        cmd.aliases.forEach(alias => {
            let category = this.nestedYargs.createCategory(alias, cmd.commandDesc);
            cmd.subCommands.forEach(subCommand => {
                subCommand.aliases.forEach(alias => {
                    let catCmd = this.nestedYargs.createCommand(alias, subCommand.commandDesc, subCommand);
                    category.command(catCmd);
                });
            });
            this.nestedYargsApp.command(category);
        });
    }
    printTable(rows) {
        console.table(rows);
    }
    exec(unitTestArgs = []) {
        this.nestedYargs.run(this.nestedYargsApp, unitTestArgs);
    }
    addEasyTableToConsole() {
        if (typeof console === 'undefined') {
            throw new Error('Weird, console object is undefined');
        }
        if (typeof console.table === 'function') {
            return;
        }
        let Table = require('easy-table');
        function arrayToString(arr) {
            let t = new Table();
            arr.forEach(record => {
                if (typeof record === 'string' ||
                    typeof record === 'number') {
                    t.cell('item', record);
                }
                else {
                    Object.keys(record).forEach(property => {
                        t.cell(property, record[property]);
                    });
                }
                t.newRow();
            });
            return t.toString();
        }
        function printTitleTable(title, arr) {
            let str = arrayToString(arr);
            let rowLength = str.indexOf('\n');
            if (rowLength > 0) {
                if (title.length > rowLength) {
                    rowLength = title.length;
                }
                console.log(title);
                let sep = '-', k, line = '';
                for (k = 0; k < rowLength; k += 1) {
                    line += sep;
                }
                console.log(line);
            }
            console.log(str);
        }
        function objectToArray(obj) {
            let keys = Object.keys(obj);
            return keys.map(key => {
                return {
                    key: key,
                    value: obj[key]
                };
            });
        }
        function objectToString(obj) {
            return arrayToString(objectToArray(obj));
        }
        console.table = function () {
            console.log('');
            let args = Array.prototype.slice.call(arguments);
            if (args.length === 2 &&
                typeof args[0] === 'string' &&
                Array.isArray(args[1])) {
                return printTitleTable(args[0], args[1]);
            }
            args.forEach(k => {
                if (typeof k === 'string') {
                    return console.log(k);
                }
                else if (Array.isArray(k)) {
                    console.log(arrayToString(k));
                }
                else if (typeof k === 'object') {
                    console.log(objectToString(k));
                }
            });
        };
    }
};
CommandLineImpl = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject('NestedYargs')), 
    __metadata('design:paramtypes', [Object])
], CommandLineImpl);
exports.CommandLineImpl = CommandLineImpl;
//# sourceMappingURL=command-line-impl.js.map