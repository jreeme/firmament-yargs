import 'reflect-metadata';
import kernel from '../inversify.config';
import {expect} from 'chai';
import {Spawn} from "../interfaces/spawn";
import {SpawnOptions} from 'child_process';
import path = require('path');
import fs = require('fs');
const testOutputPath = '/tmp/testout.log';
let stdout: number;
describe('SpawnSync (no console out)', function () {
  let spawn: Spawn;
  beforeEach(done => {
    spawn = kernel.get<Spawn>('Spawn');
    done();
  });
  afterEach(done => {
    spawn = null;
    done();
  });
/*  describe('spawnShellCommandSync (force error)', () => {
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
        expect(result).to.not.equal(null);
        expect(err).to.not.equal(null);
        expect(err.message).to.equal('spawnSync undefined ENOENT');
      });
      done();
    });
  });
  describe('spawnShellCommandSync (empty array command)', () => {
    it('should report error', done => {
      expect(spawn).to.not.equal(null);
      spawn.spawnShellCommandSync([], null, (err, result) => {
        expect(result).to.not.equal(null);
        expect(err).to.not.equal(null);
        expect(err.message).to.equal('spawnSync undefined ENOENT');
      });
      done();
    });
  });
});

describe('SpawnSync (with console out)', function () {
  let spawn: Spawn;
  const testScriptName = path.resolve(__dirname, 'test-00.js');
  let cmd: string[];
  //let unhookStdoutIntercept:any;
  beforeEach(done => {
    spawn = kernel.get<Spawn>('Spawn');
    cmd = ['/usr/bin/env', 'node', testScriptName];
    done();
  });
  afterEach(done => {
    done();
  });
  describe('spawnShellCommandSync (valid command,no options,no callback)', () => {
    it('should execute script and return', done => {
      expect(spawn).to.not.equal(null);
      spawn.spawnShellCommandSync(cmd);
      done();
    });
  });
  describe('spawnShellCommandSync (valid command,null options,null callback)', () => {
    it('should execute script and return', done => {
      expect(spawn).to.not.equal(null);
      spawn.spawnShellCommandSync(cmd, null, null);
      done();
    });
  });
  describe('spawnShellCommandSync (valid command,redirect options,no callback)', () => {
    it('should execute script and return', done => {
      expect(spawn).to.not.equal(null);
      spawn.spawnShellCommandSync(cmd, getStdoutOptions());
      let contents = getStdoutContents();
      expect(contents).to.equal('test me: 0\ntest me: 1\ntest me: 2\n');
      done();
    });
  });
  describe('spawnShellCommandSync (valid command,redirect options,valid callback)', () => {
    it('should execute script and return', done => {
      expect(spawn).to.not.equal(null);
      spawn.spawnShellCommandSync(cmd, getStdoutOptions(), (err, result) => {
        expect(err).to.equal(undefined);
        expect(result).to.not.equal(null);
        let contents = getStdoutContents();
        expect(contents).to.equal('test me: 0\ntest me: 1\ntest me: 2\n');
        done();
      });
    });
  });*/
});

function getStdoutOptions(): SpawnOptions {
  stdout = fs.openSync(testOutputPath, 'w');
  return {
    stdio: ['ignore', stdout, 'ignore']
  }
}

function getStdoutContents(): string {
  fs.closeSync(stdout);
  return fs.readFileSync(testOutputPath, {encoding: 'utf8'});
}


