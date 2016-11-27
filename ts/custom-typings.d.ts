import {SpawnOptions} from 'child_process';
export interface SpawnOptions2 extends SpawnOptions{
  preSpawnMessage?:string;
  postSpawnMessage?:string;
  showDiagnostics?:boolean;
  suppressOutput?:boolean;
}
