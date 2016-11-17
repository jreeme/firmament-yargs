import {SpawnOptions, SpawnSyncReturns} from 'child_process';
import {CommandUtil} from "./command-util";
import {ForceError} from "./force-error";
export interface Spawn extends ForceError {
  spawnShellCommandSync(cmd: string[],
                        options?: SpawnOptions,
                        cb?: (err: Error, spawnSyncReturns: SpawnSyncReturns<Buffer>)=>void);
  spawnShellCommandAsync(cmd: string[], options: SpawnOptions, cb: (err: Error, result: string)=>void);
  sudoSpawnSync(cmd: string[]);
  sudoSpawn(cmd: string[], cb: (err?: Error)=>void);
  commandUtil: CommandUtil;
}
