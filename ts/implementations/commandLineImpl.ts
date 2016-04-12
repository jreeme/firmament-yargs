import {Command} from "../interfaces/command";
import {CommandLine} from "../interfaces/command-line";
const log:JSNLog.JSNLogLogger = require('jsnlog').JL();
export class CommandLineImpl implements CommandLine {
  private cli = require('nested-yargs');
  private app = this.cli.createApp();
  addCommand(cmd:Command) {
    cmd.aliases.forEach(alias=> {
      let category = this.cli.createCategory(alias, cmd.commandDesc);
      cmd.subCommands.forEach(subCommand=> {
        subCommand.aliases.forEach(alias=> {
          category.command(
            this.cli.createCommand(
              alias,
              subCommand.commandDesc,
              {
                options: subCommand.options,
                handler: subCommand.handler
              }
            )
          );
        });
      });
      this.app.command(category);
    });
  }
  exec() {
    this.cli.run(this.app);
  }
}

