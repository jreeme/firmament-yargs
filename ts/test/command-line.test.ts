import 'reflect-metadata';
import kernel from '../inversify.config';
import {expect} from 'chai';
import * as sinon from 'sinon';
import {CommandLine} from "../interfaces/command-line";
import {Command} from "../interfaces/command";
describe('CommandLine', function () {
  let commandLine: CommandLine;
  let testCommandArray: string[] = [];
  let testCommandArrayArray: string[][] = [];
  before(()=> {
    commandLine = kernel.get<CommandLine>('CommandLine');
  });
  describe('create using kernel', ()=> {
    it('should be created by kernel', function (done) {
      expect(commandLine).to.not.equal(null);
      done();
    });
  });
  before(()=> {
    commandLine = kernel.get<CommandLine>('CommandLine');
  });
  describe('printTable', ()=> {
    let consoleTableStub: any;
    let testRows = ['row1', 'row2'];
    before(()=> {
/*      consoleTableStub = sinon.stub(console, 'table', (rows)=> {
        expect(rows).to.equal(testRows);
      });*/
    });
    it('should call printTable', function (done) {
      commandLine.printTable(testRows);
      expect(consoleTableStub.called).to.equal(true);
      done();
    });
    after(()=> {
      (<any>console.table).restore();
    });
  });
  before(()=> {
    commandLine = kernel.get<CommandLine>('CommandLine');
  });
  describe('CommandLine.addCommand', ()=> {
      before(()=> {
        commandLine.init({
          version: ()=> {
            return 'version_number';
          }
        });
        commandLine.addCommand(testCommand(testCommandArrayArray, (argv)=> {
          for(let i = 0;i < argv._.length;++i){
            expect(argv._[i]).to.equal(testCommandArray[i]);
          }
        }));
      });
      describe('commandLine.exec()', ()=> {
        it('commands invoked correct functions', done=> {
          testCommandArrayArray.forEach(command=> {
            commandLine.exec(testCommandArray = command);
          });
          done();
        });
      });
    }
  );
});
function testCommand(commands: string[][], cb: (argv: any)=>void) {
  let newCommand = kernel.get<Command>('CommandImpl');
  newCommand.aliases = ['alias-top-1', 'alias-top-2'];
  newCommand.commandDesc = 'topCommandDesc';
  for (let i = 0; i < 3; ++i) {
    let newSubCommand = kernel.get<Command>('CommandImpl');
    newSubCommand.aliases = ['alias-sub-1-1-' + i, 'alias-sub-1-2-' + i];
    newSubCommand.commandDesc = 'subCommandDesc-' + i;
    //noinspection JSBitwiseOperatorUsage
    if (i & 1) {
      commands.push([newCommand.aliases[0], newSubCommand.aliases[0]]);
      newSubCommand.handler = cb;
    } else {
      for (let j = 0; j < 3; ++j) {
        let newSubSubCommand = kernel.get<Command>('CommandImpl');
        newSubSubCommand.aliases = ['alias-sub-1-1-' + i + '-' + j, 'alias-sub-1-2-' + i + '-' + j];
        newSubSubCommand.commandDesc = 'subCommandDesc-' + i + '-' + j;
        commands.push([newCommand.aliases[0], newSubCommand.aliases[0], newSubSubCommand.aliases[0]]);
        newSubSubCommand.handler = cb;
        newSubCommand.subCommands.push(newSubSubCommand);
      }
    }
    newCommand.subCommands.push(newSubCommand);
  }
  return newCommand;
}
