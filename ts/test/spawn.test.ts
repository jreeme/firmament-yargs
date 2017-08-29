import 'reflect-metadata';
import kernel from '../inversify.config';
import {expect} from 'chai';
import * as sinon from 'sinon';
import * as _ from 'lodash';
import path = require('path');
import {Spawn} from "../interfaces/spawn";
import {SpawnOptions2} from "../custom-typings";

const pathToScripts = path.resolve(__dirname, '../../ts/test/shell-scripts');
const testScript = path.resolve(pathToScripts, 'kitchen-sink.sh');
const testArgs = [
  'arg1',
  'arg2'
];

function checkError(error,
                    code: number = 0,
                    signal: string = '',
                    stdOut: string = '',
                    stdErr: string = '') {
  expect(error).to.exist;
  expect(error.message).to.be.not.empty;
  checkResult(error.message, code, signal, stdOut, stdErr);
}

function checkResult(result,
                     code: number = 0,
                     signal: string = '',
                     stdOut: string = '',
                     stdErr: string = '') {
  const resultObj = JSON.parse(result);
  expect(resultObj.code).to.equal(code);
  expect(resultObj.signal).to.equal(signal);
  expect(resultObj.stderrText).to.equal(stdErr);
  expect(resultObj.stdoutText).to.equal(stdOut);
}

function getNewSpawnOptions(): SpawnOptions2 {
  return _.clone({
    preSpawnMessage: 'PreSpawn Message',
    postSpawnMessage: 'PostSpawn Message',
    suppressDiagnostics: true,
    suppressStdErr: true,
    suppressStdOut: true,
    cacheStdErr: true,
    cacheStdOut: true,
    suppressResult: true,
    suppressFinalError: true,
    sudoUser: '',
    sudoPassword: ''
  });
}

function getArgArray(): string[] {
  return [
    testScript,
    'writeToStdOutErrExitWithErrCode',
    '0',
    'writeToStdOut',
    'writeToStdErr',
    ...testArgs
  ];
}

describe('Testing Spawn Creation/Force Error', () => {
  xit('should be created by kernel', (done) => {
    const spawn = kernel.get<Spawn>('Spawn');
    expect(spawn).to.exist;
    done();
  });
  xit('should have final callback with error', (done) => {
    const spawn = kernel.get<Spawn>('Spawn');
    spawn.forceError = true;
    spawn.spawnShellCommandAsync(null, null, null,
      (err) => {
        expect(err).to.exist;
        expect(err.message).to.equal('force error: spawnShellCommandAsync');
        done();
      });
  });
});

describe('Testing Spawn ', () => {
  let spawn: Spawn;
  let argArray: string[];
  let spawnOptions: SpawnOptions2;
  let sinonSandbox;
  let cbStdOutSpy;
  let cbStdErrSpy;
  let cbDiagnosticSpy;

  function cbStatusMock(err, result) {
    if (err) {
      cbStdErrSpy(err, result);
    } else {
      cbStdOutSpy(err, result);
    }
  }

  const o = {
    cbStdOutCall: () => {
    },
    cbStdErrCall: () => {
    },
    cbStatus: () => {
    },
    cbDiagnostic: () => {
    }
  };
  beforeEach(() => {
    spawn = kernel.get<Spawn>('Spawn');
    argArray = getArgArray();
    spawnOptions = getNewSpawnOptions();
    sinonSandbox = sinon.sandbox.create();
    cbDiagnosticSpy = sinonSandbox.spy(o, 'cbDiagnostic');
    cbStdOutSpy = sinonSandbox.spy(o, 'cbStdOutCall');
    cbStdErrSpy = sinonSandbox.spy(o, 'cbStdErrCall');
  });
  afterEach(() => {
    sinonSandbox.restore();
  });
  xit('spawnShellCommandAsync: undefined options, exit with code 0', (done) => {
    argArray[1] = 'exitWithErrCode';
    spawnOptions = undefined;
    spawn.spawnShellCommandAsync(
      argArray,
      spawnOptions,
      o.cbStatus,
      (err, result) => {
        expect(err).to.not.exist;
        checkResult(result);
        expect(cbStdErrSpy.called).to.be.false;
        expect(cbStdOutSpy.called).to.be.false;
        expect(cbDiagnosticSpy.called).to.be.true;
        done();
      },
      o.cbDiagnostic
    );
  });
  xit('spawnShellCommandAsync: null options, exit with code 0', (done) => {
    argArray[1] = 'exitWithErrCode';
    spawnOptions = null;
    spawn.spawnShellCommandAsync(
      argArray,
      spawnOptions,
      o.cbStatus,
      (err, result) => {
        expect(err).to.not.exist;
        checkResult(result);
        expect(cbStdErrSpy.called).to.be.false;
        expect(cbStdOutSpy.called).to.be.false;
        expect(cbDiagnosticSpy.called).to.be.true;
        done();
      },
      o.cbDiagnostic
    );
  });
  xit('spawnShellCommandAsync: null options, undefined arguments exit with code 0', (done) => {
    argArray = undefined;
    spawnOptions = null;
    spawn.spawnShellCommandAsync(
      argArray,
      spawnOptions,
      o.cbStatus,
      (err, result) => {
        expect(err).to.exist;
        expect(err.message).to.equal('Bad argument');
        expect(result).to.not.exist;
        expect(cbStdErrSpy.called).to.be.false;
        expect(cbStdOutSpy.called).to.be.false;
        expect(cbDiagnosticSpy.called).to.be.true;
        done();
      },
      o.cbDiagnostic
    );
  });
  xit('spawnShellCommandAsync: null options, null arguments exit with code 0', (done) => {
    argArray = null;
    spawnOptions = null;
    spawn.spawnShellCommandAsync(
      argArray,
      spawnOptions,
      o.cbStatus,
      (err, result) => {
        expect(err).to.exist;
        expect(err.message).to.equal('Bad argument');
        expect(result).to.not.exist;
        expect(cbStdErrSpy.called).to.be.false;
        expect(cbStdOutSpy.called).to.be.false;
        expect(cbDiagnosticSpy.called).to.be.true;
        done();
      },
      o.cbDiagnostic
    );
  });
  xit('spawnShellCommandAsync: no result, exit with code 0', (done) => {
    argArray[1] = 'exitWithErrCode';
    spawn.spawnShellCommandAsync(
      argArray,
      spawnOptions,
      o.cbStatus,
      (err, result) => {
        expect(err).to.not.exist;
        expect(result).to.be.empty;
        expect(cbStdErrSpy.called).to.be.false;
        expect(cbStdOutSpy.called).to.be.false;
        expect(cbDiagnosticSpy.called).to.be.false;
        done();
      },
      o.cbDiagnostic
    );
  });
  xit('spawnShellCommandAsync: no result, yes diagnostics, exit with code 0', (done) => {
    argArray[1] = 'exitWithErrCode';
    spawnOptions.suppressDiagnostics = false;
    spawn.spawnShellCommandAsync(
      argArray,
      spawnOptions,
      o.cbStatus,
      (err, result) => {
        expect(err).to.not.exist;
        expect(result).to.be.empty;
        expect(cbStdErrSpy.called).to.be.false;
        expect(cbStdOutSpy.called).to.be.false;
        expect(cbDiagnosticSpy.called).to.be.true;
        done();
      },
      o.cbDiagnostic
    );
  });
  xit('spawnShellCommandAsync: yes result, exit with code 0', (done) => {
    argArray[1] = 'exitWithErrCode';
    spawnOptions.suppressResult = false;
    spawn.spawnShellCommandAsync(
      argArray,
      spawnOptions,
      o.cbStatus,
      (err, result) => {
        expect(err).to.not.exist;
        checkResult(result);
        expect(cbStdErrSpy.called).to.be.false;
        expect(cbStdOutSpy.called).to.be.false;
        expect(cbDiagnosticSpy.called).to.be.false;
        done();
      },
      o.cbDiagnostic
    );
  });
  xit('spawnShellCommandAsync: no result, no finalError, exit with code 3', (done) => {
    argArray[1] = 'exitWithErrCode';
    argArray[2] = '3';
    spawn.spawnShellCommandAsync(
      argArray,
      spawnOptions,
      o.cbStatus,
      (err, result) => {
        expect(err).to.not.exist;
        expect(result).to.be.empty;
        expect(cbStdErrSpy.called).to.be.false;
        expect(cbStdOutSpy.called).to.be.false;
        expect(cbDiagnosticSpy.called).to.be.false;
        done();
      },
      o.cbDiagnostic
    );
  });
  xit('spawnShellCommandAsync: no result, yes finalError, exit with code 3', (done) => {
    argArray[1] = 'exitWithErrCode';
    argArray[2] = '3';
    spawnOptions.suppressFinalError = false;
    spawn.spawnShellCommandAsync(
      argArray,
      spawnOptions,
      o.cbStatus,
      (err, result) => {
        checkError(err, 3);
        expect(result).to.be.empty;
        expect(cbStdErrSpy.called).to.be.false;
        expect(cbStdOutSpy.called).to.be.false;
        expect(cbDiagnosticSpy.called).to.be.false;
        done();
      },
      o.cbDiagnostic
    );
  });
  xit('spawnShellCommandAsync: yes result, yes finalError, exit with code 3', (done) => {
    argArray[1] = 'exitWithErrCode';
    argArray[2] = '3';
    spawnOptions.suppressFinalError = false;
    spawnOptions.suppressResult = false;
    spawn.spawnShellCommandAsync(
      argArray,
      spawnOptions,
      o.cbStatus,
      (err, result) => {
        checkError(err, 3);
        checkResult(result, 3);
        expect(cbStdErrSpy.called).to.be.false;
        expect(cbStdOutSpy.called).to.be.false;
        expect(cbDiagnosticSpy.called).to.be.false;
        done();
      },
      o.cbDiagnostic
    );
  });
  xit('spawnShellCommandAsync: yes result, no finalError, exit with code 3', (done) => {
    argArray[1] = 'exitWithErrCode';
    argArray[2] = '3';
    spawnOptions.suppressResult = false;
    spawn.spawnShellCommandAsync(
      argArray,
      spawnOptions,
      o.cbStatus,
      (err, result) => {
        expect(err).to.not.exist;
        checkResult(result, 3);
        expect(cbStdErrSpy.called).to.be.false;
        expect(cbStdOutSpy.called).to.be.false;
        expect(cbDiagnosticSpy.called).to.be.false;
        done();
      },
      o.cbDiagnostic
    );
  });
  xit('spawnShellCommandAsync: yes result, no finalError, yes stdout, yes stderr, exit with code 0', (done) => {
    spawnOptions.suppressStdOut = false;
    spawnOptions.suppressStdErr = false;
    spawnOptions.suppressResult = false;
    spawn.spawnShellCommandAsync(
      argArray,
      spawnOptions,
      cbStatusMock,
      (err, result) => {
        expect(err).to.not.exist;
        const concatArgs = testArgs.join('');
        checkResult(result, 0, '', concatArgs, concatArgs);
        expect(cbStdErrSpy.called).to.be.true;
        expect(cbStdOutSpy.called).to.be.true;
        expect(cbDiagnosticSpy.called).to.be.false;
        done();
      },
      o.cbDiagnostic
    );
  });
  xit('spawnShellCommandAsync: edge: yes suppressStdErr, no cacheStdErr', (done) => {
    spawnOptions.suppressResult = false;
    spawnOptions.cacheStdOut = false;
    spawnOptions.cacheStdErr = false;
    spawn.spawnShellCommandAsync(
      argArray,
      spawnOptions,
      cbStatusMock,
      (err, result) => {
        expect(err).to.not.exist;
        checkResult(result);
        expect(cbStdErrSpy.called).to.be.false;
        expect(cbStdOutSpy.called).to.be.false;
        expect(cbDiagnosticSpy.called).to.be.false;
        done();
      },
      o.cbDiagnostic
    );
  });
  xit(`spawnShellCommandAsync:edge: fire 'error' event on child process`, (done) => {
    spawnOptions.suppressResult = false;
    spawnOptions.suppressFinalError = false;
    const cp = spawn.spawnShellCommandAsync(
      argArray,
      spawnOptions,
      o.cbStatus,
      (err, result) => {
        checkResult(result, 30, 'SIGUSR1');
        checkError(err, 30, 'SIGUSR1');
        expect(cbStdErrSpy.called).to.be.false;
        expect(cbStdOutSpy.called).to.be.false;
        expect(cbDiagnosticSpy.called).to.be.false;
        done();
      },
      o.cbDiagnostic
    );
    cp.emit('error', 30, 'SIGUSR1');
  });
  xit(`spawnShellCommandAsync:edge: EACCES on bad cmd`, (done) => {
    argArray[0] = '/';
    spawnOptions.suppressResult = false;
    spawnOptions.suppressFinalError = false;
    spawn.spawnShellCommandAsync(
      argArray,
      spawnOptions,
      o.cbStatus,
      (err, result) => {
        expect(result).to.not.exist;
        expect(err['code']).to.equal('EACCES');
        expect(err['errno']).to.equal('EACCES');
        expect(err.message).to.equal('spawn EACCES');
        expect(cbStdErrSpy.called).to.be.false;
        expect(cbStdOutSpy.called).to.be.false;
        expect(cbDiagnosticSpy.called).to.be.false;
        done();
      },
      o.cbDiagnostic
    );
  });
  xit(`sudoSpawnAsync: forceError `, (done) => {
    spawn.forceError = true;
    spawn.sudoSpawnAsync(
      argArray,
      spawnOptions,
      o.cbStatus,
      (err, result) => {
        expect(err).to.exist;
        expect(err.message).to.equal('force error: sudoSpawnAsync');
        expect(result).to.not.exist;
        expect(cbStdErrSpy.called).to.be.false;
        expect(cbStdOutSpy.called).to.be.false;
        expect(cbDiagnosticSpy.called).to.be.false;
        done();
      },
      o.cbDiagnostic
    );
  });
  xit(`sudoSpawnAsync: spawnOptions is undefined, `, (done) => {
    argArray[1] = 'exitWithErrCode';
    spawnOptions = undefined;
    spawn.sudoSpawnAsync(
      argArray,
      spawnOptions,
      o.cbStatus,
      (err, result) => {
        checkError(err, 1);
        checkResult(result, 1);
        expect(cbStdErrSpy.called).to.be.false;
        expect(cbStdOutSpy.called).to.be.false;
        expect(cbDiagnosticSpy.called).to.be.true;
        done();
      },
      o.cbDiagnostic
    );
  });
  xit(`sudoSpawnAsync: spawnOptions is null, `, (done) => {
    argArray[1] = 'exitWithErrCode';
    spawnOptions = null;
    spawn.sudoSpawnAsync(
      argArray,
      spawnOptions,
      o.cbStatus,
      (err, result) => {
        checkError(err, 1);
        checkResult(result, 1);
        expect(cbStdErrSpy.called).to.be.false;
        expect(cbStdOutSpy.called).to.be.false;
        expect(cbDiagnosticSpy.called).to.be.true;
        done();
      },
      o.cbDiagnostic
    );
  });
  it(`sudoSpawnAsync: invalid username/password in options `, (done) => {
    argArray[1] = 'exitWithErrCode';
    spawnOptions.sudoUser = 'vagrant';
    spawnOptions.sudoPassword = 'poopword';
    spawnOptions.cacheStdErr = true;
    spawnOptions.cacheStdOut = true;
    spawnOptions.suppressStdErr = false;
    spawnOptions.suppressStdOut = false;
    spawnOptions.suppressResult = false;
    spawnOptions.suppressFinalError = false;
    //spawnOptions.shell = true;

    spawn.sudoSpawnAsync(
      argArray,
      spawnOptions,
      o.cbStatus,
      (err, result) => {
        checkError(err, 1);
        checkResult(result, 1);
        expect(cbStdErrSpy.called).to.be.false;
        expect(cbStdOutSpy.called).to.be.false;
        expect(cbDiagnosticSpy.called).to.be.true;
        done();
      },
      o.cbDiagnostic
    );
  });
});
