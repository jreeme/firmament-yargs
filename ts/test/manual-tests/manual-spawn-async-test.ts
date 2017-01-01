import 'reflect-metadata';
import kernel from '../../inversify.config';
import {Spawn} from "../../interfaces/spawn";
import {CommandUtil} from "../../interfaces/command-util";
let spawn = kernel.get<Spawn>('Spawn');
let commandUtil = kernel.get<CommandUtil>('CommandUtil');
spawn.spawnShellCommandAsync(
  ['ls', '-F', '-a', '-l'],
  {
    showDiagnostics: false,
    //preSpawnMessage: 'PreSpawn -> Hello!',
    //postSpawnMessage: 'PostSpawn -> Hello!',
    suppressStdOut: false,
    suppressStdErr: true,
    cacheStdOut: false,
    cacheStdErr: true,
    suppressFinalStats: true
  }
  , (err: Error, result: string) => {
    commandUtil.log(result);
  }
  , (err: Error, result: string) => {
    commandUtil.log(result);
    commandUtil.processExitWithError(err);//, 'Finished.');
  }
);
