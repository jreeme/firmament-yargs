/// <reference types="node" />
import { Command } from "./command";
export interface CommandLine {
    init(options?: any): any;
    addCommand(cmd: Command): any;
    printTable(rows: any[]): any;
    exec(unitTestArgs?: string[]): any;
}
export interface ConsoleEx extends Console {
    table: any;
}
