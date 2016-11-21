import {ChildProcess, SpawnOptions, SpawnSyncReturns} from 'child_process';
import {CommandUtil} from "./command-util";
import {ForceError} from "./force-error";
export interface Spawn extends ForceError {
  cachedPassword: string;
  commandUtil: CommandUtil;
  spawnShellCommandSync(cmd: string[],
                        options?: SpawnOptions,
                        cb?: (err: Error, spawnSyncReturns: SpawnSyncReturns<Buffer>)=>void): SpawnSyncReturns<Buffer>;
  spawnShellCommandAsync(cmd: string[],
                         options?: SpawnOptions,
                         cbStatusOrFinal?: (err: Error, result: string)=>void,
                         cbFinal?: (err: Error, result: string)=>void): ChildProcess;
  sudoSpawnAsync(cmd: string[],
                 options?: SpawnOptions,
                 cbStatusOrFinal?: (err: Error, result: string)=>void,
                 cbFinal?: (err: Error, result: string)=>void): ChildProcess;
}
