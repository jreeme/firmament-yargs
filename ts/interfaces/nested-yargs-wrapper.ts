import {Command} from "./command";
export interface NestedYargs {
  createApp(options: any): NestedYargsApp;
  createCommand(alias: string, commandDesc: string, handler: Command): NestedYargsApp;
  createCategory(alias: string, commandDesc: string): NestedYargsApp;
  run(app: NestedYargsApp): void;
}

export interface NestedYargsApp {
  command(command: NestedYargsApp): void;
}
