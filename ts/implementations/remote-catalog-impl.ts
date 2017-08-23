import request = require('request');
import {inject} from 'inversify';
import {Url} from 'url';
import path = require('path');
import fs = require('fs');
import nodeUrl = require('url');
import * as _ from 'lodash';
import {CommandUtil} from "../interfaces/command-util";
import {ForceErrorImpl} from "./force-error-impl";
import {SafeJson} from "../interfaces/safe-json";
import {RemoteCatalogGetter} from "../interfaces/remote-catalog/remote-catalog-getter";
import {RemoteCatalog} from "../interfaces/remote-catalog/remote-catalog";
import {RemoteCatalogResource} from "../interfaces/remote-catalog/remote-catalog-resource";

const fileExists = require('file-exists');
const async = require('async');

export class RemoteCatalogGetterImpl extends ForceErrorImpl implements RemoteCatalogGetter {
  constructor(@inject('CommandUtil') private commandUtil: CommandUtil,
              @inject('SafeJson') private safeJson: SafeJson) {
    super();
  }

  getCatalogFromUrl(url: Url | string, cb: (err, remoteCatalog) => void) {
    const me = this;
    cb = me.checkCallback(cb);
    if (me.checkForceError('RemoteCatalogGetterImpl.getCatalogFromUrl', cb)) {
      return;
    }
    me.getParsedUrl(url, (err, parsedUrl) => {
      if (me.commandUtil.callbackIfError(cb, err)) {
        return;
      }
      const baseUrl = (parsedUrl.protocol)
        ? `${parsedUrl.protocol}//${parsedUrl.hostname}${path.dirname(parsedUrl.path)}`
        : path.dirname(parsedUrl.path);
      me.getRemoteResource(parsedUrl, 'root', (err, remoteCatalogResource) => {
        if (me.commandUtil.callbackIfError(cb, err)) {
          return;
        }
        try {
          const remoteCatalog: RemoteCatalog = remoteCatalogResource.parsedObject;
          const fnArray: any[] = [];
          //-->
          async.each(remoteCatalog.entries,
            (entry, cb) => {
              async.each(entry.urls,
                (url, cb) => {
                  me.getParsedUrl(url, (err, parsedUrl) => {
                    if (me.commandUtil.callbackIfError(cb, err)) {
                      return;
                    }
                    if (!parsedUrl.protocol) {
                      url = path.isAbsolute(parsedUrl.path) ? parsedUrl.path : `${baseUrl}/${parsedUrl.path}`;
                    }
                    fnArray.push(async.apply(me.getRemoteResource.bind(me), url, entry.name));
                  });
                  cb();
                },
                (err) => {
                  me.commandUtil.logError(err);
                  cb();
                });
            },
            (err) => {
              if (me.commandUtil.callbackIfError(cb, err)) {
                return;
              }
              async.parallel(fnArray, (err, results: RemoteCatalogResource[]) => {
                if (me.commandUtil.callbackIfError(cb, err)) {
                  return;
                }
                //Now collate results into catalog and send it back
                remoteCatalog.entries.forEach(entry => {
                  entry.resources =
                    <RemoteCatalogResource[]>_.filter(results, {parentCatalogEntryName: entry.name});
                });
                cb(null, remoteCatalog);
              });
            });
          //-->
          /*          remoteCatalog.entries.forEach(entry => {
                      entry.urls.forEach(url => {
                        me.getParsedUrl(url, (err, parsedUrl) => {
                          if (me.commandUtil.callbackIfError(cb, err)) {
                            return;
                          }
                          if (!parsedUrl.protocol) {
                            url = path.isAbsolute(parsedUrl.path) ? parsedUrl.path : `${baseUrl}/${parsedUrl.path}`;
                          }
                          fnArray.push(async.apply(me.getRemoteResource.bind(me), url, entry.name));
                        });
                      });
                    });
                    async.parallel(fnArray, (err, results: RemoteCatalogResource[]) => {
                      //Now collate results into catalog and send it back
                      remoteCatalog.entries.forEach(entry => {
                        entry.resources =
                          <RemoteCatalogResource[]>_.filter(results, {parentCatalogEntryName: entry.name});
                      });
                      cb(null, remoteCatalog);
                    });*/
        } catch (err) {
          me.commandUtil.callbackIfError(cb, err);
        }
      });
    });
  }

  //Right now uri can be a web address (http(s)://somewhere.com/some.json) or an absolute path (/tmp/some.json)
  //or a path relative to cwd (subdir/some.json)
  getRemoteResource(url: Url | string,
                    parentCatalogEntryName: string,
                    cb: (err: Error, remoteCatalogResource?: RemoteCatalogResource) => void) {
    const me = this;
    cb = me.checkCallback(cb);
    if (me.checkForceError('RemoteCatalogGetterImpl.getRemoteResource', cb)) {
      return;
    }
    me.resolveTextResourceFromUrl(url, (err, text, absoluteUrl) => {
      if (me.commandUtil.callbackIfError(cb, err)) {
        return;
      }
      me.safeJson.safeParse(text, (err, parsedObject) => {
        const name = path.basename(absoluteUrl);
        cb(err, {
          absoluteUrl, name, text, parsedObject, parentCatalogEntryName
        });
      });
    });
  }

  resolveJsonObjectFromUrl(url: Url | string, cb: (err: Error, jsonObject: any, absoluteUrl: string) => void) {
    const me = this;
    cb = me.checkCallback(cb);
    if (me.checkForceError('RemoteCatalogGetterImpl.resolveJsonObjectFromUrl', cb)) {
      return;
    }
    me.resolveTextResourceFromUrl(url, (err, text, absoluteUrl) => {
      if (me.commandUtil.callbackIfError(cb, err, false)) {
        return;
      }
      me.safeJson.safeParse(text, (err, jsonObject) => {
        cb(err, jsonObject, absoluteUrl);
      });
    });
  }

  resolveTextResourceFromUrl(url: Url | string, cb: (err: Error, text?: string, absoluteUrl?: string) => void) {
    const me = this;
    cb = me.checkCallback(cb);
    if (me.checkForceError('RemoteCatalogGetterImpl.resolveTextResourceFromUrl', cb)) {
      return;
    }
    me.getParsedUrl(url, (err, parsedUrl) => {
      if (err) {
        return cb(err, '', null);
      }
      try {
        if (!parsedUrl.protocol) {
          const urlString = parsedUrl.path;
          fileExists(urlString, (err, exists) => {
            if (me.commandUtil.callbackIfError(cb, err, false)) {
              return;
            }
            if (exists) {
              fs.readFile(urlString, 'utf8', (err, data) => {
                if (me.commandUtil.callbackIfError(cb, err)) {
                  return;
                }
                cb(null, data.toString(), urlString);
              });
              return;
            }
            cb(new Error(`Url: '${url}' does not exist`), '', urlString);
          });
          return;
        }
        //Let's look on the web
        request(parsedUrl.href, (err, res, text) => {
          if (err) {
            return cb(err, '', parsedUrl.href);
          }
          if (res.statusCode !== 200) {
            return cb(new Error(`Error retrieving '${parsedUrl.href}'`), '', parsedUrl.href);
          }
          return cb(null, text.toString(), parsedUrl.href);
        });
      }
      catch (err) {
        return cb(err, null);
      }
    });
  }

  getParsedUrl(url: Url | string, cb: (err: Error, parsedUrl?: Url) => void) {
    const me = this;
    cb = me.checkCallback(cb);
    if (me.checkForceError('RemoteCatalogGetterImpl.getParsedUrl', cb)) {
      return;
    }
    try {
      if (url.constructor.name === 'Url') {
        return cb(null, <Url>url);
      }
      if (url.constructor.name === 'String') {
        if (!url) {
          return cb(new Error('Empty string is not a url'));
        }
        const parsedUrl = nodeUrl.parse(<string>url);
        return cb(null, parsedUrl);
      }
    } catch (err) {
      cb(err);
    }
  }
}

