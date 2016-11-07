import { Command } from "../interfaces/command";
export declare class CommandImpl implements Command {
    aliases: string[];
    command: string;
    commandDesc: string;
    handler: (argv: any) => void;
    options: any;
    subCommands: Command[];
    constructor();
}
