import {NestedYargs, NestedYargsCategory} from "../interfaces/nested-yargs-wrapper";
import {injectable} from 'inversify';
import {Command} from "../interfaces/command";
@injectable()
export class NestedYargsImpl implements NestedYargs {
  private nestedYargs = require('nested-yargs');

  createApp(options: any): NestedYargsCategory {
    return this.nestedYargs.createApp(options);
  }

  createCommand(alias: string, commandDesc: string, handler: Command): NestedYargsCategory {
    return this.nestedYargs.createCommand(alias, commandDesc, handler);
  }

  createCategory(alias: string, commandDesc: string): NestedYargsCategory {
    return this.nestedYargs.createCategory(alias, commandDesc);
  }

  run(app: NestedYargsCategory, unitTestArgs:string[] = []): void {

    let yargs = unitTestArgs.length
      ? require('yargs')(unitTestArgs)
      : null;
    return this.nestedYargs.run(app, yargs);
  }
}

