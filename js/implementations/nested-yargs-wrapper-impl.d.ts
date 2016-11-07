import { NestedYargs, NestedYargsCategory } from "../interfaces/nested-yargs-wrapper";
import { Command } from "../interfaces/command";
export declare class NestedYargsImpl implements NestedYargs {
    private nestedYargs;
    createApp(options: any): NestedYargsCategory;
    createCommand(alias: string, commandDesc: string, handler: Command): NestedYargsCategory;
    createCategory(alias: string, commandDesc: string): NestedYargsCategory;
    run(app: NestedYargsCategory, unitTestArgs?: string[]): void;
}
