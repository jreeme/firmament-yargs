import {SpawnOptions} from 'child_process';
export interface SpawnOptions2 extends SpawnOptions{
  preSpawnMessage?:string;
  postSpawnMessage?:string;
  suppressDiagnostics?:boolean;
  suppressStdErr?:boolean;
  suppressStdOut?:boolean;
  cacheStdErr?:boolean;
  cacheStdOut?:boolean;
  suppressResult?:boolean;
  suppressFinalError?: boolean,
  sudoUser?: string,
  sudoPassword?: string
}
