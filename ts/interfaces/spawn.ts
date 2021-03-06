import {ChildProcess} from 'child_process';
import {ForceError} from './force-error';
import {SpawnOptions2} from '../custom-typings';

export interface Spawn extends ForceError {
  spawnShellCommandAsync(cmd: string[],
                         options: SpawnOptions2,
                         cbStatus: (err: Error, result: string) => void,
                         cbFinal: (err: Error, result: string) => void,
                         cbDiagnostic?: (message: string) => void): ChildProcess;
  sudoSpawnAsync(cmd: string[],
                 options: SpawnOptions2,
                 cbStatus: (err: Error, result: string) => void,
                 cbFinal: (err: Error, result: string) => void,
                 cbDiagnostic?: (message: string) => void): ChildProcess;
  installAptitudePackages(packageNames: string[], cb: (err: Error, result: string) => void): void;
  installAptitudePackages(packageNames: string[], withInteractiveConfirm: ((err: Error, result: string) => void)|boolean, cb?: (err: Error, result: string) => void): void;
  removeAptitudePackages(packageNames: string[], cb: (err: Error, result: string) => void): void;
  removeAptitudePackages(packageNames: string[], withInteractiveConfirm: ((err: Error, result: string) => void)|boolean, cb?: (err: Error, result: string) => void): void;
}

