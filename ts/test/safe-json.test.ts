import 'reflect-metadata';
import kernel from '../inversify.config';
import {expect} from 'chai';
import * as mocha from 'mocha';
import {SafeJson} from '..';

const testJsonObject = {how: 'now', brown: 'cow', dog: {bark: 'loud', weight: 50}};

describe('Testing SafeJson Creation/Force Error', () => {
  let safeJson: SafeJson;
  beforeEach(() => {
    safeJson = kernel.get<SafeJson>('SafeJson');
    safeJson.forceError = false;
    safeJson.forceException = false;
    safeJson.forceExceptionWaitCount = 0;
  });
  afterEach(() => {
  });
  mocha.it('use mocha instance to avoid linter warning', (done) => {
    done();
  });
  /*it('should be created by kernel', (done) => {
    expect(safeJson).to.exist;
    done();
  });*/
});
describe('Testing SafeJsonImpl.safeParse', () => {
  let safeJson: SafeJson;
  beforeEach(() => {
    safeJson = kernel.get<SafeJson>('SafeJson');
    safeJson.forceError = false;
    safeJson.forceException = false;
    safeJson.forceExceptionWaitCount = 0;
  });
  it('should have callback with error', (done) => {
    safeJson.forceError = true;
    safeJson.safeParse(undefined, (err: Error, obj: any) => {
      expect(err).to.exist;
      expect(err.message).to.equal('force error: SafeJsonImpl.safeParse');
      expect(obj).to.not.exist;
      done();
    });
  });
  it('should catch forcedException', (done) => {
    safeJson.forceException = true;
    safeJson.safeParse(undefined, (err: Error, obj: any) => {
      expect(err).to.exist;
      expect(err.message).to.equal('forceException');
      expect(obj).to.not.exist;
      done();
    });
  });
  it('should have callback with error when jsonString is undefined', (done) => {
    safeJson.safeParse(undefined, (err: Error, obj: any) => {
      expect(err).to.exist;
      expect(err.message).to.equal('Unexpected token u in JSON at position 0');
      expect(obj).to.not.exist;
      done();
    });
  });
  it('should have callback with error when jsonString is null', (done) => {
    safeJson.safeParse(null, (err: Error, obj: any) => {
      expect(err).to.exist;
      expect(err.message).to.equal('expected null to exist');
      expect(obj).to.not.exist;
      done();
    });
  });
  it('should have callback with error when jsonString is not valid JSON', (done) => {
    const json = 'how now brown cow';
    safeJson.safeParse(json, (err: Error, obj: any) => {
      expect(err).to.exist;
      expect(err.message).to.equal('Unexpected token h in JSON at position 0');
      expect(obj).to.not.exist;
      done();
    });
  });
  it('should have callback with null error and correct object when jsonString is valid', (done) => {
    const json = JSON.stringify(testJsonObject);
    safeJson.safeParse(json, (err: Error, obj: any) => {
      expect(err).to.not.exist;
      expect(obj).to.eql(testJsonObject);
      done();
    });
  });
});
describe('Testing SafeJsonImpl.writeFile + SafeJsonImpl.readFile (no options)', () => {
  let safeJson: SafeJson;
  beforeEach(() => {
    safeJson = kernel.get<SafeJson>('SafeJson');
    safeJson.forceError = false;
    safeJson.forceException = false;
    safeJson.forceExceptionWaitCount = 0;
  });
  it('should writeTest object to tmp file, read it back (no options)', (done) => {
    safeJson.writeFile('/tmp/testJson.json', testJsonObject, (err: Error) => {
      expect(err).to.not.exist;
      safeJson.readFile('/tmp/testJson.json', (err: Error, obj: any) => {
        expect(err).to.not.exist;
        expect(obj).to.eql(testJsonObject);
        done();
      });
    });
  });
});
describe('Testing SafeJsonImpl.writeFile + SafeJsonImpl.readFile (with options)', () => {
  let safeJson: SafeJson;
  beforeEach(() => {
    safeJson = kernel.get<SafeJson>('SafeJson');
    safeJson.forceError = false;
    safeJson.forceException = false;
    safeJson.forceExceptionWaitCount = 0;
  });
  it('should writeTest object to tmp file, read it back (no options)', (done) => {
    safeJson.writeFile('/tmp/testJson.json', testJsonObject, {spaces: 2}, (err: Error) => {
      expect(err).to.not.exist;
      safeJson.readFile('/tmp/testJson.json', {}, (err: Error, obj: any) => {
        expect(err).to.not.exist;
        expect(obj).to.eql(testJsonObject);
        done();
      });
    });
  });
});
