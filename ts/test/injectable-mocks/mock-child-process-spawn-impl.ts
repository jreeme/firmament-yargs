import {injectable} from 'inversify';
import {ChildProcess, spawn} from 'child_process';
import {ChildProcessSpawn} from '../../interfaces/child-process-spawn';
import {SpawnOptions2} from '../../custom-typings';

const mockSpawnConstructor = require('mock-spawn');

@injectable()
export class MockChildProcessSpawnImpl implements ChildProcessSpawn {
  private mockSpawn = mockSpawnConstructor();

  constructor() {
    const me = this;
    //me.mockSpawn.setDefault(me.mockSpawn.simple(0));
    me.mockSpawn.setStrategy((cmd, args, opts) => {

      let c = cmd;
    });
  }

  spawn(command: string, args?: string[], options?: SpawnOptions2): ChildProcess {
    const me = this;
    return me.mockSpawn(command, args, options);
  }
}

