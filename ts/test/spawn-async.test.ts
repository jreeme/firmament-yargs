import 'reflect-metadata';
import kernel from '../inversify.config';
import {expect} from 'chai';
import {Spawn} from "../interfaces/spawn";
import path = require('path');
//"outDir": "/home/jreeme/src/firmament-bash/node_modules/firmament-yargs/js",
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
  describe('spawnShellCommandAsync (force error)', () => {
    it('should report error', done => {
      expect(spawn).to.not.equal(null);
      spawn.forceError = true;
      spawn.spawnShellCommandAsync([], null, (err, result) => {
        expect(result).to.equal(null);
        expect(err).to.not.equal(null);
        expect(err.message).to.equal('force error: spawnShellCommandAsync');
      });
      done();
    });
  });
  describe('spawnShellCommandAsync (null command)', () => {
    it('should report error', done => {
      expect(spawn).to.not.equal(null);
      spawn.spawnShellCommandAsync(null, null, (err, result) => {
        expect(result).to.equal(null);
        expect(err).to.not.equal(null);
        expect(err.message).to.equal('Bad argument');
      });
      done();
    });
  });
  describe('spawnShellCommandAsync (empty array command)', () => {
    it('should report error', done => {
      expect(spawn).to.not.equal(null);
      spawn.spawnShellCommandAsync([], null, (err, result) => {
        expect(result).to.equal(null);
        expect(err).to.not.equal(null);
        expect(err.message).to.equal('Bad argument');
      });
      done();
    });
  });
});

describe('SpawnAsync (with console out)', function () {
  let spawn: Spawn;
  const testScriptName = path.resolve(__dirname, 'test-00.js');
  const testErrorScriptName = path.resolve(__dirname, 'test-error-00.js');
  let cmd: string[];
  beforeEach(done => {
    spawn = kernel.get<Spawn>('Spawn');
    cmd = ['/usr/bin/env', 'node', testScriptName];
    done();
  });
  describe('spawnShellCommandSync (invalid script,no options,no callback)', () => {
    it('should execute script and return', done => {
      expect(spawn).to.not.equal(null);
      cmd[2] = 'happyGoLucky';
      let childProcess: any = spawn.spawnShellCommandAsync(cmd);
      expect(childProcess).to.not.equal(null);
      expect(childProcess.spawnfile).to.equal('/usr/bin/env');
      childProcess.on('close', function (code) {
        //Node execution worked, exit code is non-zero (probably 1) due to non-existent script
        expect(code).to.not.equal(0);
        done();
      });
    });
  });
  describe('spawnShellCommandSync (invalid command,no options,no callback)', () => {
    it('should execute script and return', done => {
      expect(spawn).to.not.equal(null);
      let childProcess: any = spawn.spawnShellCommandAsync(['luv', 'muffins', 'forEveryone']);
      expect(childProcess).to.not.equal(null);
      childProcess.on('error', function (err) {
        expect(err.code).to.equal('ENOENT');
      });
      childProcess.on('close', function (code) {
        //Node execution worked, exit code is non-zero (probably 1) due to non-existent script
        expect(code).to.not.equal(0);
        done();
      });
    });
  });
  describe('spawnShellCommandSync (valid command,no options,no callback)', () => {
    it('should execute script and return', done => {
      expect(spawn).to.not.equal(null);
      let childProcess: any = spawn.spawnShellCommandAsync(cmd);
      expect(childProcess).to.not.equal(null);
      expect(childProcess.spawnfile).to.equal('/usr/bin/env');
      let result = '';
      childProcess.stdout.on('data', function (data) {
        result += data.toString();
      });
      childProcess.on('close', function (code) {
        expect(code).to.equal(0);
        expect(result).to.equal('test me: 0\ntest me: 1\ntest me: 2\n');
        done();
      });
    });
  });
  describe('spawnShellCommandSync (valid command,empty options,final callback)', () => {
    it('should execute script and return', done => {
      expect(spawn).to.not.equal(null);
      spawn.spawnShellCommandAsync(cmd, {}, (err, result) => {
        expect(err).to.equal(null);
        expect(result).to.equal('test me: 0\ntest me: 1\ntest me: 2\n');
        done();
      });
    });
  });
  describe('spawnShellCommandSync (invalid script,empty options,final callback)', () => {
    it('should execute script and return', done => {
      expect(spawn).to.not.equal(null);
      cmd[2] = 'happyGoLucky';
      spawn.spawnShellCommandAsync(cmd, {},
        (err, result) => {
          expect(err).to.not.equal(null);
          expect(result).to.equal('');
          expect(err.message).to.equal('spawn error: exit code 1');
          done();
        });
    });
  });
  describe('spawnShellCommandSync (invalid script,empty options,status callback,final callback)', () => {
    it('should execute script and return', done => {
      expect(spawn).to.not.equal(null);
      cmd[2] = 'happyGoLucky';
      spawn.spawnShellCommandAsync(cmd, {},
        () => {
        },
        (err, result) => {
          expect(err).to.not.equal(null);
          expect(result).to.equal('');
          expect(err.message).to.equal('spawn error: exit code 1');
          done();
        });
    });
  });
  describe('spawnShellCommandSync (invalid command,empty options,final callback)', () => {
    it('should execute script and return', done => {
      expect(spawn).to.not.equal(null);
      spawn.spawnShellCommandAsync(['luv', 'muffins', 'forEveryone'], {},
        (err, result) => {
          expect(err).to.not.equal(null);
          expect(result).to.equal(null);
          expect(err.message).to.equal('spawn error: exit code ENOENT');
          done();
        });
    });
  });
  describe('spawnShellCommandSync (invalid command,empty options,status callback,final callback)', () => {
    it('should execute script and return', done => {
      expect(spawn).to.not.equal(null);
      spawn.spawnShellCommandAsync(['luv', 'muffins', 'forEveryone'], {},
        () => {
        },
        (err, result) => {
          expect(err).to.not.equal(null);
          expect(result).to.equal(null);
          expect(err.message).to.equal('spawn error: exit code ENOENT');
          done();
        });
    });
  });
  describe('spawnShellCommandSync (valid command,empty options,status callback,final callback)', () => {
    it('should execute script and return', done => {
      expect(spawn).to.not.equal(null);
      let accumResult = '';
      spawn.spawnShellCommandAsync(cmd, {},
        (err, result) => {
          expect(err).to.equal(null);
          accumResult += result;
        },
        (err, result) => {
          expect(err).to.equal(null);
          expect(result).to.equal(accumResult);
          expect(result).to.equal('test me: 0\ntest me: 1\ntest me: 2\n');
          done();
        });
    });
  });
  describe('spawnShellCommandSync (valid command {non-zero exit code},empty options,status callback,final callback)', () => {
    it('should execute script and return', done => {
      expect(spawn).to.not.equal(null);
      let accumResult = '';
      cmd = ['/usr/bin/env', 'node', testErrorScriptName];
      spawn.spawnShellCommandAsync(cmd, {},
        (err, result) => {
          expect(err).to.equal(null);
          accumResult += result;
        },
        (err, result) => {
          expect(err).to.not.equal(null);
          expect(err.message).to.equal('spawn error: exit code 3');
          expect(result).to.equal(accumResult);
          expect(result).to.equal('test me: 0\ntest me: 1\n');
          done();
        });
    });
  });
  //TODO: Write unit tests to exercise SpawnOptions2 interface
});
