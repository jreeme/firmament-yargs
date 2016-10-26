import 'reflect-metadata';
import kernel from '../inversify.config';
import {expect} from 'chai';
import * as sinon from 'sinon';
import {CommandLine} from "../interfaces/command-line";
import {NestedYargs} from "../interfaces/nested-yargs-wrapper";
import {NestedYargsMockImpl} from "./nested-yargs-wrapper-impl-mock";
import {CommandLineImpl} from "../implementations/command-line-impl";
describe('CommandLine', function () {
  let commandLine: CommandLine;
  beforeEach(()=> {
    kernel.unbind('NestedYargs');
    kernel.bind<NestedYargs>('NestedYargs').to(NestedYargsMockImpl);
    commandLine = kernel.get<CommandLine>('CommandLine');
  });
  describe('create using kernel', ()=> {
    it('should be created by kernel', function (done) {
      expect(commandLine).to.not.equal(null);
      done();
    });
  });
  describe('printTable', ()=> {
    let consoleTableStub: any;
    let testRows = ['row1', 'row2'];
    before(()=> {
      consoleTableStub = sinon.stub(console, 'table', (rows)=> {
        expect(rows).to.equal(testRows);
      });
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
  describe('addCommand', ()=> {
    it('should call NestedYargs.addCommand correctly', function (done) {
      commandLine.init();
      let cmdLineImpl = <CommandLineImpl>commandLine;
      let yargsMock = <NestedYargsMockImpl>cmdLineImpl.nestedYargs;
      commandLine.addCommand(yargsMock.testCommand);
      yargsMock.verify();
      done();
    });
  });
});
