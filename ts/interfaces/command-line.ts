import {Command} from "./command";
import {NestedYargs} from "./nested-yargs-wrapper";
export interface CommandLine {
  init(options?:any);
  addCommand(cmd:Command);
  printTable(rows:any[]);
  exec();
}
export interface ConsoleEx extends Console {
  table:any
}
