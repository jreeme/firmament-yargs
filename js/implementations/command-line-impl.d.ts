import { Command } from "../interfaces/command";
import { CommandLine } from "../interfaces/command-line";
export declare class CommandLineImpl implements CommandLine {
    private cli;
    private app;
    constructor(options: any);
    addCommand(cmd: Command): void;
    static printTable(rows: any[]): void;
    exec(): void;
}
