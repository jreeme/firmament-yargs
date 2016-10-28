import {SpawnOptions} from "child_process";
export interface Spawn {
  spawnShellCommandAsync(cmd:string[], options:SpawnOptions, cb:(err:Error, result:string)=>void);
  spawnShellCommand(cmd:string[], options:SpawnOptions, cb:(err:Error, result:any)=>void);
  sudoSpawnSync(cmd:string[]);
  sudoSpawn(cmd:string[], cb:(err?:Error)=>void);
}
