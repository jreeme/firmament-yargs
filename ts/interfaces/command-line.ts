import {Command} from "./command";
export interface CommandLine {
  init(options?:any);
  addCommand(cmd:Command);
  printTable(rows:any[]);
  exec(unitTestArgs?:string[]);
}
export interface ConsoleEx extends Console {
  table:any
}
