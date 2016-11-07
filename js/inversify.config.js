"use strict";
const inversify_1 = require('inversify');
const progress_bar_impl_1 = require("./implementations/progress-bar-impl");
const command_line_impl_1 = require("./implementations/command-line-impl");
const command_util_impl_1 = require("./implementations/command-util-impl");
const nested_yargs_wrapper_impl_1 = require("./implementations/nested-yargs-wrapper-impl");
const spawn_impl_1 = require("./implementations/spawn-impl");
const command_impl_1 = require("./implementations/command-impl");
var kernel = new inversify_1.Kernel();
kernel.bind('ProgressBar').to(progress_bar_impl_1.ProgressBarImpl);
kernel.bind('CommandLine').to(command_line_impl_1.CommandLineImpl);
kernel.bind('NestedYargs').to(nested_yargs_wrapper_impl_1.NestedYargsImpl);
kernel.bind('CommandUtil').to(command_util_impl_1.CommandUtilImpl);
kernel.bind('Command').to(command_impl_1.CommandImpl);
kernel.bind('Spawn').to(spawn_impl_1.SpawnImpl);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = kernel;
//# sourceMappingURL=inversify.config.js.map