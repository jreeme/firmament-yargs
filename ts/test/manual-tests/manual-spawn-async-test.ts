import 'reflect-metadata';
import kernel from '../../inversify.config';
import {Spawn, SpawnOptions2} from '../..';
import {CommandUtil} from '../..';

let spawn = kernel.get<Spawn>('Spawn');
let commandUtil = kernel.get<CommandUtil>('CommandUtil');
const cmd = [
  'touch', '/tmp/tmp.txt'
];

const options:SpawnOptions2 = {
  suppressDiagnostics: false,
  preSpawnMessage: 'PreSpawn -> Hello!',
  postSpawnMessage: 'PostSpawn -> Hello!',
  suppressStdOut: false,
  suppressStdErr: false,
  cacheStdOut: true,
  cacheStdErr: true,
  suppressResult: false
  , remoteHost: 'nfs.parrot-les.keyw',
  remoteUser: 'jreeme',
  remotePassword: 'password'
};

spawn.spawnShellCommandAsync(
  cmd,
  options,
  (err:Error, result:string) => {
    commandUtil.log(result);
  },
  (err:Error, result:string) => {
    commandUtil.log(result);
    commandUtil.processExitWithError(err);//, 'Finished.');
  },
  (message:string) => {
    commandUtil.log(message);
  }
);
