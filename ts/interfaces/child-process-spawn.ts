import {ChildProcess} from 'child_process';
import {SpawnOptions2} from "../custom-typings";
export interface ChildProcessSpawn{
  spawn(command: string, args?: string[], options?: SpawnOptions2): ChildProcess;
}

