import { Command } from "../interfaces/command";
import { CommandLine } from "../interfaces/command-line";
import { NestedYargs } from "../interfaces/nested-yargs-wrapper";
export declare class CommandLineImpl implements CommandLine {
    nestedYargs: NestedYargs;
    private nestedYargsApp;
    constructor(_nestedYargs: NestedYargs);
    init(options?: any): void;
    addCommand(cmd: Command): void;
    printTable(rows: any[]): void;
    exec(unitTestArgs?: string[]): void;
    private addEasyTableToConsole();
}
