"use strict";
var log = require('jsnlog').JL();
var CommandLineImpl = (function () {
    function CommandLineImpl() {
        this.cli = require('nested-yargs');
        this.app = this.cli.createApp();
    }
    CommandLineImpl.prototype.addCommand = function (cmd) {
        var _this = this;
        cmd.aliases.forEach(function (alias) {
            var category = _this.cli.createCategory(alias, cmd.commandDesc);
            cmd.subCommands.forEach(function (subCommand) {
                subCommand.aliases.forEach(function (alias) {
                    category.command(_this.cli.createCommand(alias, subCommand.commandDesc, {
                        options: subCommand.options,
                        handler: subCommand.handler
                    }));
                });
            });
            _this.app.command(category);
        });
    };
    CommandLineImpl.prototype.exec = function () {
        this.cli.run(this.app);
    };
    return CommandLineImpl;
}());
exports.CommandLineImpl = CommandLineImpl;
