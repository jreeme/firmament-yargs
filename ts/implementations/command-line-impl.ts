import {Command} from "../interfaces/command";
import {CommandLine, ConsoleEx} from "../interfaces/command-line";
//const log:JSNLog.JSNLogLogger = require('jsnlog').JL();
declare let console:ConsoleEx;
export class CommandLineImpl implements CommandLine {
  private cli = require('nested-yargs');
  private app;

  constructor(options:any) {
    this.app = this.cli.createApp(options);
  }

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

  static printTable(rows:any[]) {
    console.table(rows);
  }

  exec() {
    this.cli.run(this.app);
  }
}

