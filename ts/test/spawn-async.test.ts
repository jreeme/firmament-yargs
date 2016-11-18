import 'reflect-metadata';
import kernel from '../inversify.config';
import {expect} from 'chai';
import {Spawn} from "../interfaces/spawn";
import {SpawnOptions} from 'child_process';
import path = require('path');
//const interceptStdout = require('intercept-stdout');
describe('SpawnAsync (no console out)', function () {
  let spawn: Spawn;
  beforeEach(done => {
    spawn = kernel.get<Spawn>('Spawn');
    spawn.commandUtil.quiet = true;
    done();
  });
  afterEach(done => {
    spawn = null;
    done();
  });
  describe('spawnShellCommandSync (force error)', () => {
    it('should report error', done => {
      expect(spawn).to.not.equal(null);
      spawn.forceError = true;
      spawn.spawnShellCommandSync([], null, (err, result) => {
        expect(result).to.equal(null);
        expect(err).to.not.equal(null);
        expect(err.message).to.equal('force error: spawnShellCommandSync');
      });
      done();
    });
  });
/*  describe('spawnShellCommandSync (unexpected error)', () => {
    it('should report error', done => {
      expect(spawn).to.not.equal(null);
      spawn.commandUtil = null;//This would be very unusual
      spawn.spawnShellCommandSync([], null, (err, result) => {
        expect(result).to.equal(null);
        expect(err).to.not.equal(null);
        expect(err.message).to.equal(`Cannot read property 'log' of null`);
      });
      done();
    });
  });
  describe('spawnShellCommandSync (null command)', () => {
    it('should report error', done => {
      expect(spawn).to.not.equal(null);
      spawn.spawnShellCommandSync(null, null, (err, result) => {
        expect(result).to.equal(null);
        expect(err).to.not.equal(null);
        expect(err.message).to.equal('expected { Object (error, status, ...) } to equal null');
      });
      done();
    });
  });
  describe('spawnShellCommandSync (empty array command)', () => {
    it('should report error', done => {
      expect(spawn).to.not.equal(null);
      spawn.spawnShellCommandSync([], null, (err, result) => {
        expect(result).to.equal(null);
        expect(err).to.not.equal(null);
        expect(err.message).to.equal('expected { Object (error, status, ...) } to equal null');
      });
      done();
    });
  });*/
});

/*describe('SpawnSync (with console out)', function () {
  let spawn: Spawn;
  let spawnOptions: SpawnOptions;
  //let unhookStdoutIntercept:any;
  beforeEach(done => {
    spawn = kernel.get<Spawn>('Spawn');
    spawnOptions = {};
/!*    unhookStdoutIntercept = interceptStdout(txt=>{
      let t = txt;
    });*!/
    done();
  });
  afterEach(done => {
/!*    unhookStdoutIntercept();*!/
    done();
  });
  describe('spawnShellCommandSync (valid command,no options,no callback)', () => {
    it('should excute script and return', done => {
      expect(spawn).to.not.equal(null);
      let testScriptName = path.resolve(__dirname, 'test-00.js');
      let cmd = ['/usr/bin/env', 'node', testScriptName];
      spawn.spawnShellCommandSync(cmd);
      done();
    });
  });
  describe('spawnShellCommandSync (valid command,null options,null callback)', () => {
    it('should excute script and return', done => {
      expect(spawn).to.not.equal(null);
      let testScriptName = path.resolve(__dirname, 'test-00.js');
      let cmd = ['/usr/bin/env', 'node', testScriptName];
      spawn.spawnShellCommandSync(cmd, null, null);
      done();
    });
  });
  describe('spawnShellCommandSync (valid command,spawn options,null callback)', () => {
    it('should excute script and return', done => {
      expect(spawn).to.not.equal(null);
      let testScriptName = path.resolve(__dirname, 'test-00.js');
      let cmd = ['/usr/bin/env', 'node', testScriptName];
      spawn.spawnShellCommandSync(cmd, spawnOptions, null);
      done();
    });
  });
  describe('spawnShellCommandSync (valid command,null options,null callback)', () => {
    it('should excute script and return', done => {
      expect(spawn).to.not.equal(null);
      let testScriptName = path.resolve(__dirname, 'test-00.js');
      let cmd = ['/usr/bin/env', 'node', testScriptName];
      spawn.spawnShellCommandSync(cmd, null, (err, result) => {
        expect(result).to.not.equal(null);
        done();
      });
    });
  });
});*/
