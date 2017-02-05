import {RemoteCatalog, RemoteCatalogGetter, RemoteCatalogResource} from '../interfaces/remote-catalog';
import request = require('request');
import {inject} from 'inversify';
import {Url} from 'url';
import path = require('path');
import fs = require('fs');
import nodeUrl = require('url');
import * as _ from 'lodash';
import {CommandUtil} from "../interfaces/command-util";
import {ForceErrorImpl} from "./force-error-impl";
const fileExists = require('file-exists');
const safeJsonParse = require('safe-json-parse/callback');
const async = require('async');
export class RemoteCatalogGetterImpl extends ForceErrorImpl implements RemoteCatalogGetter {
  private baseUrl: string;

  constructor(@inject('CommandUtil') private commandUtil: CommandUtil) {
    super();
  }

  getCatalogFromUrl(url: Url|string, cb: (err, remoteCatalog) => void) {
    let me = this;
    let parsedUrl = RemoteCatalogGetterImpl.getParsedUrl(url);
    if (parsedUrl.protocol) {
      me.baseUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}${path.dirname(parsedUrl.path)}`;
    } else {
      me.baseUrl = path.dirname(parsedUrl.path);
    }
    me.getRemoteResource(parsedUrl, 'root', (err, remoteCatalogResource) => {
      if (me.commandUtil.callbackIfError(cb, err)) {
        return;
      }
      try {
        let remoteCatalog: RemoteCatalog = remoteCatalogResource.parsedObject;
        let fnArray: any[] = [];
        remoteCatalog.entries.forEach(entry => {
          entry.urls.forEach(url => {
            let parsedUrl = RemoteCatalogGetterImpl.getParsedUrl(url);
            if (!parsedUrl.protocol) {
              url = path.isAbsolute(parsedUrl.path) ? parsedUrl.path : `${me.baseUrl}/${parsedUrl.path}`;
            }
            fnArray.push(async.apply(me.getRemoteResource.bind(me), url, entry.name));
          });
        });
        async.parallel(fnArray, (err, results: RemoteCatalogResource[]) => {
          //Now collate results into catalog and send it back
          remoteCatalog.entries.forEach(entry => {
            entry.resources =
              <RemoteCatalogResource[]>_.filter(results, ['parentCatalogEntryName', entry.name]);
          });
          cb(null, remoteCatalog);
        });
      } catch (err) {
        me.commandUtil.callbackIfError(cb, err);
      }
    });
  }

  //Right now uri can be a web address (http(s)://somewhere.com/some.json) or an absolute path (/tmp/some.json)
  //or a path relative to cwd (subdir/some.json)
  private getRemoteResource(url: Url | string,
                            parentCatalogEntryName: string,
                            cb: (err: Error, remoteCatalogResource?: RemoteCatalogResource) => void) {
    let me = this;
    cb = me.checkCallback(cb);
    me.resolveTextResourceFromUrl(url, (err, text, absoluteUrl) => {
      if (me.commandUtil.callbackIfError(cb, err)) {
        return;
      }
      safeJsonParse(text, (err, parsedObject) => {
        let name = path.basename(absoluteUrl);
        cb(null, {
          absoluteUrl, name, text, parsedObject, parentCatalogEntryName
        });
      });
    });
  }

  resolveJsonObjectFromUrl(url: Url|string, cb: (err: Error, jsonObject: any, absoluteUrl: string) => void) {
    let me = this;
    cb = cb || (() => {
      });
    me.resolveTextResourceFromUrl(url, (err, text, absoluteUrl) => {
      safeJsonParse(text, (err, jsonObject) => {
        cb(err, jsonObject, absoluteUrl);
      });
    });
  }

  resolveTextResourceFromUrl(url: Url|string, cb: (err: Error, text?: string, absoluteUrl?: string) => void) {
    let me = this;
    cb = me.checkCallback(cb);
    try {
      let parsedUrl = RemoteCatalogGetterImpl.getParsedUrl(url);
      if (!parsedUrl) {
        //Now this is a problem. Don't know what to do with random objects
        cb(new Error(`Url: '${url}' is unusable`));
        return;
      }
      if (!parsedUrl.protocol) {
        let urlString = parsedUrl.path;
        if (!fileExists(urlString)) {
          cb(new Error(`${urlString} doesn't exist`), null);
          return;
        }
        cb(null, fs.readFileSync(urlString, 'utf8'), urlString);
        return;
      }
      //Let's look on the web
      request(parsedUrl.href, (err, res, text) => {
        if (res.statusCode !== 200) {
          cb(new Error(`Error retrieving '${parsedUrl.href}'`), null);
          return;
        }
        cb(null, text, parsedUrl.href);
      });
    }
    catch (err) {
      cb(err, null);
    }
  }

  private static getParsedUrl(url: Url | string) {
    try {
      if (url.constructor.name === 'Url') {
        return <Url>url;
      }
      else if (url.constructor.name === 'String') {
        return nodeUrl.parse(<string>url);
      }
    } catch (err) {
      return null;
    }
  }
}

