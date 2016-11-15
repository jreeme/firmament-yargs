"use strict";
require('reflect-metadata');
const inversify_config_1 = require('../inversify.config');
const chai_1 = require('chai');
const sinon = require('sinon');
describe('CommandLine', function () {
    let commandLine;
    let testCommandArray = [];
    let testCommandArrayArray = [];
    before(() => {
        commandLine = inversify_config_1.default.get('CommandLine');
    });
    describe('create using kernel', () => {
        it('should be created by kernel', function (done) {
            chai_1.expect(commandLine).to.not.equal(null);
            done();
        });
    });
    before(() => {
        commandLine = inversify_config_1.default.get('CommandLine');
    });
    describe('printTable', () => {
        let consoleTableStub;
        let testRows = ['row1', 'row2'];
        before(() => {
            consoleTableStub = sinon.stub(console, 'table', (rows) => {
                chai_1.expect(rows).to.equal(testRows);
            });
        });
        it('should call printTable', function (done) {
            commandLine.printTable(testRows);
            chai_1.expect(consoleTableStub.called).to.equal(true);
            done();
        });
        after(() => {
            console.table.restore();
        });
    });
    before(() => {
        commandLine = inversify_config_1.default.get('CommandLine');
    });
    describe('CommandLine.addCommand', () => {
        before(() => {
            commandLine.init({
                version: () => {
                    return 'version_number';
                }
            });
            commandLine.addCommand(testCommand(testCommandArrayArray, (argv) => {
                for (let i = 0; i < argv._.length; ++i) {
                    chai_1.expect(argv._[i]).to.equal(testCommandArray[i]);
                }
            }));
        });
        describe('commandLine.exec()', () => {
            it('commands invoked correct functions', done => {
                testCommandArrayArray.forEach(command => {
                    commandLine.exec(testCommandArray = command);
                });
                done();
            });
        });
    });
});
function testCommand(commands, cb) {
    let newCommand = inversify_config_1.default.get('CommandImpl');
    newCommand.aliases = ['alias-top-1', 'alias-top-2'];
    newCommand.commandDesc = 'topCommandDesc';
    for (let i = 0; i < 3; ++i) {
        let newSubCommand = inversify_config_1.default.get('CommandImpl');
        newSubCommand.aliases = ['alias-sub-1-1-' + i, 'alias-sub-1-2-' + i];
        newSubCommand.commandDesc = 'subCommandDesc-' + i;
        if (i & 1) {
            commands.push([newCommand.aliases[0], newSubCommand.aliases[0]]);
            newSubCommand.handler = cb;
        }
        else {
            for (let j = 0; j < 3; ++j) {
                let newSubSubCommand = inversify_config_1.default.get('CommandImpl');
                newSubSubCommand.aliases = ['alias-sub-1-1-' + i + '-' + j, 'alias-sub-1-2-' + i + '-' + j];
                newSubSubCommand.commandDesc = 'subCommandDesc-' + i + '-' + j;
                commands.push([newCommand.aliases[0], newSubCommand.aliases[0], newSubSubCommand.aliases[0]]);
                newSubSubCommand.handler = cb;
                newSubCommand.subCommands.push(newSubSubCommand);
            }
        }
        newCommand.subCommands.push(newSubCommand);
    }
    return newCommand;
}
//# sourceMappingURL=command-line.test.js.map