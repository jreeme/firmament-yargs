import 'reflect-metadata';
import kernel from '../inversify.config';
import {expect} from 'chai';
import {Spawn} from "../interfaces/spawn";
import path = require('path');
describe('Sudo', function () {
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
      spawn.sudoSpawnAsync(['node', '/home/jreeme/src/firmament-yargs/js/test/test-00.js'], null, (err, result) => {
        expect(result).to.equal(null);
        expect(err).to.not.equal(null);
        expect(err.message).to.equal('force error: spawnShellCommandAsync');
        done();
      });
    });
  });
});

