import { Command } from "./command";
export interface NestedYargs {
    createApp(options: any): NestedYargsCategory;
    createCommand(alias: string, commandDesc: string, handler: Command): NestedYargsCategory;
    createCategory(alias: string, commandDesc: string): NestedYargsCategory;
    run(app: NestedYargsCategory, unitTestArgs?: string[]): void;
}
export interface NestedYargsCategory {
    command(command: any): void;
}
