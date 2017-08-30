import {injectable} from 'inversify';
import {ChildProcess, spawn} from 'child_process';
import {ChildProcessSpawn} from '../interfaces/child-process-spawn';
import {SpawnOptions2} from '../custom-typings';

@injectable()
export class ChildProcessSpawnImpl implements ChildProcessSpawn {
  spawn(command: string, args?: string[], options?: SpawnOptions2): ChildProcess {
    return spawn(command, args, options);
  }
}

