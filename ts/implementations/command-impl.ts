import {Command} from "../interfaces/command";
import {injectable} from 'inversify';

@injectable()
export class CommandImpl implements Command {
  aliases: string[];
  command: string;
  commandDesc: string;
  handler: (argv: any)=>void;
  options: any;
  subCommands: Command[];

  constructor() {
    this.aliases = [];
    this.command = '';
    this.commandDesc = '';
    //noinspection JSUnusedLocalSymbols
    this.handler = (argv: any)=> {
    };
    this.options = {};
    this.subCommands = [];
  }
}
