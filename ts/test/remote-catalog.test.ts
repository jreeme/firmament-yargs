import 'reflect-metadata';
import kernel from '../inversify.config';
import {expect} from 'chai';
import {} from 'mocha';
import {RemoteCatalogGetter} from "../interfaces/remote-catalog/remote-catalog-getter";
import path = require('path');

const Url = require('url');

describe('Testing RemoteCatalogGetter Creation/Force Error', () => {
  let remoteCatalogGetter: RemoteCatalogGetter;
  beforeEach(() => {
    remoteCatalogGetter = kernel.get<RemoteCatalogGetter>('RemoteCatalogGetter');
  });
  afterEach(() => {
    remoteCatalogGetter.forceError = false;
  });
  it('should be created by kernel', (done) => {
    expect(remoteCatalogGetter).to.exist;
    done();
  });
});

describe('Testing RemoteCatalogGetter.parsedUrl', () => {
  let remoteCatalogGetter: RemoteCatalogGetter;
  beforeEach(() => {
    remoteCatalogGetter = kernel.get<RemoteCatalogGetter>('RemoteCatalogGetter');
  });
  afterEach(() => {
    remoteCatalogGetter.forceError = false;
  });
  it('should have callback with error', (done) => {
    remoteCatalogGetter.forceError = true;
    remoteCatalogGetter.getParsedUrl(null, (err, parsedUrl) => {
      expect(err).to.exist;
      expect(err.message).to.equal('force error: RemoteCatalogGetterImpl.getParsedUrl');
      expect(parsedUrl).to.not.exist;
      done();
    });
  });
  it('should have callback with error when url is undefined', (done) => {
    let url;
    // noinspection JSUnusedAssignment
    remoteCatalogGetter.getParsedUrl(url, (err, parsedUrl) => {
      expect(err).to.exist;
      expect(err.message).to.equal(`Cannot read property 'constructor' of undefined`);
      expect(parsedUrl).to.not.exist;
      done();
    });
  });
  it('should have callback with error when url is null', (done) => {
    let url = null;
    remoteCatalogGetter.getParsedUrl(url, (err, parsedUrl) => {
      expect(err).to.exist;
      expect(err.message).to.equal(`Cannot read property 'constructor' of null`);
      expect(parsedUrl).to.not.exist;
      done();
    });
  });
  it('should have callback with error when url is and empty string', (done) => {
    let url = '';
    remoteCatalogGetter.getParsedUrl(url, (err, parsedUrl) => {
      expect(err).to.exist;
      expect(err.message).to.equal('Empty string is not a url');
      expect(parsedUrl).to.not.exist;
      done();
    });
  });
  it('should return parsed web url', (done) => {
    let url = 'http://www.yahoo.com/grindel.jpg';
    remoteCatalogGetter.getParsedUrl(url, (err, parsedUrl) => {
      expect(err).to.not.exist;
      expect(parsedUrl).to.be.an.instanceof(Url.constructor);
      expect(parsedUrl.protocol).to.equal('http:');
      done();
    });
  });
  it('should return parsed file url', (done) => {
    let url = '/tmp/grindel.jpg';
    remoteCatalogGetter.getParsedUrl(url, (err, parsedUrl) => {
      expect(err).to.not.exist;
      expect(parsedUrl).to.be.an.instanceof(Url.constructor);
      expect(parsedUrl.protocol).to.not.exist;
      done();
    });
  });
});

describe('Testing RemoteCatalogGetter.resolveTextResourceFromUrl', () => {
  let remoteCatalogGetter: RemoteCatalogGetter;
  beforeEach(() => {
    remoteCatalogGetter = kernel.get<RemoteCatalogGetter>('RemoteCatalogGetter');
  });
  afterEach(() => {
    remoteCatalogGetter.forceError = false;
  });
  it('should have callback with error', (done) => {
    remoteCatalogGetter.forceError = true;
    remoteCatalogGetter.resolveTextResourceFromUrl(null, (err, text, absoluteUrl) => {
      expect(err).to.exist;
      expect(err.message).to.equal('force error: RemoteCatalogGetterImpl.resolveTextResourceFromUrl');
      expect(absoluteUrl).to.not.exist;
      done();
    });
  });
  it('should have callback with error when url is undefined', (done) => {
    let url;
    // noinspection JSUnusedAssignment
    remoteCatalogGetter.resolveTextResourceFromUrl(url, (err, text, absoluteUrl) => {
      expect(err).to.exist;
      expect(err.message).to.equal(`Cannot read property 'constructor' of undefined`);
      expect(absoluteUrl).to.not.exist;
      done();
    });
  });
  it('should have callback with error when url is null', (done) => {
    const url = null;
    remoteCatalogGetter.resolveTextResourceFromUrl(url, (err, text, absoluteUrl) => {
      expect(err).to.exist;
      expect(err.message).to.equal(`Cannot read property 'constructor' of null`);
      expect(absoluteUrl).to.not.exist;
      done();
    });
  });
  it('should have callback with error when url is and empty string', (done) => {
    const url = '';
    remoteCatalogGetter.resolveTextResourceFromUrl(url, (err, text, absoluteUrl) => {
      expect(err).to.exist;
      expect(err.message).to.equal('Empty string is not a url');
      expect(absoluteUrl).to.not.exist;
      done();
    });
  });
  it(`should return non-null error if file doesn't exist`, (done) => {
    const cwd = process.cwd();
    const url = path.resolve(cwd, 'ts/test/json/valid__.json');
    remoteCatalogGetter.resolveTextResourceFromUrl(url, (err, text, absoluteUrl) => {
      expect(err).to.exist;
      expect(err.message).to.equal(`Url: '/home/jreeme/src/firmament-yargs/ts/test/json/valid__.json' does not exist`);
      expect(absoluteUrl).to.equal(url);
      expect(text).to.be.empty;
      done();
    });
  });
  it(`should return null error if file exists and text should be '12345'`, (done) => {
    const cwd = process.cwd();
    const url = path.resolve(cwd, 'ts/test/json/exists.json');
    remoteCatalogGetter.resolveTextResourceFromUrl(url, (err, text, absoluteUrl) => {
      expect(err).to.not.exist;
      expect(absoluteUrl).to.equal(url);
      expect(text).to.equal('12345\n');
      done();
    });
  });
  it(`should return non-null error if web resource doesn't exist`, (done) => {
    const url = 'http://www.nositeatall.com/gumdrop.jpg';
    remoteCatalogGetter.resolveTextResourceFromUrl(url, (err, text, absoluteUrl) => {
      expect(err).to.exist;
      expect(absoluteUrl).to.equal(url);
      expect(text).to.be.empty;
      done();
    });
  });
  it(`should return null error if web resource exists`, (done) => {
    const url = 'http://www.yahoo.com/';
    remoteCatalogGetter.resolveTextResourceFromUrl(url, (err, text, absoluteUrl) => {
      expect(err).to.not.exist;
      expect(absoluteUrl).to.equal(url);
      expect(text).to.be.not.empty;
      done();
    });
  });
});

describe('Testing RemoteCatalogGetter.resolveJsonObjectFromUrl', () => {
  let remoteCatalogGetter: RemoteCatalogGetter;
  beforeEach(() => {
    remoteCatalogGetter = kernel.get<RemoteCatalogGetter>('RemoteCatalogGetter');
  });
  afterEach(() => {
    remoteCatalogGetter.forceError = false;
  });
  it('should have callback with error', (done) => {
    remoteCatalogGetter.forceError = true;
    remoteCatalogGetter.resolveJsonObjectFromUrl(null, (err, jsonObject, absoluteUrl) => {
      expect(err).to.exist;
      expect(err.message).to.equal('force error: RemoteCatalogGetterImpl.resolveJsonObjectFromUrl');
      expect(absoluteUrl).to.not.exist;
      done();
    });
  });
  it('should have callback with error when url is undefined', (done) => {
    let url;
    // noinspection JSUnusedAssignment
    remoteCatalogGetter.resolveJsonObjectFromUrl(url, (err, jsonObject, absoluteUrl) => {
      expect(err).to.exist;
      expect(err.message).to.equal(`Cannot read property 'constructor' of undefined`);
      expect(absoluteUrl).to.not.exist;
      done();
    });
  });
  it('should have callback with error when url is null', (done) => {
    const url = null;
    remoteCatalogGetter.resolveJsonObjectFromUrl(url, (err, jsonObject, absoluteUrl) => {
      expect(err).to.exist;
      expect(err.message).to.equal(`Cannot read property 'constructor' of null`);
      expect(absoluteUrl).to.not.exist;
      done();
    });
  });
  it('should return error on bad JSON', (done) => {
    const cwd = process.cwd();
    const url = path.resolve(cwd, 'ts/test/json/bad-json.json');
    remoteCatalogGetter.resolveJsonObjectFromUrl(url, (err, jsonObject, absoluteUrl) => {
      expect(err).to.exist;
      expect(err.message).to.equal('Unexpected token : in JSON at position 1');
      expect(absoluteUrl).to.equal(url);
      done();
    });
  });
  it('should return ', (done) => {
    const cwd = process.cwd();
    const url = path.resolve(cwd, 'ts/test/json/valid.json');
    remoteCatalogGetter.resolveJsonObjectFromUrl(url, (err, jsonObject, absoluteUrl) => {
      expect(err).to.not.exist;
      expect(jsonObject).to.include({description:'Command Group 0'});
      expect(absoluteUrl).to.equal(url);
      done();
    });
  });
});
