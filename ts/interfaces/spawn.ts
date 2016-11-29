import {ChildProcess} from 'child_process';
import {CommandUtil} from "./command-util";
import {ForceError} from "./force-error";
import {SpawnOptions2} from "../custom-typings";
export interface Spawn extends ForceError {
  cachedPassword: string;
  commandUtil: CommandUtil;
  /*  spawnShellCommandSync(cmd: string[],
   options?: SpawnOptions2,
   cb?: (err: Error, spawnSyncReturns: SpawnSyncReturns<Buffer>)=>void): SpawnSyncReturns<Buffer>;*/
  spawnShellCommandPipelineAsync(cmdArray: string[][],
                                 options?: SpawnOptions2,
                                 cbStatusOrFinal?: (err: Error, result: string)=>void,
                                 cbFinal?: (err: Error, result: string)=>void): ChildProcess;
  sudoSpawnPipelineAsync(cmdArray: string[][],
                         options?: SpawnOptions2,
                         cbStatusOrFinal?: (err: Error, result: string)=>void,
                         cbFinal?: (err: Error, result: string)=>void): ChildProcess;
  spawnShellCommandAsync(cmd: string[],
                         options?: SpawnOptions2,
                         cbStatusOrFinal?: (err: Error, result: string)=>void,
                         cbFinal?: (err: Error, result: string)=>void): ChildProcess;
  sudoSpawnAsync(cmd: string[],
                 options?: SpawnOptions2,
                 cbStatusOrFinal?: (err: Error, result: string)=>void,
                 cbFinal?: (err: Error, result: string)=>void): ChildProcess;
}
