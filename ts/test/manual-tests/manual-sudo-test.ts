import 'reflect-metadata';
import kernel from '../../inversify.config';
import {Spawn} from "../../interfaces/spawn";
let spawn = kernel.get<Spawn>('Spawn');

//noinspection JSUnusedLocalSymbols
/*
spawn.sudoSpawnAsync(['node', '/home/jreeme/src/firmament-yargs/js/test/test-00.js'], null,
  (err, result) => {
    let msg = spawn.commandUtil.returnErrorStringOrMessage(err, result);
    spawn.commandUtil.stdoutWrite(msg);
  },
  (err, result) => {
    spawn.commandUtil.processExitWithError(err, 'OK');
  }
);
*/
