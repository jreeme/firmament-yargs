import {Command} from "../interfaces/command";
import {CommandLine, ConsoleEx} from "../interfaces/command-line";
import {injectable, inject} from 'inversify';
import {NestedYargs, NestedYargsCategory} from "../interfaces/nested-yargs-wrapper";
declare let console: ConsoleEx;


@injectable()
export class CommandLineImpl implements CommandLine {
  private nestedYargsApp: NestedYargsCategory;

  constructor(@inject('NestedYargs') private nestedYargs: NestedYargs) {
    this.addEasyTableToConsole();
  }

  init(options: any = {}) {
    this.nestedYargsApp = this.nestedYargs.createApp(options);
  }

  addCommand(cmd: Command) {
    cmd.aliases.forEach(alias => {
      let category = this.nestedYargs.createCategory(alias, cmd.commandDesc);
      cmd.subCommands.forEach(subCommand => {
        subCommand.aliases.forEach(alias => {
          let catCmd = this.nestedYargs.createCommand(
            alias,
            subCommand.commandDesc,
            subCommand
          );
          category.command(catCmd);
        });
      });
      this.nestedYargsApp.command(category);
    });
  }

  printTable(rows: any[]) {
    console.table(rows);
  }

  exec(unitTestArgs: string[] = []) {
    this.nestedYargs.run(this.nestedYargsApp, unitTestArgs);
  }

  private addEasyTableToConsole() {
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
        } else {
          // assume plain object
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
        } else if (Array.isArray(k)) {
          console.log(arrayToString(k));
        } else if (typeof k === 'object') {
          console.log(objectToString(k));
        }
      });
    };
  }
}

