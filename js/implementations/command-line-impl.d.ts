import { Command } from "../interfaces/command";
import { CommandLine } from "../interfaces/command-line";
export declare class CommandLineImpl implements CommandLine {
    private cli;
    private app;
    addCommand(cmd: Command): void;
    exec(): void;
}
