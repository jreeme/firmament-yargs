import {NestedYargs, NestedYargsApp, CommandHandler} from "../interfaces/nested-yargs-wrapper";
import {injectable} from 'inversify';
@injectable()
export class NestedYargsImpl implements NestedYargs {
  private nestedYargs = require('nested-yargs');

  createApp(options: any): NestedYargsApp {
    return this.nestedYargs.createApp(options);
  }

  createCommand(alias: string, commandDesc: string, handler: CommandHandler): NestedYargsApp {
    return this.nestedYargs.createCommand(alias, commandDesc, handler);
  }

  createCategory(alias: string, commandDesc: string): NestedYargsApp {
    return this.nestedYargs.createCategory(alias, commandDesc);
  }

  run(app: NestedYargsApp): void {
    this.nestedYargs.run(app);
  }
}

