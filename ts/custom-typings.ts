import {SpawnOptions} from 'child_process';
export interface SpawnOptions2 extends SpawnOptions{
  showDiagnostics?:boolean;
  preSpawnMessage?:string;
  postSpawnMessage?:string;
  suppressStdOut?:boolean;
  suppressStdErr?:boolean;
  cacheStdOut?:boolean;
  cacheStdErr?:boolean;
  suppressFinalError?: boolean,
  sudoUser?: string,
  sudoPassword?: string
  suppressFinalStats?:boolean;
}
