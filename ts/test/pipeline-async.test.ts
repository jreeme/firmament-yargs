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
    done();
  });
  afterEach(done => {
    spawn = null;
    done();
  });
  describe('spawnShellCommandPipelineAsync', () => {
    it('should', done => {
      expect(spawn).to.not.equal(null);
      spawn.spawnShellCommandPipelineAsync([
          ["/home/jreeme/src/firmament-bash/js/test/helpers/test-00.js", "10", "Piping exercise -->"],
          ["/home/jreeme/src/firmament-bash/js/test/helpers/test-01.js", "Middle Text!->"],
          ["/home/jreeme/src/firmament-bash/js/test/helpers/test-02.js", "End Text!->"]
        ],
        null,
        (err, result) => {
          expect(err).to.equal(null);
          spawn.commandUtil.stdoutWrite(result);
        },
        (err) => {
          expect(err).to.equal(null);
          done();
        }
      );
    });
  });
});
//"outDir": "/home/jreeme/src/firmament-bash/node_modules/firmament-yargs/js",
