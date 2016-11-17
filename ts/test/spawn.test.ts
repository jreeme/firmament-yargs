import 'reflect-metadata';
import kernel from '../inversify.config';
import {expect} from 'chai';
import {Spawn} from "../interfaces/spawn";
import path = require('path');
describe('Spawn', function () {
  let spawn: Spawn;
  beforeEach(() => {
    spawn = kernel.get<Spawn>('Spawn');
    //spawn.commandUtil.quiet = true;
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
  describe('spawnShellCommandSync (unexpected error)', () => {
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
  });
  describe('spawnShellCommandSync (valid command,no options,no callback)', () => {
    it('should', done => {
      expect(spawn).to.not.equal(null);
      let testScriptName = path.resolve(__dirname, 'test-00.js');
      let cmd = ['/usr/bin/env', 'node', testScriptName];
      expect(spawn.spawnShellCommandSync).to.throw(Error);
      spawn.spawnShellCommandSync(cmd);
      done();
    });
  });
  describe('spawnShellCommandSync (valid command,null options,null callback)', () => {
    it('should', done => {
      expect(spawn).to.not.equal(null);
      let testScriptName = path.resolve(__dirname, 'test-00.js');
      let cmd = ['/usr/bin/env', 'node', testScriptName];
      expect(spawn.spawnShellCommandSync).to.throw(Error);
      spawn.spawnShellCommandSync(cmd, null, null);
      done();
    });
  });
  describe('spawnShellCommandSync (valid command,null options,null callback)', () => {
    it('should', done => {
      expect(spawn).to.not.equal(null);
      let testScriptName = path.resolve(__dirname, 'test-00.js');
      let cmd = ['/usr/bin/env', 'node', testScriptName];
      expect(spawn.spawnShellCommandSync).to.throw(Error);
      spawn.spawnShellCommandSync(cmd, null, (err, result) => {
       var r = result;
      });
      done();
    });
  });
});

