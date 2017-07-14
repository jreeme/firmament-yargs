import 'reflect-metadata';
import kernel from '../inversify.config';
import {expect} from 'chai';
import nodeUrl = require('url');
import {RemoteCatalogGetter} from "../interfaces/remote-catalog/remote-catalog-getter";
describe('RemoteCatalog', function () {
  describe('create using kernel', () => {
    it('should be created by kernel (as singleton)', function (done) {
      const remoteCatalogGetter0 = kernel.get<RemoteCatalogGetter>('RemoteCatalogGetter');
      const remoteCatalogGetter1 = kernel.get<RemoteCatalogGetter>('RemoteCatalogGetter');
      expect(remoteCatalogGetter0).to.equal(remoteCatalogGetter1);
      done();
    });
  });
  describe('getParsedUrl', () => {
    const remoteCatalogGetter = kernel.get<RemoteCatalogGetter>('RemoteCatalogGetter');
    it('should return null Url when given null', function (done) {
      expect(remoteCatalogGetter.getParsedUrl(null)).to.equal(null);
      done();
    });
    it('should return Url when given string', function (done) {
      const path = 'misty/morning';
      const parsedUrl = remoteCatalogGetter.getParsedUrl(path);
      expect(parsedUrl.constructor.name).to.be.equal('Url');
      expect(parsedUrl.path).to.equal(path);
      done();
    });
    it('should return input parameter when called with Url', function (done) {
      const url = nodeUrl.parse('http://www.global.net');
      const parsedUrl = remoteCatalogGetter.getParsedUrl(url);
      expect(parsedUrl).to.be.equal(url);
      done();
    });
  });
});

