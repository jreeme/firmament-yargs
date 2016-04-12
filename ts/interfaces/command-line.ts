import {Command} from "./command";
export interface CommandLine {
  addCommand(cmd:Command);
  exec();
}
export interface ConsoleEx extends Console {
  table:any
}
