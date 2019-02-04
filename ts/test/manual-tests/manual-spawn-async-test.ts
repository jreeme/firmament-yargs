import 'reflect-metadata';
import kernel from '../../inversify.config';
import {Spawn, SpawnOptions2} from '../..';
import {CommandUtil} from '../..';
import * as async from 'async';

let spawn = kernel.get<Spawn>('Spawn');
let commandUtil = kernel.get<CommandUtil>('CommandUtil');

async.each([
  'nfs.parrot-scif.keyw'
], (volume, cb) => {
  const spawnOptions: SpawnOptions2 = {
    suppressStdOut: false,
    suppressStdErr: false,
    cacheStdOut: true,
    cacheStdErr: true,
    suppressResult: false,
    remoteHost: 'localhost',
    remoteUser: 'nfs',
    //remoteSshKeyPath: '/home/jreeme/.ssh/parrot',
    //remoteSshPort: 2222
    remotePassword: 'password'
  };
  spawn.spawnShellCommandAsync(
    [
      'ls',
      '-F',
      '-a',
      '-l'
    ],
    spawnOptions,
    (err, result) => {
      commandUtil.log(result);
    },
    (err: Error, result: string) => {
      commandUtil.log(result);
      cb(err)
    }
  );
}, (err) => {
  commandUtil.log('Finitoed');
  commandUtil.processExit(0);
});
const cmd = ['npm', 'install', '--save', '--prefix', '/home/jreeme/src/firmament', 'firmament-docker'];
/*const cmd = [
  'touch', '/tmp/tmp.txt'
];*/

/*const options:SpawnOptions2 = {
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
};*/

//spawn.spawnShellCommandAsync(
/*spawn.sudoSpawnAsync(
  cmd,
  null,//options,
  (err: Error, result: string) => {
    commandUtil.log(result);
  },
  (err: Error, result: string) => {
    commandUtil.log(result);
    commandUtil.processExitWithError(err);//, 'Finished.');
  },
  (message: string) => {
    commandUtil.log(message);
  }
);*/
