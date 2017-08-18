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
function getNewSpawnOptions(): SpawnOptions2 {
  return _.clone({
    preSpawnMessage: 'PreSpawn Message',
    postSpawnMessage: 'PostSpawn Message',
    showDiagnostics: false,
    suppressStdErr: true,
    suppressStdOut: true,
    cacheStdErr: true,
    cacheStdOut: true,
    suppressFinalStats: true,
    suppressFinalError: false
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
  it('should be created by kernel', (done) => {
    const spawn = kernel.get<Spawn>('Spawn');
    expect(spawn).to.exist;
    done();
  });
  it('should have final callback with error', (done) => {
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
  let cbStatusSpy;
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
    cbStatusSpy = sinonSandbox.spy(o, 'cbStatus');
    cbDiagnosticSpy = sinonSandbox.spy(o, 'cbDiagnostic');
    cbStdOutSpy = sinonSandbox.spy(o, 'cbStdOutCall');
    cbStdErrSpy = sinonSandbox.spy(o, 'cbStdErrCall');
  });
  afterEach(() => {
    sinonSandbox.restore();
  });
  it('no diagnostics, no output to stderr or stdout, suppress final stats, final err === null', (done) => {
    argArray[1] = 'exitWithErrCode';
    spawn.spawnShellCommandAsync(
      argArray,
      spawnOptions,
      o.cbStatus,
      (err, result) => {
        expect(result).to.be.a('string');
        expect(result.length).to.be.equal(0);
        expect(err).to.not.exist;
        expect(cbStatusSpy.called).to.be.false;
        expect(cbDiagnosticSpy.called).to.be.false;
        done();
      },
      o.cbDiagnostic
    );
  });
  it('no diagnostics, no output to stderr or stdout, suppress final stats, final err !== null', (done) => {
    argArray[1] = 'exitWithErrCode';
    argArray[2] = '3';
    spawn.spawnShellCommandAsync(
      argArray,
      spawnOptions,
      o.cbStatus,
      (err, result) => {
        expect(result).to.be.a('string');
        expect(result.length).to.be.equal(0);
        expect(err).to.exist;
        expect(cbStatusSpy.called).to.be.false;
        expect(JSON.parse(err.message)).to.include({code: 3});
        expect(cbDiagnosticSpy.called).to.be.false;
        done();
      },
      o.cbDiagnostic
    );
  });
  it('yes diagnostics, no output to stderr or stdout, suppress final stats, final err !== null', (done) => {
    argArray[1] = 'exitWithErrCode';
    argArray[2] = '3';
    spawnOptions.showDiagnostics = true;
    spawn.spawnShellCommandAsync(
      argArray,
      spawnOptions,
      o.cbStatus,
      (err, result) => {
        expect(result).to.be.a('string');
        expect(result.length).to.be.equal(0);
        expect(err).to.exist;
        expect(cbStatusSpy.called).to.be.false;
        expect(cbDiagnosticSpy.called).to.be.true;
        expect(JSON.parse(err.message)).to.include({code: 3});
        done();
      },
      o.cbDiagnostic
    );
  });
  it('no diagnostics, no output to stderr or stdout, send final stats, final err !== null', (done) => {
    argArray[1] = 'exitWithErrCode';
    argArray[2] = '3';
    spawnOptions.suppressFinalStats = false;
    spawn.spawnShellCommandAsync(
      argArray,
      spawnOptions,
      o.cbStatus,
      (err, result) => {
        expect(result).to.be.a('string');
        expect(JSON.parse(result)).to.include({code: 3});
        expect(err).to.exist;
        expect(cbStatusSpy.called).to.be.false;
        expect(cbDiagnosticSpy.called).to.be.false;
        expect(JSON.parse(err.message)).to.include({code: 3});
        done();
      },
      o.cbDiagnostic
    );
  });
  it('yes diagnostics, output to stdout no output to stderr, send final stats, final err !== null', (done) => {
    argArray[2] = '3';
    spawnOptions.showDiagnostics = true;
    spawnOptions.suppressFinalStats = false;
    spawnOptions.suppressStdOut = false;
    spawn.spawnShellCommandAsync(
      argArray,
      spawnOptions,
      cbStatusMock,
      (err, result) => {
        expect(result).to.be.a('string');
        expect(JSON.parse(result)).to.include({code: 3});
        expect(err).to.exist;
        expect(cbStdOutSpy.called).to.be.true;
        expect(cbStdErrSpy.called).to.be.false;
        expect(cbDiagnosticSpy.called).to.be.true;
        expect(JSON.parse(err.message)).to.include({code: 3});
        done();
      },
      o.cbDiagnostic
    );
  });
  it('no diagnostics, output to stdout && output to stderr, send final stats, final err === null', (done) => {
    spawnOptions.suppressFinalStats = false;
    spawnOptions.suppressStdOut = false;
    spawnOptions.suppressStdErr = false;
    spawn.spawnShellCommandAsync(
      argArray,
      spawnOptions,
      cbStatusMock,
      (err, result) => {
        expect(result).to.be.a('string');
        expect(JSON.parse(result)).to.include({code: 0});
        expect(err).to.not.exist;
        expect(cbStdOutSpy.called).to.be.true;
        expect(cbStdErrSpy.called).to.be.true;
        expect(cbDiagnosticSpy.called).to.be.false;
        done();
      },
      o.cbDiagnostic
    );
  });
  it('no diagnostics, output to stdout but suppress && output to stderr but suppress, send final stats, final err === null', (done) => {
    spawnOptions.suppressFinalStats = false;
    spawnOptions.suppressStdOut = true;
    spawnOptions.suppressStdErr = true;
    spawn.spawnShellCommandAsync(
      argArray,
      spawnOptions,
      cbStatusMock,
      (err, result) => {
        expect(result).to.be.a('string');
        const resultObj = JSON.parse(result);
        expect(resultObj).to.include({code: 0, stdoutText: 'arg1arg2', stderrText: 'arg1arg2'});
        expect(err).to.not.exist;
        expect(cbStdOutSpy.called).to.be.false;
        expect(cbStdErrSpy.called).to.be.false;
        expect(cbDiagnosticSpy.called).to.be.false;
        done();
      },
      o.cbDiagnostic
    );
  });
  it('do not suppress final error', (done) => {
    spawnOptions.suppressFinalStats = false;
    argArray[1] = 'exitWithErrCode';
    argArray[2] = '3';
    spawnOptions.suppressFinalError = false;
    spawn.spawnShellCommandAsync(
      argArray,
      spawnOptions,
      cbStatusMock,
      (err,result) => {
        expect(JSON.parse(result)).to.include({code: 3});
        expect(err).to.exist;
        done();
      },
      o.cbDiagnostic
    );
  });
  it('suppress final error', (done) => {
    spawnOptions.suppressFinalStats = false;
    argArray[1] = 'exitWithErrCode';
    argArray[2] = '3';
    spawnOptions.suppressFinalError = true;
    spawn.spawnShellCommandAsync(
      argArray,
      spawnOptions,
      cbStatusMock,
      (err,result) => {
        expect(JSON.parse(result)).to.include({code: 3});
        expect(err).to.not.exist;
        done();
      },
      o.cbDiagnostic
    );
  });
});
