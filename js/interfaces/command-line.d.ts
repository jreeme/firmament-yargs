import { Command } from "./command";
export interface CommandLine {
    addCommand(cmd: Command): any;
    exec(): any;
}
