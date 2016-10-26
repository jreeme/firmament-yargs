import {NestedYargs, NestedYargsApp} from "../interfaces/nested-yargs-wrapper";
import kernel from '../inversify.config';
import {injectable} from 'inversify';
import {expect} from 'chai';
import {Command} from "../interfaces/command";
@injectable()
export class NestedYargsMockImpl implements NestedYargs {
  private createAppCallCount:number = 0;
  private createAppInnerCallCount:number = 0;
  createApp(options: any): NestedYargsApp {
    ++this.createAppCallCount;
    return {
      command: (command: NestedYargsApp): void=> {
        ++this.createAppInnerCallCount;
      }
    };
  }

  createCommand(alias: string, commandDesc: string, handler: Command): NestedYargsApp {
    return {
      command: (command: NestedYargsApp): void=> {
        let cmd = command;
      }
    };
  }

  createCategory(alias: string, commandDesc: string): NestedYargsApp {
    return {
      command: (command: NestedYargsApp): void=> {
        let cmd = command;
      }
    };
  }

  run(app: NestedYargsApp): void {
    var a = app;
  }

  constructor() {
  }

  verify() {
    expect(this.createAppCallCount).to.equal(1);
    expect(this.createAppInnerCallCount).to.equal(2);
  }

  get testCommand() {
    let newCommand = kernel.get<Command>('Command');
    newCommand.aliases = ['alias1', 'alias2'];
    newCommand.commandDesc = 'commandDesc';
    for(let i = 0;i < 3;++i){
      let newSubCommand = kernel.get<Command>('Command');
      newSubCommand.aliases = ['alias' + i];
      newSubCommand.commandDesc = 'commandDesc' + i;
      newCommand.subCommands.push(newSubCommand);
    }
    return newCommand;
  }
}

